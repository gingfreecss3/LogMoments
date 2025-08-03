import React, { type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BarChart2, Plus, User, LayoutGrid } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const AppHeader: React.FC = () => {
    return (
        <header className="sticky top-0 z-20 bg-gradient-to-r from-purple-500 to-blue-500 p-4 sm:p-6 pt-6 sm:pt-8 pb-12 sm:pb-16 text-white text-center safe-area-inset-top">
            <div className="flex items-center justify-between max-w-md mx-auto">
                <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <div className="w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full"></div>
                    </div>
                    <div className="text-left">
                        <h1 className="text-lg sm:text-2xl font-bold">Thoughts</h1>
                        <p className="opacity-90 text-xs sm:text-sm">Moments that matter</p>
                    </div>
                </div>
                <button className="p-1.5 sm:p-2 rounded-lg hover:bg-white/10">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </button>
            </div>
        </header>
    );
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <div className="bg-neutral-50 min-h-screen">{children}</div>
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <AppHeader />
      <main className="relative z-10 pb-20 sm:pb-24">{children}</main>
      
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-neutral-200 grid grid-cols-4 items-center h-16 sm:h-20 z-20 safe-area-inset-bottom">
        <NavLink to="/timeline" className={({isActive}) => `flex flex-col items-center justify-center gap-1 h-full ${isActive ? 'text-purple-500' : 'text-neutral-500'}`}>
          <LayoutGrid className="h-4 w-4 sm:h-5 sm:w-5"/>
          <span className="text-xs">Timeline</span>
        </NavLink>
        
        <NavLink to="/insights" className={({isActive}) => `flex flex-col items-center justify-center gap-1 h-full ${isActive ? 'text-purple-500' : 'text-neutral-500'}`}>
          <BarChart2 className="h-4 w-4 sm:h-5 sm:w-5"/>
          <span className="text-xs">Insights</span>
        </NavLink>

        <div className="flex justify-center">
            <NavLink to="/" className="w-12 h-12 sm:w-16 sm:h-16 -mt-6 sm:-mt-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white shadow-lg">
                <Plus className="h-6 w-6 sm:h-8 sm:w-8"/>
            </NavLink>
        </div>
        
        <NavLink to="/profile" className={({isActive}) => `flex flex-col items-center justify-center gap-1 h-full ${isActive ? 'text-purple-500' : 'text-neutral-500'}`}>
          <User className="h-4 w-4 sm:h-5 sm:w-5"/>
          <span className="text-xs">Profile</span>
        </NavLink>
    </nav>
    </div>
  );
};

export default Layout;