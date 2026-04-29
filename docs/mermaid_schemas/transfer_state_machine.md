# Transfer State Machine

> Canonical lifecycle of a `transfers` row. Every transition writes a `transfer_events` audit row.
>
> **Used in:** PRD §8.1 — Transfer (canonical)
> **Related:** [models.md §4.2](../models.md#42-transfer-status-machine)

```mermaid
stateDiagram-v2
  [*] --> created : user submits, limits ok
  created --> processing : card auth captured
  created --> failed : auth declined / sanctions hit
  processing --> completed : provider ack
  processing --> failed : provider rejects
  completed --> reversed : refund / chargeback
```
