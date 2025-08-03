import React from 'react';
import QuickCapture from '../components/QuickCapture';
import MomentsTimeline from '../components/MomentsTimeline';

// This component replaces the old Capture page content.
// The Header and Bottom Navigation are handled by the main Layout.
const CapturePage: React.FC = () => {
  return (
    // The min-h-screen and bg-neutral-50 can be applied to the main layout's content div
    <div className="bg-neutral-50">
      {/* The AppHeader is now part of the main layout */}
      
      <QuickCapture />

      <MomentsTimeline limit={3} />

      {/* The BottomNavigation is now part of the main layout */}
    </div>
  );
};

export default CapturePage;