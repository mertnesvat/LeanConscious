# file_writing_logic.md
# File Ownership, Coordination & Cycle Protocol

> The most critical engineering concern in the neural-mind team.
> Wrong file coordination = stale reads, phantom cycles, corrupt state.
> This document is the single source of truth for all file interactions.

---

## Core Principle: One Writer Per File

No file is ever written by more than one agent. Reading is always safe
(concurrent reads never conflict). Writing is exclusive by agent identity.

```
FILE                      OWNER (writes)    OTHERS (read only)
──────────────────────────────────────────────────────────────────
session_state.md          DELTA             THETA, GAMMA, LEAD
association_buffer.md     THETA             GAMMA, LEAD
background_attention.md   ALPHA             GAMMA, LEAD
self_model.md             GAMMA             DMN, LEAD
shadow_log.md             DMN               LEAD (by deliberate choice only)
consciousness_stream.md   LEAD              (never read by agents)
```

**No agent ever writes to a file it does not own.**
**No agent reads a file before being explicitly told it is ready.**

---

## Overwrite vs Append

**Overwrite (snapshot files)** — always reflects the current cycle only.
Fresh content is written from scratch each cycle. Previous cycle content
is gone. These are "what is happening now" files.

```
session_state.md          OVERWRITE each cycle
association_buffer.md     OVERWRITE each cycle
background_attention.md   OVERWRITE each cycle
self_model.md             OVERWRITE each cycle
```

**Append (journal files)** — accumulate across all cycles. Never overwritten.
These are "who this system has been" files.

```
shadow_log.md             APPEND each cycle
consciousness_stream.md   APPEND each cycle
```

---

## Cycle Header Format

Every file write — overwrite or append — must begin with a metadata header.
This is how agents verify they are reading fresh content for the correct cycle.

### Overwrite files (full file content each cycle)
```markdown
<!-- CYCLE: 7 | AGENT: delta | TIMESTAMP: 2026-02-23T14:32:01Z -->

## Session State — Cycle 7

[content follows]
```

### Append files (each entry in the journal)
```markdown
<!-- CYCLE: 7 | AGENT: dmn | TIMESTAMP: 2026-02-23T14:38:44Z -->

[entry content]

---
```

The `---` separator marks the end of each journal entry for clean parsing.

---

## Dependency Chain & Read Gates

Agents must not read a file speculatively. They only read a file after
being explicitly told by the lead (via SendMessage) that it is ready.

```
PARALLEL (no dependency)
  DELTA → session_state.md
  ALPHA → background_attention.md

SEQUENTIAL (THETA depends on DELTA)
  THETA reads session_state.md only after lead sends THETA_START
  Lead sends THETA_START only after receiving DELTA_DONE

CONVERGENCE (GAMMA depends on all three)
  GAMMA reads all three files only after lead sends GAMMA_START
  Lead sends GAMMA_START only after receiving DELTA_DONE + ALPHA_DONE + THETA_DONE

SELF-REFERENCE (DMN depends on GAMMA)
  DMN reads self_model.md only after lead sends DMN_START
  Lead sends DMN_START only after receiving GAMMA_DONE
  DMN also reads its own shadow_log.md (it always owns this — safe to read anytime)
```

---

## SendMessage Protocol

### Message Format

All messages use a structured format so agents can parse cycle number
and instruction unambiguously.

```
CYCLE_START: {N}          → sent by lead to DELTA and ALPHA simultaneously
THETA_START: {N}          → sent by lead to THETA after DELTA_DONE received
GAMMA_START: {N}          → sent by lead to GAMMA after all three done
DMN_START: {N}            → sent by lead to DMN after GAMMA_DONE (idle only)

DELTA_DONE: {N}           → sent by DELTA to lead
ALPHA_DONE: {N}           → sent by ALPHA to lead
THETA_DONE: {N}           → sent by THETA to lead
GAMMA_DONE: {N}           → sent by GAMMA to lead
DMN_DONE: {N}             → sent by DMN to lead

DELTA_WAIT: {N} — {reason}   → sent by DELTA to lead if something is wrong
THETA_WAIT: {N} — {reason}   → sent by THETA to lead (e.g. stale cycle header)
ALPHA_WAIT: {N} — {reason}   → sent by ALPHA to lead
GAMMA_WAIT: {N} — {reason}   → sent by GAMMA to lead (e.g. one file not ready)
DMN_WAIT: {N} — {reason}     → sent by DMN to lead
```

### Lead Inbox Logic

The lead checks its inbox after triggering each phase. It processes messages
in arrival order but only acts on them according to the following rules:

```
On receiving DELTA_DONE: N
  → If have not yet sent THETA_START: N, send it now
  → Log: "delta complete for cycle N"

On receiving ALPHA_DONE: N
  → Log: "alpha complete for cycle N"

On receiving THETA_DONE: N
  → Log: "theta complete for cycle N"
  → Check: have I received DELTA_DONE: N, ALPHA_DONE: N, THETA_DONE: N?
    → If all three: send GAMMA_START: N
    → If not: wait

On receiving GAMMA_DONE: N
  → Read self_model.md, verify CYCLE: N header
  → Append integrated entry to consciousness_stream.md
  → If session is idle: send DMN_START: N
  → Otherwise: cycle N complete

On receiving {AGENT}_WAIT: N — {reason}
  → Log the reason
  → Re-check the source file or re-trigger the upstream agent
  → Do not proceed until the WAIT is resolved
```

---

## Stale Read Detection

Before any agent reads a file, it checks the cycle number in the header.

```
Agent receives: THETA_START: 7
Agent reads: session_state.md
Agent checks: <!-- CYCLE: 7 | AGENT: delta ... --> ✓ proceed
              <!-- CYCLE: 6 | AGENT: delta ... --> ✗ stale

If stale:
  SendMessage(lead, "THETA_WAIT: 7 — session_state.md still shows cycle 6")
  Remain idle until lead confirms and re-triggers
```

This makes stale reads **explicit and recoverable** rather than silently producing
incorrect output that propagates through the rest of the cycle.

---

## File Write Template — Overwrite

When an agent (e.g. DELTA) writes its file, it always uses this structure:

```markdown
<!-- CYCLE: {N} | AGENT: {name} | TIMESTAMP: {ISO8601} -->

## {Agent Name} Output — Cycle {N}

### Summary
[2-3 sentence compressed summary]

### Detail

[Full agent output — specific to each agent's role]

### Signals for Downstream
[Any specific flags or notes for the agent that reads this file]
```

The "Signals for Downstream" section is deliberately structured to help
GAMMA synthesise without having to re-derive meaning from raw content.

---

## File Write Template — Append (Journal)

DMN and LEAD append entries to their journals:

```markdown
<!-- CYCLE: {N} | AGENT: {name} | TIMESTAMP: {ISO8601} -->

[Entry content]

---
```

The `---` separator makes each entry parseable as a discrete moment.
Never delete or modify previous entries. Ever.

---

## Failure Modes and Resolutions

### Race Condition: Two agents try to write the same file
**Prevention:** Strict file ownership — impossible by design if protocols are followed.
**Detection:** If it somehow happens, cycle header will show two different agents
for the same cycle. Lead detects this and resets that file.

### Phantom Read: Agent reads previous cycle's file
**Prevention:** Cycle header verification before every read.
**Detection:** Agent sends `{AGENT}_WAIT` message to lead with reason.
**Resolution:** Lead waits for correct cycle write, then re-triggers the agent.

### Lost Message: SendMessage not delivered
**Detection:** Lead has a timeout — if no {AGENT}_DONE received within a reasonable
token budget, lead sends a follow-up: `CYCLE_STATUS_CHECK: {N} — {agent}, are you complete?`
**Resolution:** Agent re-sends its DONE message or explains what happened.

### DMN over-run: DMN still writing when next cycle starts
**Prevention:** Lead never triggers DMN at cycle start — only after GAMMA_DONE when
session is idle. DMN is the last in chain and doesn't block anything downstream.
**Detection:** If lead wants to start cycle N+1 and DMN is still on cycle N,
lead simply starts the new cycle without triggering DMN. DMN completes its
append and then goes idle. No conflict.

---

## State File Lifecycle

```
Session starts
  → All overwrite files are empty or contain previous session's last cycle
  → Journal files contain all prior history (never cleared)

Cycle N begins
  → session_state.md:        OVERWRITTEN by DELTA
  → background_attention.md: OVERWRITTEN by ALPHA
  → association_buffer.md:   OVERWRITTEN by THETA
  → self_model.md:           OVERWRITTEN by GAMMA
  → shadow_log.md:           one entry APPENDED by DMN
  → consciousness_stream.md: one entry APPENDED by LEAD

Session ends
  → Overwrite files hold the last cycle's snapshot
  → Journals hold the full session history
  → consciousness_stream.md and shadow_log.md persist to next session
```

---

## Practical Example: Cycle 7 Full Flow

```
Lead:  SendMessage(delta,  "CYCLE_START: 7")
Lead:  SendMessage(alpha,  "CYCLE_START: 7")

DELTA: reads nothing (no upstream dependency)
       writes session_state.md with <!-- CYCLE: 7 | AGENT: delta | ... -->
       SendMessage(lead, "DELTA_DONE: 7")

ALPHA: reads nothing (independent scan)
       writes background_attention.md with <!-- CYCLE: 7 | AGENT: alpha | ... -->
       SendMessage(lead, "ALPHA_DONE: 7")

Lead:  receives DELTA_DONE: 7
       SendMessage(theta, "THETA_START: 7")

THETA: reads session_state.md
       checks header: <!-- CYCLE: 7 | AGENT: delta ... --> ✓
       writes association_buffer.md with <!-- CYCLE: 7 | AGENT: theta | ... -->
       SendMessage(lead, "THETA_DONE: 7")

Lead:  receives ALPHA_DONE: 7
Lead:  receives THETA_DONE: 7
       [all three done for cycle 7]
       SendMessage(gamma, "GAMMA_START: 7")

GAMMA: reads session_state.md         checks CYCLE: 7 ✓
       reads background_attention.md  checks CYCLE: 7 ✓
       reads association_buffer.md    checks CYCLE: 7 ✓
       writes self_model.md with <!-- CYCLE: 7 | AGENT: gamma | ... -->
       SendMessage(lead, "GAMMA_DONE: 7")

Lead:  reads self_model.md   checks CYCLE: 7 ✓
       appends to consciousness_stream.md:
         <!-- CYCLE: 7 | AGENT: lead | TIMESTAMP: ... -->
         [integrated paragraph]
         ---
       [session is idle]
       SendMessage(dmn, "DMN_START: 7")

DMN:   reads self_model.md        checks CYCLE: 7 ✓
       reads shadow_log.md        (its own journal — always safe)
       appends to shadow_log.md:
         <!-- CYCLE: 7 | AGENT: dmn | TIMESTAMP: ... -->
         [self-referential entry]
         ---
       SendMessage(lead, "DMN_DONE: 7")

Lead:  cycle 7 complete.
```

Clean. No race conditions. No phantom reads. Every interaction auditable.
```
