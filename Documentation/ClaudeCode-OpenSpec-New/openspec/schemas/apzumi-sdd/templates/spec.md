<!--
  Delta spec for ONE capability.
  File path: specs/<capability-path>/spec.md  (inside this change folder)

  <capability-path> is the spec directory relative to specs/ — `billing` in a
  flat layout, `identity/user-auth` where the project nests. Use the exact
  path the proposal's Capabilities section declared; never move or rename an
  existing capability here.

  UI-facing specs start with a confirmed Figma blockquote (never invent a URL):
  > Figma: <screen or flow label> — <url>
  or, when none exists:
  > Figma: Not available — confirmed by <source/date>

  Multi-platform: inside the delta sections below, mark platform boundaries
  with bold text (**Frontend**, **Backend**), NOT headings — extra headings
  break delta validation. Only include platforms in scope.

  Include only the sections you actually use. Each requirement needs at least
  one concrete, testable scenario, and scenario headings need EXACTLY four
  hashes.
-->

## Purpose
<!-- NEW capabilities only: one or two sentences (50+ characters) on what this
     capability is for. Archive copies it into the main spec it creates.
     DELETE this section entirely for a delta on an EXISTING capability — that
     spec already has a Purpose and this one is ignored. -->

## ADDED Requirements

### Requirement: <name>
The system SHALL <observable behaviour, stated as a contract>.

#### Scenario: <name>
- **WHEN** <action, event, or condition>
- **THEN** <expected, observable result>
- **AND** <further observable result — only when it adds clarity>

## MODIFIED Requirements
<!--
  Paste the FULL updated requirement (header + ALL its scenarios). A partial
  delta drops previous detail when the change is archived. Use ADDED — not
  MODIFIED — for a genuinely new concern on this capability.
-->

### Requirement: <existing name>
The system SHALL <complete, revised behaviour>.

#### Scenario: <name>
- **WHEN** ...
- **THEN** ...

## REMOVED Requirements

### Requirement: <name>
**Reason**: <why it is being removed>
**Migration**: <how existing behaviour, data, or callers are handled>

## RENAMED Requirements
<!-- Name changes only. Prefer this over a REMOVED+ADDED pair, which loses the
     requirement's history and merges worse at archive. -->

- FROM: `### Requirement: <old name>`
- TO: `### Requirement: <new name>`
