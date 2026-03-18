/**
 * ASYNCRIX HRM - Core Database Logic (Office Server Edition)
 * Redirects data to a private PostgreSQL server via Cloudflare.
 */

const API_URL = "https://asyncrix-api-bridge.dipakkadamb.dipakkadamb.workers.dev"; // Corrected URL pattern
export const STORAGE_KEY = 'asyncrix_hrm_data';

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
        console.error('ASYNCRIX HRM API Error:', err);
        return null;
    }
}

export async function initDatabase() {
    // We check if we have local data and suggest migration later
    if (!localStorage.getItem(STORAGE_KEY)) {
        console.log('HRM: Initializing with local-first pattern.');
    }
}

// LOAD DATA
export async function getData(collection) {
    if (!collection) return null;
    const items = await apiRequest(`/load?table=hrm_${collection}`, 'GET');
    
    // Fallback to localStorage if API fails or is empty
    if (!items || items.length === 0) {
        const local = JSON.parse(localStorage.getItem(STORAGE_KEY));
        return local ? local[collection] || [] : [];
    }
    return items;
}

// SAVE DATA (Upsert)
export async function saveData(collection, items) {
    // 1. Save locally for backup
    const local = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    local[collection] = items;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(local));

    // 2. Save to Office Server
    // Note: We batch save or individual save depending on worker implementation
    // For now, we save everything as a single object or iterate?
    // Let's assume the Worker expects individual upserts for consistency with BuySell
    for (const item of items) {
        await apiRequest('/save', 'POST', {
            table: `hrm_${collection}`,
            id: item.id,
            data: item
        });
    }
}

export async function addToCollection(collection, item) {
    // 1. Local
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    if (!data[collection]) data[collection] = [];
    data[collection].push(item);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

    // 2. Office Server
    await apiRequest('/save', 'POST', {
        table: `hrm_${collection}`,
        id: item.id || `AUTO_${Date.now()}`,
        data: item
    });
}

export async function updateInCollection(collection, id, updatedItem) {
    // 1. Local
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    const index = data[collection].findIndex(item => item.id === id);
    if (index !== -1) {
        data[collection][index] = { ...data[collection][index], ...updatedItem };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        
        // 2. Office Server
        await apiRequest('/save', 'POST', {
            table: `hrm_${collection}`,
            id: id,
            data: data[collection][index]
        });
        return true;
    }
    return false;
}

export async function deleteFromCollection(collection, id) {
    // 1. Local
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    data[collection] = data[collection].filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

    // 2. Office Server
    await apiRequest('/delete', 'POST', {
        table: `hrm_${collection}`,
        id: id
    });
}
