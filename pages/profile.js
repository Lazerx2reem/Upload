import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { auth } from "/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import ProfileNavbar from "../components/ProfileNavbar";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Listen for user state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push("/auth/login"); // Redirect if not logged in
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/auth/login");
  };

  if (!user) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div>
      <ProfileNavbar />
    <div className="flex flex-col items-center justify-center min-h-screen bg-purple-50">
      <h1 className="text-4xl font-bold text-purple-700 mb-4">Dashboard</h1>
      <div className="bg-white shadow-lg rounded-lg p-6 w-80 text-center">
        <h2 className="text-2xl font-semibold text-purple-600">{user.displayName}</h2>
        <p className="text-gray-600 mt-2">{user.email}</p>
        <button
          onClick={handleLogout}
          className="bg-purple-500 text-white px-4 py-2 rounded-lg mt-4 hover:bg-purple-600"
        >
          Logout
        </button>
      </div>
    </div>
  </div>
  );
}
