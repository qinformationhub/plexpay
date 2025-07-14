#!/usr/bin/env node

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("🚀 Starting PlexPay production build...\n");

// Clean previous build
console.log("🧹 Cleaning previous build...");
if (fs.existsSync(path.join(__dirname, "dist"))) {
  fs.rmSync(path.join(__dirname, "dist"), { recursive: true, force: true });
}

// Build client
console.log("📦 Building client...");
try {
  execSync("npm run build:client", { stdio: "inherit" });
  console.log("✅ Client build completed");
} catch (error) {
  console.error("❌ Client build failed:", error.message);
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

// Verify build output
console.log("🔍 Verifying build output...");
const distPath = path.join(__dirname, "dist");
const publicPath = path.join(distPath, "public");
const serverPath = path.join(distPath, "index.js");

if (!fs.existsSync(publicPath)) {
  console.error("❌ Public directory not found");
  process.exit(1);
}

if (!fs.existsSync(serverPath)) {
  console.error("❌ Server build not found");
  process.exit(1);
}

if (!fs.existsSync(path.join(publicPath, "index.html"))) {
  console.error("❌ Client index.html not found");
  process.exit(1);
}

console.log("✅ Build verification completed");

// Show build info
const publicSize = getDirSize(publicPath);
const serverSize = fs.statSync(serverPath).size;

console.log("\n📊 Build Summary:");
console.log(`   Client assets: ${formatBytes(publicSize)}`);
console.log(`   Server bundle: ${formatBytes(serverSize)}`);
console.log(`   Total: ${formatBytes(publicSize + serverSize)}`);

console.log("\n🎉 Production build completed successfully!");
console.log('   Run "npm start" to start the production server');

function getDirSize(dirPath) {
  let size = 0;
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      size += getDirSize(filePath);
    } else {
      size += stat.size;
    }
  }

  return size;
}

function formatBytes(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
