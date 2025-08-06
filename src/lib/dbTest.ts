import { db } from './db';

export async function testDatabase() {
  try {
    console.log('Testing database connection...');
    
    // Test if we can access the database
    const count = await db.moments.count();
    console.log(`Found ${count} moments in the database`);
    
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
    console.log('Added test moment with ID:', id);
    
    // Verify we can retrieve it
    const retrieved = await db.moments.get(id);
    console.log('Retrieved test moment:', retrieved);
    
    // Clean up
    await db.moments.delete(id);
    console.log('Cleaned up test moment');
    
    return true;
  } catch (error) {
    console.error('Database test failed:', error);
    return false;
  }
}

// Run the test when this module is imported
// This will help us see the results in the browser console
testDatabase().then(success => {
  console.log('Database test completed:', success ? 'SUCCESS' : 'FAILED');
});
