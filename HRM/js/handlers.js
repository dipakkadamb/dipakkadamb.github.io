import { initDatabase, getData, saveData } from './database.js';
import { UI } from './ui.js';
import { PayrollEngine } from './payroll.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize DB
    initDatabase();

    // 2. Initialize UI (Dashboard by default)
    UI.initCharts();

    // 3. Navigation Handlers
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const view = e.currentTarget.dataset.view;
            if (view) {
                UI.switchView(view);
            }
        });
    });

    // 4. Global Quick Add
    const quickAddBtn = document.getElementById('add-global-btn');
    if (quickAddBtn) {
        quickAddBtn.addEventListener('click', () => {
            alert('Quick Add feature coming soon!');
        });
    }

    // 5. Search Bar Interactivity
    const searchBar = document.querySelector('header input');
    if (searchBar) {
        searchBar.addEventListener('focus', () => {
            searchBar.parentElement.style.borderColor = 'var(--accent-primary)';
            searchBar.parentElement.style.boxShadow = '0 0 15px var(--accent-glow)';
        });
        searchBar.addEventListener('blur', () => {
            searchBar.parentElement.style.borderColor = 'var(--border-subtle)';
            searchBar.parentElement.style.boxShadow = 'none';
        });
    }

    // 6. Employee Actions (Add/Edit/Delete)
    document.addEventListener('click', (e) => {
        const target = e.target.closest('button');
        if (!target) return;

        // Add Employee Modal
        if (target.id === 'add-employee-btn' || target.id === 'add-global-btn') {
            UI.renderEmployeeForm();
        }

        // Edit Employee
        if (target.classList.contains('edit-emp-btn')) {
            const empId = target.dataset.id;
            const employees = getData('employees');
            const emp = employees.find(e => e.id === empId);
            if (emp) UI.renderEmployeeForm(emp);
        }

        // Delete Employee
        if (target.classList.contains('delete-emp-btn')) {
            const empId = target.dataset.id;
            if (confirm(`Are you sure you want to delete employee ${empId}?`)) {
                let employees = getData('employees');
                employees = employees.filter(e => e.id !== empId);
                saveData('employees', employees);
                UI.renderEmployees();
            }
        }

        // Attendance Actions
        if (target.id === 'save-attendance-btn') {
            const rows = document.querySelectorAll('.attendance-row');
            const attendanceData = Array.from(rows).map(row => ({
                employeeId: row.dataset.id,
                status: row.querySelector('.attendance-status').value,
                inTime: row.querySelector('.attendance-in').value,
                outTime: row.querySelector('.attendance-out').value,
                notes: row.querySelector('.attendance-notes').value
            }));

            // Save to DB (simulated persistence)
            saveData('attendance_logs', attendanceData);
            UI.showToast('Attendance records saved successfully!');
            console.log('Attendance saved:', attendanceData);
        }

        // Leave Actions
        if (target.classList.contains('approve-leave-btn') || target.classList.contains('reject-leave-btn')) {
            const isApprove = target.classList.contains('approve-leave-btn');
            const leaveId = target.dataset.id;
            UI.showToast(isApprove ? `Leave request #${leaveId} approved.` : `Leave request #${leaveId} rejected.`);
            // In a real app, update DB status and re-render
        }

        // Payroll Actions
        if (target.id === 'run-payroll-btn') {
            const employees = getData('employees');
            const attendance = getData('attendance_logs') || [];
            
            const processedPayroll = employees.map(emp => PayrollEngine.calculateMonthlyPayroll(emp, attendance));
            
            saveData('processed_payroll', processedPayroll);
            UI.showToast(`Payroll processed for ${processedPayroll.length} employees!`);
            UI.renderPayroll(); // Re-render to show updated (simulated) status
        }

        // Job Actions
        if (target.id === 'post-job-btn') {
            UI.renderJobForm();
        }

        // Expense Actions
        if (target.id === 'add-expense-btn') {
            UI.renderExpenseForm();
        }
    });

    // 7. Form Submissions
    document.addEventListener('submit', (e) => {
        if (e.target.id === 'employee-form') {
            e.preventDefault();
            // ... (existing employee form logic)
            const formData = new FormData(e.target);
            const empData = Object.fromEntries(formData.entries());
            empData.salary = parseFloat(empData.salary);

            let employees = getData('employees');
            const index = employees.findIndex(e => e.id === empData.id);

            if (index > -1) {
                employees[index] = empData;
            } else {
                employees.push(empData);
            }

            saveData('employees', employees);
            UI.closeModal();
            UI.renderEmployees();
            UI.showToast('Employee record updated successfully!');
        }

        if (e.target.id === 'job-form') {
            e.preventDefault();
            UI.closeModal();
            UI.showToast('Job posting created successfully!');
            UI.renderRecruitment();
        }

        if (e.target.id === 'expense-form') {
            e.preventDefault();
            UI.closeModal();
            UI.showToast('Expense claim submitted for approval.');
            UI.renderExpenses();
        }
    });

    console.log('HRM: System systems online.');
});

