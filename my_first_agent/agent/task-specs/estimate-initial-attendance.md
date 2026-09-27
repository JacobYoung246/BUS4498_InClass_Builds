# Estimate initial attendance Task Specification

```yaml
# BASIC INFORMATION
task_id: T2
task_name: Estimate initial attendance
task_type: Forecasting task
automation_level: L2
task_owner: HackTrack attendance forecasting service
```

## 1. Task Description

Apply the approved historical attendance rate using the fixed forecasting procedure. Label the result as an estimate, not a confirmed count.

## 2. Inputs

### Input 1: Registration record

- **Required contents and format:** Validated registration count, event ID, event type, timestamp, and aggregate confidence responses.
- **Source:** T1: Record registration.
- **Missing or invalid input:** Record the issue and hand the case to the CPVC event organizer; do not continue with invented data.

### Input 2: Historical attendance rate

- **Required contents and format:** Approved aggregate rate with scope, date, sample size, and provenance.
- **Source:** T12: Update aggregate forecast data or approved CPVC records.
- **Missing or invalid input:** Record the issue and hand the case to the CPVC event organizer; do not continue with invented data.

## 3. Outputs

### Output 1: Initial attendance estimate

- **Required contents and format:** Estimate, calculation basis, baseline rate, uncertainty note, event ID, and timestamp.
- **Next task or recipient:** T3: Send confirmation request and T4: Update attendance forecast.
- **Observable completion condition:** The estimate includes the approved baseline and no required inputs remain unresolved.

## 4. Planned Tools

### Tool 1

- **Tool name:** estimate_initial_attendance
- **Input:** Registration record; Historical attendance rate
- **Output:** Initial attendance estimate
- **Implementation Route:** Approved file operations, database queries, calculation functions, or web API calls as applicable.
- **Integration approach:** Direct integration with the approved HackTrack service; no API keys are included.
- **Role in this task:** Apply the approved baseline and identify uncertainty.
- **Task timeout:** 4 minutes
- **Maximum retries:** 1
- **Retry only when:** Retry once only for a transient execution failure with unchanged inputs; do not retry missing or unapproved data. The draft-only calculation is duplicate-safe.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record the unresolved estimate and hand the case to the CPVC event organizer; do not send a request from an unsupported estimate.

## 5. Completion and Handoff

- **Successful completion:** An initial estimate with evidence and uncertainty is available to T3 and T4.
- **Failure or handoff:** Missing historical evidence or failed forecasting is recorded and sent to the CPVC event organizer.

