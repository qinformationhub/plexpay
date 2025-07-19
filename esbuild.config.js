import { build } from "esbuild";
import { copy } from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function buildClient() {
  try {
    // Copy static assets if they exist
    const publicDir = path.join(__dirname, "client/public");
    const distPublicDir = path.join(__dirname, "dist/public");

    if (await import("fs").then((fs) => fs.existsSync(publicDir))) {
      await copy(publicDir, distPublicDir, { overwrite: true });
    }

    // Build the client bundle
    await build({
      entryPoints: [path.join(__dirname, "client/src/main.tsx")],
      bundle: true,
      minify: true,
      sourcemap: false,
      outfile: path.join(__dirname, "dist/public/app.js"),
      format: "esm",
      target: "es2020",
      platform: "browser",
      external: ["react", "react-dom"],
      define: {
        "process.env.NODE_ENV": '"production"',
      },
      loader: {
        ".tsx": "tsx",
        ".ts": "ts",
        ".jsx": "jsx",
        ".js": "js",
        ".css": "css",
      },
      resolveExtensions: [".tsx", ".ts", ".jsx", ".js", ".json", ".css"],
      alias: {
        "@": path.join(__dirname, "client/src"),
        "@shared": path.join(__dirname, "shared"),
        "@assets": path.join(__dirname, "attached_assets"),
      },
    });

    // Create HTML file
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PlexPay</title>
</head>
<body>
    <div id="root"></div>
    <script type="module" src="/app.js"></script>
</body>
</html>`;

    const fs = await import("fs");
    fs.writeFileSync(
      path.join(__dirname, "dist/public/index.html"),
      htmlContent
    );

    console.log("✅ Client build completed");
  } catch (error) {
    console.error("❌ Client build failed:", error);
    process.exit(1);
  }
}

async function buildServer() {
  try {
    await build({
      entryPoints: [path.join(__dirname, "server/index.ts")],
      bundle: true,
      platform: "node",
      packages: "external",
      format: "esm",
      outdir: path.join(__dirname, "dist"),
      target: "node18",
    });
    console.log("✅ Server build completed");
  } catch (error) {
    console.error("❌ Server build failed:", error);
    process.exit(1);
  }
}

async function main() {
  console.log("🚀 Starting PlexPay esbuild build...\n");

  // Clean previous build
  const fs = await import("fs");
  if (fs.existsSync(path.join(__dirname, "dist"))) {
    fs.rmSync(path.join(__dirname, "dist"), { recursive: true, force: true });
  }
  fs.mkdirSync(path.join(__dirname, "dist"), { recursive: true });
  fs.mkdirSync(path.join(__dirname, "dist/public"), { recursive: true });

  await buildClient();
  await buildServer();

  console.log("\n🎉 Build completed successfully!");
  console.log('   Run "npm start" to start the production server');
}

main().catch(console.error);
