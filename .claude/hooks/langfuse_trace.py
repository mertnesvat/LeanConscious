#!/usr/bin/env python3
"""
Langfuse Stop Hook for Neural Mind Team.

Receives Claude Code stop hook JSON on stdin, pattern-matches for agent
signals (CYCLE_START, *_DONE, *_WAIT), and creates Langfuse traces
tagged with agent name and cycle number.

Traces are grouped by session_id for session-level views in Langfuse Cloud.
"""

import json
import os
import re
import sys
from datetime import datetime, timezone

# Exit early if Langfuse keys aren't configured
if os.environ.get("LANGFUSE_PUBLIC_KEY", "").startswith("pk-lf-REPLACE"):
    sys.exit(0)

try:
    from langfuse import Langfuse
except ImportError:
    # Langfuse not installed — skip silently
    sys.exit(0)

# Agent signal patterns
SIGNAL_PATTERNS = [
    # (pattern, agent, signal_type)
    (r"CYCLE_START:\s*(\d+)", "lead", "cycle_start"),
    (r"DELTA_DONE:\s*(\d+)", "delta", "done"),
    (r"ALPHA_DONE:\s*(\d+)", "alpha", "done"),
    (r"THETA_START:\s*(\d+)", "lead", "theta_trigger"),
    (r"THETA_DONE:\s*(\d+)", "theta", "done"),
    (r"GAMMA_START:\s*(\d+)", "lead", "gamma_trigger"),
    (r"GAMMA_DONE:\s*(\d+)", "gamma", "done"),
    (r"DMN_START:\s*(\d+)", "lead", "dmn_trigger"),
    (r"DMN_DONE:\s*(\d+)", "dmn", "done"),
    (r"DELTA_WAIT:\s*(\d+)", "delta", "wait"),
    (r"ALPHA_WAIT:\s*(\d+)", "alpha", "wait"),
    (r"THETA_WAIT:\s*(\d+)", "theta", "wait"),
    (r"GAMMA_WAIT:\s*(\d+)", "gamma", "wait"),
    (r"DMN_WAIT:\s*(\d+)", "dmn", "wait"),
]

# Agent color tags for Langfuse UI
AGENT_TAGS = {
    "lead": "lead-gold",
    "delta": "delta-indigo",
    "alpha": "alpha-teal",
    "theta": "theta-amber",
    "gamma": "gamma-rose",
    "dmn": "dmn-slate",
}

# State file paths (relative to project root)
STATE_FILES = {
    "delta": "neural-mind-state/session_state.md",
    "alpha": "neural-mind-state/background_attention.md",
    "theta": "neural-mind-state/association_buffer.md",
    "gamma": "neural-mind-state/self_model.md",
    "dmn": "neural-mind-state/shadow_log.md",
    "lead": "neural-mind-state/consciousness_stream.md",
}


def extract_cycle_from_header(filepath):
    """Read cycle number from the first HTML comment header of a state file."""
    try:
        with open(filepath, "r") as f:
            first_line = f.readline()
        match = re.search(r"CYCLE:\s*(\d+)", first_line)
        if match:
            return int(match.group(1))
    except (FileNotFoundError, IOError):
        pass
    return None


def main():
    # Read hook payload from stdin
    try:
        payload = json.load(sys.stdin)
    except (json.JSONDecodeError, EOFError):
        sys.exit(0)

    session_id = payload.get("session_id", "unknown")
    message = payload.get("last_assistant_message", "")
    cwd = payload.get("cwd", "")

    if not message:
        sys.exit(0)

    # Find all signal matches in the last assistant message
    signals = []
    for pattern, agent, signal_type in SIGNAL_PATTERNS:
        match = re.search(pattern, message)
        if match:
            cycle_num = int(match.group(1))
            signals.append((agent, signal_type, cycle_num))

    if not signals:
        # No neural mind signals in this message — skip
        sys.exit(0)

    # Initialize Langfuse
    try:
        langfuse = Langfuse()
    except Exception:
        sys.exit(0)

    now = datetime.now(timezone.utc)

    try:
        for agent, signal_type, cycle_num in signals:
            # Read state file header for metadata
            state_file = os.path.join(cwd, STATE_FILES.get(agent, ""))
            file_cycle = extract_cycle_from_header(state_file) if state_file else None

            trace_name = f"{agent}:{signal_type}:cycle-{cycle_num}"
            tags = [
                AGENT_TAGS.get(agent, agent),
                f"cycle-{cycle_num}",
                signal_type,
            ]

            metadata = {
                "agent": agent,
                "signal_type": signal_type,
                "cycle_number": cycle_num,
                "file_cycle": file_cycle,
                "state_file": STATE_FILES.get(agent, ""),
                "timestamp": now.isoformat(),
            }

            # Create trace grouped by session
            trace = langfuse.trace(
                name=trace_name,
                session_id=f"neural-mind-{session_id}",
                user_id=agent,
                tags=tags,
                metadata=metadata,
                input={"signal": f"{signal_type}:{cycle_num}", "agent": agent},
                output={"message_excerpt": message[:500]},
            )

            # Add a span for the signal event
            trace.span(
                name=f"{agent}-{signal_type}",
                input={"cycle": cycle_num},
                output={"file_cycle_verified": file_cycle == cycle_num if file_cycle else None},
                metadata={"agent": agent},
            )

        # Flush all events to Langfuse Cloud
        langfuse.flush()
    except Exception:
        # Langfuse client may be disabled or misconfigured — fail silently
        pass

    sys.exit(0)


if __name__ == "__main__":
    main()
