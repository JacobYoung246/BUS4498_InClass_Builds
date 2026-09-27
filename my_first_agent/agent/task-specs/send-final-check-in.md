# Send final check-in Task Specification

```yaml
# BASIC INFORMATION
task_id: T7
task_name: Send final check-in
task_type: Participant-communication task
automation_level: L1
task_owner: HackTrack reminder service
```

## 1. Task Description

Send at most one final check-in shortly before the event when current evidence shows a reminder is needed. Record its response window and never treat a missing response as attendance.

## 2. Inputs

### Input 1: Current attendance evidence

- **Required contents and format:** Event ID, uncertainty status, reminder decision, response deadline, and aggregate counts.
- **Source:** T4, T5, or T6.
- **Missing or invalid input:** Record the issue and hand the case to the CPVC event organizer; do not continue with invented data.

### Input 2: Final reminder eligibility and contact route

- **Required contents and format:** Registration ID, approved route, opt-out status, and proof no final reminder was sent.
- **Source:** T1 and T3.
- **Missing or invalid input:** Record the issue and hand the case to the CPVC event organizer; do not continue with invented data.

## 3. Outputs

### Output 1: Final check-in status

- **Required contents and format:** Event ID, aggregate key, send status, message ID, response deadline, and delivery uncertainty status.
- **Next task or recipient:** D4: Final check-in response? then T8: Generate forecast range.
- **Observable completion condition:** One final check-in is sent or a permitted non-send reason is recorded.

## 4. Planned Tools

### Tool 1

- **Tool name:** send_final_check_in
- **Input:** Current attendance evidence; Final reminder eligibility and contact route
- **Output:** Final check-in status
- **Implementation Route:** Approved messaging API or notification service
- **Integration approach:** Direct integration with the approved HackTrack service; no API keys are included.
- **Role in this task:** Send the second and final permitted reminder only when allowed.
- **Task timeout:** 3 minutes
- **Maximum retries:** 1
- **Retry only when:** Retry only after a confirmed transient failure and an idempotency check proves no check-in was accepted. Do not resend after an uncertain outcome; record uncertainty and hand off.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record final-reminder status and hand the case to the CPVC event organizer; do not assume delivery.

## 5. Completion and Handoff

- **Successful completion:** The final check-in status is recorded without exceeding the two-reminder boundary.
- **Failure or handoff:** Uncertain delivery, missing eligibility, or service failure is recorded and sent to the CPVC event organizer.

