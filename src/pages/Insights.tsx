import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { useAuth } from '../context/AuthContext';
import {type  Moment } from '../types';
import { BarChart3, Heart, Calendar, TrendingUp } from 'lucide-react';

const InsightsPage: React.FC = () => {
  const { user } = useAuth();
  const { data: moments = [] } = useQuery<Moment[]>({
    queryKey: ['moments'], // Use the same query key to get cached data
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from('moments').select('*').eq('user_id', user.id);
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!user,
  });

  const totalMoments = moments.length;
  const thisWeekMoments = moments.filter(moment => {
    const momentDate = new Date(moment.created_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return momentDate >= weekAgo;
  }).length;

  const moodCounts = moments.reduce((acc, moment) => {
    if (moment.feeling) {
      acc[moment.feeling] = (acc[moment.feeling] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const topMood = Object.entries(moodCounts).sort(([,a], [,b]) => b - a)[0];

  return (
    <div className="-mt-16">
      <section className="px-6 pb-6 pt-1 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg border border-neutral-100 p-6">
          <h2 className="text-lg font-medium text-neutral-900 mb-6">Your emotional journey</h2>
          
          {totalMoments === 0 ? (
             <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                <h3 className="text-neutral-600 font-medium mb-2">No insights yet</h3>
                <p className="text-neutral-500 text-sm">Start capturing moments to see your emotional patterns</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-white rounded-lg border">
                  <h3 className="text-sm font-medium text-neutral-600 flex items-center mb-1">
                    <Heart className="h-4 w-4 mr-2 text-pink-500" />
                    Total Moments
                  </h3>
                  <div className="text-2xl font-bold text-neutral-900">{totalMoments}</div>
                </div>

                <div className="p-4 bg-white rounded-lg border">
                   <h3 className="text-sm font-medium text-neutral-600 flex items-center mb-1">
                    <Calendar className="h-4 w-4 mr-2 text-primary" />
                    This Week
                  </h3>
                  <div className="text-2xl font-bold text-neutral-900">{thisWeekMoments}</div>
                </div>
              </div>

              {topMood && (
                <div className="p-4 bg-white rounded-lg border">
                  <h3 className="text-sm font-medium text-neutral-600 flex items-center mb-1">
                    <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
                    Most Common Mood
                  </h3>
                  <div className="text-lg font-semibold text-neutral-900 capitalize">{topMood[0]}</div>
                  <div className="text-sm text-neutral-500">{topMood[1]} moments</div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default InsightsPage;