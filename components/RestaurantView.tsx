import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { OrderStatus } from '../types';
import { ChefHat, Clock, CheckCircle, Package, RefreshCcw, Wand2 } from 'lucide-react';
import { generateMenuDescription } from '../services/geminiService';

export const RestaurantView: React.FC = () => {
  const { orders, updateOrderStatus, restaurantId } = useApp();
  const [activeTab, setActiveTab] = useState<'orders' | 'menu'>('orders');
  
  // Menu Management State
  const [newItemName, setNewItemName] = useState('');
  const [newItemIngredients, setNewItemIngredients] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Filter orders for this restaurant mock
  const myOrders = orders.filter(o => o.restaurantId === restaurantId);

  const handleGenerateDesc = async () => {
    if (!newItemName || !newItemIngredients) return;
    setIsGenerating(true);
    const desc = await generateMenuDescription(newItemName, newItemIngredients);
    setNewItemDesc(desc);
    setIsGenerating(false);
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING: return 'text-yellow-500 bg-yellow-500/10';
      case OrderStatus.PREPARING: return 'text-blue-500 bg-blue-500/10';
      case OrderStatus.READY_FOR_PICKUP: return 'text-green-500 bg-green-500/10';
      default: return 'text-slate-500 bg-slate-500/10';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 p-6 hidden md:block">
        <div className="flex items-center gap-3 mb-10">
            <ChefHat size={32} className="text-axe-rust" />
            <h1 className="font-bold text-xl">Kitchen OS</h1>
        </div>
        <nav className="space-y-2">
            <button 
                onClick={() => setActiveTab('orders')}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition ${activeTab === 'orders' ? 'bg-axe-handle text-white' : 'text-slate-400 hover:bg-slate-800'}`}
            >
                <Clock size={20} /> Orders
            </button>
            <button 
                onClick={() => setActiveTab('menu')}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition ${activeTab === 'menu' ? 'bg-axe-handle text-white' : 'text-slate-400 hover:bg-slate-800'}`}
            >
                <Package size={20} /> Menu Manager
            </button>
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8">
        {activeTab === 'orders' && (
            <div>
                <h2 className="text-3xl font-bold mb-6">Incoming Orders</h2>
                <div className="grid gap-4">
                    {myOrders.length === 0 ? (
                        <div className="text-slate-500 italic">No active orders. The kitchen is quiet.</div>
                    ) : (
                        myOrders.map(order => (
                            <div key={order.id} className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="font-mono text-axe-steel">#{order.id.slice(-6)}</span>
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${getStatusColor(order.status)}`}>
                                            {order.status.replace(/_/g, ' ')}
                                        </span>
                                    </div>
                                    <div className="text-sm text-slate-300">
                                        {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                                    </div>
                                    <div className="text-xs text-slate-500 mt-1">Total: ${order.total.toFixed(2)}</div>
                                </div>
                                
                                <div className="flex gap-2">
                                    {order.status === OrderStatus.PENDING && (
                                        <button 
                                            onClick={() => updateOrderStatus(order.id, OrderStatus.PREPARING)}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm"
                                        >
                                            Accept & Cook
                                        </button>
                                    )}
                                    {order.status === OrderStatus.PREPARING && (
                                        <button 
                                            onClick={() => updateOrderStatus(order.id, OrderStatus.READY_FOR_PICKUP)}
                                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-sm"
                                        >
                                            Mark Ready
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        )}

        {activeTab === 'menu' && (
            <div className="max-w-2xl">
                <h2 className="text-3xl font-bold mb-6">Add New Dish</h2>
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Dish Name</label>
                        <input 
                            type="text" 
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-axe-steel"
                            placeholder="e.g. Inferno Wings"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Key Ingredients</label>
                        <input 
                            type="text" 
                            value={newItemIngredients}
                            onChange={(e) => setNewItemIngredients(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-axe-steel"
                            placeholder="e.g. ghost pepper, honey glaze, lime"
                        />
                    </div>
                    
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium text-slate-400">Description</label>
                            <button 
                                onClick={handleGenerateDesc}
                                disabled={isGenerating || !newItemName}
                                className="text-xs flex items-center gap-1 text-axe-steel hover:text-white disabled:opacity-50"
                            >
                                <Wand2 size={12} /> {isGenerating ? 'Generating...' : 'Auto-Generate with AI'}
                            </button>
                        </div>
                        <textarea 
                            value={newItemDesc}
                            onChange={(e) => setNewItemDesc(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white h-24 focus:outline-none focus:border-axe-steel"
                            placeholder="Enter description..."
                        />
                    </div>

                    <button className="w-full bg-axe-handle hover:bg-stone-600 py-3 rounded-lg font-bold transition">
                        Add to Menu
                    </button>
                </div>
            </div>
        )}
      </main>
    </div>
  );
};