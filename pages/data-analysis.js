import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { ref, get } from 'firebase/database';
import { database } from '../firebase'; // Use Realtime Database instead of Firestore
import ManagerNavbar from '../components/HomeNavbar';

export default function DataAnalysis() {
  const router = useRouter();
  const { id } = router.query; // Get manager ID
  const [managerData, setManagerData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch manager data from Realtime Database
  useEffect(() => {
    if (!id) {
      console.error("❌ Manager ID is undefined.");
      return;
    }

    const fetchManagerData = async () => {
      try {
        console.log("🔍 Fetching manager data for ID:", id);

        // Fetch data from Realtime Database
        const managerRef = ref(database, `info/Apple/managers/${id}`);
        const snapshot = await get(managerRef);

        if (snapshot.exists()) {
          const data = snapshot.val();
          console.log("✅ Manager Data Retrieved:", data);

          setManagerData(data);
          setReviews(data.reviews || []);
        } else {
          console.error("❌ No manager found!");
        }
      } catch (error) {
        console.error("❌ Firebase Fetch Error:", error);
      }
    };

    fetchManagerData();
  }, [id]);

  // Function to generate summary using OpenAI
  const generateSummary = async () => {
    if (!reviews.length) {
      console.warn("⚠️ No reviews available for analysis.");
      return;
    }

    setLoading(true);

    try {
      console.log("🚀 Sending reviews to OpenAI:", reviews);

      const response = await fetch('/api/analyze-reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviews }),
      });

      const result = await response.json();
      console.log("✅ OpenAI Response:", result);

      setSummary(result.summary || "No summary available.");
    } catch (error) {
      console.error("❌ OpenAI API Error:", error);
      setSummary('Error generating summary.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <ManagerNavbar />
    <div className="flex flex-col items-center min-h-screen bg-purple-100 p-6">
      <div className="bg-white shadow-lg rounded-lg p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Data Analysis</h1>
        <p className="text-gray-600 font-bold mb-4">Insights based on your manager reviews.</p>

        {/* Display Manager Data */}
        {managerData ? (
          <div className=" flex flex-col items-center bg-purple-100 p-4 rounded-lg">
            <h2 className="text-lg font-semibold">Manager Insights</h2>
            <p><strong>Name:</strong> {managerData.name}</p>
            <p><strong>Average Rating:</strong> {managerData.averageRating || 'N/A'}/5</p>
            <button
              onClick={generateSummary}
              className="mt-4 bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition duration-300"
              disabled={loading}
            >
              {loading ? 'Generating Summary...' : 'Generate Review Summary'}
            </button>
          </div>
        ) : (
          <p>Loading manager data...</p>
        )}

        {/* Display Summary */}
        {summary ? (
          <div className="bg-green-100 p-4 rounded-lg mt-4 text-left">
            <h2 className="flex flex-col items-center text-lg font-semibold">Review Summary</h2>
            <p>{summary}</p>
          </div>
        ) : (
          <p className="text-gray-600 italic">No summary available.</p>
        )}

        {/* Back to Manager Profile Button */}
        <button
          onClick={() => router.push(`/Managers/${id}`)}
          className="mt-4 bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition duration-300"
        >
          Back to Profile
        </button>
      </div>
    </div>
  </div>
  );
}
