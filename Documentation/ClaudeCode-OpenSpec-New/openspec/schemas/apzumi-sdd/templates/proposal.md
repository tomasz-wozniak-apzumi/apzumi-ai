# Proposal: <change name>

## Why
<!-- The problem or motivation. What breaks, is missing, or is painful today?
     Link the ticket / incident / request that triggered this. -->

## What Changes
<!-- The capabilities added, changed, or removed — at a high level, as a short
     bullet list. No design detail (that lives in design.md).
     Mark anything backwards-incompatible with **BREAKING**. -->

## Capabilities
<!-- The contract with the specs artifact. Research openspec/specs/ first
     (`openspec list --specs`). A change with NO capabilities at all — a pure
     refactor, tooling, or docs change — must instead set `skip_specs: true`
     in its .openspec.yaml; `openspec validate` rejects a zero-delta change
     without that marker. Never invent a requirement to satisfy validation. -->

### New Capabilities
<!-- Introduced by this change. Each creates specs/<capability-path>/spec.md.
     Use kebab-case for segments you introduce, and follow the project's
     existing layout — flat (`billing`) or nested (`identity/user-auth`).
     Prefer coarse domain-level names over feature-level ones. -->
- `<capability-path>`: <what this capability covers>

### Modified Capabilities
<!-- Existing capabilities whose REQUIREMENTS change — not merely their
     implementation. Use the exact existing path under openspec/specs/.
     Leave empty if no requirement changes. -->
- `<existing-capability-path>`: <which requirement is changing>

## Platforms
<!-- Which platforms this change touches, using the exact names from the
     project context. Explicitly list platforms NOT affected when that could
     be ambiguous. -->

## Scope
<!-- In scope:  ...
     Out of scope:  ...
     Be explicit about both. The out-of-scope list is what stops the change
     from sprawling during implementation. -->

## Impact
<!-- Affected code, APIs, data, dependencies, and teams.
     Flag anything that breaks backwards compatibility. -->
