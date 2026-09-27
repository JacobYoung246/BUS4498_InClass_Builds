# Organizer reviews draft recommendation Task Specification

```yaml
# BASIC INFORMATION
task_id: H1
task_name: Organizer reviews draft recommendation
task_type: Human-review task
automation_level: L0
task_owner: CPVC event organizer
```

## 1. Task Description

Review T9's draft against budget, requirements, shortage risk, leftover risk, and assumptions. Approve the plan or provide specific changes; silence is not approval.

## 2. Inputs

### Input 1: Draft supply recommendation

- **Required contents and format:** T9 quantities, selected scenario, buffer, cost, risks, evidence, assumptions, and unresolved issues.
- **Source:** T9: Plan Food, Drinks, and Swag.
- **Missing or invalid input:** Record the issue and hand the case to the CPVC event organizer; do not continue with invented data.

## 3. Outputs

### Output 1: Organizer approval decision

- **Required contents and format:** Approve or request revision, reviewer role, timestamp, selected scenario if approved, and changes if rejected.
- **Next task or recipient:** Approved plan waits for event-day trigger; revisions go to T10.
- **Observable completion condition:** A human decision is recorded with rationale and timestamp.

## 4. Planned Tools

### Tool 1

- **Tool name:** Not applicable — manual task
- **Input:** Draft supply recommendation
- **Output:** Organizer approval decision
- **Implementation Route:** Human review and explicit entry of the decision
- **Integration approach:** Not applicable — manual task
- **Role in this task:** The accountable human makes the decision; software may display evidence but may not decide or approve.
- **Task timeout:** Human response deadline: within one business day or before the purchasing deadline, whichever comes first
- **Maximum retries:** Not applicable — manual task.
- **Retry only when:** Not applicable — manual task.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record the missed deadline and hand the case to the designated CPVC backup reviewer. A missed deadline is not approval.

## 5. Completion and Handoff

- **Successful completion:** The organizer records an approval or revision decision.
- **Failure or handoff:** Missing or late review is recorded and sent to the designated CPVC backup reviewer.

