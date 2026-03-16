import { DOC_TYPES, STORAGE_KEYS } from './constants.js';
import { saveToCloud, deleteFromCloud, clearAllCloudData, initializeCloudMapping } from './database.js';
import { showToast } from './ui.js';

export async function saveEntity(id, type, prefix, documents, renderFn, closeModal) {
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
    renderFn();
    if (success) showToast(`${displayName} saved successfully!`, 'success');
    else showToast('Local save success, but Cloud Sync failed.', 'error');
}

export async function deleteEntity(id, type, label, documents, renderFn) {
    if (localStorage.getItem('hub_user_role') !== 'Admin') {
        showToast(`Insufficient permissions to delete ${label.toLowerCase()}s.`, 'error');
        return;
    }
    if (!confirm(`Are you sure you want to delete this ${label.toLowerCase()}?`)) return;
    
    documents[type] = documents[type].filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEYS[type], JSON.stringify(documents[type]));
    const success = await deleteFromCloud(type, id);
    renderFn();
    if (success) showToast(`${label} deleted.`, 'success');
    else showToast('Removed locally, but Cloud sync failed.', 'error');
}

export async function saveItem(id, documents, renderFn, closeModal) {
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
    renderFn();
    if (success) showToast(`Item "${name}" saved!`, 'success');
    else showToast('Local save success, but Cloud Sync failed.', 'error');
}

export async function saveBank(id, documents, renderFn, closeModal) {
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
    renderFn();
    if (success) showToast(`Bank "${bankName}" updated!`, 'success');
    else showToast('Cloud sync failed for treasury.', 'error');
}

export async function saveUser(id, documents, renderFn, closeModal) {
    const name = document.getElementById('user-name').value.trim();
    const username = document.getElementById('user-username').value.trim();
    const role = document.getElementById('user-role').value;
    const status = document.getElementById('user-status').value;

    if (!name || !username) {
        alert('Name and Username are required.');
        return;
    }

    const user = {
        id: id || ('USER-' + Date.now().toString().slice(-6)),
        name,
        username,
        password: document.getElementById('user-password').value,
        role,
        status,
        created: new Date().toISOString()
    };

    if (id) {
        const index = documents[DOC_TYPES.USERS].findIndex(u => u.id === id);
        if (index !== -1) documents[DOC_TYPES.USERS][index] = user;
    } else {
        documents[DOC_TYPES.USERS].unshift(user);
    }

    localStorage.setItem(STORAGE_KEYS[DOC_TYPES.USERS], JSON.stringify(documents[DOC_TYPES.USERS]));
    const success = await saveToCloud(DOC_TYPES.USERS, user);
    closeModal();
    renderFn();
    if (success) showToast(`User "${name}" saved!`, 'success');
    else showToast('Local save success, but Cloud Sync failed.', 'error');
}

export async function deleteUser(id, documents, renderFn) {
    if (localStorage.getItem('hub_user_role') !== 'Admin') {
        showToast('Only Admins can delete users.', 'error');
        return;
    }
    if (!confirm('Are you sure you want to delete this user?')) return;

    documents[DOC_TYPES.USERS] = documents[DOC_TYPES.USERS].filter(u => u.id !== id);
    localStorage.setItem(STORAGE_KEYS[DOC_TYPES.USERS], JSON.stringify(documents[DOC_TYPES.USERS]));
    const success = await deleteFromCloud(DOC_TYPES.USERS, id);
    renderFn();
    if (success) showToast('User deleted.', 'success');
    else showToast('Removed locally, but Cloud sync failed.', 'error');
}

export async function saveDoc(type, documents, renderFn, closeModal) {
    const tableRows = document.querySelectorAll('#line-items-body tr');
    const items = [];
    tableRows.forEach(row => {
        const nameInput = row.querySelector('.item-name');
        if (nameInput && nameInput.value.trim()) {
            items.push({
                name: nameInput.value,
                qty: parseFloat(row.querySelector('.item-qty').value || 0),
                rate: parseFloat(row.querySelector('.item-rate').value || 0),
                tax: parseFloat(row.querySelector('.item-tax').value || 0),
                amount: parseFloat(row.querySelector('.item-amount').value || 0)
            });
        }
    });

    if (items.length === 0) {
        alert('Please add at least one item.');
        return;
    }

    const doc = {
        id: document.getElementById('doc-id').value,
        client: document.getElementById('doc-client').value,
        date: document.getElementById('doc-date').value,
        items: items,
        subtotal: parseFloat(document.getElementById('subtotal').textContent.replace(/[^\d.]/g, '')),
        taxTotal: parseFloat(document.getElementById('tax-total').textContent.replace(/[^\d.]/g, '')),
        total: parseFloat(document.getElementById('grand-total').textContent.replace(/[^\d.]/g, '')),
        status: 'Draft',
        notes: document.getElementById('doc-notes').value,
        terms: document.getElementById('doc-terms').value
    };

    documents[type].unshift(doc);
    localStorage.setItem(STORAGE_KEYS[type], JSON.stringify(documents[type]));
    const success = await saveToCloud(type, doc);

    // --- Dynamic Flow: Stock and Banking Integration ---
    if (type === DOC_TYPES.INVOICES || type === DOC_TYPES.DC) {
        for (const line of items) {
            const inventItem = documents[DOC_TYPES.ITEMS].find(i => i.name === line.name);
            if (inventItem) {
                inventItem.stock -= line.qty;
                localStorage.setItem(STORAGE_KEYS[DOC_TYPES.ITEMS], JSON.stringify(documents[DOC_TYPES.ITEMS]));
                await saveToCloud(DOC_TYPES.ITEMS, inventItem);
            }
        }
    }

    if (type === DOC_TYPES.BILLS) {
        for (const line of items) {
            const inventItem = documents[DOC_TYPES.ITEMS].find(i => i.name === line.name);
            if (inventItem) {
                inventItem.stock += line.qty;
                localStorage.setItem(STORAGE_KEYS[DOC_TYPES.ITEMS], JSON.stringify(documents[DOC_TYPES.ITEMS]));
                await saveToCloud(DOC_TYPES.ITEMS, inventItem);
            }
        }
    }

    closeModal();
    renderFn();
    if (success) showToast(`Document ${doc.id} saved!`, 'success');
    else showToast('Local save success, but Cloud Sync failed.', 'error');
}

export async function deleteDoc(type, id, documents, renderFn) {
    if (localStorage.getItem('hub_user_role') !== 'Admin') {
        showToast('Insufficient permissions to delete documents.', 'error');
        return;
    }
    if (!confirm('Are you sure you want to delete this document?')) return;

    const docToDelete = documents[type].find(d => d.id === id);
    
    // --- Dynamic Flow: Reverse Stock Adjustments ---
    if (docToDelete && docToDelete.items) {
        if (type === DOC_TYPES.INVOICES || type === DOC_TYPES.DC) {
            for (const line of docToDelete.items) {
                const inventItem = documents[DOC_TYPES.ITEMS].find(i => i.name === line.name);
                if (inventItem) {
                    inventItem.stock += line.qty;
                    localStorage.setItem(STORAGE_KEYS[DOC_TYPES.ITEMS], JSON.stringify(documents[DOC_TYPES.ITEMS]));
                    await saveToCloud(DOC_TYPES.ITEMS, inventItem);
                }
            }
        }
        if (type === DOC_TYPES.BILLS) {
            for (const line of docToDelete.items) {
                const inventItem = documents[DOC_TYPES.ITEMS].find(i => i.name === line.name);
                if (inventItem) {
                    inventItem.stock -= line.qty;
                    localStorage.setItem(STORAGE_KEYS[DOC_TYPES.ITEMS], JSON.stringify(documents[DOC_TYPES.ITEMS]));
                    await saveToCloud(DOC_TYPES.ITEMS, inventItem);
                }
            }
        }
    }

    documents[type] = documents[type].filter(d => d.id !== id);
    localStorage.setItem(STORAGE_KEYS[type], JSON.stringify(documents[type]));
    const success = await deleteFromCloud(type, id);
    renderFn();
    if (success) showToast('Document deleted.', 'success');
    else showToast('Removed locally, but Cloud sync failed.', 'error');
}

export async function savePayment(type, documents, renderFn, closeModal) {
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
    renderFn();
    
    if (successMain && bankSuccess) {
        showToast('Payment recorded & synced!', 'success');
    } else {
        showToast("Payment saved locally, but Cloud Sync failed.", "error");
    }
}

export async function systemSetupAndMap(documents) {
    if (!confirm('WARNING: This will PERMANENTLY delete all local and cloud data to provide a clean slate. Continue?')) return;

    showToast('Clearing all local data...', 'info');
    
    // 1. Clear Local Storage
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    localStorage.removeItem('hub_auth'); 
    
    // 2. Clear Cloud Data
    showToast('Wiping Google Sheets...', 'info');
    await clearAllCloudData();
    
    // 3. Initialize Mapping
    showToast('Mapping module structure to sheets...', 'info');
    const modulesToMap = Object.values(DOC_TYPES).filter(type => 
        type !== DOC_TYPES.DASHBOARD && 
        type !== DOC_TYPES.REPORTS
    );
    
    await initializeCloudMapping(modulesToMap);

    // 4. Seed Default Admin
    showToast('Creating default administrator...', 'info');
    const defaultAdmin = {
        id: 'USER-001',
        name: 'Super Admin',
        username: 'admin',
        password: 'password', 
        role: 'Admin',
        status: 'Active',
        created: new Date().toISOString()
    };
    documents[DOC_TYPES.USERS] = [defaultAdmin];
    localStorage.setItem(STORAGE_KEYS[DOC_TYPES.USERS], JSON.stringify(documents[DOC_TYPES.USERS]));
    await saveToCloud(DOC_TYPES.USERS, defaultAdmin);
    
    showToast('System reset and mapping complete!', 'success');
    window.location.reload(); 
}

export async function convertDocument(fromType, fromId, toType, documents, openCreateModal) {
    const sourceDoc = documents[fromType].find(d => d.id === fromId);
    if (!sourceDoc) {
        showToast('Source document not found.', 'error');
        return;
    }

    const prefillData = {
        client: sourceDoc.client,
        items: sourceDoc.items.map(item => ({ ...item })),
        notes: sourceDoc.notes,
        terms: sourceDoc.terms,
        convertedFrom: fromId
    };

    openCreateModal(toType, prefillData);
}

