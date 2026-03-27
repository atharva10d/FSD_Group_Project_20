import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Booking from './pages/Booking';

function App() {
  return (
    <Router>
      <div className="relative min-h-screen text-slate-100 font-sans bg-slate-900">
        
        {/* Main Content */}
        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow flex flex-col w-full">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Login isRegisterMode={true} />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/book/:flightId" element={<Booking />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
