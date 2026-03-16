import { DOC_TYPES, STORAGE_KEYS } from './js/constants.js';
import { formatCurrency, getDocBalance } from './js/utils.js';
import { 
    renderDashboard, renderUsers, renderItems, renderBanking, 
    renderCustomers, renderVendors, renderDocumentList, renderReports,
    openCreateModal, openUserModal, openItemModal, openBankModal,
    openCustomerModal, openVendorModal, openPaymentModal, updateRefDocs, 
    closeModal, toggleSidebar,
    addRow, pickItem, updateCalculations, prefillFromEntity, printDocument,
    copyEntityAddress, showToast
} from './js/ui.js';
import { 
    saveEntity, deleteEntity, saveItem, saveBank, saveUser, deleteUser,
    saveDoc, deleteDoc, savePayment, systemSetupAndMap, convertDocument
} from './js/handlers.js';
import { migrateLocalToCloud, testConnection } from './js/database.js';

// --- State Management ---
const documents = {};
Object.values(DOC_TYPES).forEach(type => {
    if (type !== DOC_TYPES.DASHBOARD && type !== DOC_TYPES.REPORTS) {
        documents[type] = JSON.parse(localStorage.getItem(STORAGE_KEYS[type]) || '[]');
    }
});

let currentView = 'dashboard';

// --- Global Bridge (for HTML onclick handlers) ---
window.globalBridge = {
    // Navigation & UI
    switchView: (view) => switchView(view),
    toggleSidebar: () => toggleSidebar(),
    closeModal: () => closeModal(),
    logout: () => logout(),
    
    // Handlers
    saveEntity: (id, type, prefix, renderFn) => saveEntity(id, type, prefix, documents, renderFn, closeModal),
    deleteEntity: (id, type, label, renderFn) => deleteEntity(id, type, label, documents, renderFn),
    saveCustomer: (id) => saveEntity(id, DOC_TYPES.CUSTOMERS, 'CUST', documents, () => renderCustomers(documents), closeModal),
    saveVendor: (id) => saveEntity(id, DOC_TYPES.VENDORS, 'VEND', documents, () => renderVendors(documents), closeModal),
    deleteCustomer: (id) => deleteEntity(id, DOC_TYPES.CUSTOMERS, 'Customer', documents, () => renderCustomers(documents)),
    deleteVendor: (id) => deleteEntity(id, DOC_TYPES.VENDORS, 'Vendor', documents, () => renderVendors(documents)),
    
    saveItem: (id) => saveItem(id, documents, () => renderItems(documents), closeModal),
    saveBank: (id) => saveBank(id, documents, () => renderBanking(documents), closeModal),
    saveUser: (id) => saveUser(id, documents, () => renderUsers(documents), closeModal),
    deleteUser: (id) => deleteUser(id, documents, () => renderUsers(documents)),
    
    saveDoc: (type) => saveDoc(type, documents, () => switchView(type), closeModal),
    deleteDoc: (type, id) => deleteDoc(type, id, documents, () => switchView(type)),
    savePayment: (type) => savePayment(type, documents, () => switchView(type), closeModal),
    
    convertDocument: (fromType, fromId, toType) => convertDocument(fromType, fromId, toType, documents, (type, data) => openCreateModal(type, data, documents)),
    
    // UI Utilities
    openCreateModal: (type, data) => openCreateModal(type, data, documents),
    openUserModal: (id) => openUserModal(id, documents),
    openItemModal: (data) => openItemModal(data),
    openBankModal: (data) => openBankModal(data),
    openCustomerModal: (data) => openCustomerModal(data),
    openVendorModal: (data) => openVendorModal(data),
    openPaymentModal: (type, data) => openPaymentModal(type, data, documents),
    updateRefDocs: (name, isPurchase) => updateRefDocs(name, isPurchase, documents),
    renderReports: (sub) => renderReports(sub, documents),
    
    addRow: () => addRow(null, documents),
    pickItem: (input) => pickItem(input, documents),
    updateCalculations: () => updateCalculations(),
    prefillFromEntity: (name) => prefillFromEntity(name, documents),
    printDocument: (type, id) => printDocument(type, id, documents),
    copyEntityAddress: () => copyEntityAddress(),
    
    // System
    migrateData: () => migrateLocalToCloud(),
    testConnection: async () => {
        showToast('Running cloud diagnostic...', 'info');
        const result = await testConnection();
        if (result.success) {
            showToast(`Cloud Online! Latency: ${result.latency}ms`, 'success');
        } else {
            showToast(`Cloud Sync Failed: ${result.error || 'Server unreachable'}`, 'error');
        }
    }
};

// --- App Orchestration ---
function switchView(view) {
    currentView = view;
    
    // Update active tab
    document.querySelectorAll('.sidebar-link').forEach(link => link.classList.remove('active-tab'));
    const activeTab = document.getElementById(`tab-${view}`);
    if (activeTab) activeTab.classList.add('active-tab');

    // Update title
    const titles = {
        'dashboard': 'System Overview',
        [DOC_TYPES.ITEMS]: 'Inventory Management',
        [DOC_TYPES.BANKING]: 'Treasury / Cash Hub',
        [DOC_TYPES.CUSTOMERS]: 'Customer Directory',
        [DOC_TYPES.VENDORS]: 'Vendor Directory',
        [DOC_TYPES.QUOTES]: 'Quotes / Estimates',
        [DOC_TYPES.SO]: 'Sales Orders',
        [DOC_TYPES.DC]: 'Delivery Challans',
        [DOC_TYPES.INVOICES]: 'Sales Invoices',
        [DOC_TYPES.PO]: 'Purchase Orders',
        [DOC_TYPES.BILLS]: 'Vendor Bills',
        [DOC_TYPES.EXPENSES]: 'Business Expenses',
        [DOC_TYPES.PROFORMA]: 'Proforma Invoices',
        [DOC_TYPES.CREDIT_NOTES]: 'Credit Notes',
        [DOC_TYPES.VENDOR_CREDITS]: 'Vendor Credits',
        [DOC_TYPES.PAYMENTS_REC]: 'Payments Received',
        [DOC_TYPES.PAYMENTS_MADE]: 'Payments Made',
        [DOC_TYPES.REPORTS]: 'Analytics & Reports',
        'users': 'User Governance'
    };
    document.getElementById('view-title').textContent = titles[view] || 'ASYNCRIX';

    // Render View
    if (view === 'dashboard') renderDashboard(documents);
    else if (view === 'users') renderUsers(documents);
    else if (view === DOC_TYPES.ITEMS) renderItems(documents);
    else if (view === DOC_TYPES.BANKING) renderBanking(documents);
    else if (view === DOC_TYPES.CUSTOMERS) renderCustomers(documents);
    else if (view === DOC_TYPES.VENDORS) renderVendors(documents);
    else if (view === DOC_TYPES.REPORTS) renderReports(null, documents);
    else if ([
        DOC_TYPES.QUOTES, DOC_TYPES.SO, DOC_TYPES.DC, DOC_TYPES.INVOICES, 
        DOC_TYPES.PO, DOC_TYPES.BILLS, DOC_TYPES.PAYMENTS_REC, DOC_TYPES.PAYMENTS_MADE,
        DOC_TYPES.EXPENSES, DOC_TYPES.PROFORMA, DOC_TYPES.CREDIT_NOTES, DOC_TYPES.VENDOR_CREDITS
    ].includes(view)) {
        renderDocumentList(view, documents);
    }

    if (window.innerWidth < 1024) toggleSidebar();
}

function logout() {
    localStorage.removeItem('hub_auth');
    localStorage.removeItem('hub_user_role');
    window.location.href = 'index.html';
}

function initializeApp() {
    // Initial render
    switchView('dashboard');
    
    // Global Feather Init
    if (window.feather) feather.replace();
    
    console.log('ASYNCRIX Engine Initialized.');
}

// --- Cloud Status Listener ---
window.addEventListener('cloudStatusChanged', (e) => {
    const online = e.detail.online;
    const indicator = document.getElementById('cloud-status-indicator');
    const text = document.getElementById('cloud-status-text');
    const badge = document.getElementById('cloud-status-badge');

    if (indicator && text && badge) {
        if (online) {
            indicator.className = 'w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse';
            text.textContent = 'Cloud Sync Live';
            text.className = 'text-[9px] font-bold text-emerald-400 uppercase tracking-widest';
            badge.className = 'hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-400/10 border border-emerald-400/20 cursor-pointer hover:bg-emerald-400/20 transition-all';
        } else {
            indicator.className = 'w-1.5 h-1.5 rounded-full bg-red-500';
            text.textContent = 'Cloud Offline';
            text.className = 'text-[9px] font-bold text-red-500 uppercase tracking-widest';
            badge.className = 'hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 cursor-pointer hover:bg-red-500/20 transition-all';
        }
    }
});

// Start the app
document.addEventListener('DOMContentLoaded', initializeApp);
