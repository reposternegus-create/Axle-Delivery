import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { OrderStatus, VerificationStatus } from '../types';
import { ChefHat, Clock, Package, Wand2, ShieldAlert, Lock, LogOut } from 'lucide-react';
import { generateMenuDescription } from '../services/geminiService';

export const RestaurantView: React.FC = () => {
  const { orders, updateOrderStatus, currentUser, logout, refreshData, login } = useApp();
  const [activeTab, setActiveTab] = useState<'orders' | 'menu'>('orders');
  
  // Menu Management State
  const [newItemName, setNewItemName] = useState('');
  const [newItemIngredients, setNewItemIngredients] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const restaurant = currentUser?.restaurantDetails;

  // VERIFICATION CHECK BLOCKER
  if (!restaurant || restaurant.isVerified !== VerificationStatus.APPROVED) {
      return (
          <div className="min-h-screen bg-axe-dark flex items-center justify-center p-6 text-center">
              <div className="bg-axe-panel border border-axe-leather p-8 rounded-2xl max-w-md w-full shadow-2xl">
                  <div className="mx-auto w-16 h-16 bg-axe-leather/20 rounded-full flex items-center justify-center mb-6 text-axe-gold">
                      {restaurant?.isVerified === VerificationStatus.REJECTED ? <ShieldAlert size={32}/> : <Lock size={32} />}
                  </div>
                  <h1 className="text-2xl font-bold text-axe-silver mb-2">
                      {restaurant?.isVerified === VerificationStatus.REJECTED ? 'Application Rejected' : 'Verification Pending'}
                  </h1>
                  <p className="text-axe-steel mb-6">
                      {restaurant?.isVerified === VerificationStatus.REJECTED 
                        ? 'Your application did not meet our premium standards. Contact support.' 
                        : 'Your documents are currently under review by the Axle Administration team. You will receive an email once approved.'}
                  </p>
                  
                  {/* Demo 'Cheat' button for the user to see the app functionality */}
                  {restaurant?.isVerified === VerificationStatus.PENDING && (
                      <div className="bg-axe-dark p-4 rounded mb-6 text-xs text-axe-steel border border-dashed border-axe-steel/30">
                          <p>For Demo Purposes Only:</p>
                          <p>In a real app, you wait for Admin.</p>
                          <button 
                            className="mt-2 text-axe-gold underline font-bold"
                            onClick={() => {
                                // Only for demo - force local approve
                                if (currentUser && currentUser.restaurantDetails) {
                                    currentUser.restaurantDetails.isVerified = VerificationStatus.APPROVED;
                                    login(currentUser); // Refresh state logic
                                    setTimeout(() => window.location.reload(), 100);
                                }
                            }}
                          >
                              [Simulate Admin Approval]
                          </button>
                      </div>
                  )}

                  <button onClick={logout} className="text-axe-gold hover:text-white font-bold text-sm">Return to Login</button>
              </div>
          </div>
      );
  }

  // Filter orders for this restaurant
  const myOrders = orders.filter(o => o.restaurantId === restaurant.id);

  const handleGenerateDesc = async () => {
    if (!newItemName || !newItemIngredients) return;
    setIsGenerating(true);
    const desc = await generateMenuDescription(newItemName, newItemIngredients);
    setNewItemDesc(desc);
    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen bg-axe-dark text-axe-skin flex">
      {/* Sidebar */}
      <aside className="w-64 bg-axe-panel border-r border-axe-leather p-6 hidden md:flex flex-col">
        <div className="flex items-center gap-3 mb-10">
            <ChefHat size={32} className="text-axe-gold" />
            <h1 className="font-bold text-xl text-axe-silver">Kitchen OS</h1>
        </div>
        <nav className="space-y-2 flex-1">
            <button 
                onClick={() => setActiveTab('orders')}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition ${activeTab === 'orders' ? 'bg-axe-leather text-axe-gold border border-axe-brown' : 'text-axe-steel hover:bg-axe-dark'}`}
            >
                <Clock size={20} /> Orders
            </button>
            <button 
                onClick={() => setActiveTab('menu')}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition ${activeTab === 'menu' ? 'bg-axe-leather text-axe-gold border border-axe-brown' : 'text-axe-steel hover:bg-axe-dark'}`}
            >
                <Package size={20} /> Menu Manager
            </button>
        </nav>
        <button onClick={logout} className="flex items-center gap-2 text-axe-steel hover:text-white mt-auto pt-4 border-t border-axe-leather/50">
            <LogOut size={16} /> Logout
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8 overflow-y-auto">
        {activeTab === 'orders' && (
            <div>
                <header className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold text-axe-silver">Incoming Orders</h2>
                    <button onClick={refreshData} className="text-sm text-axe-gold hover:text-white">Refresh Data</button>
                </header>
                
                <div className="grid gap-4">
                    {myOrders.length === 0 ? (
                        <div className="text-axe-steel italic border border-dashed border-axe-steel p-8 rounded-xl text-center">
                            No active orders. The kitchen is quiet.
                        </div>
                    ) : (
                        myOrders.map(order => (
                            <div key={order.id} className="bg-axe-panel border border-axe-leather p-6 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-lg">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="font-mono text-axe-gold">#{order.id.slice(-6)}</span>
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase bg-axe-dark border border-axe-steel text-axe-silver`}>
                                            {order.status.replace(/_/g, ' ')}
                                        </span>
                                    </div>
                                    <div className="text-sm text-axe-silver font-medium">
                                        {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                                    </div>
                                    <div className="text-xs text-axe-steel mt-1">Total: ${order.total.toFixed(2)}</div>
                                    {order.riderName && (
                                        <div className="text-xs text-green-600 font-bold mt-2 flex items-center gap-1">
                                            <Package size={12} /> Rider Assigned: {order.riderName}
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex gap-2">
                                    {order.status === OrderStatus.PENDING && (
                                        <button 
                                            onClick={() => updateOrderStatus(order.id, OrderStatus.PREPARING)}
                                            className="px-6 py-2 bg-axe-brown hover:bg-axe-gold text-white rounded-lg font-bold text-sm transition shadow-lg"
                                        >
                                            Accept & Cook
                                        </button>
                                    )}
                                    {order.status === OrderStatus.PREPARING && (
                                        <button 
                                            onClick={() => updateOrderStatus(order.id, OrderStatus.READY_FOR_PICKUP)}
                                            className="px-6 py-2 bg-green-800 hover:bg-green-700 text-white rounded-lg font-bold text-sm transition shadow-lg"
                                        >
                                            Mark Ready
                                        </button>
                                    )}
                                    {order.status === OrderStatus.READY_FOR_PICKUP && (
                                        <div className="text-axe-gold text-sm font-bold flex items-center gap-2">
                                            <Clock size={16} /> Waiting for Rider
                                        </div>
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
                <h2 className="text-3xl font-bold mb-6 text-axe-silver">Add New Dish</h2>
                <div className="bg-axe-panel p-6 rounded-xl border border-axe-leather space-y-4 shadow-2xl">
                    <div>
                        <label className="block text-sm font-bold text-axe-brown mb-1 uppercase tracking-wider">Dish Name</label>
                        <input 
                            type="text" 
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            className="w-full bg-axe-dark border border-axe-leather rounded-lg p-3 text-white focus:outline-none focus:border-axe-gold"
                            placeholder="e.g. Iron Skillet Steak"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-axe-brown mb-1 uppercase tracking-wider">Key Ingredients</label>
                        <input 
                            type="text" 
                            value={newItemIngredients}
                            onChange={(e) => setNewItemIngredients(e.target.value)}
                            className="w-full bg-axe-dark border border-axe-leather rounded-lg p-3 text-white focus:outline-none focus:border-axe-gold"
                            placeholder="e.g. ribeye, rosemary, garlic butter"
                        />
                    </div>
                    
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-bold text-axe-brown uppercase tracking-wider">Description</label>
                            <button 
                                onClick={handleGenerateDesc}
                                disabled={isGenerating || !newItemName}
                                className="text-xs flex items-center gap-1 text-axe-gold hover:text-white disabled:opacity-50 font-bold"
                            >
                                <Wand2 size={12} /> {isGenerating ? 'Forging Description...' : 'Use AI Writer'}
                            </button>
                        </div>
                        <textarea 
                            value={newItemDesc}
                            onChange={(e) => setNewItemDesc(e.target.value)}
                            className="w-full bg-axe-dark border border-axe-leather rounded-lg p-3 text-white h-24 focus:outline-none focus:border-axe-gold"
                            placeholder="Enter description..."
                        />
                    </div>

                    <button className="w-full bg-axe-gold hover:bg-amber-600 text-white py-4 rounded-lg font-bold transition shadow-lg mt-4">
                        Add to Menu
                    </button>
                </div>
            </div>
        )}
      </main>
    </div>
  );
};