# Test Scenarios: Add Customer Feedback Form

## Feedback Submission

| # | Scenario | Steps | Expected Result |
| --- | --- | --- | --- |
| T1 | Submit valid feedback | 1. Open the feedback form<br>2. Enter valid name, email, category, message, and consent<br>3. Submit the form | The system shows a confirmation message and stores the feedback |
| T2 | Submit without required fields | 1. Open the feedback form<br>2. Leave one or more required fields empty<br>3. Submit the form | The system shows validation messages and does not submit the feedback |
| T3 | Submit with invalid email | 1. Open the feedback form<br>2. Enter an invalid email address<br>3. Complete the remaining fields<br>4. Submit the form | The system shows an email validation message and does not submit the feedback |
| T4 | Submit without consent | 1. Open the feedback form<br>2. Complete all fields except consent<br>3. Submit the form | The system shows a consent validation message and does not submit the feedback |

## Operations Notification

| # | Scenario | Steps | Expected Result |
| --- | --- | --- | --- |
| T5 | Operations notification after valid submission | 1. Submit valid feedback<br>2. Check the configured operations notification channel | A notification is sent with the category, customer email, and message summary |
| T6 | Notification failure does not lose feedback | 1. Simulate notification delivery failure<br>2. Submit valid feedback<br>3. Review stored feedback records | The feedback remains stored and notification failure is recorded |
