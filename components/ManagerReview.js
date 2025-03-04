import { Card } from "../components/ui/card";

const getRatingColor = (rating) => {
  if (rating == 5) return "bg-green-300"; 
  if (rating == 4) return "bg-green-200";
  if (rating == 3) return "bg-yellow-200"; 
  if (rating == 2) return "bg-red-200"; 
  return "bg-red-300"; 
};

const ManagerReview = ({ review }) => {
  return (
    <Card className="bg-white shadow-lg rounded-lg p-6 flex-1 mb-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Anonymous User</h3>
        <span className="text-sm text-gray-500">{review.date}</span>
      </div>
      
      <div className="flex items-center mt-2">
        <div className={`w-12 h-12 flex items-center justify-center text-lg font-bold rounded-md ${getRatingColor(review.rating)}`}>
          {review.rating}
        </div>
        <div className="ml-4">
          <p className="text-md font-semibold">{review.department || "N/A"}</p>
          <p className="text-gray-600">Overtime: <span className="font-semibold">{review.overtime === "Yes" ? "Yes" : "No"}</span></p>
          <p className="text-gray-600">Micromanages: <span className="font-semibold">{review.micromanages === "Yes" ? "Yes" : "No"}</span></p>
          <p className="text-gray-600">Work Life Balance: <span className="font-semibold">{review.worklife === "Good" ? "Good" : review.worklife === "Fair" ? "Fair" : "Bad"}</span></p>
        </div>
      </div>
      
      <p className="text-xl mt-4 text-black">{review.comment}</p>
    </Card>
  );
};
export default ManagerReview;