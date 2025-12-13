import React from 'react';
import { UserRole } from '../types';
import { useApp } from '../context/AppContext';
import { Axe, ChefHat, Bike, ShieldCheck, ShoppingBag } from 'lucide-react';

export const RoleSelector: React.FC = () => {
  const { setRole } = useApp();

  const mainRoles = [
    { role: UserRole.CUSTOMER, label: 'Customer', icon: <ShoppingBag size={32} />, desc: 'Hungry? Order now.' },
    { role: UserRole.RESTAURANT, label: 'Restaurant', icon: <ChefHat size={32} />, desc: 'Manage your kitchen.' },
    { role: UserRole.RIDER, label: 'Rider', icon: <Bike size={32} />, desc: 'Deliver & earn.' },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-slate-100 p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
         <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-axe-rust rounded-full blur-[100px]"></div>
         <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-axe-steel rounded-full blur-[100px]"></div>
      </div>

      <div className="mb-12 text-center z-10">
        <div className="flex items-center justify-center gap-4 mb-4">
            <Axe size={64} className="text-axe-steel" />
            <h1 className="text-6xl font-black tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-br from-axe-edge to-axe-steel">
                Axle
            </h1>
        </div>
        <p className="text-axe-steel text-xl font-light tracking-wide">Premium Delivery Infrastructure</p>
      </div>

      {/* Main Apps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl z-10 mb-16">
        {mainRoles.map((r) => (
          <button
            key={r.role}
            onClick={() => setRole(r.role)}
            className="group relative overflow-hidden bg-slate-800 border border-slate-700 hover:border-axe-steel transition-all duration-300 p-8 rounded-xl flex flex-col items-center text-center shadow-2xl hover:shadow-axe-steel/20 hover:-translate-y-2"
          >
            <div className="bg-slate-900 p-4 rounded-full mb-6 text-axe-steel group-hover:text-white group-hover:bg-axe-handle transition-colors duration-300">
                {r.icon}
            </div>
            <h2 className="text-2xl font-bold mb-2 text-white">{r.label}</h2>
            <p className="text-slate-400 text-sm group-hover:text-slate-300">{r.desc}</p>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-axe-handle to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
          </button>
        ))}
      </div>

      {/* Admin Link (Separated) */}
      <div className="z-10">
        <button 
            onClick={() => setRole(UserRole.ADMIN)}
            className="flex items-center gap-2 text-slate-500 hover:text-axe-rust transition-colors text-sm font-medium tracking-wider uppercase opacity-60 hover:opacity-100"
        >
            <ShieldCheck size={16} /> Admin Portal Access
        </button>
      </div>
    </div>
  );
};