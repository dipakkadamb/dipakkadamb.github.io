/**
 * ASYNCRIX BUY/SELL - Database Sync Utility
 * Moves data from Supabase/Local to the Office PostgreSQL Server.
 */

export async function migrateToOffice(apiBaseUrl, currentData) {
    console.log('🔗 BuySell Sync: Starting migration to Office Server...');
    
    if (!currentData || Object.keys(currentData).length === 0) {
        console.warn('⚠️ BuySell Sync: No data found to migrate.');
        return { success: false, message: 'No data found.' };
    }

    const results = [];
    
    // Define collections to migrate
    const collections = [
        { name: 'items', table: 'buysell_items' },
        { name: 'transactions', table: 'buysell_transactions' },
        { name: 'customers', table: 'buysell_items' }, // Mapping customers to items table or generic table
        { name: 'orders', table: 'buysell_transactions' }
    ];

    try {
        for (const col of collections) {
            const items = currentData[col.name] || [];
            console.log(`📦 BuySell Sync: Migrating ${items.length} records from ${col.name}...`);
            
            for (const item of items) {
                const response = await fetch(`${apiBaseUrl}/save`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        table: col.table,
                        id: item.id || `BS_${Math.random().toString(36).substr(2, 9)}`,
                        data: item
                    })
                });
                
                if (!response.ok) throw new Error(`Failed to save ${col.name} item`);
            }
            results.push({ collection: col.name, count: items.length });
        }

        console.log('✅ BuySell Sync: Migration successful!');
        return { success: true, results };
    } catch (err) {
        console.error('❌ BuySell Sync: Migration failed:', err);
        return { success: false, error: err.message };
    }
}
