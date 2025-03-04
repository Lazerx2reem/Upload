import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { signInWithPopup } from "firebase/auth";
import { auth,db, provider } from "/firebase"; // Adjust path based on your project structure
import { useRouter } from "next/router";
import HomeNavbar from "../../components/HomeNavbar";
import { doc, setDoc, getDoc } from "firebase/firestore";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Handle email/password login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/home"); // Redirect after login
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check Firestore for existing user data
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        router.push("/profile");
      } else {
        // If the user doesn't exist, create a new record
        await setDoc(userRef, {
          name: user.displayName,
          email: user.email,
          isSubscribed: false,
          user_id: null
        });
        router.push("/profile");
      }
    } catch (err) {
      console.error("Google Sign-In Error:", err);
    }
  };

  return (
    <div>
      <HomeNavbar />
    <div className="flex justify-center items-center h-screen bg-purple-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h1 className="text-3xl font-bold text-center text-purple-700 mb-6">Login</h1>

        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

        {/* Google Sign-In Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className={`w-full px-6 py-2 rounded-lg mb-4 text-white ${loading ? "bg-gray-400" : "bg-purple-500 hover:bg-purple-600"}`}
        >
          {loading ? "Signing in..." : "Sign in with Google"}
        </button>

        {/* Email and Password Login Form */}
        <form onSubmit={handleSubmit}>
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
            {loading ? "Logging In..." : "Login"}
          </button>
        </form>

        <p className="mt-3 text-center text-sm text-purple-700">
          Don't have an account? <a href="/auth/signup" className="text-purple-600 hover:underline">Sign up here</a>
        </p>
      </div>
    </div>
    </div>
  );
};

export default Login;
