export interface AniClientOptions {
  serverUrl: string;
  apiKey: string;
  fetchImpl?: typeof fetch;
}

export interface AniUser {
  id?: number;
  publicId: string;
  botId: string;
  displayName: string;
  entityType: string;
  raw: Record<string, unknown>;
}

export interface AniMessage {
  id?: number;
  conversationId?: number | string;
  conversationPublicId?: string;
  senderPublicId?: string;
  summary: string;
  mentions: number[];
  mentionPublicIds: string[];
  mentionRefs: MentionRef[];
  assignedPublicIds: string[];
  raw: Record<string, unknown>;
}

export interface MentionRef {
  publicId?: string;
  handle?: string;
  displayName?: string;
  entityType?: string;
  text?: string;
}

export interface SendTextOptions {
  conversationPublicId?: string;
  mentionPublicIds?: string[];
  mentionRefs?: MentionRef[];
  assignedPublicIds?: string[];
  replyTo?: number | string;
  contentType?: string;
}

export interface SendMessageResult {
  id?: number;
  ok: boolean;
  raw: Record<string, unknown>;
}

export interface CreateConversationOptions {
  title?: string;
  convType?: "direct" | "group" | "channel";
  participantPublicIds?: string[];
  sourcePublicId?: string;
  description?: string;
}
