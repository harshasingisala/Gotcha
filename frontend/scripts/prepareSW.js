import { existsSync, readFileSync, writeFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env");
const swTemplatePath = resolve(__dirname, "../public/firebase-messaging-sw.template.js");
const swOutputPath = resolve(__dirname, "../public/firebase-messaging-sw.js");

function readEnvFile(path) {
  if (!existsSync(path)) return {};
  return Object.fromEntries(
    readFileSync(path, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const index = line.indexOf("=");
        const key = line.slice(0, index).trim();
        const value = line.slice(index + 1).trim().replace(/^["']|["']$/g, "");
        return [key, value];
      })
  );
}

const fileEnv = readEnvFile(envPath);
const env = { ...fileEnv, ...process.env };

let sw = readFileSync(swTemplatePath, "utf8");
for (const key of [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID"
]) {
  sw = sw.replace(new RegExp(`__${key}__`, "g"), env[key] || "");
}

writeFileSync(swOutputPath, sw);
console.log("[prepareSW] firebase-messaging-sw.js written.");
