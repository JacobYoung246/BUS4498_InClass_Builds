# About the Agentic System

**A Hackathon Registration and Attendance Planning Agent**

> **Problem to be solved**: The Cal Poly Vibe Coding Club (CPVC) is planning a campus-wide AI Hackathon event for students. Participants register before the event, but not everyone who registers will actually attend. Some participants may change their plans without canceling, while others may remain unsure until shortly before the event. The attendance-to-registration rate of CPVC's last build event was roughly at 40%. Because registration totals do not accurately represent actual attendance, CPVC organizers have difficulty deciding how much food, how many drinks, and how much event swag to prepare. Planning for too many attendees wastes the club’s limited budget. Planning for too few may leave participants without adequate food or materials and negatively affect their event experience. CPVC currently relies mainly on the number of registrations and the organizers’ personal judgment. The club needs a more reliable and manageable way to anticipate actual attendance while respecting participants’ privacy and avoiding excessive communication.

### System Designer Name

Jacob Young

### System Name

HackTrack

### System Goal

For CPVC event organizers, produce an evidence-based draft plan for food, drinks, and swag that uses registration and voluntary attendance responses to keep recommended quantities within the organizer-provided budget and acceptable shortage-risk threshold. The historical attendance-to-registration rate is approximately 40%; the target is for the forecast range to contain actual attendance for at least 80% of events while the approved resource plan remains within budget.

The system boundary is that HackTrack may use only event-level and aggregate registration, response, inventory, pricing, and historical outcome data supplied by CPVC or an approved planning source. It may send no more than two concise reminders, may not collect or infer sensitive personal information, and may not approve purchases, place orders, make payments, or treat a forecast as a confirmed attendance count.

### Who Is Better Off When This Works?

CPVC will be better off because organizers will receive a defensible resource recommendation before purchasing and can balance shortage risk, leftover risk, and budget constraints using the best available attendance evidence.
