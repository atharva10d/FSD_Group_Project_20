import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Users, CreditCard, CheckCircle, Plane, AlertCircle } from 'lucide-react';

const Booking = () => {
  const { flightId } = useParams();
  const navigate = useNavigate();
  const [flight, setFlight] = useState(null);
  const [bookedSeats, setBookedSeats] = useState([]);
  
  const [passengers, setPassengers] = useState([{ id: Date.now(), name: '', age: '', gender: 'Male' }]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isAgent = user?.role === 'agent';

  useEffect(() => {
    const fetchFlight = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/flights/${flightId}`);
        setFlight(res.data);
        setBookedSeats(res.data.bookedSeats || []);
      } catch (err) {
        setError('Flight not found');
      }
    };
    fetchFlight();
  }, [flightId]);

  const addPassenger = () => {
    setPassengers([...passengers, { id: Date.now(), name: '', age: '', gender: 'Male' }]);
  };

  const removePassenger = (id) => {
    if (passengers.length === 1) return;
    const index = passengers.findIndex(p => p.id === id);
    if(index > -1 && index < selectedSeats.length) {
        // Remove associated seat
        const newSelected = [...selectedSeats];
        newSelected.splice(index, 1);
        setSelectedSeats(newSelected);
    }
    setPassengers(passengers.filter(p => p.id !== id));
  };

  const updatePassenger = (index, field, value) => {
    const newPassengers = [...passengers];
    newPassengers[index][field] = value;
    setPassengers(newPassengers);
  };

  const handleSeatClick = (seatId) => {
      if (bookedSeats.includes(seatId)) return; // Already booked

      if (selectedSeats.includes(seatId)) {
          // Deselect
          setSelectedSeats(selectedSeats.filter(s => s !== seatId));
      } else {
          // Select
          if (selectedSeats.length >= passengers.length) {
              setError(`You have ${passengers.length} passenger(s). Add more passengers to select additional seats.`);
              setTimeout(() => setError(''), 4000);
              return;
          }
          setSelectedSeats([...selectedSeats, seatId]);
      }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (selectedSeats.length !== passengers.length) {
        setError('Please select exactly one seat per passenger on the seat map.');
        setTimeout(() => setError(''), 4000);
        return;
    }

    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');
    
    if (!token) {
        navigate('/login');
        return;
    }

    // Attach chosen seats to passengers
    const mappedPassengers = passengers.map((p, idx) => ({
        name: p.name,
        age: p.age,
        gender: p.gender,
        seatNumber: selectedSeats[idx]
    }));

    try {
      await axios.post('http://localhost:5000/api/reservations', {
        flightId,
        passengers: mappedPassengers,
        paymentMethod
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Please check seat availability or try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!flight) return <div className="p-10 text-center text-blue-400 font-bold tracking-widest mt-20 animate-pulse">CONNECTING TO FLIGHT RADAR...</div>;

  // Compute Layout rows based on totalSeats (assume 6 columns)
  const totalRows = Math.ceil(flight.totalSeats / 6);
  const rows = Array.from({ length: totalRows }, (_, i) => i + 1);

  return (
    <div className="w-full max-w-7xl mx-auto mt-24 mb-10 px-4">
      {success ? (
        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="glass p-12 text-center rounded-3xl max-w-2xl mx-auto bg-emerald-900/20 shadow-[0_0_50px_rgba(16,185,129,0.2)] border border-emerald-500/50">
          <CheckCircle className="w-24 h-24 mx-auto text-emerald-400 mb-6 drop-shadow-lg" />
          <h2 className="text-4xl font-black text-white mb-2">Booking Confirmed!</h2>
          <p className="text-emerald-200/70 font-medium">Payment finalized. Your seats are secured. Redirecting to your dashboard...</p>
        </motion.div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8 items-start relative">
            
            {/* Left Column: Form Details */}
            <div className="flex-1 w-full order-2 lg:order-1">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass p-8 rounded-3xl shadow-2xl relative border border-slate-700/50 bg-slate-800/60 backdrop-blur-xl">
                  
                  {error && (
                      <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/50 flex items-center gap-3 text-red-200 shadow-inner">
                          <AlertCircle className="w-5 h-5 flex-shrink-0"/>
                          <p className="font-semibold text-sm">{error}</p>
                      </div>
                  )}

                  <div className="mb-8 flex justify-between items-center bg-slate-900/50 p-6 rounded-2xl border border-slate-700/50 shadow-inner overflow-hidden relative">
                    <Plane className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 opacity-[0.03] text-blue-300 pointer-events-none"/>
                    <div className="relative z-10">
                      <p className="font-black text-3xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300 drop-shadow-md tracking-tight mb-2">
                          {flight.source} <span className="text-slate-500 font-normal mx-2">&rarr;</span> {flight.destination}
                      </p>
                      <p className="text-slate-400 font-bold uppercase tracking-wider text-sm flex items-center gap-2">
                          <span className="bg-slate-800 px-2 py-1 rounded text-blue-300">FLIGHT {flight.flightNumber}</span> 
                          • {new Date(flight.departureTime).toLocaleString()} • {flight.airline}
                      </p>
                    </div>
                    <div className="text-right relative z-10 pl-6 border-l border-slate-700 bg-slate-900/20">
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Total</p>
                        <p className="text-4xl font-mono text-emerald-400 font-black tracking-tight drop-shadow-md">
                            ₹{(flight.price * passengers.length).toLocaleString('en-IN')}
                        </p>
                        <p className="text-xs text-slate-500 mt-1 font-bold">(₹{flight.price.toLocaleString('en-IN')} / person)</p>
                    </div>
                  </div>

                  <form onSubmit={handleBooking} className="flex flex-col gap-8">
                    
                    {/* Passengers Section */}
                    <div>
                        <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-2">
                            <h3 className="text-2xl font-bold flex items-center gap-3 text-white"><Users className="w-6 h-6 text-blue-400"/> Passenger Manifest</h3>
                            {isAgent && (
                                <button type="button" onClick={addPassenger} className="bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white font-bold px-4 py-2 rounded-lg transition-colors border border-blue-500/30 text-sm tracking-wide">
                                    + ADD PASSENGER
                                </button>
                            )}
                        </div>
                        
                        <div className="space-y-4">
                            {passengers.map((p, i) => (
                              <div key={p.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-slate-900/40 p-5 rounded-2xl border border-slate-700/50 shadow-inner group relative">
                                {passengers.length > 1 && (
                                    <button type="button" onClick={() => removePassenger(p.id)} className="absolute -top-3 -right-3 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg z-10">&times;</button>
                                )}
                                <div className="md:col-span-1 flex flex-col justify-center items-center bg-slate-800 rounded-lg border border-slate-700">
                                   <span className="text-xs font-black text-slate-500">P-{i+1}</span>
                                   <span className="text-blue-400 font-bold">{selectedSeats[i] || '--'}</span>
                                </div>
                                <div className="md:col-span-8 flex flex-col space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Full Name</label>
                                    <input type="text" placeholder="John Doe" required value={p.name} onChange={(e)=>updatePassenger(i, 'name', e.target.value)} className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500 w-full"/>
                                </div>
                                <div className="md:col-span-1 flex flex-col space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Age</label>
                                    <input type="number" placeholder="25" required min="1" max="120" value={p.age} onChange={(e)=>updatePassenger(i, 'age', e.target.value)} className="bg-slate-800 border border-slate-600 rounded-lg px-2 py-2 text-white outline-none focus:border-blue-500 w-full text-center"/>
                                </div>
                                <div className="md:col-span-2 flex flex-col space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Gender</label>
                                    <select value={p.gender} onChange={(e)=>updatePassenger(i, 'gender', e.target.value)} className="bg-slate-800 border border-slate-600 rounded-lg px-2 py-2 text-white outline-none focus:border-blue-500 w-full">
                                      <option value="Male">Male</option>
                                      <option value="Female">Female</option>
                                      <option value="Other">Other</option>
                                    </select>
                                </div>
                              </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Payment Section */}
                    <div>
                        <h3 className="text-2xl font-bold flex items-center gap-3 text-white mb-4 border-b border-slate-700 pb-2"><CreditCard className="w-6 h-6 text-indigo-400"/> Payment Verification</h3>
                        <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-700/50 flex flex-col md:flex-row items-center gap-6">
                            <select className="bg-slate-800 border border-slate-600 p-4 rounded-xl text-white outline-none focus:border-indigo-500 w-full md:w-1/2 font-bold" value={paymentMethod} onChange={(e)=>setPaymentMethod(e.target.value)}>
                              <option value="Credit Card">Credit Card</option>
                              <option value="Debit Card">Debit Card</option>
                              <option value="PayPal">PayPal Account</option>
                            </select>
                            <div className="text-xs text-slate-400 bg-slate-800 p-4 rounded-xl border border-slate-700 flex-1">
                                <span className="font-bold text-indigo-400 block mb-1">MOCK ENCRYPTION PROTOCOL</span>
                                Secure 256-bit AES simulation. Gateway operates with a 10% simulated rejection rate to test fail-safes.
                            </div>
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="w-full mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-black py-5 rounded-2xl shadow-[0_0_30px_rgba(79,70,229,0.3)] hover:shadow-[0_0_40px_rgba(79,70,229,0.5)] text-xl tracking-widest uppercase transition-all flex items-center justify-center gap-3">
                      {loading ? 'Authorizing Payload...' : (<><CheckCircle className="w-6 h-6"/> Finalize Booking (₹{(flight.price * passengers.length).toLocaleString('en-IN')})</>)}
                    </button>
                    
                  </form>
                </motion.div>
            </div>

            {/* Right Column: Seat Interactive Map */}
            <div className="w-full lg:w-[450px] order-1 lg:order-2 lg:sticky lg:top-24">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass p-6 rounded-[40px] shadow-2xl bg-slate-800/80 border-[8px] border-slate-700/80 flex flex-col items-center">
                    
                    <div className="text-center w-full mb-6 border-b border-slate-600 pb-4">
                        <div className="w-16 h-4 bg-slate-600 rounded-full mx-auto mb-4 opacity-50"></div> {/* Nose cockpit window */}
                        <h3 className="text-2xl font-black text-white tracking-widest uppercase">Boeing Config</h3>
                        <p className="text-sm font-bold text-slate-400 mt-1">Select <span className="text-blue-400 text-lg mx-1">{passengers.length}</span> seats</p>
                    </div>
                    
                    {/* Legend */}
                    <div className="flex gap-4 justify-center w-full mb-8 text-xs font-bold uppercase tracking-wider">
                        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded border border-emerald-500/50 bg-slate-900/50"></div> <span className="text-slate-400">Available</span></div>
                        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div> <span className="text-slate-400">Selected</span></div>
                        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-red-500/50 border border-red-500 cursor-not-allowed"></div> <span className="text-slate-400">Occupied</span></div>
                    </div>

                    {/* Cabin Area */}
                    <div className="w-full max-h-[500px] overflow-y-auto px-4 custom-scrollbar flex flex-col items-center gap-3 pb-8 relative">
                        {rows.map(row => (
                            <div key={row} className="flex gap-2 md:gap-4 items-center w-full justify-center group">
                                {/* Left seats: A, B, C */}
                                <div className="flex gap-1.5 md:gap-2">
                                    {['A', 'B', 'C'].map(col => {
                                        const seatId = `${row}${col}`;
                                        const isBooked = bookedSeats.includes(seatId);
                                        const isSelected = selectedSeats.includes(seatId);
                                        return (
                                            <button 
                                                key={seatId} 
                                                disabled={isBooked}
                                                onClick={() => handleSeatClick(seatId)}
                                                title={isBooked ? 'Booked' : `Seat ${seatId}`}
                                                className={`w-10 h-10 md:w-12 md:h-12 rounded-t-xl rounded-b-md font-mono text-xs font-black transition-all duration-300 flex items-center justify-center select-none
                                                    ${isBooked ? 'bg-red-500/40 border border-red-500/60 text-red-200/50 cursor-not-allowed' : 
                                                    isSelected ? 'bg-blue-500 border-2 border-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.6)] scale-110 z-10' : 
                                                    'bg-slate-900/60 border border-emerald-500/40 text-emerald-500/70 hover:bg-emerald-500/20 hover:border-emerald-400 hover:text-emerald-400 hover:scale-105 cursor-pointer'}
                                                `}
                                            >
                                                {seatId}
                                            </button>
                                        );
                                    })}
                                </div>
                                
                                {/* Aisle Marker */}
                                <div className="w-6 h-8 flex items-center justify-center font-bold text-slate-600 text-xs">
                                   {row}
                                </div>

                                {/* Right seats: D, E, F */}
                                <div className="flex gap-1.5 md:gap-2">
                                    {['D', 'E', 'F'].map(col => {
                                        const seatId = `${row}${col}`;
                                        const isBooked = bookedSeats.includes(seatId);
                                        const isSelected = selectedSeats.includes(seatId);
                                        return (
                                            <button 
                                                key={seatId} 
                                                disabled={isBooked}
                                                onClick={() => handleSeatClick(seatId)}
                                                title={isBooked ? 'Booked' : `Seat ${seatId}`}
                                                className={`w-10 h-10 md:w-12 md:h-12 rounded-t-xl rounded-b-md font-mono text-xs font-black transition-all duration-300 flex items-center justify-center select-none
                                                    ${isBooked ? 'bg-red-500/40 border border-red-500/60 text-red-200/50 cursor-not-allowed' : 
                                                    isSelected ? 'bg-blue-500 border-2 border-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.6)] scale-110 z-10' : 
                                                    'bg-slate-900/60 border border-emerald-500/40 text-emerald-500/70 hover:bg-emerald-500/20 hover:border-emerald-400 hover:text-emerald-400 hover:scale-105 cursor-pointer'}
                                                `}
                                            >
                                                {seatId}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-600 w-full text-center">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Tail Section</p>
                    </div>

                </motion.div>
            </div>
            
        </div>
      )}
    </div>
  );
};

export default Booking;
