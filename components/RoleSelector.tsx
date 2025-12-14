import React, { useState } from 'react';
import { UserRole, VerificationStatus, User } from '../types';
import { useApp } from '../context/AppContext';
import { Axe, ChefHat, Bike, ShoppingBag, ArrowRight, Upload, Phone, MapPin, AlertCircle, FileText } from 'lucide-react';
import { LocationPicker } from './LocationPicker';

export const RoleSelector: React.FC = () => {
  const { login, restaurants, riders } = useApp(); // Get riders from context for login check
  const [selectedFlow, setSelectedFlow] = useState<UserRole | null>(null);
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER' | null>(null);
  
  // Auth Form State
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState<{lat: number, lng: number} | undefined>(undefined);
  
  // Restaurant Specific
  const [resLegalName, setResLegalName] = useState('');
  const [resOwnerName, setResOwnerName] = useState('');
  const [resAddress, setResAddress] = useState('');
  const [resLocation, setResLocation] = useState<{lat: number, lng: number} | undefined>(undefined);
  
  // Rider Specific
  const [idFile, setIdFile] = useState<File | null>(null);

  const validatePhone = (num: string): boolean => {
    const regex = /^3[0-9]{9}$/;
    if (!regex.test(num)) {
        setPhoneError('Format: 3001234567 (10 digits)');
        return false;
    }
    setPhoneError('');
    return true;
  };

  const resetForm = () => {
      setStep(1);
      setAuthMode(null);
      setPhone('');
      setOtp('');
      setName('');
      setAddress('');
      setIdFile(null);
      setPhoneError('');
      setEmail('');
      setPassword('');
  };

  const handleLogin = (role: UserRole) => {
    if (role === UserRole.CUSTOMER) {
      const user: User = { 
          id: `cust-${phone}`, 
          role: UserRole.CUSTOMER, 
          name: 'Valued Customer', 
          phone: `+92${phone}`,
          address: address,
          location: location
      };
      login(user);
    } else if (role === UserRole.RIDER) {
        // If Login Mode, try to find existing rider (simulated)
        if (authMode === 'LOGIN') {
             const existing = riders.find(r => r.phone?.includes(phone));
             // In a real app we would check password/OTP here.
             // For demo, if they exist in local storage, log them in, else create a session
             const user: User = existing || {
                id: `ride-${phone}`, 
                role: UserRole.RIDER, 
                name: 'Rider', 
                phone: `+92${phone}`, 
                riderIdUrl: 'existing' 
             };
             login(user);
        } else {
            // Registration
            const user: User = { 
                id: `ride-${phone}`, 
                role: UserRole.RIDER, 
                name: name, 
                phone: `+92${phone}`, 
                riderIdUrl: 'uploaded_mock_url' 
            };
            login(user);
        }
    } else if (role === UserRole.RESTAURANT) {
        const existing = restaurants.find(r => r.email === email);
        if (existing) {
             const user: User = { 
                 id: existing.ownerName || 'owner', 
                 role: UserRole.RESTAURANT, 
                 name: existing.ownerName, 
                 restaurantDetails: existing 
             };
             login(user);
        } else {
            const newRest = {
                id: `rest-${Date.now()}`,
                name: resLegalName,
                image: 'https://picsum.photos/400/300?random=10',
                rating: 5.0,
                deliveryTime: 'Pending',
                categories: ['New'],
                menu: [],
                ownerName: resOwnerName,
                email,
                phone: `+92${phone}`,
                address: resAddress,
                location: resLocation,
                isVerified: VerificationStatus.PENDING
            };
            const user: User = {
                id: `owner-${Date.now()}`,
                role: UserRole.RESTAURANT,
                name: resOwnerName,
                restaurantDetails: newRest
            };
            login(user);
        }
    }
  };

  const renderAuthForm = () => {
    if (!selectedFlow) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-axe-panel border border-axe-steel/20 p-8 rounded-2xl w-full max-w-md relative shadow-2xl overflow-y-auto max-h-[90vh]">
                <button onClick={() => { setSelectedFlow(null); resetForm(); }} className="absolute top-4 right-4 text-axe-steel hover:text-axe-gold">✕</button>
                
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-2 text-axe-skin">
                    {selectedFlow === UserRole.CUSTOMER && <ShoppingBag className="text-axe-gold"/>}
                    {selectedFlow === UserRole.RESTAURANT && <ChefHat className="text-axe-gold"/>}
                    {selectedFlow === UserRole.RIDER && <Bike className="text-axe-gold"/>}
                    {selectedFlow === UserRole.CUSTOMER ? 'Customer Login' : selectedFlow === UserRole.RESTAURANT ? 'Partner Portal' : 'Rider App'}
                </h2>
                <p className="text-axe-steel text-sm mb-6">Secure access to the Axle Network.</p>

                {/* CUSTOMER FLOW (unchanged logic) */}
                {selectedFlow === UserRole.CUSTOMER && (
                    <div className="space-y-4">
                        {step === 1 ? (
                            <>
                                <div>
                                    <label className="text-xs font-bold uppercase text-axe-brown mb-1 block">Mobile Number</label>
                                    <div className={`flex bg-axe-dark border ${phoneError ? 'border-red-500' : 'border-axe-steel/30'} rounded-lg overflow-hidden`}>
                                        <span className="p-3 bg-gray-100 text-axe-skin font-bold border-r border-axe-steel/30">+92</span>
                                        <input 
                                            type="tel" 
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                                            className="bg-transparent p-3 w-full outline-none text-axe-skin placeholder-axe-steel/50" 
                                            placeholder="3001234567"
                                            maxLength={10}
                                        />
                                    </div>
                                    {phoneError && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12}/> {phoneError}</p>}
                                </div>
                                <button 
                                    onClick={() => {
                                        if (validatePhone(phone)) setStep(2);
                                    }}
                                    disabled={!phone || phone.length !== 10}
                                    className="w-full bg-axe-gold hover:bg-amber-700 text-white font-bold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-200"
                                >
                                    Send Verification Code
                                </button>
                            </>
                        ) : step === 2 ? (
                            <>
                                <div>
                                    <label className="text-xs font-bold uppercase text-axe-brown mb-1 block">Enter OTP</label>
                                    <input 
                                        type="text" 
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="bg-axe-dark border border-axe-steel/30 p-3 w-full rounded-lg outline-none text-axe-skin text-center tracking-[1em] font-mono text-xl" 
                                        placeholder="0000"
                                        maxLength={4}
                                    />
                                    <p className="text-xs text-axe-steel text-center mt-2">Code sent to +92 {phone}</p>
                                </div>
                                <button 
                                    onClick={() => {
                                        if(otp.length === 4) setStep(3);
                                    }}
                                    disabled={otp.length !== 4}
                                    className="w-full bg-axe-gold hover:bg-amber-700 text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
                                >
                                    Verify Code
                                </button>
                            </>
                        ) : (
                            <>
                                <LocationPicker 
                                    onConfirm={(addr, lat, lng) => {
                                        setAddress(addr);
                                        setLocation({ lat, lng });
                                    }} 
                                    label="Set Home Location" 
                                />
                                
                                <div>
                                    <label className="text-xs font-bold uppercase text-axe-brown mb-1 block">Full Address</label>
                                    <div className="flex bg-axe-dark border border-axe-steel/30 rounded-lg overflow-hidden p-3 items-start gap-2">
                                        <MapPin className="text-axe-gold mt-1" size={16} />
                                        <textarea 
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            className="bg-transparent w-full outline-none text-axe-skin placeholder-axe-steel/50 text-sm h-20 resize-none" 
                                            placeholder="House No, Street, Area, City (or pin from map)"
                                        />
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleLogin(UserRole.CUSTOMER)}
                                    disabled={!address || !location}
                                    className="w-full bg-axe-gold hover:bg-amber-700 text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
                                >
                                    Confirm Address & Login
                                </button>
                            </>
                        )}
                    </div>
                )}

                {/* RIDER FLOW */}
                {selectedFlow === UserRole.RIDER && (
                    <div className="space-y-4">
                        {!authMode ? (
                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={() => setAuthMode('LOGIN')} className="bg-axe-dark border border-axe-steel/30 hover:border-axe-gold p-4 rounded-xl text-center shadow-sm">
                                    <span className="block font-bold text-axe-skin mb-1">Login</span>
                                    <span className="text-xs text-axe-steel">Existing Fleet</span>
                                </button>
                                <button onClick={() => setAuthMode('REGISTER')} className="bg-amber-50 border border-amber-200 hover:bg-amber-100 p-4 rounded-xl text-center shadow-sm">
                                    <span className="block font-bold text-axe-gold mb-1">Join</span>
                                    <span className="text-xs text-axe-steel">New Rider</span>
                                </button>
                            </div>
                        ) : authMode === 'LOGIN' ? (
                            // RIDER LOGIN
                            <>
                                <div>
                                    <label className="text-xs font-bold uppercase text-axe-brown mb-1 block">Mobile Number</label>
                                    <div className={`flex bg-axe-dark border ${phoneError ? 'border-red-500' : 'border-axe-steel/30'} rounded-lg overflow-hidden`}>
                                        <span className="p-3 bg-gray-100 text-axe-skin font-bold border-r border-axe-steel/30">+92</span>
                                        <input 
                                            type="tel" 
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                                            className="bg-transparent p-3 w-full outline-none text-axe-skin" 
                                            placeholder="3001234567"
                                            maxLength={10}
                                        />
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleLogin(UserRole.RIDER)} 
                                    disabled={!phone || phone.length !== 10}
                                    className="w-full bg-axe-gold hover:bg-amber-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-amber-200 disabled:opacity-50"
                                >
                                    Login to Fleet
                                </button>
                                <button onClick={() => setAuthMode(null)} className="w-full text-xs text-axe-silver hover:text-axe-gold">Back</button>
                            </>
                        ) : (
                            // RIDER REGISTER
                             step === 1 ? (
                                <>
                                    <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} className="w-full bg-axe-dark border border-axe-steel/30 p-3 rounded-lg text-axe-skin" />
                                    <div className="flex bg-axe-dark border border-axe-steel/30 rounded-lg overflow-hidden">
                                        <span className="p-3 bg-gray-100 text-axe-skin font-bold border-r border-axe-steel/30">+92</span>
                                        <input 
                                            type="tel" 
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                                            className="bg-transparent p-3 w-full outline-none text-axe-skin" 
                                            placeholder="3001234567"
                                            maxLength={10}
                                        />
                                    </div>
                                    <button 
                                        onClick={() => {
                                            if (validatePhone(phone) && name.length > 2) setStep(2);
                                        }} 
                                        disabled={!name || !phone || phone.length !== 10}
                                        className="w-full bg-axe-gold hover:bg-amber-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-amber-200 disabled:opacity-50"
                                    >Next</button>
                                </>
                            ) : step === 2 ? (
                                <>
                                    <div className="text-center p-6 border-2 border-dashed border-axe-gold/50 rounded-lg bg-axe-dark">
                                        <Upload className="mx-auto text-axe-gold mb-2" />
                                        <p className="text-sm text-axe-skin font-bold">Upload Government ID / CNIC</p>
                                        <p className="text-xs text-axe-steel mb-4">Required for background check</p>
                                        <input type="file" onChange={e => setIdFile(e.target.files?.[0] || null)} className="text-xs text-axe-steel ml-4" />
                                    </div>
                                    <button onClick={() => setStep(3)} disabled={!idFile} className="w-full bg-axe-gold hover:bg-amber-700 text-white font-bold py-3 rounded-lg disabled:opacity-50 shadow-lg shadow-amber-200">Submit Documents</button>
                                </>
                            ) : (
                                <>
                                    <input 
                                        type="text" 
                                        placeholder="Enter OTP (0000)" 
                                        value={otp}
                                        onChange={e => setOtp(e.target.value)}
                                        className="w-full bg-axe-dark border border-axe-steel/30 p-3 rounded-lg text-center tracking-widest text-axe-skin" 
                                        maxLength={4}
                                    />
                                    <button 
                                        onClick={() => handleLogin(UserRole.RIDER)} 
                                        disabled={otp.length !== 4}
                                        className="w-full bg-axe-gold hover:bg-amber-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-amber-200 disabled:opacity-50"
                                    >
                                        Complete Registration
                                    </button>
                                </>
                            )
                        )}
                        {authMode === 'REGISTER' && step === 1 && (
                             <button onClick={() => setAuthMode(null)} className="w-full text-xs text-axe-silver hover:text-axe-gold">Back</button>
                        )}
                    </div>
                )}

                {/* RESTAURANT FLOW */}
                {selectedFlow === UserRole.RESTAURANT && (
                    <div className="space-y-4">
                        {step === 1 ? (
                            // Login vs Register Choice
                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={() => setStep(2)} className="bg-axe-dark border border-axe-steel/30 hover:border-axe-gold p-4 rounded-xl text-center shadow-sm">
                                    <span className="block font-bold text-axe-skin mb-1">Login</span>
                                    <span className="text-xs text-axe-steel">Existing Partners</span>
                                </button>
                                <button onClick={() => setStep(3)} className="bg-amber-50 border border-amber-200 hover:bg-amber-100 p-4 rounded-xl text-center shadow-sm">
                                    <span className="block font-bold text-axe-gold mb-1">Register</span>
                                    <span className="text-xs text-axe-steel">New Restaurant</span>
                                </button>
                            </div>
                        ) : step === 2 ? (
                            // Login
                            <>
                                <input type="email" placeholder="Restaurant Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-axe-dark border border-axe-steel/30 p-3 rounded-lg text-axe-skin" />
                                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-axe-dark border border-axe-steel/30 p-3 rounded-lg text-axe-skin" />
                                <button 
                                    onClick={() => handleLogin(UserRole.RESTAURANT)} 
                                    disabled={!email || !password}
                                    className="w-full bg-axe-skin text-white font-bold py-3 rounded-lg hover:bg-black shadow-lg disabled:opacity-50"
                                >
                                    Access Dashboard
                                </button>
                            </>
                        ) : (
                            // Register - Layer 1
                            <div className="space-y-3">
                                <h3 className="text-sm font-bold text-axe-gold uppercase">Layer 1: Basic Info</h3>
                                <input type="text" placeholder="Legal Restaurant Name" value={resLegalName} onChange={e => setResLegalName(e.target.value)} className="w-full bg-axe-dark border border-axe-steel/30 p-3 rounded-lg text-axe-skin text-sm" />
                                <input type="text" placeholder="Owner Full Name" value={resOwnerName} onChange={e => setResOwnerName(e.target.value)} className="w-full bg-axe-dark border border-axe-steel/30 p-3 rounded-lg text-axe-skin text-sm" />
                                <div className="flex gap-2">
                                    <div className="flex flex-1 bg-axe-dark border border-axe-steel/30 rounded-lg overflow-hidden">
                                        <span className="p-3 bg-gray-100 text-axe-skin text-sm font-bold border-r border-axe-steel/30">+92</span>
                                        <input type="tel" placeholder="300..." value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} className="w-full p-3 outline-none text-axe-skin text-sm bg-transparent" maxLength={10} />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-axe-dark border border-axe-steel/30 p-3 rounded-lg text-axe-skin text-sm" />
                                </div>
                                
                                {/* Location Picker for Restaurant */}
                                <LocationPicker 
                                    onConfirm={(addr, lat, lng) => {
                                        setResAddress(addr);
                                        setResLocation({lat, lng});
                                    }} 
                                    label="Restaurant Location" 
                                />

                                <input type="text" placeholder="Physical Address" value={resAddress} onChange={e => setResAddress(e.target.value)} className="w-full bg-axe-dark border border-axe-steel/30 p-3 rounded-lg text-axe-skin text-sm" />
                                
                                <div className="pt-2 border-t border-axe-steel/30">
                                    <h3 className="text-sm font-bold text-axe-gold uppercase mb-2">Layer 2: Documents</h3>
                                    <div className="border border-dashed border-axe-steel p-4 rounded text-center text-xs text-axe-steel cursor-pointer hover:bg-axe-gold/10">
                                        <FileText className="mx-auto mb-1" size={16}/>
                                        Upload Business License (PDF/JPG)
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleLogin(UserRole.RESTAURANT)} 
                                    disabled={!resLegalName || !resOwnerName || !phone || !email || !resAddress || !resLocation}
                                    className="w-full bg-axe-gold hover:bg-amber-700 text-white font-bold py-3 rounded-lg mt-2 shadow-lg shadow-amber-200 disabled:opacity-50"
                                >
                                    Submit for Approval
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
  };

  return (
    <div className="min-h-screen bg-axe-dark flex items-center justify-center p-4">
      {renderAuthForm()}
      
      {!selectedFlow && (
        <div className="w-full max-w-4xl animate-fade-in">
             <div className="text-center mb-12">
                 <div className="inline-block p-4 rounded-full bg-axe-gold mb-4 shadow-lg shadow-amber-500/20">
                    <Axe size={48} className="text-white" />
                 </div>
                 <h1 className="text-4xl md:text-6xl font-black text-axe-skin tracking-tight mb-4">
                    AXLE <span className="text-axe-gold">NETWORK</span>
                 </h1>
                 <p className="text-axe-silver text-lg md:text-xl max-w-2xl mx-auto">
                    Hyper-local logistics for food, retail, and last-mile delivery. 
                    <br/><span className="text-axe-gold font-bold">Who are you?</span>
                 </p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {/* Customer Card */}
                 <button 
                    onClick={() => { setSelectedFlow(UserRole.CUSTOMER); setStep(1); }}
                    className="bg-axe-panel border border-axe-steel/20 p-8 rounded-2xl hover:border-axe-gold hover:scale-105 transition group text-left relative overflow-hidden"
                 >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                        <ShoppingBag size={120} className="text-axe-gold" />
                    </div>
                    <div className="w-12 h-12 bg-axe-dark rounded-xl flex items-center justify-center mb-6 text-axe-gold group-hover:bg-axe-gold group-hover:text-white transition">
                        <ShoppingBag size={24} />
                    </div>
                    <h3 className="text-2xl font-bold text-axe-skin mb-2">Customer</h3>
                    <p className="text-axe-steel text-sm mb-6">Order food, groceries, and more from nearby stores.</p>
                    <div className="flex items-center text-axe-gold font-bold text-sm">
                        Continue <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition" />
                    </div>
                 </button>

                 {/* Restaurant Card */}
                 <button 
                    onClick={() => { setSelectedFlow(UserRole.RESTAURANT); setStep(1); }}
                    className="bg-axe-panel border border-axe-steel/20 p-8 rounded-2xl hover:border-axe-gold hover:scale-105 transition group text-left relative overflow-hidden"
                 >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                        <ChefHat size={120} className="text-axe-gold" />
                    </div>
                     <div className="w-12 h-12 bg-axe-dark rounded-xl flex items-center justify-center mb-6 text-axe-gold group-hover:bg-axe-gold group-hover:text-white transition">
                        <ChefHat size={24} />
                    </div>
                    <h3 className="text-2xl font-bold text-axe-skin mb-2">Partner</h3>
                    <p className="text-axe-steel text-sm mb-6">Grow your business with our delivery network.</p>
                    <div className="flex items-center text-axe-gold font-bold text-sm">
                        Partner Login <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition" />
                    </div>
                 </button>

                 {/* Rider Card */}
                 <button 
                    onClick={() => { setSelectedFlow(UserRole.RIDER); setStep(1); resetForm(); }}
                    className="bg-axe-panel border border-axe-steel/20 p-8 rounded-2xl hover:border-axe-gold hover:scale-105 transition group text-left relative overflow-hidden"
                 >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                        <Bike size={120} className="text-axe-gold" />
                    </div>
                     <div className="w-12 h-12 bg-axe-dark rounded-xl flex items-center justify-center mb-6 text-axe-gold group-hover:bg-axe-gold group-hover:text-white transition">
                        <Bike size={24} />
                    </div>
                    <h3 className="text-2xl font-bold text-axe-skin mb-2">Rider</h3>
                    <p className="text-axe-steel text-sm mb-6">Earn money by delivering packages in your area.</p>
                    <div className="flex items-center text-axe-gold font-bold text-sm">
                        Join Fleet <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition" />
                    </div>
                 </button>
             </div>
        </div>
      )}
    </div>
  );
};