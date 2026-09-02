# Hook Reference

## All Hook Events

### Session-level (run once per session)

| Event | When it fires | Can block? | Matcher support |
|-------|--------------|------------|-----------------|
| `SessionStart` | Session begins, resumes, or is cleared | No | `startup`, `resume`, `clear`, `compact` |
| `Setup` | One-time init (`--init-only`, `--maintenance`) | No | `init`, `maintenance` |
| `SessionEnd` | Session terminates | No | `clear`, `resume`, `logout`, `other` |
| `PreCompact` | Before context is compacted | No | — |

### Per-turn (once per user message)

| Event | When it fires | Can block? |
|-------|--------------|------------|
| `UserPromptSubmit` | Before Claude processes the user's message | Yes (exit 2) |
| `UserPromptExpansion` | Before slash command expansion | Yes |
| `Stop` | After Claude finishes responding | Can prevent stop |

### Tool-level (every tool call)

| Event | When it fires | Can block? |
|-------|--------------|------------|
| `PreToolUse` | Before any tool executes | Yes (exit 2) |
| `PostToolUse` | After tool succeeds | No |
| `PostToolUseFailure` | After tool fails | No |
| `PostToolBatch` | After a parallel batch of tools completes | No |
| `PermissionRequest` | When permission dialog would appear | Can auto-allow/deny |
| `PermissionDenied` | When a tool call is auto-denied | No |

### Async events (file/env watchers)

| Event | Matcher |
|-------|---------|
| `FileChanged` | Literal filenames: `".envrc\|.env"` |
| `CwdChanged` | No matcher |
| `ConfigChange` | No matcher |
| `Notification` | `permission_prompt`, `idle_prompt`, etc. |
| `InstructionsLoaded` | — |
| `WorktreeCreate` / `WorktreeRemove` | — |
| `SubagentStart` / `SubagentStop` | Agent type: `"general-purpose"`, `"Explore"` |

---

## Input JSON (stdin)

All hooks receive a JSON object on stdin with these common fields:

```json
{
  "session_id": "abc123",
  "transcript_path": "/path/to/transcript.jsonl",
  "cwd": "/current/working/directory",
  "permission_mode": "default",
  "hook_event_name": "PreToolUse",
  "agent_id": "subagent-id",
  "agent_type": "Explore"
}
```

**PreToolUse / PostToolUse** add:
```json
{
  "tool_name": "Bash",
  "tool_input": { "command": "npm test" },
  "tool_output": "..."
}
```

**UserPromptSubmit** adds:
```json
{ "prompt": "User's message" }
```

**SessionStart** adds:
```json
{ "source": "startup|resume|clear|compact", "model": "claude-sonnet-4-6" }
```

**Stop** adds:
```json
{ "stop_hook_active": false }
```

**FileChanged** adds:
```json
{ "file_path": "/project/.envrc", "change_type": "modified" }
```

---

## Output JSON (stdout, exit 0)

```json
{
  "continue": true,
  "suppressOutput": false,
  "systemMessage": "Shown to user as a warning",
  "terminalSequence": "\033]777;notify;Title;Body\007",
  "hookSpecificOutput": { ... }
}
```

### Universal fields

| Field | Default | Purpose |
|-------|---------|---------|
| `continue` | `true` | Set `false` to abort the entire Claude turn |
| `stopReason` | — | Message shown when `continue=false` |
| `suppressOutput` | `false` | Hide hook stdout from transcript |
| `systemMessage` | — | Warning shown to the user (not Claude) |
| `additionalContext` | — | Context injected for Claude to read |
| `terminalSequence` | — | OSC/BEL escape for desktop notifications |

### `hookSpecificOutput` by event

**PreToolUse:**
```json
{
  "hookEventName": "PreToolUse",
  "permissionDecision": "deny|allow|ask|defer",
  "permissionDecisionReason": "Reason string",
  "additionalContext": "Context for Claude",
  "updatedInput": { "command": "modified command" }
}
```

**PostToolUse:**
```json
{
  "hookEventName": "PostToolUse",
  "additionalContext": "Feedback to Claude",
  "updatedToolOutput": { "modified": "output" }
}
```

**SessionStart:**
```json
{
  "hookEventName": "SessionStart",
  "additionalContext": "Always check CLAUDE.md before starting.",
  "sessionTitle": "Custom session title",
  "watchPaths": ["/path/to/watch"],
  "reloadSkills": true
}
```

**Stop:**
```json
{
  "hookEventName": "Stop",
  "additionalContext": "Feedback that continues the conversation"
}
```

**PermissionRequest:**
```json
{
  "hookEventName": "PermissionRequest",
  "decision": {
    "behavior": "allow|deny",
    "updatedInput": { "command": "safer command" }
  }
}
```

---

## Command hook additional fields

```json
{
  "type": "command",
  "command": "script.sh",
  "args": ["--flag"],
  "async": false,
  "asyncRewake": false,
  "shell": "bash",
  "timeout": 30
}
```

- `args` present → exec form (no shell, args passed verbatim)
- `args` absent → shell form (pipes, `&&`, globs work)
- `async: true` → runs in background, doesn't block Claude
- `asyncRewake: true` → background, but exit 2 wakes Claude

## HTTP hook fields

```json
{
  "type": "http",
  "url": "http://localhost:8080/hooks/pre-tool",
  "headers": { "Authorization": "Bearer $MY_TOKEN" },
  "allowedEnvVars": ["MY_TOKEN"],
  "timeout": 30
}
```

## MCP tool hook fields

```json
{
  "type": "mcp_tool",
  "server": "my_server",
  "tool": "scan_file",
  "input": { "file_path": "${tool_input.file_path}" },
  "timeout": 600
}
```

## Path placeholders (command and HTTP hooks)

| Placeholder | Value |
|-------------|-------|
| `${CLAUDE_PROJECT_DIR}` | Project root directory |
| `${CLAUDE_PLUGIN_ROOT}` | Plugin installation directory |
| `${CLAUDE_PLUGIN_DATA}` | Plugin persistent data directory |

---

## More Patterns

### Auto-format TypeScript after edit
```bash
#!/bin/bash
INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
[[ "$FILE" == *.ts || "$FILE" == *.tsx ]] || exit 0
npx prettier --write "$FILE" 2>/dev/null || true
exit 0
```

Config:
```json
{ "PostToolUse": [{ "matcher": "Edit|Write", "hooks": [{ "type": "command", "command": "~/.claude/hooks/format-ts.sh" }] }] }
```

### Notify on permission prompt
```bash
#!/bin/bash
seq=$(printf '\033]777;notify;Claude needs permission;Check Claude Code\007')
jq -nc --arg seq "$seq" '{terminalSequence: $seq}'
exit 0
```

### Log all Bash commands
```bash
#!/bin/bash
INPUT=$(cat)
CMD=$(echo "$INPUT" | jq -r '.tool_input.command // empty')
echo "$(date -Iseconds) $CMD" >> ~/.claude/bash-history.log
exit 0
```

### Inject git status into every session
```bash
#!/bin/bash
GIT_INFO=$(git -C "$CLAUDE_PROJECT_DIR" log --oneline -5 2>/dev/null || echo "not a git repo")
jq -nc --arg ctx "Recent git log:\n$GIT_INFO" '{
  hookSpecificOutput: { hookEventName: "SessionStart", additionalContext: $ctx }
}'
exit 0
```

### Block writes to sensitive files
```bash
#!/bin/bash
INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
if echo "$FILE" | grep -qE '(\.env$|\.env\.|id_rsa|credentials)'; then
  jq -nc '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: "Writing to sensitive files is blocked by hook"
    }
  }'
  exit 0
fi
exit 0
```

---

## Testing a hook manually

```bash
# PreToolUse / PostToolUse
echo '{"tool_name":"Bash","tool_input":{"command":"rm -rf /tmp/test"}}' | bash ~/.claude/hooks/myhook.sh

# SessionStart
echo '{"source":"startup","model":"claude-sonnet-4-6"}' | bash ~/.claude/hooks/session-hook.sh

# View all active hooks
# In Claude Code: type /hooks
```
