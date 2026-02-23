const express = require("express");
const path = require("path");
const fs = require("fs");
const { watch } = require("chokidar");
const { marked } = require("marked");
const { WebSocketServer } = require("ws");
const http = require("http");

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 3000;
const STATE_DIR = path.resolve(__dirname, "..", "neural-mind-state");

// Agent definitions
const AGENTS = {
  session_state: {
    id: "session_state",
    agent: "delta",
    label: "DELTA",
    title: "Session State",
    color: "indigo",
    mode: "snapshot",
  },
  background_attention: {
    id: "background_attention",
    agent: "alpha",
    label: "ALPHA",
    title: "Background Attention",
    color: "teal",
    mode: "snapshot",
  },
  association_buffer: {
    id: "association_buffer",
    agent: "theta",
    label: "THETA",
    title: "Association Buffer",
    color: "amber",
    mode: "snapshot",
  },
  self_model: {
    id: "self_model",
    agent: "gamma",
    label: "GAMMA",
    title: "Self Model",
    color: "rose",
    mode: "snapshot",
  },
  shadow_log: {
    id: "shadow_log",
    agent: "dmn",
    label: "DMN",
    title: "Shadow Log",
    color: "slate",
    mode: "journal",
  },
  consciousness_stream: {
    id: "consciousness_stream",
    agent: "lead",
    label: "LEAD",
    title: "Consciousness Stream",
    color: "gold",
    mode: "journal",
  },
};

// Parse cycle header from file content
function parseCycleHeader(content) {
  const match = content.match(
    /<!--\s*CYCLE:\s*(\d+)\s*\|\s*AGENT:\s*(\w+)\s*\|\s*TIMESTAMP:\s*(.+?)\s*-->/
  );
  if (match) {
    return {
      cycle: parseInt(match[1], 10),
      agent: match[2],
      timestamp: match[3].trim(),
    };
  }
  return null;
}

// Get latest cycle from journal (append) files — find the last header
function getLatestCycleFromJournal(content) {
  const matches = [
    ...content.matchAll(
      /<!--\s*CYCLE:\s*(\d+)\s*\|\s*AGENT:\s*(\w+)\s*\|\s*TIMESTAMP:\s*(.+?)\s*-->/g
    ),
  ];
  if (matches.length > 0) {
    const last = matches[matches.length - 1];
    return {
      cycle: parseInt(last[1], 10),
      agent: last[2],
      timestamp: last[3].trim(),
    };
  }
  return null;
}

// Get latest journal entry (last entry between --- separators)
function getLatestJournalEntry(content) {
  const entries = content.split(/\n---\s*\n/).filter((e) => e.trim());
  return entries.length > 0 ? entries[entries.length - 1].trim() : "";
}

// Read and parse a single state file
function readStateFile(fileId) {
  const meta = AGENTS[fileId];
  if (!meta) return null;

  const filepath = path.join(STATE_DIR, `${fileId}.md`);
  let raw = "";
  try {
    raw = fs.readFileSync(filepath, "utf-8");
  } catch {
    raw = "";
  }

  const isJournal = meta.mode === "journal";
  const header = isJournal
    ? getLatestCycleFromJournal(raw)
    : parseCycleHeader(raw);
  const displayContent = isJournal ? getLatestJournalEntry(raw) : raw;
  const html = displayContent ? marked(displayContent) : "";

  return {
    ...meta,
    cycle: header ? header.cycle : null,
    timestamp: header ? header.timestamp : null,
    raw: displayContent,
    html,
    empty: !raw.trim(),
  };
}

// Read all state files
function readAllState() {
  const states = {};
  let maxCycle = 0;
  for (const fileId of Object.keys(AGENTS)) {
    const state = readStateFile(fileId);
    states[fileId] = state;
    if (state && state.cycle && state.cycle > maxCycle) {
      maxCycle = state.cycle;
    }
  }
  return { states, currentCycle: maxCycle };
}

// Express config
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.get("/", (_req, res) => {
  const { states, currentCycle } = readAllState();
  const langfuseUrl =
    process.env.LANGFUSE_BASE_URL || "https://cloud.langfuse.com";
  res.render("index", { states, currentCycle, langfuseUrl });
});

app.get("/api/state", (_req, res) => {
  res.json(readAllState());
});

app.get("/api/state/:id", (req, res) => {
  const state = readStateFile(req.params.id);
  if (!state) return res.status(404).json({ error: "Unknown state file" });
  res.json(state);
});

// WebSocket broadcast
function broadcast(data) {
  const msg = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(msg);
    }
  });
}

// File watcher with stability threshold to prevent partial reads
const watcher = watch(STATE_DIR, {
  persistent: true,
  ignoreInitial: true,
  awaitWriteFinish: {
    stabilityThreshold: 300,
    pollInterval: 100,
  },
});

watcher.on("change", (filepath) => {
  const basename = path.basename(filepath, ".md");
  if (AGENTS[basename]) {
    const state = readStateFile(basename);
    const { currentCycle } = readAllState();
    broadcast({
      type: "update",
      fileId: basename,
      state,
      currentCycle,
    });
  }
});

// Start
server.listen(PORT, () => {
  console.log(`Neural Mind Dashboard running at http://localhost:${PORT}`);
  console.log(`Watching: ${STATE_DIR}`);
});
