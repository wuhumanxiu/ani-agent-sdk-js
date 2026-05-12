import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

const root = path.resolve(import.meta.dirname, "..");
const protocol = path.join(root, "protocol");

test("required REST paths exist in OpenAPI snapshot", () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(protocol, "manifest.json"), "utf8"));
  const openapi = fs.readFileSync(path.join(protocol, "openapi.yaml"), "utf8");
  const routeContract = JSON.parse(fs.readFileSync(path.join(protocol, "routes.generated.json"), "utf8"));
  const routes = new Set(routeContract.routes.map((route) => route.path));

  for (const requiredPath of manifest.requiredRestPaths) {
    assert.match(openapi, new RegExp(escapeRegExp(requiredPath)));
    assert.ok(routes.has(requiredPath), requiredPath);
  }
});

test("required send fields exist in protocol contract", () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(protocol, "manifest.json"), "utf8"));
  const openapi = fs.readFileSync(path.join(protocol, "openapi.yaml"), "utf8");
  const wsSchema = fs.readFileSync(path.join(protocol, "ws-events.schema.json"), "utf8");

  for (const field of manifest.requiredSendFields) {
    assert.ok(openapi.includes(field) || wsSchema.includes(field), field);
  }
});

test("required WebSocket events exist in schema", () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(protocol, "manifest.json"), "utf8"));
  const schema = JSON.parse(fs.readFileSync(path.join(protocol, "ws-events.schema.json"), "utf8"));
  const events = new Set(schema.properties.type.enum);

  for (const eventName of manifest.requiredWebSocketEvents) {
    assert.ok(events.has(eventName), eventName);
  }
});

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
