// Hub Pro - Professional Document Engine & Responsive Logic

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

let currentView = 'dashboard';
let documents = {
    [DOC_TYPES.QUOTES]: JSON.parse(localStorage.getItem(STORAGE_KEYS[DOC_TYPES.QUOTES]) || '[]'),
    [DOC_TYPES.SO]: JSON.parse(localStorage.getItem(STORAGE_KEYS[DOC_TYPES.SO]) || '[]'),
    [DOC_TYPES.DC]: JSON.parse(localStorage.getItem(STORAGE_KEYS[DOC_TYPES.DC]) || '[]'),
    [DOC_TYPES.PO]: JSON.parse(localStorage.getItem(STORAGE_KEYS[DOC_TYPES.PO]) || '[]')
};

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
    const titleEl = document.getElementById('view-title');
    if (titleEl) titleEl.textContent = titleMap[viewId] || 'Document Hub';
    
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
        { label: 'Quotes', count: documents[DOC_TYPES.QUOTES].length, color: 'text-accent-primary', icon: 'file-text' },
        { label: 'Sales Orders', count: documents[DOC_TYPES.SO].length, color: 'text-accent-secondary', icon: 'shopping-bag' },
        { label: 'Delivery Chalans', count: documents[DOC_TYPES.DC].length, color: 'text-emerald-400', icon: 'truck' },
        { label: 'Purchase Orders', count: documents[DOC_TYPES.PO].length, color: 'text-amber-400', icon: 'package' }
    ];

    let html = `
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
    `;
    stats.forEach(stat => {
        html += `
            <div class="glass-panel p-6 border-white/5 hover:border-white/10 transition-all cursor-pointer group animate-up">
                <div class="flex justify-between items-start mb-4">
                    <div class="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform ${stat.color}">
                        <i data-feather="${stat.icon}" class="w-6 h-6"></i>
                    </div>
                </div>
                <div class="text-3xl font-bold text-white mb-1 tracking-tight">${stat.count}</div>
                <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">${stat.label}</div>
            </div>
        `;
    });
    html += `</div>`;

    html += `
        <div class="glass-panel p-6 md:p-8 border-white/5 bg-navy-800/20 animate-up" style="animation-delay: 100ms">
            <h3 class="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <i data-feather="activity" class="w-4 h-4 text-accent-primary"></i> Recent Activity
            </h3>
            <div class="space-y-6">
                <div class="flex items-center gap-4 text-sm">
                    <div class="w-8 h-8 rounded-lg bg-emerald-400/10 flex items-center justify-center text-emerald-400 border border-emerald-400/20">
                        <i data-feather="plus" class="w-4 h-4"></i>
                    </div>
                    <div>
                        <div class="text-slate-200 font-medium">New Quote Created</div>
                        <div class="text-[10px] text-slate-500 uppercase">System Auto-logger</div>
                    </div>
                    <span class="text-slate-500 text-xs ml-auto">Active</span>
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
            <div class="glass-panel p-20 text-center border-dashed border-2 border-white/5 flex flex-col items-center animate-up">
                <div class="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-slate-700 mb-6">
                    <i data-feather="inbox" class="w-10 h-10"></i>
                </div>
                <p class="text-slate-400 font-bold text-lg">No ${labels[type]}s yet</p>
                <p class="text-slate-500 text-sm mt-2 max-w-xs mx-auto">Start by clicking the "New" button to record your first transaction.</p>
            </div>
        `;
    } else {
        html += `
            <div class="glass-panel overflow-hidden border-white/5 bg-navy-800/10 backdrop-blur-sm animate-up">
                <table class="responsive-table">
                    <thead>
                        <tr class="bg-white/[0.02] text-slate-500 text-[10px] uppercase tracking-widest font-bold border-b border-white/5">
                            <th class="px-6 py-4">ID</th>
                            <th class="px-6 py-4">Client/Entity</th>
                            <th class="px-6 py-4">Date</th>
                            <th class="px-6 py-4">Amount</th>
                            <th class="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-white/[0.03]">
        `;

        list.forEach(doc => {
            html += `
                <tr class="hover:bg-white/[0.02] transition-colors group">
                    <td class="px-6 py-4 font-mono text-sm text-accent-primary" data-label="ID">${doc.id}</td>
                    <td class="px-6 py-4 text-white font-semibold" data-label="Client">${doc.client}</td>
                    <td class="px-6 py-4 text-slate-400 text-sm" data-label="Date">${doc.date}</td>
                    <td class="px-6 py-4 text-white font-bold" data-label="Total">$${doc.total.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
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
            <button onclick="convertDocument('${type}', '${doc.id}', '${DOC_TYPES.PO}')" class="px-3 py-1 bg-amber-400/10 border border-amber-400/20 text-amber-400 text-[9px] font-bold uppercase rounded-md hover:bg-amber-400/20 transition-all mr-2">To Purchase</button>
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
    document.getElementById('modal-title').textContent = `Create New ${labels[type]}`;
    
    const container = document.getElementById('modal-form-container');
    const items = prefillData && prefillData.lineItems ? prefillData.lineItems : [{ name: '', qty: 1, rate: 0, tax: 0 }];
    
    container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-10">
            <div>
                <label class="block text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">Entity / Client Name</label>
                <input type="text" id="doc-client" class="form-input" value="${prefillData ? prefillData.client : ''}" placeholder="Enter name..." required>
            </div>
            <div>
                <label class="block text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">Transaction Date</label>
                <input type="date" id="doc-date" class="form-input" value="${new Date().toISOString().split('T')[0]}" required>
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
                <label class="block text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">Source Reference</label>
                <input type="text" id="doc-ref" class="form-input text-xs italic bg-white/[0.01] border-dashed" value="${prefillData ? prefillData.ref : 'N/A'}" disabled>
            </div>
            <div class="w-full md:w-80 glass-panel p-6 bg-white/[0.02]">
                <div class="flex justify-between text-xs font-bold uppercase tracking-wider mb-4">
                    <span class="text-slate-500">Subtotal</span>
                    <span class="text-white" id="summary-subtotal">$0.00</span>
                </div>
                <div class="flex justify-between text-xs font-bold uppercase tracking-wider mb-6">
                    <span class="text-slate-500">Tax Payable</span>
                    <span class="text-white" id="summary-tax">$0.00</span>
                </div>
                <div class="flex justify-between items-end border-t border-white/10 pt-4">
                    <span class="text-[10px] font-bold text-accent-primary uppercase tracking-[0.2em]">Grand Total</span>
                    <span class="text-2xl font-bold text-white tracking-tighter" id="summary-total">$0.00</span>
                </div>
            </div>
        </div>
    `;

    items.forEach(item => addRow(item));
    document.getElementById('save-btn').onclick = () => saveDoc(type);
    
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.remove('opacity-0'), 10);
    feather.replace();
    updateCalculations();
}

function addRow(data = { name: '', qty: 1, rate: 0, tax: 0 }) {
    const tbody = document.getElementById('line-items-body');
    const row = document.createElement('tr');
    row.className = 'group transition-colors hover:bg-white/[0.01]';
    row.innerHTML = `
        <td class="py-4 pr-4">
            <input type="text" class="form-input text-sm item-name" value="${data.name}" placeholder="Enter item description...">
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
        <td class="py-4 pl-4 text-right text-sm font-mono font-bold text-white item-amount">$0.00</td>
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

function updateCalculations() {
    let subtotal = 0;
    let taxTotal = 0;
    const rows = document.querySelectorAll('#line-items-body tr');
    
    rows.forEach(row => {
        const qty = parseFloat(row.querySelector('.item-qty').value || 0);
        const rate = parseFloat(row.querySelector('.item-rate').value || 0);
        const taxPercent = parseFloat(row.querySelector('.item-tax').value || 0);
        
        const amount = qty * rate;
        const tax = amount * (taxPercent / 100);
        
        subtotal += amount;
        taxTotal += tax;
        
        row.querySelector('.item-amount').textContent = `$${amount.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
    });
    
    document.getElementById('summary-subtotal').textContent = `$${subtotal.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
    document.getElementById('summary-tax').textContent = `$${taxTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
    document.getElementById('summary-total').textContent = `$${(subtotal + taxTotal).toLocaleString(undefined, {minimumFractionDigits: 2})}`;
}

function saveDoc(type) {
    const rows = document.querySelectorAll('#line-items-body tr');
    const lineItems = Array.from(rows).map(row => ({
        name: row.querySelector('.item-name').value,
        qty: parseFloat(row.querySelector('.item-qty').value || 0),
        rate: parseFloat(row.querySelector('.item-rate').value || 0),
        tax: parseFloat(row.querySelector('.item-tax').value || 0)
    }));

    const client = document.getElementById('doc-client').value.trim();
    if (!client || lineItems.length === 0) {
        alert('Validation Error: Client name and at least one item are required.');
        return;
    }

    const subtotal = lineItems.reduce((acc, i) => acc + (i.qty * i.rate), 0);
    const taxTotal = lineItems.reduce((acc, i) => acc + (i.qty * i.rate * (i.tax / 100)), 0);

    const doc = {
        id: (type.substring(0, 2).toUpperCase() + '-' + Math.floor(Math.random() * 90000 + 10000)),
        client: client,
        date: document.getElementById('doc-date').value,
        lineItems: lineItems,
        subtotal: subtotal,
        tax: taxTotal,
        total: subtotal + taxTotal,
        ref: document.getElementById('doc-ref').value || 'Manual Entry'
    };

    documents[type].unshift(doc);
    localStorage.setItem(STORAGE_KEYS[type], JSON.stringify(documents[type]));
    closeModal();
    renderContent();
}

function deleteDoc(type, id) {
    if(!confirm('Security Protocol: Are you sure you want to permanently delete this document?')) return;
    documents[type] = documents[type].filter(d => d.id !== id);
    localStorage.setItem(STORAGE_KEYS[type], JSON.stringify(documents[type]));
    renderContent();
}

function convertDocument(fromType, fromId, toType) {
    const parentDoc = documents[fromType].find(d => d.id === fromId);
    if (!parentDoc) return;
    openCreateModal(toType, {
        client: parentDoc.client,
        total: parentDoc.total,
        lineItems: parentDoc.lineItems.map(i => ({...i})),
        ref: parentDoc.id
    });
}

function printDocument(type, id) {
    const doc = documents[type].find(d => d.id === id);
    if (!doc) return;
    const printWindow = window.open('', '_blank');
    const labels = { [DOC_TYPES.QUOTES]: 'QUOTATION', [DOC_TYPES.SO]: 'SALES ORDER', [DOC_TYPES.DC]: 'DELIVERY CHALAN', [DOC_TYPES.PO]: 'PURCHASE ORDER' };
    
    printWindow.document.write(`
        <html><head><title>${doc.id}</title>
        <style>body{font-family:Sans-Serif;padding:40px} .hr{border-top:2px solid #06b6d4;margin:20px 0} .tbl{width:100%;border-collapse:collapse} .tbl th{text-align:left;background:#f1f5f9;padding:10px} .tbl td{padding:10px;border-bottom:1px solid #eee} .total{text-align:right;margin-top:20px;font-weight:bold;font-size:20px;color:#06b6d4}</style></head>
        <body><h1 style="color:#06b6d4">${labels[type]}</h1><div class="hr"></div>
        <p><strong>To:</strong> ${doc.client} | <strong>Date:</strong> ${doc.date} | <strong>Ref:</strong> ${doc.ref}</p>
        <table class="tbl"><tr><th>Item</th><th>Qty</th><th>Rate</th><th>Tax</th><th>Amount</th></tr>
        ${doc.lineItems.map(i => `<tr><td>${i.name}</td><td>${i.qty}</td><td>$${i.rate.toFixed(2)}</td><td>${i.tax}%</td><td>$${(i.qty*i.rate).toFixed(2)}</td></tr>`).join('')}
        </table><div class="total">Total Payable: $${doc.total.toFixed(2)}</div></body></html>
    `);
    printWindow.document.close();
    printWindow.print();
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

window.onload = () => switchView('dashboard');
window.addEventListener('resize', () => { if(window.innerWidth >= 1024) { 
    document.getElementById('sidebar').classList.add('active'); 
    document.getElementById('mobile-overlay').classList.remove('active');
}});
