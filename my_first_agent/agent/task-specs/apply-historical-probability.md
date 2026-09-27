# Apply historical probability Task Specification

```yaml
# BASIC INFORMATION
task_id: T6
task_name: Apply historical probability
task_type: Uncertainty-handling task
automation_level: L2
task_owner: HackTrack attendance forecasting service
```

## 1. Task Description

Use the approved historical attendance probability when a participant is unsure or does not respond. Preserve uncertainty instead of treating silence as attendance.

## 2. Inputs

### Input 1: Unsure or no-response status

- **Required contents and format:** Event ID, response category or response-window expiration, aggregate count, and timestamp.
- **Source:** T3 or T7 reminder status.
- **Missing or invalid input:** Record the issue and hand the case to the CPVC event organizer; do not continue with invented data.

### Input 2: Historical attendance rate

- **Required contents and format:** Approved aggregate rate, scope, date, sample size, and provenance.
- **Source:** T12: Update aggregate forecast data or approved CPVC records.
- **Missing or invalid input:** Record the issue and hand the case to the CPVC event organizer; do not continue with invented data.

## 3. Outputs

### Output 1: Uncertainty-adjusted attendance evidence

- **Required contents and format:** Historical probability used, uncertainty category, aggregate count, event ID, timestamp, and confidence note.
- **Next task or recipient:** D2: Final reminder needed? or T8: Generate forecast range.
- **Observable completion condition:** The response remains uncertain and the approved probability is recorded.

## 4. Planned Tools

### Tool 1

- **Tool name:** apply_historical_probability
- **Input:** Unsure or no-response status; Historical attendance rate
- **Output:** Uncertainty-adjusted attendance evidence
- **Implementation Route:** Approved file operations, database queries, calculation functions, or web API calls as applicable.
- **Integration approach:** Direct integration with the approved HackTrack service; no API keys are included.
- **Role in this task:** Preserve uncertainty and apply the approved aggregate probability.
- **Task timeout:** 3 minutes
- **Maximum retries:** 1
- **Retry only when:** Retry once only for a transient calculation failure with unchanged inputs; do not retry missing or stale historical data, retrieve approved data or hand off.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record probability status and hand the case to the CPVC event organizer; do not treat the participant as attending.

## 5. Completion and Handoff

- **Successful completion:** The unsure or no-response case is represented with approved probability and explicit uncertainty.
- **Failure or handoff:** Missing provenance or failed calculation is recorded and sent to the CPVC event organizer.

