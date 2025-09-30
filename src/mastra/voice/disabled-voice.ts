import { MastraVoice } from '@mastra/core/voice';

/**
 * Minimal voice implementation that keeps the runtime happy while explicitly disabling voice features.
 */
export class DisabledVoice extends MastraVoice {
  async speak(): Promise<NodeJS.ReadableStream | void> {
    throw new Error('Voice features are disabled for this agent.');
  }

  async listen(): Promise<string | NodeJS.ReadableStream | void> {
    throw new Error('Voice features are disabled for this agent.');
  }

  async getSpeakers(): Promise<Array<{ voiceId: string }>> {
    return [];
  }

  async getListener(): Promise<{ enabled: boolean }> {
    return { enabled: false };
  }
}
