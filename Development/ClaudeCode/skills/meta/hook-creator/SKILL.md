---
name: hook-creator
description: Create, configure, and manage Claude Code hooks — automated shell commands, HTTP endpoints, MCP tools, or LLM prompts that fire at specific lifecycle events (SessionStart, PreToolUse, PostToolUse, Stop, etc.). Use this skill whenever the user wants to automate something in Claude Code: block a dangerous command, run a linter after file edits, inject context at session start, send notifications, enforce rules, log tool calls, or wire up any behavior that should "always happen" without relying on Claude following instructions. Trigger on phrases like "create a hook", "add a hook", "hook that runs", "automatically run", "enforce that", "block Claude from", "after every edit", "before every bash", "when Claude stops", or any request to make something happen automatically in Claude Code.
---

# Claude Code Hooks

Hooks are deterministic automation — unlike CLAUDE.md instructions, hooks **always run**. Use them for hard rules that must be enforced, not for preferences or guidance.

## Workflow

### Step 1: Clarify intent (if not already clear)

Ask: **"What do you want to automate, block, or enforce?"**

If the user is vague, ask one follow-up to narrow down:
- Is this something that should block Claude, run silently in the background, or provide feedback?
- Should it apply globally (all projects) or only in this project?

### Step 2: Pick the right event and handler

Use this decision table:

| Goal | Event | Matcher |
|------|-------|---------|
| Block a dangerous command | `PreToolUse` | `Bash` |
| Run linter/formatter after edit | `PostToolUse` + `async: true` | `Edit\|Write` |
| Auto-stage files after Claude edits them | `PostToolUse` + `async: true` | `Edit\|Write` |
| React to a failed tool call | `PostToolUseFailure` | tool name |
| Inject context at start of session | `SessionStart` | — |
| Cleanup / save state at end of session | `SessionEnd` | — |
| One-time project initialization | `Setup` | — |
| Validate before Claude stops | `Stop` | — |
| React to a permission prompt | `PermissionRequest` | — |
| Preserve critical info before context compression | `PreCompact` | — |
| Monitor or limit subagent spawning | `SubagentStart` / `SubagentStop` | — |
| Redirect or filter Claude's notifications | `Notification` | — |
| Watch a file for changes | `FileChanged` | filename pattern |
| Log every MCP tool call | `PostToolUse` | `mcp__<server>__.*` |
| Run something after user types | `UserPromptSubmit` | — |

**Handler type to use:**
- Shell logic → `command`
- External service → `http`
- MCP tool → `mcp_tool`
- Yes/no LLM check → `prompt`
- Multi-step verification → `agent`

For most use cases, `command` (a bash script) is the right choice.

**Script language startup times** (keep hooks under 100ms to avoid noticeable latency):

| Language | Startup | When to use |
|----------|---------|-------------|
| Bash | ~10–20ms | Simple checks, string matching, file ops |
| Node.js | ~50–100ms | JSON manipulation, async HTTP calls |
| Python | ~200–400ms | Complex logic — use only for rare events |

### Step 3: Write the script

If the handler is `command`, create the script. Scripts receive hook data via stdin as JSON — use `jq` to parse it.

**Template for a blocking PreToolUse hook:**
```bash
#!/bin/bash
set -euo pipefail

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# Add your check here
if echo "$COMMAND" | grep -qE 'YOUR_PATTERN'; then
  echo "$INPUT" | jq -nc '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: "Blocked: reason here"
    }
  }'
  exit 0
fi

exit 0  # Allow by default
```

**Template for a PostToolUse side-effect hook (non-blocking):**
```bash
#!/bin/bash
INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
[ -z "$FILE" ] && exit 0

# Do something with FILE (linting, formatting, logging, etc.)
exit 0  # exit code doesn't block on PostToolUse
```

> For formatters, linters, and loggers that don't need to give Claude feedback, add `"async": true` to the config entry — the hook runs in the background and Claude moves on immediately.

**Template for SessionStart context injection:**
```bash
#!/bin/bash
# Use CLAUDE_PROJECT_DIR (set by Claude Code) to target the correct repo
# regardless of shell cwd. Fall back to "." for manual testing.
REPO="${CLAUDE_PROJECT_DIR:-.}"

jq -nc --arg ctx "YOUR CONTEXT HERE" '{
  hookSpecificOutput: {
    hookEventName: "SessionStart",
    additionalContext: $ctx
  }
}'
exit 0
```

**Stop hook (must guard against infinite loop):**
```bash
#!/bin/bash
INPUT=$(cat)
ACTIVE=$(echo "$INPUT" | jq -r '.stop_hook_active // false')
[ "$ACTIVE" = "true" ] && exit 0

# Your check here...
exit 0
```

See [references/hook-reference.md](references/hook-reference.md) for the full event reference, all output fields, and more patterns.

### Step 4: Determine the settings file

| Scope | File | When to use |
|-------|------|-------------|
| All projects | `~/.claude/settings.json` | Global rules (security, personal workflow) |
| This project (shared) | `.claude/settings.json` | Team conventions, project lint rules |
| This project (private) | `.claude/settings.local.json` | Local overrides, gitignored secrets |

**Default to global** (`~/.claude/settings.json`) unless the user specifies otherwise or the hook is project-specific.

### Step 5: Write the configuration

Read the target settings file first. If the `hooks` key exists, merge carefully — do not overwrite existing hooks.

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "/path/to/script.sh",
            "timeout": 30
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "/path/to/formatter.sh",
            "async": true
          }
        ]
      }
    ]
  }
}
```

**Matcher rules:**
- Letters/digits/`_` only → exact match: `"Bash"`, `"Edit|Write"`
- Other characters → JS regex: `"^Notebook"`, `"mcp__memory__.*"`
- Omit to match all tool calls for that event
- Matchers are **case-sensitive**: `"bash"` will not match `Bash`

**Useful `if` field** (pre-filter before running the hook):
- `"Bash(git *)"` — only fires when Bash command starts with `git`
- `"Edit(*.ts)"` — only fires when editing `.ts` files

### Step 6: Place the script

Save scripts to a predictable location:
- Global hooks: `~/.claude/hooks/<descriptive-name>.sh`
- Project hooks: `.claude/hooks/<descriptive-name>.sh`

Make the script executable: `chmod +x <path>`

### Step 7: Test and confirm

Tell the user how to verify the hook works:
```bash
# Test a PreToolUse Bash hook manually:
echo '{"tool_name":"Bash","tool_input":{"command":"your test command"}}' | bash ~/.claude/hooks/your-hook.sh

# View all active hooks in Claude Code:
# Type /hooks in the Claude Code prompt
```

Show the final config diff and let the user confirm before writing to settings.json.

## Key rules

**Exit codes:**

| Code | Meaning |
|------|---------|
| `0` | Success — JSON on stdout is parsed and shown in verbose mode |
| `2` | Block — action denied; stderr is sent to Claude as context |
| other | Non-blocking warning — error shown to user, action continues |

- **Never write to `/dev/tty`** — use `terminalSequence` in JSON output for notifications
- **`additionalContext`** passes feedback to Claude; stderr goes to the user
- **Keep SessionStart fast** — it runs on every session
- **Use `async: true`** for non-blocking background tasks (logging, analytics)

## Example: Block destructive git force-push

```bash
#!/bin/bash
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

if echo "$COMMAND" | grep -qE 'git push.*--force|git push.*-f\b'; then
  echo "$INPUT" | jq -nc '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: "Force push blocked. Use --force-with-lease if you really mean it."
    }
  }'
  exit 0
fi
exit 0
```

Config in `~/.claude/settings.json`:
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "if": "Bash(git push*)",
        "hooks": [{ "type": "command", "command": "~/.claude/hooks/block-force-push.sh", "timeout": 5 }]
      }
    ]
  }
}
```
