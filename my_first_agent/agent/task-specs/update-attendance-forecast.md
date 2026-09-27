# Update attendance forecast Task Specification

```yaml
# BASIC INFORMATION
task_id: T4
task_name: Update attendance forecast
task_type: Forecast-update task
automation_level: L2
task_owner: HackTrack attendance forecasting service
```

## 1. Task Description

Incorporate a plans-to-attend response into aggregate attendance evidence without creating a guaranteed count.

## 2. Inputs

### Input 1: Initial attendance estimate

- **Required contents and format:** Event ID, estimate, baseline rate, uncertainty note, and timestamp.
- **Source:** T2: Estimate initial attendance.
- **Missing or invalid input:** Record the issue and hand the case to the CPVC event organizer; do not continue with invented data.

### Input 2: Plans-to-attend response

- **Required contents and format:** Aggregate response category, timestamp, and attendance-evidence impact.
- **Source:** Participant response to T3: Send confirmation request.
- **Missing or invalid input:** Record the issue and hand the case to the CPVC event organizer; do not continue with invented data.

## 3. Outputs

### Output 1: Updated attendance evidence

- **Required contents and format:** Updated expected-attendance evidence, response category, aggregate count, timestamp, and uncertainty note.
- **Next task or recipient:** D2: Final reminder needed?
- **Observable completion condition:** The response is incorporated once and evidence is available for the decision.

## 4. Planned Tools

### Tool 1

- **Tool name:** update_attendance_forecast
- **Input:** Initial attendance estimate; Plans-to-attend response
- **Output:** Updated attendance evidence
- **Implementation Route:** Approved file operations, database queries, calculation functions, or web API calls as applicable.
- **Integration approach:** Direct integration with the approved HackTrack service; no API keys are included.
- **Role in this task:** Apply a plans-to-attend response without creating a confirmed count.
- **Task timeout:** 3 minutes
- **Maximum retries:** 1
- **Retry only when:** Retry once only for a transient calculation failure with unchanged inputs; do not retry missing or ambiguous responses, route them to T6. The aggregate calculation is draft-only and duplicate-safe.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record response and forecast status and hand the case to the CPVC event organizer; do not continue as if the update succeeded.

## 5. Completion and Handoff

- **Successful completion:** The plans-to-attend response is incorporated once into aggregate evidence.
- **Failure or handoff:** Missing forecast, ambiguous response, or failed calculation is recorded and routed to the CPVC event organizer or T6.

