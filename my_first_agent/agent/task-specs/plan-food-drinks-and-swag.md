# Plan Food, Drinks, and Swag Task Specification

```yaml
# BASIC INFORMATION
task_id: T9
task_name: Plan Food, Drinks, and Swag
task_owner: CPVC event organizer
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
