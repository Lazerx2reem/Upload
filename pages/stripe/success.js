import { useEffect } from "react";
import { useRouter } from "next/router";
import { getDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase";

const SubscriptionSuccess = () => {
  const router = useRouter();
  const { session_id, user_id } = router.query;
  const [user] = useAuthState(auth);

  useEffect(() => {
    if (user && session_id && user_id) {
      const updateSubscriptionStatus = async () => {
        // Validate the session and user info (with Stripe, on the backend)
        // For now, we'll assume the payment was successful

        const userRef = doc(db, "users", user_id);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          await updateDoc(userRef, {
            isSubscribed: true, // Update subscription status
          });
          router.push("/profile"); // Redirect to the profile page
        }
      };

      updateSubscriptionStatus();
    }
  }, [session_id, user_id, user, router]);

  return <div>Processing your subscription...</div>;
};

export default SubscriptionSuccess;
