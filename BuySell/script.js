import { initDatabase, saveToCloud, deleteFromCloud, loadFromCloud, migrateLocalToCloud, clearAllCloudData, testConnection } from './database.js';

console.log("ASYNCRIX: Script execution starting...");

const DOC_TYPES = {
    DASHBOARD: 'dashboard',
    ITEMS: 'items',
    BANKING: 'banking',
    CUSTOMERS: 'customers',
    VENDORS: 'vendors',
    QUOTES: 'quotes',
    SO: 'sales-orders',
    INVOICES: 'invoices',
    PAYMENTS_REC: 'payments-received',
    DC: 'delivery-chalans',
    CREDIT_NOTES: 'credit-notes',
    EXPENSES: 'expenses',
    PO: 'purchase-orders',
    BILLS: 'bills',
    PAYMENTS_MADE: 'payments-made',
    PROFORMA: 'proforma-invoices',
    VENDOR_CREDITS: 'vendor-credits',
    REPORTS: 'reports'
};

const STORAGE_KEYS = {
    [DOC_TYPES.ITEMS]: 'hub_items',
    [DOC_TYPES.BANKING]: 'hub_banking',
    [DOC_TYPES.CUSTOMERS]: 'hub_customers',
    [DOC_TYPES.VENDORS]: 'hub_vendors',
    [DOC_TYPES.QUOTES]: 'hub_quotes',
    [DOC_TYPES.SO]: 'hub_so',
    [DOC_TYPES.INVOICES]: 'hub_invoices',
    [DOC_TYPES.PAYMENTS_REC]: 'hub_payments_rec',
    [DOC_TYPES.DC]: 'hub_dc',
    [DOC_TYPES.CREDIT_NOTES]: 'hub_credit_notes',
    [DOC_TYPES.EXPENSES]: 'hub_expenses',
    [DOC_TYPES.PO]: 'hub_po',
    [DOC_TYPES.BILLS]: 'hub_bills',
    [DOC_TYPES.PAYMENTS_MADE]: 'hub_payments_made',
    [DOC_TYPES.PROFORMA]: 'hub_proforma',
    [DOC_TYPES.VENDOR_CREDITS]: 'hub_vendor_credits'
};

let currentView = 'dashboard';

function formatCurrency(amount) {
    return '₹' + (amount || 0).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function getDocBalance(doc, type) {
    let balance = doc.total;
    if (type === DOC_TYPES.INVOICES) {
        const relatedPayments = documents[DOC_TYPES.PAYMENTS_REC].filter(p => p.refDoc === doc.id);
        const relatedCredits = documents[DOC_TYPES.CREDIT_NOTES].filter(c => c.ref === doc.id);
        balance -= relatedPayments.reduce((sum, p) => sum + p.total, 0);
        balance -= relatedCredits.reduce((sum, c) => sum + c.total, 0);
    } else if (type === DOC_TYPES.BILLS) {
        const relatedPayments = documents[DOC_TYPES.PAYMENTS_MADE].filter(p => p.refDoc === doc.id);
        const relatedCredits = documents[DOC_TYPES.VENDOR_CREDITS].filter(c => c.ref === doc.id);
        balance -= relatedPayments.reduce((sum, p) => sum + p.total, 0);
        balance -= relatedCredits.reduce((sum, c) => sum + c.total, 0);
    }
    return Math.max(0, balance);
}

// --- Global UI Bridge ---
// Immediate export to ensure buttons work even if initialization hangs
const globalBridge = {
    switchView: (v) => switchViewWrapped(v),
    renderContent: () => renderContent(),
    renderDashboard: (c) => renderDashboard(c),
    renderCustomers: (c) => renderCustomers(c),
    renderVendors: (c) => renderVendors(c),
    renderItems: (c) => renderItems(c),
    renderBanking: (c) => renderBanking(c),
    renderReports: (c) => renderReports(c),
    renderDocumentList: (c, t) => renderDocumentList(c, t),
    openCreateModal: (t, p) => openCreateModal(t, p),
    saveDoc: (t) => saveDoc(t),
    deleteDoc: (t, id) => deleteDoc(t, id),
    convertDocument: (s, id, t) => convertDocument(s, id, t),
    printDocument: (t, id) => printDocument(t, id),
    closeModal: () => closeModal(),
    logout: () => logout(),
    openCustomerModal: (d) => openCustomerModal(d),
    saveCustomer: (id) => saveCustomer(id),
    deleteCustomer: (id) => deleteCustomer(id),
    openVendorModal: (d) => openVendorModal(d),
    saveVendor: (id) => saveVendor(id),
    deleteVendor: (id) => deleteVendor(id),
    openItemModal: (d) => openItemModal(d),
    saveItem: (id) => saveItem(id),
    deleteItem: (id) => deleteItem(id),
    openBankModal: (d) => openBankModal(d),
    saveBank: (id) => saveBank(id),
    deleteBank: (id) => deleteBank(id),
    openPaymentModal: (t, p) => openPaymentModal(t, p),
    savePayment: (t) => savePayment(t),
    updateRefDocs: (n, p) => updateRefDocs(n, p),
    pickItem: (s) => pickItem(s),
    addRow: (d) => addRow(d),
    updateCalculations: () => updateCalculations(),
    toggleSidebar: () => toggleSidebar(),
    systemReset: () => systemReset(),
    DOC_TYPES: DOC_TYPES
};
Object.assign(window, globalBridge);

let documents = Object.values(DOC_TYPES).reduce((acc, type) => {
    acc[type] = [];
    return acc;
}, {});

async function initializeApp() {
    let cloudConnected = false;
    console.log("ASYNCRIX: Starting initial database load...");
    try {
        cloudConnected = await initDatabase();
        
        // PRIORITY LOADING: Only load essential data for the Dashboard initially
        const essentialTypes = [DOC_TYPES.INVOICES, DOC_TYPES.BILLS, DOC_TYPES.BANKING, DOC_TYPES.PAYMENTS_REC, DOC_TYPES.PAYMENTS_MADE];
        
        const loadPromises = essentialTypes.map(async (type) => {
            const localData = JSON.parse(localStorage.getItem(STORAGE_KEYS[type]) || '[]');
            
            if (cloudConnected) {
                const cloudData = await loadFromCloud(type);
                if (cloudData.length > 0) {
                    documents[type] = cloudData;
                    localStorage.setItem(STORAGE_KEYS[type], JSON.stringify(cloudData));
                } else {
                    documents[type] = localData;
                    if (localData.length > 0) await migrateLocalToCloud({ [type]: localData });
                }
            } else {
                documents[type] = localData;
            }
        });

        await Promise.all(loadPromises);
        
        // 3. Demo Data Fallback for first-time or broken cloud
        const allEmpty = Object.values(documents).every(list => list.length === 0);
        if (allEmpty) {
            console.log("ASYNCRIX: No data found. Pre-populating demo data.");
            documents[DOC_TYPES.BANKING] = [{ id: 'BANK-DEMO', bankName: 'Sample Bank', balance: 50000 }];
            documents[DOC_TYPES.ITEMS] = [{ id: 'ITEM-DEMO', name: 'Premium Service', rate: 1500, tax: 18, type: 'Services', stock: 100 }];
        }

        console.log("ASYNCRIX: Initialization complete. State ready.");
    } catch (error) {
        console.error("ASYNCRIX: Critical Initialization Error:", error);
    } finally {
        // Essential UI boot sequence
        updateTitle(currentView);
        renderContent();
        feather.replace();
        
        // Mobile Responsive Listeners
        window.addEventListener('resize', () => { 
            if(window.innerWidth >= 1024) { 
                const sidebar = document.getElementById('sidebar');
                const overlay = document.getElementById('mobile-overlay');
                if (sidebar) sidebar.classList.add('active'); 
                if (overlay) overlay.classList.remove('active');
            }
        });

        // Run connection test
        checkConnection();
    }
}

async function checkConnection() {
    const indicator = document.getElementById('cloud-status-indicator');
    const text = document.getElementById('cloud-status-text');
    if (!indicator || !text) return;

    try {
        const result = await testConnection();
        if (result.success) {
            indicator.className = 'w-1.5 h-1.5 rounded-full bg-emerald-400 rotate-animation';
            text.textContent = 'Cloud Linked';
            text.className = 'text-[9px] font-bold text-emerald-400 uppercase tracking-widest';
        } else {
            indicator.className = 'w-1.5 h-1.5 rounded-full bg-red-400';
            text.textContent = 'Sync Offline';
            text.className = 'text-[9px] font-bold text-red-400 uppercase tracking-widest';
        }
    } catch {
       indicator.className = 'w-1.5 h-1.5 rounded-full bg-amber-400';
       text.textContent = 'Checking...';
    }
}

function updateTitle(viewId) {
    const titleMap = {
        [DOC_TYPES.DASHBOARD]: 'Dashboard Overview',
        [DOC_TYPES.ITEMS]: 'Inventory Items',
        [DOC_TYPES.BANKING]: 'Banking & Cash',
        [DOC_TYPES.CUSTOMERS]: 'Customer Directory',
        [DOC_TYPES.VENDORS]: 'Vendor Directory',
        [DOC_TYPES.QUOTES]: 'Quotations',
        [DOC_TYPES.SO]: 'Sales Orders',
        [DOC_TYPES.INVOICES]: 'Invoices',
        [DOC_TYPES.PAYMENTS_REC]: 'Payments Received',
        [DOC_TYPES.DC]: 'Delivery Challans',
        [DOC_TYPES.CREDIT_NOTES]: 'Credit Notes',
        [DOC_TYPES.EXPENSES]: 'Expenses',
        [DOC_TYPES.PO]: 'Purchase Orders',
        [DOC_TYPES.BILLS]: 'Bills',
        [DOC_TYPES.PAYMENTS_MADE]: 'Payments Made',
        [DOC_TYPES.VENDOR_CREDITS]: 'Vendor Credits',
        [DOC_TYPES.REPORTS]: 'Financial Reports'
    };
    const titleEl = document.getElementById('view-title');
    if (titleEl) titleEl.textContent = titleMap[viewId] || 'Document Hub';
}

// Initial Boot Sequence (Consolidated)
// Note: initializeApp() is and must be called at the end of the script to ensure all functions are defined.

function switchView(viewId) {
    currentView = viewId;
    document.querySelectorAll('.sidebar-link').forEach(btn => btn.classList.remove('active-tab'));
    const activeTab = document.getElementById(`tab-${viewId}`);
    if (activeTab) activeTab.classList.add('active-tab');

    updateTitle(viewId);
    
    renderContent();
}

async function renderContent() {
    const viewport = document.getElementById('content-viewport');
    if (!viewport) return; // Exit if not on dashboard page
    
    // Show Loading Skeleton or Spinner
    viewport.innerHTML = `<div class="flex items-center justify-center p-20"><div class="animate-spin rounded-full h-8 w-8 border-t-2 border-accent-primary"></div></div>`;
    
    // Ensure data is loaded for the current view (Lazy Loading)
    await fetchCollectionIfNeeded(currentView);
    
    viewport.innerHTML = '';
    
    switch(currentView) {
        case DOC_TYPES.DASHBOARD: renderDashboard(viewport); break;
        case DOC_TYPES.CUSTOMERS: renderCustomers(viewport); break;
        case DOC_TYPES.VENDORS: renderVendors(viewport); break;
        case DOC_TYPES.ITEMS: renderItems(viewport); break;
        case DOC_TYPES.BANKING: renderBanking(viewport); break;
        case DOC_TYPES.REPORTS: renderReports(viewport); break;
        default: renderDocumentList(viewport, currentView); break;
    }
    feather.replace();
}

/**
 * Lazy Loading Utility
 */
async function fetchCollectionIfNeeded(type) {
    if (!DOC_TYPES[Object.keys(DOC_TYPES).find(key => DOC_TYPES[key] === type)]) return;
    if (!STORAGE_KEYS[type]) return;
    
    // Skip if already in memory (except dashboard/reports which need fresh calcs)
    if (documents[type].length > 0 && type !== DOC_TYPES.DASHBOARD && type !== DOC_TYPES.REPORTS) return;

    const localData = JSON.parse(localStorage.getItem(STORAGE_KEYS[type]) || '[]');
    
    try {
        const cloudData = await loadFromCloud(type);
        if (cloudData.length > 0) {
            documents[type] = cloudData;
            localStorage.setItem(STORAGE_KEYS[type], JSON.stringify(cloudData));
        } else {
            documents[type] = localData;
        }
    } catch (error) {
        console.warn(`ASYNCRIX: Lazy load failed for ${type}, using local state.`);
        documents[type] = localData;
    }
}

/**
 * System Reset: Wipes both Local Storage and Google Sheets data
 */
async function systemReset() {
    const confirmation1 = confirm("CRITICAL SECURITY PROTOCOL: You are about to initiate a FULL SYSTEM RESET. All locally stored records will be destroyed. Proceed?");
    if (!confirmation1) return;

    const confirmation2 = confirm("FINAL WARNING: This will also attempt to clear all data in your linked Google Sheet. This action is IRREVERSIBLE. Are you absolutely sure?");
    if (!confirmation2) return;

    showToast("Initiating Full System Wipe...", "warning");

    try {
        // 1. Clear Cloud Data
        const cloudSuccess = await clearAllCloudData();
        
        // 2. Clear Local Storage
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });

        // 3. Reset internal memory
        Object.keys(documents).forEach(type => {
            documents[type] = [];
        });

        if (cloudSuccess) {
            showToast("System Reset Complete. All data wiped.", "success");
        } else {
            showToast("Local data wiped, but Cloud Reset failed. Please check your Google Sheet manually.", "error");
        }

        renderContent();
    } catch (error) {
        console.error("ASYNCRIX: Reset Error:", error);
        showToast("An error occurred during reset.", "error");
    }
}

function renderDashboard(container) {
    // 1. Calculations
    const totalReceivables = documents[DOC_TYPES.INVOICES].reduce((sum, inv) => sum + getDocBalance(inv, DOC_TYPES.INVOICES), 0);
    const totalPayables = documents[DOC_TYPES.BILLS].reduce((sum, bill) => sum + getDocBalance(bill, DOC_TYPES.BILLS), 0);
    const totalCash = documents[DOC_TYPES.BANKING].reduce((sum, bank) => sum + bank.balance, 0);
    
    // Recent Transactions (Last 5 from Invoices, Bills, Payments)
    const recentTxns = [
        ...documents[DOC_TYPES.INVOICES].map(d => ({ ...d, typeLabel: 'Invoice', color: 'text-accent-primary', icon: 'file' })),
        ...documents[DOC_TYPES.BILLS].map(d => ({ ...d, typeLabel: 'Bill', color: 'text-amber-400', icon: 'file-minus' })),
        ...documents[DOC_TYPES.PAYMENTS_REC].map(d => ({ ...d, typeLabel: 'Payment Rec', color: 'text-emerald-400', icon: 'download' })),
        ...documents[DOC_TYPES.PAYMENTS_MADE].map(d => ({ ...d, typeLabel: 'Payment Made', color: 'text-red-400', icon: 'upload' })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

    const mainStats = [
        { label: 'Total Receivables', amount: totalReceivables, color: 'text-emerald-400', icon: 'trending-up', sub: 'Owed by customers' },
        { label: 'Total Payables', amount: totalPayables, color: 'text-red-400', icon: 'trending-down', sub: 'Owed to vendors' },
        { label: 'Cash in Hand', amount: totalCash, color: 'text-accent-primary', icon: 'briefcase', sub: 'Across all accounts' }
    ];

    let html = `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            ${mainStats.map(stat => `
                <div class="glass-panel p-6 bg-white/[0.02] border-white/5 relative overflow-hidden group">
                    <div class="absolute -top-12 -right-12 w-24 h-24 bg-white/5 blur-2xl rounded-full group-hover:bg-accent-primary/5 transition-all"></div>
                    <div class="flex justify-between items-start mb-6 relative z-10">
                        <div class="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 ${stat.color} shadow-inner">
                            <i data-feather="${stat.icon}" class="w-6 h-6"></i>
                        </div>
                        <div class="text-[9px] font-extrabold text-slate-600 uppercase tracking-[0.2em] pt-1">Live Feed</div>
                    </div>
                    <div class="relative z-10">
                        <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">${stat.label}</div>
                        <div class="text-3xl font-bold text-white tracking-tighter">${formatCurrency(stat.amount)}</div>
                        <p class="text-[10px] text-slate-500 mt-3 font-medium flex items-center gap-1.5 uppercase tracking-tighter">
                             <span class="w-1 h-1 rounded-full bg-accent-primary animate-pulse"></span> ${stat.sub}
                        </p>
                    </div>
                </div>
            `).join('')}
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-up" style="animation-delay: 100ms">
            <!-- Recent Transactions Feed -->
            <div class="glass-panel p-6 border-white/5 bg-navy-800/10">
                <div class="flex justify-between items-center mb-8">
                    <h3 class="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                        <i data-feather="clock" class="w-4 h-4 text-accent-primary"></i> Recent Transactions
                    </h3>
                    <button onclick="switchView('${DOC_TYPES.REPORTS}')" class="text-[10px] font-bold text-accent-primary uppercase hover:underline">View All</button>
                </div>
                
                <div class="space-y-4">
                    ${recentTxns.length === 0 ? `
                        <p class="text-slate-600 text-xs italic py-8 text-center">No transactions recorded yet.</p>
                    ` : recentTxns.map(txn => `
                        <div class="flex items-center gap-4 p-3 rounded-xl hover:bg-white/[0.02] transition-colors border border-transparent hover:border-white/5">
                            <div class="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center ${txn.color} border border-white/10">
                                <i data-feather="${txn.icon}" class="w-4 h-4"></i>
                            </div>
                            <div class="flex-1">
                                <div class="text-xs font-bold text-white">${txn.client}</div>
                                <div class="text-[10px] text-slate-500 font-medium uppercase tracking-tight">${txn.typeLabel} • ${txn.id}</div>
                            </div>
                            <div class="text-right">
                                <div class="text-xs font-bold text-white font-mono">${formatCurrency(txn.total)}</div>
                                <div class="text-[9px] text-slate-600">${txn.date}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Quick Links / Shortcuts -->
            <div class="glass-panel p-6 border-white/5 bg-navy-800/10 flex flex-col">
                 <h3 class="text-sm font-bold text-white uppercase tracking-widest mb-8 flex items-center gap-2">
                    <i data-feather="zap" class="w-4 h-4 text-amber-400"></i> Quick Actions
                </h3>
                <div class="grid grid-cols-2 gap-4">
                    <button onclick="openCreateModal('${DOC_TYPES.QUOTES}')" class="flex flex-col items-center justify-center p-6 rounded-2xl bg-accent-primary/5 border border-accent-primary/10 hover:bg-accent-primary/10 transition-all group">
                        <i data-feather="file-text" class="w-6 h-6 text-accent-primary mb-3"></i>
                        <span class="text-[10px] font-bold text-white uppercase tracking-widest">New Quote</span>
                    </button>
                    <button onclick="openCreateModal('${DOC_TYPES.INVOICES}')" class="flex flex-col items-center justify-center p-6 rounded-2xl bg-emerald-400/5 border border-emerald-400/10 hover:bg-emerald-400/10 transition-all group">
                        <i data-feather="file" class="w-6 h-6 text-emerald-400 mb-3"></i>
                        <span class="text-[10px] font-bold text-white uppercase tracking-widest">New Invoice</span>
                    </button>
                    <button onclick="openCreateModal('${DOC_TYPES.BILLS}')" class="flex flex-col items-center justify-center p-6 rounded-2xl bg-amber-400/5 border border-amber-400/10 hover:bg-amber-400/10 transition-all group">
                        <i data-feather="file-minus" class="w-6 h-6 text-amber-400 mb-3"></i>
                        <span class="text-[10px] font-bold text-white uppercase tracking-widest">New Bill</span>
                    </button>
                    <button onclick="openCustomerModal()" class="flex flex-col items-center justify-center p-6 rounded-2xl bg-purple-400/5 border border-purple-400/10 hover:bg-purple-400/10 transition-all group">
                        <i data-feather="user-plus" class="w-6 h-6 text-purple-400 mb-3"></i>
                        <span class="text-[10px] font-bold text-white uppercase tracking-widest">New Customer</span>
                    </button>
                </div>
                <div class="mt-auto pt-8">
                    <div class="p-4 bg-white/[0.02] rounded-xl border border-white/5">
                        <div class="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2 text-center">System Integration Notice</div>
                        <p class="text-[10px] text-slate-600 text-center leading-relaxed">Inventory and Banking are now live. All transactions automatically affect your reports and dashboard metrics.</p>
                    </div>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = html;
    feather.replace();
}

// Rendering functions handled in consolidated block below.

function renderItems(container) {
    const list = documents[DOC_TYPES.ITEMS];
    
    let html = `
        <div class="flex justify-between items-center mb-8 animate-up">
            <div>
                <h3 class="text-2xl font-bold text-white tracking-tight">Items</h3>
                <p class="text-slate-500 text-sm mt-1">Manage your goods and services</p>
            </div>
            <button onclick="openItemModal()" class="btn-primary">
                <i data-feather="plus" class="w-4 h-4"></i> Add Item
            </button>
        </div>

        <div class="glass-panel overflow-hidden border-white/5 animate-up">
            <div class="overflow-x-auto">
                <table class="responsive-table w-full">
                    <thead class="bg-white/[0.02] border-b border-white/5">
                        <tr class="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                            <th class="px-4 py-3 text-left">Item Name</th>
                            <th class="px-4 py-3 text-left">Type</th>
                            <th class="px-4 py-3 text-right">Rate</th>
                            <th class="px-4 py-3 text-right">Stock</th>
                            <th class="px-4 py-3 text-right">Tax (%)</th>
                            <th class="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-white/5">
                        ${list.length === 0 ? `
                            <tr>
                                <td colspan="5" class="px-6 py-20 text-center text-slate-500">
                                    <div class="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <i data-feather="box" class="w-8 h-8 opacity-20"></i>
                                    </div>
                                    <p class="font-bold text-lg">No items found</p>
                                    <p class="text-xs mt-1">Click "Add Item" to start your inventory.</p>
                                </td>
                            </tr>
                        ` : list.map(item => `
                            <tr class="hover:bg-white/[0.01] transition-colors group">
                                <td class="px-6 py-4" data-label="Item Name">
                                    <div class="text-white font-semibold">${item.name}</div>
                                    <div class="text-[10px] text-slate-500">${item.description || 'No description'}</div>
                                </td>
                                <td class="px-6 py-4" data-label="Type">
                                    <span class="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${item.type === 'Goods' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-amber-400/10 text-amber-400'}">
                                        ${item.type}
                                    </span>
                                </td>
                                <td class="px-6 py-4 text-right text-white font-bold" data-label="Rate">${formatCurrency(item.rate)}</td>
                                <td class="px-6 py-4 text-right text-accent-primary font-bold" data-label="Stock">${item.stock || 0}</td>
                                <td class="px-6 py-4 text-right text-slate-400" data-label="Tax">${item.tax}%</td>
                                <td class="px-6 py-4 text-right actions-cell">
                                    <div class="flex justify-end gap-1">
                                        <button onclick="openItemModal(${JSON.stringify(item).replace(/"/g, '&quot;')})" class="p-2 text-slate-500 hover:text-accent-primary transition-colors">
                                            <i data-feather="edit-2" class="w-4 h-4"></i>
                                        </button>
                                        <button onclick="deleteDoc('${DOC_TYPES.ITEMS}', '${item.id}')" class="p-2 text-slate-500 hover:text-red-400 transition-colors">
                                            <i data-feather="trash-2" class="w-4 h-4"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

function renderBanking(container) {
    const list = documents[DOC_TYPES.BANKING];
    
    let html = `
        <div class="flex justify-between items-center mb-8 animate-up">
            <div>
                <h3 class="text-2xl font-bold text-white tracking-tight">Banking</h3>
                <p class="text-slate-500 text-sm mt-1">Manage your bank accounts and cash flow</p>
            </div>
            <button onclick="openBankModal()" class="btn-primary">
                <i data-feather="plus" class="w-4 h-4"></i> Add Account
            </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-up">
            ${list.length === 0 ? `
                <div class="col-span-3 glass-panel p-20 text-center border-dashed border-2 border-white/5">
                    <div class="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i data-feather="briefcase" class="w-8 h-8 opacity-20"></i>
                    </div>
                    <p class="text-slate-400 font-bold text-lg">No bank accounts linked</p>
                    <p class="text-slate-500 text-sm mt-2">Connect your business bank accounts to track transactions.</p>
                </div>
            ` : list.map(bank => `
                <div class="glass-panel p-6 border-white/5 hover:border-accent-primary/30 transition-all group">
                    <div class="flex justify-between items-start mb-6">
                        <div class="w-12 h-12 bg-accent-primary/10 rounded-xl flex items-center justify-center text-accent-primary border border-accent-primary/20">
                            <i data-feather="home" class="w-6 h-6"></i>
                        </div>
                        <div class="flex gap-1">
                            <button onclick="openBankModal(${JSON.stringify(bank).replace(/"/g, '&quot;')})" class="p-1.5 text-slate-500 hover:text-white"><i data-feather="edit-2" class="w-3.5 h-3.5"></i></button>
                            <button onclick="deleteDoc('${DOC_TYPES.BANKING}', '${bank.id}')" class="p-1.5 text-slate-500 hover:text-red-400"><i data-feather="trash-2" class="w-3.5 h-3.5"></i></button>
                        </div>
                    </div>
                    <div class="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">${bank.bankName}</div>
                    <div class="text-xl font-bold text-white mb-4 tracking-tight">${bank.accountName}</div>
                    <div class="flex justify-between items-end">
                        <div class="text-[10px] font-mono text-slate-400">${bank.accountNumber.replace(/.(?=.{4})/g, '*')}</div>
                        <div class="text-right">
                            <div class="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Current Balance</div>
                            <div class="text-lg font-bold text-accent-primary">${formatCurrency(bank.balance)}</div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    container.innerHTML = html;
}

function renderReports(container, subReport = null) {
    if (subReport) {
        switch(subReport) {
            case 'profit-loss': renderProfitLoss(container); break;
            case 'sales-by-customer': renderSalesByCustomer(container); break;
            case 'inventory-summary': renderInventorySummary(container); break;
        }
        return;
    }

    let html = `
        <div class="mb-8 animate-up">
            <h3 class="text-2xl font-bold text-white tracking-tight">Reports</h3>
            <p class="text-slate-500 text-sm mt-1">Insights into your business performance</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-up">
            <div onclick="renderReports(document.getElementById('content-viewport'), 'profit-loss')" class="glass-panel p-6 border-white/5 hover:border-accent-primary/50 transition-all cursor-pointer group">
                <div class="w-10 h-10 bg-emerald-400/10 rounded-lg flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
                    <i data-feather="trending-up" class="w-5 h-5"></i>
                </div>
                <h4 class="text-white font-bold mb-2">Profit and Loss</h4>
                <p class="text-slate-500 text-xs">A summary of your revenue, costs, and expenses.</p>
            </div>
            
            <div onclick="renderReports(document.getElementById('content-viewport'), 'sales-by-customer')" class="glass-panel p-6 border-white/5 hover:border-accent-primary/50 transition-all cursor-pointer group">
                <div class="w-10 h-10 bg-accent-primary/10 rounded-lg flex items-center justify-center text-accent-primary mb-4 group-hover:scale-110 transition-transform">
                    <i data-feather="pie-chart" class="w-5 h-5"></i>
                </div>
                <h4 class="text-white font-bold mb-2">Sales by Customer</h4>
                <p class="text-slate-500 text-xs">Breakdown of sales for each customer over time.</p>
            </div>
            
            <div onclick="renderReports(document.getElementById('content-viewport'), 'inventory-summary')" class="glass-panel p-6 border-white/5 hover:border-accent-primary/50 transition-all cursor-pointer group">
                <div class="w-10 h-10 bg-amber-400/10 rounded-lg flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
                    <i data-feather="archive" class="w-5 h-5"></i>
                </div>
                <h4 class="text-white font-bold mb-2">Inventory Summary</h4>
                <p class="text-slate-500 text-xs">Summary of your items, rates, and tax classes.</p>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    feather.replace();
}

function renderProfitLoss(container) {
    const totalInvoices = documents[DOC_TYPES.INVOICES].reduce((sum, inv) => sum + inv.total, 0);
    const totalCreditNotes = documents[DOC_TYPES.CREDIT_NOTES].reduce((sum, cn) => sum + cn.total, 0);
    const netSales = totalInvoices - totalCreditNotes;

    const totalBills = documents[DOC_TYPES.BILLS].reduce((sum, bill) => sum + bill.total, 0);
    const totalVendorCredits = documents[DOC_TYPES.VENDOR_CREDITS].reduce((sum, vc) => sum + vc.total, 0);
    const netPurchases = totalBills - totalVendorCredits;

    const expenses = documents[DOC_TYPES.EXPENSES] || [];
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.total, 0);
    
    const totalOutflow = netPurchases + totalExpenses;
    const netProfit = netSales - totalOutflow;

    let html = `
        <div class="mb-8 animate-up">
            <button onclick="renderReports(document.getElementById('content-viewport'))" class="text-accent-primary text-xs font-bold uppercase tracking-widest hover:underline mb-4 flex items-center gap-1">
                <i data-feather="arrow-left" class="w-3 h-3"></i> Back to Reports
            </button>
            <h3 class="text-2xl font-bold text-white tracking-tight">Profit and Loss</h3>
            <p class="text-slate-500 text-sm mt-1">Financial summary of revenue and costs</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 animate-up">
            <div class="glass-panel p-6 border-emerald-400/20 bg-emerald-400/5">
                <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Net Operating Income</div>
                <div class="text-2xl font-bold text-emerald-400">${formatCurrency(netSales)}</div>
            </div>
            <div class="glass-panel p-6 border-red-400/20 bg-red-400/5">
                <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Operating Expenses</div>
                <div class="text-2xl font-bold text-red-400">${formatCurrency(totalOutflow)}</div>
            </div>
            <div class="glass-panel p-6 border-accent-primary/20 bg-accent-primary/5">
                <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Net Profit/Loss</div>
                <div class="text-2xl font-bold text-white">${formatCurrency(netProfit)}</div>
            </div>
        </div>

        <div class="glass-panel p-8 border-white/5 animate-up" style="animation-delay: 100ms">
            <h4 class="text-white font-bold text-sm uppercase tracking-widest mb-8 border-b border-white/5 pb-4">Detailed Breakdown</h4>
            <div class="space-y-6">
                <div class="flex justify-between items-center text-sm">
                    <span class="text-slate-400">Net Sales Income (Invoices - Credits)</span>
                    <span class="text-white font-mono font-bold">${formatCurrency(netSales)}</span>
                </div>
                <div class="flex justify-between items-center text-sm">
                    <span class="text-slate-400">Net Cost of Goods (Bills - Credits)</span>
                    <span class="text-white font-mono font-bold">(${formatCurrency(netPurchases)})</span>
                </div>
                 <div class="flex justify-between items-center text-sm">
                    <span class="text-slate-400">Other Expenses</span>
                    <span class="text-white font-mono font-bold">(${formatCurrency(totalExpenses)})</span>
                </div>
                <div class="border-t border-white/10 pt-4 flex justify-between items-center">
                    <span class="text-white font-bold uppercase text-[10px] tracking-widest">Gross Profit</span>
                    <span class="text-white font-mono font-bold text-xl">${formatCurrency(netProfit)}</span>
                </div>
            </div>
        </div>
    `;
    container.innerHTML = html;
    feather.replace();
}

function renderSalesByCustomer(container) {
    const customerSales = {};
    documents[DOC_TYPES.INVOICES].forEach(inv => {
        customerSales[inv.client] = (customerSales[inv.client] || 0) + inv.total;
    });
    documents[DOC_TYPES.CREDIT_NOTES].forEach(cn => {
        customerSales[cn.client] = (customerSales[cn.client] || 0) - cn.total;
    });

    const sortedCustomers = Object.entries(customerSales).sort((a, b) => b[1] - a[1]);

    let html = `
        <div class="mb-8 animate-up">
            <button onclick="renderReports(document.getElementById('content-viewport'))" class="text-accent-primary text-xs font-bold uppercase tracking-widest hover:underline mb-4 flex items-center gap-1">
                <i data-feather="arrow-left" class="w-3 h-3"></i> Back to Reports
            </button>
            <h3 class="text-2xl font-bold text-white tracking-tight">Sales by Customer</h3>
            <p class="text-slate-500 text-sm mt-1">Breakdown of revenue generated by each customer</p>
        </div>

        <div class="glass-panel overflow-hidden border-white/5 animate-up">
            <table class="w-full">
                <thead class="bg-white/[0.02] border-b border-white/5">
                    <tr class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        <th class="px-6 py-4 text-left">Customer Name</th>
                        <th class="px-6 py-4 text-right">Total Revenue</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-white/5 text-sm">
                    ${sortedCustomers.length === 0 ? `
                        <tr><td colspan="2" class="px-6 py-12 text-center text-slate-500">No sales data available.</td></tr>
                    ` : sortedCustomers.map(([name, amount]) => `
                        <tr class="hover:bg-white/[0.01] transition-colors">
                            <td class="px-6 py-4 text-white font-medium">${name}</td>
                            <td class="px-6 py-4 text-right text-white font-mono font-bold">${formatCurrency(amount)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    container.innerHTML = html;
    feather.replace();
}

function renderInventorySummary(container) {
    const items = documents[DOC_TYPES.ITEMS];

    let html = `
        <div class="mb-8 animate-up">
            <button onclick="renderReports(document.getElementById('content-viewport'))" class="text-accent-primary text-xs font-bold uppercase tracking-widest hover:underline mb-4 flex items-center gap-1">
                <i data-feather="arrow-left" class="w-3 h-3"></i> Back to Reports
            </button>
            <h3 class="text-2xl font-bold text-white tracking-tight">Inventory Summary</h3>
            <p class="text-slate-500 text-sm mt-1">Listing of products, services, and pricing details</p>
        </div>

        <div class="glass-panel overflow-hidden border-white/5 animate-up">
            <table class="w-full">
                <thead class="bg-white/[0.02] border-b border-white/5">
                    <tr class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        <th class="px-6 py-4 text-left">Item Name</th>
                        <th class="px-6 py-4 text-left">Type</th>
                        <th class="px-6 py-4 text-right">Stock</th>
                        <th class="px-6 py-4 text-right">Standard Rate</th>
                        <th class="px-6 py-4 text-right">Default Tax %</th>
                        <th class="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-white/5 text-sm">
                    ${items.length === 0 ? `
                        <tr><td colspan="4" class="px-6 py-12 text-center text-slate-500">No items in inventory.</td></tr>
                    ` : items.map(item => `
                        <tr class="hover:bg-white/[0.01] transition-colors">
                            <td class="px-6 py-4 text-white font-medium">${item.name}</td>
                            <td class="px-6 py-4 text-slate-400 capitalize">${item.type}</td>
                            <td class="px-6 py-4 text-right text-accent-primary font-bold">${item.stock || 0}</td>
                            <td class="px-6 py-4 text-right text-white font-mono font-bold">${formatCurrency(item.rate)}</td>
                            <td class="px-6 py-4 text-right text-accent-secondary font-bold">${item.tax}%</td>
                            <td class="px-6 py-4 text-right actions-cell">
                                <div class="flex justify-end gap-1">
                                    <button onclick="openItemModal(${JSON.stringify(item).replace(/"/g, '&quot;')})" class="p-2 text-slate-500 hover:text-accent-primary transition-colors">
                                        <i data-feather="edit-2" class="w-4 h-4"></i>
                                    </button>
                                    <button onclick="deleteItem('${item.id}')" class="p-2 text-slate-500 hover:text-red-400 transition-colors">
                                        <i data-feather="trash-2" class="w-4 h-4"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    container.innerHTML = html;
    feather.replace();
}

function renderCustomers(container) {
    const list = documents[DOC_TYPES.CUSTOMERS];
    renderContactList(container, list, 'Customers', 'user-plus', 'openCustomerModal', 'deleteCustomer', DOC_TYPES.CUSTOMERS);
}

function renderVendors(container) {
    const list = documents[DOC_TYPES.VENDORS];
    renderContactList(container, list, 'Vendors', 'user-check', 'openVendorModal', 'deleteVendor', DOC_TYPES.VENDORS);
}

function renderContactList(container, list, title, icon, modalFn, deleteFn, type) {
    const isVendor = type === DOC_TYPES.VENDORS;
    const accentColor = isVendor ? 'accent-secondary' : 'accent-primary';

    let html = `
        <div class="flex justify-between items-center mb-8 animate-up">
            <div>
                <h3 class="text-2xl font-bold text-white tracking-tight">${title}</h3>
                <p class="text-slate-500 text-sm mt-1">Manage your business relationships</p>
            </div>
            <button onclick="${modalFn}()" class="btn-primary">
                <i data-feather="${icon}" class="w-4 h-4"></i> Add ${title.slice(0, -1)}
            </button>
        </div>

        <div class="glass-panel overflow-hidden border-white/5 animate-up">
            <div class="overflow-x-auto">
                <table class="responsive-table w-full">
                    <thead class="bg-white/[0.02] border-b border-white/5">
                        <tr class="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                            <th class="px-4 py-3 text-left">Name</th>
                            <th class="px-4 py-3 text-left">Company</th>
                            <th class="px-4 py-3 text-left">Contact Info</th>
                            <th class="px-4 py-3 text-right">GST Details</th>
                            <th class="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-white/5">
                        ${list.length === 0 ? `
                            <tr>
                                <td colspan="5" class="px-6 py-24 text-center">
                                    <div class="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/5 shadow-inner">
                                        <i data-feather="${isVendor ? 'briefcase' : 'users'}" class="w-10 h-10 text-slate-700"></i>
                                    </div>
                                    <h4 class="text-slate-900 font-bold text-xl tracking-tight">Empty Directory</h4>
                                    <p class="text-slate-500 text-sm mt-2 max-w-xs mx-auto">Your ${title.toLowerCase()} list is currently empty. Record your first contact to begin.</p>
                                    <button onclick="${modalFn}()" class="mt-6 text-accent-primary text-[10px] font-bold uppercase tracking-[0.2em] hover:text-slate-900 transition-colors border-b border-accent-primary/20 pb-1">Create Entry Now</button>
                                </td>
                            </tr>
                        ` : list.map(item => `
                            <tr class="hover:bg-white/[0.01] transition-colors group">
                                <td class="px-6 py-4" data-label="Name">
                                    <div class="flex items-center gap-3">
                                        <div class="w-8 h-8 rounded-full bg-${accentColor}/10 flex items-center justify-center text-${accentColor} border border-${accentColor}/20 text-xs font-bold">
                                            ${item.displayName.charAt(0)}
                                        </div>
                                        <div>
                                            <div class="text-slate-800 font-semibold">${item.displayName}</div>
                                            <div class="text-[9px] text-slate-500 uppercase tracking-widest font-bold">${item.type}</div>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-6 py-4 text-slate-300" data-label="Company">${item.company || '-'}</td>
                                <td class="px-6 py-4" data-label="Contact">
                                    <div class="text-slate-800 text-sm">${item.email || '-'}</div>
                                    <div class="text-slate-500 text-xs">${item.mobile || item.phone || '-'}</div>
                                </td>
                                <td class="px-6 py-4 text-right" data-label="GST">
                                    <div class="text-${accentColor} text-[10px] font-bold uppercase tracking-wider">${item.gstTreatment}</div>
                                    <div class="text-slate-800 font-mono text-xs">${item.gstin || '-'}</div>
                                </td>
                                <td class="px-6 py-4 text-right actions-cell">
                                    <div class="flex justify-end gap-1">
                                        <button onclick="${modalFn}(${JSON.stringify(item).replace(/"/g, '&quot;')})" class="p-2 text-slate-500 hover:text-accent-primary transition-colors">
                                            <i data-feather="edit-2" class="w-4 h-4"></i>
                                        </button>
                                        <button onclick="${deleteFn}('${item.id}')" class="p-2 text-slate-500 hover:text-red-400 transition-colors">
                                            <i data-feather="trash-2" class="w-4 h-4"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    container.innerHTML = html;
}

function renderDocumentList(container, type) {
    const list = documents[type];
    const labels = {
        [DOC_TYPES.QUOTES]: 'Quote',
        [DOC_TYPES.SO]: 'Sales Order',
        [DOC_TYPES.DC]: 'Delivery Challan',
        [DOC_TYPES.PO]: 'Purchase Order',
        [DOC_TYPES.INVOICES]: 'Invoice',
        [DOC_TYPES.BILLS]: 'Bill',
        [DOC_TYPES.EXPENSES]: 'Expense',
        [DOC_TYPES.CREDIT_NOTES]: 'Credit Note',
        [DOC_TYPES.VENDOR_CREDITS]: 'Vendor Credit',
        [DOC_TYPES.PAYMENTS_REC]: 'Payment Received',
        [DOC_TYPES.PAYMENTS_MADE]: 'Payment Made'
    };

    let html = `
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
                <h3 class="text-2xl font-bold text-white tracking-tight">${labels[type]}s</h3>
                <p class="text-slate-500 text-xs font-medium uppercase tracking-widest mt-1">Total count: ${list.length}</p>
            </div>
            <button onclick="openCreateModal('${type}')" class="btn-primary w-full sm:w-auto">
                <i data-feather="plus" class="w-4 h-4"></i> New ${labels[type]}
            </button>
        </div>
    `;

    if (list.length === 0) {
        html += `
            <div class="glass-panel p-24 text-center flex flex-col items-center animate-up border-white/5 bg-white/[0.01]">
                <div class="w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-full flex items-center justify-center text-slate-800 mb-8 border border-white/5 relative">
                    <div class="absolute inset-0 bg-accent-primary/5 blur-xl rounded-full"></div>
                    <i data-feather="inbox" class="w-12 h-12 relative z-10"></i>
                </div>
                <h4 class="text-slate-900 font-bold text-2xl tracking-tight">No ${labels[type]}s detected</h4>
                <p class="text-slate-500 text-sm mt-3 max-w-xs mx-auto font-medium">Capture your business transactions to populate this view. Your system is ready for entry.</p>
                <button onclick="openCreateModal('${type}')" class="mt-10 btn-primary">
                    <i data-feather="plus" class="w-4 h-4"></i> Initialize ${labels[type]}
                </button>
            </div>
        `;
    } else {
        html += `
            <div class="glass-panel overflow-hidden border-white/5 bg-navy-800/10 backdrop-blur-sm animate-up">
                <table class="responsive-table">
                    <thead>
                        <tr class="bg-white/[0.02] text-slate-500 text-[9px] uppercase tracking-widest font-bold border-b border-white/5">
                            <th class="px-4 py-3">ID</th>
                            <th class="px-4 py-3">Client/Entity</th>
                            <th class="px-4 py-3">Date</th>
                            <th class="px-4 py-3">Total</th>
                            <th class="px-4 py-3">Balance Due</th>
                            <th class="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-white/[0.03]">
        `;

        list.forEach(doc => {
            html += `
                <tr class="hover:bg-white/[0.02] transition-colors group">
                    <td class="px-6 py-4 font-mono text-sm text-accent-primary" data-label="ID">${doc.id}</td>
                    <td class="px-6 py-4 text-slate-800 font-semibold" data-label="Client">${doc.client}</td>
                    <td class="px-6 py-4 text-slate-400 text-sm" data-label="Date">${doc.date}</td>
                    <td class="px-6 py-4 text-slate-500 text-sm" data-label="Total">${formatCurrency(doc.total)}</td>
                    <td class="px-6 py-4 text-slate-900 font-bold" data-label="Balance">${formatCurrency(getDocBalance(doc, type))}</td>
                    <td class="px-6 py-4 text-right space-x-1 flex items-center justify-end actions-cell" data-label="Control">
                        ${renderConversionButtons(doc, type)}
                        <button onclick="printDocument('${type}', '${doc.id}')" class="p-2 text-slate-500 hover:text-accent-primary transition-colors" title="Print">
                            <i data-feather="printer" class="w-4 h-4"></i>
                        </button>
                        <button onclick="deleteDoc('${type}', '${doc.id}')" class="p-2 text-slate-500 hover:text-red-400 transition-colors" title="Delete">
                            <i data-feather="trash-2" class="w-4 h-4"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        html += `</tbody></table></div>`;
    }

    container.innerHTML = html;
}

function renderConversionButtons(doc, type) {
    if (type === DOC_TYPES.QUOTES) {
        return `<button onclick="convertDocument('${type}', '${doc.id}', '${DOC_TYPES.SO}')" class="px-3 py-1 bg-accent-secondary/10 border border-accent-secondary/20 text-accent-secondary text-[9px] font-bold uppercase rounded-md hover:bg-accent-secondary/20 transition-all mr-2">To Sales Order</button>`;
    } else if (type === DOC_TYPES.SO) {
        return `
            <button onclick="convertDocument('${type}', '${doc.id}', '${DOC_TYPES.DC}')" class="px-3 py-1 bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 text-[9px] font-bold uppercase rounded-md hover:bg-emerald-400/20 transition-all mr-2">To Chalan</button>
            <button onclick="convertDocument('${type}', '${doc.id}', '${DOC_TYPES.INVOICES}')" class="px-3 py-1 bg-accent-primary/10 border border-accent-primary/20 text-accent-primary text-[9px] font-bold uppercase rounded-md hover:bg-accent-primary/20 transition-all mr-2">To Invoice</button>
            <button onclick="convertDocument('${type}', '${doc.id}', '${DOC_TYPES.PO}')" class="px-3 py-1 bg-amber-400/10 border border-amber-400/20 text-amber-400 text-[9px] font-bold uppercase rounded-md hover:bg-amber-400/20 transition-all mr-2">To Purchase</button>
        `;
    } else if (type === DOC_TYPES.PO) {
        return `<button onclick="convertDocument('${type}', '${doc.id}', '${DOC_TYPES.BILLS}')" class="px-3 py-1 bg-amber-400/10 border border-amber-400/20 text-amber-400 text-[9px] font-bold uppercase rounded-md hover:bg-amber-400/20 transition-all mr-2">To Bill</button>`;
    } else if (type === DOC_TYPES.INVOICES) {
        const balance = getDocBalance(doc, type);
        return `
            <button onclick="openPaymentModal('${DOC_TYPES.PAYMENTS_REC}', { entityId: '${doc.client}', refDoc: '${doc.id}', amount: ${balance} })" class="px-3 py-1 bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 text-[9px] font-bold uppercase rounded-md hover:bg-emerald-400/20 transition-all mr-2">Record Payment</button>
            <button onclick="convertDocument('${type}', '${doc.id}', '${DOC_TYPES.CREDIT_NOTES}')" class="px-3 py-1 bg-red-400/10 border border-red-400/20 text-red-400 text-[9px] font-bold uppercase rounded-md hover:bg-red-400/20 transition-all mr-2">To Credit Note</button>
        `;
    } else if (type === DOC_TYPES.BILLS) {
        const balance = getDocBalance(doc, type);
        return `
            <button onclick="openPaymentModal('${DOC_TYPES.PAYMENTS_MADE}', { entityId: '${doc.client}', refDoc: '${doc.id}', amount: ${balance} })" class="px-3 py-1 bg-amber-400/10 border border-amber-400/20 text-amber-400 text-[9px] font-bold uppercase rounded-md hover:bg-amber-400/20 transition-all mr-2">Record Payment</button>
            <button onclick="convertDocument('${type}', '${doc.id}', '${DOC_TYPES.VENDOR_CREDITS}')" class="px-3 py-1 bg-red-400/10 border border-red-400/20 text-red-400 text-[9px] font-bold uppercase rounded-md hover:bg-red-400/20 transition-all mr-2">To Vendor Credit</button>
        `;
    }
    return '';
}

// --- CRUD & Flow Logic ---

function openCreateModal(type, prefillData = null) {
    if (type === DOC_TYPES.PAYMENTS_REC || type === DOC_TYPES.PAYMENTS_MADE) {
        return openPaymentModal(type, prefillData);
    }
    const modal = document.getElementById('form-modal');
    const labels = {
        [DOC_TYPES.QUOTES]: 'Quote',
        [DOC_TYPES.SO]: 'Sales Order',
        [DOC_TYPES.DC]: 'Delivery Challan',
        [DOC_TYPES.PO]: 'Purchase Order',
        [DOC_TYPES.INVOICES]: 'Invoice',
        [DOC_TYPES.BILLS]: 'Bill',
        [DOC_TYPES.EXPENSES]: 'Expense',
        [DOC_TYPES.CREDIT_NOTES]: 'Credit Note',
        [DOC_TYPES.VENDOR_CREDITS]: 'Vendor Credit',
        [DOC_TYPES.PAYMENTS_REC]: 'Payment Received',
        [DOC_TYPES.PAYMENTS_MADE]: 'Payment Made'
    };

    const isPurchase = [DOC_TYPES.PO, DOC_TYPES.BILLS, DOC_TYPES.PAYMENTS_MADE, DOC_TYPES.EXPENSES, DOC_TYPES.VENDOR_CREDITS].includes(type);
    const entityLabel = isPurchase ? 'Vendor' : 'Customer';
    const entities = isPurchase ? documents[DOC_TYPES.VENDORS] : documents[DOC_TYPES.CUSTOMERS];

    document.getElementById('modal-title').textContent = `Create New ${labels[type]}`;
    
    const container = document.getElementById('modal-form-container');
    const items = prefillData && prefillData.lineItems ? prefillData.lineItems : [{ name: '', qty: 1, rate: 0, tax: 0 }];
    
    container.innerHTML = `
        <div class="mb-6 p-4 bg-accent-primary/5 border border-accent-primary/10 rounded-lg flex items-center gap-4 animate-up">
            <div class="flex-1">
                <label class="block text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">Search ${entityLabel}</label>
                <select id="doc-entity-select" class="form-input" onchange="prefillFromEntity(this.value, ${isPurchase})">
                    <option value="">-- Select Existing ${entityLabel} --</option>
                    ${entities.map(e => `<option value="${e.id}">${e.displayName} (${e.company || 'Individual'})</option>`).join('')}
                </select>
            </div>
            <div class="pt-6">
                <span class="text-slate-500 text-xs font-bold uppercase tracking-widest">OR</span>
            </div>
            <div class="flex-1 pt-6">
                <button onclick="${isPurchase ? 'openVendorModal()' : 'openCustomerModal()'}" class="text-accent-primary text-[10px] font-bold uppercase tracking-widest hover:underline flex items-center gap-1">
                    <i data-feather="plus" class="w-3 h-3"></i> Add New ${entityLabel}
                </button>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <!-- Billing Details -->
            <div class="glass-panel p-6 bg-white/[0.02] border-white/10">
                <h4 class="text-white font-bold text-sm uppercase tracking-wide mb-4 flex items-center gap-2">
                    <i data-feather="file-text" class="w-4 h-4 text-accent-primary"></i> ${isPurchase ? 'Billing From' : 'Billing To'}
                </h4>
                <div class="space-y-4">
                    <input type="text" id="bill-company" class="form-input" placeholder="Company Name" value="${prefillData && prefillData.billing ? prefillData.billing.company : (prefillData ? prefillData.client : '')}" required>
                    <textarea id="bill-address" class="form-input h-20" placeholder="Full Billing Address">${prefillData && prefillData.billing ? prefillData.billing.address : ''}</textarea>
                    <div class="grid grid-cols-2 gap-4">
                        <input type="text" id="bill-gst" class="form-input" placeholder="GST Number" value="${prefillData && prefillData.billing ? prefillData.billing.gst : ''}">
                        <input type="text" id="bill-mobile" class="form-input" placeholder="Mobile Number" value="${prefillData && prefillData.billing ? prefillData.billing.mobile : ''}">
                    </div>
                </div>
            </div>

            <!-- Shipping Details -->
            <div class="glass-panel p-6 bg-white/[0.01] border-white/5">
                <div class="flex justify-between items-center mb-4">
                    <h4 class="text-white font-bold text-sm uppercase tracking-wide flex items-center gap-2">
                        <i data-feather="truck" class="w-4 h-4 text-accent-secondary"></i> Shipping To
                    </h4>
                    <button onclick="copyBillingToShipping()" class="text-[9px] font-bold text-slate-500 uppercase tracking-widest hover:text-white transition-colors">Same as Billing</button>
                </div>
                <div class="space-y-4">
                    <input type="text" id="ship-company" class="form-input" placeholder="Company Name" value="${prefillData && prefillData.shipping ? prefillData.shipping.company : ''}">
                    <textarea id="ship-address" class="form-input h-20" placeholder="Full Shipping Address">${prefillData && prefillData.shipping ? prefillData.shipping.address : ''}</textarea>
                    <div class="grid grid-cols-2 gap-4">
                        <input type="text" id="ship-gst" class="form-input" placeholder="GST Number" value="${prefillData && prefillData.shipping ? prefillData.shipping.gst : ''}">
                        <input type="text" id="ship-mobile" class="form-input" placeholder="Mobile Number" value="${prefillData && prefillData.shipping ? prefillData.shipping.mobile : ''}">
                    </div>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-10">
            <div>
                <label class="block text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">Transaction Date</label>
                <input type="date" id="doc-date" class="form-input" value="${new Date().toISOString().split('T')[0]}" required>
            </div>
            <div>
                <label class="block text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">Source Reference</label>
                <input type="text" id="doc-ref" class="form-input" placeholder="Enter Reference (e.g. PO #123)" value="${prefillData ? prefillData.ref : ''}">
            </div>
        </div>

        <div class="mb-10">
            <div class="flex justify-between items-center mb-4">
                <h4 class="text-white font-bold text-sm uppercase tracking-wide">Detailed Line Items</h4>
                <button onclick="addRow()" class="text-[10px] font-bold text-accent-primary uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2">
                    <i data-feather="plus-circle" class="w-3 h-3"></i> Add New Row
                </button>
            </div>
            <div class="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
                <table class="w-full min-w-[600px] border-collapse" id="items-table">
                    <thead>
                        <tr class="text-[10px] uppercase text-slate-500 font-bold border-b border-white/5">
                            <th class="pb-3 pr-4 text-left">Description</th>
                            <th class="pb-3 px-4 text-center w-24">Qty</th>
                            <th class="pb-3 px-4 text-right w-32">Rate</th>
                            <th class="pb-3 px-4 text-right w-24">Tax %</th>
                            <th class="pb-3 pl-4 text-right w-32">Amount</th>
                            <th class="pb-3 pl-4 w-10"></th>
                        </tr>
                    </thead>
                    <tbody id="line-items-body" class="divide-y divide-white/5"></tbody>
                </table>
            </div>
        </div>

        <div class="flex flex-col md:flex-row gap-8 mt-12 pt-8 border-t border-white/5">
             <div class="flex-1">
                <label class="block text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">Internal Note / Warranty</label>
                <textarea id="doc-note" class="form-input h-24 text-xs italic bg-white/[0.01] border-dashed" placeholder="Add any terms, conditions or notes...">${prefillData ? (prefillData.note || '') : ''}</textarea>
            </div>
            <div class="w-full md:w-80 glass-panel p-6 bg-white/[0.02]">
                <div class="flex justify-between text-xs font-bold uppercase tracking-wider mb-4">
                    <span class="text-slate-500">Subtotal</span>
                    <span class="text-white" id="summary-subtotal">₹0.00</span>
                </div>
                <div class="flex justify-between text-xs font-bold uppercase tracking-wider mb-6">
                    <span class="text-slate-500">Tax Payable</span>
                    <span class="text-white" id="summary-tax">₹0.00</span>
                </div>
                <div class="flex justify-between items-end border-t border-white/10 pt-4">
                    <span class="text-[10px] font-bold text-accent-primary uppercase tracking-[0.2em]">Grand Total</span>
                    <span class="text-2xl font-bold text-white tracking-tighter" id="summary-total">₹0.00</span>
                </div>
            </div>
        </div>
    `;

    items.forEach(item => addRow(item));
    document.getElementById('save-btn').onclick = () => saveDoc(type);
    
    // Add copy function
    window.copyBillingToShipping = () => {
        document.getElementById('ship-company').value = document.getElementById('bill-company').value;
        document.getElementById('ship-address').value = document.getElementById('bill-address').value;
        document.getElementById('ship-gst').value = document.getElementById('bill-gst').value;
        document.getElementById('ship-mobile').value = document.getElementById('bill-mobile').value;
    };

    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.remove('opacity-0'), 10);
    feather.replace();
    updateCalculations();
}

window.prefillFromEntity = (id, isVendor) => {
    if (!id) return;
    const entities = isVendor ? documents[DOC_TYPES.VENDORS] : documents[DOC_TYPES.CUSTOMERS];
    const entity = entities.find(e => e.id === id);
    if (!entity) return;

    document.getElementById('bill-company').value = entity.company || entity.displayName;
    document.getElementById('bill-address').value = entity.billingAddress;
    document.getElementById('bill-gst').value = entity.gstin;
    document.getElementById('bill-mobile').value = entity.mobile;

    if (document.getElementById('ship-company')) {
        document.getElementById('ship-company').value = entity.company || entity.displayName;
        document.getElementById('ship-address').value = entity.shippingAddress || entity.billingAddress;
        document.getElementById('ship-gst').value = entity.gstin;
        document.getElementById('ship-mobile').value = entity.mobile;
    }
};

function addRow(data = { name: '', qty: 1, rate: 0, tax: 0 }) {
    const tbody = document.getElementById('line-items-body');
    const row = document.createElement('tr');
    row.className = 'group transition-colors hover:bg-white/[0.01]';
    
    const itemOptions = documents[DOC_TYPES.ITEMS].map(item => 
        `<option value="${item.id}" ${item.name === data.name ? 'selected' : ''}>${item.name}</option>`
    ).join('');

    row.innerHTML = `
        <td class="py-4 pr-4">
            <div class="flex flex-col gap-1">
                <select class="form-input text-xs item-picker" onchange="pickItem(this)">
                    <option value="">-- Select Item --</option>
                    ${itemOptions}
                </select>
                <div class="flex justify-between items-center px-1">
                    <input type="text" class="form-input text-sm item-name border-none bg-transparent p-0 focus:ring-0 w-2/3" value="${data.name}" placeholder="Description...">
                    <span class="text-[9px] font-bold text-slate-500 uppercase stock-label">${data.name ? 'Stock: ' + (documents[DOC_TYPES.ITEMS].find(i => i.name === data.name)?.stock || 0) : ''}</span>
                </div>
            </div>
        </td>
        <td class="py-4 px-4">
            <input type="number" class="form-input text-sm item-qty text-center" value="${data.qty}" min="1" oninput="updateCalculations()">
        </td>
        <td class="py-4 px-4">
            <input type="number" class="form-input text-sm item-rate text-right" value="${data.rate}" step="0.01" oninput="updateCalculations()">
        </td>
        <td class="py-4 px-4">
            <input type="number" class="form-input text-sm item-tax text-right" value="${data.tax}" step="0.1" oninput="updateCalculations()">
        </td>
        <td class="py-4 pl-4 text-right text-sm font-mono font-bold text-white item-amount">₹0.00</td>
        <td class="py-4 pl-4">
            <button onclick="this.closest('tr').remove(); updateCalculations();" class="text-slate-700 hover:text-red-400 transition-colors p-1">
                <i data-feather="minus-circle" class="w-4 h-4"></i>
            </button>
        </td>
    `;
    tbody.appendChild(row);
    feather.replace();
    updateCalculations();
}

window.pickItem = (select) => {
    const itemId = select.value;
    if (!itemId) return;
    const item = documents[DOC_TYPES.ITEMS].find(i => i.id === itemId);
    if (!item) return;

    const row = select.closest('tr');
    row.querySelector('.item-name').value = item.name;
    row.querySelector('.item-rate').value = item.rate;
    row.querySelector('.item-tax').value = item.tax;
    
    // Update stock label
    const stockLabel = row.querySelector('.stock-label');
    if (stockLabel) {
        const stock = item.stock || 0;
        stockLabel.textContent = `Stock: ${stock}`;
        stockLabel.className = `text-[9px] font-bold uppercase stock-label ${stock <= 0 ? 'text-red-400' : 'text-slate-500'}`;
    }
    
    updateCalculations();
};

function updateCalculations() {
    let subtotal = 0;
    let taxTotal = 0;
    const rows = document.querySelectorAll('#line-items-body tr');
    
    rows.forEach(row => {
        const qty = parseFloat(row.querySelector('.item-qty').value || 0);
        const rate = parseFloat(row.querySelector('.item-rate').value || 0);
        const taxPercent = parseFloat(row.querySelector('.item-tax').value || 0);
        
        const amount = Math.round(qty * rate * 100) / 100;
        const tax = Math.round(amount * (taxPercent / 100) * 100) / 100;
        
        subtotal += amount;
        taxTotal += tax;
        
        row.querySelector('.item-amount').textContent = formatCurrency(amount);
    });
    
    subtotal = Math.round(subtotal * 100) / 100;
    taxTotal = Math.round(taxTotal * 100) / 100;
    const grandTotal = Math.round((subtotal + taxTotal) * 100) / 100;

    document.getElementById('summary-subtotal').textContent = formatCurrency(subtotal);
    document.getElementById('summary-tax').textContent = formatCurrency(taxTotal);
    document.getElementById('summary-total').textContent = formatCurrency(grandTotal);
}

async function saveDoc(type) {
    const rows = document.querySelectorAll('#line-items-body tr');
    const lineItems = Array.from(rows).map(row => ({
        name: row.querySelector('.item-name').value,
        qty: parseFloat(row.querySelector('.item-qty').value || 0),
        rate: parseFloat(row.querySelector('.item-rate').value || 0),
        tax: parseFloat(row.querySelector('.item-tax').value || 0)
    }));

    const billing = {
        company: document.getElementById('bill-company').value.trim(),
        address: document.getElementById('bill-address').value.trim(),
        gst: document.getElementById('bill-gst').value.trim(),
        mobile: document.getElementById('bill-mobile').value.trim()
    };

    const shipping = {
        company: document.getElementById('ship-company').value.trim(),
        address: document.getElementById('ship-address').value.trim(),
        gst: document.getElementById('ship-gst').value.trim(),
        mobile: document.getElementById('ship-mobile').value.trim()
    };

    if (!billing.company || lineItems.length === 0) {
        alert('Validation Error: Billing Company name and at least one item are required.');
        return;
    }

    const subtotal = Math.round(lineItems.reduce((acc, i) => acc + (i.qty * i.rate), 0) * 100) / 100;
    const taxTotal = Math.round(lineItems.reduce((acc, i) => acc + (i.qty * i.rate * (i.tax / 100)), 0) * 100) / 100;

    const doc = {
        id: (type.substring(0, 2).toUpperCase() + '-' + Date.now().toString().slice(-6)),
        client: billing.company,
        billing: billing,
        shipping: shipping,
        date: document.getElementById('doc-date').value,
        lineItems: lineItems,
        subtotal: subtotal,
        tax: taxTotal,
        total: Math.round((subtotal + taxTotal) * 100) / 100,
        ref: document.getElementById('doc-ref').value || 'Manual Entry',
        note: document.getElementById('doc-note').value.trim()
    };

    documents[type].unshift(doc);
    localStorage.setItem(STORAGE_KEYS[type], JSON.stringify(documents[type]));
    const success = await saveToCloud(type, doc);

    // --- Dynamic Flow: Stock & Banking Integration ---
    const stockAffectingTypes = [DOC_TYPES.INVOICES, DOC_TYPES.BILLS, DOC_TYPES.CREDIT_NOTES, DOC_TYPES.VENDOR_CREDITS];
    
    if (stockAffectingTypes.includes(type)) {
        for (const line of lineItems) {
            const item = documents[DOC_TYPES.ITEMS].find(i => i.name.trim() === line.name.trim());
            if (item && item.type === 'Goods') {
                if (!item.stock) item.stock = 0;
                if (type === DOC_TYPES.INVOICES) item.stock -= line.qty;
                else if (type === DOC_TYPES.CREDIT_NOTES) item.stock += line.qty;
                else if (type === DOC_TYPES.BILLS) item.stock += line.qty;
                else if (type === DOC_TYPES.VENDOR_CREDITS) item.stock -= line.qty;
                
                await saveToCloud(DOC_TYPES.ITEMS, item);
            }
        }
        localStorage.setItem(STORAGE_KEYS[DOC_TYPES.ITEMS], JSON.stringify(documents[DOC_TYPES.ITEMS]));
    }

    if (type === DOC_TYPES.EXPENSES) {
        if (documents[DOC_TYPES.BANKING].length > 0) {
            documents[DOC_TYPES.BANKING][0].balance -= doc.total;
            localStorage.setItem(STORAGE_KEYS[DOC_TYPES.BANKING], JSON.stringify(documents[DOC_TYPES.BANKING]));
            await saveToCloud(DOC_TYPES.BANKING, documents[DOC_TYPES.BANKING][0]);
        }
    }

    closeModal();
    renderContent();
    
    if (success) {
        showToast(`${type.toUpperCase()} recorded and synced to Cloud!`, 'success');
    } else {
        showToast(`${type.toUpperCase()} saved locally, but Cloud Sync failed. Check script console.`, 'warning');
    }
}

async function deleteDoc(type, id) {
    if(!confirm('Security Protocol: Are you sure you want to permanently delete this record?')) return;
    
    const docToDelete = documents[type].find(d => d.id === id);
    if (!docToDelete) return;

    // --- Dynamic Flow Reversal (Professional Rules) ---
    if ([DOC_TYPES.INVOICES, DOC_TYPES.BILLS, DOC_TYPES.CREDIT_NOTES, DOC_TYPES.VENDOR_CREDITS].includes(type)) {
        for (const line of docToDelete.lineItems || []) {
            const item = documents[DOC_TYPES.ITEMS].find(i => i.name === line.name);
            if (item && item.type === 'Goods') {
                // Reverse the original adjustment
                if (type === DOC_TYPES.INVOICES) item.stock += line.qty;
                else if (type === DOC_TYPES.CREDIT_NOTES) item.stock -= line.qty;
                else if (type === DOC_TYPES.BILLS) item.stock -= line.qty;
                else if (type === DOC_TYPES.VENDOR_CREDITS) item.stock += line.qty;
                
                await saveToCloud(DOC_TYPES.ITEMS, item);
            }
        }
        localStorage.setItem(STORAGE_KEYS[DOC_TYPES.ITEMS], JSON.stringify(documents[DOC_TYPES.ITEMS]));
    }

    if (type === DOC_TYPES.PAYMENTS_REC || type === DOC_TYPES.PAYMENTS_MADE || type === DOC_TYPES.EXPENSES) {
        if (documents[DOC_TYPES.BANKING].length > 0) {
            const amount = docToDelete.total;
            if (type === DOC_TYPES.PAYMENTS_REC) {
                documents[DOC_TYPES.BANKING][0].balance -= amount;
            } else {
                documents[DOC_TYPES.BANKING][0].balance += amount;
            }
            localStorage.setItem(STORAGE_KEYS[DOC_TYPES.BANKING], JSON.stringify(documents[DOC_TYPES.BANKING]));
            await saveToCloud(DOC_TYPES.BANKING, documents[DOC_TYPES.BANKING][0]);
        }
    }

    documents[type] = documents[type].filter(d => d.id !== id);
    localStorage.setItem(STORAGE_KEYS[type], JSON.stringify(documents[type]));
    
    const success = await deleteFromCloud(type, id);
    renderContent();
    if (success) showToast('Record deleted permanentely.', 'success');
    else showToast('Deleted locally, but Cloud sync failed.', 'error');
}

function convertDocument(fromType, fromId, toType) {
    const parentDoc = documents[fromType].find(d => d.id === fromId);
    if (!parentDoc) return;
    openCreateModal(toType, {
        client: parentDoc.client,
        billing: parentDoc.billing ? {...parentDoc.billing} : {company: parentDoc.client},
        shipping: parentDoc.shipping ? {...parentDoc.shipping} : null,
        total: parentDoc.total,
        lineItems: parentDoc.lineItems.map(i => ({...i})),
        ref: parentDoc.id,
        note: parentDoc.note
    });
}

function printDocument(type, id) {
    const doc = documents[type].find(d => d.id === id);
    if (!doc) return;

    const labels = { 
        [DOC_TYPES.QUOTES]: 'QUOTE', 
        [DOC_TYPES.SO]: 'SALES ORDER', 
        [DOC_TYPES.DC]: 'CHALLAN', 
        [DOC_TYPES.PO]: 'PURCHASE ORDER',
        [DOC_TYPES.INVOICES]: 'INVOICE',
        [DOC_TYPES.BILLS]: 'BILL',
        [DOC_TYPES.EXPENSES]: 'EXPENSE',
        [DOC_TYPES.CREDIT_NOTES]: 'CREDIT NOTE',
        [DOC_TYPES.VENDOR_CREDITS]: 'VENDOR CREDIT'
    };

    const printWindow = window.open('', '_blank', 'width=900,height=800');
    
    if (!printWindow) {
        alert('Popup Blocked: Please allow popups to print documents.');
        return;
    }
    
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>${doc.id} - ${doc.client}</title>
            <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;700&display=swap" rel="stylesheet">
            <style>
                * { box-sizing: border-box; -webkit-print-color-adjust: exact; }
                body { 
                    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
                    padding: 40px; 
                    color: #1e293b; 
                    line-height: 1.5; 
                    background: #fff; 
                    margin: 0;
                }
                .header { display: flex; justify-content: space-between; border-bottom: 4px solid #06b6d4; padding-bottom: 25px; margin-bottom: 40px; align-items: flex-end; }
                .company-info { text-align: left; }
                .company-name { font-size: 28px; font-weight: 800; color: #0f172a; margin-bottom: 5px; }
                .company-sub { font-size: 13px; color: #64748b; font-weight: 500; }
                .doc-type { text-align: right; }
                .doc-label { font-size: 36px; font-weight: 800; color: #06b6d4; margin: 0; }
                .doc-id { font-size: 16px; color: #64748b; font-weight: 600; margin-top: 5px; }
                
                .info-section { display: grid; grid-template-columns: 1fr 1fr; gap: 50px; margin-bottom: 50px; }
                .info-block h4 { font-size: 11px; text-transform: uppercase; tracking: 0.1em; color: #94a3b8; margin-bottom: 8px; }
                .info-block p { font-size: 15px; font-weight: 700; margin: 0; color: #1e293b; }
                
                table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
                th { background: #f8fafc; border-bottom: 2px solid #e2e8f0; padding: 15px; text-align: left; font-size: 11px; text-transform: uppercase; color: #64748b; }
                td { padding: 15px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #334155; }
                .text-right { text-align: right; }
                .text-center { text-align: center; }
                
                .totals-container { display: flex; justify-content: flex-end; }
                .totals-box { width: 300px; background: #f8fafc; padding: 25px; border-radius: 12px; }
                .total-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
                .total-row.grand { margin-top: 15px; padding-top: 15px; border-top: 2px solid #e2e8f0; font-size: 20px; font-weight: 800; color: #06b6d4; }
                
                .footer { margin-top: 80px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 30px; letter-spacing: 0.5px; }
                @media print { body { padding: 20px; } .no-print { display: none; } }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="company-info">
                    <div class="company-name">ASYNCRIX GLOBAL</div>
                    <div class="company-sub" style="color: #06b6d4; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">Innovating the Async Future</div>
                </div>
                <div class="doc-type">
                    <h1 class="doc-label">${labels[type]}</h1>
                    <div class="doc-id">REF: ${doc.id}</div>
                </div>
            </div>
            
            <div class="info-section">
                <div class="info-block">
                    <h4>Billing Details</h4>
                    <p style="font-size: 16px; margin-bottom: 4px;">${doc.billing ? doc.billing.company : doc.client}</p>
                    <p style="font-size: 13px; font-weight: 400; color: #64748b; white-space: pre-line;">${doc.billing ? doc.billing.address : ''}</p>
                    ${(doc.billing && doc.billing.gst) ? `<p style="font-size: 12px; margin-top: 8px;"><strong>GST:</strong> ${doc.billing.gst}</p>` : ''}
                    ${(doc.billing && doc.billing.mobile) ? `<p style="font-size: 12px;"><strong>Mob:</strong> ${doc.billing.mobile}</p>` : ''}
                </div>
                <div class="info-block" style="text-align: right;">
                    <h4>Shipping Details</h4>
                    ${(doc.shipping && doc.shipping.address && doc.shipping.address !== doc.billing.address) ? `
                        <p style="font-size: 16px; margin-bottom: 4px;">${doc.shipping.company || doc.billing.company}</p>
                        <p style="font-size: 13px; font-weight: 400; color: #64748b; white-space: pre-line;">${doc.shipping.address}</p>
                        ${doc.shipping.gst ? `<p style="font-size: 12px; margin-top: 8px;"><strong>GST:</strong> ${doc.shipping.gst}</p>` : ''}
                        ${doc.shipping.mobile ? `<p style="font-size: 12px;"><strong>Mob:</strong> ${doc.shipping.mobile}</p>` : ''}
                    ` : `
                        <p style="font-size: 13px; font-weight: 500; color: #64748b;">Same as Billing Address</p>
                    `}
                </div>
            </div>

            <div class="info-section" style="margin-top: -30px; margin-bottom: 40px; border-top: 1px dashed #e2e8f0; padding-top: 20px;">
                <div class="info-block">
                    <h4>Reference Information</h4>
                    <p style="font-size: 14px; color: #64748b;">${doc.ref || 'N/A'}</p>
                </div>
                <div class="info-block" style="text-align: right;">
                    <h4>Date of Issue</h4>
                    <p style="font-size: 14px; color: #64748b;">${doc.date}</p>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th style="width: 45%;">Description</th>
                        <th class="text-center">Quantity</th>
                        <th class="text-right">Unit Rate</th>
                        <th class="text-right">Tax (%)</th>
                        <th class="text-right">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${doc.lineItems.map(item => `
                        <tr>
                            <td style="font-weight: 600;">${item.name}</td>
                            <td class="text-center">${item.qty}</td>
                            <td class="text-right">${formatCurrency(item.rate)}</td>
                            <td class="text-right">${item.tax}%</td>
                            <td class="text-right" style="font-weight: 700;">${formatCurrency(item.qty * item.rate)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div class="totals-container">
                <div class="totals-box">
                    <div class="total-row">
                        <span style="color: #64748b;">Subtotal</span>
                        <span>${formatCurrency(doc.subtotal)}</span>
                    </div>
                    <div class="total-row">
                        <span style="color: #64748b;">Tax Amount</span>
                        <span>${formatCurrency(doc.tax)}</span>
                    </div>
                    <div class="total-row grand">
                        <span>Total Amount</span>
                        <span>${formatCurrency(doc.total)}</span>
                    </div>
                    ${(type === DOC_TYPES.INVOICES || type === DOC_TYPES.BILLS) ? `
                        <div class="total-row" style="margin-top: 10px; color: #10b981; font-weight: 600;">
                            <span>Amount Paid</span>
                            <span>${formatCurrency(doc.total - getDocBalance(doc, type))}</span>
                        </div>
                        <div class="total-row" style="margin-top: 5px; color: #ef4444; font-weight: 800; font-size: 18px; border-top: 1px solid #e2e8f0; padding-top: 10px;">
                            <span>Balance Due</span>
                            <span>${formatCurrency(getDocBalance(doc, type))}</span>
                        </div>
                    ` : ''}
                </div>
            </div>

            ${doc.note ? `
            <div style="margin-top: 40px; padding: 20px; background: #fdfdfd; border: 1px solid #f1f5f9; border-radius: 8px;">
                <h4 style="font-size: 11px; text-transform: uppercase; color: #94a3b8; margin-bottom: 8px;">Terms & Notes</h4>
                <p style="font-size: 12px; color: #64748b; margin: 0; white-space: pre-line;">${doc.note}</p>
            </div>
            ` : ''}
            
            <div class="footer">
                This is a computer-generated transaction document from ASYNCRIX GLOBAL.<br>
                For any queries, contact support@asyncrix.tech
            </div>
        </body>
        </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();

    // Ensure content is rendered before printing
    const checkReady = setInterval(() => {
        if (printWindow.document.readyState === 'complete') {
            clearInterval(checkReady);
            setTimeout(() => {
                printWindow.focus();
                printWindow.print();
                // Close window after print dialog is closed (optional)
                // printWindow.close(); 
            }, 500);
        }
    }, 100);

    // Fallback for older browsers or nested writing
    setTimeout(() => {
        clearInterval(checkReady);
        if (printWindow) {
            printWindow.focus();
            printWindow.print();
        }
    }, 2500);
}

// Consolidated block handled below.

function closeModal() {
    const modal = document.getElementById('form-modal');
    modal.classList.add('opacity-0');
    setTimeout(() => modal.classList.add('hidden'), 300);
}

function logout() {
    localStorage.removeItem('hub_auth');
    window.location.href = 'index.html';
}

// Lifecycle handled by initializeApp()

// --- New Zoho Books Modules Logic ---

function openVendorModal(editData = null) {
    renderContactModal('Vendor', editData, saveVendor);
}

function openCustomerModal(editData = null) {
    renderContactModal('Customer', editData, saveCustomer);
}

function renderContactModal(label, editData, saveFn) {
    const modal = document.getElementById('form-modal');
    document.getElementById('modal-title').textContent = editData ? `Edit ${label}` : `Add New ${label}`;
    const container = document.getElementById('modal-form-container');
    
    container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div class="space-y-6">
                <div>
                    <label class="block text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">${label} Type</label>
                    <div class="flex gap-4">
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="entity-type" value="Business" ${!editData || editData.type === 'Business' ? 'checked' : ''} class="accent-accent-primary">
                            <span class="text-sm text-slate-800">Business</span>
                        </label>
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="entity-type" value="Individual" ${editData && editData.type === 'Individual' ? 'checked' : ''} class="accent-accent-primary">
                            <span class="text-sm text-slate-800">Individual</span>
                        </label>
                    </div>
                </div>
                <div class="grid grid-cols-1 gap-4">
                    <input type="text" id="entity-display" class="form-input" placeholder="Display Name *" value="${editData ? editData.displayName : ''}" required>
                    <input type="text" id="entity-company" class="form-input" placeholder="Company Name" value="${editData ? editData.company : ''}">
                </div>
                <div class="grid grid-cols-1 gap-4">
                    <input type="email" id="entity-email" class="form-input" placeholder="Email Address" value="${editData ? editData.email : ''}">
                    <div class="grid grid-cols-2 gap-4">
                        <input type="text" id="entity-mobile" class="form-input" placeholder="Mobile Number" value="${editData ? editData.mobile : ''}">
                        <input type="text" id="entity-phone" class="form-input" placeholder="Phone" value="${editData ? editData.phone : ''}">
                    </div>
                </div>
            </div>
            <div class="space-y-6">
                <div>
                    <label class="block text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">GST Details</label>
                    <select id="entity-gst-treatment" class="form-input mb-4">
                        <option value="Registered Business - Regular" ${editData && editData.gstTreatment === 'Registered Business - Regular' ? 'selected' : ''}>Registered Business - Regular</option>
                        <option value="Registered Business - Composition" ${editData && editData.gstTreatment === 'Registered Business - Composition' ? 'selected' : ''}>Registered Business - Composition</option>
                        <option value="Unregistered Business" ${editData && editData.gstTreatment === 'Unregistered Business' ? 'selected' : ''}>Unregistered Business</option>
                        <option value="Consumer" ${editData && editData.gstTreatment === 'Consumer' ? 'selected' : ''}>Consumer</option>
                    </select>
                    <input type="text" id="entity-gstin" class="form-input" placeholder="GSTIN" value="${editData ? editData.gstin : ''}">
                </div>
                <div>
                    <label class="block text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">Place of Supply</label>
                    <input type="text" id="entity-place" class="form-input" placeholder="Select State" value="${editData ? editData.place : ''}">
                </div>
            </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-white/5">
            <div>
                <h4 class="text-slate-800 font-bold text-xs uppercase tracking-widest mb-4">Billing Address</h4>
                <textarea id="entity-bill-address" class="form-input h-24" placeholder="Street, City, Zip, State">${editData ? editData.billingAddress : ''}</textarea>
            </div>
            <div>
                <div class="flex justify-between items-center mb-4">
                    <h4 class="text-slate-800 font-bold text-xs uppercase tracking-widest">Shipping Address</h4>
                    <button onclick="copyEntityAddress()" class="text-[9px] font-bold text-accent-primary uppercase tracking-widest">Copy from Billing</button>
                </div>
                <textarea id="entity-ship-address" class="form-input h-24" placeholder="Street, City, Zip, State">${editData ? editData.shippingAddress : ''}</textarea>
            </div>
        </div>
    `;

    window.copyEntityAddress = () => {
        document.getElementById('entity-ship-address').value = document.getElementById('entity-bill-address').value;
    };

    document.getElementById('save-btn').onclick = () => saveFn(editData ? editData.id : null);
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.remove('opacity-0'), 10);
    feather.replace();
}

async function saveCustomer(id) { await saveEntity(id, DOC_TYPES.CUSTOMERS, 'CUST'); }
async function saveVendor(id) { await saveEntity(id, DOC_TYPES.VENDORS, 'VEND'); }

async function saveEntity(id, type, prefix) {
    const displayName = document.getElementById('entity-display').value.trim();
    if (!displayName) { alert('Display Name is required.'); return; }

    const entity = {
        id: id || (prefix + '-' + Date.now().toString().slice(-6)),
        type: document.querySelector('input[name="entity-type"]:checked').value,
        displayName: displayName,
        company: document.getElementById('entity-company').value.trim(),
        email: document.getElementById('entity-email').value.trim(),
        mobile: document.getElementById('entity-mobile').value.trim(),
        phone: document.getElementById('entity-phone').value.trim(),
        gstTreatment: document.getElementById('entity-gst-treatment').value,
        gstin: document.getElementById('entity-gstin').value.trim(),
        place: document.getElementById('entity-place').value.trim(),
        billingAddress: document.getElementById('entity-bill-address').value.trim(),
        shippingAddress: document.getElementById('entity-ship-address').value.trim()
    };

    if (id) {
        const index = documents[type].findIndex(e => e.id === id);
        if (index !== -1) documents[type][index] = entity;
    } else {
        documents[type].unshift(entity);
    }

    localStorage.setItem(STORAGE_KEYS[type], JSON.stringify(documents[type]));
    const success = await saveToCloud(type, entity);
    closeModal();
    renderContent();
    if (success) showToast(`${displayName} saved successfully!`, 'success');
    else showToast('Sync failed. Please check internet/Firebase.', 'error');
}

async function deleteCustomer(id) {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    documents[DOC_TYPES.CUSTOMERS] = documents[DOC_TYPES.CUSTOMERS].filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS[DOC_TYPES.CUSTOMERS], JSON.stringify(documents[DOC_TYPES.CUSTOMERS]));
    const success = await deleteFromCloud(DOC_TYPES.CUSTOMERS, id);
    renderContent();
    if (success) showToast('Customer deleted.', 'success');
    else showToast('Removed locally, but Cloud sync failed.', 'error');
}

async function deleteVendor(id) {
    if (!confirm('Are you sure you want to delete this vendor?')) return;
    documents[DOC_TYPES.VENDORS] = documents[DOC_TYPES.VENDORS].filter(v => v.id !== id);
    localStorage.setItem(STORAGE_KEYS[DOC_TYPES.VENDORS], JSON.stringify(documents[DOC_TYPES.VENDORS]));
    const success = await deleteFromCloud(DOC_TYPES.VENDORS, id);
    renderContent();
    if (success) showToast('Vendor deleted.', 'success');
    else showToast('Removed locally, but Cloud sync failed.', 'error');
}

function openItemModal(editData = null) {
    const modal = document.getElementById('form-modal');
    document.getElementById('modal-title').textContent = editData ? 'Edit Item' : 'New Item';
    const container = document.getElementById('modal-form-container');
    
    container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div class="space-y-6">
                <div>
                    <label class="block text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">Item Type</label>
                    <div class="flex gap-4">
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="item-type" value="Goods" ${!editData || editData.type === 'Goods' ? 'checked' : ''} class="accent-accent-primary">
                            <span class="text-sm text-slate-800">Goods</span>
                        </label>
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="item-type" value="Services" ${editData && editData.type === 'Services' ? 'checked' : ''} class="accent-accent-primary">
                            <span class="text-sm text-slate-800">Services</span>
                        </label>
                    </div>
                </div>
                <input type="text" id="item-name" class="form-input" placeholder="Item Name *" value="${editData ? editData.name : ''}" required>
                <textarea id="item-desc" class="form-input h-24" placeholder="Item Description">${editData ? (editData.description || '') : ''}</textarea>
            </div>
            <div class="space-y-6">
                <div>
                    <label class="block text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">Sales Information</label>
                    <div class="grid grid-cols-2 gap-4">
                        <input type="number" id="item-rate" class="form-input" placeholder="Selling Price *" value="${editData ? editData.rate : ''}">
                        <input type="number" id="item-tax" class="form-input" placeholder="Tax (%)" value="${editData ? editData.tax : 0}">
                    </div>
                </div>
                <div class="pt-2">
                    <label class="block text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">Inventory Stock</label>
                    <input type="number" id="item-stock" class="form-input" placeholder="Opening Stock" value="${editData ? (editData.stock || 0) : 0}">
                </div>
        </div>
    `;

    document.getElementById('save-btn').onclick = () => saveItem(editData ? editData.id : null);
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.remove('opacity-0'), 10);
    feather.replace();
}

async function saveItem(id) {
    const name = document.getElementById('item-name').value.trim();
    if (!name) { alert('Item Name is required.'); return; }

    const item = {
        id: id || ('ITEM-' + Date.now().toString().slice(-6)),
        name: name,
        type: document.querySelector('input[name="item-type"]:checked').value,
        description: document.getElementById('item-desc').value.trim(),
        rate: parseFloat(document.getElementById('item-rate').value || 0),
        tax: parseFloat(document.getElementById('item-tax').value || 0),
        stock: parseFloat(document.getElementById('item-stock').value || 0)
    };

    if (id) {
        const index = documents[DOC_TYPES.ITEMS].findIndex(i => i.id === id);
        if (index !== -1) documents[DOC_TYPES.ITEMS][index] = item;
    } else {
        documents[DOC_TYPES.ITEMS].unshift(item);
    }

    localStorage.setItem(STORAGE_KEYS[DOC_TYPES.ITEMS], JSON.stringify(documents[DOC_TYPES.ITEMS]));
    const success = await saveToCloud(DOC_TYPES.ITEMS, item);
    closeModal();
    renderContent();
    if (success) showToast(`Item "${name}" saved!`, 'success');
    else showToast('Local save success, but Cloud Sync failed.', 'error');
}

async function deleteItem(id) {
    if (!confirm('Are you sure you want to delete this item?')) return;
    documents[DOC_TYPES.ITEMS] = documents[DOC_TYPES.ITEMS].filter(i => i.id !== id);
    localStorage.setItem(STORAGE_KEYS[DOC_TYPES.ITEMS], JSON.stringify(documents[DOC_TYPES.ITEMS]));
    await deleteFromCloud(DOC_TYPES.ITEMS, id);
    renderContent();
    showToast('Item deleted.', 'success');
}

function openBankModal(editData = null) {
    const modal = document.getElementById('form-modal');
    document.getElementById('modal-title').textContent = editData ? 'Edit Bank Account' : 'Add Bank Account';
    const container = document.getElementById('modal-form-container');
    
    container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div class="space-y-6">
                <input type="text" id="bank-name" class="form-input" placeholder="Bank Name *" value="${editData ? editData.bankName : ''}" required>
                <input type="text" id="bank-acc-name" class="form-input" placeholder="Account Name *" value="${editData ? editData.accountName : ''}">
                <input type="text" id="bank-acc-num" class="form-input" placeholder="Account Number *" value="${editData ? editData.accountNumber : ''}">
            </div>
            <div class="space-y-6">
                <input type="number" id="bank-balance" class="form-input" placeholder="Initial Balance" value="${editData ? editData.balance : 0}">
            </div>
        </div>
    `;

    document.getElementById('save-btn').onclick = () => saveBank(editData ? editData.id : null);
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.remove('opacity-0'), 10);
    feather.replace();
}

async function saveBank(id) {
    const bankName = document.getElementById('bank-name').value.trim();
    if (!bankName) { alert('Bank Name is required.'); return; }

    const bank = {
        id: id || ('BANK-' + Date.now().toString().slice(-6)),
        bankName: bankName,
        accountName: document.getElementById('bank-acc-name').value.trim(),
        accountNumber: document.getElementById('bank-acc-num').value.trim(),
        balance: parseFloat(document.getElementById('bank-balance').value || 0)
    };

    if (id) {
        const index = documents[DOC_TYPES.BANKING].findIndex(b => b.id === id);
        if (index !== -1) documents[DOC_TYPES.BANKING][index] = bank;
    } else {
        documents[DOC_TYPES.BANKING].unshift(bank);
    }

    localStorage.setItem(STORAGE_KEYS[DOC_TYPES.BANKING], JSON.stringify(documents[DOC_TYPES.BANKING]));
    const success = await saveToCloud(DOC_TYPES.BANKING, bank);
    closeModal();
    renderContent();
    if (success) showToast(`Bank "${bankName}" updated!`, 'success');
    else showToast('Cloud sync failed for banking.', 'error');
}

async function deleteBank(id) {
    if (!confirm('Are you sure you want to delete this bank account?')) return;
    documents[DOC_TYPES.BANKING] = documents[DOC_TYPES.BANKING].filter(b => b.id !== id);
    localStorage.setItem(STORAGE_KEYS[DOC_TYPES.BANKING], JSON.stringify(documents[DOC_TYPES.BANKING]));
    const success = await deleteFromCloud(DOC_TYPES.BANKING, id);
    renderContent();
    if (success) showToast('Bank account removed.', 'success');
    else showToast('Removed locally, but Cloud delete failed.', 'error');
}

function openPaymentModal(type, prefillData = null) {
    const modal = document.getElementById('form-modal');
    const labels = {
        [DOC_TYPES.PAYMENTS_REC]: 'Payment Received',
        [DOC_TYPES.PAYMENTS_MADE]: 'Payment Made'
    };
    
    const isPurchase = type === DOC_TYPES.PAYMENTS_MADE;
    const entityLabel = isPurchase ? 'Vendor' : 'Customer';
    const entities = isPurchase ? documents[DOC_TYPES.VENDORS] : documents[DOC_TYPES.CUSTOMERS];
    const docsToLink = isPurchase ? documents[DOC_TYPES.BILLS] : documents[DOC_TYPES.INVOICES];

    document.getElementById('modal-title').textContent = labels[type];
    const container = document.getElementById('modal-form-container');
    
    container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 animate-up">
            <div class="space-y-6">
                <div>
                    <label class="block text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">Select ${entityLabel}</label>
                    <select id="payment-entity" class="form-input" onchange="updateRefDocs(this.value, ${isPurchase})">
                        <option value="">-- Select ${entityLabel} --</option>
                        ${entities.map(e => `<option value="${e.company || e.displayName}" ${prefillData && prefillData.entityId === (e.company || e.displayName) ? 'selected' : ''}>${e.displayName}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label class="block text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">Linked Document (Invoice/Bill)</label>
                    <select id="payment-ref-doc" class="form-input">
                        <option value="">-- Select Document --</option>
                        ${docsToLink.map(d => `<option value="${d.id}" ${prefillData && prefillData.refDoc === d.id ? 'selected' : ''}>${d.id} (₹${d.total})</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label class="block text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">Payment Mode</label>
                    <select id="payment-mode" class="form-input">
                        <option value="Cash">Cash</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Cheque">Cheque</option>
                        <option value="UPI">UPI/Digital</option>
                    </select>
                </div>
            </div>
            <div class="space-y-6">
                <div>
                    <label class="block text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">Payment Date</label>
                    <input type="date" id="payment-date" class="form-input" value="${new Date().toISOString().split('T')[0]}">
                </div>
                <div>
                    <label class="block text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">Amount Paid</label>
                    <input type="number" id="payment-amount" class="form-input" placeholder="0.00" value="${prefillData ? prefillData.amount : ''}">
                </div>
                <div>
                    <label class="block text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">Reference / Transaction ID</label>
                    <input type="text" id="payment-ref-num" class="form-input" placeholder="Enter txn id, check #, etc.">
                </div>
            </div>
        </div>
    `;

    document.getElementById('save-btn').onclick = () => savePayment(type);
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.remove('opacity-0'), 10);
    feather.replace();
}

function updateRefDocs(entityName, isPurchase) {
    const refSelect = document.getElementById('payment-ref-doc');
    const docs = isPurchase ? documents[DOC_TYPES.BILLS] : documents[DOC_TYPES.INVOICES];
    const filtered = docs.filter(d => d.client === entityName);
    
    refSelect.innerHTML = `<option value="">-- Select Document --</option>` + 
        filtered.map(d => `<option value="${d.id}">${d.id} (₹${d.total})</option>`).join('');
}

async function savePayment(type) {
    const amount = parseFloat(document.getElementById('payment-amount').value || 0);
    const client = document.getElementById('payment-entity').value;
    
    if (!client || amount <= 0) {
        alert('Please select an entity and enter a valid amount.');
        return;
    }

    const payment = {
        id: (type === DOC_TYPES.PAYMENTS_REC ? 'PAY-IN-' : 'PAY-OUT-') + Date.now().toString().slice(-6),
        client: client,
        date: document.getElementById('payment-date').value,
        total: amount,
        refDoc: document.getElementById('payment-ref-doc').value,
        mode: document.getElementById('payment-mode').value,
        txnId: document.getElementById('payment-ref-num').value,
        type: type
    };

    documents[type].unshift(payment);
    localStorage.setItem(STORAGE_KEYS[type], JSON.stringify(documents[type]));
    const successMain = await saveToCloud(type, payment);

    // --- Dynamic Flow: Bank Balance Integration ---
    let bankSuccess = true;
    if (documents[DOC_TYPES.BANKING].length > 0) {
        if (type === DOC_TYPES.PAYMENTS_REC) {
            documents[DOC_TYPES.BANKING][0].balance += amount;
        } else {
            documents[DOC_TYPES.BANKING][0].balance -= amount;
        }
        localStorage.setItem(STORAGE_KEYS[DOC_TYPES.BANKING], JSON.stringify(documents[DOC_TYPES.BANKING]));
        bankSuccess = await saveToCloud(DOC_TYPES.BANKING, documents[DOC_TYPES.BANKING][0]);
    }

    closeModal();
    renderContent();
    
    if (successMain && bankSuccess) {
        showToast(`${type.replace('-', ' ')} recorded & synced!`, 'success');
    } else {
        showToast("Payment saved locally, but Cloud Sync failed.", "error");
    }
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icon = type === 'success' ? 'check-circle' : 'alert-circle';
    
    toast.innerHTML = `
        <i data-feather="${icon}" class="w-4 h-4"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    feather.replace();

    setTimeout(() => {
        toast.style.animation = 'toastSlideOut 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// --- UI Utility Section ---

// --- Resuscitation Utilities ---

function showCloudWarning() {
    const viewport = document.getElementById('content-viewport');
    if (!viewport) return;
    
    const banner = document.createElement('div');
    banner.className = 'bg-amber-400/10 border border-amber-400/20 p-4 rounded-xl mb-6 flex items-center justify-between animate-up';
    banner.innerHTML = `
        <div class="flex items-center gap-3">
            <i data-feather="alert-triangle" class="text-amber-400 w-5 h-5"></i>
            <div>
                <div class="text-white text-xs font-bold uppercase tracking-widest">Cloud Configuration Required</div>
                <div class="text-slate-500 text-[10px] font-medium leading-relaxed">Your application is currently running in <b>Local Mode</b>. To enable cloud sync and real-time database, please update <code>database.js</code> with your Firebase API keys.</div>
            </div>
        </div>
        <button onclick="this.parentElement.remove()" class="text-slate-500 hover:text-white"><i data-feather="x" class="w-4 h-4"></i></button>
    `;
    viewport.prepend(banner);
    feather.replace();
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobile-overlay');
    if (sidebar && overlay) {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
    }
}

// Wrap switchView to handle mobile sidebar
const _switchView = switchView;
function switchViewWrapped(viewId) {
    if (window.innerWidth < 1024) {
        toggleSidebar();
    }
    _switchView(viewId);
}

// Final check: start the app
initializeApp();
