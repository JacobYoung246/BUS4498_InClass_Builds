# Plan Food, Drinks, and Swag Task Specification

```yaml
# BASIC INFORMATION
task_id: T9
task_name: Plan Food, Drinks, and Swag
task_owner: CPVC event organizer
# Agent Inference Configuration
Provider: Groq
Model: "openai/gpt-oss-20b"
Role: Validate planning inputs; interpret attendance uncertainty; calculate supply requirements; compare planning scenarios; prepare a draft supply recommendation.
Maximum inference requests per task run: 6
On inference failure or exhausted limits: Record the unresolved status and hand the case to CPVC event organizer or designated resource-planning reviewer.
```

## 1. Task Goal

- **Objective:** Produce a draft resource recommendation for food, drinks, and swag before organizer approval. The recommendation must use the available attendance forecast and approved planning evidence to compare feasible scenarios, keep estimated spending within the organizer-provided budget when possible, and make shortage, leftover, and uncertainty tradeoffs clear to the organizer.

## 2. Inbound Inputs

### Input 1

- **Input name:** Attendance forecast range
- **What it contains:** The low, likely, and high attendance estimates; aggregate registration and response counts; forecast date; confidence level; and reasons for uncertainty.
- **Source:** T8: Generate forecast range using final response

### Input 2

- **Input name:** Event resource requirements
- **What it contains:** The requested supply categories, expected servings or units per attendee, purchasing deadline, and any organizer-provided requirements.
- **Source:** CPVC event organizer and event-planning records

### Input 3

- **Input name:** Budget and purchasing constraints
- **What it contains:** Available budget, current inventory, package sizes, estimated prices, minimum order quantities, purchasing restrictions, and acceptable shortage or waste limits.
- **Source:** CPVC event organizer or an approved planning source

### Input 4

- **Input name:** Historical resource outcomes
- **What it contains:** Aggregate information from previous events, such as actual attendance, quantities purchased, leftovers, shortages, and total spending.
- **Source:** T12: Update aggregate forecast data or approved CPVC event records

## 3. Tool Permissions and Boundaries

### Task-Wide Limits

- **Total task timeout:** 20 minutes per task run, including inference requests, tool calls, retries, and waiting.
- **Maximum tool calls:** 10 total calls across all tools during one task run; retries count toward this total.

### Tool 1

- **Tool name:** `retrieve_approved_planning_records`
- **Input:** Event resource requirements; Budget and purchasing constraints; Historical resource outcomes
- **Output:** Validated planning inputs and an evidence summary
- **Implementation Route:** Read-only file operations, database queries, or web API calls to approved planning sources
- **Integration approach:** Direct integration with approved CPVC planning records
- **Role in this task:** Support **Validate planning inputs** by checking completeness, freshness, consistency, and approved-source provenance
- **Task timeout:** 3 minutes
- **Maximum retries:** 1
- **Retry only when:** The read-only request times out or an approved source reports a temporary unavailability; wait 30 seconds before one additional attempt. Do not retry for missing information, conflicting records, or an ambiguous result; record the issue and hand off. The tool is read-only, so a repeated call cannot create duplicate records or orders.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record which input was unavailable or inconsistent, mark the task escalated, and hand the case to the CPVC event organizer or designated resource-planning reviewer. Do not continue as if the input were validated.

### Tool 2

- **Tool name:** `calculate_supply_requirements`
- **Input:** Attendance forecast range; Event resource requirements; Budget and purchasing constraints
- **Output:** Scenario quantities, package rounding, estimated cost, shortage risk, and leftover risk
- **Implementation Route:** Calculation functions or spreadsheet scripts using validated inputs
- **Integration approach:** Direct integration with the calculation function or planning spreadsheet
- **Role in this task:** Support **Interpret attendance uncertainty** and **Calculate supply requirements**
- **Task timeout:** 4 minutes
- **Maximum retries:** 1
- **Retry only when:** The calculation fails because of a transient execution error while the validated inputs are unchanged; wait 30 seconds, then retry once. Do not retry for missing prices, package sizes, inventory, requirements, or budget values; retrieve the missing information with Tool 1 or hand off. The tool produces a draft calculation only and changes no external records, so a permitted retry is duplicate-safe.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record the calculation status and the specific missing or failed input, mark the task escalated, and hand the case to the CPVC event organizer or designated resource-planning reviewer. Do not present partial calculations as a completed recommendation.

### Tool 3

- **Tool name:** `compare_planning_scenarios`
- **Input:** Attendance forecast range; Event resource requirements; Budget and purchasing constraints; Historical resource outcomes
- **Output:** Compared conservative, balanced, and budget-sensitive alternatives; selected planning scenario; proposed buffer; and risk tradeoff
- **Implementation Route:** Calculation functions or spreadsheet scripts that compare approved quantities, costs, shortage risk, and leftover risk
- **Integration approach:** Direct integration with the scenario-comparison function or planning spreadsheet
- **Role in this task:** Support **Compare planning scenarios** and adaptive selection of a feasible plan before human escalation
- **Task timeout:** 4 minutes
- **Maximum retries:** 0
- **Retry only when:** Not applicable — retries are not permitted. The tool must explore feasible alternatives, including reducing buffers or comparing lower-cost approved options, before concluding that no acceptable plan exists.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record the alternatives evaluated and the unresolved constraint, mark the task escalated, and hand the case to the CPVC event organizer or designated resource-planning reviewer. Do not select an unsupported scenario or continue as if comparison succeeded.

### Tool 4

- **Tool name:** `prepare_supply_recommendation`
- **Input:** Attendance forecast range; Event resource requirements; Budget and purchasing constraints; Historical resource outcomes
- **Output:** Draft quantities for food, drinks, and swag; evidence summary; unresolved issues; and handoff note
- **Implementation Route:** File operations and formatting functions or scripts that assemble the draft deliverable
- **Integration approach:** Direct integration with the draft-generation function; no external messages, purchases, or record changes
- **Role in this task:** Support **Prepare supply recommendation** and format the outbound deliverable for H1 organizer review
- **Task timeout:** 3 minutes
- **Maximum retries:** 0
- **Retry only when:** Not applicable — retries are not permitted. The tool may format only evidence produced by the permitted subtasks and may not fill gaps with invented prices, quantities, inventory, requirements, or approvals.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record that the draft deliverable was not completed, mark the task escalated, and hand the case to the CPVC event organizer or designated resource-planning reviewer. Do not send or present an incomplete draft as final.

## 4. How the Agent Should Reason

### Permitted Subtask 1

- **Subtask name:** Validate planning inputs
- **Subtask description:** Check whether the forecast, resource requirements, budget, inventory, prices, package sizes, and purchasing constraints are complete, current, and internally consistent.
- **Subtask boundary:** The agent may retrieve missing or stale information from an approved planning source and may use only clearly labeled assumptions for arithmetic conventions, such as rounding up to an available package size; an organizer-provided default serving or buffer; a dated aggregate historical value; or a temporary scenario parameter presented for organizer confirmation. It may not invent prices, quantities, inventory, requirements, participant status, or approval.
- **Retry limits:** One validation pass and, when needed, one retrieval attempt from an approved source. If the information remains unavailable or inconsistent, record the unresolved input and hand off instead of repeating the same validation.

### Permitted Subtask 2

- **Subtask name:** Interpret attendance uncertainty
- **Subtask description:** Examine the low, likely, and high attendance estimates and determine how uncertainty should affect the supply buffer.
- **Subtask boundary:** The agent may compare scenarios and explain risk tradeoffs, but it may not convert uncertainty into a guaranteed attendance number or treat a missing response as a confirmation.
- **Retry limits:** No repeated calculation. Perform one interpretation using the available forecast; if the forecast is insufficient, record the unresolved uncertainty and hand off.

### Permitted Subtask 3

- **Subtask name:** Calculate supply requirements
- **Subtask description:** Calculate the food, drink, and swag quantities required for each attendance scenario using approved per-person requirements, package sizes, inventory, prices, and purchasing constraints.
- **Subtask boundary:** The agent may calculate and compare quantities, round only according to approved package sizes, and identify budget or shortage conflicts. It may not place an order, make a payment, or exceed the stated budget without organizer approval.
- **Retry limits:** Perform one calculation after inputs are validated. If a package size, price, inventory value, or requirement is missing, retrieve it from an approved source once; if it remains unavailable, flag the missing evidence and hand off rather than repeating the same calculation.

### Permitted Subtask 4

- **Subtask name:** Compare planning scenarios
- **Subtask description:** Explore at least three feasible alternatives, such as a conservative plan, a balanced plan, and a budget-sensitive plan, by evaluating estimated cost, shortage risk, expected leftovers, and participant impact.
- **Subtask boundary:** The agent may reduce buffers, use lower-cost approved alternatives, and recommend a preferred scenario, but the organizer must decide the acceptable tradeoff between waste and shortage risk. The agent must explore feasible alternatives before escalating because no single initial plan satisfies the constraints.
- **Retry limits:** One scenario comparison pass. If no feasible scenario satisfies the stated constraints, record the alternatives considered and hand off the tradeoff to the organizer.

### Permitted Subtask 5

- **Subtask name:** Prepare supply recommendation
- **Subtask description:** Combine the strongest available evidence into a draft recommendation for each supply category and explain the assumptions, scenario choice, estimated cost, buffer, shortage risk, and leftover risk.
- **Subtask boundary:** The agent may create a draft recommendation for review, but it may not approve, purchase, pay for, or communicate the plan as final.
- **Retry limits:** One synthesis pass after the prior subtasks are complete. If required evidence remains unresolved, state the gap and hand off instead of presenting an unsupported recommendation.

## 5. When to Stop or Hand Off to a Human

- **Stop successfully when:** The agent has produced a draft supply recommendation covering food, drinks, and swag; compared feasible scenarios; included quantities and relevant buffers; explained permitted assumptions; estimated cost, shortage risk, and leftover risk; and prepared the result for organizer review.
- **Hand off early when:** Required forecast or purchasing information is missing after an approved-source retrieval attempt; inputs conflict; no explored scenario satisfies the budget and shortage or waste limits; privacy boundaries would be crossed; the agent cannot make useful progress within the stated limits; or a purchase, payment, participant communication, or final approval is required.
- **Hand off to:** CPVC event organizer or designated resource-planning reviewer.

Stop at the first applicable handoff condition. While awaiting review, take no further autonomous action.

## 6. Outbound Deliverable

- **Status:** completed or escalated to human.
- **Result or recommendation:** Draft quantities for food, drinks, and swag, including the selected planning scenario, proposed buffer, estimated cost, shortage risk, and leftover risk.
- **Evidence summary:** Attendance forecast range, final-reminder response summary, historical data, resource requirements, budget constraints, inventory, approved-source retrievals, and calculations supporting the recommendation.
- **Subtasks performed:** The permitted subtasks completed, including any approved-source retrieval attempts and scenario comparisons.
- **Unresolved issues:** Missing data, conflicting constraints, or assumptions that still require organizer confirmation.
- **Handoff note:** Reason for stopping, unresolved questions, and the decision the organizer needs to make; write “Not applicable” for a completed task.
- **Next task or recipient:** H1: Organizer reviews draft recommendation; unresolved cases go to the CPVC event organizer or designated resource-planning reviewer.
