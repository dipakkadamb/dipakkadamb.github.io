/**
 * ASYNCRIX GLOBAL - Database Synchronizer (Supabase Edition)
 * Handles data synchronization between local storage and Supabase PostgreSQL.
 */

const SUPABASE_URL = "YOUR_SUPABASE_URL"; 
const SUPABASE_KEY = "YOUR_SUPABASE_ANON_KEY";

let dbInitialized = false;
let cloudOnline = true;

export async function initDatabase() {
    if (SUPABASE_URL.includes("YOUR_SUPABASE") || SUPABASE_KEY.includes("YOUR_SUPABASE")) {
        console.warn("ASYNCRIX DB: Supabase credentials missing. Cloud Sync disabled.");
        return false;
    }
    dbInitialized = true;
    console.log("ASYNCRIX DB: Supabase engine active.");
    
    // Initial health check
    checkConnection();
    // Periodic health check
    setInterval(checkConnection, 30000);
    
    return true;
}

export function isCloudOnline() {
    return cloudOnline;
}

async function checkConnection() {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/items?select=id&limit=1`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });
        cloudOnline = response.ok;
    } catch (err) {
        cloudOnline = false;
    }
    window.dispatchEvent(new CustomEvent('cloudStatusChanged', { detail: { online: cloudOnline } }));
}

/**
 * Supabase Persistence Logic (Upsert)
 */
export async function saveToCloud(type, data) {
    if (!dbInitialized) return false;
    try {
        const tableName = type.replace(/-/g, '_'); // Supabase prefers underscores
        const response = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'resolution=merge-duplicates' // Handle Upsert
            },
            body: JSON.stringify({
                id: data.id,
                data: data // Store flexible structure in JSONB
            })
        });
        
        cloudOnline = response.ok;
        window.dispatchEvent(new CustomEvent('cloudStatusChanged', { detail: { online: cloudOnline } }));
        return response.ok;
    } catch (error) {
        cloudOnline = false;
        window.dispatchEvent(new CustomEvent('cloudStatusChanged', { detail: { online: false } }));
        console.error(`ASYNCRIX DB: Supabase save failed for ${type}:`, error);
        return false;
    }
}

/**
 * Batch Upsert Support
 */
export async function batchSaveToCloud(type, dataArray) {
    if (!dbInitialized || !dataArray || dataArray.length === 0) return false;
    try {
        const tableName = type.replace(/-/g, '_');
        const payload = dataArray.map(item => ({
            id: item.id,
            data: item
        }));

        const response = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'resolution=merge-duplicates'
            },
            body: JSON.stringify(payload)
        });
        return response.ok;
    } catch (error) {
        console.error(`ASYNCRIX DB: Supabase batch save failed for ${type}:`, error);
        return false;
    }
}

export async function deleteFromCloud(type, id) {
    if (!dbInitialized) return false;
    try {
        const tableName = type.replace(/-/g, '_');
        const response = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}?id=eq.${id}`, {
            method: 'DELETE',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });
        return response.ok;
    } catch (error) {
        console.error(`ASYNCRIX DB: Supabase delete failed for ${type}:`, error);
        return false;
    }
}

export async function loadFromCloud(type) {
    if (!dbInitialized) return [];
    try {
        const tableName = type.replace(/-/g, '_');
        const response = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}?select=data`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });
        const rows = await response.json();
        return rows.map(r => r.data);
    } catch (error) {
        console.error(`ASYNCRIX DB: Error loading ${type} from Supabase:`, error);
        return [];
    }
}

export async function testConnection() {
    try {
        const start = Date.now();
        const response = await fetch(`${SUPABASE_URL}/rest/v1/items?select=id&limit=1`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });
        const latency = Date.now() - start;
        return { success: response.ok, latency: latency };
    } catch (error) {
        return { success: false, error: error.toString() };
    }
}

export async function migrateLocalToCloud(localDocuments) {
    if (!dbInitialized) return;
    console.log("ASYNCRIX DB: Starting migration to Supabase...");
    for (const [type, list] of Object.entries(localDocuments)) {
        if (Array.isArray(list) && list.length > 0) {
            await batchSaveToCloud(type, list);
        }
    }
    console.log("ASYNCRIX DB: Migration complete.");
}
