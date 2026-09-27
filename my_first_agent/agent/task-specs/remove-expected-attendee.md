# Remove expected attendee Task Specification

```yaml
# BASIC INFORMATION
task_id: T5
task_name: Remove expected attendee
task_type: Attendance-record update task
automation_level: L1
task_owner: HackTrack attendance response service
```

## 1. Task Description

Apply a cannot-attend response to aggregate attendance evidence, remove the expected contribution once, and pass updated status to the reminder decision.

## 2. Inputs

### Input 1: Cannot-attend response

- **Required contents and format:** Aggregate response category, timestamp, registration identifier or idempotency key, and opt-out status.
- **Source:** Participant response to T3: Send confirmation request.
- **Missing or invalid input:** Record the issue and hand the case to the CPVC event organizer; do not continue with invented data.

### Input 2: Current attendance evidence

- **Required contents and format:** Event ID, current expected contribution, response counts, and timestamp.
- **Source:** T2 or prior aggregate update.
- **Missing or invalid input:** Record the issue and hand the case to the CPVC event organizer; do not continue with invented data.

## 3. Outputs

### Output 1: Expected-attendee removal status

- **Required contents and format:** Event ID, updated aggregate evidence, cannot-attend count, idempotency key, and timestamp.
- **Next task or recipient:** D2: Final reminder needed?
- **Observable completion condition:** The response is reflected exactly once.

## 4. Planned Tools

### Tool 1

- **Tool name:** remove_expected_attendee
- **Input:** Cannot-attend response; Current attendance evidence
- **Output:** Expected-attendee removal status
- **Implementation Route:** Approved file operations, database queries, calculation functions, or web API calls as applicable.
- **Integration approach:** Direct integration with the approved HackTrack service; no API keys are included.
- **Role in this task:** Apply a cannot-attend response without changing unrelated registration information.
- **Task timeout:** 2 minutes
- **Maximum retries:** 1
- **Retry only when:** Retry only after a transient failure and an idempotency check confirms the response was not applied. If uncertain, check the record and hand off.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record unresolved status and hand the case to the CPVC event organizer; do not continue as if removal succeeded.

## 5. Completion and Handoff

- **Successful completion:** The cannot-attend response is applied once and evidence is available to D2.
- **Failure or handoff:** Conflicting or uncertain records are recorded and sent to the CPVC event organizer.

