# Send confirmation request Task Specification

```yaml
# BASIC INFORMATION
task_id: T3
task_name: Send confirmation request
task_type: Participant-communication task
automation_level: L1
task_owner: HackTrack reminder service
```

## 1. Task Description

Send one concise confirmation request several days before the event to an eligible participant, respecting opt-out preferences and recording the response deadline.

## 2. Inputs

### Input 1: Initial attendance estimate

- **Required contents and format:** Event ID, reminder timing, response deadline, and estimate status.
- **Source:** T2: Estimate initial attendance.
- **Missing or invalid input:** Record the issue and hand the case to the CPVC event organizer; do not continue with invented data.

### Input 2: Reminder eligibility and contact route

- **Required contents and format:** Registration ID, approved route, opt-out status, and one-message-per-event flag.
- **Source:** T1: Record registration.
- **Missing or invalid input:** Record the issue and hand the case to the CPVC event organizer; do not continue with invented data.

## 3. Outputs

### Output 1: Confirmation request status

- **Required contents and format:** Event ID, registration ID, send status, message ID, response deadline, and non-send reason if applicable.
- **Next task or recipient:** Participant response decision, then T4, T5, or T6.
- **Observable completion condition:** A single send status or permitted non-send reason is stored.

## 4. Planned Tools

### Tool 1

- **Tool name:** send_confirmation_request
- **Input:** Initial attendance estimate; Reminder eligibility and contact route
- **Output:** Confirmation request status
- **Implementation Route:** Approved messaging API or notification service
- **Integration approach:** Direct integration with the approved HackTrack service; no API keys are included.
- **Role in this task:** Send the first permitted reminder and record its response window.
- **Task timeout:** 3 minutes
- **Maximum retries:** 1
- **Retry only when:** Retry only after a confirmed transient failure and an idempotency check proves no message was accepted. If delivery is uncertain, do not resend; record uncertainty and hand off.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record send status and hand the case to the CPVC event organizer; do not assume delivery.

## 5. Completion and Handoff

- **Successful completion:** One request is sent or a permitted non-send reason is recorded.
- **Failure or handoff:** Uncertain delivery, missing eligibility, or service failure is recorded and sent to the CPVC event organizer.

