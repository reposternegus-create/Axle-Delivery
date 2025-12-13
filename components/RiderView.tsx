import React from 'react';
import { useApp } from '../context/AppContext';
import { OrderStatus } from '../types';
import { Bike, MapPin, Navigation, CheckSquare } from 'lucide-react';

export const RiderView: React.FC = () => {
  const { orders, updateOrderStatus } = useApp();

  const availableOrders = orders.filter(o => o.status === OrderStatus.READY_FOR_PICKUP);
  const myActiveDeliveries = orders.filter(o => o.status === OrderStatus.OUT_FOR_DELIVERY);

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 pb-20">
       <header className="bg-neutral-800 p-4 sticky top-0 z-30 shadow-lg border-b border-neutral-700">
           <div className="flex justify-between items-center">
               <div className="flex items-center gap-2">
                   <Bike className="text-axe-steel" />
                   <h1 className="font-bold text-lg">Axle Rider</h1>
               </div>
               <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold border border-green-500/50">
                   ONLINE
               </div>
           </div>
       </header>

       <main className="p-4 space-y-6">
           {/* Current Task */}
           {myActiveDeliveries.length > 0 && (
               <section>
                   <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-2">Current Deliveries</h2>
                   {myActiveDeliveries.map(order => (
                       <div key={order.id} className="bg-neutral-800 rounded-xl p-6 border-l-4 border-axe-rust shadow-lg mb-4">
                           <div className="flex justify-between items-start mb-4">
                               <div>
                                   <h3 className="font-bold text-xl">{order.restaurantName}</h3>
                                   <p className="text-neutral-400 text-sm flex items-center gap-1 mt-1"><MapPin size={14}/> {order.deliveryAddress}</p>
                               </div>
                               <div className="bg-axe-rust text-white px-2 py-1 rounded text-xs font-bold">Priority</div>
                           </div>
                           
                           <div className="bg-neutral-900 p-4 rounded-lg mb-4">
                               {/* Mock Map */}
                               <div className="w-full h-32 bg-neutral-800 rounded flex items-center justify-center text-neutral-600 text-sm border border-neutral-700 border-dashed">
                                   <Navigation className="mr-2" /> Navigation Simulation
                               </div>
                           </div>

                           <button 
                               onClick={() => updateOrderStatus(order.id, OrderStatus.DELIVERED)}
                               className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-green-900/50"
                           >
                               <CheckSquare /> Complete Delivery
                           </button>
                       </div>
                   ))}
               </section>
           )}

           {/* Available Jobs */}
           <section>
                <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-2">Available Pickups</h2>
                {availableOrders.length === 0 ? (
                    <div className="text-center py-10 text-neutral-600 bg-neutral-800/50 rounded-xl border border-neutral-800">
                        No orders ready for pickup nearby.
                    </div>
                ) : (
                    availableOrders.map(order => (
                        <div key={order.id} className="bg-neutral-800 p-4 rounded-xl mb-3 flex justify-between items-center border border-neutral-700">
                            <div>
                                <div className="font-bold text-lg">{order.restaurantName}</div>
                                <div className="text-neutral-400 text-sm">Earn ${ (order.total * 0.15).toFixed(2) }</div>
                                <div className="text-xs text-neutral-500 mt-1">{order.items.length} items • 2.4 km</div>
                            </div>
                            <button 
                                onClick={() => updateOrderStatus(order.id, OrderStatus.OUT_FOR_DELIVERY)}
                                className="bg-axe-steel text-neutral-900 hover:bg-white px-4 py-2 rounded-lg font-bold text-sm transition"
                            >
                                Accept
                            </button>
                        </div>
                    ))
                )}
           </section>
       </main>
    </div>
  );
};