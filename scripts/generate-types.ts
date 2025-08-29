#!/usr/bin/env node
// @ts-nocheck

import { spawn } from "child_process";
import fs from "fs";
import fsPromises from "fs/promises";
import path from "path";

// Try to load env vars from .env if not already set
import dotenv from "dotenv";
dotenv.config();

const env = {
  DIRECTUS_URL: process.env.DIRECTUS_URL,
  DIRECTUS_TOKEN: process.env.DIRECTUS_TOKEN,
};

if (!env.DIRECTUS_URL || !env.DIRECTUS_TOKEN) {
  console.error("❌ Missing DIRECTUS_URL or DIRECTUS_TOKEN environment variables");
  console.log("Make sure to set these in your .env file:");
  console.log("DIRECTUS_URL=https://your-directus-instance.com");
  console.log("DIRECTUS_TOKEN=your-static-token");
  process.exit(1);
}

console.log("🔧 Generating Directus TypeScript schema...");

function runCommand(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { ...opts, stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (data) => (stdout += data));
    child.stderr.on("data", (data) => (stderr += data));
    child.on("close", (code) => {
      resolve({ code, stdout, stderr });
    });
    child.on("error", reject);
  });
}

(async () => {
  // Run the indirectus sdk generate command (generates .directus folder)
  const { code, stdout, stderr } = await runCommand("npx", [
    "indirectus",
    "sdk",
    "generate",
    "--url", env.DIRECTUS_URL,
    "--token", env.DIRECTUS_TOKEN,
  ]);

  if (code !== 0) {
    console.error("❌ Failed to generate Directus types with indirectus:");
    console.error(stderr);
    console.log("\n💡 Make sure 'indirectus' is installed globally or available via npx");
    process.exit(1);
  }

  if (stdout.trim()) {
    console.log(stdout);
  }

  console.log("✅ Successfully generated Directus schema using indirectus!");

  // Copy .directus folder to src/lib/directus
  console.log("📁 Copying .directus folder to src/lib/directus...");

  try {
    // Remove existing src/lib/directus directory if it exists
    const directusDir = path.join("src", "directus");
    try {
      await fsPromises.rm(directusDir, { recursive: true, force: true });
    } catch (_error) {
      // Directory doesn't exist, that's fine
    }

    // Copy .directus to src/lib/directus
    const { code: copyCode, stderr: copyStderr } = await runCommand("cp", [
      "-r", ".directus", directusDir,
    ]);

    if (copyCode !== 0) {
      console.error("❌ Failed to copy .directus folder:");
      console.error(copyStderr);
      process.exit(1);
    }

    console.log("✅ Successfully copied to src/directus");


    // Add // @ts-nocheck to the first line of src/directus/generated/client.ts
    const clientTsPath = path.join("src", "directus", "generated", "client.ts");
    try {
      let clientContent = await fsPromises.readFile(clientTsPath, "utf8");
      if (!clientContent.startsWith("// @ts-nocheck")) {
        clientContent = `// @ts-nocheck\n${clientContent}`;
        await fsPromises.writeFile(clientTsPath, clientContent, "utf8");
        console.log("✅ Added // @ts-nocheck to src/directus/generated/client.ts");
      } else {
        console.log("// @ts-nocheck already present in src/directus/generated/client.ts");
      }
    } catch (err) {
      console.warn(`⚠️ Could not update ${clientTsPath}:`, err.message);
    }

    // Verify the copy was successful
    let stat;
    try {
      stat = await fsPromises.stat(directusDir);
    } catch (e) {
      stat = null;
    }
    if (stat && stat.isDirectory()) {
      console.log("📂 Directory structure created successfully");
    }

    // Remove the .directus folder
    await fsPromises.rm(".directus", { recursive: true, force: true });

  } catch (error) {
    console.error("❌ Error copying .directus folder:", error);
    console.log("💡 You may need to manually copy .directus to src/directus");
  }

  console.log("🎉 Your Directus client files are ready!");
  console.log("📁 Files available in: src/directus/");
})();