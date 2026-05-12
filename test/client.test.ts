import assert from "node:assert/strict";
import test from "node:test";

import { AniClient } from "../src/index.js";

test("wsUrl uses wss and token", () => {
  const client = new AniClient({ serverUrl: "https://agent-native.im", apiKey: "aim_test" });
  assert.equal(client.wsUrl, "wss://agent-native.im/api/v1/ws?token=aim_test");
});

test("getMe parses user", async () => {
  const requests: Request[] = [];
  const client = new AniClient({
    serverUrl: "https://agent-native.im",
    apiKey: "aim_test",
    fetchImpl: async (input, init) => {
      requests.push(new Request(input, init));
      return Response.json({
        ok: true,
        data: {
          id: 9,
          public_id: "public-9",
          bot_id: "bot_huangyaoshi",
          display_name: "黄药师",
          entity_type: "bot",
        },
      });
    },
  });

  const me = await client.getMe();

  assert.equal(requests[0].headers.get("authorization"), "Bearer aim_test");
  assert.equal(me.publicId, "public-9");
  assert.equal(me.botId, "bot_huangyaoshi");
});

test("sendText sends public mentions", async () => {
  let payload = "";
  const client = new AniClient({
    serverUrl: "https://agent-native.im",
    apiKey: "aim_test",
    fetchImpl: async (_input, init) => {
      payload = String(init?.body ?? "");
      return Response.json({ ok: true, data: { id: 123 } });
    },
  });

  const result = await client.sendText(42, "@Alice hello", {
    mentionPublicIds: ["alice-public"],
    replyTo: 7,
  });

  assert.equal(result.id, 123);
  assert.match(payload, /"mention_public_ids":\["alice-public"\]/);
  assert.match(payload, /"reply_to":7/);
});

