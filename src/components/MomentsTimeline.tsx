import { useLiveQuery} from 'dexie-react-hooks';
import { useEffect } from 'react';
import { format } from 'date-fns';
import { Heart, WifiOff, Share2 } from 'lucide-react';
import { db } from '../lib/db';
import { useShare } from '../hooks/useShare';

interface MomentsTimelineProps {
  limit?: number;
}

export default function MomentsTimeline({ limit }: MomentsTimelineProps) {
  const { shareMoment, isSharing } = useShare();

  const allMoments = useLiveQuery(async () => {
    try {
      const dbInfo = await db.moments.count();
      console.log('Total moments in database:', dbInfo);
      
      const collection = db.moments.orderBy('created_at').reverse();
      const moments = limit ? await collection.limit(limit).toArray() : await collection.toArray();
      
      console.log('Retrieved moments:', moments);
      return moments;
    } catch (error) {
      console.error('Error loading moments:', error);
      try {
        const dbInfo = await db.moments.toArray();
        console.log('Raw database content:', dbInfo);
      } catch (e) {
        console.error('Could not access database at all:', e);
      }
      return [];
    }
  }, [limit]);
  
  useEffect(() => {
    console.log('MomentsTimeline updated with moments:', allMoments);
  }, [allMoments]);

  if (!allMoments) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-20 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Your moments</h3>
        <button className="text-purple-600 text-sm font-medium">View all</button>
      </div>

      {allMoments.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500">No moments yet. Start capturing your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {allMoments.map((moment) => (
            <div key={moment.id} className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-gray-900 mb-2">{moment.content}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{moment.feeling}</span>
                    <span>{format(new Date(moment.created_at), 'MMM d, h:mm a')}</span>
                    {!moment.synced && (
                      <span className="text-yellow-600 flex items-center">
                        <WifiOff className="w-3 h-3 mr-1" />
                        Offline
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => shareMoment(moment.content, moment.feeling)}
                  disabled={isSharing}
                  className="ml-4 p-2 text-gray-400 hover:text-purple-600 transition-colors"
                  title="Share moment"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}