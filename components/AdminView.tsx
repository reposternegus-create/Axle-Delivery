import React from 'react';
import { useApp } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { ShieldCheck, Users, DollarSign, Activity, Wallet, Check } from 'lucide-react';

export const AdminView: React.FC = () => {
  const { orders, riders, settleRiderDebt } = useApp();

  const totalRevenue = orders.reduce((acc, o) => acc + (o.platformFee || 0), 0);
  const activeOrders = orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length;
  
  // Mock data for charts
  const salesData = [
    { name: 'Mon', sales: 4000 },
    { name: 'Tue', sales: 3000 },
    { name: 'Wed', sales: 2000 },
    { name: 'Thu', sales: 2780 },
    { name: 'Fri', sales: 1890 },
    { name: 'Sat', sales: 2390 },
    { name: 'Sun', sales: 3490 },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
        <header className="bg-slate-900 border-b border-slate-800 p-6 flex justify-between items-center sticky top-0 z-30">
            <div className="flex items-center gap-3">
                <ShieldCheck className="text-red-600" size={32} />
                <h1 className="text-2xl font-bold tracking-tight">Axle Command Center</h1>
            </div>
            <div className="text-sm text-slate-500">v1.0.4 stable</div>
        </header>

        <main className="p-8 max-w-7xl mx-auto space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-slate-400 font-medium">Platform Net Revenue</span>
                        <DollarSign className="text-green-500" />
                    </div>
                    <div className="text-4xl font-black">Rs. {totalRevenue.toLocaleString()}</div>
                    <div className="text-sm text-green-500 mt-2">Fees collected</div>
                </div>
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-slate-400 font-medium">Active Orders</span>
                        <Activity className="text-blue-500" />
                    </div>
                    <div className="text-4xl font-black">{activeOrders}</div>
                    <div className="text-sm text-slate-500 mt-2">Currently processing</div>
                </div>
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-slate-400 font-medium">Fleet Size</span>
                        <Users className="text-axe-steel" />
                    </div>
                    <div className="text-4xl font-black">{riders.length}</div>
                    <div className="text-sm text-slate-500 mt-2">Active Riders</div>
                </div>
            </div>

            {/* FLEET MANAGEMENT TABLE */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                    <h3 className="font-bold flex items-center gap-2"><Wallet size={20} className="text-amber-500"/> Fleet Wallet Management</h3>
                    <div className="text-xs text-slate-400">Weekly Settlement: Sunday</div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-400">
                        <thead className="bg-slate-950 text-slate-200 uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4">Rider Name</th>
                                <th className="px-6 py-4">Phone</th>
                                <th className="px-6 py-4">Current Debt</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {riders.map(rider => (
                                <tr key={rider.id} className="hover:bg-slate-800/50 transition">
                                    <td className="px-6 py-4 font-bold text-white">{rider.name}</td>
                                    <td className="px-6 py-4">{rider.phone}</td>
                                    <td className={`px-6 py-4 font-mono font-bold ${(rider.amountOwed || 0) > 5000 ? 'text-red-500' : 'text-green-400'}`}>
                                        Rs. {(rider.amountOwed || 0).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        {(rider.amountOwed || 0) > 5000 
                                            ? <span className="bg-red-900/50 text-red-300 px-2 py-1 rounded text-xs border border-red-800">Suspended</span> 
                                            : <span className="bg-green-900/50 text-green-300 px-2 py-1 rounded text-xs border border-green-800">Active</span>
                                        }
                                    </td>
                                    <td className="px-6 py-4">
                                        <button 
                                            onClick={() => settleRiderDebt(rider.id)}
                                            disabled={(rider.amountOwed || 0) <= 0}
                                            className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
                                        >
                                            <Check size={12}/> Mark Settled
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {riders.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center italic">No riders registered yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 h-80">
                    <h3 className="font-bold mb-6">Revenue Overview</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={salesData}>
                            <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                cursor={{fill: 'rgba(255,255,255,0.05)'}}
                            />
                            <Bar dataKey="sales" fill="#78716c" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 h-80">
                    <h3 className="font-bold mb-6">User Growth</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={salesData}>
                            <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                            <Line type="monotone" dataKey="sales" stroke="#b91c1c" strokeWidth={3} dot={{r: 4, fill: '#b91c1c'}} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </main>
    </div>
  );
};