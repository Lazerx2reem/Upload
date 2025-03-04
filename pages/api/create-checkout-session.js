// create-checkout-session.js
import Stripe from "stripe";
import { db } from "../../firebase";  // assuming you have this for Firestore

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { id } = req.body;  // Manager's ID and User's ID

      // Create a new Stripe Checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "Manager Subscription",
              },
              unit_amount: 1000, // Price in cents
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscription-success?session_id={CHECKOUT_SESSION_ID}&manager_id=${id}&user_id=${id}isSubscribed=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/Managers/${id}`,
      });

      res.status(200).json({ id: session.id });
    } catch (err) {
      console.error("Error creating checkout session:", err);
      res.status(500).json({ error: "Failed to create session" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
