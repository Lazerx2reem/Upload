// ManagerProfile.js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { ref, get, update } from "firebase/database";
import { database, auth, db} from "../../firebase";
import ManagerReview from "../../components/ManagerReview";
import ManagerNavbar from "../../components/ManagerNavbar";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { doc,getDoc } from "firebase/firestore";

export default function ManagerProfile() {
  const router = useRouter();
  const { id } = router.query;
  const [manager, setManager] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [newReview, setNewReview] = useState("");
  const [newRating, setNewRating] = useState();
  const [department, setDepartment] = useState("");
  const [overtime, setOvertime] = useState("");
  const [micromanages, setMicromanages] = useState("");
  const [worklife, setWorkLife] = useState("");
  const [summary, setSummary] = useState("Loading summary...");
  const [uid, setUserId] = useState(null);

  const isSubscribed = typeof window !== "undefined" && localStorage.getItem(`subscribed_${id}`) === "true";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const fetchedUserId = await getUserId(user.uid); // Fetch Firestore user_id
        setUserId(fetchedUserId);
      } else {
        setUserId(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const getUserId = async (uid) => {
    try {
      if (!uid) return null; // Ensure UID is available
  
      const userRef = doc(db, "users", uid); // Firestore users collection
      const userSnap = await getDoc(userRef);
  
      if (userSnap.exists()) {
        return userSnap.data().user_id; // Get user_id from Firestore
      } else {
        console.log("No such document!");
        return null;
      }
    } catch (error) {
      console.error("Error fetching user ID:", error);
      return null;
    }
  };
  
  
  

  useEffect(() => {
    if (!id) return;

    const fetchManager = async () => {
      try {
        const infoRef = ref(database, "info");
        const snapshot = await get(infoRef);

        if (snapshot.exists()) {
          const companies = snapshot.val();
          let foundManager = null;
          let allReviews = [];
          let totalRating = 0;
          let reviewCount = 0;

          for (const companyName in companies) {
            if (companies[companyName].managers && companies[companyName].managers[id]) {
              foundManager = {
                name: companies[companyName].managers[id].name,
                company: companyName,
                reviews: companies[companyName].managers[id].reviews || [],
              };

              allReviews = foundManager.reviews;
              allReviews.forEach((review) => {
                totalRating += review.rating || 0;
                reviewCount++;
              });

              break;
            }
          }

          if (foundManager) {
            setManager(foundManager);
            setReviews(allReviews);
            setRating(reviewCount > 0 ? totalRating / reviewCount : 0);
            fetchReviewSummary(allReviews);
          } else {
            setManager({ name: "Manager Not Found", company: "" });
          }
        } else {
          setManager({ name: "Manager Not Found", company: "" });
        }
      } catch (error) {
        console.error("Error fetching manager:", error);
      }
    };

    fetchManager();
  }, [id]);



  const getRatingColor = (rating) => {
    if (rating == 5) return "bg-green-300"; 
    if (rating == 4) return "bg-green-200";
    if (rating == 3) return "bg-yellow-200"; 
    if (rating == 2) return "bg-red-200"; 
    return "bg-red-300"; 
  };

  
  const handleAddReview = async () => {
    if (!newReview.trim()) {
      alert("Please enter a review before submitting.");
      return;
    }
  
    const review = {
      comment: newReview,
      rating: newRating ?? 3,
      department,
      overtime,
      micromanages,
      worklife,
      date: new Date().toLocaleDateString('en-GB'),
    };
  
    const managerRef = ref(database, `info/${manager.company}/managers/${id}`);
  
    try {
      const snapshot = await get(managerRef);
      if (snapshot.exists()) {
        const managerData = snapshot.val();
        const existingReviews = Array.isArray(managerData.reviews) ? managerData.reviews : [];
        const updatedReviews = [...existingReviews, review];
  
        await update(managerRef, { reviews: updatedReviews });
  
        setReviews(updatedReviews);
  
        // ✅ Call function to update rating
        calculateNewRating(updatedReviews);
  
        setNewReview("");
        setNewRating();
        setDepartment("");
        setOvertime("");
        setMicromanages("");
        setWorkLife("");
        fetchReviewSummary(updatedReviews);
      }
    } catch (error) {
      console.error("Error adding review:", error);
    }
  };

  const calculateNewRating = async (reviews) => {
    let totalRating = 0;
    let reviewCount = 0;
  
    reviews.forEach((review) => {
      totalRating += review.rating || 0;
      reviewCount++;
    });
  
    const newRating = reviewCount > 0 ? totalRating / reviewCount : 0;
    setRating(newRating); // ✅ Update state
  
    // ✅ Store in Firebase
    const managerRef = ref(database, `info/${manager.company}/managers/${id}`);
    try {
      await update(managerRef, { averageRating: newRating.toFixed(2) }); // ✅ Store new rating
    } catch (error) {
      console.error("Error updating average rating:", error);
    }
  };
  

  const fetchReviewSummary = async (reviews) => {
    if (reviews.length === 0) {
      setSummary("No reviews available.");
      return;
    }

    try {
      const response = await fetch("/api/reviewSummary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviews }),
      });

      const data = await response.json();
      setSummary(data.summary || "No summary available.");
    } catch (error) {
      console.error("Error fetching review summary:", error);
      setSummary("Error loading summary.");
    }
  };

  const handleCircleClick = (field, value) => {
    if (field === "overtime") {
      setOvertime(value);
    } else if (field === "micromanages") {
      setMicromanages(value);
    } else if (field === "worklife") {
      setWorkLife(value);
    }
    console.log("Selected overtime:", overtime);
  };

  const getCircleClass = (selected, value) => {
    return selected === value
      ? "w-16 h-16 border-2 rounded-full flex items-center justify-center cursor-pointer bg-blue-200 text-white"
      : "w-16 h-16 border-2 rounded-full flex items-center justify-center cursor-pointer bg-white border-gray-400 text-gray-600";
  };

  const handleOvertimeClick = (value) => {
    setOvertime(value);
  };
  
  const handleMicromanagesClick = (value) => {
    setMicromanages(value);
  };

  const renderCircleContent = (selected, value, type) => {
    let circleContent = null;
  
    if (type === "overtime" || type === "micromanages") {
      // Display tick or cross if selected, otherwise show the option text
      circleContent = selected === value
        ? value === "Yes"
          ? <span className="text-green-500">✔️</span>
          : <span className="text-red-500">❌</span>
        : value === "Yes"
          ? <span className="text-green-500">Yes</span>
          : <span className="text-red-500">No</span>;
    } else if (type === "worklife") {
      // Show the appropriate text inside the circle for work-life balance
      circleContent = selected === value
        ? value === "Good"
          ? <span className="text-green-500">Good</span>
          : value === "Fair"
          ? <span className="text-yellow-500">Fair</span>
          : value === "Bad"
          ? <span className="text-red-500">Bad</span>
          : null
        : value === "Good"
          ? <span className="text-green-500">Good</span>
          : value === "Fair"
          ? <span className="text-yellow-500">Fair</span>
          : value === "Bad"
          ? <span className="text-red-500">Bad</span>
          : null;
    }
  
    return circleContent;
  };
  
  

  if (!manager) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-purple-100 ">
      <ManagerNavbar />
      <div className="container mx-auto flex flex-col lg:flex-row gap-10">
        <div className="mx-auto pt-20">
          <h1 className="text-3xl font-bold text-gray-800 text-center">{manager.name}</h1>
          <h3 className="text-lg text-gray-500 mt-2 text-center">Company: {manager.company}</h3>
          <h4 className="text-lg text-gray-600 mt-1 text-center">
          Average Rating: {rating ? rating.toFixed(2) : "No ratings yet"} / 5
          </h4>
          {/* Conditional Rendering based on the logged-in user's ID */}
          {uid == id ? (
          // If logged-in user ID matches the manager ID, show the "Check Analysis" button
          <button
            className="mt-4 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            onClick={() => router.push(`/data-analysis?id=${id}`)} 
          >
            Check Analysis
          </button>
        ) : (
          // If the logged-in user is not the manager, show the "Are you the Manager?" link
          <p className="mt-4 text-blue-500 cursor-pointer hover:underline">
            <Link href={`/manager-subscription?id=${id}`}>
              Are you the Manager?
            </Link>
          </p>
        )}
        </div>
        

       
        
        {/* Reviews Section */}
<div className="bg-white shadow-lg rounded-lg p-6 flex-1 mb-6 max-w-xl mx-auto mt-12"> {/* Added mt-12 to push it down */}
  <h2 className="text-2xl font-semibold mb-4">Add a Review</h2>
    
    {/* Department Input */}
    <div className="mb-4">
      <input
        type="text"
        placeholder="Department"
        value={department}
        onChange={(e) => setDepartment(e.target.value)}
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
      />
    </div>

    {/* Review Input */}
    <div className="mb-4">
      <textarea
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
        placeholder="Write your review here..."
        value={newReview}
        onChange={(e) => setNewReview(e.target.value)}
      />
    </div>

    {/* Rating Section */}
    <div className="mb-4">
      <h3 className="font-semibold text-left">Rating</h3>
      <div className="flex justify-between mt-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            onMouseEnter={() => setNewRating(i)}
            onClick={() => setNewRating(i)}
            className={`flex-1 h-12 cursor-pointer rounded-md transition-all duration-200 ease-in-out ${getRatingColor(i)} hover:scale-110 relative ${newRating === i ? "border-2 border-blue-500" : ""}`}
          >
            <div className={`w-full h-8 rounded-md ${getRatingColor(i)} ${newRating === i ? "border-blue-500" : ""}`}></div>
            <div className="absolute bottom-0 w-full text-center text-sm font-semibold">{i}</div>
          </div>
        ))}
      </div>
    </div>

    {/* Overtime Section */}
<div className="mb-6">
  <h3 className="font-semibold text-left">Overtime</h3>
  <div className="flex justify-between mt-2">
    <div
      onClick={() => handleOvertimeClick("Yes")}
      className={getCircleClass(overtime, "Yes")}
    >
      {renderCircleContent(overtime, "Yes", "overtime")}
    </div>
    <div
      onClick={() => handleOvertimeClick("No")}
      className={getCircleClass(overtime, "No")}
    >
      {renderCircleContent(overtime, "No", "overtime")}
    </div>
  </div>
</div>

{/* Micromanagement Section */}
<div className="mb-6">
  <h3 className="font-semibold text-left">Micromanages</h3>
  <div className="flex justify-between mt-2">
    <div
      onClick={() => handleMicromanagesClick("Yes")}
      className={getCircleClass(micromanages, "Yes")}
    >
      {renderCircleContent(micromanages, "Yes", "micromanages")}
    </div>
    <div
      onClick={() => handleMicromanagesClick("No")}
      className={getCircleClass(micromanages, "No")}
    >
      {renderCircleContent(micromanages, "No", "micromanages")}
    </div>
  </div>
</div>

    {/* Work-Life Balance Section */}
    <div className="mb-6">
      <h3 className="font-semibold text-left">Work Life Balance</h3>
      <div className="flex justify-between mt-2">
        {["Good", "Fair", "Bad"].map((value) => (
          <div
            key={value}
            onClick={() => handleCircleClick("worklife", value)}
            className={getCircleClass(worklife, value)}
          >
            {renderCircleContent(worklife, value, "worklife")}
          </div>
        ))}
      </div>
    </div>

    {/* Submit Review Button */}
    <button
      onClick={handleAddReview}
      className="mt-4 w-full bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition duration-300"
    >
      Submit Review
    </button>

    <p className="text-md font-semibold text-gray-700 mt-4">Review Summary:</p>
    <p className="text-gray-600 italic">{summary}</p>
  </div>
</div>

{/* Reviews List */}
<div className="bg-purple-100 shadow-lg rounded-lg p-6  max-w-8xl flex-1 justify-center">
  <h2 className="text-2xl font-semibold ">Reviews</h2>
  {reviews.length > 0 ? (
    reviews.map((review, index) => <ManagerReview key={index} review={review} />)
  ) : (
    <p className="text-gray-600 mt-2">Be the first to review!</p>
  )}
</div>
    </div>
  );

}
