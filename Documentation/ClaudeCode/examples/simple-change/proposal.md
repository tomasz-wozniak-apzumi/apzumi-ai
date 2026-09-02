# Proposal: Add Customer Feedback Form

## Why

The business wants a simple way for customers to submit product feedback after using the service. Today, feedback is collected manually through email, which makes it difficult to track volume, categorize issues, and follow up consistently.

## What Changes

- Add a customer-facing feedback form.
- Capture the customer's contact details, feedback category, message, and consent to be contacted.
- Notify the operations team when new feedback is submitted.
- Store feedback so it can be reviewed later.

## In Scope

- Feedback form fields and validation.
- Confirmation message after submission.
- Operations notification.
- Feedback storage for later review.

## Out Of Scope

- Public reporting dashboard.
- Automated sentiment analysis.
- Multi-language support.
- Customer account login.

## Affected Users

- Customer: submits feedback.
- Operations user: receives and reviews feedback.

## Capabilities

- `customer-feedback-submission`

## Assumptions

- Customers can submit feedback without signing in.
- Email is the preferred notification channel for operations users.
- The first version only needs one operations notification recipient list.

## Risks

- Feedback may contain personal data, so retention and access rules must be confirmed.
- The operations team may need filtering or categorization soon after launch.

## Open Questions

- Which feedback categories should be available?
- How long should submitted feedback be retained?
- Who should receive operations notifications?
- Should customers receive a confirmation email, or only an on-screen confirmation?
