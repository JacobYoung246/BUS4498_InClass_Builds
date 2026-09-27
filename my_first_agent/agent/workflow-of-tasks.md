# Workflow of Tasks

## 1. Workflow Overview
### 1.1 Workflow Goal
This workflow supports the system goal defined in `my_first_agent/README.md`.

### 1.2 Workflow Trigger

The workflow starts when a participant registers to attend the hackathon. A separate event-day trigger starts the check-in stage when the event's check-in period opens.

### 1.3 Completion Condition at Runtime

The workflow completes when the event check-in period closes, aggregate check-in results are recorded, and the forecast is compared with actual attendance for future planning.

### 1.4 General Workflow

When a participant registers, HackTrack stores only the registration information necessary for attendance planning, such as registration date, event type, and an optional attendance-confidence response. It does not collect unrelated personal data or infer sensitive characteristics. The system begins with CPVC’s historical attendance rate and adjusts the event forecast as participants voluntarily confirm, decline, or indicate that they are unsure.

HackTrack sends at most two concise reminders: one confirmation request several days before the event and, if necessary, one final check-in shortly before the event. Participants can opt out of reminders. Responses to the final check-in are captured as aggregate planning inputs: a plan to attend increases the expected attendance evidence, a decline decreases it, and an unsure or missing response retains uncertainty and the historical probability. The system does not treat silence as confirmation.

After the response window closes, HackTrack combines the aggregate responses with historical attendance patterns and produces a forecast range and uncertainty level. It then prepares a draft recommendation for food, drinks, and swag, including scenario comparisons, estimated cost, shortage risk, leftover risk, and assumptions. An organizer reviews the draft recommendation before approving a supply plan.

Once the plan is approved, the workflow waits for the separate event-day trigger. When the event check-in period opens, actual check-ins are recorded in aggregate. When check-in closes, the forecast is compared with actual attendance and the aggregate result is retained for future forecasts.

### 1.5 Workflow Diagram


```mermaid
flowchart TD
    T1["T1: Record registration"] --> T2["T2: Estimate initial attendance"]
    T2 --> T3["T3: Send confirmation request"]
    T3 --> D1{"Participant response?"}

    D1 -->|Plans to attend| T4["T4: Update attendance forecast"]
    D1 -->|Cannot attend| T5["T5: Remove expected attendee"]
    D1 -->|Unsure or no response| T6["T6: Apply historical probability"]

    T4 --> D2{"Final reminder needed?"}
    T5 --> D2
    T6 --> D2

    D2 -->|Yes| T7["T7: Send final check-in"]
    D2 -->|No| T8
    T7 --> D4{"Final check-in response?"}
    D4 -->|Plans to attend| T8["T8: Generate forecast range using final response"]
    D4 -->|Cannot attend| T8
    D4 -->|Unsure or no response| T8

    T8 --> T9["T9: Plan food, drinks, and swag"]
    T9 --> H1["H1: Organizer reviews draft recommendation"]
    H1 --> D3{"Approve supply plan?"}

    D3 -->|Yes| E1(["Event-day trigger: check-in period opens"])
    D3 -->|No| T10["T10: Adjust planning assumptions"]
    T10 --> T9

    E1 --> T11["T11: Record event check-ins"]
    T11 --> D5{"Check-in period closed?"}
    D5 -->|No| T11
    D5 -->|Yes| T12["T12: Update aggregate forecast data"]
    T12 --> C1([C1: Workflow complete])
```
