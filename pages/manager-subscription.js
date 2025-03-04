// ManagerSubscription.js
import { useRouter } from "next/router";
import { loadStripe } from "@stripe/stripe-js";
import { useState, useEffect } from "react";
import ManagerNavbar from "../components/ManagerNavbar";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function ManagerSubscription() {
  const router = useRouter();
  const { id } = router.query;
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const subscriptionStatus = localStorage.getItem(`subscribed_${id}`);
      setIsSubscribed(subscriptionStatus === "true");
    }
  }, [id]);

  const handleSubscribe = async () => {
    if (!isSubscribed) {
      const stripe = await stripePromise;
      const response = await fetch(`/api/create-checkout-session`, {
        method: "POST",
        body: JSON.stringify({ id }),
        headers: { "Content-Type": "application/json" },
      });

      const session = await response.json();

      // Redirect to Stripe Checkout
      const { error } = await stripe.redirectToCheckout({ sessionId: session.id });

      if (error) {
        console.error("Error during checkout", error);
      }
    }
  };

  return (
    <div>
    <div>
      <ManagerNavbar />
    </div>
    <div className="flex flex-col items-center min-h-scree bg-purple-100 min-h-screen p-6">
      <div className="bg-white shadow-lg rounded-lg p-6 w-96 text-center">
        <h1 className="text-2xl font-bold mb-4">Want to Improve?</h1>
        <p className="text-gray-600 mb-4">
          See data insights and analysis on your reviews.
        </p>
        <button
          onClick={handleSubscribe}
          disabled={isSubscribed}  // Disable the button if already subscribed
          className={`${isSubscribed ? "bg-gray-400 cursor-not-allowed" : "bg-purple-500"} text-white rounded-lg p-3 hover:bg-purple-600 transition duration-300`}
        >
          {isSubscribed ? "Already Subscribed" : "Subscribe Now"}
        </button>
      </div>
    </div>
    </div>
  );
}
