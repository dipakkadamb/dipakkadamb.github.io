export function formatCurrency(value) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2
    }).format(value);
}

export function getDocBalance(doc, payments) {
    const docPayments = payments.filter(p => p.refDoc === doc.id);
    const paidAmount = docPayments.reduce((sum, p) => sum + p.total, 0);
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
