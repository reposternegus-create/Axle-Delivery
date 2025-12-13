import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShoppingCart, Star, Plus, Minus, X, Sparkles, MapPin } from 'lucide-react';
import { getFoodRecommendation } from '../services/geminiService';
import { Restaurant, MenuItem } from '../types';

export const CustomerView: React.FC = () => {
  const { restaurants, cart, addToCart, removeFromCart, placeOrder, clearCart } = useApp();
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleAiAsk = async () => {
    if (!aiQuery.trim()) return;
    setIsAiThinking(true);
    const menuContext = selectedRestaurant 
      ? selectedRestaurant.menu.map(m => `${m.name} (${m.description})`).join(', ')
      : restaurants.flatMap(r => r.menu.map(m => `${m.name} from ${r.name}`)).join(', ');
    
    const response = await getFoodRecommendation(aiQuery, menuContext);
    setAiResponse(response);
    setIsAiThinking(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-axe-handle rounded flex items-center justify-center font-bold text-white">A</div>
             <span className="font-bold text-xl tracking-tight">Axle Foods</span>
          </div>
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition"
          >
            <ShoppingCart size={24} className="text-axe-edge" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-axe-rust text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4">
        {!selectedRestaurant ? (
          <>
            <div className="mb-8 p-6 bg-gradient-to-r from-axe-handle to-slate-800 rounded-2xl relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-3xl font-bold mb-2">Craving something sharp?</h2>
                    <p className="text-slate-200 mb-4">Fastest delivery in the city. Steel-clad guarantee.</p>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            placeholder="Ask AI: 'What's good for a rainy day?'" 
                            className="bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-2 text-sm w-full max-w-md focus:outline-none focus:border-axe-steel"
                            value={aiQuery}
                            onChange={(e) => setAiQuery(e.target.value)}
                        />
                        <button 
                            onClick={handleAiAsk}
                            className="bg-axe-steel text-slate-900 px-4 py-2 rounded-lg font-bold text-sm hover:bg-white transition flex items-center gap-2"
                        >
                            <Sparkles size={16} /> {isAiThinking ? '...' : 'Ask'}
                        </button>
                    </div>
                    {aiResponse && (
                        <div className="mt-4 p-3 bg-slate-900/80 rounded-lg text-sm border border-axe-steel/30 text-axe-steel">
                            <span className="font-bold text-axe-rust">AI Suggests:</span> {aiResponse}
                        </div>
                    )}
                </div>
            </div>

            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><MapPin size={20} className="text-axe-rust"/> Restaurants Nearby</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.map(rest => (
                <div 
                  key={rest.id} 
                  onClick={() => setSelectedRestaurant(rest)}
                  className="bg-slate-800 rounded-xl overflow-hidden hover:scale-[1.02] transition cursor-pointer border border-slate-700 hover:border-axe-steel group"
                >
                  <div className="h-48 overflow-hidden relative">
                    <img src={rest.image} alt={rest.name} className="w-full h-full object-cover group-hover:brightness-110 transition" />
                    <div className="absolute bottom-2 right-2 bg-white text-slate-900 px-2 py-1 rounded text-xs font-bold">
                        {rest.deliveryTime}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-1">
                        <h4 className="text-lg font-bold">{rest.name}</h4>
                        <div className="flex items-center gap-1 text-yellow-500 text-sm font-bold">
                            <Star size={14} fill="currentColor" /> {rest.rating}
                        </div>
                    </div>
                    <p className="text-slate-400 text-sm">{rest.categories.join(' • ')}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="animate-fade-in">
            <button 
              onClick={() => setSelectedRestaurant(null)}
              className="mb-4 text-slate-400 hover:text-white flex items-center gap-2 text-sm"
            >
              ← Back to Restaurants
            </button>
            <div className="bg-slate-800 p-6 rounded-xl mb-6 border border-slate-700">
                <h2 className="text-3xl font-bold">{selectedRestaurant.name}</h2>
                <p className="text-slate-400">{selectedRestaurant.categories.join(', ')} • {selectedRestaurant.deliveryTime}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {selectedRestaurant.menu.map(item => (
                    <div key={item.id} className="bg-slate-800 p-4 rounded-xl flex gap-4 border border-slate-700/50 hover:border-axe-steel/50 transition">
                        <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-lg bg-slate-700" />
                        <div className="flex-1 flex flex-col justify-between">
                            <div>
                                <h4 className="font-bold text-lg">{item.name}</h4>
                                <p className="text-slate-400 text-sm line-clamp-2">{item.description}</p>
                            </div>
                            <div className="flex justify-between items-end mt-2">
                                <span className="font-bold text-axe-steel">${item.price.toFixed(2)}</span>
                                <button 
                                    onClick={() => addToCart({ ...item, quantity: 1 })}
                                    className="bg-axe-handle hover:bg-stone-600 text-white p-2 rounded-lg transition"
                                >
                                    <Plus size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        )}
      </main>

      {/* Cart Drawer (Mock) */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
            <div className="relative w-full max-w-md bg-slate-900 h-full shadow-2xl p-6 flex flex-col border-l border-slate-700">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2"><ShoppingCart /> Your Order</h2>
                    <button onClick={() => setIsCartOpen(false)}><X className="text-slate-400 hover:text-white" /></button>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-4">
                    {cart.length === 0 ? (
                        <div className="text-center text-slate-500 mt-20">Your cart is empty.</div>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} className="flex items-center gap-4 bg-slate-800 p-3 rounded-lg border border-slate-700">
                                <div className="flex-1">
                                    <h4 className="font-medium text-sm">{item.name}</h4>
                                    <div className="text-axe-steel text-sm">${(item.price * item.quantity).toFixed(2)}</div>
                                </div>
                                <div className="flex items-center gap-3 bg-slate-900 rounded-lg p-1">
                                    <button onClick={() => removeFromCart(item.id)} className="p-1 hover:text-red-400"><Minus size={14} /></button>
                                    <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                                    <button onClick={() => addToCart({ ...item, quantity: 1 })} className="p-1 hover:text-green-400"><Plus size={14} /></button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {cart.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-slate-700">
                        <div className="flex justify-between mb-4 text-xl font-bold">
                            <span>Total</span>
                            <span>${cartTotal.toFixed(2)}</span>
                        </div>
                        <button 
                            onClick={() => {
                                if (selectedRestaurant) {
                                    placeOrder(selectedRestaurant.id, selectedRestaurant.name);
                                    setIsCartOpen(false);
                                    alert("Order placed successfully!");
                                }
                            }}
                            className="w-full bg-axe-rust hover:bg-red-800 text-white font-bold py-4 rounded-xl shadow-lg transition"
                        >
                            Confirm Order
                        </button>
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
};