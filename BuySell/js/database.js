/**
 * ASYNCRIX BUY/SELL - Database Synchronizer (Office Edition)
 * Redirects data from Supabase/Local to a private PostgreSQL server via Cloudflare.
 */

const API_URL = "https://asyncrix-api-bridge.dipakkadamb.workers.dev"; // Reverted to standard pattern
let dbInitialized = false;
let cloudOnline = true;

// --- CORE API OPERATIONS ---

async function apiRequest(endpoint, method, body = null) {
    try {
        const options = {
            method,
            headers: { 'Content-Type': 'application/json' }
        };
        if (body) options.body = JSON.stringify(body);
        
        const response = await fetch(`${API_URL}${endpoint}`, options);
        if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
        return await response.json();
    } catch (err) {
        console.error('ASYNCRIX BUY/SELL API Error:', err);
        return null;
    }
}

export async function initDatabase() {
    dbInitialized = true;
    console.log("ASYNCRIX DB: Office Server engine active.");
    
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
        // Simple ping to the worker
        const response = await fetch(`${API_URL}/load?table=buysell_items&limit=1`);
        cloudOnline = response.ok;
    } catch (err) {
        cloudOnline = false;
    }
    window.dispatchEvent(new CustomEvent('cloudStatusChanged', { detail: { online: cloudOnline } }));
}

/**
 * Office Server Persistence Logic (Upsert)
 */
export async function saveToCloud(type, data) {
    if (!dbInitialized) return false;
    try {
        const tableName = `buysell_${type.replace(/-/g, '_')}`;
        await apiRequest('/save', 'POST', {
            table: tableName,
            id: data.id,
            data: data
        });
        
        cloudOnline = true;
        window.dispatchEvent(new CustomEvent('cloudStatusChanged', { detail: { online: true } }));
        return true;
    } catch (error) {
        cloudOnline = false;
        window.dispatchEvent(new CustomEvent('cloudStatusChanged', { detail: { online: false } }));
        console.error(`ASYNCRIX DB: Office Save failed for ${type}:`, error);
        return false;
    }
}

/**
 * Batch Upsert Support
 */
export async function batchSaveToCloud(type, dataArray) {
    if (!dbInitialized || !dataArray || dataArray.length === 0) return false;
    try {
        const tableName = `buysell_${type.replace(/-/g, '_')}`;
        for (const item of dataArray) {
            await apiRequest('/save', 'POST', {
                table: tableName,
                id: item.id,
                data: item
            });
        }
        return true;
    } catch (error) {
        console.error(`ASYNCRIX DB: Office Batch Save failed for ${type}:`, error);
        return false;
    }
}

export async function deleteFromCloud(type, id) {
    if (!dbInitialized) return false;
    try {
        const tableName = `buysell_${type.replace(/-/g, '_')}`;
        await apiRequest('/delete', 'POST', {
            table: tableName,
            id: id
        });
        return true;
    } catch (error) {
        console.error(`ASYNCRIX DB: Office Delete failed for ${type}:`, error);
        return false;
    }
}

export async function loadFromCloud(type) {
    if (!dbInitialized) return [];
    try {
        const tableName = `buysell_${type.replace(/-/g, '_')}`;
        const items = await apiRequest(`/load?table=${tableName}`, 'GET');
        return items || [];
    } catch (error) {
        console.error(`ASYNCRIX DB: Error loading ${type} from Office Server:`, error);
        return [];
    }
}

export async function testConnection() {
    try {
        const start = Date.now();
        const response = await fetch(`${API_URL}/load?table=buysell_items&limit=1`);
        const latency = Date.now() - start;
        return { success: response.ok, latency: latency };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Migration Tool: Move from Local/Supabase to Office Server
 */
export async function migrateLocalToOffice(localDocuments) {
    if (!dbInitialized) return;
    console.log("ASYNCRIX DB: Starting migration to Office Server...");
    for (const [type, list] of Object.entries(localDocuments)) {
        if (Array.isArray(list) && list.length > 0) {
            await batchSaveToCloud(type, list);
        }
    }
    console.log("ASYNCRIX DB: Migration complete.");
}
