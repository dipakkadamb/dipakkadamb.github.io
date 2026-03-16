/**
 * ASYNCRIX GLOBAL - Database Synchronizer (Google Sheets Edition)
 * Handles data synchronization between local storage and Google Sheets.
 */

const GOOGLE_SHEETS_URL = "https://script.google.com/macros/s/AKfycbwwdQKD0YF4l7BLy9xHUeq-gvaqJGfenWHQbv2o_yTPvdbblphduCSY1vMi8yn5TFnm/exec";

let dbInitialized = false;

export async function initDatabase() {
    if (GOOGLE_SHEETS_URL.includes("YOUR_APPS_SCRIPT")) {
        console.warn("ASYNCRIX DB: Google Sheets URL missing. Falling back to Local Storage mode.");
        return false;
    }
    dbInitialized = true;
    console.log("ASYNCRIX DB: Google Sheets sync ready.");
    return true;
}

/**
 * Google Sheets Persistence Logic
 */
export async function saveToCloud(type, data) {
    if (!dbInitialized) return false;
    try {
        const response = await fetch(GOOGLE_SHEETS_URL, {
            method: 'POST',
            mode: 'no-cors', // Simple request
            body: JSON.stringify({
                action: 'save',
                type: type,
                id: data.id,
                data: data
            })
        });
        // Note: With no-cors, we can't read the response body, 
        // but we can assume success if no exception is thrown.
        return true;
    } catch (error) {
        console.error(`Error saving ${type} to Google Sheets:`, error);
        return false;
    }
}

export async function deleteFromCloud(type, id) {
    if (!dbInitialized) {
        console.warn("ASYNCRIX DB: Delete failed - Database not initialized.");
        return false;
    }
    try {
        console.log(`ASYNCRIX DB: Attempting cloud delete for ${type} (${id})...`);
        await fetch(GOOGLE_SHEETS_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify({
                action: 'delete',
                type: type,
                id: id
            })
        });
        console.log(`ASYNCRIX DB: Cloud delete request sent for ${type} (${id}).`);
        return true;
    } catch (error) {
        console.error(`ASYNCRIX DB: Error deleting ${type} from Google Sheets:`, error);
        return false;
    }
}

export async function loadFromCloud(type) {
    if (!dbInitialized) return [];
    try {
        const response = await fetch(`${GOOGLE_SHEETS_URL}?type=${type}`);
        const data = await response.json();
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error(`Error loading ${type} from Google Sheets:`, error);
        return [];
    }
}

/**
 * Diagnostic tool to check if the Web App is responsive
 */
export async function testConnection() {
    try {
        const start = Date.now();
        // Use a controller to timeout long-hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(`${GOOGLE_SHEETS_URL}?type=ping`, { 
            signal: controller.signal,
            cache: 'no-store' 
        });
        
        clearTimeout(timeoutId);
        const status = response.ok;
        const latency = Date.now() - start;
        
        if (!status) {
            console.warn(`ASYNCRIX DB: Connection test returned status ${response.status}`);
        }
        
        return { success: status, latency: latency };
    } catch (error) {
        if (error.name === 'AbortError') {
            console.error("ASYNCRIX DB: Connection test timed out.");
        } else {
            console.error("ASYNCRIX DB: Connection test failed:", error);
        }
        return { success: false, error: error.toString() };
    }
}

/**
 * Wipe all data from Cloud (Google Sheets)
 */
export async function clearAllCloudData() {
    if (!dbInitialized) return false;
    try {
        await fetch(GOOGLE_SHEETS_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify({
                action: 'clearAll'
            })
        });
        return true;
    } catch (error) {
        console.error("ASYNCRIX DB: Failed to clear cloud data:", error);
        return false;
    }
}

/**
 * Migration Utility: LocalStorage -> Google Sheets
 */
export async function migrateLocalToCloud(localDocuments) {
    if (!dbInitialized) return;
    console.log("ASYNCRIX DB: Starting migration to Google Sheets...");
    
    for (const [type, list] of Object.entries(localDocuments)) {
        if (Array.isArray(list)) {
            for (const item of list) {
                await saveToCloud(type, item);
            }
        }
    }
    console.log("ASYNCRIX DB: Migration complete.");
}
