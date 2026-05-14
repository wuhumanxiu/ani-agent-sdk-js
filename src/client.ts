import type { AniClientOptions, AniUser, CreateConversationOptions, SendMessageResult, SendTextOptions } from "./types.js";

interface ApiEnvelope {
  ok?: boolean;
  data?: unknown;
  error?: unknown;
}

export class AniClient {
  readonly serverUrl: string;
  readonly apiKey: string;
  private readonly fetchImpl: typeof fetch;

  constructor(options: AniClientOptions) {
    this.serverUrl = options.serverUrl.replace(/\/+$/, "");
    this.apiKey = options.apiKey;
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  get apiBaseUrl(): string {
    return `${this.serverUrl}/api/v1`;
  }

  get wsUrl(): string {
    const wsBase = this.serverUrl
      .replace(/^https:\/\//, "wss://")
      .replace(/^http:\/\//, "ws://");
    const params = new URLSearchParams({ token: this.apiKey });
    return `${wsBase}/api/v1/ws?${params.toString()}`;
  }

  async getMe(): Promise<AniUser> {
    const data = await this.request("GET", "/me");
    const record = asRecord(data);
    return {
      id: typeof record.id === "number" ? record.id : undefined,
      publicId: asString(record.public_id),
      botId: asString(record.bot_id),
      displayName: asString(record.display_name ?? record.name),
      entityType: asString(record.entity_type),
      raw: record,
    };
  }

  async sendText(
    conversationId: number | string,
    text: string,
    options: SendTextOptions = {},
  ): Promise<SendMessageResult> {
    const payload: Record<string, unknown> = {
      content_type: options.contentType ?? "text",
      layers: { summary: text },
    };
    if (options.conversationPublicId) {
      payload.conversation_public_id = options.conversationPublicId;
    } else if (typeof conversationId === "string" && !/^\d+$/.test(conversationId.trim())) {
      payload.conversation_public_id = conversationId;
    } else {
      payload.conversation_id = conversationId;
    }

    if (options.mentionPublicIds?.length) {
      payload.mention_public_ids = options.mentionPublicIds;
    }
    if (options.mentionRefs?.length) {
      payload.mention_refs = options.mentionRefs.map((ref) => ({
        public_id: ref.publicId,
        handle: ref.handle,
        display_name: ref.displayName,
        entity_type: ref.entityType,
        text: ref.text,
      }));
    }
    if (options.assignedPublicIds !== undefined) {
      payload.assigned_public_ids = options.assignedPublicIds;
    }
    if (options.replyTo) {
      payload.reply_to = Number(options.replyTo);
    }

    const data = await this.request("POST", "/messages/send", payload);
    const record = asRecord(data);
    const id = record.id ?? record.message_id;
    return {
      id: typeof id === "number" ? id : undefined,
      ok: true,
      raw: record,
    };
  }

  async createConversation(options: CreateConversationOptions = {}): Promise<Record<string, unknown>> {
    const payload: Record<string, unknown> = {
      conv_type: options.convType ?? "direct",
      participant_public_ids: options.participantPublicIds ?? [],
    };
    if (options.title) payload.title = options.title;
    if (options.description) payload.description = options.description;
    if (options.sourcePublicId) payload.source_public_id = options.sourcePublicId;
    return asRecord(await this.request("POST", "/conversations", payload));
  }

  async batchPresence(publicIds: string[]): Promise<Record<string, boolean>> {
    const data = asRecord(await this.request("POST", "/presence/batch", { public_ids: publicIds }));
    const presence = asRecord(data.presence_by_public_id);
    return Object.fromEntries(Object.entries(presence).map(([key, value]) => [key, Boolean(value)]));
  }

  private async request(method: string, path: string, body?: unknown): Promise<unknown> {
    const response = await this.fetchImpl(`${this.apiBaseUrl}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`ANI request failed: ${response.status} ${response.statusText}`);
    }

    const envelope = (await response.json()) as ApiEnvelope;
    if (envelope.ok === false) {
      throw new Error(`ANI error: ${JSON.stringify(envelope.error ?? envelope)}`);
    }
    return Object.prototype.hasOwnProperty.call(envelope, "data") ? envelope.data : envelope;
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}
