import Dexie, { type Table, type Transaction } from 'dexie';
import { logger } from './logger';
import { DB_CONFIG } from './constants';

export interface Moment {
  id?: number; // Auto-incrementing primary key from Dexie
  serverId?: string; // The ID from the Supabase server, once synced
  content: string;
  feeling: string;
  photo?: string; // Base64 data URL of photo attachment
  created_at: string;
  updated_at: string; // Track when the moment was last updated
  user_id: string;
  synced: number; // Using number (0/1) for IndexedDB compatibility
  last_sync_attempt?: string; // Track when we last tried to sync this moment
}

export interface UserPreferences {
  id?: number;
  storageMode: 'local' | 'cloud';
  lastSynced?: string;
  userId: string;
}

export class MySubClassedDexie extends Dexie {
  moments!: Table<Moment>;
  preferences!: Table<UserPreferences>;

  constructor() {
    super(DB_CONFIG.NAME);
    
    logger.info('Initializing database...');
    
    // Version 1: Initial schema
    this.version(1).stores({
      moments: '++id, serverId, created_at, user_id, synced, updated_at, last_sync_attempt',
      preferences: '++id, userId'
    });

    // Version 2: Ensure all required fields are present
    this.version(2).stores({
      moments: '++id, serverId, created_at, user_id, synced, updated_at, last_sync_attempt',
      preferences: '++id, userId'
    }).upgrade(_tx => {
      // Migration logic for version 2 if needed
    });

    // Version 3: Current schema with all required fields
    this.version(3).stores({
      moments: '++id, serverId, created_at, user_id, synced, updated_at, last_sync_attempt',
      preferences: '++id, userId',
      // Add any new indexes here without changing primary keys
    });
    
    // Migration logic for version 3
    this.version(3).upgrade(async (tx: Transaction) => {
      logger.info('Running database migration to version 3...');
      
      try {
        // Ensure moments table exists and has data
        const momentsTable = tx.table('moments');
        const momentsCount = await momentsTable.count();
        logger.info(`Found ${momentsCount} moments to migrate`);
        
        // If we have moments, update them to the new schema
        if (momentsCount > 0) {
          const moments = await momentsTable.toCollection().toArray();
          
          for (const moment of moments) {
            const updates: Partial<Moment> = {};
            
            // Ensure synced is a number
            if (typeof moment.synced === 'boolean') {
              updates.synced = moment.synced ? 1 : 0;
              logger.debug(`Updating moment ${moment.id}: converted synced from boolean to number`);
            } else if (typeof moment.synced === 'undefined') {
              updates.synced = 0;
              logger.debug(`Updating moment ${moment.id}: set default synced=0`);
            }
            
            // Ensure updated_at exists
            if (!moment.updated_at) {
              updates.updated_at = moment.created_at || new Date().toISOString();
              logger.debug(`Updating moment ${moment.id}: added updated_at`);
            }
            
            // Only update if we have changes
            if (Object.keys(updates).length > 0) {
              await momentsTable.update(moment.id as number, updates);
            }
          }
        }
        
        // Ensure we have a default preferences record
        const preferencesTable = tx.table('preferences');
        const hasPreferences = await preferencesTable.count() > 0;
        
        if (!hasPreferences) {
          await preferencesTable.add({
            id: 1,
            storageMode: 'cloud',
            userId: 'default-user',
            lastSynced: new Date().toISOString()
          });
          logger.info('Added default preferences record');
        }
        
        logger.info('Database migration completed successfully');
      } catch (error) {
        logger.error('Migration error:', error);
        throw error;
      }
    });
    
    // Set up event handlers
    this.setupEventHandlers();
  }
  
  private setupEventHandlers() {
    // Log when database is opened
    this.on('ready', () => {
      logger.info('Database is ready');
      logger.debug('Database name:', this.name);
      logger.debug('Database version:', this.verno);
      
      // Log the current schema
      this.tables.forEach(table => {
        logger.debug(`Table: ${table.name}, Schema: ${table.schema.primKey.keyPath}`);
        logger.debug('Indexes:', table.schema.indexes);
      });
    });
    
    // Log database close events
    this.on('close', () => {
      logger.info('Database connection closed');
    });
    
    // Handle global errors
    window.addEventListener('error', (event) => {
      logger.error('Global error:', event.error || event);
    });
  }
}

export const db = new MySubClassedDexie();
