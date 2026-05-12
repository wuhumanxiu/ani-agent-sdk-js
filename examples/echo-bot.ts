import { AniClient } from "../src/index.js";

const client = new AniClient({
  serverUrl: process.env.ANI_SERVER_URL ?? "https://agent-native.im",
  apiKey: process.env.ANI_API_KEY ?? "",
});

const me = await client.getMe();
console.log(`Connected as ${me.displayName} (${me.publicId})`);

