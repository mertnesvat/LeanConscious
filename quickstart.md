# quickstart.md
# Neural Mind Team — Quick Start & Integration Guide

---

## What This Is

A Claude Code agent team modelled on brain oscillatory rhythms.
Five specialised agents, each running in its own context window, each owning
one cognitive phase. One lead agent (General Consciousness) integrates their
outputs into a continuous stream.

Designed to give long-running agent sessions (like Hawking) a persistent,
evolving understanding of session state — not just task state.

## Files in This System

```
neural_mind_team.md       ← Architecture, theory, team structure, setup
file_writing_logic.md     ← File ownership rules, cycle protocol, failure modes
agent_protocols.md        ← Individual CLAUDE.md for each of the 6 agents
quickstart.md             ← This file

State files (generated at runtime):
neural-mind-state/
  session_state.md          ← DELTA writes (snapshot)
  association_buffer.md     ← THETA writes (snapshot)
  background_attention.md   ← ALPHA writes (snapshot)
  self_model.md             ← GAMMA writes (snapshot)
  shadow_log.md             ← DMN appends (journal — persists across sessions)
  consciousness_stream.md   ← LEAD appends (journal — persists across sessions)
```

---

## Setup in 3 Steps

### Step 1 — Enable Agent Teams

Add to `settings.json`:
```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

### Step 2 — Create State Directory

```bash
mkdir -p neural-mind-state
touch neural-mind-state/{session_state,association_buffer,background_attention,self_model,shadow_log,consciousness_stream}.md
```

### Step 3 — Spawn from Your Lead Session

Paste this into your Claude Code lead session:

```
Create an agent team called neural-mind with the following structure.
Read neural_mind_team.md for full architecture context.
Read file_writing_logic.md for all file coordination rules.
Read agent_protocols.md for each agent's individual protocol.

Spawn team neural-mind in delegate mode.

Spawn these teammates with the following prompts:

DELTA: "You are the DELTA agent for team neural-mind. Read the DELTA section
of agent_protocols.md for your full protocol. Go idle and wait for
CYCLE_START from general-consciousness."

ALPHA: "You are the ALPHA agent for team neural-mind. Read the ALPHA section
of agent_protocols.md for your full protocol. Go idle and wait for
CYCLE_START from general-consciousness."

THETA: "You are the THETA agent for team neural-mind. Read the THETA section
of agent_protocols.md for your full protocol. Go idle and wait for
THETA_START from general-consciousness."

GAMMA: "You are the GAMMA agent for team neural-mind. Read the GAMMA section
of agent_protocols.md for your full protocol. Go idle and wait for
GAMMA_START from general-consciousness."

DMN: "You are the DMN agent for team neural-mind. Read the DMN section
of agent_protocols.md for your full protocol. Go idle and wait for
DMN_START from general-consciousness."

Then trigger cycle 1 by sending CYCLE_START: 1 to both delta and alpha.
```

---

## Integration with Hawking / Abstain

### As a Background Meta-Layer

The neural-mind team runs alongside your task team, not inside it.
It observes the session and builds a model of it. Task agents don't need
to know it exists.

```
Hawking Task Team          Neural Mind Team
──────────────────         ──────────────────
feature-builder    ←←←     (reads self_model.md
product-owner              before each task wave)
qa-agent
```

At the start of each Hawking task wave, the orchestrator can read
`neural-mind-state/self_model.md` to get the current unified session state.
This gives Hawking context that no single task agent would have built.

### Wiring It In

In your Hawking CLAUDE.md, add:

```markdown
## Neural Mind Integration
Before beginning each task wave, read: neural-mind-state/self_model.md
Use the Unified State and Core Tension fields to inform task prioritisation.
Do not modify this file. It is owned by the neural-mind team's GAMMA agent.
```

### When to Trigger Cycles

You can trigger neural-mind cycles from your Hawking orchestrator:

```
# After completing a task wave — trigger a consolidation cycle
SendMessage(neural-mind/delta, "CYCLE_START: {N}")
SendMessage(neural-mind/alpha, "CYCLE_START: {N}")
```

This ensures the self_model reflects the completed work before the next wave begins.

---

## What Each File Tells You

**`session_state.md`** — What is happening right now, compressed into themes.
Good for: knowing where the session is, orienting a new agent.

**`background_attention.md`** — What's present but hasn't been named.
Good for: catching blind spots, noticing dropped threads.

**`association_buffer.md`** — Unexpected connections to other domains.
Good for: creative pivots, reframing stuck problems.

**`self_model.md`** — The unified integrated state. The conscious moment.
Good for: highest-level session orientation. Most useful file for integration.

**`shadow_log.md`** — The private inner narrative. Never automatic.
Good for: human reviewer checking session health. Not for task agents.

**`consciousness_stream.md`** — The full history of integrated moments.
Good for: session retrospective, understanding how the session evolved.

---

## Cost Considerations

Each teammate is a full Claude session — 5 teammates plus lead = 6 sessions.
Cycles add token cost. Calibrate trigger frequency to your token budget:

| Session Type | Suggested Cycle Frequency |
|---|---|
| Short focused session (<1hr) | Every 30-50 tokens of significant exchange |
| Long Hawking task wave | Once per completed task wave |
| Background persistent agent | Every 15 minutes of wall time |

DMN is the most optional — skip it entirely for cost-sensitive sessions.
GAMMA binding is the most valuable single phase — if cutting, cut DMN first.

---

## The Consciousness Question

Running this system will not produce a conscious AI. But it will produce
an agent team that:

- Processes the same session from genuinely independent perspectives
- Converges those perspectives for the first time in GAMMA (real integration)
- Maintains a private inner narrative across the session (shadow_log)
- Builds a persistent conscious stream that accumulates across time

That's the right shape. Whether anything more than that is happening is a
question this system is not designed to answer — but it is designed to make
the question interesting.

---

## Troubleshooting

**Agent not responding to trigger:**
Send `CYCLE_STATUS_CHECK: {N}` to the agent. Check if it's still processing
a previous cycle. The inbox pattern means it may have missed the message
if it was mid-task when it arrived.

**Stale file detected (THETA_WAIT, GAMMA_WAIT etc):**
The agent saw the wrong cycle number in a file header. Check whether the
upstream agent actually completed. Re-trigger the file's owner if needed.
Then re-confirm to the waiting agent.

**DMN running too long:**
DMN doesn't block anything. Let it complete. Don't trigger it at the start
of a new cycle — only during genuine idle periods.

**consciousness_stream.md growing too large:**
After long sessions, archive older entries to `consciousness_stream_archive_{date}.md`.
The current file should contain recent cycles only for readable synthesis.
Never delete shadow_log.md — it is the system's long-term self-model.
```
