# Spec: Customer Feedback Submission

> Figma: Not available - example change

## Frontend

### Requirement: Customer can submit feedback

The system SHALL allow a customer to submit feedback using a form with name, email, category, message, and consent fields.

#### Scenario: Successful feedback submission
WHEN the customer completes all required fields with valid values and submits the form
THEN the system shows a confirmation message that the feedback was received

#### Scenario: Missing required field
WHEN the customer submits the form without a required field
THEN the system shows a validation message for the missing field and does not submit the feedback

#### Scenario: Invalid email address
WHEN the customer enters an invalid email address and submits the form
THEN the system shows an email validation message and does not submit the feedback

### Requirement: Customer must consent to follow-up

The system SHALL require explicit consent before accepting feedback that includes contact details.

#### Scenario: Consent not selected
WHEN the customer submits the form without selecting consent
THEN the system shows a consent validation message and does not submit the feedback

## Backend

### Requirement: Feedback is stored after validation

The system SHALL validate and store submitted feedback after all required fields pass validation.

#### Scenario: Valid feedback request
WHEN the backend receives a valid feedback submission
THEN it stores the feedback with a submission timestamp and initial review status

#### Scenario: Invalid feedback request
WHEN the backend receives a feedback submission with missing or invalid required data
THEN it rejects the request and returns validation details

### Requirement: Operations team is notified

The system SHALL notify the configured operations recipient list after feedback is successfully stored.

#### Scenario: Feedback stored successfully
WHEN feedback is stored successfully
THEN the system sends an operations notification containing the category, customer email, and message summary

#### Scenario: Notification delivery fails
WHEN feedback is stored but the operations notification cannot be delivered
THEN the system keeps the feedback record and records that notification delivery failed
