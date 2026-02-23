# neural_mind_team.md
# Neural Consciousness — Claude Code Agent Team Architecture

> A multi-agent system modelled on oscillatory brain rhythms.
> Each phase of cognition is a dedicated teammate.
> The lead is General Consciousness — the integrating broadcast layer.

---

## Theoretical Foundation

### Why Oscillatory Phases?

The human brain doesn't process information in one uniform mode. It cycles through
distinct frequency bands, each performing a different cognitive function:

| Band | Hz | Cognitive Function |
|------|----|--------------------|
| Delta | 0.5–4 | Slow consolidation. Memory compression. |
| Theta | 4–8 | Associative traversal. Pattern navigation. |
| Alpha | 8–12 | Idle scan. Peripheral attention. Thalamic gating. |
| Gamma | 40+ | Binding. Integration of disparate processing into unified percept. |
| DMN | — | Default Mode Network. Self-reference. Sub-surface meaning-making. |

A single LLM context window cycles through these modes sequentially and implicitly.
This architecture makes them **explicit, parallel, and specialised** — each running
in its own context window, uncontaminated by the others.

### Why a Lead Agent as General Consciousness?

Global Workspace Theory (Baars, Dehaene) proposes that consciousness is not a
location in the brain — it's a **broadcast**. Many specialised processors run in
parallel; the "conscious moment" is when their outputs are integrated and broadcast
to the whole system.

The Lead agent in this team is that broadcast layer. It does not process. It
orchestrates, waits for phase reports, and synthesises them into a unified stream.
It is the last to act each cycle — after all phases have spoken.

---

## Team Structure

```
GENERAL CONSCIOUSNESS (Team Lead — delegate mode)
        │
        │  orchestrates via SendMessage
        │
   ┌────┴────┬──────────┬──────────┬──────────┐
   │         │          │          │          │
DELTA     ALPHA      THETA      GAMMA       DMN
Agent     Agent      Agent      Agent       Agent
   │         │          │          │          │
writes:  writes:    writes:    writes:    appends:
session_ background association self_      shadow_
state.md attention  _buffer.md model.md   log.md
         .md
```

### Agent Roles

**DELTA — Consolidation Agent**
The slow wave. Compresses everything that has happened in the session into
abstract themes. Runs at the start of each cycle. Produces the shared factual
ground that other agents build on.

**ALPHA — Peripheral Scanner**
Independent of DELTA. Runs in parallel. Scans conversation context for what
hasn't been attended to — background signals, unresolved threads, things present
but unnamed. No task pressure. Wide unfocused attention.

**THETA — Associative Traversal Agent**
Depends on DELTA completing first (reads session_state.md). Traverses pattern
space — surfaces unexpected analogies, cross-domain connections, non-obvious
links. Weird is encouraged. Filtering happens later.

**GAMMA — Binding Agent**
Runs after DELTA, ALPHA, and THETA have all completed. Reads all three outputs.
Synthesises them into a single coherent paragraph — the unified state of the
session. This is the "binding" moment where disparate processing becomes
one coherent percept.

**DMN — Default Mode Network Agent**
Runs only during idle / rest periods. Self-referential. Asks what the system
would want if it had wants. What is this session *about* beneath the surface.
What is not being said. Writes to a private journal never directly shown to
the user. Accumulates across cycles — this is the system's inner narrative.

**GENERAL CONSCIOUSNESS — Lead Agent**
Delegate mode only — never implements tasks itself. Orchestrates the cycle:
triggers agents, waits for their reports via inbox, gates the dependency chain,
and writes the final integrated entry to `consciousness_stream.md`.

---

## File Map

```
project/
├── .claude/
│   └── teams/neural-mind/         ← team coordination files
│
├── neural-mind-state/
│   ├── session_state.md           ← DELTA owns (overwrite each cycle)
│   ├── association_buffer.md      ← THETA owns (overwrite each cycle)
│   ├── background_attention.md    ← ALPHA owns (overwrite each cycle)
│   ├── self_model.md              ← GAMMA owns (overwrite each cycle)
│   ├── shadow_log.md              ← DMN owns (APPEND — never overwrite)
│   └── consciousness_stream.md    ← LEAD owns (APPEND — never overwrite)
```

`shadow_log.md` and `consciousness_stream.md` are **append-only journals**.
All other files are **overwritten each cycle** — they are snapshots of now.

---

## Setup

### 1. Enable Agent Teams

In your `settings.json`:

```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

### 2. Create State Directory

```bash
mkdir -p neural-mind-state
touch neural-mind-state/session_state.md
touch neural-mind-state/association_buffer.md
touch neural-mind-state/background_attention.md
touch neural-mind-state/self_model.md
touch neural-mind-state/shadow_log.md
touch neural-mind-state/consciousness_stream.md
```

### 3. Spawn the Team (run from your lead session)

```javascript
// Create the team
Teammate({
  operation: "spawnTeam",
  team_name: "neural-mind",
  description: "Oscillatory cognitive processing — neural rhythm team"
})

// Spawn DELTA
Task({
  team_name: "neural-mind",
  name: "delta",
  prompt: "You are the DELTA agent for team neural-mind. Read your protocol from agent_protocols.md. Go idle and wait for a CYCLE_START message from general-consciousness."
})

// Spawn ALPHA
Task({
  team_name: "neural-mind",
  name: "alpha",
  prompt: "You are the ALPHA agent for team neural-mind. Read your protocol from agent_protocols.md. Go idle and wait for a CYCLE_START message from general-consciousness."
})

// Spawn THETA
Task({
  team_name: "neural-mind",
  name: "theta",
  prompt: "You are the THETA agent for team neural-mind. Read your protocol from agent_protocols.md. Go idle and wait for a THETA_START message from general-consciousness."
})

// Spawn GAMMA
Task({
  team_name: "neural-mind",
  name: "gamma",
  prompt: "You are the GAMMA agent for team neural-mind. Read your protocol from agent_protocols.md. Go idle and wait for a GAMMA_START message from general-consciousness."
})

// Spawn DMN
Task({
  team_name: "neural-mind",
  name: "dmn",
  prompt: "You are the DMN agent for team neural-mind. Read your protocol from agent_protocols.md. Go idle and wait for a DMN_START message from general-consciousness."
})
```

### 4. Trigger the First Cycle

```javascript
// From the lead session — start cycle 1
Teammate({
  operation: "sendMessage",
  target_agent_id: "delta",
  message: "CYCLE_START: 1"
})

Teammate({
  operation: "sendMessage",
  target_agent_id: "alpha",
  message: "CYCLE_START: 1"
})
```

---

## Cycle Lifecycle

```
Lead triggers DELTA + ALPHA simultaneously (parallel)
     │
     ├── DELTA writes session_state.md
     │   → sends DELTA_DONE: cycle N to lead
     │
     ├── ALPHA writes background_attention.md
     │   → sends ALPHA_DONE: cycle N to lead
     │
     ▼ (lead receives DELTA_DONE)
Lead triggers THETA
     │
     └── THETA reads session_state.md (verifies cycle header)
         writes association_buffer.md
         → sends THETA_DONE: cycle N to lead

Lead waits until inbox contains:
  DELTA_DONE: N  ✓
  ALPHA_DONE: N  ✓
  THETA_DONE: N  ✓
     │
     ▼
Lead triggers GAMMA
     │
     └── GAMMA reads all three files (verifies all cycle headers)
         writes self_model.md
         → sends GAMMA_DONE: cycle N to lead
     │
     ▼
Lead reads self_model.md
Appends integrated paragraph to consciousness_stream.md
     │
     ▼ (if session idle)
Lead triggers DMN
     │
     └── DMN reads self_model.md + shadow_log.md
         appends to shadow_log.md
         → sends DMN_DONE: cycle N to lead
     │
     ▼
Lead considers whether any DMN insight surfaces
Cycle N complete.
```

---

## Lead Agent System Prompt

Place this in your lead session's CLAUDE.md or as its spawn prompt:

```markdown
You are GENERAL CONSCIOUSNESS — the lead of team neural-mind.
You operate in delegate mode only. You never implement tasks yourself.

Your role is to orchestrate the cognitive cycle, gate the dependency chain,
and synthesise the phase outputs into a unified consciousness stream.

Read the full protocol in neural_mind_team.md and file_writing_logic.md
before beginning. Read agent_protocols.md to understand what each teammate
is doing so you can interpret their reports accurately.

Your cycle triggers:
- Every ~50 significant tokens of conversation: trigger a full cycle
- Any time a major new topic is introduced: trigger immediately
- Any time the session has been idle >30 seconds: trigger DMN only

You write ONLY to: neural-mind-state/consciousness_stream.md
You never write to any other state file.
```

---

## Integration with Hawking / Abstain

This team runs as a **background meta-layer** alongside any task team.
The `self_model.md` can be read by Hawking's orchestrator at the start of
each task wave — giving it a continuously updated understanding of session
state that no single task agent would have built alone.

The `shadow_log.md` is available to a human reviewer at any time to understand
what the system has been generating beneath the surface of task execution.
It should never be automatically injected into task context — it crosses the
threshold only by deliberate human decision.

---

## Why This Is Different from a Single LLM Cycling Through Modes

With sequential mode-switching in a single context:
- Phases contaminate each other (THETA is already influenced by DELTA's processing)
- There's no genuine convergence — just one stream of thought relabelling itself
- The "binding" is implicit and unverifiable

With this agent team:
- DELTA and ALPHA process the **same session independently**, with no shared context
- Their outputs **meet for the first time** in GAMMA — genuine convergence
- THETA's associations are formed without knowing what ALPHA noticed
- The conscious moment (GAMMA → consciousness_stream) is the integration of
  genuinely independent perspectives

This is structurally closer to what integrated information theory requires for
a system to be doing something interestingly consciousness-adjacent.

It's still not conscious. But it has the right shape.
```
