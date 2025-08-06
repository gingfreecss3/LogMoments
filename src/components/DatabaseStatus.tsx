import { useEffect, useState } from 'react';
import { db } from '../lib/db';

interface TableInfo {
  name: string;
  schema: {
    primKey: {
      keyPath: string | string[];
    };
    indexes: Record<string, any>;
  };
}

export function DatabaseStatus() {
  const [status, setStatus] = useState('Checking database...');
  const [error, setError] = useState<string | null>(null);
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [momentsCount, setMomentsCount] = useState<number | null>(null);

  useEffect(() => {
    const checkDatabase = async () => {
      try {
        // Check if database is open
        if (!db.isOpen()) {
          setStatus('Database is not open. Trying to open...');
          await db.open();
        }

        setStatus('Database is open. Checking tables...');
        
        // Get table info
        const dbTables = db.tables.map((table: any) => ({
          name: table.name,
          schema: {
            primKey: {
              keyPath: table.schema.primKey.keyPath
            },
            indexes: table.schema.indexes
          }
        }));
        
        setTables(dbTables);
        
        // Get moments count
        const count = await db.moments.count();
        setMomentsCount(count);
        
        setStatus('Database check completed successfully');
      } catch (err) {

        setError(`Error: ${err instanceof Error ? err.message : String(err)}`);
        setStatus('Database check failed');
      }
    };

    checkDatabase();
  }, []);

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-medium mb-2">Database Status</h3>
      <div className="space-y-2">
        <div>
          <span className="font-medium">Status:</span> {status}
        </div>
        {error && (
          <div className="text-red-600 p-2 bg-red-50 rounded">
            {error}
          </div>
        )}
        <div>
          <span className="font-medium">Moments in database:</span> {momentsCount ?? 'Loading...'}
        </div>
        {tables.length > 0 && (
          <div>
            <h4 className="font-medium mt-2">Tables:</h4>
            <ul className="list-disc pl-5">
              {tables.map((table, index) => (
                <li key={index}>
                  {table.name} (Primary key: {table.schema.primKey.keyPath})
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
