import { DOC_TYPES } from './constants.js';
import { formatCurrency, getDocBalance } from './utils.js';

export function showToast(message, type = 'success') {
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
    if (window.feather) feather.replace();

    setTimeout(() => {
        toast.style.animation = 'toastSlideOut 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

export function renderDashboard(documents) {
    const container = document.getElementById('content-viewport');
    if (!container) return;
    const totalReceivables = documents[DOC_TYPES.INVOICES].reduce((sum, inv) => sum + getDocBalance(inv, DOC_TYPES.INVOICES, documents, DOC_TYPES), 0);
    const totalPayables = documents[DOC_TYPES.BILLS].reduce((sum, bill) => sum + getDocBalance(bill, DOC_TYPES.BILLS, documents, DOC_TYPES), 0);
    const totalCash = documents[DOC_TYPES.BANKING].reduce((sum, bank) => sum + bank.balance, 0);
    
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

    container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            ${mainStats.map(stat => `
                <div class="glass-panel p-6 bg-white border-slate-200 relative overflow-hidden group">
                    <div class="absolute -top-12 -right-12 w-24 h-24 bg-slate-50 blur-2xl rounded-full group-hover:bg-accent-primary/5 transition-all"></div>
                    <div class="flex justify-between items-start mb-6 relative z-10">
                        <div class="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 ${stat.color} shadow-inner">
                            <i data-feather="${stat.icon}" class="w-6 h-6"></i>
                        </div>
                        <div class="text-[9px] font-extrabold text-slate-500 uppercase tracking-[0.2em] pt-1">Live Feed</div>
                    </div>
                    <div class="relative z-10">
                        <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">${stat.label}</div>
                        <div class="text-3xl font-bold text-slate-900 tracking-tighter">${formatCurrency(stat.amount)}</div>
                        <p class="text-[10px] text-slate-500 mt-3 font-medium flex items-center gap-1.5 uppercase tracking-tighter">
                             <span class="w-1 h-1 rounded-full bg-accent-primary animate-pulse"></span> ${stat.sub}
                        </p>
                    </div>
                </div>
            `).join('')}
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-up" style="animation-delay: 100ms">
            <div class="glass-panel p-6 border-slate-200 bg-white shadow-sm">
                <div class="flex justify-between items-center mb-8">
                    <h3 class="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                        <i data-feather="clock" class="w-4 h-4 text-accent-primary"></i> Recent Transactions
                    </h3>
                    <button onclick="globalBridge.switchView('${DOC_TYPES.REPORTS}')" class="text-[10px] font-bold text-accent-primary uppercase hover:underline">View All</button>
                </div>
                
                <div class="space-y-4">
                    ${recentTxns.length === 0 ? `
                        <p class="text-slate-500 text-xs italic py-8 text-center">No transactions recorded yet.</p>
                    ` : recentTxns.map(txn => `
                        <div class="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                            <div class="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center ${txn.color} border border-slate-100">
                                <i data-feather="${txn.icon}" class="w-4 h-4"></i>
                            </div>
                            <div class="flex-1">
                                <div class="text-xs font-bold text-slate-900">${txn.client}</div>
                                <div class="text-[10px] text-slate-500 font-medium uppercase tracking-tight">${txn.typeLabel} • ${txn.id}</div>
                            </div>
                            <div class="text-right">
                                <div class="text-xs font-bold text-slate-900 font-mono">${formatCurrency(txn.total)}</div>
                                <div class="text-[9px] text-slate-500">${txn.date}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="glass-panel p-6 border-white/5 bg-navy-800/10 flex flex-col">
                 <h3 class="text-sm font-bold text-white uppercase tracking-widest mb-8 flex items-center gap-2">
                    <i data-feather="zap" class="w-4 h-4 text-amber-400"></i> Quick Actions
                </h3>
                <div class="grid grid-cols-2 gap-4">
                    <button onclick="globalBridge.openCreateModal('${DOC_TYPES.QUOTES}')" class="flex flex-col items-center justify-center p-6 rounded-2xl bg-accent-primary/5 border border-accent-primary/10 hover:bg-accent-primary/10 transition-all group">
                        <i data-feather="file-text" class="w-6 h-6 text-accent-primary mb-3"></i>
                        <span class="text-[10px] font-bold text-white uppercase tracking-widest">New Quote</span>
                    </button>
                    <button onclick="globalBridge.openCreateModal('${DOC_TYPES.INVOICES}')" class="flex flex-col items-center justify-center p-6 rounded-2xl bg-emerald-400/5 border border-emerald-400/10 hover:bg-emerald-400/10 transition-all group">
                        <i data-feather="file" class="w-6 h-6 text-emerald-400 mb-3"></i>
                        <span class="text-[10px] font-bold text-white uppercase tracking-widest">New Invoice</span>
                    </button>
                    <button onclick="globalBridge.openCreateModal('${DOC_TYPES.BILLS}')" class="flex flex-col items-center justify-center p-6 rounded-2xl bg-amber-400/5 border border-amber-400/10 hover:bg-amber-400/10 transition-all group">
                        <i data-feather="file-minus" class="w-6 h-6 text-amber-400 mb-3"></i>
                        <span class="text-[10px] font-bold text-white uppercase tracking-widest">New Bill</span>
                    </button>
                    <button onclick="globalBridge.openCustomerModal()" class="flex flex-col items-center justify-center p-6 rounded-2xl bg-purple-400/5 border border-purple-400/10 hover:bg-purple-400/10 transition-all group">
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
    if (window.feather) feather.replace();
}

export function renderUsers(documents) {
    const container = document.getElementById('content-viewport');
    if (!container) return;
    const list = documents[DOC_TYPES.USERS] || [];
    container.innerHTML = `
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
                <h3 class="text-xl font-bold text-slate-900">User Management</h3>
                <p class="text-xs text-slate-500 mt-1">Manage system administrators and staff access.</p>
            </div>
            <button onclick="globalBridge.openUserModal()" class="btn-primary">
                <i data-feather="user-plus" class="w-4 h-4"></i> New User
            </button>
        </div>

        <div class="glass-panel overflow-hidden border-slate-200">
            <table class="w-full text-left">
                <thead class="bg-slate-50 border-b border-slate-200">
                    <tr>
                        <th class="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Name & Username</th>
                        <th class="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Role</th>
                        <th class="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                        <th class="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    ${list.map(u => `
                        <tr class="hover:bg-slate-50 transition-colors">
                            <td class="px-6 py-4">
                                <div class="font-bold text-slate-900">${u.name}</div>
                                <div class="text-[10px] text-slate-500">@${u.username}</div>
                            </td>
                            <td class="px-6 py-4">
                                <span class="px-2 py-1 rounded-full text-[9px] font-bold ${u.role === 'Admin' ? 'bg-indigo-400/10 text-indigo-500' : 'bg-slate-400/10 text-slate-500'} uppercase">
                                    ${u.role}
                                </span>
                            </td>
                            <td class="px-6 py-4">
                                <span class="flex items-center gap-1.5 text-[10px] font-bold ${u.status === 'Active' ? 'text-emerald-500' : 'text-slate-400'}">
                                    <span class="w-1.5 h-1.5 rounded-full ${u.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}"></span>
                                    ${u.status}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-right">
                                <div class="flex justify-end gap-2">
                                    <button onclick="globalBridge.openUserModal('${u.id}')" class="p-2 text-slate-400 hover:text-accent-primary transition-colors">
                                        <i data-feather="edit-2" class="w-4 h-4"></i>
                                    </button>
                                    <button onclick="globalBridge.deleteUser('${u.id}')" class="p-2 text-slate-400 hover:text-red-400 transition-colors">
                                        <i data-feather="trash-2" class="w-4 h-4"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                    ${list.length === 0 ? `<tr><td colspan="4" class="px-6 py-12 text-center text-slate-400 italic">No users found.</td></tr>` : ''}
                </tbody>
            </table>
        </div>
        
        <div class="mt-12 p-6 border-t border-slate-200">
            <h4 class="text-sm font-bold text-slate-900 mb-2 uppercase tracking-widest">System Maintenance</h4>
            <p class="text-xs text-slate-500 mb-6">Reset and initialize the entire application mapping to Google Sheets.</p>
            <button onclick="globalBridge.systemSetupAndMap()" class="px-6 py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl font-bold hover:bg-red-500 hover:text-white transition-all text-xs uppercase tracking-widest flex items-center gap-3">
                <i data-feather="refresh-ccw" class="w-4 h-4"></i> Reset & Initialize Google Sheets Map
            </button>
        </div>
    `;
    if (window.feather) feather.replace();
}

export function renderItems(documents) {
    const container = document.getElementById('content-viewport');
    if (!container) return;
    const list = documents[DOC_TYPES.ITEMS];
    container.innerHTML = `
        <div class="flex justify-between items-center mb-8 animate-up">
            <div>
                <h3 class="text-2xl font-bold text-slate-900 tracking-tight">Items</h3>
                <p class="text-slate-500 text-sm mt-1">Manage your goods and services</p>
            </div>
            <button onclick="globalBridge.openItemModal()" class="btn-primary">
                <i data-feather="plus" class="w-4 h-4"></i> Add Item
            </button>
        </div>

        <div class="glass-panel overflow-hidden border-slate-200 animate-up">
            <div class="overflow-x-auto">
                <table class="responsive-table w-full">
                    <thead class="bg-slate-50 border-b border-slate-200">
                        <tr class="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                            <th class="px-4 py-3 text-left">Item Name</th>
                            <th class="px-4 py-3 text-left">Type</th>
                            <th class="px-4 py-3 text-right">Rate</th>
                            <th class="px-4 py-3 text-right">Stock</th>
                            <th class="px-4 py-3 text-right">Tax (%)</th>
                            <th class="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        ${list.length === 0 ? `
                            <tr>
                                <td colspan="6" class="px-6 py-20 text-center text-slate-500">
                                    <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                        <i data-feather="box" class="w-8 h-8 opacity-20"></i>
                                    </div>
                                    <p class="font-bold text-lg">No items found</p>
                                    <p class="text-xs mt-1">Click "Add Item" to start your inventory.</p>
                                </td>
                            </tr>
                        ` : list.map(item => `
                            <tr class="hover:bg-slate-50 transition-colors group">
                                <td class="px-6 py-4" data-label="Item Name">
                                    <div class="text-slate-900 font-semibold">${item.name}</div>
                                    <div class="text-[10px] text-slate-500">${item.description || 'No description'}</div>
                                </td>
                                <td class="px-6 py-4" data-label="Type">
                                    <span class="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${item.type === 'Goods' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-amber-400/10 text-amber-400'}">
                                        ${item.type}
                                    </span>
                                </td>
                                <td class="px-6 py-4 text-right text-slate-900 font-bold" data-label="Rate">${formatCurrency(item.rate)}</td>
                                <td class="px-6 py-4 text-right text-accent-primary font-bold" data-label="Stock">${item.stock || 0}</td>
                                <td class="px-6 py-4 text-right text-slate-500" data-label="Tax">${item.tax}%</td>
                                <td class="px-6 py-4 text-right actions-cell">
                                    <div class="flex justify-end gap-1">
                                        <button onclick="globalBridge.openItemModal(${JSON.stringify(item).replace(/"/g, '&quot;')})" class="p-2 text-slate-400 hover:text-accent-primary transition-colors">
                                            <i data-feather="edit-2" class="w-4 h-4"></i>
                                        </button>
                                        <button onclick="globalBridge.deleteDoc('${DOC_TYPES.ITEMS}', '${item.id}')" class="p-2 text-slate-400 hover:text-red-400 transition-colors">
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
    if (window.feather) feather.replace();
}

export function renderBanking(documents) {
    const container = document.getElementById('content-viewport');
    if (!container) return;
    const list = documents[DOC_TYPES.BANKING];
    container.innerHTML = `
        <div class="flex justify-between items-center mb-8 animate-up">
            <div>
                <h3 class="text-2xl font-bold text-slate-900 tracking-tight">Banking</h3>
                <p class="text-slate-500 text-sm mt-1">Manage your bank accounts and cash flow</p>
            </div>
            <button onclick="globalBridge.openBankModal()" class="btn-primary">
                <i data-feather="plus" class="w-4 h-4"></i> Add Account
            </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-up">
            ${list.length === 0 ? `
                <div class="col-span-3 glass-panel p-20 text-center border-dashed border-2 border-slate-200 bg-white">
                    <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                        <i data-feather="briefcase" class="w-8 h-8 opacity-20"></i>
                    </div>
                    <p class="text-slate-500 font-bold text-lg">No bank accounts linked</p>
                    <p class="text-slate-500 text-sm mt-2">Connect your business bank accounts to track transactions.</p>
                </div>
            ` : list.map(bank => `
                <div class="glass-panel p-6 border-slate-200 bg-white hover:border-accent-primary/30 transition-all group shadow-sm">
                    <div class="flex justify-between items-start mb-6">
                        <div class="w-12 h-12 bg-accent-primary/10 rounded-xl flex items-center justify-center text-accent-primary border border-accent-primary/20">
                            <i data-feather="home" class="w-6 h-6"></i>
                        </div>
                        <div class="flex gap-1">
                            <button onclick="globalBridge.openBankModal(${JSON.stringify(bank).replace(/"/g, '&quot;')})" class="p-1.5 text-slate-400 hover:text-slate-900"><i data-feather="edit-2" class="w-3.5 h-3.5"></i></button>
                            <button onclick="globalBridge.deleteDoc('${DOC_TYPES.BANKING}', '${bank.id}')" class="p-1.5 text-slate-400 hover:text-red-400"><i data-feather="trash-2" class="w-3.5 h-3.5"></i></button>
                        </div>
                    </div>
                    <div class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">${bank.bankName}</div>
                    <div class="text-xl font-bold text-slate-900 mb-4 tracking-tight">${bank.accountName}</div>
                    <div class="flex justify-between items-end">
                        <div class="text-[10px] font-mono text-slate-400">${bank.accountNumber.replace(/.(?=.{4})/g, '*')}</div>
                        <div class="text-right">
                            <div class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Current Balance</div>
                            <div class="text-lg font-bold text-accent-primary">${formatCurrency(bank.balance)}</div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    if (window.feather) feather.replace();
}

export function renderContactList(container, list, title, icon, modalFn, deleteFn, type) {
    const isVendor = type === DOC_TYPES.VENDORS;
    const accentColor = isVendor ? 'indigo-500' : 'accent-primary';
    const accentBg = isVendor ? 'indigo-500/10' : 'accent-primary/10';
    const accentBorder = isVendor ? 'indigo-500/20' : 'accent-primary/20';

    container.innerHTML = `
        <div class="flex justify-between items-center mb-8 animate-up">
            <div>
                <h3 class="text-2xl font-bold text-slate-900 tracking-tight">${title}</h3>
                <p class="text-slate-500 text-sm mt-1">Manage your business relationships</p>
            </div>
            <button onclick="globalBridge.${modalFn}()" class="btn-primary">
                <i data-feather="${icon}" class="w-4 h-4"></i> Add ${title.slice(0, -1)}
            </button>
        </div>

        <div class="glass-panel overflow-hidden border-slate-200 shadow-sm animate-up bg-white">
            <div class="overflow-x-auto">
                <table class="responsive-table w-full">
                    <thead class="bg-slate-50 border-b border-slate-200">
                        <tr class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                            <th class="px-4 py-3 text-left">Name</th>
                            <th class="px-4 py-3 text-left">Company</th>
                            <th class="px-4 py-3 text-left">Contact Info</th>
                            <th class="px-4 py-3 text-right">GST Details</th>
                            <th class="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        ${list.length === 0 ? `
                            <tr>
                                <td colspan="5" class="px-6 py-24 text-center">
                                    <div class="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-slate-200 shadow-inner">
                                        <i data-feather="${isVendor ? 'briefcase' : 'users'}" class="w-10 h-10 text-slate-400"></i>
                                    </div>
                                    <h4 class="text-slate-900 font-bold text-xl tracking-tight">Empty Directory</h4>
                                    <p class="text-slate-500 text-sm mt-2 max-w-xs mx-auto font-medium">Your ${title.toLowerCase()} list is currently empty. Record your first contact to begin.</p>
                                    <button onclick="globalBridge.${modalFn}()" class="mt-6 text-accent-primary text-[10px] font-bold uppercase tracking-[0.2em] hover:text-slate-900 transition-colors border-b border-accent-primary/20 pb-1">Create Entry Now</button>
                                </td>
                            </tr>
                        ` : list.map(item => `
                            <tr class="hover:bg-slate-50 transition-colors group">
                                <td class="px-6 py-4" data-label="Name">
                                    <div class="flex items-center gap-3">
                                        <div class="w-8 h-8 rounded-full bg-${accentBg} flex items-center justify-center text-${accentColor} border border-${accentBorder} text-xs font-bold">
                                            ${item.displayName.charAt(0)}
                                        </div>
                                        <div>
                                            <div class="text-slate-900 font-semibold">${item.displayName}</div>
                                            <div class="text-[9px] text-slate-500 uppercase tracking-widest font-bold">${item.type}</div>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-6 py-4 text-slate-600 font-medium" data-label="Company">${item.company || '-'}</td>
                                <td class="px-6 py-4" data-label="Contact">
                                    <div class="text-slate-900 text-sm font-medium">${item.email || '-'}</div>
                                    <div class="text-slate-500 text-xs">${item.mobile || item.phone || '-'}</div>
                                </td>
                                <td class="px-6 py-4 text-right" data-label="GST">
                                    <div class="text-accent-primary text-[10px] font-bold uppercase tracking-wider">${item.gstTreatment}</div>
                                    <div class="text-slate-900 font-mono text-xs font-bold">${item.gstin || '-'}</div>
                                </td>
                                <td class="px-6 py-4 text-right actions-cell">
                                    <div class="flex justify-end gap-1">
                                        <button onclick="globalBridge.${modalFn}(${JSON.stringify(item).replace(/"/g, '&quot;')})" class="p-2 text-slate-400 hover:text-accent-primary transition-colors">
                                            <i data-feather="edit-2" class="w-4 h-4"></i>
                                        </button>
                                        <button onclick="globalBridge.${deleteFn}('${item.id}')" class="p-2 text-slate-400 hover:text-red-400 transition-colors">
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
    if (window.feather) feather.replace();
}

export function renderDocumentList(type, documents) {
    const container = document.getElementById('content-viewport');
    if (!container) return;
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
                <h3 class="text-2xl font-bold text-slate-900 tracking-tight">${labels[type]}s</h3>
                <p class="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Total count: ${list.length}</p>
            </div>
            <button onclick="globalBridge.openCreateModal('${type}')" class="btn-primary w-full sm:w-auto">
                <i data-feather="plus" class="w-4 h-4"></i> New ${labels[type]}
            </button>
        </div>
    `;

    if (list.length === 0) {
        html += `
            <div class="glass-panel p-24 text-center flex flex-col items-center animate-up border-slate-200 bg-white shadow-sm">
                <div class="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-8 border border-slate-100 relative">
                    <div class="absolute inset-0 bg-accent-primary/5 blur-xl rounded-full"></div>
                    <i data-feather="inbox" class="w-12 h-12 relative z-10"></i>
                </div>
                <h4 class="text-slate-900 font-bold text-2xl tracking-tight">No ${labels[type]}s detected</h4>
                <p class="text-slate-500 text-sm mt-3 max-w-xs mx-auto font-medium">Capture your business transactions to populate this view. Your system is ready for entry.</p>
                <button onclick="globalBridge.openCreateModal('${type}')" class="mt-10 btn-primary">
                    <i data-feather="plus" class="w-4 h-4"></i> Initialize ${labels[type]}
                </button>
            </div>
        `;
    } else {
        html += `
            <div class="glass-panel overflow-hidden border-slate-200 bg-white shadow-sm animate-up">
                <table class="responsive-table">
                    <thead>
                        <tr class="bg-slate-50 text-slate-400 text-[9px] uppercase tracking-widest font-bold border-b border-slate-200">
                            <th class="px-4 py-3">ID</th>
                            <th class="px-4 py-3">Client/Entity</th>
                            <th class="px-4 py-3">Date</th>
                            <th class="px-4 py-3">Total</th>
                            <th class="px-4 py-3">Balance Due</th>
                            <th class="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        ${list.map(doc => `
                            <tr class="hover:bg-slate-50 transition-colors group">
                                <td class="px-6 py-4 font-mono text-sm text-accent-primary font-bold" data-label="ID">${doc.id}</td>
                                <td class="px-6 py-4 text-slate-900 font-bold" data-label="Client">${doc.client}</td>
                                <td class="px-6 py-4 text-slate-500 text-sm font-medium" data-label="Date">${doc.date}</td>
                                <td class="px-6 py-4 text-slate-900 text-sm font-bold" data-label="Total">${formatCurrency(doc.total)}</td>
                                <td class="px-6 py-4 text-slate-900 font-extrabold" data-label="Balance">${formatCurrency(getDocBalance(doc, type, documents, DOC_TYPES))}</td>
                                <td class="px-6 py-4 text-right space-x-1 flex items-center justify-end actions-cell" data-label="Control">
                                    ${renderConversionButtons(doc, type, documents)}
                                    <button onclick="globalBridge.printDocument('${type}', '${doc.id}')" class="p-2 text-slate-400 hover:text-accent-primary transition-colors" title="Print">
                                        <i data-feather="printer" class="w-4 h-4"></i>
                                    </button>
                                    <button onclick="globalBridge.deleteDoc('${type}', '${doc.id}')" class="p-2 text-slate-400 hover:text-red-400 transition-colors" title="Delete">
                                        <i data-feather="trash-2" class="w-4 h-4"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    container.innerHTML = html;
    if (window.feather) feather.replace();
}

function renderConversionButtons(doc, type, documents) {
    if (type === DOC_TYPES.QUOTES) {
        return `<button onclick="globalBridge.convertDocument('${type}', '${doc.id}', '${DOC_TYPES.SO}')" class="px-3 py-1 bg-accent-secondary/10 border border-accent-secondary/20 text-accent-secondary text-[9px] font-bold uppercase rounded-md hover:bg-accent-secondary/20 transition-all mr-2">To Sales Order</button>`;
    } else if (type === DOC_TYPES.SO) {
        return `
            <button onclick="globalBridge.convertDocument('${type}', '${doc.id}', '${DOC_TYPES.DC}')" class="px-3 py-1 bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 text-[9px] font-bold uppercase rounded-md hover:bg-emerald-400/20 transition-all mr-2">To Chalan</button>
            <button onclick="globalBridge.convertDocument('${type}', '${doc.id}', '${DOC_TYPES.INVOICES}')" class="px-3 py-1 bg-accent-primary/10 border border-accent-primary/20 text-accent-primary text-[9px] font-bold uppercase rounded-md hover:bg-accent-primary/20 transition-all mr-2">To Invoice</button>
            <button onclick="globalBridge.convertDocument('${type}', '${doc.id}', '${DOC_TYPES.PO}')" class="px-3 py-1 bg-amber-400/10 border border-amber-400/20 text-amber-400 text-[9px] font-bold uppercase rounded-md hover:bg-amber-400/20 transition-all mr-2">To Purchase</button>
        `;
    } else if (type === DOC_TYPES.PO) {
        return `<button onclick="globalBridge.convertDocument('${type}', '${doc.id}', '${DOC_TYPES.BILLS}')" class="px-3 py-1 bg-amber-400/10 border border-amber-400/20 text-amber-400 text-[9px] font-bold uppercase rounded-md hover:bg-amber-400/20 transition-all mr-2">To Bill</button>`;
    } else if (type === DOC_TYPES.INVOICES) {
        const balance = getDocBalance(doc, type, documents, DOC_TYPES);
        return `
            <button onclick="globalBridge.openPaymentModal('${DOC_TYPES.PAYMENTS_REC}', { entityId: '${doc.client}', refDoc: '${doc.id}', amount: ${balance} })" class="px-3 py-1 bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 text-[9px] font-bold uppercase rounded-md hover:bg-emerald-400/20 transition-all mr-2">Record Payment</button>
            <button onclick="globalBridge.convertDocument('${type}', '${doc.id}', '${DOC_TYPES.CREDIT_NOTES}')" class="px-3 py-1 bg-red-400/10 border border-red-400/20 text-red-400 text-[9px] font-bold uppercase rounded-md hover:bg-red-400/20 transition-all mr-2">To Credit Note</button>
        `;
    } else if (type === DOC_TYPES.BILLS) {
        const balance = getDocBalance(doc, type, documents, DOC_TYPES);
        return `
            <button onclick="globalBridge.openPaymentModal('${DOC_TYPES.PAYMENTS_MADE}', { entityId: '${doc.client}', refDoc: '${doc.id}', amount: ${balance} })" class="px-3 py-1 bg-amber-400/10 border border-amber-400/20 text-amber-400 text-[9px] font-bold uppercase rounded-md hover:bg-amber-400/20 transition-all mr-2">Record Payment</button>
            <button onclick="globalBridge.convertDocument('${type}', '${doc.id}', '${DOC_TYPES.VENDOR_CREDITS}')" class="px-3 py-1 bg-red-400/10 border border-red-400/20 text-red-400 text-[9px] font-bold uppercase rounded-md hover:bg-red-400/20 transition-all mr-2">To Vendor Credit</button>
        `;
    }
    return '';
}

export function renderReports(subReport = null, documents) {
    const container = document.getElementById('content-viewport');
    if (!container) return;
    if (subReport) {
        switch(subReport) {
            case 'profit-loss': renderProfitLoss(documents); break;
            case 'sales-by-customer': renderSalesByCustomer(documents); break;
            case 'inventory-summary': renderInventorySummary(documents); break;
        }
        return;
    }

    container.innerHTML = `
        <div class="mb-8 animate-up">
            <h3 class="text-2xl font-bold text-slate-900 tracking-tight">Reports</h3>
            <p class="text-slate-500 text-sm mt-1">Insights into your business performance</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-up">
            <div onclick="globalBridge.renderReports('profit-loss')" class="glass-panel p-6 border-slate-200 bg-white hover:border-accent-primary/50 transition-all cursor-pointer group shadow-sm">
                <div class="w-10 h-10 bg-emerald-400/10 rounded-lg flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
                    <i data-feather="trending-up" class="w-5 h-5"></i>
                </div>
                <h4 class="text-slate-900 font-bold mb-2">Profit and Loss</h4>
                <p class="text-slate-500 text-xs font-medium">A summary of your revenue, costs, and expenses.</p>
            </div>
            
            <div onclick="globalBridge.renderReports('sales-by-customer')" class="glass-panel p-6 border-slate-200 bg-white hover:border-accent-primary/50 transition-all cursor-pointer group shadow-sm">
                <div class="w-10 h-10 bg-accent-primary/10 rounded-lg flex items-center justify-center text-accent-primary mb-4 group-hover:scale-110 transition-transform">
                    <i data-feather="pie-chart" class="w-5 h-5"></i>
                </div>
                <h4 class="text-slate-900 font-bold mb-2">Sales by Customer</h4>
                <p class="text-slate-500 text-xs font-medium">Breakdown of sales for each customer over time.</p>
            </div>
            
            <div onclick="globalBridge.renderReports('inventory-summary')" class="glass-panel p-6 border-slate-200 bg-white hover:border-accent-primary/50 transition-all cursor-pointer group shadow-sm">
                <div class="w-10 h-10 bg-amber-400/10 rounded-lg flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
                    <i data-feather="archive" class="w-5 h-5"></i>
                </div>
                <h4 class="text-slate-900 font-bold mb-2">Inventory Summary</h4>
                <p class="text-slate-500 text-xs font-medium">Summary of your items, rates, and tax classes.</p>
            </div>
        </div>
    `;
    if (window.feather) feather.replace();
}

function renderProfitLoss(documents) {
    const container = document.getElementById('content-viewport');
    if (!container) return;
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

    container.innerHTML = `
        <div class="mb-8 animate-up">
            <button onclick="globalBridge.renderReports()" class="text-accent-primary text-xs font-bold uppercase tracking-widest hover:underline mb-4 flex items-center gap-1">
                <i data-feather="arrow-left" class="w-3 h-3"></i> Back to Reports
            </button>
            <h3 class="text-2xl font-bold text-slate-900 tracking-tight">Profit and Loss</h3>
            <p class="text-slate-500 text-sm mt-1 font-medium">Financial summary of revenue and costs</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 animate-up">
            <div class="glass-panel p-6 border-emerald-400/20 bg-emerald-400/5">
                <div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Net Operating Income</div>
                <div class="text-2xl font-bold text-emerald-500">${formatCurrency(netSales)}</div>
            </div>
            <div class="glass-panel p-6 border-red-400/20 bg-red-400/5">
                <div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Operating Expenses</div>
                <div class="text-2xl font-bold text-red-500">${formatCurrency(totalOutflow)}</div>
            </div>
            <div class="glass-panel p-6 border-accent-primary/20 bg-accent-primary/5">
                <div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Net Profit/Loss</div>
                <div class="text-2xl font-bold text-slate-900">${formatCurrency(netProfit)}</div>
            </div>
        </div>

        <div class="glass-panel p-8 border-slate-200 bg-white shadow-sm animate-up" style="animation-delay: 100ms">
            <h4 class="text-slate-900 font-bold text-sm uppercase tracking-widest mb-8 border-b border-slate-100 pb-4">Detailed Breakdown</h4>
            <div class="space-y-6">
                <div class="flex justify-between items-center text-sm">
                    <span class="text-slate-500 font-medium">Net Sales Income (Invoices - Credits)</span>
                    <span class="text-slate-900 font-mono font-bold">${formatCurrency(netSales)}</span>
                </div>
                <div class="flex justify-between items-center text-sm">
                    <span class="text-slate-500 font-medium">Net Cost of Goods (Bills - Credits)</span>
                    <span class="text-slate-900 font-mono font-bold">(${formatCurrency(netPurchases)})</span>
                </div>
                 <div class="flex justify-between items-center text-sm">
                    <span class="text-slate-500 font-medium">Other Expenses</span>
                    <span class="text-slate-900 font-mono font-bold">(${formatCurrency(totalExpenses)})</span>
                </div>
                <div class="border-t border-slate-100 pt-4 flex justify-between items-center">
                    <span class="text-slate-900 font-bold uppercase text-[10px] tracking-widest">Gross Profit</span>
                    <span class="text-slate-900 font-mono font-bold text-xl">${formatCurrency(netProfit)}</span>
                </div>
            </div>
        </div>
    `;
    if (window.feather) feather.replace();
}

function renderSalesByCustomer(documents) {
    const container = document.getElementById('content-viewport');
    if (!container) return;
    const customerSales = {};
    documents[DOC_TYPES.INVOICES].forEach(inv => {
        customerSales[inv.client] = (customerSales[inv.client] || 0) + inv.total;
    });
    documents[DOC_TYPES.CREDIT_NOTES].forEach(cn => {
        customerSales[cn.client] = (customerSales[cn.client] || 0) - cn.total;
    });

    const sortedCustomers = Object.entries(customerSales).sort((a, b) => b[1] - a[1]);

    container.innerHTML = `
        <div class="mb-8 animate-up">
            <button onclick="globalBridge.renderReports()" class="text-accent-primary text-xs font-bold uppercase tracking-widest hover:underline mb-4 flex items-center gap-1">
                <i data-feather="arrow-left" class="w-3 h-3"></i> Back to Reports
            </button>
            <h3 class="text-2xl font-bold text-slate-900 tracking-tight">Sales by Customer</h3>
            <p class="text-slate-500 text-sm mt-1 font-medium">Breakdown of revenue generated by each customer</p>
        </div>

        <div class="glass-panel overflow-hidden border-slate-200 shadow-sm animate-up bg-white">
            <table class="w-full">
                <thead class="bg-slate-50 border-b border-slate-200">
                    <tr class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <th class="px-6 py-4 text-left">Customer Name</th>
                        <th class="px-6 py-4 text-right">Total Revenue</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-sm">
                    ${sortedCustomers.length === 0 ? `
                        <tr><td colspan="2" class="px-6 py-12 text-center text-slate-400 italic">No sales data available.</td></tr>
                    ` : sortedCustomers.map(([name, amount]) => `
                        <tr class="hover:bg-slate-50 transition-colors">
                            <td class="px-6 py-4 text-slate-900 font-bold">${name}</td>
                            <td class="px-6 py-4 text-right text-slate-900 font-mono font-bold">${formatCurrency(amount)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    if (window.feather) feather.replace();
}

function renderInventorySummary(documents) {
    const container = document.getElementById('content-viewport');
    if (!container) return;
    const items = documents[DOC_TYPES.ITEMS];

    container.innerHTML = `
        <div class="mb-8 animate-up">
            <button onclick="globalBridge.renderReports()" class="text-accent-primary text-xs font-bold uppercase tracking-widest hover:underline mb-4 flex items-center gap-1">
                <i data-feather="arrow-left" class="w-3 h-3"></i> Back to Reports
            </button>
            <h3 class="text-2xl font-bold text-slate-900 tracking-tight">Inventory Summary</h3>
            <p class="text-slate-500 text-sm mt-1 font-medium">Listing of products, services, and pricing details</p>
        </div>

        <div class="glass-panel overflow-hidden border-slate-200 shadow-sm animate-up bg-white">
            <table class="w-full">
                <thead class="bg-slate-50 border-b border-slate-200">
                    <tr class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <th class="px-6 py-4 text-left">Item Name</th>
                        <th class="px-4 py-3 text-left">Type</th>
                        <th class="px-6 py-4 text-right">Stock</th>
                        <th class="px-6 py-4 text-right">Standard Rate</th>
                        <th class="px-6 py-4 text-right">Default Tax %</th>
                        <th class="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-sm">
                    ${items.length === 0 ? `
                        <tr><td colspan="6" class="px-6 py-12 text-center text-slate-400 italic">No items in inventory.</td></tr>
                    ` : items.map(item => `
                        <tr class="hover:bg-slate-50 transition-colors">
                            <td class="px-6 py-4 text-slate-900 font-bold">${item.name}</td>
                            <td class="px-4 py-3 text-slate-400 font-medium uppercase text-[10px]">${item.type}</td>
                            <td class="px-6 py-4 text-right text-accent-primary font-bold">${item.stock || 0}</td>
                            <td class="px-6 py-4 text-right text-slate-900 font-mono font-bold">${formatCurrency(item.rate)}</td>
                            <td class="px-6 py-4 text-right text-accent-secondary font-bold font-mono">${item.tax}%</td>
                            <td class="px-6 py-4 text-right actions-cell">
                                <div class="flex justify-end gap-1">
                                    <button onclick="globalBridge.openItemModal(${JSON.stringify(item).replace(/"/g, '&quot;')})" class="p-2 text-slate-400 hover:text-accent-primary transition-colors">
                                        <i data-feather="edit-2" class="w-4 h-4"></i>
                                    </button>
                                    <button onclick="globalBridge.deleteDoc('${DOC_TYPES.ITEMS}', '${item.id}')" class="p-2 text-slate-400 hover:text-red-400 transition-colors">
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
    if (window.feather) feather.replace();
}

export function renderCustomers(documents) {
    const container = document.getElementById('content-viewport');
    if (!container) return;
    const list = documents[DOC_TYPES.CUSTOMERS];
    renderContactList(container, list, 'Customers', 'user-plus', 'openCustomerModal', 'deleteCustomer', DOC_TYPES.CUSTOMERS);
}

export function renderVendors(documents) {
    const container = document.getElementById('content-viewport');
    if (!container) return;
    const list = documents[DOC_TYPES.VENDORS];
    renderContactList(container, list, 'Vendors', 'user-check', 'openVendorModal', 'deleteVendor', DOC_TYPES.VENDORS);
}

export function renderContactModal(label, editData, saveFn) {
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
                            <span class="text-sm text-slate-800 font-medium">Business</span>
                        </label>
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="entity-type" value="Individual" ${editData && editData.type === 'Individual' ? 'checked' : ''} class="accent-accent-primary">
                            <span class="text-sm text-slate-800 font-medium">Individual</span>
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
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-100">
            <div>
                <h4 class="text-slate-900 font-bold text-xs uppercase tracking-widest mb-4">Billing Address</h4>
                <textarea id="entity-bill-address" class="form-input h-24" placeholder="Street, City, Zip, State">${editData ? editData.billingAddress : ''}</textarea>
            </div>
            <div>
                <div class="flex justify-between items-center mb-4">
                    <h4 class="text-slate-900 font-bold text-xs uppercase tracking-widest">Shipping Address</h4>
                    <button onclick="globalBridge.copyEntityAddress()" class="text-[9px] font-bold text-accent-primary uppercase tracking-widest hover:underline">Copy from Billing</button>
                </div>
                <textarea id="entity-ship-address" class="form-input h-24" placeholder="Street, City, Zip, State">${editData ? editData.shippingAddress : ''}</textarea>
            </div>
        </div>
    `;

    document.getElementById('save-btn').onclick = () => saveFn(editData ? editData.id : null);
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.remove('opacity-0'), 10);
    if (window.feather) feather.replace();
}

export function openPaymentModal(type, prefillData, documents) {
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
                    <input list="payment-entity-list" id="payment-entity" class="form-input" onchange="globalBridge.updateRefDocs(this.value, ${isPurchase})" value="${prefillData && prefillData.entityId ? prefillData.entityId : ''}">
                    <datalist id="payment-entity-list">
                        ${entities.map(e => `<option value="${e.company || e.displayName}">${e.displayName}</option>`).join('')}
                    </datalist>
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

    document.getElementById('save-btn').onclick = () => globalBridge.savePayment(type);
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.remove('opacity-0'), 10);
    if (window.feather) feather.replace();
}

export function updateRefDocs(entityName, isPurchase, documents) {
    const select = document.getElementById('payment-ref-doc');
    if (!select) return;
    
    const type = isPurchase ? DOC_TYPES.BILLS : DOC_TYPES.INVOICES;
    const docs = documents[type].filter(d => d.client === entityName);
    
    select.innerHTML = '<option value="">-- Select Document --</option>' + 
        docs.map(d => `<option value="${d.id}">${d.id} (₹${d.total})</option>`).join('');
}

export function showCloudWarning() {
    const viewport = document.getElementById('content-viewport');
    if (!viewport) return;
    
    const banner = document.createElement('div');
    banner.className = 'bg-amber-50 border border-amber-200 p-4 rounded-xl mb-6 flex items-center justify-between animate-up shadow-sm';
    banner.innerHTML = `
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 border border-amber-200">
                <i data-feather="alert-triangle" class="w-5 h-5"></i>
            </div>
            <div>
                <div class="text-slate-900 text-xs font-bold uppercase tracking-widest">Cloud Configuration Required</div>
                <div class="text-slate-500 text-[10px] font-medium leading-relaxed">Your application is currently running in <b>Local Mode</b>. To enable cloud sync, please update your Google Apps Script configuration.</div>
            </div>
        </div>
        <button onclick="this.parentElement.remove()" class="text-slate-400 hover:text-slate-900"><i data-feather="x" class="w-4 h-4"></i></button>
    `;
    viewport.prepend(banner);
    if (window.feather) feather.replace();
}

export function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobile-overlay');
}

export function openCreateModal(type, prefillData = null, documents) {
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
        [DOC_TYPES.VENDOR_CREDITS]: 'Vendor Credit'
    };

    document.getElementById('modal-title').textContent = (prefillData && prefillData.id) ? `Edit ${labels[type]}` : `New ${labels[type]}`;
    const container = document.getElementById('modal-form-container');
    
    const isPurchase = [DOC_TYPES.PO, DOC_TYPES.BILLS, DOC_TYPES.VENDOR_CREDITS, DOC_TYPES.EXPENSES].includes(type);
    const entityLabel = isPurchase ? 'Vendor' : 'Customer';
    const entities = isPurchase ? documents[DOC_TYPES.VENDORS] : documents[DOC_TYPES.CUSTOMERS];

    container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="space-y-4">
                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Entity Details</label>
                <input list="entity-list" id="doc-client" class="form-input" placeholder="Select ${entityLabel} *" value="${prefillData ? prefillData.client : ''}" onchange="globalBridge.prefillFromEntity(this.value)">
                <datalist id="entity-list">
                    ${entities.map(e => `<option value="${e.company || e.displayName}">${e.displayName}</option>`).join('')}
                </datalist>
            </div>
            <div class="space-y-4">
                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Document ID</label>
                <input type="text" id="doc-id" class="form-input bg-slate-50" value="${prefillData ? prefillData.id : type.toUpperCase().slice(0,3) + '-' + Date.now().toString().slice(-6)}" readonly>
            </div>
            <div class="space-y-4">
                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Date</label>
                <input type="date" id="doc-date" class="form-input" value="${prefillData ? prefillData.date : new Date().toISOString().split('T')[0]}">
            </div>
        </div>

        <div class="overflow-x-auto mb-8 rounded-xl border border-slate-200">
            <table class="w-full text-left text-sm">
                <thead class="bg-slate-50 text-[10px] uppercase tracking-widest font-bold text-slate-500">
                    <tr>
                        <th class="px-4 py-3">Item details</th>
                        <th class="px-4 py-3 w-24">Quantity</th>
                        <th class="px-4 py-3 w-32">Rate</th>
                        <th class="px-4 py-3 w-24">Tax %</th>
                        <th class="px-4 py-3 w-32 text-right">Amount</th>
                        <th class="px-4 py-3 w-16"></th>
                    </tr>
                </thead>
                <tbody id="line-items-body" class="divide-y divide-slate-100">
                    <!-- Rows injected here -->
                </tbody>
            </table>
        </div>

        <button onclick="globalBridge.addRow()" class="text-accent-primary text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 mb-8 hover:bg-accent-primary/5 px-3 py-1.5 rounded-lg transition-all">
            <i data-feather="plus-circle" class="w-4 h-4"></i> Add another line
        </button>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t border-slate-100">
            <div class="space-y-6">
                <div>
                    <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Customer Notes</label>
                    <textarea id="doc-notes" class="form-input h-24" placeholder="Will be displayed on the document">${prefillData ? (prefillData.notes || '') : ''}</textarea>
                </div>
                <div>
                    <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Terms & Conditions</label>
                    <textarea id="doc-terms" class="form-input h-24" placeholder="Standard terms apply">${prefillData ? (prefillData.terms || '') : ''}</textarea>
                </div>
            </div>
            <div class="bg-slate-50 rounded-2xl p-8 space-y-4">
                <div class="flex justify-between text-slate-500 font-medium">
                    <span>Sub Total</span>
                    <span id="subtotal" class="font-mono">₹0.00</span>
                </div>
                <div class="flex justify-between text-slate-500 font-medium">
                    <span>Tax Total</span>
                    <span id="tax-total" class="font-mono">₹0.00</span>
                </div>
                <div class="flex justify-between text-slate-900 text-xl font-bold pt-4 border-t border-slate-200">
                    <span>Total (₹)</span>
                    <span id="grand-total" class="font-mono text-accent-primary">₹0.00</span>
                </div>
            </div>
        </div>
    `;

    if (prefillData && prefillData.items) {
        prefillData.items.forEach(item => addRow(item, documents));
    } else {
        addRow(null, documents);
    }

    document.getElementById('save-btn').onclick = () => globalBridge.saveDoc(type);
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.remove('opacity-0'), 10);
    if (window.feather) feather.replace();
}

export function addRow(prefill = null, documents) {
    const tbody = document.getElementById('line-items-body');
    if (!tbody) return;
    const tr = document.createElement('tr');
    tr.className = 'group hover:bg-slate-50/50 transition-colors';
    
    tr.innerHTML = `
        <td class="px-4 py-4">
            <input list="items-list" class="form-input item-name font-bold" placeholder="Select or type item..." value="${prefill ? prefill.name : ''}" onchange="globalBridge.pickItem(this)">
            <datalist id="items-list">
                ${documents[DOC_TYPES.ITEMS].map(i => `<option value="${i.name}">${formatCurrency(i.rate)} per unit</option>`).join('')}
            </datalist>
        </td>
        <td class="px-4 py-4">
            <input type="number" class="form-input item-qty" value="${prefill ? prefill.qty : 1}" oninput="globalBridge.updateCalculations()">
        </td>
        <td class="px-4 py-4">
            <input type="number" class="form-input item-rate" value="${prefill ? prefill.rate : 0}" oninput="globalBridge.updateCalculations()">
        </td>
        <td class="px-4 py-4">
            <input type="number" class="form-input item-tax" value="${prefill ? prefill.tax : 0}" oninput="globalBridge.updateCalculations()">
        </td>
        <td class="px-4 py-4 text-right font-bold text-slate-900">
            <input type="number" class="hidden item-amount" value="0">
            <span class="amount-display font-mono">₹0.00</span>
        </td>
        <td class="px-4 py-4 text-center">
            <button onclick="this.closest('tr').remove(); globalBridge.updateCalculations()" class="p-2 text-slate-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                <i data-feather="trash-2" class="w-4 h-4"></i>
            </button>
        </td>
    `;
    
    tbody.appendChild(tr);
    updateCalculations();
    if (window.feather) feather.replace();
}

export function pickItem(input, documents) {
    const row = input.closest('tr');
    const itemName = input.value;
    const item = documents[DOC_TYPES.ITEMS].find(i => i.name === itemName);
    
    if (item) {
        row.querySelector('.item-rate').value = item.rate;
        row.querySelector('.item-tax').value = item.tax || 0;
        updateCalculations();
    }
}

export function updateCalculations() {
    let subtotal = 0;
    let taxTotal = 0;
    
    document.querySelectorAll('#line-items-body tr').forEach(row => {
        const qty = parseFloat(row.querySelector('.item-qty').value || 0);
        const rate = parseFloat(row.querySelector('.item-rate').value || 0);
        const taxPercent = parseFloat(row.querySelector('.item-tax').value || 0);
        
        const amount = qty * rate;
        const tax = amount * (taxPercent / 100);
        
        row.querySelector('.item-amount').value = (amount + tax).toFixed(2);
        row.querySelector('.amount-display').textContent = formatCurrency(amount + tax);
        
        subtotal += amount;
        taxTotal += tax;
    });
    
    const subtotalEl = document.getElementById('subtotal');
    if (subtotalEl) subtotalEl.textContent = formatCurrency(subtotal);
    const taxTotalEl = document.getElementById('tax-total');
    if (taxTotalEl) taxTotalEl.textContent = formatCurrency(taxTotal);
    const grandTotalEl = document.getElementById('grand-total');
    if (grandTotalEl) grandTotalEl.textContent = formatCurrency(subtotal + taxTotal);
}

export function prefillFromEntity(entityName, documents) {
    const isVendor = documents[DOC_TYPES.VENDORS].find(v => (v.company || v.displayName) === entityName);
    const isCustomer = documents[DOC_TYPES.CUSTOMERS].find(c => (c.company || c.displayName) === entityName);
    const entity = isVendor || isCustomer;
    
    if (entity && entity.billingAddress) {
        document.getElementById('doc-notes').value = `Billing Address:\n${entity.billingAddress}\n\nGSTIN: ${entity.gstin || 'N/A'}`;
    }
}

export function printDocument(type, id, documents) {
    const doc = documents[type].find(d => d.id === id);
    if (!doc) return;

    const printWindow = window.open('', '_blank');
    const html = `
        <html>
        <head>
            <title>${type.toUpperCase()} - ${id}</title>
            <style>
                body { font-family: 'Plus Jakarta Sans', sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
                .header { display: flex; justify-content: space-between; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 30px; }
                .company-name { font-size: 24px; font-weight: 800; color: #06b6d4; letter-spacing: -0.025em; }
                .doc-type { font-size: 28px; font-weight: 800; text-transform: uppercase; color: #1e293b; }
                .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 30px; }
                .meta-box h4 { font-size: 10px; text-transform: uppercase; color: #64748b; margin-bottom: 8px; letter-spacing: 0.1em; }
                .meta-box p { font-weight: 600; font-size: 14px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                th { background: #f8fafc; text-align: left; padding: 12px; font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 700; border-bottom: 1px solid #e2e8f0; }
                td { padding: 12px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
                .totals { margin-left: auto; width: 300px; }
                .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
                .grand-total { border-top: 2px solid #f1f5f9; margin-top: 10px; padding-top: 10px; font-weight: 800; font-size: 18px; color: #06b6d4; }
                .footer { margin-top: 50px; font-size: 11px; color: #94a3b8; text-align: center; }
            </style>
        </head>
        <body>
            <div class="header">
                <div>
                    <div class="company-name">ASYNCRIX GLOBAL</div>
                    <p style="font-size: 12px; color: #64748b;">Enterprise Business Systems</p>
                </div>
                <div class="doc-type">${type.toUpperCase().slice(0, -1)}</div>
            </div>
            <div class="meta">
                <div class="meta-box">
                    <h4>Bill To</h4>
                    <p>${doc.client}</p>
                    <p style="font-size: 12px; color: #64748b; white-space: pre-line;">${doc.notes || ''}</p>
                </div>
                <div class="meta-box" style="text-align: right;">
                    <h4>Document Info</h4>
                    <p>${type.slice(0, -1)} #: ${doc.id}</p>
                    <p>Date: ${doc.date}</p>
                    <p>Status: ${doc.status}</p>
                </div>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Item Details</th>
                        <th style="text-align: right;">Qty</th>
                        <th style="text-align: right;">Rate</th>
                        <th style="text-align: right;">Tax %</th>
                        <th style="text-align: right;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${doc.items.map(item => `
                        <tr>
                            <td style="font-weight: 600;">${item.name}</td>
                            <td style="text-align: right;">${item.qty}</td>
                            <td style="text-align: right;">${formatCurrency(item.rate)}</td>
                            <td style="text-align: right;">${item.tax}%</td>
                            <td style="text-align: right;">${formatCurrency(item.amount)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <div class="totals">
                <div class="total-row"><span>Sub Total</span><span>${formatCurrency(doc.subtotal)}</span></div>
                <div class="total-row"><span>Tax Total</span><span>${formatCurrency(doc.taxTotal)}</span></div>
                <div class="total-row grand-total"><span>Total Amount</span><span>${formatCurrency(doc.total)}</span></div>
            </div>
            <div class="footer">
                <p>This is a computer generated document. No signature required.</p>
                <p>Powered by ASYNCRIX Enterprise Resource Engine</p>
            </div>
            <script>
                window.onload = function() { window.print(); }
            </script>
        </body>
        </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
}

export function closeModal() {
    const modal = document.getElementById('form-modal');
    modal.classList.add('opacity-0');
    setTimeout(() => modal.classList.add('hidden'), 300);
}

export function openUserModal(id, documents) {
    const editData = id ? documents[DOC_TYPES.USERS].find(u => u.id === id) : null;
    const modal = document.getElementById('form-modal');
    document.getElementById('modal-title').textContent = editData ? 'Edit User' : 'New User';
    const container = document.getElementById('modal-form-container');
    
    container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 animate-up">
            <div class="space-y-6">
                <div>
                    <label class="block text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">Display Name</label>
                    <input type="text" id="user-name" class="form-input" placeholder="Full Name *" value="${editData ? editData.name : ''}" required>
                </div>
                <div>
                    <label class="block text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">Username</label>
                    <input type="text" id="user-username" class="form-input" placeholder="Sign-in username *" value="${editData ? editData.username : ''}" required>
                </div>
                <div>
                    <label class="block text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">Password</label>
                    <input type="password" id="user-password" class="form-input" placeholder="Set password" value="${editData ? editData.password : ''}">
                </div>
            </div>
            <div class="space-y-6">
                <div>
                    <label class="block text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">Access Role</label>
                    <select id="user-role" class="form-input">
                        <option value="Staff" ${editData && editData.role === 'Staff' ? 'selected' : ''}>Staff (Restricted Access)</option>
                        <option value="Admin" ${editData && editData.role === 'Admin' ? 'selected' : ''}>Administrator (Full Access)</option>
                    </select>
                </div>
                <div>
                    <label class="block text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">Account Status</label>
                    <select id="user-status" class="form-input">
                        <option value="Active" ${editData && editData.status === 'Active' ? 'selected' : ''}>Active</option>
                        <option value="Disabled" ${editData && editData.status === 'Disabled' ? 'selected' : ''}>Disabled</option>
                    </select>
                </div>
            </div>
        </div>
    `;

    document.getElementById('save-btn').onclick = () => globalBridge.saveUser(id);
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.remove('opacity-0'), 10);
    if (window.feather) feather.replace();
}

export function openItemModal(editData = null) {
    const modal = document.getElementById('form-modal');
    document.getElementById('modal-title').textContent = editData ? 'Edit Item' : 'New Item';
    const container = document.getElementById('modal-form-container');
    
    container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 animate-up">
            <div class="space-y-6">
                <div>
                    <label class="block text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">Item Type</label>
                    <div class="flex gap-4">
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="item-type" value="Goods" ${!editData || editData.type === 'Goods' ? 'checked' : ''} class="accent-accent-primary">
                            <span class="text-sm text-slate-800 font-medium">Goods</span>
                        </label>
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="item-type" value="Services" ${editData && editData.type === 'Services' ? 'checked' : ''} class="accent-accent-primary">
                            <span class="text-sm text-slate-800 font-medium">Services</span>
                        </label>
                    </div>
                </div>
                <input type="text" id="item-name" class="form-input font-bold" placeholder="Item Name *" value="${editData ? editData.name : ''}" required>
                <textarea id="item-desc" class="form-input h-24" placeholder="Item Description">${editData ? (editData.description || '') : ''}</textarea>
            </div>
            <div class="space-y-6">
                <div>
                    <label class="block text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">Sales Information</label>
                    <div class="grid grid-cols-2 gap-4">
                        <input type="number" id="item-rate" class="form-input font-mono" placeholder="Selling Price *" value="${editData ? editData.rate : ''}">
                        <input type="number" id="item-tax" class="form-input font-mono" placeholder="Tax (%)" value="${editData ? editData.tax : 0}">
                    </div>
                </div>
                <div class="pt-2">
                    <label class="block text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">Inventory Stock</label>
                    <input type="number" id="item-stock" class="form-input font-mono" placeholder="Opening Stock" value="${editData ? (editData.stock || 0) : 0}">
                </div>
            </div>
        </div>
    `;

    document.getElementById('save-btn').onclick = () => globalBridge.saveItem(editData ? editData.id : null);
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.remove('opacity-0'), 10);
    if (window.feather) feather.replace();
}

export function openBankModal(editData = null) {
    const modal = document.getElementById('form-modal');
    document.getElementById('modal-title').textContent = editData ? 'Edit Bank Account' : 'Add Bank Account';
    const container = document.getElementById('modal-form-container');
    
    container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 animate-up">
            <div class="space-y-6">
                <div>
                    <label class="block text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">Bank Name</label>
                    <input type="text" id="bank-name" class="form-input" placeholder="e.g. HDFC Bank *" value="${editData ? editData.bankName : ''}" required>
                </div>
                <div>
                    <label class="block text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">Account Name</label>
                    <input type="text" id="bank-acc-name" class="form-input" placeholder="Branch location or alias *" value="${editData ? editData.accountName : ''}">
                </div>
                <div>
                    <label class="block text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">Account Number</label>
                    <input type="text" id="bank-acc-num" class="form-input font-mono" placeholder="Account Number *" value="${editData ? editData.accountNumber : ''}">
                </div>
            </div>
            <div class="space-y-6">
                <div>
                    <label class="block text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">Opening Balance</label>
                    <input type="number" id="bank-balance" class="form-input font-mono text-lg" placeholder="Initial Balance" value="${editData ? editData.balance : 0}">
                </div>
            </div>
        </div>
    `;

    document.getElementById('save-btn').onclick = () => globalBridge.saveBank(editData ? editData.id : null);
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.remove('opacity-0'), 10);
    if (window.feather) feather.replace();
}

export function openVendorModal(editData = null) {
    renderContactModal('Vendor', editData, globalBridge.saveVendor);
}

export function openCustomerModal(editData = null) {
    renderContactModal('Customer', editData, globalBridge.saveCustomer);
}

export function copyEntityAddress() {
    const bill = document.getElementById('entity-bill-address');
    const ship = document.getElementById('entity-ship-address');
    if (bill && ship) ship.value = bill.value;
}
