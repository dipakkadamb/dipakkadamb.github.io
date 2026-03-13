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
                    <td class="px-6 py-4 text-right space-x-2 flex items-center justify-end">
                        ${renderConversionButtons(doc, type)}
                        <button onclick="printDocument('${type}', '${doc.id}')" class="p-2 text-slate-500 hover:text-accent-cyan transition-colors" title="Print">
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
    
    // Line items to display
    let itemsHtml = '';
    const items = prefillData && prefillData.lineItems ? prefillData.lineItems : [{ name: '', qty: 1, rate: 0, tax: 0 }];
    
    container.innerHTML = `
        <div class="grid grid-cols-2 gap-6 mb-8">
            <div>
                <label class="label-title">Client / Entity Name</label>
                <input type="text" id="doc-client" class="form-input" value="${prefillData ? prefillData.client : ''}" placeholder="Customer Name" required>
            </div>
            <div>
                <label class="label-title">Document Date</label>
                <input type="date" id="doc-date" class="form-input" value="${new Date().toISOString().split('T')[0]}" required>
            </div>
        </div>

        <div class="mb-6">
            <h4 class="text-white font-bold mb-4 flex justify-between items-center">
                Line Items
                <button onclick="addRow()" class="text-xs text-accent-cyan hover:text-white transition-colors flex items-center gap-1">
                    <i data-feather="plus-circle" class="w-3 h-3"></i> Add Line
                </button>
            </h4>
            <div class="overflow-x-auto">
                <table class="w-full text-left" id="items-table">
                    <thead>
                        <tr class="text-[10px] uppercase text-slate-500 font-bold border-b border-white/5">
                            <th class="pb-3 pr-4 w-[40%]">Item Name</th>
                            <th class="pb-3 px-4">Qty</th>
                            <th class="pb-3 px-4">Rate</th>
                            <th class="pb-3 px-4">Tax %</th>
                            <th class="pb-3 pl-4 text-right">Amount</th>
                            <th class="pb-3 pl-4 w-8"></th>
                        </tr>
                    </thead>
                    <tbody id="line-items-body" class="divide-y divide-white/5">
                        <!-- Rows injected here -->
                    </tbody>
                </table>
            </div>
        </div>

        <div class="grid grid-cols-2 gap-8 items-end">
             <div class="max-w-xs">
                <label class="label-title">Reference (Source ID)</label>
                <input type="text" id="doc-ref" class="form-input text-xs opacity-50" value="${prefillData ? prefillData.ref : 'Standalone'}" disabled>
            </div>
            <div class="glass-card p-6 border-white/5 ml-auto w-full max-w-sm bg-white/5">
                <div class="flex justify-between text-sm mb-2">
                    <span class="text-slate-400">Subtotal</span>
                    <span class="text-white font-mono" id="summary-subtotal">$0.00</span>
                </div>
                <div class="flex justify-between text-sm mb-4">
                    <span class="text-slate-400">Tax Total</span>
                    <span class="text-white font-mono" id="summary-tax">$0.00</span>
                </div>
                <div class="flex justify-between text-lg font-bold border-t border-white/10 pt-4">
                    <span class="text-accent-cyan">Total</span>
                    <span class="text-white font-mono" id="summary-total">$0.00</span>
                </div>
            </div>
        </div>
    `;

    // Populate rows
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
    row.className = 'group';
    row.innerHTML = `
        <td class="py-3 pr-4">
            <input type="text" class="form-input text-sm item-name" value="${data.name}" placeholder="Service/Product name">
        </td>
        <td class="py-3 px-4">
            <input type="number" class="form-input text-sm item-qty text-center" value="${data.qty}" oninput="updateCalculations()">
        </td>
        <td class="py-3 px-4">
            <input type="number" class="form-input text-sm item-rate" value="${data.rate}" oninput="updateCalculations()">
        </td>
        <td class="py-3 px-4 w-24">
            <input type="number" class="form-input text-sm item-tax" value="${data.tax}" oninput="updateCalculations()">
        </td>
        <td class="py-3 pl-4 text-right text-sm font-mono text-white item-amount">$0.00</td>
        <td class="py-3 pl-4">
            <button onclick="this.closest('tr').remove(); updateCalculations();" class="text-slate-600 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-all">
                <i data-feather="x" class="w-4 h-4"></i>
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

    const total = subtotal + taxTotal;

    document.getElementById('summary-subtotal').textContent = `$${subtotal.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
    document.getElementById('summary-tax').textContent = `$${taxTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
    document.getElementById('summary-total').textContent = `$${total.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
}

function saveDoc(type) {
    const rows = document.querySelectorAll('#line-items-body tr');
    const lineItems = Array.from(rows).map(row => ({
        name: row.querySelector('.item-name').value,
        qty: parseFloat(row.querySelector('.item-qty').value || 0),
        rate: parseFloat(row.querySelector('.item-rate').value || 0),
        tax: parseFloat(row.querySelector('.item-tax').value || 0)
    }));

    if (lineItems.length === 0 || !document.getElementById('doc-client').value) {
        alert('Please add at least one item and a client name.');
        return;
    }

    const subtotal = lineItems.reduce((acc, item) => acc + (item.qty * item.rate), 0);
    const taxTotal = lineItems.reduce((acc, item) => acc + (item.qty * item.rate * (item.tax / 100)), 0);

    const doc = {
        id: (type.substring(0, 2).toUpperCase() + '-' + Math.floor(Math.random() * 9000 + 1000)),
        client: document.getElementById('doc-client').value,
        date: document.getElementById('doc-date').value,
        lineItems: lineItems,
        subtotal: subtotal,
        tax: taxTotal,
        total: subtotal + taxTotal,
        ref: document.getElementById('doc-ref').value || 'Standalone'
    };

    documents[type].unshift(doc);
    localStorage.setItem(STORAGE_KEYS[type], JSON.stringify(documents[type]));
    
    closeModal();
    renderContent();
}

function deleteDoc(type, id) {
    if(!confirm('Are you sure you want to delete this document?')) return;
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
        lineItems: parentDoc.lineItems,
        ref: parentDoc.id
    };

    openCreateModal(toType, prefill);
}

function printDocument(type, id) {
    const doc = documents[type].find(d => d.id === id);
    if (!doc) return;

    const printWindow = window.open('', '_blank');
    const labels = {
        [DOC_TYPES.QUOTES]: 'QUOTATION',
        [DOC_TYPES.SO]: 'SALES ORDER',
        [DOC_TYPES.DC]: 'DELIVERY CHALAN',
        [DOC_TYPES.PO]: 'PURCHASE ORDER'
    };

    const html = `
        <html>
        <head>
            <title>${doc.id} - ${doc.client}</title>
            <style>
                body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #333; }
                .header { display: flex; justify-content: space-between; border-bottom: 2px solid #06b6d4; padding-bottom: 20px; margin-bottom: 30px; }
                .company-name { font-size: 24px; font-weight: bold; color: #0a0f1c; }
                .doc-type { font-size: 32px; font-weight: 800; color: #06b6d4; text-transform: uppercase; }
                .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
                .label { font-size: 10px; text-transform: uppercase; color: #666; font-weight: bold; margin-bottom: 5px; }
                .val { font-size: 14px; font-weight: bold; }
                table { w-full; border-collapse: collapse; margin-bottom: 30px; width: 100%;}
                th { background: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 12px; text-align: left; font-size: 11px; text-transform: uppercase; }
                td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
                .totals { float: right; width: 250px; }
                .total-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
                .grand-total { border-top: 2px solid #06b6d4; font-size: 18px; font-weight: bold; color: #06b6d4; margin-top: 10px; }
            </style>
        </head>
        <body>
            <div class="header">
                <div>
                    <div class="company-name">Dipak Kadamb Hub</div>
                    <div style="font-size: 12px; color: #666;">contact@dipakkadamb.in</div>
                </div>
                <div class="doc-type">${labels[type]}</div>
            </div>
            
            <div class="info-grid">
                <div>
                    <div class="label">Bill To</div>
                    <div class="val">${doc.client}</div>
                    <div style="font-size: 12px; color: #666; margin-top: 5px;">Reference: ${doc.ref}</div>
                </div>
                <div style="text-align: right;">
                    <div class="label">Document #</div>
                    <div class="val">${doc.id}</div>
                    <div class="label" style="margin-top: 15px;">Date</div>
                    <div class="val">${doc.date}</div>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th style="width: 50%;">Description</th>
                        <th style="text-align: center;">Qty</th>
                        <th style="text-align: right;">Rate</th>
                        <th style="text-align: right;">Tax %</th>
                        <th style="text-align: right;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${doc.lineItems.map(item => `
                        <tr>
                            <td>${item.name}</td>
                            <td style="text-align: center;">${item.qty}</td>
                            <td style="text-align: right;">$${item.rate.toFixed(2)}</td>
                            <td style="text-align: right;">${item.tax}%</td>
                            <td style="text-align: right;">$${(item.qty * item.rate).toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div class="totals">
                <div class="total-row"><span>Subtotal</span><span>$${doc.subtotal.toFixed(2)}</span></div>
                <div class="total-row"><span>Tax</span><span>$${doc.tax.toFixed(2)}</span></div>
                <div class="total-row grand-total"><span>Total</span><span>$${doc.total.toFixed(2)}</span></div>
            </div>
            
            <div style="margin-top: 100px; font-size: 10px; color: #999; text-align: center; border-top: 1px solid #eee; padding-top: 20px;">
                Computer generated document. No signature required.
            </div>
        </body>
        </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
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
