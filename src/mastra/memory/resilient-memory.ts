import type { SharedMemoryConfig } from '@mastra/core/memory';
import { Memory } from '@mastra/memory';
import type { StorageThreadType } from '@mastra/core/memory';

interface ResilientMemoryConfig extends SharedMemoryConfig {
  defaultResourceId: string;
}

/**
 * Ensures that thread lookups always return a valid record so the UI can load without 404s.
 */
export class ResilientMemory extends Memory {
  private readonly defaultResourceId: string;

  constructor({ defaultResourceId, ...config }: ResilientMemoryConfig) {
    super(config);
    this.defaultResourceId = defaultResourceId;
  }

  async getThreadById({ threadId }: { threadId: string }): Promise<StorageThreadType | null> {
    const existingThread = await super.getThreadById({ threadId });
    if (existingThread) {
      return existingThread;
    }

    return this.createThread({
      threadId,
      resourceId: this.defaultResourceId,
      saveThread: true,
    });
  }
}
