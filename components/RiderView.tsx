import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { OrderStatus } from '../types';
import { Bike, MapPin, Navigation, CheckSquare, Phone, LogOut, ArrowRight, Clock, Wallet, AlertTriangle, Store, PackageCheck } from 'lucide-react';
import { LocationPicker } from './LocationPicker';

export const RiderView: React.FC = () => {
  const { orders, updateOrderStatus, currentUser, logout, refreshData, assignRider, markRiderArrived } = useApp();

  // Poll for new jobs
  useEffect(() => {
    const interval = setInterval(refreshData, 3000);
    return () => clearInterval(interval);
  }, [refreshData]);

  const debt = currentUser?.amountOwed || 0;
  // Warning threshold for debt (e.g., Rs. 5000)
  const isDebtHigh = debt > 5000;
  const isSuspended = currentUser?.isSuspended; // Admin could manually suspend

  // Show all active orders (Pending, Preparing, Ready) that don't have a rider yet
  const availableOrders = orders.filter(o => 
      !o.riderId && 
      o.status !== OrderStatus.DELIVERED && 
      o.status !== OrderStatus.CANCELLED
  );
  
  const myActiveDeliveries = orders.filter(o => o.riderId === currentUser?.id && o.status !== OrderStatus.DELIVERED);

  const handleAcceptOrder = (orderId: string) => {
    if (isDebtHigh || isSuspended) {
        alert("Account restricted due to outstanding platform fees. Please deposit cash.");
        return;
    }
    assignRider(orderId, {
        riderId: currentUser?.id,
        riderName: currentUser?.name,
        riderPhone: currentUser?.phone
    });
  };

  const renderOrderActions = (order: any) => {
      // Flow:
      // 1. If not arrived -> Show "Arrived At Restaurant"
      // 2. If arrived & status is READY -> Show "Food Collected" (Previously Recieve)
      // 3. If arrived & status NOT READY -> Show "Waiting for Food" (Disabled)
      // 4. If status OUT_FOR_DELIVERY -> Show "Mark Delivered"

      if (order.status === OrderStatus.OUT_FOR_DELIVERY) {
          return (
            <button 
                onClick={() => updateOrderStatus(order.id, OrderStatus.DELIVERED)}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition"
            >
                <CheckSquare /> Mark Delivered & Collect Cash
            </button>
          );
      }

      if (order.status === OrderStatus.READY_FOR_PICKUP) {
          // Food is ready, rider can pickup regardless of 'Arrived' state (implicit arrival)
          return (
            <button 
                onClick={() => updateOrderStatus(order.id, OrderStatus.OUT_FOR_DELIVERY)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 animate-pulse"
            >
                <PackageCheck /> Food Collected (Start Delivery)
            </button>
          );
      }

      // If we are here, status is likely PREPARING or PENDING.
      if (!order.riderArrived) {
          return (
            <button 
                onClick={() => markRiderArrived(order.id)}
                className="w-full bg-axe-gold hover:bg-amber-700 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2"
            >
                <Store /> Arrived at Restaurant
            </button>
          );
      } else {
          return (
            <div className="w-full bg-amber-50 text-amber-800 py-3 rounded-lg font-bold flex items-center justify-center gap-2 border border-amber-200">
                <Clock size={16} /> Waiting for Food...
            </div>
          );
      }
  };

  return (
    <div className="min-h-screen bg-axe-dark text-axe-skin pb-20">
       <header className="bg-white p-4 sticky top-0 z-30 shadow-md border-b border-gray-100 flex justify-between items-center">
           <div className="flex items-center gap-3">
               <Bike className="text-axe-gold" size={28} />
               <div>
                   <h1 className="font-bold text-lg text-axe-skin uppercase tracking-wider">Axle Fleet</h1>
                   <p className="text-xs text-axe-silver">ID: {currentUser?.id.slice(0,8)}</p>
               </div>
           </div>
           <div className="flex items-center gap-3">
               <div className={`px-3 py-1 rounded-full text-xs font-bold border animate-pulse ${isDebtHigh ? 'bg-red-100 text-red-700 border-red-200' : 'bg-green-100 text-green-700 border-green-200'}`}>
                   {isDebtHigh ? 'RESTRICTED' : 'ONLINE'}
               </div>
               <button onClick={logout}><LogOut className="text-axe-silver hover:text-axe-skin" size={20}/></button>
           </div>
       </header>

       <main className="p-4 space-y-6 max-w-3xl mx-auto">
           {/* Wallet Card */}
           <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-xl shadow-xl">
               <div className="flex justify-between items-start mb-4">
                   <div>
                       <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Platform Wallet</h2>
                       <p className="text-xs text-slate-500">Fees owed to Axle (Deposited weekly)</p>
                   </div>
                   <Wallet className={isDebtHigh ? "text-red-500" : "text-green-500"} />
               </div>
               <div className="text-4xl font-black mb-2">Rs. {debt.toLocaleString()}</div>
               
               {isDebtHigh ? (
                   <div className="bg-red-500/20 border border-red-500/50 p-3 rounded text-sm text-red-200 flex items-center gap-2">
                       <AlertTriangle size={16} />
                       <span>Warning: Limit reached. Deposit to unlock orders.</span>
                   </div>
               ) : (
                   <div className="flex gap-2 text-xs text-slate-400">
                       <span className="bg-white/10 px-2 py-1 rounded">Limit: Rs. 5,000</span>
                       <span className="bg-white/10 px-2 py-1 rounded">Next Deposit: Sunday</span>
                   </div>
               )}
           </div>

           {/* Current Task */}
           {myActiveDeliveries.length > 0 && (
               <section>
                   <h2 className="text-xs font-bold text-axe-brown uppercase tracking-widest mb-3">Active Mission</h2>
                   {myActiveDeliveries.map(order => (
                       <div key={order.id} className="bg-white rounded-xl p-6 border border-axe-gold shadow-xl mb-4 relative overflow-hidden">
                           <div className="absolute top-0 right-0 p-2 bg-axe-gold text-white font-bold text-xs uppercase rounded-bl-xl shadow-sm">
                               {order.status === OrderStatus.READY_FOR_PICKUP ? 'Food Ready' : 
                                order.status === OrderStatus.OUT_FOR_DELIVERY ? 'On Way' : 'Preparing'}
                           </div>
                           
                           <div className="flex justify-between items-start mb-6">
                               <div>
                                   <h3 className="font-bold text-2xl text-axe-skin">{order.restaurantName}</h3>
                                   <p className="text-axe-silver text-sm mt-1">Order #{order.id.slice(-4)}</p>
                                   <div className="mt-2 bg-green-50 border border-green-200 p-2 rounded inline-block">
                                        <p className="text-green-700 font-bold text-sm">Collect Cash: Rs. {order.total}</p>
                                        <p className="text-xs text-green-600">Your Earnings: Rs. {order.deliveryFee}</p>
                                   </div>
                               </div>
                           </div>
                           
                           <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
                               <div className="flex justify-between items-center mb-2">
                                    <div className="text-sm text-axe-skin flex items-center gap-2 font-medium">
                                        <MapPin className="text-axe-gold" size={16}/> {order.deliveryAddress}
                                    </div>
                                    <button className="bg-white p-2 rounded-full text-axe-gold hover:text-white hover:bg-axe-gold transition border border-gray-200 shadow-sm"><Phone size={16}/></button>
                               </div>
                               
                               {/* Real Map View */}
                               {order.deliveryLocation && (
                                   <LocationPicker 
                                      readOnly 
                                      onConfirm={() => {}} 
                                      initialLat={order.deliveryLocation.lat} 
                                      initialLng={order.deliveryLocation.lng} 
                                   />
                               )}
                           </div>

                           {/* Action Buttons */}
                           <div className="space-y-3">
                                {renderOrderActions(order)}
                           </div>
                       </div>
                   ))}
               </section>
           )}

           {/* Available Jobs */}
           <section>
                <h2 className="text-xs font-bold text-axe-brown uppercase tracking-widest mb-3">Nearby Pickups</h2>
                {isDebtHigh ? (
                    <div className="text-center py-12 text-red-500 bg-red-50 rounded-xl border border-red-100">
                        <AlertTriangle className="mx-auto mb-2" size={32} />
                        Job board locked. Please clear your dues.
                    </div>
                ) : availableOrders.length === 0 ? (
                    <div className="text-center py-12 text-axe-silver bg-white rounded-xl border border-gray-200">
                        <Bike className="mx-auto mb-2 opacity-50" size={32} />
                        No orders available. Stand by.
                    </div>
                ) : (
                    availableOrders.map(order => (
                        <div key={order.id} className="bg-white p-5 rounded-xl mb-3 flex flex-col md:flex-row justify-between items-center border border-gray-200 hover:border-axe-gold transition shadow-md group gap-4">
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <div className="font-bold text-lg text-axe-skin group-hover:text-axe-gold transition">{order.restaurantName}</div>
                                    <span className="bg-gray-100 text-xs px-2 py-1 rounded text-gray-600 font-bold uppercase">{order.status}</span>
                                </div>
                                <div className="text-green-600 font-bold text-sm">Earn Rs. {order.deliveryFee}</div>
                                <div className="text-xs text-axe-silver mt-1">{order.items.length} items • 2.4 km</div>
                                <div className="text-xs text-axe-silver mt-1 truncate max-w-xs"><MapPin size={10} className="inline mr-1"/>{order.deliveryAddress}</div>
                            </div>
                            <button 
                                onClick={() => handleAcceptOrder(order.id)}
                                className="bg-axe-skin hover:bg-black text-white px-6 py-3 rounded-lg font-bold text-sm transition shadow-lg w-full md:w-auto flex items-center justify-center gap-2"
                            >
                                Accept <ArrowRight size={14} />
                            </button>
                        </div>
                    ))
                )}
           </section>
       </main>
    </div>
  );
};