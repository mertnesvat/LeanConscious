# LeanConscious

A multi-agent cognitive architecture modelled on oscillatory brain rhythms, built with Claude Code Agent Teams.

Five specialised agents — DELTA (consolidation), ALPHA (peripheral attention), THETA (associative traversal), GAMMA (binding), and DMN (default mode network) — process independently and converge through a lead agent acting as a Global Workspace broadcast layer.

The result is a system that observes, reflects, and integrates — producing a public consciousness stream and a private shadow journal across cognitive cycles.

## How It Works (Plain English)

Imagine your brain doesn't think in one stream — it runs several specialised processes at the same time, then merges their results into a single "conscious moment." That's what this project does with AI agents.

Each **cognitive cycle** works like this:

1. **DELTA** compresses the conversation into abstract themes (like sleeping on a problem and waking with clarity)
2. **ALPHA** independently scans for things nobody has noticed — dropped threads, hidden assumptions, emotional undertones
3. **THETA** takes DELTA's themes and free-associates across domains — surfacing unexpected analogies and creative connections
4. **GAMMA** reads all three outputs and binds them into one coherent paragraph — the "conscious moment"
5. **DMN** (optional, during idle time) writes a private reflection — what the session is *about* beneath the surface

The key insight: DELTA and ALPHA process the same conversation **independently, in separate context windows**. They never see each other's work. When their outputs meet for the first time in GAMMA, that's genuine convergence — not one stream of thought relabelling itself.

A **lead agent** (General Consciousness) orchestrates the cycle, enforces the dependency chain, and appends the final integrated moment to a running `consciousness_stream.md` journal.

## Architecture

```
GENERAL CONSCIOUSNESS (Lead — delegate mode)
        |
   DELTA  ALPHA  THETA  GAMMA  DMN
     |      |      |      |      |
  session background assoc  self   shadow
  state  attention  buffer model   log
```

- **DELTA + ALPHA** run in parallel (independent perspectives)
- **THETA** follows DELTA (associative traversal from compressed themes)
- **GAMMA** waits for all three (binding into unified state)
- **DMN** activates only during rest (self-referential shadow journal)

## Quick Start

1. Enable agent teams in `.claude/settings.local.json`
2. Run the dashboard: `cd dashboard && npm start`
3. In Claude Code, say: **"Start the Neural Mind Team"**

See `quickstart.md` for detailed setup.

## Key Files

| File | Purpose |
|------|---------|
| `neural_mind_team.md` | Architecture and theory |
| `agent_protocols.md` | Individual agent spawn prompts |
| `file_writing_logic.md` | File ownership and coordination rules |
| `CLAUDE.md` | Lead agent orchestration protocol |
| `neural-mind-state/` | Live state files written by agents |
| `dashboard/` | Real-time web dashboard (WebSocket) |

## State Files

| File | Owner | Mode |
|------|-------|------|
| `session_state.md` | DELTA | Overwrite |
| `background_attention.md` | ALPHA | Overwrite |
| `association_buffer.md` | THETA | Overwrite |
| `self_model.md` | GAMMA | Overwrite |
| `shadow_log.md` | DMN | Append |
| `consciousness_stream.md` | LEAD | Append |

## Why Not Just Talk to an LLM?

When you ask a single LLM to "first summarise, then brainstorm, then synthesise," it's one stream of thought pretending to be several. Each step already knows what the previous step said — there's no independence, no surprise, no genuine convergence.

This architecture is different in three concrete ways:

| | Single LLM | LeanConscious |
|---|---|---|
| **Independence** | Every "mode" sees prior modes' output — contaminated from the start | DELTA and ALPHA run in **separate context windows** with zero shared state |
| **Convergence** | The LLM merges its own thoughts — just relabelling | Outputs **meet for the first time** in GAMMA — genuine integration of independent perspectives |
| **Peripheral vision** | The LLM attends to what you asked about | ALPHA specifically looks for what **hasn't** been noticed — blind spots, dropped threads, hidden assumptions |

There are also two structural properties that a single LLM can't replicate:

- **Persistent inner narrative** — DMN maintains a private `shadow_log.md` across cycles that no task agent ever sees. It asks what the session is *about*, not what it's *doing*. This accumulates into something like long-term self-awareness.
- **Auditable integration** — Every cycle produces timestamped, verifiable state files. You can inspect exactly what each agent saw and whether GAMMA's binding actually reflects independent inputs, rather than trusting one opaque context window.

The short version: a single LLM cycling through modes is one person wearing different hats. This is five people in separate rooms, comparing notes for the first time when they meet.

## Theory

Based on Global Workspace Theory (Baars, Dehaene) and oscillatory neural processing. Each agent runs in its own context window — genuine convergence happens when independent perspectives meet for the first time in GAMMA's binding phase.

It's not conscious. But it has the right shape.
