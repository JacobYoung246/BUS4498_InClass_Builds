# Update aggregate forecast data Task Specification

```yaml
# BASIC INFORMATION
task_id: T12
task_name: Update aggregate forecast data
task_type: Aggregate-record update task
automation_level: L1
task_owner: HackTrack forecasting data service
```

## 1. Task Description

Compare the forecast range with the final aggregate check-in count and update approved historical planning data. Store aggregate outcomes only and preserve unknown resource values as unresolved.

## 2. Inputs

### Input 1: Aggregate event check-in record

- **Required contents and format:** Event ID, final count, closed-period status, timestamp, and duplicate status.
- **Source:** T11: Record event check-ins.
- **Missing or invalid input:** Record the issue and hand the case to the CPVC event organizer; do not continue with invented data.

### Input 2: Attendance forecast range

- **Required contents and format:** Low, likely, and high values, forecast date, confidence, response summary, and provenance.
- **Source:** T8: Generate forecast range.
- **Missing or invalid input:** Record the issue and hand the case to the CPVC event organizer; do not continue with invented data.

### Input 3: Approved resource outcome

- **Required contents and format:** Approved scenario, quantities, shortages, leftovers, and spending when available; unknown values marked unknown.
- **Source:** H1 approval and CPVC event records.
- **Missing or invalid input:** Record the issue and hand the case to the CPVC event organizer; do not continue with invented data.

## 3. Outputs

### Output 1: Updated aggregate forecast data

- **Required contents and format:** Event ID, actual aggregate attendance, forecast range, coverage/error result, resource outcomes, provenance, version, and unresolved fields.
- **Next task or recipient:** Future T2, T6, and T8 runs.
- **Observable completion condition:** One versioned aggregate outcome record is stored for the closed event.

## 4. Planned Tools

### Tool 1

- **Tool name:** update_aggregate_forecast_data
- **Input:** Aggregate event check-in record; Attendance forecast range; Approved resource outcome
- **Output:** Updated aggregate forecast data
- **Implementation Route:** Idempotent database or approved historical-record operation
- **Integration approach:** Direct integration with the approved HackTrack service; no API keys are included.
- **Role in this task:** Store the closed outcome and forecast comparison without individual identities.
- **Task timeout:** 3 minutes
- **Maximum retries:** 1
- **Retry only when:** Retry only after a transient write failure and event/version check confirm the outcome was not stored. If uncertain, read the existing version before retrying; never duplicate an event.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record unresolved update and hand the case to the CPVC event organizer; do not expose it to future forecasts as saved.

## 5. Completion and Handoff

- **Successful completion:** A versioned aggregate outcome record is available for future forecasting.
- **Failure or handoff:** Missing closed check-ins, invalid forecast data, or uncertain writes are recorded and sent to the CPVC event organizer.

