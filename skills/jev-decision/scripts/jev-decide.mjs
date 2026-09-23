#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const presets = {
  triage: {
    task_type: {
      type: "choice",
      instructions: "Pick exactly one task category.",
      criteria: {
        "simple-edit": "1-2 files, obvious change, no design needed",
        feature: "new behavior or endpoint",
        ui: "screens, components, styling, layout",
        refactor: "restructure without behavior change",
        bug: "fix broken behavior",
        docs: "docs/comments only",
        recon: "read-only inspection, audit, explanation, Q&A"
      }
    },
    needs_plan: {
      type: "noul",
      instructions: "Does this need a plan file under plan/ before implementation?"
    },
    risk: {
      type: "score",
      instructions: "How risky is this change?",
      criteria: ["security", "blast-radius"]
    }
  },
  delegation: {
    owner: {
      type: "choice",
      instructions: "Who should own the first step?",
      criteria: {
        "builder-inline": "do directly, needs current context",
        designer: "UI/design-system/a11y decision",
        reviewer: "read-only audit or security review",
        tester: "test suite work",
        documenter: "doc-heavy multi-section work"
      }
    },
    can_parallel: {
      type: "noul",
      instructions: "Can this step run in parallel with siblings without shared state?"
    },
    complexity: {
      type: "score",
      instructions: "How complex is the coordination?",
      criteria: ["coordination-cost", "domain-risk"]
    }
  },
  review: {
    spec_match: {
      type: "score",
      instructions: "How well does the diff match the spec?",
      criteria: ["spec-coverage", "scope-discipline"]
    },
    security_risk: {
      type: "score",
      instructions: "How big is the security risk?",
      criteria: ["injection", "auth", "exposure"]
    },
    merge_ready: {
      type: "noul",
      instructions: "Is this diff ready to merge as-is?"
    },
    needs_tester: {
      type: "noul",
      instructions: "Does this need a tester pass before merge?"
    }
  },
  test: {
    needs_tests: {
      type: "noul",
      instructions: "Does this change need automated tests?"
    },
    test_scope: {
      type: "choice",
      instructions: "Pick the smallest sufficient test scope.",
      criteria: {
        unit: "unit tests only",
        integration: "integration tests",
        e2e: "browser e2e",
        all: "full suite"
      }
    },
    bug_risk: {
      type: "score",
      instructions: "How likely is regression?",
      criteria: ["regression-likelihood", "blast-radius"]
    }
  },
  ui: {
    needs_designer: {
      type: "noul",
      instructions: "Does this need designer judgment (system, a11y, visual)?"
    },
    ui_complexity: {
      type: "score",
      instructions: "How complex is the UI work?",
      criteria: ["layout", "interaction", "visual-system"]
    },
    a11y_risk: {
      type: "score",
      instructions: "How big is the a11y risk?",
      criteria: ["keyboard", "contrast", "focus"]
    }
  },
  verify: {
    spec_fit: {
      type: "score",
      instructions: "How well does the proposed approach fit the requirements and constraints?",
      criteria: ["requirement-coverage", "constraint-fit"]
    },
    decision_risk: {
      type: "score",
      instructions: "How big is the risk if this decision is wrong?",
      criteria: ["failure-impact", "reversibility"]
    },
    proceed: {
      type: "noul",
      instructions: "Is it safe to proceed with the proposed approach as-is?"
    },
    needs_human: {
      type: "noul",
      instructions: "Should a human confirm before proceeding?"
    }
  }
};

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    state: "",
    stateFile: "",
    preset: "triage",
    questionsJson: "",
    model: process.env.JEV_MODEL || "openrouter/typesafe/jev-1.13",
    endpoint: process.env.JEV_ENDPOINT || "",
    apiKey: process.env.JEV_API_KEY || "",
    timeoutSec: 8
  };

  for (let i = 0; i < args.length; i++) {
    const rawKey = args[i].replace(/^--?/, "").toLowerCase();
    const val = args[i + 1];

    if (rawKey === "state") {
      options.state = val;
      i++;
    } else if (rawKey === "statefile" || rawKey === "state-file") {
      options.stateFile = val;
      i++;
    } else if (rawKey === "preset") {
      options.preset = val;
      i++;
    } else if (rawKey === "questionsjson" || rawKey === "questions-json") {
      options.questionsJson = val;
      i++;
    } else if (rawKey === "model") {
      options.model = val;
      i++;
    } else if (rawKey === "endpoint") {
      options.endpoint = val;
      i++;
    } else if (rawKey === "apikey" || rawKey === "api-key" || rawKey === "key") {
      options.apiKey = val;
      i++;
    } else if (rawKey === "timeoutsec" || rawKey === "timeout" || rawKey === "timeout-sec") {
      options.timeoutSec = parseInt(val, 10) || 8;
      i++;
    }
  }
  return options;
}

function resolveEnvPlaceholder(str) {
  if (!str || typeof str !== "string") return str;
  const match = str.match(/^\{env:(.+?)\}$/);
  if (match) {
    return process.env[match[1]] || "";
  }
  return str;
}

function resolveConfig(currentEndpoint, currentKey) {
  let endpoint = currentEndpoint;
  let key = currentKey;

  if (endpoint && key) return { endpoint, key };

  let dir = __dirname;
  let cfgFile = null;
  while (dir && dir !== path.dirname(dir)) {
    const candidate = path.join(dir, "opencode.json");
    if (fs.existsSync(candidate)) {
      cfgFile = candidate;
      break;
    }
    dir = path.dirname(dir);
  }
  if (!cfgFile) {
    const fallback = path.join(os.homedir(), ".config", "opencode", "opencode.json");
    if (fs.existsSync(fallback)) cfgFile = fallback;
  }

  if (cfgFile) {
    try {
      const raw = fs.readFileSync(cfgFile, "utf8");
      const cfg = JSON.parse(raw);
      if (cfg?.providers) {
        for (const provider of Object.values(cfg.providers)) {
          const settings = provider?.settings;
          if (!settings) continue;

          if (!endpoint && settings.baseURL) {
            const resolvedBase = resolveEnvPlaceholder(settings.baseURL);
            if (resolvedBase && !resolvedBase.startsWith("{env:") && !resolvedBase.includes("<YOUR_")) {
              endpoint = resolvedBase.endsWith("/systemone")
                ? resolvedBase
                : `${resolvedBase.replace(/\/+$/, "")}/systemone`;
            }
          }

          if (!key && settings.apiKey) {
            const resolvedKey = resolveEnvPlaceholder(settings.apiKey);
            if (resolvedKey && !resolvedKey.startsWith("{env:") && !resolvedKey.includes("<YOUR_")) {
              key = resolvedKey;
            }
          }

          if (endpoint && key) break;
        }
      }
    } catch {}
  }
  return { endpoint, key };
}

async function main() {
  const opts = parseArgs();

  // Handle state from file, argument, or stdin
  let state = opts.state;
  if (!state && opts.stateFile && fs.existsSync(opts.stateFile)) {
    state = fs.readFileSync(opts.stateFile, "utf8");
  }
  if (!state && !process.stdin.isTTY) {
    try {
      state = fs.readFileSync(0, "utf8");
    } catch {}
  }

  if (!state || !state.trim()) {
    console.error("Jev: missing state (pass -State, -StateFile, or pipe to stdin)");
    process.exit(2);
  }

  const { endpoint, key } = resolveConfig(opts.endpoint, opts.apiKey);

  if (!endpoint) {
    console.error("Jev: missing endpoint. Set JEV_ENDPOINT env var, pass -Endpoint, or configure providers.<your-provider>.settings.baseURL in opencode.json. See skills/jev-decision/SKILL.md Setup.");
    process.exit(2);
  }
  if (!key) {
    console.error("Jev: missing API key. Set JEV_API_KEY env var, pass -ApiKey, or configure providers.<your-provider>.settings.apiKey in opencode.json. See skills/jev-decision/SKILL.md Setup.");
    process.exit(2);
  }

  let questions = null;
  if (opts.questionsJson) {
    try {
      questions = JSON.parse(opts.questionsJson);
    } catch (e) {
      console.error(`Jev: invalid -QuestionsJson: ${e.message}`);
      process.exit(2);
    }
  } else {
    questions = presets[opts.preset];
    if (!questions) {
      console.error(`Jev: unknown preset '${opts.preset}' (${Object.keys(presets).join("|")})`);
      process.exit(2);
    }
  }

  const body = {
    model: opts.model,
    state: state.trim(),
    questions
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutSec * 1000);

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body),
      signal: controller.signal
    });

    clearTimeout(timer);

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error(`Jev call failed: HTTP ${res.status} - ${errText}`);
      process.exit(3);
    }

    const data = await res.json();
    console.log(JSON.stringify(data.answers));
  } catch (err) {
    clearTimeout(timer);
    const msg = err.name === "AbortError" ? `Timeout after ${opts.timeoutSec}s` : err.message;
    console.error(`Jev call failed: ${msg}`);
    process.exit(3);
  }
}

main();
