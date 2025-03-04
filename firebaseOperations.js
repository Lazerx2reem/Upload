import { database } from "./firebase";
import { ref, get, set, update, push } from "firebase/database";
import { v4 as uuidv4 } from "uuid";

// Function to add a company and associate a manager
export const addCompanyWithManager = async (companyName, managerName) => {
    const normalizedCompanyName = companyName.trim();
    const companyRef = ref(database, `info/${normalizedCompanyName}/managers`);
  
    try {
      const snapshot = await get(companyRef);
      let managers = snapshot.exists() ? snapshot.val() : {}; // Get existing managers or initialize an empty object
  
      if (managerName) {
        const managerId = uuidv4();
        managers[managerId] = { name: managerName }; // Store manager with unique ID
      }
  
      await set(companyRef, managers);
  
      console.log("Company and manager added successfully!");
    } catch (error) {
      console.error("Error adding company/manager:", error);
    }
  };
  

// Function to get all companies and their managers
export const getCompanies = async () => {
  const companyRef = ref(database, "info");
  const snapshot = await get(companyRef);
  return snapshot.exists() ? snapshot.val() : {};
};

// Function to add a manager to a company
export const addManagerToCompany = async (companyName, managerName) => {
  try {
    // Reference to the company inside "info"
    const companyRef = ref(database, `info/${companyName}/managers`);

    // Generate a unique manager ID
    const newManagerRef = push(companyRef);
    const managerId = newManagerRef.key;

    // Set the manager details under the generated ID
    await update(companyRef, {
      [managerId]: {
        name: managerName,
      },
    });

    console.log(`Manager ${managerName} added to ${companyName}`);
  } catch (error) {
    console.error("Error adding manager:", error);
  }
};
