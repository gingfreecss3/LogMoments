import { db } from './db';
import { logger } from './logger';

export async function testDatabase() {
  try {
    logger.info('Testing database connection...');
    
    // Test if we can access the database
    const count = await db.moments.count();
    logger.info(`Found ${count} moments in the database`);
    
    // Test if we can add a test record
    const testMoment = {
      content: 'Test moment',
      feeling: 'Test',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: 'test-user',
      synced: 0
    };
    
    const id = await db.moments.add(testMoment);
    logger.debug('Added test moment with ID:', id);
    
    // Verify we can retrieve it
    const retrieved = await db.moments.get(id);
    logger.debug('Retrieved test moment:', retrieved);
    
    // Clean up
    await db.moments.delete(id);
    logger.debug('Cleaned up test moment');
    
    return true;
  } catch (error) {
    logger.error('Database test failed:', error);
    return false;
  }
}
