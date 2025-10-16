import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { offlineStorage } from '../lib/offlineStorage';
import type { OfflineMoment } from '../lib/offlineStorage';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { Heart, WifiOff } from 'lucide-react';

interface MomentsTimelineProps {
  limit?: number;
  searchQuery?: string;
}

export default function MomentsTimeline({ limit, searchQuery = '' }: MomentsTimelineProps) {
  const { user } = useAuth();
  const { isOnline } = useNetworkStatus();
  const [offlineMoments, setOfflineMoments] = useState<OfflineMoment[]>([]);

  useEffect(() => {
    const loadOfflineMoments = async () => {
      const moments = await offlineStorage.getOfflineMoments();
      setOfflineMoments(moments);
    };
    loadOfflineMoments();
  }, []);

  const { data: onlineMoments = [], isLoading } = useQuery({
    queryKey: ['moments', user?.id, searchQuery],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase
        .from('moments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (searchQuery.trim()) {
        query = query.ilike('content', `%${searchQuery}%`);
      }

      const { data, error } = await query.limit(limit || 10);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user && isOnline,
  });

  const filteredOfflineMoments = useMemo(() => {
    return searchQuery.trim() 
      ? offlineMoments.filter((moment: OfflineMoment) => 
          moment.content.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : offlineMoments;
  }, [offlineMoments, searchQuery]);

  const allMoments = useMemo(() => {
    return [...filteredOfflineMoments, ...onlineMoments]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit || 10);
  }, [filteredOfflineMoments, onlineMoments, limit]);

  if (isLoading && isOnline) {
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
          <p className="text-gray-500">
            {searchQuery.trim() 
              ? `No moments found for "${searchQuery}"`
              : 'No moments yet. Start capturing your thoughts!'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {allMoments.map((moment) => (
            <div key={moment.id} className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {moment.photo && (
                    <div className="mb-3 rounded-lg overflow-hidden">
                      <img 
                        src={moment.photo} 
                        alt="Moment" 
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  )}
                  <p className="text-gray-900 mb-2">{moment.content}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{moment.feeling}</span>
                    <span>{format(new Date(moment.created_at), 'MMM d, h:mm a')}</span>
                    {moment.isOffline && !moment.synced && (
                      <span className="text-yellow-600 flex items-center">
                        <WifiOff className="w-3 h-3 mr-1" />
                        Offline
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}