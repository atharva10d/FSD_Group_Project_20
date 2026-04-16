import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "../components/CheckoutForm";
import { useLocation } from "react-router-dom";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder");

export default function PaymentPage() {
  const [clientSecret, setClientSecret] = useState("");
  const location = useLocation();
  const token = localStorage.getItem('token');
  
  // Safe extraction of potential booking data from the router state
  const bookingDetails = location.state || {
    amount: 299,
    flightId: "FL-808",
    passengerName: "John Doe"
  };

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/payment/create-payment-intent`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      },
      body: JSON.stringify(bookingDetails),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          console.error("Payment Intent failed:", data.error);
        }
      })
      .catch(err => console.error("Network error creating payment intent", err));
  }, []);

  const appearance = {
    theme: 'stripe',
    variables: {
      colorPrimary: '#0284C7',
      colorBackground: '#ffffff',
      colorText: '#0F172A',
    },
  };

  const options = {
    clientSecret,
    appearance,
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-8 pt-24">
      <div className="max-w-5xl w-full flex flex-col md:flex-row gap-8">
        
        {/* Left Column: Order Summary */}
        <div className="w-full md:w-1/3 order-2 md:order-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 sticky top-24 transition-all hover:shadow-md">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Flight Number</p>
                <p className="text-lg font-semibold text-blue-600">{bookingDetails.flightId}</p>
              </div>
              
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Primary Passenger</p>
                <p className="text-md font-medium text-slate-900">{bookingDetails.passengerName}</p>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Seats Reserving</p>
                <p className="text-md font-medium text-slate-900">{bookingDetails.passengers ? bookingDetails.passengers.length : 1} Seat(s)</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 mb-6">
              <div className="flex justify-between items-center text-lg font-bold text-slate-900">
                <span>Total Due</span>
                <span className="text-2xl text-emerald-600">${bookingDetails.amount}</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">Taxes & fees included. Secure 256-bit Stripe encryption.</p>
            </div>
            
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
               <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
               100% SECURE CHECKOUT
            </div>
          </div>
        </div>

        {/* Right Column: Stripe Form */}
        <div className="w-full md:w-2/3 order-1 md:order-2">
          {clientSecret ? (
            <Elements options={options} stripe={stripePromise}>
              <CheckoutForm bookingDetails={bookingDetails} />
            </Elements>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 h-64 flex flex-col items-center justify-center animate-pulse">
               <div className="w-12 h-12 border-4 border-sky-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
               <p className="text-slate-500 font-medium">Securely loading Stripe gateway...</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
