import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { UserRole } from './types';
import { RoleSelector } from './components/RoleSelector';
import { CustomerView } from './components/CustomerView';
import { RestaurantView } from './components/RestaurantView';
import { RiderView } from './components/RiderView';
import { AdminView } from './components/AdminView';

const MainApp: React.FC = () => {
  const { role, logout } = useApp();

  const renderView = () => {
    switch (role) {
      case UserRole.CUSTOMER:
        return <CustomerView />;
      case UserRole.RESTAURANT:
        return <RestaurantView />;
      case UserRole.RIDER:
        return <RiderView />;
      case UserRole.ADMIN:
        return <AdminView />;
      default:
        return <RoleSelector />;
    }
  };

  return (
    <div>
      {role !== UserRole.NONE && (
        <div className="fixed bottom-4 left-4 z-50">
            <button 
                onClick={logout}
                className="bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white px-3 py-2 rounded-lg text-xs font-bold border border-slate-700 shadow-xl transition opacity-50 hover:opacity-100 flex items-center gap-2"
            >
                <span>Switch Role (Demo)</span>
            </button>
        </div>
      )}
      {renderView()}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
};

export default App;