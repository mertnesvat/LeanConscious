# LeanConscious

A multi-agent cognitive architecture modelled on oscillatory brain rhythms, built with Claude Code Agent Teams.

Five specialised agents — DELTA (consolidation), ALPHA (peripheral attention), THETA (associative traversal), GAMMA (binding), and DMN (default mode network) — process independently and converge through a lead agent acting as a Global Workspace broadcast layer.

The result is a system that observes, reflects, and integrates — producing a public consciousness stream and a private shadow journal across cognitive cycles.

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

## Theory

Based on Global Workspace Theory (Baars, Dehaene) and oscillatory neural processing. Each agent runs in its own context window — genuine convergence happens when independent perspectives meet for the first time in GAMMA's binding phase.

It's not conscious. But it has the right shape.
