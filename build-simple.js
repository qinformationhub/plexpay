#!/usr/bin/env node

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("🚀 Starting PlexPay simple build...\n");

// Set very conservative memory limits
process.env.NODE_OPTIONS = "--max-old-space-size=128 --expose-gc";

// Clean previous build
console.log("🧹 Cleaning previous build...");
if (fs.existsSync(path.join(__dirname, "dist"))) {
  fs.rmSync(path.join(__dirname, "dist"), { recursive: true, force: true });
}

// Create dist directory
fs.mkdirSync(path.join(__dirname, "dist"), { recursive: true });
fs.mkdirSync(path.join(__dirname, "dist/public"), { recursive: true });

// Build client with minimal settings
console.log("📦 Building client (minimal)...");
try {
  // Use a simpler build approach
  execSync(
    "NODE_OPTIONS='--max-old-space-size=128' npx vite build --mode production",
    {
      stdio: "inherit",
      cwd: __dirname,
      env: { ...process.env, NODE_OPTIONS: "--max-old-space-size=128" },
    }
  );
  console.log("✅ Client build completed");
} catch (error) {
  console.error("❌ Client build failed:", error.message);
  console.log("\n💡 Alternative solutions:");
  console.log("   1. Build locally and upload dist folder");
  console.log("   2. Upgrade EC2 instance to t3.medium or larger");
  console.log("   3. Use a CI/CD service like GitHub Actions");
  process.exit(1);
}

// Build server
console.log("🔧 Building server...");
try {
  execSync("npm run build:server", { stdio: "inherit" });
  console.log("✅ Server build completed");
} catch (error) {
  console.error("❌ Server build failed:", error.message);
  process.exit(1);
}

console.log("\n🎉 Simple build completed successfully!");
console.log('   Run "npm start" to start the production server');
