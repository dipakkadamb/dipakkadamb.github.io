// Hub Application Logic

// Data Structures Initialization
const DOC_TYPES = {
    QUOTES: 'quotes',
    SO: 'sales-orders',
    DC: 'delivery-chalans',
    PO: 'purchase-orders'
};

const STORAGE_KEYS = {
    [DOC_TYPES.QUOTES]: 'hub_quotes',
    [DOC_TYPES.SO]: 'hub_so',
    [DOC_TYPES.DC]: 'hub_dc',
    [DOC_TYPES.PO]: 'hub_po'
};

// Initial State
let currentView = 'dashboard';
let documents = {
    [DOC_TYPES.QUOTES]: JSON.parse(localStorage.getItem(STORAGE_KEYS[DOC_TYPES.QUOTES]) || '[]'),
    [DOC_TYPES.SO]: JSON.parse(localStorage.getItem(STORAGE_KEYS[DOC_TYPES.SO]) || '[]'),
    [DOC_TYPES.DC]: JSON.parse(localStorage.getItem(STORAGE_KEYS[DOC_TYPES.DC]) || '[]'),
    [DOC_TYPES.PO]: JSON.parse(localStorage.getItem(STORAGE_KEYS[DOC_TYPES.PO]) || '[]')
};

// --- View Management ---
function switchView(viewId) {
    currentView = viewId;
    document.querySelectorAll('.sidebar-link').forEach(btn => btn.classList.remove('active-tab'));
    const activeTab = document.getElementById(`tab-${viewId}`);
    if (activeTab) activeTab.classList.add('active-tab');

    const titleMap = {
        'dashboard': 'Dashboard Overview',
        'quotes': 'Quotations',
        'sales-orders': 'Sales Orders',
        'delivery-chalans': 'Delivery Chalans',
        'purchase-orders': 'Purchase Orders'
    };
    document.getElementById('view-title').textContent = titleMap[viewId] || 'Document Hub';
    
    renderContent();
}

function renderContent() {
    const viewport = document.getElementById('content-viewport');
    viewport.innerHTML = '';

    if (currentView === 'dashboard') {
        renderDashboard(viewport);
    } else {
        renderDocumentList(viewport, currentView);
    }
    feather.replace();
}

function renderDashboard(container) {
    const stats = [
        { label: 'Quotes', count: documents[DOC_TYPES.QUOTES].length, color: 'text-accent-cyan', icon: 'file-text' },
        { label: 'Sales Orders', count: documents[DOC_TYPES.SO].length, color: 'text-accent-blue', icon: 'shopping-cart' },
        { label: 'Delivery Chalans', count: documents[DOC_TYPES.DC].length, color: 'text-accent-teal', icon: 'truck' },
        { label: 'Purchase Orders', count: documents[DOC_TYPES.PO].length, color: 'text-accent-amber', icon: 'package' }
    ];

    let html = `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">`;
    stats.forEach(stat => {
        html += `
            <div class="glass-card p-6 border-white/5 hover:border-white/10 transition-all cursor-pointer group">
                <div class="flex justify-between items-start mb-4">
                    <div class="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform ${stat.color}">
                        <i data-feather="${stat.icon}" class="w-6 h-6"></i>
                    </div>
                </div>
                <div class="text-3xl font-bold text-white mb-1">${stat.count}</div>
                <div class="text-xs font-bold text-slate-500 uppercase tracking-widest">${stat.label}</div>
            </div>
        `;
    });
    html += `</div>`;

    html += `
        <div class="glass-card p-8 border-white/5 bg-navy-800/40">
            <h3 class="text-xl font-bold text-white mb-6">Recent Workflow</h3>
            <div class="space-y-4">
                <div class="flex items-center gap-4 text-sm">
                    <div class="w-2 h-2 rounded-full bg-accent-cyan shadow-[0_0_8px_var(--accent-cyan)]"></div>
                    <span class="text-slate-300">Quotation Created</span>
                    <span class="text-slate-500 ml-auto">Just now</span>
                </div>
                <div class="flex items-center gap-4 text-sm">
                    <div class="w-2 h-2 rounded-full bg-accent-blue shadow-[0_0_8px_var(--accent-blue)]"></div>
                    <span class="text-slate-300">Sales Order Converted</span>
                    <span class="text-slate-500 ml-auto">2 hours ago</span>
                </div>
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
        [DOC_TYPES.DC]: 'Delivery Chalan',
        [DOC_TYPES.PO]: 'Purchase Order'
    };

    let html = `
        <div class="flex justify-between items-center mb-8">
            <div>
                <h3 class="text-2xl font-bold text-white">Manage ${labels[type]}s</h3>
                <p class="text-slate-400 text-sm">Total items: ${list.length}</p>
            </div>
            <button onclick="openCreateModal('${type}')" class="btn-primary flex items-center gap-2">
                <i data-feather="plus" class="w-4 h-4"></i> Create New
            </button>
        </div>
    `;

    if (list.length === 0) {
        html += `
            <div class="glass-card p-20 text-center border-dashed border-2 border-white/10 flex flex-col items-center">
                <div class="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-slate-600 mb-4">
                    <i data-feather="folder" class="w-8 h-8"></i>
                </div>
                <p class="text-slate-500 font-semibold text-lg">No documents found</p>
                <p class="text-slate-600 text-sm mt-1">Start by creating a new document</p>
            </div>
        `;
    } else {
        html += `
            <div class="overflow-hidden border border-white/5 rounded-2xl bg-navy-800/20 backdrop-blur-sm">
                <table class="w-full text-left">
                    <thead>
                        <tr class="bg-white/5 text-slate-400 text-[10px] uppercase tracking-widest font-bold">
                            <th class="px-6 py-4">ID</th>
                            <th class="px-6 py-4">Client/Vendor</th>
                            <th class="px-6 py-4">Date</th>
                            <th class="px-6 py-4">Amount</th>
                            <th class="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-white/5">
        `;

        list.forEach(doc => {
            html += `
                <tr class="hover:bg-white/5 transition-colors group">
                    <td class="px-6 py-4 font-mono text-sm text-accent-cyan">${doc.id}</td>
                    <td class="px-6 py-4 text-white font-semibold">${doc.client}</td>
                    <td class="px-6 py-4 text-slate-400 text-sm">${doc.date}</td>
                    <td class="px-6 py-4 text-white font-bold">$${doc.total.toLocaleString()}</td>
                    <td class="px-6 py-4 text-right space-x-2">
                        ${renderConversionButtons(doc, type)}
                        <button onclick="deleteDoc('${type}', '${doc.id}')" class="p-2 text-slate-500 hover:text-red-400 transition-colors">
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
        return `<button onclick="convertDocument('${type}', '${doc.id}', '${DOC_TYPES.SO}')" class="px-3 py-1 bg-accent-blue/10 border border-accent-blue/20 text-accent-blue text-[10px] font-bold uppercase rounded-full hover:bg-accent-blue/20 transition-all">To Sales Order</button>`;
    } else if (type === DOC_TYPES.SO) {
        return `
            <button onclick="convertDocument('${type}', '${doc.id}', '${DOC_TYPES.DC}')" class="px-3 py-1 bg-accent-teal/10 border border-accent-teal/20 text-accent-teal text-[10px] font-bold uppercase rounded-full hover:bg-accent-teal/20 transition-all">To Chalan</button>
            <button onclick="convertDocument('${type}', '${doc.id}', '${DOC_TYPES.PO}')" class="px-3 py-1 bg-accent-amber/10 border border-accent-amber/20 text-accent-amber text-[10px] font-bold uppercase rounded-full hover:bg-accent-amber/20 transition-all">To Purchase</button>
        `;
    }
    return '';
}

// --- CRUD & Flow Logic ---

function openCreateModal(type, prefillData = null) {
    const modal = document.getElementById('form-modal');
    const labels = {
        [DOC_TYPES.QUOTES]: 'Quotation',
        [DOC_TYPES.SO]: 'Sales Order',
        [DOC_TYPES.DC]: 'Delivery Chalan',
        [DOC_TYPES.PO]: 'Purchase Order'
    };
    document.getElementById('modal-title').textContent = `New ${labels[type]}`;
    
    const container = document.getElementById('modal-form-container');
    container.innerHTML = `
        <div class="grid grid-cols-2 gap-6">
            <div>
                <label class="label-title">Client / Entity Name</label>
                <input type="text" id="doc-client" class="form-input" value="${prefillData ? prefillData.client : ''}" required>
            </div>
            <div>
                <label class="label-title">Document Date</label>
                <input type="date" id="doc-date" class="form-input" value="${new Date().toISOString().split('T')[0]}" required>
            </div>
            <div class="col-span-2">
                <label class="label-title">Items / Description</label>
                <textarea id="doc-items" class="form-input" rows="4" placeholder="e.g. Design Services, 10x Servers...">${prefillData ? prefillData.items : ''}</textarea>
            </div>
            <div class="col-span-1">
                <label class="label-title">Total Amount ($)</label>
                <input type="number" id="doc-total" class="form-input" value="${prefillData ? prefillData.total : ''}" required>
            </div>
            <div class="col-span-1">
                <label class="label-title">Reference (Optional)</label>
                <input type="text" id="doc-ref" class="form-input" placeholder="Origin ID" value="${prefillData ? prefillData.ref : ''}" disabled>
            </div>
        </div>
    `;

    document.getElementById('save-btn').onclick = () => saveDoc(type);
    
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.remove('opacity-0'), 10);
    feather.replace();
}

function saveDoc(type) {
    const doc = {
        id: (type.substring(0, 2).toUpperCase() + '-' + Math.floor(Math.random() * 9000 + 1000)),
        client: document.getElementById('doc-client').value,
        date: document.getElementById('doc-date').value,
        items: document.getElementById('doc-items').value,
        total: parseFloat(document.getElementById('doc-total').value || 0),
        ref: document.getElementById('doc-ref').value || 'N/A'
    };

    documents[type].unshift(doc);
    localStorage.setItem(STORAGE_KEYS[type], JSON.stringify(documents[type]));
    
    closeModal();
    renderContent();
}

function deleteDoc(type, id) {
    documents[type] = documents[type].filter(d => d.id !== id);
    localStorage.setItem(STORAGE_KEYS[type], JSON.stringify(documents[type]));
    renderContent();
}

function convertDocument(fromType, fromId, toType) {
    const parentDoc = documents[fromType].find(d => d.id === fromId);
    if (!parentDoc) return;

    const prefill = {
        client: parentDoc.client,
        total: parentDoc.total,
        items: parentDoc.items,
        ref: parentDoc.id
    };

    openCreateModal(toType, prefill);
}

function closeModal() {
    const modal = document.getElementById('form-modal');
    modal.classList.add('opacity-0');
    setTimeout(() => modal.classList.add('hidden'), 300);
}

function logout() {
    localStorage.removeItem('hub_auth');
    window.location.href = 'index.html';
}

// Global Initialization
window.onload = () => {
    switchView('dashboard');
};
