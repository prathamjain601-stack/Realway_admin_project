import React from 'react';
import { Settings } from 'lucide-react';

const MaintenanceView = () => {
  return (
    <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-dark-bg/50 border border-dark-border rounded-2xl p-8 text-center space-y-6">
        <div className="w-20 h-20 bg-primary-500/10 rounded-full flex items-center justify-center mx-auto border border-primary-500/20">
          <Settings size={40} className="text-primary-400 animate-spin-slow" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white tracking-tight">System Maintenance</h1>
          <p className="text-gray-400 text-sm">
            We are currently performing scheduled maintenance to improve our services.
            The system will be back online shortly. We apologize for any inconvenience.
          </p>
        </div>

        <div className="pt-6 border-t border-dark-border/50">
          <p className="text-xs text-gray-500">
            If you are an administrator, you can still <a href="/login" className="text-primary-400 hover:text-primary-300 transition-colors">log in here</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceView;
