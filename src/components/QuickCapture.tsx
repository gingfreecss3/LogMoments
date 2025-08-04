import React, { useState, useEffect } from "react";
import { Heart, Edit3, Wifi, WifiOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase";
import { format } from "date-fns";
import { offlineStorage } from "../lib/offlineStorage";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import { syncService } from "../lib/syncService";

// Simple mood detection based on keywords
const detectMood = (text: string): string => {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('miss') || lowerText.includes('longing')) return 'Longing';
  if (lowerText.includes('happy') || lowerText.includes('joy')) return 'Happy';
  if (lowerText.includes('sad') || lowerText.includes('down')) return 'Sad';
  if (lowerText.includes('excited') || lowerText.includes('thrilled')) return 'Excited';
  if (lowerText.includes('nostalgic') || lowerText.includes('remember')) return 'Nostalgic';
  if (lowerText.includes('hope') || lowerText.includes('dream')) return 'Hopeful';
  return 'Reflective';
};

export default function QuickCapture() {
  const [content, setContent] = useState("");
  const [customDateTime, setCustomDateTime] = useState<Date | null>(null);
  const [isAdjustingTime, setIsAdjustingTime] = useState(false);
  const [offlineMessage, setOfflineMessage] = useState("");
  
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { isOnline } = useNetworkStatus();
  const now = new Date();

  // Start auto sync when component mounts
  useEffect(() => {
    syncService.startAutoSync();
  }, []);

  const createMomentMutation = useMutation({
    mutationFn: async (newMoment: { content: string; feeling: string; created_at: string; user_id: string }) => {
      if (!isOnline) {
        // Save to offline storage
        const offlineMoment = offlineStorage.saveMoment(newMoment);
        setOfflineMessage("Saved offline - will sync when connected");
        setTimeout(() => setOfflineMessage(""), 3000);
        return offlineMoment;
      }

      const { error } = await supabase.from('moments').insert(newMoment);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moments'] });
      setContent("");
      setCustomDateTime(null);
      setIsAdjustingTime(false);
      
      if (isOnline) {
        alert("Moment captured!");
      }
    },
    onError: (error: any) => {
      alert(`Error: ${error.message}`);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user) return;

    const momentData = {
      content: content.trim(),
      feeling: detectMood(content),
      created_at: (customDateTime || now).toISOString(),
      user_id: user.id,
    };

    createMomentMutation.mutate(momentData);
  };

  const displayDate = customDateTime || now;

  const setTimePreset = (date: Date) => {
    setCustomDateTime(date);
  };

  return (<section className="p-4 sm:p-6 relative z-10">
    
      <div className="bg-white rounded-2xl shadow-lg border border-neutral-100 p-4 sm:p-6">
        {/* Network Status Indicator */}
        <div className="flex items-center justify-center mb-4">
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs ${
            isOnline 
              ? 'bg-green-100 text-green-700' 
              : 'bg-yellow-100 text-yellow-700'
          }`}>
            {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            <span>{isOnline ? 'Online' : 'Offline'}</span>
          </div>
        </div>

        {/* Offline Message */}
        {offlineMessage && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-700 text-sm">{offlineMessage}</p>
          </div>
        )}

        <div className="text-center mb-6">
          <h2 className="text-xl font-medium text-neutral-900 mb-2">How are you feeling?</h2>
          <p className="text-neutral-500 text-sm">Capture this moment and make it last</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Time Adjuster */}
          <div className="flex items-center justify-between bg-neutral-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className={`w-2 h-2 rounded-full ${isAdjustingTime ? 'bg-purple-500' : 'bg-neutral-400'}`}></div>
              <div>
                <div className="text-sm font-medium text-neutral-900">{format(displayDate, "EEEE, MMM d")}</div>
                <div className="text-xs text-neutral-500">{format(displayDate, "h:mm a")}</div>
              </div>
            </div>
            <button 
              type="button"
              onClick={() => setIsAdjustingTime(!isAdjustingTime)}
              className="h-8 px-3 text-xs text-purple-500 hover:bg-purple-50 font-medium rounded-md flex items-center"
            >
              <Edit3 className="h-3 w-3 mr-1" />
              {isAdjustingTime ? "Use Now" : "Adjust"}
            </button>
          </div>
          
          {isAdjustingTime && (
             <div className="bg-neutral-50 rounded-xl p-4 space-y-4">
               <div className="text-center">
                  <h4 className="text-sm font-medium text-neutral-700 mb-1">When did this happen?</h4>
                  <p className="text-xs text-neutral-500">Choose a time that feels right</p>
                </div>
              <div className="grid grid-cols-2 gap-3">
                 <button type="button" onClick={() => setTimePreset(new Date(now.getTime() - 3600000))} className="h-12 flex flex-col items-center justify-center border border-neutral-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-xs">1 hour ago</button>
                 <button type="button" onClick={() => setTimePreset(new Date(new Date().setHours(9,0,0,0)))} className="h-12 flex flex-col items-center justify-center border border-neutral-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-xs">This morning</button>
              </div>
               <div className="border-t border-neutral-200 pt-4">
                  <label htmlFor="datetime" className="text-sm font-medium text-neutral-700 mb-2 block">Or pick a specific time</label>
                  <input
                    id="datetime" type="datetime-local"
                    onChange={(e) => setCustomDateTime(new Date(e.target.value))}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
             </div>
          )}
          
          {/* Text Area */}
          <div className="relative">
            <textarea 
              className="w-full h-32 p-4 border border-neutral-200 rounded-xl resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 placeholder-neutral-400"
              placeholder="What's on your mind? Every feeling matters..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={createMomentMutation.isPending}
            />
          </div>
          
          {/* Submit Button */}
          <button 
            type="submit"
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 rounded-xl font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:transform-none"
            disabled={!content.trim() || createMomentMutation.isPending}
          >
            <Heart className="h-4 w-4 mr-2" />
            {createMomentMutation.isPending ? "Capturing..." : "Capture this moment"}
          </button>
        </form>
      </div>
    </section>
  );
}