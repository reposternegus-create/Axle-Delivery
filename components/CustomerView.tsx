import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ShoppingCart, Star, Plus, Minus, X, Sparkles, MapPin, Phone, Clock, Navigation, CheckCircle, Receipt, Info, Bike, Store, ArrowRight, Package } from 'lucide-react';
import { getFoodRecommendation } from '../services/geminiService';
import { Restaurant, OrderStatus, Order } from '../types';

export const CustomerView: React.FC = () => {
  const { restaurants, cart, addToCart, removeFromCart, placeOrder, orders, currentUser, logout, refreshData, addFeedback } = useApp();
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  
  // Receipt State
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  // Feedback Modal State
  const [feedbackOrderId, setFeedbackOrderId] = useState<string | null>(null);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');

  // Auto-refresh orders to simulate tracking updates
  useEffect(() => {
    const interval = setInterval(refreshData, 5000);
    return () => clearInterval(interval);
  }, [refreshData]);

  const activeOrders = orders.filter(o => o.customerId === currentUser?.id && o.status !== OrderStatus.CANCELLED);
  
  // Totals Calculation
  const itemTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const deliveryFee = 150;
  const platformFee = 150;
  const cartTotal = itemTotal + deliveryFee + platformFee;

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

  const handleFeedbackSubmit = () => {
    if (feedbackOrderId) {
        addFeedback(feedbackOrderId, {
            rating: feedbackRating,
            comment: feedbackComment,
            timestamp: Date.now()
        });
        setFeedbackOrderId(null);
        setFeedbackComment('');
        setFeedbackRating(5);
    }
  };

  const handlePlaceOrder = () => {
      if (selectedRestaurant) {
          const order = placeOrder(selectedRestaurant.id, selectedRestaurant.name);
          if (order) {
              setLastOrder(order);
              setShowReceipt(true);
              setIsCartOpen(false);
          }
      }
  };

  const renderProgressBar = (order: Order) => {
      let width = '5%';
      if (order.status === OrderStatus.PREPARING) width = '30%';
      if (order.riderArrived) width = '45%'; // Boost progress if rider arrived
      if (order.status === OrderStatus.READY_FOR_PICKUP) width = '60%';
      if (order.status === OrderStatus.OUT_FOR_DELIVERY) width = '85%';
      
      return (
         <div className="absolute top-0 left-0 w-full h-1 bg-gray-100">
            <div 
                className="h-full bg-axe-gold transition-all duration-1000"
                style={{ width }}
            ></div>
        </div>
      );
  };

  return (
    <div className="min-h-screen bg-axe-dark text-axe-skin pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-axe-steel/20 p-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-axe-gold rounded flex items-center justify-center font-bold text-white shadow-lg shadow-amber-200">A</div>
             <span className="font-bold text-xl tracking-tight text-axe-skin">Axle Foods</span>
          </div>
          <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                  <div className="text-sm font-bold text-axe-skin">{currentUser?.name?.split(' ')[0]}</div>
                  <div className="text-xs text-axe-steel truncate max-w-[150px]">{currentUser?.address}</div>
              </div>
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 bg-axe-dark border border-axe-steel/30 rounded-lg hover:bg-amber-50 transition text-axe-gold"
              >
                <ShoppingCart size={24} />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-axe-gold text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                    {cart.length}
                  </span>
                )}
              </button>
              <button onClick={logout} className="text-xs text-axe-silver hover:text-axe-gold underline">Logout</button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4 space-y-8">
        
        {/* Active Order Tracking */}
        {activeOrders.length > 0 && (
            <section className="animate-fade-in">
                <h2 className="text-lg font-bold text-axe-gold uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Clock size={20} /> My Orders
                </h2>
                <div className="grid gap-6">
                    {activeOrders.map(order => (
                        <div key={order.id} className="bg-white border border-axe-steel/20 rounded-xl p-6 shadow-xl relative overflow-hidden">
                            {/* Status logic */}
                            {order.status !== OrderStatus.DELIVERED ? (
                                <>
                                    {renderProgressBar(order)}
                                    
                                    <div className="flex flex-col md:flex-row justify-between gap-6 mt-2">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-2xl font-bold text-axe-skin">{order.restaurantName}</h3>
                                                <span className="px-2 py-0.5 rounded bg-axe-gold/10 text-axe-gold text-xs font-bold uppercase border border-axe-gold/20">{order.status.replace(/_/g, ' ')}</span>
                                            </div>
                                            <p className="text-axe-silver text-sm">Order ID: <span className="font-mono">{order.id.slice(-6)}</span> • {order.items.length} Items</p>
                                            <p className="text-sm font-bold text-axe-gold">COD Amount: Rs. {order.total}</p>
                                            
                                            {/* Detailed Status Text */}
                                            <div className="text-axe-skin font-medium flex items-center gap-2 mt-4 bg-amber-50 p-3 rounded-lg border border-amber-100 w-fit">
                                                {order.status === OrderStatus.OUT_FOR_DELIVERY ? (
                                                    <><Bike size={16} className="text-axe-gold" /> Rider is on the way!</>
                                                ) : order.status === OrderStatus.READY_FOR_PICKUP ? (
                                                    <><Package size={16} className="text-axe-gold" /> Food Ready. Rider picking up.</>
                                                ) : order.riderArrived ? (
                                                    <><Store size={16} className="text-axe-gold" /> Rider at restaurant. Waiting for food.</>
                                                ) : (
                                                    <><Clock size={16} className="text-axe-gold" /> Food is being prepared.</>
                                                )}
                                            </div>
                                        </div>

                                        {/* Rider Info & Map Simulation */}
                                        {order.riderName ? (
                                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex-1 max-w-md">
                                                <div className="flex justify-between items-center mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-axe-gold rounded-full flex items-center justify-center text-white font-bold shadow-md">
                                                            {order.riderName[0]}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-sm text-axe-skin">{order.riderName}</div>
                                                            <div className="text-xs text-axe-gold font-bold uppercase">Pro Rider</div>
                                                        </div>
                                                    </div>
                                                    <button className="p-2 bg-white rounded-full text-axe-gold hover:bg-axe-gold hover:text-white transition shadow-sm border border-gray-100" title="Call Rider">
                                                        <Phone size={18} />
                                                    </button>
                                                </div>
                                                {/* Fake Map */}
                                                <div className="w-full h-24 bg-white border border-gray-200 rounded flex items-center justify-center relative overflow-hidden group">
                                                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-axe-gold via-transparent to-transparent"></div>
                                                    <div className="z-10 flex items-center gap-2 text-xs text-green-600 font-bold font-mono">
                                                        <Navigation size={14} className="animate-pulse" />
                                                        Rider Shared Live Location
                                                    </div>
                                                </div>
                                                <div className="text-center text-xs text-axe-steel mt-2">
                                                    Rider Contact: {order.riderPhone || 'Hidden'}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center bg-gray-50 p-4 rounded-lg border border-gray-200 text-axe-steel text-sm italic min-w-[200px]">
                                                Searching for nearby rider...
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-xl font-bold text-axe-skin mb-1">{order.restaurantName}</h3>
                                        <div className="flex items-center gap-2 text-green-600 font-bold text-sm">
                                            <CheckCircle size={16} /> Delivered
                                        </div>
                                        <p className="text-xs text-axe-steel mt-1">{new Date(order.timestamp).toLocaleDateString()}</p>
                                    </div>
                                    {!order.feedback ? (
                                        <button 
                                            onClick={() => setFeedbackOrderId(order.id)}
                                            className="px-4 py-2 bg-axe-gold text-white rounded-lg font-bold text-sm shadow-lg shadow-amber-200 hover:bg-amber-700"
                                        >
                                            Rate Order
                                        </button>
                                    ) : (
                                        <div className="text-axe-gold flex gap-1">
                                            {[...Array(order.feedback.rating)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>
        )}

        {/* ... (Existing Restaurant Grid Code remains the same) ... */}
        {!selectedRestaurant ? (
          <>
            {/* AI Search Hero */}
            <div className="p-8 bg-gradient-to-br from-white to-amber-50 border border-amber-100 rounded-2xl relative overflow-hidden shadow-lg">
                <div className="relative z-10">
                    <h2 className="text-3xl font-bold mb-2 text-axe-skin">Hungry for excellence?</h2>
                    <p className="text-axe-silver mb-6">Ask our AI concierge for the perfect meal.</p>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            placeholder="e.g., 'Spicy biryani with raita'" 
                            className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm w-full max-w-md focus:outline-none focus:border-axe-gold text-axe-skin placeholder-gray-400 shadow-sm"
                            value={aiQuery}
                            onChange={(e) => setAiQuery(e.target.value)}
                        />
                        <button 
                            onClick={handleAiAsk}
                            className="bg-axe-gold text-white px-6 py-3 rounded-lg font-bold text-sm hover:bg-amber-700 transition flex items-center gap-2 shadow-lg shadow-amber-200"
                        >
                            <Sparkles size={16} /> {isAiThinking ? 'Thinking...' : 'Consult AI'}
                        </button>
                    </div>
                    {aiResponse && (
                        <div className="mt-4 p-4 bg-white/80 rounded-xl text-sm border border-axe-gold/30 text-axe-skin animate-fade-in shadow-sm">
                            <span className="font-bold text-axe-gold uppercase text-xs tracking-wider block mb-1">Concierge Suggestion</span>
                            {aiResponse}
                        </div>
                    )}
                </div>
            </div>

            {/* Restaurant List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.map(rest => (
                <div 
                  key={rest.id} 
                  onClick={() => setSelectedRestaurant(rest)}
                  className="bg-white rounded-xl overflow-hidden hover:scale-[1.02] transition cursor-pointer border border-gray-200 hover:border-axe-gold group shadow-md"
                >
                  <div className="h-48 overflow-hidden relative">
                    <img src={rest.image} alt={rest.name} className="w-full h-full object-cover group-hover:brightness-110 transition" />
                    <div className="absolute bottom-2 right-2 bg-white/90 text-axe-skin px-2 py-1 rounded text-xs font-bold border border-gray-200 shadow-sm">
                        {rest.deliveryTime}
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="text-xl font-bold text-axe-skin">{rest.name}</h4>
                        <div className="flex items-center gap-1 text-axe-gold text-sm font-bold">
                            <Star size={14} fill="currentColor" /> {rest.rating}
                        </div>
                    </div>
                    <p className="text-axe-silver text-sm">{rest.categories.join(' • ')}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="animate-fade-in">
            <button 
              onClick={() => setSelectedRestaurant(null)}
              className="mb-4 text-axe-silver hover:text-axe-gold flex items-center gap-2 text-sm font-medium uppercase tracking-wide"
            >
              ← Back to Restaurants
            </button>
            <div className="bg-white p-8 rounded-2xl mb-8 border border-gray-200 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-axe-gold opacity-10 rounded-full blur-3xl"></div>
                <h2 className="text-4xl font-black text-axe-skin mb-2">{selectedRestaurant.name}</h2>
                <p className="text-axe-silver flex items-center gap-2"><MapPin size={16}/> {selectedRestaurant.categories.join(', ')} • {selectedRestaurant.deliveryTime}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {selectedRestaurant.menu.map(item => (
                    <div key={item.id} className="bg-white p-5 rounded-xl flex gap-4 border border-gray-200 hover:border-axe-gold/50 transition shadow-md group">
                        <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-lg bg-gray-100 group-hover:scale-105 transition" />
                        <div className="flex-1 flex flex-col justify-between">
                            <div>
                                <h4 className="font-bold text-lg text-axe-skin group-hover:text-axe-gold transition">{item.name}</h4>
                                <p className="text-axe-silver text-sm line-clamp-2 mt-1">{item.description}</p>
                            </div>
                            <div className="flex justify-between items-end mt-3">
                                <span className="font-bold text-axe-gold text-lg">Rs. {item.price}</span>
                                <button 
                                    onClick={() => addToCart({ ...item, quantity: 1 })}
                                    className="bg-axe-skin hover:bg-axe-gold text-white p-2 rounded-lg transition shadow-md"
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

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
            <div className="relative w-full max-w-md bg-white h-full shadow-2xl p-6 flex flex-col border-l border-gray-200 animate-fade-in">
                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2 text-axe-skin"><ShoppingCart className="text-axe-gold" /> Your Order</h2>
                    <button onClick={() => setIsCartOpen(false)}><X className="text-axe-silver hover:text-axe-skin" /></button>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-4">
                    {cart.length === 0 ? (
                        <div className="text-center text-axe-silver mt-20 italic">Your cart is empty.</div>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <div className="flex-1">
                                    <h4 className="font-medium text-sm text-axe-skin">{item.name}</h4>
                                    <div className="text-axe-gold text-sm font-bold">Rs. {item.price * item.quantity}</div>
                                </div>
                                <div className="flex items-center gap-3 bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
                                    <button onClick={() => removeFromCart(item.id)} className="p-1 hover:text-red-500 text-axe-silver"><Minus size={14} /></button>
                                    <span className="text-sm font-bold w-4 text-center text-axe-skin">{item.quantity}</span>
                                    <button onClick={() => addToCart({ ...item, quantity: 1 })} className="p-1 hover:text-green-500 text-axe-silver"><Plus size={14} /></button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {cart.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
                        <div className="flex justify-between text-sm text-axe-silver">
                            <span>Item Total</span>
                            <span>Rs. {itemTotal}</span>
                        </div>
                        <div className="flex justify-between text-sm text-axe-silver">
                            <span>Delivery Fee</span>
                            <span>Rs. {deliveryFee}</span>
                        </div>
                        <div className="flex justify-between text-sm text-axe-silver">
                            <span>Platform Fee</span>
                            <span>Rs. {platformFee}</span>
                        </div>
                        <div className="my-2 border-b border-dashed border-gray-200"></div>
                        <div className="flex justify-between mb-4 text-xl font-bold text-axe-skin">
                            <span>Total (COD)</span>
                            <span>Rs. {cartTotal}</span>
                        </div>
                        
                        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs p-3 rounded-lg mb-4 text-center font-bold flex items-center justify-center gap-2">
                            <Info size={14}/> Please keep Rs. {cartTotal} cash ready.
                        </div>

                        <div className="text-xs text-axe-silver mb-4 text-center">
                            Deliver to: {currentUser?.address || 'Set address in profile'}
                        </div>
                        <button 
                            onClick={handlePlaceOrder}
                            className="w-full bg-gradient-to-r from-axe-gold to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold py-4 rounded-xl shadow-lg transition uppercase tracking-widest text-sm"
                        >
                            Place Order (COD)
                        </button>
                    </div>
                )}
            </div>
        </div>
      )}

      {/* RECEIPT MODAL */}
      {showReceipt && lastOrder && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-white p-0 rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden relative border border-gray-200">
                  <div className="bg-axe-gold p-4 flex justify-between items-center text-white">
                      <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-sm">
                          <Receipt size={18} /> Order Receipt
                      </div>
                      <button onClick={() => setShowReceipt(false)} className="hover:bg-white/20 p-1 rounded"><X size={18}/></button>
                  </div>
                  
                  <div className="p-6 space-y-4">
                      <div className="text-center border-b border-dashed border-gray-300 pb-4">
                          <h3 className="text-2xl font-black text-axe-skin uppercase">{lastOrder.restaurantName}</h3>
                          <p className="text-xs text-axe-silver font-mono mt-1">Order #{lastOrder.id.slice(-6).toUpperCase()}</p>
                          <p className="text-xs text-axe-silver">{new Date(lastOrder.timestamp).toLocaleString()}</p>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                          {lastOrder.items.map(item => (
                              <div key={item.id} className="flex justify-between">
                                  <span className="text-axe-skin">{item.quantity} x {item.name}</span>
                                  <span className="font-bold">Rs. {item.price * item.quantity}</span>
                              </div>
                          ))}
                      </div>
                      
                      <div className="border-t border-dashed border-gray-300 pt-4 mt-4 space-y-1">
                          <div className="flex justify-between text-xs text-axe-silver">
                             <span>Subtotal</span>
                             <span>Rs. {lastOrder.itemTotal}</span>
                          </div>
                          <div className="flex justify-between text-xs text-axe-silver">
                             <span>Delivery</span>
                             <span>Rs. {lastOrder.deliveryFee}</span>
                          </div>
                          <div className="flex justify-between text-xs text-axe-silver">
                             <span>Platform Fee</span>
                             <span>Rs. {lastOrder.platformFee}</span>
                          </div>
                          <div className="flex justify-between font-bold text-xl text-axe-skin pt-2">
                              <span>Total</span>
                              <span>Rs. {lastOrder.total}</span>
                          </div>
                          <div className="flex justify-between text-xs text-axe-silver mt-1">
                               <span>Payment Method</span>
                               <span>Cash on Delivery</span>
                          </div>
                      </div>

                      <div className="bg-amber-50 p-3 rounded-lg text-center text-xs text-amber-800 border border-amber-100 mt-4">
                          Your order has been sent to the kitchen!
                          <br/>You can track the rider live on the dashboard.
                      </div>
                  </div>
                  
                  <button 
                    onClick={() => setShowReceipt(false)}
                    className="w-full bg-axe-skin text-white font-bold py-4 hover:bg-black transition text-sm uppercase tracking-widest"
                  >
                      Close Receipt
                  </button>
              </div>
          </div>
      )}

      {/* Feedback Modal (remains same) */}
      {feedbackOrderId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl relative">
                  <button onClick={() => setFeedbackOrderId(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">✕</button>
                  <h3 className="text-xl font-bold text-center mb-2">Rate Your Food</h3>
                  <p className="text-center text-gray-500 text-sm mb-6">How was your experience?</p>
                  
                  <div className="flex justify-center gap-2 mb-6">
                      {[1,2,3,4,5].map(star => (
                          <button key={star} onClick={() => setFeedbackRating(star)} className={`transition ${star <= feedbackRating ? 'text-axe-gold scale-110' : 'text-gray-300'}`}>
                              <Star size={32} fill="currentColor" />
                          </button>
                      ))}
                  </div>
                  
                  <textarea 
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm mb-4 outline-none focus:border-axe-gold"
                    rows={3}
                    placeholder="Write a review..."
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                  />

                  <button 
                    onClick={handleFeedbackSubmit}
                    className="w-full bg-axe-skin text-white font-bold py-3 rounded-xl hover:bg-black transition"
                  >
                      Submit Feedback
                  </button>
              </div>
          </div>
      )}
    </div>
  );
};