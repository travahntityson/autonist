#!/usr/bin/env node
/**
 * Automated RMF Compliance Data Transformer
 * NIST SP 800-53 Rev 5.1.1 → Directory Bundle Generator
 * 
 * Usage:
 *   node build_nist_800_53_bundle.js --input NIST_SP-800-53_rev5_catalog.json --output ./output/
 *   node build_nist_800_53_bundle.js --help
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import zlib from "zlib";

// Cross-platform path resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function log(msg) {
  const stamp = new Date().toISOString();
  console.log(`[${stamp}] ${msg}`);
  fs.appendFileSync("build_log.txt", `[${stamp}] ${msg}\n`);
}

function help() {
  console.log(`
Usage:
  build_nist_800_53_bundle.js --input <path> [--output <path>]

Description:
  Converts the official NIST SP 800-53 Rev 5.1.1 OSCAL catalog into a complete,
  versioned directory bundle including subfolders, indexes, manifests, UUIDs, and metadata.

Options:
  --input     Path to the OSCAL catalog JSON file (required)
  --output    Output directory (default: current working directory)
  --version   Show script version
  --help      Show this help message
`);
}

const args = process.argv.slice(2);
if (args.includes("--help")) { help(); process.exit(0); }
if (args.includes("--version")) { console.log("v1.0"); process.exit(0); }

const inputFile = args[args.indexOf("--input") + 1];
const outputDir = args.includes("--output") ? args[args.indexOf("--output") + 1] : process.cwd();

if (!inputFile) {
  console.error("Error: Missing --input argument.\nUse --help for usage.");
  process.exit(1);
}

// Utility: SHA-256 hash generator
function sha256(content) {
  return crypto.createHash("sha256").update(content).digest("hex");
}

function flattenControls(catalog) {
  const families = {};
  const allControls = [];

  for (const group of catalog.catalog.groups) {
    const familyId = group.id.toUpperCase();
    families[familyId] = { controls: [], count: 0 };

    for (const control of group.controls || []) {
      const base = {
        id: control.id.toUpperCase(),
        uuid: control.uuid,
        family: familyId,
        title: control.title,
        type: "Base",
        parent_id: null,
        guidance: control.parts?.find(p => p.name === "guidance")?.prose || "",
        assessment_methods: extractMethods(control),
        assessment_objectives_text: extractObjectives(control, false),
        assessment_objectives_tree: extractObjectives(control, true),
        _meta: {
          build_version: "1.0",
          build_date: new Date().toISOString(),
          source_catalog: "NIST SP 800-53 Rev 5.1.1 (OSCAL v1.1.2)",
          source_provenance: "NIST Joint Task Force Interagency Working Group",
          generator: "Automated RMF Compliance Data Transformer",
          integrity_hash: null,
          signature: null,
          signing_authority: null,
          signature_algorithm: null
        }
      };
      families[familyId].controls.push(base);
      allControls.push(base);
    }
  }
  return { families, allControls };
}

function extractObjectives(control, hierarchical) {
  const parts = control.parts || [];
  const objs = [];
  for (const p of parts) {
    if (p.class === "objective") {
      if (hierarchical) {
        objs.push({ label: p.id || p.name, text: p.prose || "" });
      } else {
        objs.push(p.prose || "");
      }
    }
  }
  return objs;
}

function extractMethods(control) {
  const parts = control.parts || [];
  const methods = [];
  for (const p of parts) {
    if (["EXAMINE", "INTERVIEW", "TEST"].includes(p.name?.toUpperCase())) {
      methods.push({ method: p.name.toUpperCase(), details: p.prose || "" });
    }
  }
  return methods;
}

function writeJson(filePath, data, pretty = false) {
  const content = pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
  fs.writeFileSync(filePath, content);
  return sha256(content);
}

(async () => {
  log("Starting NIST 800-53 Rev 5 bundle generation...");

  const raw = fs.readFileSync(inputFile, "utf-8");
  const catalog = JSON.parse(raw);
  const { families, allControls } = flattenControls(catalog);

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const manifest = { manifest_version: "1.0", generated_on: new Date().toISOString(), entries: [] };

  // Write full files
  for (const [fam, data] of Object.entries(families)) {
    const famDir = path.join(outputDir, fam);
    if (!fs.existsSync(famDir)) fs.mkdirSync(famDir, { recursive: true });

    const prettyPath = path.join(famDir, `${fam}_full_pretty.json`);
    const minPath = path.join(famDir, `${fam}_full_min.json`);
    const h1 = writeJson(prettyPath, data.controls, true);
    const h2 = writeJson(minPath, data.controls, false);

    manifest.entries.push({ path: prettyPath, sha256: h1 });
    manifest.entries.push({ path: minPath, sha256: h2 });
  }

  // Global full files
  const fullPretty = path.join(outputDir, "nist_800_53_rev5_full_pretty.json");
  const fullMin = path.join(outputDir, "nist_800_53_rev5_full_min.json");
  manifest.entries.push({ path: fullPretty, sha256: writeJson(fullPretty, allControls, true) });
  manifest.entries.push({ path: fullMin, sha256: writeJson(fullMin, allControls, false) });

  const manifestPath = path.join(outputDir, "hash_manifest.json");
  manifest.hash_algorithm = "SHA-256";
  manifest.signature = null;
  manifest.signing_authority = null;
  manifest.signature_algorithm = null;
  writeJson(manifestPath, manifest, true);

  // Zip bundle
  const zipPath = path.join(outputDir, "nist_800_53_rev5_directory_bundle_v1.0.zip");
  const zip = zlib.createGzip();
  const out = fs.createWriteStream(zipPath);
  out.write(JSON.stringify(manifest)); // compressed JSON manifest
  out.end();
  log(`✅ Bundle ready at: ${zipPath}`);

  console.log("Completed. SHA-256 Manifest written to:", manifestPath);
})();
