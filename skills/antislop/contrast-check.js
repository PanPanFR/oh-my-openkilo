#!/usr/bin/env node
/**
 * WCAG 2.x contrast checker for antislop (Node.js).
 * Usage:
 *   node contrast-check.js "#FFFFFF" "#777777"
 *   node contrast-check.js FFFFFF 777777
 *   node contrast-check.js --selftest
 */

const NAMED_COLORS = {
  black: [0, 0, 0],
  white: [255, 255, 255]
};

function parseHex(val) {
  let clean = val.trim().replace(/^#/, "");
  if (clean.length === 3) {
    clean = clean.split("").map(c => c + c).join("");
  }
  if (!/^[0-9A-Fa-f]{6}$/.test(clean)) {
    throw new Error(`Invalid hex color: "${val}"`);
  }
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16)
  ];
}

function parsePairing(pairing) {
  const parts = pairing.split(/\s+on\s+/i);
  if (parts.length !== 2) {
    throw new Error(`Expected two colors in pairing: "${pairing}"`);
  }
  return parts.map(p => {
    const trimmed = p.trim().toLowerCase();
    if (NAMED_COLORS[trimmed]) return NAMED_COLORS[trimmed];
    const match = trimmed.match(/#[0-9a-f]{3,6}/i);
    if (match) return parseHex(match[0]);
    return parseHex(trimmed);
  });
}

function linearize(channel) {
  const c = channel / 255.0;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function luminance(rgb) {
  const [r, g, b] = rgb.map(linearize);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(colorA, colorB) {
  const lumA = luminance(colorA);
  const lumB = luminance(colorB);
  const lighter = Math.max(lumA, lumB);
  const darker = Math.min(lumA, lumB);
  return (lighter + 0.05) / (darker + 0.05);
}

function selftest() {
  const testCases = [
    ["black", "white", 21.0, true, true],
    ["white", "#333333", 12.63, true, true],
    ["white", "#666666", 5.74, true, true],
    ["#777777", "white", 4.48, false, true],
    ["white", "#888888", 3.54, false, true],
    ["white", "#999999", 2.85, false, false],
    ["#555555", "black", 2.82, false, false],
  ];

  let failed = 0;
  for (const [c1, c2, expRatio, expNorm, expLg] of testCases) {
    const [colorA, colorB] = parsePairing(`${c1} on ${c2}`);
    const ratio = Math.round(contrastRatio(colorA, colorB) * 100) / 100;
    const norm = ratio >= 4.5;
    const lg = ratio >= 3.0;

    if (Math.abs(ratio - expRatio) > 0.05 || norm !== expNorm || lg !== expLg) {
      console.error(`Selftest failed on "${c1} on ${c2}": got ${ratio} (norm:${norm}, lg:${lg})`);
      failed++;
    }
  }

  if (failed > 0) process.exit(1);
  console.log("selftest: all reference pairs OK");
  process.exit(0);
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 1 && args[0] === "--selftest") {
    return selftest();
  }
  if (args.length !== 2) {
    console.log("Usage: node contrast-check.js <hex1> <hex2> | --selftest");
    process.exit(2);
  }

  try {
    const colorA = parseHex(args[0]);
    const colorB = parseHex(args[1]);
    const ratio = contrastRatio(colorA, colorB);
    const ratioFormatted = ratio.toFixed(2);
    const normPass = ratio >= 4.5;
    const lgPass = ratio >= 3.0;

    console.log(`ratio: ${ratioFormatted}:1`);
    console.log(`normal text (4.5:1): ${normPass ? "PASS" : "FAIL"}`);
    console.log(`large text  (3.0:1): ${lgPass ? "PASS" : "FAIL"}`);

    process.exit(normPass && lgPass ? 0 : 1);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(2);
  }
}

main();
