#!/usr/bin/env node

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("🚀 Starting PlexPay esbuild build...\n");

// Clean previous build
console.log("🧹 Cleaning previous build...");
if (fs.existsSync(path.join(__dirname, "dist"))) {
  fs.rmSync(path.join(__dirname, "dist"), { recursive: true, force: true });
}

// Create dist directory
fs.mkdirSync(path.join(__dirname, "dist"), { recursive: true });
fs.mkdirSync(path.join(__dirname, "dist/public"), { recursive: true });

// Copy static assets
console.log("📁 Copying static assets...");
if (fs.existsSync(path.join(__dirname, "client/public"))) {
  execSync(
    `cp -r ${path.join(__dirname, "client/public")}/* ${path.join(
      __dirname,
      "dist/public"
    )}/`,
    { stdio: "inherit" }
  );
}

// Build client with esbuild
console.log("📦 Building client with esbuild...");
try {
  const clientEntry = path.join(__dirname, "client/src/main.tsx");
  const clientOutDir = path.join(__dirname, "dist/public");

  // Use esbuild to bundle the client
  execSync(
    `npx esbuild ${clientEntry} --bundle --minify --sourcemap --outfile=${clientOutDir}/app.js --format=esm --target=es2020 --external:react --external:react-dom`,
    {
      stdio: "inherit",
      cwd: __dirname,
    }
  );

  // Create a simple HTML file
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PlexPay</title>
    <script type="module" src="/app.js"></script>
</head>
<body>
    <div id="root"></div>
</body>
</html>`;

  fs.writeFileSync(path.join(clientOutDir, "index.html"), htmlContent);
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

console.log("\n🎉 esbuild build completed successfully!");
console.log('   Run "npm start" to start the production server');
