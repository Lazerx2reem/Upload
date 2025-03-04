// subscription-success.js
import { useEffect } from "react";
import { useRouter } from "next/router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";  // your Firestore setup
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";

const SubscriptionSuccess = () => {
  const router = useRouter();
  const { session_id, user_id, manager_id } = router.query;
  const [user] = useAuthState(auth);

  useEffect(() => {
    if (user && session_id && user_id && manager_id) {
      const updateSubscriptionStatus = async () => {
        try {
          const userRef = doc(db, "users", user_id);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            // Update user's subscription info with the manager's ID
            await updateDoc(userRef, {
              isSubscribed: true,
              managerId: manager_id,  // Associate manager with user
            });

            router.push("/profile"); // Redirect to profile page
          }
        } catch (error) {
          console.error("Error updating subscription:", error);
        }
      };

      updateSubscriptionStatus();
    }
  }, [session_id, user_id, manager_id, user, router]);

  return <div>Processing your subscription...</div>;
};

export default SubscriptionSuccess;
