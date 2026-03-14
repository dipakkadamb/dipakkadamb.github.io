/**
 * ASYNCRIX GLOBAL - Database Synchronizer (Firebase Edition)
 * Handles the transition from localStorage to real-time cloud storage.
 */

// Firebase Configuration - Replace with your own project keys
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "asyncrix-global.firebaseapp.com",
    projectId: "asyncrix-global",
    storageBucket: "asyncrix-global.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Imports moved to dynamic loading in initDatabase() to prevent module hangs.

let app;
let db;
let dbInitialized = false;

export async function initDatabase() {
    try {
        if (firebaseConfig.apiKey === "YOUR_API_KEY") {
            console.warn("ASYNCRIX DB: Cloud configuration missing. Falling back to Local Storage mode.");
            return false;
        }

        // Dynamic Loading for resiliency
        const firebaseApp = await import("https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js");
        const firestore = await import("https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js");

        app = firebaseApp.initializeApp(firebaseConfig);
        db = firestore.getFirestore(app);
        
        // Export needed functions to global/internal state if needed, 
        // but here we use them via the imported modules.
        window.firebaseDB = db;
        window.firestore = firestore;

        dbInitialized = true;
        console.log("ASYNCRIX DB: Cloud connected successfully.");
        return true;
    } catch (error) {
        console.error("ASYNCRIX DB Connection Error:", error);
        return false;
    }
}

/**
 * Cloud Persistence Logic
 */
export async function saveToCloud(type, data) {
    if (!dbInitialized) return false;
    try {
        const { doc, setDoc } = window.firestore;
        // We use the 'id' as the document path for consistency
        await setDoc(doc(db, type, data.id), data);
        return true;
    } catch (error) {
        console.error(`Error saving ${type} to cloud:`, error);
        return false;
    }
}

export async function deleteFromCloud(type, id) {
    if (!dbInitialized) return false;
    try {
        const { doc, deleteDoc } = window.firestore;
        await deleteDoc(doc(db, type, id));
        return true;
    } catch (error) {
        console.error(`Error deleting ${type} from cloud:`, error);
        return false;
    }
}

export async function loadFromCloud(type) {
    if (!dbInitialized) return [];
    try {
        const { collection, getDocs } = window.firestore;
        const querySnapshot = await getDocs(collection(db, type));
        const data = [];
        querySnapshot.forEach((doc) => {
            data.push(doc.data());
        });
        return data;
    } catch (error) {
        console.error(`Error loading ${type} from cloud:`, error);
        return [];
    }
}

/**
 * Migration Utility: LocalStorage -> Firestore
 */
export async function migrateLocalToCloud(localDocuments) {
    if (!dbInitialized) return;
    console.log("ASYNCRIX DB: Starting migration to cloud...");
    
    for (const [type, list] of Object.entries(localDocuments)) {
        if (Array.isArray(list)) {
            for (const item of list) {
                await saveToCloud(type, item);
            }
        }
    }
    console.log("ASYNCRIX DB: Migration complete.");
}
