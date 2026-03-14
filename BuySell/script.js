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

function formatCurrency(amount) {
    return '₹' + amount.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

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
        [DOC_TYPES.SO]: 'SO',
        [DOC_TYPES.DC]: 'DC',
        [DOC_TYPES.PO]: 'PO'
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
                    <td class="px-6 py-4 text-white font-bold" data-label="Total">${formatCurrency(doc.total)}</td>
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
        [DOC_TYPES.QUOTES]: 'Quote',
        [DOC_TYPES.SO]: 'SO',
        [DOC_TYPES.DC]: 'DC',
        [DOC_TYPES.PO]: 'PO'
    };
    document.getElementById('modal-title').textContent = `Create New ${labels[type]}`;
    
    const container = document.getElementById('modal-form-container');
    const items = prefillData && prefillData.lineItems ? prefillData.lineItems : [{ name: '', qty: 1, rate: 0, tax: 0 }];
    
    container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <!-- Billing Details -->
            <div class="glass-panel p-6 bg-white/[0.02] border-white/10">
                <h4 class="text-white font-bold text-sm uppercase tracking-wide mb-4 flex items-center gap-2">
                    <i data-feather="file-text" class="w-4 h-4 text-accent-primary"></i> Billing To
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
        
        row.querySelector('.item-amount').textContent = formatCurrency(amount);
    });
    
    document.getElementById('summary-subtotal').textContent = formatCurrency(subtotal);
    document.getElementById('summary-tax').textContent = formatCurrency(taxTotal);
    document.getElementById('summary-total').textContent = formatCurrency(subtotal + taxTotal);
}

function saveDoc(type) {
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

    const subtotal = lineItems.reduce((acc, i) => acc + (i.qty * i.rate), 0);
    const taxTotal = lineItems.reduce((acc, i) => acc + (i.qty * i.rate * (i.tax / 100)), 0);

    const doc = {
        id: (type.substring(0, 2).toUpperCase() + '-' + Math.floor(Math.random() * 90000 + 10000)),
        client: billing.company,
        billing: billing,
        shipping: shipping,
        date: document.getElementById('doc-date').value,
        lineItems: lineItems,
        subtotal: subtotal,
        tax: taxTotal,
        total: subtotal + taxTotal,
        ref: document.getElementById('doc-ref').value || 'Manual Entry',
        note: document.getElementById('doc-note').value.trim()
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
        [DOC_TYPES.SO]: 'SO', 
        [DOC_TYPES.DC]: 'DC', 
        [DOC_TYPES.PO]: 'PO' 
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
                
                .footer { margin-top: 80px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 30px; }
                @media print { body { padding: 20px; } }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="company-info">
                    <div class="company-name">Dipak Kadamb</div>
                    <div class="company-sub" style="color: #06b6d4; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">Make It Simple</div>
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
                    <p style="font-size: 16px; margin-bottom: 4px;">${doc.shipping && doc.shipping.company ? doc.shipping.company : (doc.billing ? doc.billing.company : doc.client)}</p>
                    <p style="font-size: 13px; font-weight: 400; color: #64748b; white-space: pre-line;">${doc.shipping ? doc.shipping.address : ''}</p>
                    ${(doc.shipping && doc.shipping.gst) ? `<p style="font-size: 12px; margin-top: 8px;"><strong>GST:</strong> ${doc.shipping.gst}</p>` : ''}
                    ${(doc.shipping && doc.shipping.mobile) ? `<p style="font-size: 12px;"><strong>Mob:</strong> ${doc.shipping.mobile}</p>` : ''}
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
                        <span>Total Due</span>
                        <span>${formatCurrency(doc.total)}</span>
                    </div>
                </div>
            </div>

            ${doc.note ? `
            <div style="margin-top: 40px; padding: 20px; background: #fdfdfd; border: 1px solid #f1f5f9; border-radius: 8px;">
                <h4 style="font-size: 11px; text-transform: uppercase; color: #94a3b8; margin-bottom: 8px;">Terms & Notes</h4>
                <p style="font-size: 12px; color: #64748b; margin: 0; white-space: pre-line;">${doc.note}</p>
            </div>
            ` : ''}
            
            <div class="footer">
                This is a computer-generated transaction document from CRM.<br>
                For any queries, please visit dipakkadamb.github.io
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
