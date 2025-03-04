// utils/firebaseUtils.js
import { db } from "../../firebase";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";

/**
 * Fetch a manager by name or create a new one if it doesn't exist
 * @param {string} name - Manager's name
 */
export const getOrCreateManager = async (name) => {
  const managerId = name.toLowerCase().replace(/\s+/g, "-"); // e.g., John Doe → john-doe
  const managerRef = doc(db, "managers", managerId);
  const managerSnap = await getDoc(managerRef);

  if (managerSnap.exists()) {
    return { id: managerId, ...managerSnap.data() };
  } else {
    // Create a new manager entry
    const newManager = {
      name: name,
      company: "Unknown",
      reviews: [],
    };
    await setDoc(managerRef, newManager);
    return { id: managerId, ...newManager };
  }
};
