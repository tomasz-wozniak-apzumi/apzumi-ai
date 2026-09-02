# Tasks: Add Customer Feedback Form

## Shared Infrastructure (submodules/infrastructure)

- [ ] Configure operations notification recipients
  - Scope: notification configuration
  - Acceptance criteria: the backend can read the configured recipient list in the target environment
  - Dependencies: none

## Frontend (submodules/frontend)

- [ ] Build the feedback form UI
  - Scope: customer-facing feedback page or component
  - Acceptance criteria: customers can enter name, email, category, message, and consent
  - Dependencies: none

- [ ] Add client-side validation states
  - Scope: feedback form validation behavior
  - Acceptance criteria: missing required fields, invalid email, and missing consent show clear validation messages
  - Dependencies: feedback form UI

- [ ] Show submission success and failure states
  - Scope: feedback form submission result handling
  - Acceptance criteria: successful submissions show confirmation, failed submissions show a recoverable error message
  - Dependencies: backend submission endpoint

## Backend (submodules/backend)

- [ ] Add feedback submission endpoint
  - Scope: API endpoint for customer feedback
  - Acceptance criteria: valid submissions are accepted and invalid submissions return validation details
  - Dependencies: none

- [ ] Store validated feedback
  - Scope: feedback persistence
  - Acceptance criteria: stored feedback includes submitted fields, timestamp, and initial review status
  - Dependencies: feedback submission endpoint

- [ ] Send operations notification
  - Scope: notification integration
  - Acceptance criteria: successful feedback submissions trigger a notification to configured recipients
  - Dependencies: store validated feedback, configure operations notification recipients
