/**
 * ASYNCRIX HRM - Database Sync Utility
 * Moves data from LocalStorage to the Office PostgreSQL Server.
 */

export async function migrateToOffice(apiBaseUrl) {
    console.log('🔗 HR Sync: Starting migration to Office Server...');
    
    // 1. Get all local data
    const localData = JSON.parse(localStorage.getItem('asyncrix_hrm_data'));
    if (!localData) {
        console.warn('⚠️ HR Sync: No local data found to migrate.');
        return { success: false, message: 'No local data found.' };
    }

    const results = [];
    
    // 2. Define collections to migrate
    const collections = [
        { name: 'employees', table: 'hrm_employees' },
        { name: 'attendance', table: 'hrm_attendance' },
        { name: 'jobs', table: 'hrm_jobs' }, // Need to ensure table exists
        { name: 'expenses', table: 'hrm_expenses' }
    ];

    try {
        for (const col of collections) {
            const items = localData[col.name] || [];
            console.log(`📦 HR Sync: Migrating ${items.length} records from ${col.name}...`);
            
            for (const item of items) {
                const response = await fetch(`${apiBaseUrl}/save`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        table: col.table,
                        id: item.id || `AUTO_${Math.random().toString(36).substr(2, 9)}`,
                        data: item
                    })
                });
                
                if (!response.ok) throw new Error(`Failed to save ${col.name} item`);
            }
            results.push({ collection: col.name, count: items.length });
        }

        console.log('✅ HR Sync: Migration successful!');
        return { success: true, results };
    } catch (err) {
        console.error('❌ HR Sync: Migration failed:', err);
        return { success: false, error: err.message };
    }
}
