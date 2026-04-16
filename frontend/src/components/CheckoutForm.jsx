import React, { useState } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function CheckoutForm({ bookingDetails }) {
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/success`,
      },
      redirect: "if_required"
    });

    if (error) {
       // fallback block
      setMessage(error.message);
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      try {
        const token = localStorage.getItem('token');
        // ACTUALLY SAVE THE BOOKING IN MONGODB NOW THAT PAYMENT SECURED
        const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/reservations`, {
          flightId: bookingDetails.flightId,
          passengers: bookingDetails.passengers,
          paymentMethod: bookingDetails.paymentMethod || 'Credit Card'
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Navigate to success and pass state + official MongoDB ID
        navigate('/success', {
           state: {
               passengerName: bookingDetails.passengerName,
               flightNumber: bookingDetails.flightId, 
               gate: "G-24", // Mock gate
               seat: bookingDetails.passengers[0]?.seatNumber || "12A", 
               transactionId: paymentIntent.id,
               reservationId: res.data._id
           }
        });
      } catch (err) {
         setMessage("Payment succeeded, but reservation generation failed. Please contact support.");
      }
    } else {
      setMessage("An unexpected error occurred.");
    }
    setIsLoading(false);
  };

  return (
    <form className="bg-white p-8 rounded-xl shadow-sm border border-slate-200" onSubmit={handleSubmit}>
      <h3 className="text-2xl font-bold text-slate-900 mb-6">Payment Details</h3>
      <p className="text-slate-600 mb-6 font-medium">Total Amount: <span className="font-bold text-blue-600">${bookingDetails.amount}</span></p>
      
      <PaymentElement id="payment-element" />
      
      <button 
        disabled={isLoading || !stripe || !elements} 
        id="submit"
        className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span id="button-text">
          {isLoading ? "Processing..." : "Pay Now"}
        </span>
      </button>

      {message && <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-md text-sm font-medium border border-red-100">{message}</div>}
    </form>
  );
}
