#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ARCHIVE_ROOT = path.resolve(__dirname, '..');
const MANIFEST_PATH = path.join(ARCHIVE_ROOT, 'manifest.json');
const MCP_CATALOG_PATH = path.join(ARCHIVE_ROOT, 'mcp-catalog.json');
const SKILLS_ARCHIVE_DIR = path.join(ARCHIVE_ROOT, 'skills');

// Read manifest & catalog
function loadArchiveData() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
  const mcpCatalog = JSON.parse(fs.readFileSync(MCP_CATALOG_PATH, 'utf-8'));
  return { manifest, mcpCatalog };
}

// Read skill description from its SKILL.md
function getSkillDescription(category, skillId) {
  const skillFile = path.join(SKILLS_ARCHIVE_DIR, category, skillId, 'SKILL.md');
  if (!fs.existsSync(skillFile)) return '';
  const content = fs.readFileSync(skillFile, 'utf-8');
  
  // Try matching YAML frontmatter description
  const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (fmMatch) {
    const fm = fmMatch[1];
    const descMatch = fm.match(/^description:\s*([^\r\n]*)/m);
    if (descMatch) {
      const firstLine = descMatch[1].trim();
      if (firstLine === '>' || firstLine === '|' || firstLine === '') {
        // Collect following indented lines
        const lines = fm.split(/\r?\n/);
        const idx = lines.findIndex(l => l.startsWith('description:'));
        const collected = [];
        for (let i = idx + 1; i < lines.length; i++) {
          const line = lines[i];
          if (/^\s+[^\s]/.test(line)) {
            collected.push(line.trim());
          } else {
            break;
          }
        }
        if (collected.length > 0) return collected.join(' ');
      } else {
        return firstLine.replace(/^['"]|['"]$/g, '');
      }
    }
  }

  const firstLine = content.split(/\r?\n/).find(l => l.trim() && !l.startsWith('#') && !l.startsWith('---'));
  return firstLine ? firstLine.slice(0, 100).trim() : '';
}

// Recursive file scanner up to maxDepth (ignoring heavy/build directories)
function scanProjectFiles(targetDir, maxDepth = 3) {
  const files = [];
  const ignoredDirs = new Set([
    '.git', 'node_modules', 'target', 'build', 'dist', 'out', 'bin', 'obj',
    '.gradle', '.idea', '.vscode', '.next', '.cache', 'venv', '.venv'
  ]);

  function walk(currentDir, currentDepth) {
    if (currentDepth > maxDepth) return;
    try {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        const relPath = path.relative(targetDir, fullPath).replace(/\\/g, '/');

        if (entry.isDirectory()) {
          if (!ignoredDirs.has(entry.name)) {
            walk(fullPath, currentDepth + 1);
          }
        } else if (entry.isFile()) {
          files.push(relPath);
        }
      }
    } catch {}
  }

  walk(targetDir, 0);
  return files;
}

// Evaluate candidate skills with Jev System One
function evaluateWithJev(projectState, candidates) {
  const jevScript = path.resolve(__dirname, '../../skills/jev-decision/scripts/jev-decide.mjs');
  if (!fs.existsSync(jevScript)) return null;

  try {
    const candidatesSubset = {};
    const entries = Object.entries(candidates).slice(0, 12);
    for (const [k, v] of entries) {
      candidatesSubset[k] = (v || k).slice(0, 140).replace(/[\r\n]+/g, ' ');
    }

    const stdout = execFileSync(
      process.execPath,
      [
        jevScript,
        '-Preset', 'skill-match',
        '-State', projectState,
        '-CandidatesJson', JSON.stringify(candidatesSubset)
      ],
      { encoding: 'utf-8', timeout: 8000 }
    );

    return JSON.parse(stdout);
  } catch (err) {
    return null;
  }
}

// Detect project stack in target directory
export function detectStack(targetDir = process.cwd(), query = null, options = {}) {
  const { manifest, mcpCatalog } = loadArchiveData();
  const detected = {
    target: path.resolve(targetDir),
    categories: [],
    details: {},
    recommendedSkills: [],
    recommendedMcps: []
  };

  const addSkill = (skillId, category) => {
    if (!detected.recommendedSkills.some(s => s.id === skillId)) {
      detected.recommendedSkills.push({
        id: skillId,
        category,
        description: getSkillDescription(category, skillId)
      });
    }
  };

  const addMcp = (mcpId, category) => {
    if (!detected.recommendedMcps.some(m => m.id === mcpId)) {
      if (mcpCatalog.servers[mcpId]) {
        detected.recommendedMcps.push({
          id: mcpId,
          category,
          description: mcpCatalog.servers[mcpId].description,
          config: mcpCatalog.servers[mcpId].config
        });
      }
    }
  };

  const allFiles = scanProjectFiles(targetDir, 3);
  const rootFiles = new Set();
  try {
    for (const e of fs.readdirSync(targetDir, { withFileTypes: true })) {
      if (e.isFile()) rootFiles.add(e.name);
    }
  } catch {}

  // 1. Rust & Native Systems Detection
  const hasCargo = allFiles.some(f => /(^|\/)Cargo\.toml$/i.test(f));
  const hasCargoLock = allFiles.some(f => /(^|\/)Cargo\.lock$/i.test(f));
  const hasBuildRs = allFiles.some(f => /(^|\/)build\.rs$/i.test(f));
  const hasRsFiles = allFiles.some(f => f.endsWith('.rs'));
  const isRust = hasCargo || hasCargoLock || hasBuildRs || hasRsFiles;

  const hasCMake = allFiles.some(f => /(^|\/)CMakeLists\.txt$/i.test(f));
  const hasMakefile = allFiles.some(f => /(^|\/)Makefile$/i.test(f));
  const hasCppFiles = allFiles.some(f => /\.(cpp|c|cc|cxx|h|hpp|hxx)$/i.test(f));
  const hasVisualStudio = allFiles.some(f => /\.(sln|vcxproj)$/i.test(f));
  const isNativeCpp = hasCMake || hasMakefile || hasCppFiles || hasVisualStudio;

  const hasTauriConf = allFiles.some(f => /(^|\/)tauri\.conf\.json$/i.test(f));
  let hasWindowsDep = false;
  if (hasCargo) {
    const cargoList = allFiles.filter(f => /(^|\/)Cargo\.toml$/i.test(f));
    for (const cf of cargoList) {
      try {
        const txt = fs.readFileSync(path.join(targetDir, cf), 'utf-8');
        if (/windows\s*=|windows-sys\s*=|winapi\s*=/i.test(txt)) {
          hasWindowsDep = true;
          break;
        }
      } catch {}
    }
  }

  // Binary detection
  let hasBinaries = false;
  for (const f of rootFiles) {
    const ext = path.extname(f).toLowerCase();
    if (['.exe', '.dll', '.so', '.dylib', '.bin', '.apk', '.ipa', '.sys'].includes(ext)) {
      hasBinaries = true;
      break;
    }
  }
  if (!hasBinaries) {
    hasBinaries = allFiles.some(f => {
      const ext = path.extname(f).toLowerCase();
      return ['.exe', '.dll', '.so', '.dylib', '.bin', '.apk', '.ipa', '.sys'].includes(ext);
    });
  }

  if (isRust || isNativeCpp) {
    if (isRust) {
      if (!detected.categories.includes('rust')) detected.categories.push('rust');
      detected.details.rust = {
        detected: true,
        cargoFiles: allFiles.filter(f => /(^|\/)Cargo\.toml$/i.test(f)),
        hasRsFiles,
        isTauri: hasTauriConf,
        hasWindowsDep
      };
      // Add all Rust core skills
      for (const skill of manifest.categories.rust.skills) {
        addSkill(skill, 'rust');
      }
    }

    if (isNativeCpp) {
      detected.details.native = { isCpp: true, hasCMake, hasVisualStudio };
    }

    // Native projects benefit greatly from reverse-engineer-anything for inspecting binaries/symbols
    addSkill('reverse-engineer-anything', 'security');
    addMcp('rea', 'security');

    // If Tauri / Desktop UI detected, add UI skills
    if (hasTauriConf) {
      for (const uiSkill of ['ui-design', 'ui-taste', 'ui-ux-pro-max', 'impeccable']) {
        addSkill(uiSkill, 'web');
      }
    }
  }

  // 2. Android Detection
  const hasAndroidFile = allFiles.some(f => /(^|\/)(build\.gradle|build\.gradle\.kts|settings\.gradle|settings\.gradle\.kts|AndroidManifest\.xml|gradlew)$/i.test(f));
  const hasKtFiles = allFiles.some(f => f.endsWith('.kt') || f.endsWith('.kts'));
  if (hasAndroidFile || hasKtFiles) {
    if (!detected.categories.includes('android')) detected.categories.push('android');
    detected.details.android = { detected: true };
    for (const skill of manifest.categories.android.skills) {
      addSkill(skill, 'android');
    }
  }

  // 3. Cloudflare Detection
  const hasWrangler = allFiles.some(f => /(^|\/)(wrangler\.toml|wrangler\.json|wrangler\.jsonc)$/i.test(f));
  let hasCfDep = false;
  let pkgJson = null;
  const pkgFiles = allFiles.filter(f => /(^|\/)package\.json$/i.test(f));
  for (const pf of pkgFiles) {
    try {
      const p = JSON.parse(fs.readFileSync(path.join(targetDir, pf), 'utf-8'));
      if (!pkgJson) pkgJson = p;
      const allDeps = { ...(p.dependencies || {}), ...(p.devDependencies || {}) };
      if (['wrangler', '@cloudflare/workers-types', '@cloudflare/sandbox'].some(d => d in allDeps)) {
        hasCfDep = true;
      }
    } catch {}
  }
  if (hasWrangler || hasCfDep) {
    if (!detected.categories.includes('cloudflare')) detected.categories.push('cloudflare');
    detected.details.cloudflare = { detected: true, wrangler: hasWrangler, cfDep: hasCfDep };
    for (const skill of manifest.categories.cloudflare.skills) {
      addSkill(skill, 'cloudflare');
    }
  }

  // 4. Web & Frontend Detection
  const hasWebConfig = allFiles.some(f => /(^|\/)(package\.json|next\.config\.(js|mjs|ts)|vite\.config\.(js|ts|mjs)|astro\.config\.(js|mjs)|svelte\.config\.js)$/i.test(f));
  if (hasWebConfig) {
    if (!detected.categories.includes('web')) detected.categories.push('web');
    const allDeps = pkgJson ? { ...(pkgJson.dependencies || {}), ...(pkgJson.devDependencies || {}) } : {};
    const isNext = 'next' in allDeps || allFiles.some(f => /next\.config\.(js|mjs|ts)$/i.test(f));
    const isVite = 'vite' in allDeps || allFiles.some(f => /vite\.config\.(js|ts|mjs)$/i.test(f));
    const isReact = 'react' in allDeps;
    const hasTailwind = 'tailwindcss' in allDeps || allFiles.some(f => /tailwind\.config\.(js|ts|mjs|cjs)$/i.test(f));

    detected.details.web = {
      isNext,
      isVite,
      isReact,
      hasTailwind
    };

    for (const skill of manifest.categories.web.skills) {
      let relevant = true;
      if (skill.startsWith('next-') && !isNext) relevant = false;
      if (skill.startsWith('vite') && !isVite) relevant = false;

      if (relevant) {
        addSkill(skill, 'web');
      }
    }

    if (isReact || hasTailwind) {
      for (const mcpId of ['shadcn', 'reactbits', 'magicuidesign-mcp', 'chrome-devtools']) {
        addMcp(mcpId, 'web');
      }
    } else {
      addMcp('chrome-devtools', 'web');
    }
  }

  // 5. Standalone Binary / Security Detection (if not already caught under rust/native)
  if (hasBinaries && !isRust && !isNativeCpp) {
    if (!detected.categories.includes('security')) detected.categories.push('security');
    detected.details.security = { hasBinaries: true };
    addSkill('reverse-engineer-anything', 'security');
    addMcp('rea', 'security');
  }

  // 6. User Query / Keyword Filtering / Broadening
  if (query) {
    const q = query.toLowerCase().trim();
    detected.query = q;

    // Direct category match
    if (manifest.categories[q]) {
      if (!detected.categories.includes(q)) detected.categories.push(q);
      for (const s of manifest.categories[q].skills) {
        addSkill(s, q);
      }
      for (const m of (manifest.categories[q].recommendedMcps || [])) {
        addMcp(m, q);
      }
    } else if (q === 'native') {
      // "native" alias matches rust + security REA
      if (!detected.categories.includes('rust')) detected.categories.push('rust');
      for (const s of manifest.categories.rust.skills) {
        addSkill(s, 'rust');
      }
      addSkill('reverse-engineer-anything', 'security');
      addMcp('rea', 'security');
    } else if (q === 'ui' || q === 'design') {
      for (const s of ['ui-design', 'ui-taste', 'ui-ux-pro-max', 'impeccable', 'awwwards', 'jury', 'shadcn']) {
        addSkill(s, 'web');
      }
      addMcp('shadcn', 'web');
      addMcp('reactbits', 'web');
    } else {
      // Search all archived skills by id or description
      for (const [catName, catData] of Object.entries(manifest.categories)) {
        for (const s of catData.skills) {
          const desc = getSkillDescription(catName, s).toLowerCase();
          if (s.toLowerCase().includes(q) || desc.includes(q)) {
            addSkill(s, catName);
          }
        }
      }
    }
  }

  // 7. Jev System One Decision Model Reranking (optional with --jev)
  if (options.jev && detected.recommendedSkills.length > 0) {
    const candidatesMap = {};
    for (const s of detected.recommendedSkills.slice(0, 12)) {
      candidatesMap[s.id] = (s.description || s.id).slice(0, 140).replace(/[\r\n]+/g, ' ');
    }

    const stateDesc = [
      `Target: ${path.basename(detected.target)}`,
      `Categories: ${detected.categories.join(', ')}`,
      `Files: ${allFiles.slice(0, 15).join(', ')}`,
      query ? `Intent/Query: ${query}` : null
    ].filter(Boolean).join('. ');

    const jevRes = evaluateWithJev(stateDesc, candidatesMap);
    if (jevRes && jevRes.skill_pick && jevRes.skill_pick.probabilities) {
      const probs = jevRes.skill_pick.probabilities;
      detected.details.jev = {
        topPick: jevRes.skill_pick.choice,
        confidence: jevRes.skill_pick.confidence,
        mismatchRisk: jevRes.mismatch_risk?.score,
        loadNow: jevRes.load_now?.noul
      };

      for (const s of detected.recommendedSkills) {
        if (s.id in probs) {
          s.jevScore = probs[s.id];
        }
      }

      // Sort by jevScore descending
      detected.recommendedSkills.sort((a, b) => (b.jevScore ?? -1) - (a.jevScore ?? -1));
    }
  }

  return detected;
}

// Copy selected skills into <target>/.opencode/skills/<skill-name>/
export function injectSkills(targetDir, skillsToInject, options = {}) {
  const { manifest } = loadArchiveData();
  const targetSkillsDir = path.join(targetDir, '.opencode', 'skills');
  const results = {
    targetDir: targetSkillsDir,
    dryRun: Boolean(options.dryRun),
    copied: [],
    skipped: [],
    errors: []
  };

  // Build skill -> category index
  const skillCategoryMap = new Map();
  for (const [catName, catData] of Object.entries(manifest.categories)) {
    for (const s of catData.skills) {
      skillCategoryMap.set(s, catName);
    }
  }

  for (const skillId of skillsToInject) {
    const category = skillCategoryMap.get(skillId);
    if (!category) {
      results.skipped.push({ id: skillId, reason: 'Unknown skill in archive' });
      continue;
    }

    const srcDir = path.join(SKILLS_ARCHIVE_DIR, category, skillId);
    const destDir = path.join(targetSkillsDir, skillId);

    if (!fs.existsSync(srcDir)) {
      results.errors.push({ id: skillId, error: `Source directory missing: ${srcDir}` });
      continue;
    }

    if (!options.dryRun) {
      fs.mkdirSync(destDir, { recursive: true });
      fs.cpSync(srcDir, destDir, { recursive: true });
    }
    results.copied.push({
      id: skillId,
      category,
      description: getSkillDescription(category, skillId),
      destination: destDir
    });
  }

  return results;
}

// Inject selected MCPs into <target>/opencode.json
export function injectMcps(targetDir, mcpsToInject, options = {}) {
  const { mcpCatalog } = loadArchiveData();
  const configPath = path.join(targetDir, 'opencode.json');
  const results = {
    configPath,
    dryRun: Boolean(options.dryRun),
    injected: [],
    skipped: [],
    errors: []
  };

  let config = {};
  if (fs.existsSync(configPath)) {
    try {
      config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    } catch (e) {
      results.errors.push({ error: `Failed to parse existing ${configPath}: ${e.message}` });
      return results;
    }
  } else {
    config = {
      "$schema": "https://opencode.ai/config.json"
    };
  }

  if (!config.mcp) config.mcp = {};
  if (!config.mcp.servers) config.mcp.servers = {};

  for (const mcpId of mcpsToInject) {
    const catalogItem = mcpCatalog.servers[mcpId];
    if (!catalogItem) {
      results.skipped.push({ id: mcpId, reason: 'MCP server not in archive catalog' });
      continue;
    }

    if (!options.dryRun) {
      config.mcp.servers[mcpId] = catalogItem.config;
    }
    results.injected.push({ id: mcpId, config: catalogItem.config });
  }

  if (!options.dryRun && results.injected.length > 0) {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n', 'utf-8');
  }

  return results;
}

// Parse CLI flags
function parseArgs(args) {
  const flags = {
    action: 'detect', // 'detect' | 'skills' | 'mcp' | 'list'
    target: process.cwd(),
    dryRun: false,
    apply: false,
    all: false,
    skills: [],
    mcps: [],
    category: null,
    query: null,
    jev: false
  };

  let i = 0;
  while (i < args.length) {
    const arg = args[i];
    if (arg === 'skills' || arg === 'mcp' || arg === 'list' || arg === 'detect') {
      flags.action = arg;
    } else if (arg === '--detect') {
      flags.action = 'detect';
    } else if (arg === '--jev') {
      flags.jev = true;
    } else if (arg === '--dry-run') {
      flags.dryRun = true;
    } else if (arg === '--apply') {
      flags.apply = true;
    } else if (arg === '--all') {
      flags.all = true;
    } else if (arg === '--target' && args[i + 1]) {
      flags.target = path.resolve(args[++i]);
    } else if (arg === '--category' && args[i + 1]) {
      flags.category = args[++i];
    } else if ((arg === '--query' || arg === '-q') && args[i + 1]) {
      flags.query = args[++i];
    } else if (arg === '--skills' && args[i + 1]) {
      flags.skills = args[++i].split(',').map(s => s.trim()).filter(Boolean);
    } else if (arg === '--mcps' && args[i + 1]) {
      flags.mcps = args[++i].split(',').map(m => m.trim()).filter(Boolean);
    } else if (!arg.startsWith('-') && !flags.query) {
      // Positional argument treated as query
      flags.query = arg;
    }
    i++;
  }

  if (flags.category && !flags.query) {
    flags.query = flags.category;
  }

  return flags;
}

// CLI Execution
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename)) {
  const flags = parseArgs(process.argv.slice(2));

  if (flags.action === 'list') {
    const { manifest, mcpCatalog } = loadArchiveData();
    console.log(JSON.stringify({
      categories: manifest.categories,
      mcpServers: mcpCatalog.servers
    }, null, 2));
    process.exit(0);
  }

  if (flags.action === 'detect') {
    const detected = detectStack(flags.target, flags.query, { jev: flags.jev });
    console.log(JSON.stringify(detected, null, 2));
    process.exit(0);
  }

  if (flags.action === 'skills') {
    const detected = detectStack(flags.target, flags.query, { jev: flags.jev });
    let skillsToInject = flags.skills;

    if (flags.all || skillsToInject.length === 0) {
      if (flags.category) {
        const { manifest } = loadArchiveData();
        const cat = manifest.categories[flags.category];
        skillsToInject = cat ? cat.skills : [];
      } else {
        skillsToInject = detected.recommendedSkills.map(s => s.id);
      }
    }

    const dryRun = !flags.apply || flags.dryRun;
    const res = injectSkills(flags.target, skillsToInject, { dryRun });
    res.detectedCategories = detected.categories;
    res.detectedDetails = detected.details;
    if (detected.details.jev) res.jev = detected.details.jev;
    console.log(JSON.stringify(res, null, 2));
    process.exit(0);
  }

  if (flags.action === 'mcp') {
    const detected = detectStack(flags.target, flags.query, { jev: flags.jev });
    let mcpsToInject = flags.mcps;

    if (flags.all || mcpsToInject.length === 0) {
      mcpsToInject = detected.recommendedMcps.map(m => m.id);
    }

    const dryRun = !flags.apply || flags.dryRun;
    const res = injectMcps(flags.target, mcpsToInject, { dryRun });
    console.log(JSON.stringify(res, null, 2));
    process.exit(0);
  }
}
