import { useState } from "react";
import { auth, db, provider } from "../../firebase";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { useRouter } from "next/router";
import HomeNavbar from "../../components/HomeNavbar";

const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Handle Email & Password Sign Up
  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Store the user's data in Firestore
      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        isSubscribed: false, // initial subscription status is false
      });

      router.push("/profile"); // Redirect after successful sign-up
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Store the user's data in Firestore (if not already)
      await setDoc(doc(db, "users", user.uid), {
        name: user.displayName,
        email: user.email,
        isSubscribed: false, // Set initial subscription status
        user_id: ''
      });

      router.push("/profile");
    } catch (err) {
      console.error("Google Sign-In Error:", err);
    }
  };

  return (
    <div>
      <HomeNavbar />
    <div className="flex justify-center items-center h-screen bg-purple-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-3xl font-bold text-center text-purple-700 mb-6">Sign Up</h2>
        
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

        {/* Google Sign-In Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className={`w-full px-6 py-2 rounded-lg mb-4 text-white ${loading ? "bg-gray-400" : "bg-purple-500 hover:bg-purple-600"}`}
        >
          {loading ? "Signing in..." : "Sign up with Google"}
        </button>

        <form onSubmit={handleSignUp}>
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 mb-3 border border-purple-300 rounded text-purple-700"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 mb-3 border border-purple-300 rounded text-purple-700"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 mb-4 border border-purple-300 rounded text-purple-700"
            required
          />
          <button
            type="submit"
            className="w-full bg-purple-500 text-white p-2 rounded-lg hover:bg-purple-600"
            disabled={loading}
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-3 text-center text-sm text-purple-700">
          Already have an account? <a href="/auth/login" className="text-purple-600 hover:underline">Login here</a>
        </p>
      </div>
    </div>
    </div>
  );
};

export default SignUp;
