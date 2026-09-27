# Generate forecast range Task Specification

```yaml
# BASIC INFORMATION
task_id: T8
task_name: Generate forecast range
task_type: Forecasting task
automation_level: L2
task_owner: HackTrack attendance forecasting service
```

## 1. Task Description

Combine aggregate responses, final-reminder responses, and approved historical outcomes into low, likely, and high attendance estimates for T9.

## 2. Inputs

### Input 1: Aggregate attendance response summary

- **Required contents and format:** Registration count, plans-to-attend count, cannot-attend count, unsure/no-response count, final-reminder categories, and response-window status.
- **Source:** T4, T5, T6, and T7.
- **Missing or invalid input:** Record the issue and hand the case to the CPVC event organizer; do not continue with invented data.

### Input 2: Historical attendance and event outcomes

- **Required contents and format:** Approved aggregate rates, prior forecast ranges, actual attendance, event type, date, sample size, and provenance.
- **Source:** T12 or approved CPVC records.
- **Missing or invalid input:** Record the issue and hand the case to the CPVC event organizer; do not continue with invented data.

## 3. Outputs

### Output 1: Attendance forecast range

- **Required contents and format:** Low, likely, and high estimates; aggregate inputs; date; confidence; final-reminder summary; and uncertainty reasons.
- **Next task or recipient:** T9: Plan Food, Drinks, and Swag.
- **Observable completion condition:** A bounded range is produced from approved evidence and labeled as a forecast.

## 4. Planned Tools

### Tool 1

- **Tool name:** generate_attendance_forecast_range
- **Input:** Aggregate attendance response summary; Historical attendance and event outcomes
- **Output:** Attendance forecast range
- **Implementation Route:** Approved file operations, database queries, calculation functions, or web API calls as applicable.
- **Integration approach:** Direct integration with the approved HackTrack service; no API keys are included.
- **Role in this task:** Produce a range reflecting final-reminder responses and historical uncertainty.
- **Task timeout:** 5 minutes
- **Maximum retries:** 1
- **Retry only when:** Retry once only for a transient service failure with unchanged inputs; do not retry missing evidence or reuse a stale range. The forecast is draft-only and duplicate-safe.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record unresolved forecast status and hand the case to the CPVC event organizer; do not send T9 a partial range.

## 5. Completion and Handoff

- **Successful completion:** A low/likely/high range with evidence and uncertainty is available to T9.
- **Failure or handoff:** Missing response categories, inadequate history, or failed forecasting is recorded and sent to the CPVC event organizer.

