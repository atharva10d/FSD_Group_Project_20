import React from 'react';
import { useLocation, Link } from 'react-router-dom';

export default function SuccessPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const paymentIntentId = searchParams.get("payment_intent") || "pi_3TEST_STRIPE_xZ2p";

  const ticketData = location.state || {
    passengerName: "John Doe",
    flightNumber: "AERO-707",
    gate: "G-24",
    seat: "12A",
    transactionId: paymentIntentId
  };

  return (
    <div className="min-h-screen bg-cloudWhite flex flex-col items-center justify-center p-6">
      
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 p-4 shadow-sm">
          <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-deepNavy">Your Flight is Confirmed!</h1>
        <p className="text-slate-500 mt-2">Have a safe and wonderful journey.</p>
      </div>

      <div className="max-w-3xl w-full bg-white rounded-xl shadow-premium border border-slate-200 overflow-hidden flex flex-col md:flex-row relative">
        <div className="flex-1 p-8 md:p-10">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h2 className="text-2xl font-bold text-deepNavy mb-1">Boarding Pass</h2>
              <p className="text-slate-500 uppercase tracking-widest text-xs font-semibold">First Class</p>
            </div>
            <div className="px-4 py-1.5 bg-aviationBlue text-white font-semibold rounded-full text-xs shadow-sm uppercase tracking-wide">
              Confirmed
            </div>
          </div>

          <div className="grid grid-cols-2 gap-y-8 gap-x-6">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Passenger Name</p>
              <p className="text-lg font-semibold text-deepNavy truncate">{ticketData.passengerName}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Flight Number</p>
              <p className="text-lg font-semibold text-deepNavy text-aviationBlue">{ticketData.flightNumber}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Gate</p>
              <p className="text-4xl font-light text-slate-800">{ticketData.gate}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Seat</p>
              <p className="text-4xl font-bold text-aviationBlue">{ticketData.seat}</p>
            </div>
          </div>
        </div>

        <div className="flex-none w-full md:w-64 bg-slate-50 flex flex-col items-center justify-center p-8 border-t md:border-t-0 md:border-l border-dashed border-slate-300 relative">
          <div className="hidden md:block w-8 h-8 rounded-full bg-[#F8FAFC] absolute -left-4 -top-4 shadow-inner border border-b-0 border-slate-200"></div>
          <div className="hidden md:block w-8 h-8 rounded-full bg-[#F8FAFC] absolute -left-4 -bottom-4 shadow-inner border border-t-0 border-slate-200"></div>

          <img 
            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${ticketData.flightNumber}-${ticketData.transactionId}`} 
            alt="Boarding QR Code" 
            className="w-32 h-32 mb-6 rounded-md shadow-sm border p-1 bg-white border-slate-200 object-contain"
          />
          
          <div className="border-2 border-emerald-500 text-emerald-600 px-3 py-1 font-bold text-xs tracking-widest uppercase rounded transform -rotate-6 shadow-sm bg-white bg-opacity-80 backdrop-blur-sm">
            PAID via Stripe
          </div>
          <p className="text-[10px] text-slate-400 mt-4 font-mono text-center truncate max-w-[200px]" title={ticketData.transactionId}>
            TxN: {ticketData.transactionId}
          </p>
        </div>
      </div>

      <div className="mt-8 flex items-center gap-6 print:hidden">
        <button 
          onClick={() => window.print()} 
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
          Download PDF Pass
        </button>
        <Link to="/" className="text-aviationBlue hover:text-sky-700 font-semibold transition-colors duration-200 flex items-center">
          Return to Dashboard &rarr;
        </Link>
      </div>
    </div>
  );
}
