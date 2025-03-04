import Image from "next/image";
import HomeNavbar from "../components/HomeNavbar";
import { useState, useEffect, UseRef } from "react";
import { ref, onValue, set, update } from "firebase/database";
import { database } from "../firebase";
import { useRouter } from "next/router";
import { v4 as uuidv4 } from "uuid";


export default function Home() {
  const [companyName, setCompanyName] = useState("");
  const [showManagerInput, setShowManagerInput] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companiesList, setCompaniesList] = useState([]);
  const router = useRouter();


  // Fetch existing companies from Firebase
  useEffect(() => {
    const companiesRef = ref(database, "info"); // Fetching companies under "info"
    onValue(companiesRef, (snapshot) => {
      if (snapshot.exists()) {
        const companies = Object.keys(snapshot.val()); // Extract company names
        setCompaniesList(companies);
      }
    }); 
    
    
  }, []);


  // Handle company input change
  const handleCompanyNameChange = (e) => {
    setCompanyName(e.target.value);
    setShowManagerInput(false);
  };

  // Handle company form submission
  const handleCompanySubmit = (e) => {
    e.preventDefault();

    const normalizedCompanyName = companyName.trim();
    if (!normalizedCompanyName) {
      alert("Please enter a company name.");
      return;
    }

    // Check if company exists (case-insensitive)
    const companyExists = companiesList.some(
      (company) => company.trim().toLowerCase() === normalizedCompanyName.toLowerCase()
    );

    if (companyExists) {
      setShowManagerInput(true);
    } else {
      // Create the company record without manager
      const companyRef = ref(database, `info/${normalizedCompanyName}`);
      set(companyRef, { managers: {} });
      setShowManagerInput(true);
    }
  };

  // Handle manager form submission
  const handleManagerSubmit = async (e) => {
    e.preventDefault();

    const firstNameTrimmed = firstName.trim();
    const lastNameTrimmed = lastName.trim();
    if (!firstNameTrimmed || !lastNameTrimmed || !companyName.trim()) {
      alert("Please enter both first and last name.");
      return;
    }

    const fullName = `${firstNameTrimmed} ${lastNameTrimmed}`;
    const managersRef = ref(database, `info/${companyName}/managers`);

    // Check if manager already exists under the company
    onValue(managersRef, (snapshot) => {
      if (snapshot.exists()) {
        const managers = snapshot.val();
        for (const managerId in managers) {
          if (managers[managerId].name === fullName) {
            // Redirect to existing manager's page
            router.push(`../Managers/${managerId}`);
            return;
          }
        }
      }

      // If manager does not exist, create new entry
      const managerId = uuidv4();
      const newManagerRef = ref(database, `info/${companyName}/managers/${managerId}`);
      set(newManagerRef, { name: fullName }).then(() => {
        router.push(`../Managers/${managerId}`);
      });
    }, { onlyOnce: true }); // Ensures we only read data once



    
  };

  return (
    <div className="bg-purple-100 min-h-screen">
      <HomeNavbar />
      <div className="flex justify-center ">
      <Image src="/logo.png" width={300} height={200} />
      </div>

      {!showManagerInput ? (
        <form onSubmit={handleCompanySubmit} className="flex flex-col items-center space-y-4">
          <input
            type="text"
            value={companyName}
            onChange={handleCompanyNameChange}
            placeholder="Enter company name"
            className="w-80 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
            required
          />
          <button type="submit" className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600">
            Next
          </button>
        </form>
      ) : (
        <form onSubmit={handleManagerSubmit} className="flex flex-col items-center space-y-4 bg-purple-100">
          <h2 className="text-xl font-semibold ">Company: {companyName}</h2>
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-80 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
            required
          />
          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-80 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
            required
          />
          <button type="submit" className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600">
            Submit
          </button>
        </form>
      )}
        
    </div>
  );
}
