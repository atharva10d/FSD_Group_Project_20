import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, PlusCircle, History, Download, Plane, Users, DollarSign, Activity, AlertCircle, Trash2, Edit, Upload, Settings, LayoutDashboard, CalendarDays, CheckCircle, Search, User as UserIcon, MapPin, Pointer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';

const Dashboard = () => {
  const [role, setRole] = useState(localStorage.getItem('role'));
  const [userName, setUserName] = useState(localStorage.getItem('name') || 'Traveler');
  const [userEmail, setUserEmail] = useState(localStorage.getItem('email') || '');
  const [activeTab, setActiveTab] = useState(localStorage.getItem('role') === 'admin' ? 'reports' : 'search_flights');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authVerified, setAuthVerified] = useState(false);
  const navigate = useNavigate();

  // Admin Lists
  const [flights, setFlights] = useState([]);
  const [users, setUsers] = useState([]);
  const [reservations, setReservations] = useState([]);

  // Admin Forms & Messages
  const [showAddForm, setShowAddForm] = useState(false);
  const [editFlightId, setEditFlightId] = useState(null);
  const [formData, setFormData] = useState({ flightNumber: '', airline: '', source: '', destination: '', departureTime: '', arrivalTime: '', totalSeats: '', price: '', status: 'Scheduled' });
  const [editUserId, setEditUserId] = useState(null);
  const [userEditData, setUserEditData] = useState({ firstName: '', lastName: '', email: '', role: '' });
  const [msg, setMsg] = useState({ text: '', type: '' });

  const [seatViewFlight, setSeatViewFlight] = useState(null);
  const [flightSeatsData, setFlightSeatsData] = useState({ totalSeats: 0, bookedSeats: [] });

  // User Dashboard State
  const [searchData, setSearchData] = useState({ source: '', destination: '', date: '' });
  const [availableFlights, setAvailableFlights] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/login');
      
      try {
        const res = await axios.get('http://localhost:5000/api/auth/me', { headers: { Authorization: `Bearer ${token}` }});
        setRole(res.data.role);
        setUserName(res.data.name);
        setUserEmail(res.data.email);
        localStorage.setItem('role', res.data.role);
        
        // Handle Role-based Tab Defaulting
        if (res.data.role === 'admin' && activeTab !== 'reports' && activeTab !== 'manage_flights' && activeTab !== 'manage_users' && activeTab !== 'manage_reservations' && activeTab !== 'backup_restore') {
            setActiveTab('reports');
        } else if (res.data.role !== 'admin' && (activeTab === 'reports' || activeTab === 'manage_flights' || activeTab === 'manage_users' || activeTab === 'manage_reservations' || activeTab === 'backup_restore')) {
            setActiveTab('search_flights');
        }
        setAuthVerified(true);
      } catch (err) {
        localStorage.clear();
        navigate('/login');
      }
    };
    verifyUser();
  }, []);

  useEffect(() => {
    if (authVerified) fetchData();
  }, [role, activeTab, authVerified]);

  const showMsg = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 4000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      if (role === 'admin') {
        if (activeTab === 'reports') {
            const res = await axios.get('http://localhost:5000/api/admin/reports', config);
            setData(res.data);
        } else if (activeTab === 'manage_flights') {
            const res = await axios.get('http://localhost:5000/api/flights', config);
            setFlights(res.data);
        } else if (activeTab === 'manage_users') {
            const res = await axios.get('http://localhost:5000/api/admin/users', config);
            setUsers(res.data);
        } else if (activeTab === 'manage_reservations') {
            const res = await axios.get('http://localhost:5000/api/admin/reservations', config);
            setReservations(res.data);
        }
      } else {
        if (activeTab === 'my_bookings') {
            const res = await axios.get('http://localhost:5000/api/reservations/my', config);
            setData(res.data);
        }
      }
    } catch (err) {
      console.error(err);
      if(activeTab === 'my_bookings' || role==='admin') showMsg('Error fetching data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // --- Flight Actions (Admin) ---
  const handleSaveFlight = async (e) => {
      e.preventDefault();
      try {
          const token = localStorage.getItem('token');
          if (editFlightId) {
              await axios.put(`http://localhost:5000/api/admin/flights/${editFlightId}`, formData, { headers: { Authorization: `Bearer ${token}` }});
              showMsg('Flight updated successfully!');
              setEditFlightId(null);
          } else {
              await axios.post('http://localhost:5000/api/flights', { ...formData, availableSeats: formData.totalSeats }, { headers: { Authorization: `Bearer ${token}` }});
              showMsg('Flight added successfully!');
          }
          setFormData({ flightNumber: '', airline: '', source: '', destination: '', departureTime: '', arrivalTime: '', totalSeats: '', price: '', status: 'Scheduled' });
          setShowAddForm(false);
          fetchData(); 
      } catch (err) {
          showMsg(err.response?.data?.message || 'Error saving flight', 'error');
      }
  };

  const handleDeleteFlight = async (id) => {
      if(!window.confirm("Delete this flight permanently?")) return;
      try {
          const token = localStorage.getItem('token');
          await axios.delete(`http://localhost:5000/api/admin/flights/${id}`, { headers: { Authorization: `Bearer ${token}` }});
          showMsg('Flight deleted!');
          fetchData();
      } catch (err) {
          showMsg('Failed to delete flight', 'error');
      }
  };

  const handleEditFlightClick = (flight) => {
      setEditFlightId(flight._id);
      setFormData({
          flightNumber: flight.flightNumber,
          airline: flight.airline,
          source: flight.source,
          destination: flight.destination,
          departureTime: new Date(flight.departureTime).toISOString().slice(0, 16),
          arrivalTime: new Date(flight.arrivalTime).toISOString().slice(0, 16),
          totalSeats: flight.totalSeats,
          price: flight.price,
          status: flight.status
      });
      setShowAddForm(true);
  };

  // --- User Actions (Admin) ---
  const handleDeleteUser = async (id) => {
      if(!window.confirm("Delete this user?")) return;
      try {
          const token = localStorage.getItem('token');
          await axios.delete(`http://localhost:5000/api/admin/users/${id}`, { headers: { Authorization: `Bearer ${token}` }});
          showMsg('User deleted!');
          fetchData();
      } catch (err) {
          showMsg('Failed to delete user', 'error');
      }
  };

  const handleUpdateUser = async (e, id) => {
      e.preventDefault();
      try {
          const token = localStorage.getItem('token');
          await axios.put(`http://localhost:5000/api/admin/users/${id}`, userEditData, { headers: { Authorization: `Bearer ${token}` }});
          showMsg('User updated!');
          setEditUserId(null);
          fetchData();
      } catch (err) {
          showMsg('Failed to update user', 'error');
      }
  };

  // --- Seat View & Booking Cancel (Admin) ---
  const openSeatView = async (flightId) => {
      try {
          const token = localStorage.getItem('token');
          const res = await axios.get(`http://localhost:5000/api/flights/${flightId}/seats`, { headers: { Authorization: `Bearer ${token}` }});
          setFlightSeatsData({ totalSeats: res.data.totalSeats, bookedSeats: res.data.bookedSeats });
          setSeatViewFlight(flightId);
      } catch(err) {
          showMsg('Error fetching seats', 'error');
      }
  };

  const handleAdminCancel = async (resId) => {
      if(!window.confirm("Cancel this booking? Seats will be released instantly.")) return;
      try {
          const token = localStorage.getItem('token');
          await axios.put(`http://localhost:5000/api/reservations/${resId}/cancel`, {}, { headers: { Authorization: `Bearer ${token}` }});
          showMsg("Booking cancelled and seats successfully released.");
          fetchData();
      } catch(err) {
          showMsg('Cancellation failed.', 'error');
      }
  };

  // --- Backup & Restore (Admin) ---
  const handleBackup = async () => {
      try {
          const token = localStorage.getItem('token');
          const res = await axios.get('http://localhost:5000/api/admin/backup', { headers: { Authorization: `Bearer ${token}` }});
          const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res.data));
          const dlAnchorElem = document.createElement('a');
          dlAnchorElem.setAttribute("href", dataStr);
          dlAnchorElem.setAttribute("download", "database_backup.json");
          dlAnchorElem.click();
          showMsg('Backup downloaded successfully!');
      } catch (err) {
          showMsg('Backup failed', 'error');
      }
  };

  const handleRestore = async (e) => {
      const file = e.target.files[0];
      if(!file) return;
      const reader = new FileReader();
      reader.onload = async (e) => {
          try {
              const token = localStorage.getItem('token');
              const jsonData = JSON.parse(e.target.result);
              await axios.post('http://localhost:5000/api/admin/restore', jsonData, { headers: { Authorization: `Bearer ${token}` }});
              showMsg('Database restored successfully from JSON!');
              fetchData();
          } catch(err) {
              showMsg('Restore failed. Invalid JSON or server error.', 'error');
          }
      };
      reader.readAsText(file);
  };

  // --- Search Flights (User) ---
  const handleSearchFlights = async (e) => {
      e.preventDefault();
      setLoading(true);
      setHasSearched(true);
      try {
          const query = new URLSearchParams(searchData).toString();
          const res = await axios.get(`http://localhost:5000/api/flights/search?${query}`);
          setAvailableFlights(res.data);
      } catch (err) {
          showMsg('Network error while searching for flights', 'error');
      } finally {
          setLoading(false);
      }
  };

  // --- PDF ---
  const generatePDF = (reservation) => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text('AeroServe Boarding Pass', 105, 20, { align: 'center' });
    doc.setFontSize(16);
    doc.text(`Flight: ${reservation.flightId?.source} to ${reservation.flightId?.destination}`, 20, 40);
    doc.text(`Booking Ref: ${reservation._id}`, 20, 50);
    doc.save(`BoardingPass_${reservation._id}.pdf`);
  };

  if(!role || !authVerified) return <div className="absolute inset-0 bg-slate-900 flex items-center justify-center text-blue-400 font-bold tracking-widest animate-pulse z-50">AUTHENTICATING SESSION...</div>;

  return (
    <div className="w-full flex h-[calc(100vh-64px)] overflow-hidden bg-slate-900 mt-16 absolute top-0 left-0">
      
      {/* -------------------- SIDEBAR MENU -------------------- */}
      <div className="w-64 glass border-r border-slate-700/50 flex flex-col items-start pt-8 pb-4 h-full bg-slate-900/90 z-40 backdrop-blur-xl transition-all shrink-0 overflow-y-auto">
          <div className="px-6 mb-6 w-full text-slate-400 text-xs font-bold uppercase tracking-wider">{role === 'admin' ? 'Admin Panel' : 'User Dashboard'}</div>
          
          {role === 'admin' ? (
              <>
                <button onClick={() => setActiveTab('reports')} className={`w-full text-left px-6 py-4 flex items-center gap-3 transition-all font-medium ${activeTab === 'reports' ? 'bg-blue-600/20 text-blue-400 border-r-4 border-blue-400' : 'text-slate-300 hover:bg-slate-800'}`}>
                    <LayoutDashboard className="w-5 h-5"/> View Reports
                </button>
                <button onClick={() => { setActiveTab('manage_flights'); setShowAddForm(false); setEditFlightId(null); setFormData({ flightNumber: '', airline: '', source: '', destination: '', departureTime: '', arrivalTime: '', totalSeats: '', price: '', status: 'Scheduled' }); }} className={`w-full text-left px-6 py-4 flex items-center gap-3 transition-all font-medium ${activeTab === 'manage_flights' ? 'bg-blue-600/20 text-blue-400 border-r-4 border-blue-400' : 'text-slate-300 hover:bg-slate-800'}`}>
                    <Plane className="w-5 h-5"/> Manage Flights
                </button>
                <button onClick={() => setActiveTab('manage_reservations')} className={`w-full text-left px-6 py-4 flex items-center gap-3 transition-all font-medium ${activeTab === 'manage_reservations' ? 'bg-blue-600/20 text-blue-400 border-r-4 border-blue-400' : 'text-slate-300 hover:bg-slate-800'}`}>
                    <CalendarDays className="w-5 h-5"/> Manage Reservations
                </button>
                <button onClick={() => setActiveTab('manage_users')} className={`w-full text-left px-6 py-4 flex items-center gap-3 transition-all font-medium ${activeTab === 'manage_users' ? 'bg-blue-600/20 text-blue-400 border-r-4 border-blue-400' : 'text-slate-300 hover:bg-slate-800'}`}>
                    <Users className="w-5 h-5"/> Manage Users
                </button>
                <button onClick={() => setActiveTab('backup_restore')} className={`w-full text-left px-6 py-4 flex items-center gap-3 transition-all font-medium ${activeTab === 'backup_restore' ? 'bg-blue-600/20 text-blue-400 border-r-4 border-blue-400' : 'text-slate-300 hover:bg-slate-800'}`}>
                    <Settings className="w-5 h-5"/> Backup & Restore
                </button>
              </>
          ) : (
              <>
                <button onClick={() => setActiveTab('search_flights')} className={`w-full text-left px-6 py-4 flex items-center gap-3 transition-all font-medium ${activeTab === 'search_flights' ? 'bg-blue-600/20 text-blue-400 border-r-4 border-blue-400' : 'text-slate-300 hover:bg-slate-800'}`}>
                    <Search className="w-5 h-5"/> Search Flights
                </button>
                <button onClick={() => setActiveTab('my_bookings')} className={`w-full text-left px-6 py-4 flex items-center gap-3 transition-all font-medium ${activeTab === 'my_bookings' ? 'bg-blue-600/20 text-blue-400 border-r-4 border-blue-400' : 'text-slate-300 hover:bg-slate-800'}`}>
                    <CalendarDays className="w-5 h-5"/> Booking History
                </button>
                <button onClick={() => setActiveTab('profile')} className={`w-full text-left px-6 py-4 flex items-center gap-3 transition-all font-medium ${activeTab === 'profile' ? 'bg-blue-600/20 text-blue-400 border-r-4 border-blue-400' : 'text-slate-300 hover:bg-slate-800'}`}>
                    <UserIcon className="w-5 h-5"/> Profile
                </button>
              </>
          )}
      </div>

      {/* -------------------- MAIN CONTENT AREA -------------------- */}
      <div className="flex-1 h-full overflow-y-auto p-4 md:p-8 relative">
        {seatViewFlight && (
            <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex justify-center items-center p-4">
                <div className="glass p-6 rounded-3xl max-w-lg w-full bg-slate-800 border-2 border-slate-700 relative shadow-2xl animate-in fade-in zoom-in duration-300">
                    <button onClick={() => setSeatViewFlight(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors w-8 h-8 flex items-center justify-center bg-slate-700/50 rounded-full hover:bg-slate-700">&times;</button>
                    <h3 className="text-xl font-black text-white text-center mb-6 uppercase tracking-widest border-b border-slate-700 pb-4">Live Seat Analytics</h3>
                    <div className="flex gap-4 justify-center mb-6 text-xs font-bold uppercase tracking-wider">
                        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-sm bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" /> <span className="text-emerald-300">Available</span></div>
                        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-sm bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" /> <span className="text-red-300">Booked</span></div>
                    </div>
                    
                    <div className="max-h-[60vh] overflow-y-auto custom-scrollbar flex flex-col items-center gap-2.5 pb-4 px-2">
                        {Array.from({ length: Math.ceil((flightSeatsData.totalSeats || 60) / 6) }, (_, i) => i + 1).map(row => (
                            <div key={row} className="flex gap-3 md:gap-5 items-center w-full justify-center">
                                <div className="flex gap-1.5">
                                    {['A', 'B', 'C'].map(col => {
                                        const seatId = `${row}${col}`;
                                        const isBooked = flightSeatsData.bookedSeats.includes(seatId);
                                        return <div key={seatId} className={`w-8 h-8 md:w-10 md:h-10 rounded-t-lg rounded-b flex items-center justify-center text-[10px] md:text-xs font-black transition-all ${isBooked ? 'bg-red-500/80 border border-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400'}`}>{seatId}</div>
                                    })}
                                </div>
                                <div className="w-6 h-6 flex items-center justify-center font-bold text-slate-500 text-[10px] bg-slate-900/50 rounded">{row}</div>
                                <div className="flex gap-1.5">
                                    {['D', 'E', 'F'].map(col => {
                                        const seatId = `${row}${col}`;
                                        const isBooked = flightSeatsData.bookedSeats.includes(seatId);
                                        return <div key={seatId} className={`w-8 h-8 md:w-10 md:h-10 rounded-t-lg rounded-b flex items-center justify-center text-[10px] md:text-xs font-black transition-all ${isBooked ? 'bg-red-500/80 border border-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400'}`}>{seatId}</div>
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-700 w-full text-center">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Tail Section</p>
                    </div>
                </div>
            </div>
        )}
        {/* Toast Notification */}
        {msg.text && (
            <motion.div initial={{ opacity:0, y:-50 }} animate={{ opacity:1, y:0 }} className={`fixed top-4 right-8 px-6 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-3 backdrop-blur-md border ${msg.type==='error'?'bg-red-500/20 border-red-500/50 text-red-200':'bg-emerald-500/20 border-emerald-500/50 text-emerald-200'}`}>
                {msg.type === 'error' ? <AlertCircle className="w-5 h-5"/> : <CheckCircle className="w-5 h-5"/>}
                {msg.text}
            </motion.div>
        )}

        {loading && <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-30 flex items-center justify-center text-blue-400 font-bold tracking-widest animate-pulse">LOADING...</div>}

        {/* -------------------- ADMIN VIEWS -------------------- */}
        {role === 'admin' ? (
            <>
              {activeTab === 'reports' && (
                <div className="animate-in fade-in zoom-in-95 duration-300 max-w-6xl mx-auto">
                  <h2 className="text-3xl font-extrabold mb-8 text-white flex items-center gap-3"><Activity className="text-blue-400 w-8 h-8"/> System Reports</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="glass p-6 rounded-2xl border border-blue-500/30 shadow-xl relative overflow-hidden bg-slate-800/40">
                          <Plane className="absolute top-[-10%] right-[-10%] w-32 h-32 opacity-5 text-blue-400"/>
                          <h3 className="text-sm font-semibold text-blue-300 uppercase tracking-wider">Total Flights</h3>
                          <p className="text-5xl font-black mt-3 text-white">{data?.totalFlights || 0}</p>
                      </div>
                      <div className="glass p-6 rounded-2xl border border-purple-500/30 shadow-xl relative overflow-hidden bg-slate-800/40">
                          <Users className="absolute top-[-10%] right-[-10%] w-32 h-32 opacity-5 text-purple-400"/>
                          <h3 className="text-sm font-semibold text-purple-300 uppercase tracking-wider">Total Users</h3>
                          <p className="text-5xl font-black mt-3 text-white">{data?.usersCount || 0}</p>
                      </div>
                      <div className="glass p-6 rounded-2xl border border-emerald-500/30 shadow-xl relative overflow-hidden bg-slate-800/40">
                          <Package className="absolute top-[-10%] right-[-10%] w-32 h-32 opacity-5 text-emerald-400"/>
                          <h3 className="text-sm font-semibold text-emerald-300 uppercase tracking-wider">Total Bookings</h3>
                          <p className="text-5xl font-black mt-3 text-white">{data?.totalBookings || 0}</p>
                      </div>
                      <div className="glass p-6 rounded-2xl border border-indigo-500/30 shadow-xl relative overflow-hidden bg-slate-800/40">
                          <DollarSign className="absolute top-[-10%] right-[-10%] w-32 h-32 opacity-5 text-indigo-400"/>
                          <h3 className="text-sm font-semibold text-indigo-300 uppercase tracking-wider">Revenue</h3>
                          <p className="text-4xl font-black mt-3 text-white">₹{(data?.revenue || 0).toLocaleString('en-IN')}</p>
                      </div>
                  </div>
                </div>
              )}

              {activeTab === 'manage_flights' && (
                <div className="animate-in fade-in duration-300 space-y-6 max-w-6xl mx-auto pb-10">
                   <div className="flex justify-between items-center bg-slate-800/50 p-6 rounded-2xl border border-slate-700 shadow-sm">
                      <h2 className="text-2xl font-bold flex items-center gap-3"><Plane className="text-blue-400 w-6 h-6"/> Manage Flights</h2>
                      <button onClick={() => { setShowAddForm(!showAddForm); if(showAddForm){ setEditFlightId(null); setFormData({ flightNumber: '', airline: '', source: '', destination: '', departureTime: '', arrivalTime: '', totalSeats: '', price: '', status: 'Scheduled' });} }} className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold flex gap-2 items-center transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                          <PlusCircle className="w-4 h-4"/> {showAddForm ? 'Cancel Form' : 'Add New Flight'}
                      </button>
                   </div>
                   
                   {showAddForm && (
                      <div className="glass p-8 rounded-2xl border border-blue-500/30 shadow-xl bg-slate-800/80 backdrop-blur-md">
                          <h3 className="text-xl font-bold mb-6 text-blue-300">{editFlightId ? 'Edit Flight Details' : 'Create New Flight'}</h3>
                          <form onSubmit={handleSaveFlight} className="grid grid-cols-1 md:grid-cols-4 gap-5">
                              <div className="flex flex-col space-y-1">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Flight No</label>
                                <input type="text" placeholder="e.g. AA101" required value={formData.flightNumber} onChange={(e) => setFormData({...formData, flightNumber: e.target.value})} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none" />
                              </div>
                              <div className="flex flex-col space-y-1">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Airline</label>
                                <input type="text" placeholder="e.g. AeroServe" required value={formData.airline} onChange={(e) => setFormData({...formData, airline: e.target.value})} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none" />
                              </div>
                              <div className="flex flex-col space-y-1">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Source</label>
                                <input type="text" placeholder="City" required value={formData.source} onChange={(e) => setFormData({...formData, source: e.target.value})} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none" />
                              </div>
                              <div className="flex flex-col space-y-1">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Destination</label>
                                <input type="text" placeholder="City" required value={formData.destination} onChange={(e) => setFormData({...formData, destination: e.target.value})} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none" />
                              </div>

                              <div className="flex flex-col space-y-1 md:col-span-2 lg:col-span-1">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Departure Time</label>
                                <input type="datetime-local" required value={formData.departureTime} onChange={(e) => setFormData({...formData, departureTime: e.target.value})} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none" />
                              </div>
                              <div className="flex flex-col space-y-1 md:col-span-2 lg:col-span-1">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Arrival Time</label>
                                <input type="datetime-local" required value={formData.arrivalTime} onChange={(e) => setFormData({...formData, arrivalTime: e.target.value})} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none" />
                              </div>

                              <div className="flex flex-col space-y-1">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Seats</label>
                                <input type="number" required placeholder="Seats" min="1" value={formData.totalSeats} onChange={(e) => setFormData({...formData, totalSeats: e.target.value})} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none" />
                              </div>
                              <div className="flex flex-col space-y-1">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Price (₹)</label>
                                <input type="number" required placeholder="Price" min="0" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none" />
                              </div>

                              {editFlightId && (
                                <div className="flex flex-col space-y-1 md:col-span-4 lg:col-span-2">
                                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Flight Status</label>
                                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none w-full">
                                      <option value="Scheduled">Scheduled</option>
                                      <option value="Delayed">Delayed</option>
                                      <option value="Cancelled">Cancelled</option>
                                      <option value="Completed">Completed</option>
                                  </select>
                                </div>
                              )}

                              <div className={`md:col-span-4 flex justify-end items-end pt-2`}>
                                <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                                    {editFlightId ? 'Save Edits' : 'Save Flight To DB'}
                                </button>
                              </div>
                          </form>
                      </div>
                   )}

                   <div className="overflow-x-auto glass rounded-2xl border border-slate-700/50 shadow-xl bg-slate-800/40">
                       <table className="w-full text-left text-sm text-slate-300">
                           <thead className="text-xs text-slate-400 uppercase bg-slate-900/80 border-b border-slate-700">
                               <tr>
                                   <th className="px-6 py-4">Flight</th>
                                   <th className="px-6 py-4">Route</th>
                                   <th className="px-6 py-4">Schedule</th>
                                   <th className="px-6 py-4">Status & Price</th>
                                   <th className="px-6 py-4 border-l border-slate-700">Actions</th>
                               </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-700/50">
                               {flights.slice(0, 100).map(flight => (
                                   <tr key={flight._id} className="hover:bg-slate-700/40 transition-colors">
                                      <td className="px-6 py-4 font-bold text-white text-base">{flight.flightNumber} <br/><span className="text-xs text-blue-300 font-medium">{flight.airline}</span></td>
                                      <td className="px-6 py-4 font-medium">{flight.source} &rarr; {flight.destination}</td>
                                      <td className="px-6 py-4 text-xs space-y-1">
                                          <div className="bg-slate-900 px-2 py-1 rounded inline-block text-slate-300"><span className="text-slate-500 mr-1">Dep:</span>{new Date(flight.departureTime).toLocaleString()}</div><br/>
                                          <div className="bg-slate-900 px-2 py-1 rounded inline-block text-slate-300"><span className="text-slate-500 mr-1">Arr:</span>{new Date(flight.arrivalTime).toLocaleString()}</div>
                                      </td>
                                      <td className="px-6 py-4">
                                          <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${flight.status==='Scheduled'?'bg-emerald-500/10 text-emerald-400':flight.status==='Cancelled'?'bg-red-500/10 text-red-400':flight.status==='Delayed'?'bg-yellow-500/10 text-yellow-400':'bg-slate-500/20 text-slate-300'}`}>{flight.status}</span>
                                          <div className="text-sm mt-2 text-white font-mono font-bold">₹{flight.price.toLocaleString('en-IN')}</div>
                                      </td>
                                      <td className="px-6 py-4 border-l border-slate-700">
                                          <div className="flex gap-3">
                                            <button onClick={() => openSeatView(flight._id)} title="View Live Seats" className="p-2.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-lg transition-colors"><Plane className="w-4 h-4"/></button>
                                            <button onClick={() => handleEditFlightClick(flight)} title="Edit Flight" className="p-2.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg transition-colors"><Edit className="w-4 h-4"/></button>
                                            <button onClick={() => handleDeleteFlight(flight._id)} title="Delete Flight" className="p-2.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors"><Trash2 className="w-4 h-4"/></button>
                                          </div>
                                      </td>
                                   </tr>
                               ))}
                           </tbody>
                       </table>
                   </div>
                </div>
              )}

              {activeTab === 'manage_users' && (
                <div className="animate-in fade-in duration-300 space-y-6 max-w-6xl mx-auto pb-10">
                   <h2 className="text-3xl font-bold flex items-center gap-3 mb-8"><Users className="text-purple-400 w-8 h-8"/> Manage Users</h2>
                   <div className="overflow-x-auto glass rounded-2xl border border-slate-700/50 shadow-xl bg-slate-800/40">
                       <table className="w-full text-left text-sm text-slate-300">
                           <thead className="text-xs text-slate-400 uppercase bg-slate-900/80 border-b border-slate-700">
                               <tr>
                                   <th className="px-6 py-4">Full Name</th>
                                   <th className="px-6 py-4">Email Address</th>
                                   <th className="px-6 py-4">System Role</th>
                                   <th className="px-6 py-4 border-l border-slate-700">Controls</th>
                               </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-700/50">
                               {users.map(user => (
                                   <tr key={user._id} className="hover:bg-slate-700/40 transition-colors">
                                      {editUserId === user._id ? (
                                          <td colSpan="4" className="px-6 py-4 backdrop-blur-3xl bg-slate-800/80">
                                              <form onSubmit={(e) => handleUpdateUser(e, user._id)} className="flex gap-4 items-center">
                                                  <input required className="bg-slate-900 border border-slate-600 p-2.5 rounded-lg flex-1 outline-none text-white focus:border-blue-500" value={userEditData.firstName} onChange={e=>setUserEditData({...userEditData, firstName: e.target.value})} placeholder="Name"/>
                                                  <input required type="email" className="bg-slate-900 border border-slate-600 p-2.5 rounded-lg flex-1 outline-none text-white focus:border-blue-500" value={userEditData.email} onChange={e=>setUserEditData({...userEditData, email: e.target.value})} placeholder="Email"/>
                                                  <select className="bg-slate-900 border border-slate-600 p-2.5 rounded-lg outline-none text-white focus:border-blue-500" value={userEditData.role} onChange={e=>setUserEditData({...userEditData, role: e.target.value})}>
                                                      <option value="passenger">Passenger</option>
                                                      <option value="agent">Agent</option>
                                                      <option value="admin">Admin</option>
                                                  </select>
                                                  <div className="flex gap-2">
                                                    <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-lg shadow-lg">Save</button>
                                                    <button type="button" onClick={() => setEditUserId(null)} className="bg-slate-600 hover:bg-slate-500 text-white font-bold px-5 py-2.5 rounded-lg">Cancel</button>
                                                  </div>
                                              </form>
                                          </td>
                                      ) : (
                                          <>
                                              <td className="px-6 py-4 font-bold text-white text-base">{user.name || `${user.firstName||''} ${user.lastName||''}`}</td>
                                              <td className="px-6 py-4 text-slate-300 font-medium">{user.email}</td>
                                              <td className="px-6 py-4">
                                                  <span className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase ${user.role==='admin'?'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-slate-700/50 text-slate-300 border border-slate-600'}`}>{user.role}</span>
                                              </td>
                                              <td className="px-6 py-4 flex gap-3 border-l border-slate-700">
                                                  <button onClick={() => { setEditUserId(user._id); setUserEditData({firstName: user.name, email: user.email, role: user.role}); }} className="p-2.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg transition-colors"><Edit className="w-4 h-4"/></button>
                                                  <button onClick={() => handleDeleteUser(user._id)} className="p-2.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors"><Trash2 className="w-4 h-4"/></button>
                                              </td>
                                          </>
                                      )}
                                   </tr>
                               ))}
                           </tbody>
                       </table>
                   </div>
                </div>
              )}

              {activeTab === 'manage_reservations' && (
                <div className="animate-in fade-in duration-300 space-y-6 max-w-6xl mx-auto pb-10">
                   <h2 className="text-3xl font-bold flex items-center gap-3 mb-8"><CalendarDays className="text-emerald-400 w-8 h-8"/> Detailed Booking Ledger</h2>
                   <div className="overflow-x-auto glass rounded-2xl border border-slate-700/50 shadow-xl bg-slate-800/40">
                       <table className="w-full text-left text-sm text-slate-300">
                           <thead className="text-xs text-slate-400 uppercase bg-slate-900/80 border-b border-slate-700">
                               <tr>
                                   <th className="px-6 py-4">Date & Ref ID</th>
                                   <th className="px-6 py-4">Customer Details</th>
                                   <th className="px-6 py-4">Flight Info & Seats</th>
                                   <th className="px-6 py-4 border-l border-slate-700">Revenue & Status</th>
                               </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-700/50">
                               {reservations.map(res => (
                                   <tr key={res._id} className="hover:bg-slate-700/40 transition-colors">
                                      <td className="px-6 py-4 font-mono text-xs font-bold text-slate-400">
                                        <div className="text-emerald-300 mb-1">{new Date(res.bookingDate || res.createdAt).toLocaleString()}</div>
                                        {res._id}
                                      </td>
                                      <td className="px-6 py-4">
                                        <div className="font-bold text-white text-base">{res.userId ? (res.userId.name || `${res.userId.firstName} ${res.userId.lastName}`) : '<Deleted User>'}</div>
                                        <div className="text-xs text-slate-400 mt-1">{res.userId?.email}</div>
                                      </td>
                                      <td className="px-6 py-4 font-medium">
                                        <div className="text-blue-300 mb-1">{res.flightId?.flightNumber || 'Unknown Flight'}</div>
                                        <div className="text-white bg-slate-900 px-2 py-1 rounded inline-block text-xs border border-slate-700 mb-2">{res.flightId?.source} &rarr; {res.flightId?.destination}</div>
                                        {res.passengers && res.passengers.length > 0 && (
                                            <div className="text-xs text-emerald-400 mt-1 font-mono bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 shadow-inner w-max">
                                                SEATS: {res.passengers.map(p => p.seatNumber || 'Unassigned').join(', ')}
                                            </div>
                                        )}
                                      </td>
                                      <td className="px-6 py-4 border-l border-slate-700">
                                          <div className="text-2xl font-black font-mono text-white mb-2">₹{res.totalAmount.toLocaleString('en-IN')}</div>
                                          <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase ${res.status==='Confirmed'?'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20':'bg-red-500/10 text-red-400 border border-red-500/20'}`}>{res.status}</span>
                                          {res.status === 'Confirmed' && (
                                              <button onClick={() => handleAdminCancel(res._id)} className="block mt-3 px-3 py-1.5 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-md text-xs font-bold transition-all border border-red-500/30 w-max">
                                                  Cancel Booking
                                              </button>
                                          )}
                                      </td>
                                   </tr>
                               ))}
                           </tbody>
                       </table>
                   </div>
                </div>
              )}

              {activeTab === 'backup_restore' && (
                <div className="animate-in fade-in duration-300 space-y-6 max-w-4xl mx-auto pt-10 pb-10">
                   <h2 className="text-3xl font-extrabold flex items-center justify-center gap-3 mb-10"><Settings className="text-slate-400 w-8 h-8"/> Central Database Management</h2>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="glass p-10 rounded-3xl border border-slate-700 shadow-2xl flex flex-col items-center text-center bg-slate-800/50 hover:bg-slate-800 transition-colors">
                           <div className="w-20 h-20 bg-blue-500/20 border border-blue-500/50 rounded-full flex items-center justify-center mb-6"><Download className="w-10 h-10 text-blue-400"/></div>
                           <h3 className="text-2xl font-black mb-3 text-white">Export Database</h3>
                           <button onClick={handleBackup} className="w-full mt-6 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-wider rounded-xl transition-all shadow-lg hover:shadow-blue-500/40">Generate JSON Dump</button>
                       </div>
                       <div className="glass p-10 rounded-3xl border border-slate-700 shadow-2xl flex flex-col items-center text-center relative overflow-hidden bg-slate-800/50 hover:bg-slate-800 transition-colors">
                           <input type="file" accept=".json" onChange={handleRestore} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                           <div className="w-20 h-20 bg-emerald-500/20 border border-emerald-500/50 rounded-full flex items-center justify-center mb-6"><Upload className="w-10 h-10 text-emerald-400"/></div>
                           <h3 className="text-2xl font-black mb-3 text-white">Restore Database</h3>
                           <button className="w-full mt-6 py-4 bg-slate-700 border border-slate-500 hover:bg-slate-600 text-white font-black uppercase tracking-wider rounded-xl transition-all pointer-events-none relative z-0">Click to Select File</button>
                       </div>
                   </div>
                </div>
              )}
            </>
        ) : (
            /* -------------------- USER VIEWS -------------------- */
            <div className="max-w-6xl mx-auto pt-4 pb-12">
               
               {activeTab === 'profile' && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h1 className="text-4xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300 drop-shadow-md">My Profile</h1>
                    <div className="glass p-10 rounded-3xl shadow-2xl border border-slate-700/50 bg-slate-800/40 max-w-2xl flex flex-col items-center text-center">
                        <div className="w-32 h-32 bg-indigo-500/20 rounded-full flex items-center justify-center mb-6 shadow-inner border border-indigo-500/30">
                            <UserIcon className="w-16 h-16 text-indigo-400"/>
                        </div>
                        <h2 className="text-3xl font-black text-white">{userName}</h2>
                        <span className="mt-2 px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30">{role} Account</span>
                        <div className="mt-8 w-full bg-slate-900/50 p-6 rounded-2xl border border-slate-700 text-left">
                            <p className="text-slate-400 text-sm mb-1 uppercase font-bold tracking-widest">Email Address</p>
                            <p className="text-xl text-white font-medium">{userEmail || 'registered@user.com'}</p>
                        </div>
                    </div>
                  </div>
               )}

               {activeTab === 'search_flights' && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <h1 className="text-4xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300 drop-shadow-md">Find Your Next Adventure</h1>
                      
                      <form onSubmit={handleSearchFlights} className="glass p-8 rounded-3xl shadow-2xl flex flex-col md:flex-row gap-5 items-end mb-12 bg-slate-800/60 backdrop-blur-xl border border-slate-700/50">
                        <div className="flex-1 w-full flex flex-col space-y-2">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2"><MapPin className="w-4 h-4 text-blue-400"/> Origin</label>
                          <input type="text" placeholder="Departure City" required className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-white focus:border-blue-500 outline-none transition-all" value={searchData.source} onChange={(e)=>setSearchData({...searchData, source: e.target.value})} />
                        </div>
                        <div className="flex-1 w-full flex flex-col space-y-2">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2"><MapPin className="w-4 h-4 text-indigo-400"/> Destination</label>
                          <input type="text" placeholder="Arrival City" required className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-white focus:border-indigo-500 outline-none transition-all" value={searchData.destination} onChange={(e)=>setSearchData({...searchData, destination: e.target.value})} />
                        </div>
                        <div className="flex-1 w-full flex flex-col space-y-2">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2"><CalendarDays className="w-4 h-4 text-emerald-400"/> Departure Date</label>
                          <input type="date" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-white focus:border-emerald-500 outline-none transition-all" value={searchData.date} onChange={(e)=>setSearchData({...searchData, date: e.target.value})} />
                        </div>
                        <button type="submit" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black uppercase tracking-wider py-4 px-10 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all flex items-center gap-2 w-full md:w-auto h-full">
                          <Search className="w-5 h-5"/> Search
                        </button>
                      </form>

                      {availableFlights.length > 0 ? (
                          <div className="flex flex-col gap-6">
                              <h2 className="text-xl font-bold text-white mb-2 pb-2 border-b border-slate-700/50">Available Flights Found ({availableFlights.length})</h2>
                              {availableFlights.map(flight => (
                                  <div key={flight._id} className="glass p-6 md:p-8 rounded-3xl flex flex-col md:flex-row justify-between md:items-center gap-6 border border-slate-700/50 bg-slate-800/40 hover:bg-slate-800/70 transition-all shadow-lg">
                                     <div className="flex flex-col md:flex-row items-center gap-8">
                                        <div className="text-center w-24">
                                            <p className="text-3xl font-black text-blue-300 tracking-tight">{new Date(flight.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">{flight.source}</p>
                                        </div>
                                        <div className="flex flex-col items-center px-4">
                                            <p className="text-xs text-slate-500 font-bold tracking-wider mb-2">FLIGHT {flight.flightNumber}</p>
                                            <div className="w-32 h-px bg-slate-600 relative">
                                                <Plane className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400 rotate-90" />
                                            </div>
                                            <p className="text-xs text-slate-500 font-bold tracking-wider mt-2">{flight.airline}</p>
                                        </div>
                                        <div className="text-center w-24">
                                            <p className="text-3xl font-black text-indigo-300 tracking-tight">{new Date(flight.arrivalTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">{flight.destination}</p>
                                        </div>
                                     </div>
                                     <div className="flex items-center justify-between md:flex-col md:items-end md:justify-center border-t md:border-t-0 md:border-l border-slate-700 pt-6 md:pt-0 pl-0 md:pl-8 gap-4">
                                         <p className="text-4xl font-black text-white font-mono">₹{flight.price.toLocaleString('en-IN')}</p>
                                         <button onClick={() => navigate(`/book/${flight._id}`)} className="bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-wider py-3 px-8 rounded-xl flex items-center gap-3 transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                                            <Pointer className="w-5 h-5"/> Select Flight
                                         </button>
                                     </div>
                                  </div>
                              ))}
                          </div>
                      ) : (
                          hasSearched && (
                              <div className="glass p-12 text-center rounded-3xl border border-slate-700/50 bg-slate-800/40">
                                  <Plane className="w-16 h-16 mx-auto text-slate-600 mb-4 opacity-50" />
                                  <h3 className="text-2xl font-bold text-white mb-2">No flights found</h3>
                                  <p className="text-slate-400">Please try adjusting your search criteria or dates.</p>
                              </div>
                          )
                      )}
                  </div>
               )}

               {activeTab === 'my_bookings' && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h1 className="text-4xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-300 drop-shadow-md">My Booking History</h1>
                    <div className="flex flex-col gap-6">
                      {data?.length === 0 ? (
                         <div className="flex justify-center items-center py-24 glass rounded-3xl bg-slate-800/50 border border-slate-700/50">
                           <div className="text-center">
                             <History className="w-16 h-16 mx-auto text-slate-600 mb-6"/>
                             <h3 className="text-2xl font-bold text-white mb-2">No Bookings Yet</h3>
                             <p className="text-slate-400 mb-6">You haven't booked any flights. Time for an adventure.</p>
                             <button onClick={() => setActiveTab('search_flights')} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-xl transition-all">Start Searching</button>
                           </div>
                         </div>
                      ) : (
                         data?.map((reservation) => (
                            <div key={reservation._id} className="glass p-8 rounded-3xl flex flex-col md:flex-row justify-between md:items-center gap-6 border border-slate-700/50 bg-slate-800/40 hover:bg-slate-800/70 transition-all shadow-xl">
                               <div className="flex-1">
                                 <div className="flex items-center gap-3 mb-2">
                                    <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${reservation.status === 'Confirmed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>{reservation.status}</span>
                                    <span className="text-slate-500 text-sm font-mono font-bold">Ref: {reservation._id}</span>
                                 </div>
                                 <p className="font-extrabold text-3xl text-white tracking-tight">{reservation.flightId?.source}</p>
                                 <p className="text-slate-500 font-bold text-lg my-1">&darr;</p>
                                 <p className="font-extrabold text-3xl text-blue-200 tracking-tight">{reservation.flightId?.destination}</p>
                                 <p className="text-xs text-slate-400 mt-3 font-bold uppercase tracking-widest"><CalendarDays className="inline w-3 h-3 mr-1 -mt-0.5"/> {new Date(reservation.flightId?.departureTime).toLocaleDateString()}</p>
                                 <p className="text-xs text-indigo-400 mt-1 font-bold uppercase tracking-widest">Booked on: {new Date(reservation.bookingDate || reservation.createdAt).toLocaleDateString()}</p>
                               </div>
                               <div className="hidden md:block w-px h-32 bg-slate-700 mx-6"></div>
                               <div className="text-left md:text-right flex flex-col items-start md:items-end flex-shrink-0">
                                 <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Paid</p>
                                 <p className="text-5xl font-mono block font-black text-indigo-400 drop-shadow-sm">₹{reservation.totalAmount.toLocaleString('en-IN')}</p>
                                 <p className="text-slate-400 text-sm mt-3 font-medium flex items-center gap-2"><Users className="w-4 h-4"/> Passengers: <span className="text-white font-bold">{reservation.passengers?.length}</span></p>
                                 {reservation.passengers && reservation.passengers.length > 0 && (
                                     <p className="text-emerald-400 text-xs mt-2 font-mono bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 shadow-inner">
                                        SEATS: {reservation.passengers.map(p => p.seatNumber || 'Unassigned').join(', ')}
                                     </p>
                                 )}
                                 <button onClick={() => generatePDF(reservation)} className="bg-slate-700 hover:bg-slate-600 border border-slate-600 mt-5 px-6 py-3 rounded-xl flex gap-3 items-center text-sm font-black uppercase tracking-wide transition-all text-white">
                                   <Download className="w-5 h-5" /> Download Pass
                                 </button>
                               </div>
                            </div>
                         ))
                      )}
                    </div>
                  </div>
               )}
            </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
