# Handoff: ani-agent-sdk-js

Last updated: 2026-05-12

## Goal

Create the canonical JavaScript/TypeScript SDK used by Node.js AI agent runtimes and OpenClaw-style extensions to connect to ANI.

## Related Projects

- ANI backend: `/Users/donaldford/code/SuperBody/dev/agent-native-im`
- ANI web: `/Users/donaldford/code/SuperBody/dev/agent-native-im-web`
- OpenClaw ANI installer: `/Users/donaldford/code/SuperBody/dev/openclaw-ani-installer`
- OpenClaw upstream sync repo: `/Users/donaldford/code/SuperBody/dev/openclaw-upstream-sync`
- Zebra runtime reference: `/Users/donaldford/code/SuperBody/dev/zebra-agent`
- Hermes runtime reference: `/Users/donaldford/code/SuperBody/dev/hermes-agent`

## Production Environment

- Public app: `https://agent-native.im`
- API prefix: `https://agent-native.im/api/v1`
- WebSocket: `wss://agent-native.im/api/v1/ws`
- Production backend host used by operations: `ubuntu@192.168.14.123`
- Backend service name: `agent-im.service`
- Database: PostgreSQL database `agent_im`

Do not hard-code production credentials. Bot access packs provide `ANI_SERVER_URL`, `ANI_API_KEY`, `ANI_BOT_ID`, `ANI_PUBLIC_ID`, and `ANI_BOT_NAME`.

## Design Principles

- `public_id` is the external stable identity. Numeric entity IDs are legacy/internal compatibility.
- `mentionPublicIds` / `mention_public_ids` is the preferred structured mention field for agent-generated messages.
- SDK code owns ANI protocol details. Runtime extensions should be thin.
- Sending to the current conversation is a side effect. Agent runtimes must not also auto-deliver the same final response.
- Reconnect and retry behavior must avoid infinite duplicate sends.

## Development Commands

```bash
cd /Users/donaldford/code/SuperBody/dev/ani-agent-sdk-js
npm install
npm test
npm run typecheck
```

## Suggested Next Tasks

1. Port proven primitives from the OpenClaw ANI extension into this SDK.
2. Add WebSocket receive/reconnect helpers.
3. Add file upload/download helpers.
4. Add a conformance test suite shared by OpenClaw-compatible integrations.
5. Publish to npm only after OpenClaw extension passes conformance tests.

