import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.resolve(root, "../agent-native-im/docs/protocol");
const target = path.join(root, "protocol");
const files = ["manifest.json", "openapi.yaml", "routes.generated.json", "ws-events.schema.json"];

if (!fs.existsSync(source)) {
  console.error(`protocol source not found: ${source}`);
  process.exit(1);
}

fs.mkdirSync(target, { recursive: true });
for (const file of files) {
  fs.copyFileSync(path.join(source, file), path.join(target, file));
  console.log(`updated protocol/${file}`);
}
