import Dexie, { Table } from 'dexie';

export interface StrategyRevision {
  id?: number;
  strategyId: string;
  revisionId: string;
  timestamp: number;
  data: {
    name: string;
    conditions: Array<{
      id: number;
      text: string;
      importance: 'high' | 'medium' | 'low';
    }>;
  };
  changeDescription?: string;
  userId?: string; // For future multi-user support
}

export interface StrategyMeta {
  strategyId: string;
  currentRevisionId: string;
  createdAt: number;
  updatedAt: number;
  totalRevisions: number;
}

class StrategyVersioningDB extends Dexie {
  revisions!: Table<StrategyRevision>;
  metadata!: Table<StrategyMeta>;

  constructor() {
    super('TradingChecklistVersioning');
    
    this.version(1).stores({
      revisions: '++id, strategyId, revisionId, timestamp',
      metadata: 'strategyId, currentRevisionId, updatedAt'
    });
  }
}

const db = new StrategyVersioningDB();

export class StrategyVersionManager {
  static async saveRevision(
    strategyId: string, 
    strategyData: StrategyRevision['data'],
    changeDescription?: string
  ): Promise<string> {
    const revisionId = `rev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = Date.now();

    // Save the revision
    await db.revisions.add({
      strategyId,
      revisionId,
      timestamp,
      data: JSON.parse(JSON.stringify(strategyData)), // Deep clone
      changeDescription
    });

    // Update metadata
    const existingMeta = await db.metadata.get(strategyId);
    if (existingMeta) {
      await db.metadata.update(strategyId, {
        currentRevisionId: revisionId,
        updatedAt: timestamp,
        totalRevisions: existingMeta.totalRevisions + 1
      });
    } else {
      await db.metadata.add({
        strategyId,
        currentRevisionId: revisionId,
        createdAt: timestamp,
        updatedAt: timestamp,
        totalRevisions: 1
      });
    }

    return revisionId;
  }

  static async getRevisionHistory(strategyId: string): Promise<StrategyRevision[]> {
    return await db.revisions
      .where('strategyId')
      .equals(strategyId)
      .reverse()
      .sortBy('timestamp');
  }

  static async getRevision(strategyId: string, revisionId: string): Promise<StrategyRevision | undefined> {
    return await db.revisions
      .where(['strategyId', 'revisionId'])
      .equals([strategyId, revisionId])
      .first();
  }

  static async restoreRevision(strategyId: string, revisionId: string): Promise<StrategyRevision['data'] | null> {
    const revision = await this.getRevision(strategyId, revisionId);
    if (!revision) return null;

    // Update current revision in metadata
    await db.metadata.update(strategyId, {
      currentRevisionId: revisionId,
      updatedAt: Date.now()
    });

    return revision.data;
  }

  static async deleteStrategy(strategyId: string): Promise<void> {
    await db.revisions.where('strategyId').equals(strategyId).delete();
    await db.metadata.delete(strategyId);
  }

  static async getStrategyStats(strategyId: string): Promise<{
    totalRevisions: number;
    firstCreated: number;
    lastModified: number;
  } | null> {
    const meta = await db.metadata.get(strategyId);
    if (!meta) return null;

    return {
      totalRevisions: meta.totalRevisions,
      firstCreated: meta.createdAt,
      lastModified: meta.updatedAt
    };
  }

  // Utility for generating diff between revisions
  static generateDiff(oldData: StrategyRevision['data'], newData: StrategyRevision['data']) {
    const changes: Array<{
      type: 'added' | 'removed' | 'modified' | 'name_changed';
      field: string;
      oldValue?: StrategyRevision['data']['conditions'][0] | string;
      newValue?: StrategyRevision['data']['conditions'][0] | string;
    }> = [];

    // Check name change
    if (oldData.name !== newData.name) {
      changes.push({
        type: 'name_changed',
        field: 'name',
        oldValue: oldData.name,
        newValue: newData.name
      });
    }

    // Check conditions changes
    const oldConditions = new Map(oldData.conditions.map(c => [c.id, c]));
    const newConditions = new Map(newData.conditions.map(c => [c.id, c]));

    // Find added conditions
    for (const [id, condition] of newConditions) {
      if (!oldConditions.has(id)) {
        changes.push({
          type: 'added',
          field: 'condition',
          newValue: condition
        });
      }
    }

    // Find removed conditions
    for (const [id, condition] of oldConditions) {
      if (!newConditions.has(id)) {
        changes.push({
          type: 'removed',
          field: 'condition',
          oldValue: condition
        });
      }
    }

    // Find modified conditions
    for (const [id, newCondition] of newConditions) {
      const oldCondition = oldConditions.get(id);
      if (oldCondition && 
          (oldCondition.text !== newCondition.text || 
           oldCondition.importance !== newCondition.importance)) {
        changes.push({
          type: 'modified',
          field: 'condition',
          oldValue: oldCondition,
          newValue: newCondition
        });
      }
    }

    return changes;
  }
}

export default StrategyVersionManager; 