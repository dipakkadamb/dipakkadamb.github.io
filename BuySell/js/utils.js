export function formatCurrency(value) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2
    }).format(value);
}

export function getDocBalance(doc, type, documents, DOC_TYPES) {
    const isPurchase = [DOC_TYPES.BILLS, DOC_TYPES.VENDOR_CREDITS, DOC_TYPES.EXPENSES, DOC_TYPES.PAYMENTS_MADE].includes(type);
    const paymentType = isPurchase ? DOC_TYPES.PAYMENTS_MADE : DOC_TYPES.PAYMENTS_REC;
    const allPayments = documents[paymentType] || [];
    const docPayments = allPayments.filter(p => p.refDoc === doc.id);
    const paidAmount = docPayments.reduce((sum, p) => sum + (parseFloat(p.total) || 0), 0);
    return doc.total - paidAmount;
}

export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
