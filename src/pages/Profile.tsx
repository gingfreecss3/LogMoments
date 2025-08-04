import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { useAuth } from '../context/AuthContext';
import {type Moment } from '../types';
import { Download, Trash2,  Shield, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfilePage: React.FC = () => {
  const { user, signOut } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: moments = [] } = useQuery<Moment[]>({
    queryKey: ['moments'],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from('moments').select('*').eq('user_id', user.id);
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!user,
  });

  const clearDataMutation = useMutation({
    mutationFn: async () => {
      if(!user) throw new Error("User not found");
      const { error } = await supabase.from('moments').delete().eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moments'] });
      alert("All your moments have been deleted.");
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      alert(`Error clearing data: ${message}`);
    }
  });

  const handleExportData = () => {
    const dataStr = JSON.stringify(moments, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `thoughts-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    link.remove();
    alert("Data exported successfully!");
  };

  const handleClearData = () => {
    if (window.confirm("Are you sure you want to delete all your moments? This action cannot be undone.")) {
      clearDataMutation.mutate();
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div >
      <section className="px-6 pb-24 pt-1 relative z-10 space-y-4">
        <div className="p-6 bg-white rounded-2xl border">
          <h2 className="text-lg font-medium text-neutral-900 mb-4">Your Journey</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-600">Total moments captured</span>
              <span className="font-semibold text-neutral-900">{moments.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-600">Data storage</span>
              <span className="text-neutral-500">Supabase Cloud</span>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white rounded-2xl border">
          <h2 className="text-lg font-medium text-neutral-900 flex items-center mb-4">
            <Shield className="h-5 w-5 mr-2 text-primary" />
            Privacy & Data
          </h2>
          <div className="space-y-3">
            <button onClick={handleExportData} disabled={moments.length === 0} className="w-full flex items-center p-3 text-sm rounded-lg border hover:bg-neutral-50 disabled:opacity-50">
              <Download className="h-4 w-4 mr-3" />
              Export your data
            </button>
            <button onClick={handleClearData} disabled={moments.length === 0 || clearDataMutation.isPending} className="w-full flex items-center p-3 text-sm rounded-lg border border-destructive/50 text-destructive hover:bg-destructive hover:text-white disabled:opacity-50">
              <Trash2 className="h-4 w-4 mr-3" />
              {clearDataMutation.isPending ? 'Clearing...' : 'Clear all data'}
            </button>
          </div>
        </div>
        
        <div className="p-6 bg-white rounded-2xl border">
           <h2 className="text-lg font-medium text-neutral-900 mb-4">Account</h2>
           <button onClick={handleSignOut} className="w-full flex items-center p-3 text-sm rounded-lg border hover:bg-neutral-50">
                <LogOut className="h-4 w-4 mr-3" />
                Sign Out
            </button>
        </div>
      </section>
    </div>
  );
};

export default ProfilePage;