/**
 * ASYNCRIX HRM - UI Component Library
 */

import { getData } from './database.js';

export const UI = {
    // Utility to switch views
    switchView: (viewId) => {
        const titleMap = {
            'dashboard': 'Dashboard Overview',
            'employees': 'Employee Management',
            'self-service': 'Employee Self Service',
            'attendance': 'Attendance Management',
            'leaves': 'Leave Management',
            'payroll': 'Payroll Processing',
            'recruitment': 'Recruitment Hub',
            'performance': 'Performance Analytics',
            'documents': 'Document Hub',
            'training': 'Learning & Development',
            'expenses': 'Expense & Reimbursement',
            'compliance': 'Statutory & Compliance',
            'reports': 'Reports & Analytics'
        };

        const title = titleMap[viewId] || 'HRM Module';
        document.getElementById('view-title').textContent = title;
        document.getElementById('breadcrumb').textContent = `HRM / ${viewId.charAt(0).toUpperCase() + viewId.slice(1)}`;
        
        // Update Sidebar
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle('active', link.dataset.view === viewId);
        });

        // Load View Content
        UI.loadView(viewId);
    },

    // Modal System
    openModal: (title, contentHTML) => {
        const modal = document.getElementById('modal-container');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');
        
        modalTitle.textContent = title;
        modalBody.innerHTML = contentHTML;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    },

    closeModal: () => {
        const modal = document.getElementById('modal-container');
        modal.classList.remove('active');
        document.body.style.overflow = '';
        // Reset modal widths changed by specific views (like documents)
        const modalContent = modal.querySelector('.glass-card');
        if (modalContent) modalContent.style.maxWidth = '800px';
    },

    showToast: (message, type = 'success') => {
        const toast = document.createElement('div');
        toast.className = `toast animate-in ${type}`;
        // Base styles moved to CSS, but position stays here to avoid layout shifts
        toast.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: var(--bg-card);
            border: 1px solid var(--accent-primary);
            color: var(--text-main);
            padding: 12px 24px;
            border-radius: 12px;
            backdrop-filter: blur(10px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 0.9rem;
            animation: slideInRight 0.3s ease forwards;
        `;
        
        const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
        const iconColor = type === 'success' ? 'var(--accent-success)' : 'var(--accent-danger)';
        
        toast.innerHTML = `<i class="fas ${icon}" style="color: ${iconColor}"></i> ${message}`;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    renderEmployeeForm: (employee = null) => {
        const isEdit = !!employee;
        const title = isEdit ? 'Edit Employee' : 'Add New Employee';
        
        const content = `
            <form id="employee-form" class="animate-in" style="display: flex; flex-direction: column; gap: 20px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div class="form-group">
                        <label style="display: block; margin-bottom: 8px; font-size: 0.85rem; color: var(--text-dim);">Employee ID</label>
                        <input type="text" name="id" value="${employee?.id || ''}" ${isEdit ? 'readonly' : ''} placeholder="EMP000" required style="width: 100%; background: var(--bg-sidebar); border: 1px solid var(--border-subtle); color: var(--text-main); padding: 10px; border-radius: 8px; outline: none;">
                    </div>
                    <div class="form-group">
                        <label style="display: block; margin-bottom: 8px; font-size: 0.85rem; color: var(--text-dim);">Full Name</label>
                        <input type="text" name="name" value="${employee?.name || ''}" placeholder="Enter full name" required style="width: 100%; background: var(--bg-sidebar); border: 1px solid var(--border-subtle); color: var(--text-main); padding: 10px; border-radius: 8px; outline: none;">
                    </div>
                    <div class="form-group">
                        <label style="display: block; margin-bottom: 8px; font-size: 0.85rem; color: var(--text-dim);">Department</label>
                        <select name="department" required style="width: 100%; background: var(--bg-sidebar); border: 1px solid var(--border-subtle); color: var(--text-main); padding: 10px; border-radius: 8px; outline: none;">
                            <option value="IT" ${employee?.department === 'IT' ? 'selected' : ''}>IT & Engineering</option>
                            <option value="HR" ${employee?.department === 'HR' ? 'selected' : ''}>Human Resources</option>
                            <option value="Finance" ${employee?.department === 'Finance' ? 'selected' : ''}>Finance</option>
                            <option value="Sales" ${employee?.department === 'Sales' ? 'selected' : ''}>Sales & Marketing</option>
                            <option value="Operations" ${employee?.department === 'Operations' ? 'selected' : ''}>Operations</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label style="display: block; margin-bottom: 8px; font-size: 0.85rem; color: var(--text-dim);">Designation</label>
                        <input type="text" name="designation" value="${employee?.designation || ''}" placeholder="e.g. Software Engineer" required style="width: 100%; background: var(--bg-sidebar); border: 1px solid var(--border-subtle); color: var(--text-main); padding: 10px; border-radius: 8px; outline: none;">
                    </div>
                    <div class="form-group">
                        <label style="display: block; margin-bottom: 8px; font-size: 0.85rem; color: var(--text-dim);">Monthly Salary (CTC)</label>
                        <input type="number" name="salary" value="${employee?.salary || ''}" placeholder="50000" required style="width: 100%; background: var(--bg-sidebar); border: 1px solid var(--border-subtle); color: var(--text-main); padding: 10px; border-radius: 8px; outline: none;">
                    </div>
                    <div class="form-group">
                        <label style="display: block; margin-bottom: 8px; font-size: 0.85rem; color: var(--text-dim);">Status</label>
                        <select name="status" style="width: 100%; background: var(--bg-sidebar); border: 1px solid var(--border-subtle); color: var(--text-main); padding: 10px; border-radius: 8px; outline: none;">
                            <option value="Active" ${employee?.status === 'Active' ? 'selected' : ''}>Active</option>
                            <option value="On Leave" ${employee?.status === 'On Leave' ? 'selected' : ''}>On Leave</option>
                            <option value="Terminated" ${employee?.status === 'Terminated' ? 'selected' : ''}>Terminated</option>
                        </select>
                    </div>
                </div>

                <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px;">
                    <button type="button" class="btn" onclick="UI.closeModal()" style="background: rgba(255,255,255,0.05); color: var(--text-main); border: 1px solid var(--border-subtle);">Cancel</button>
                    <button type="submit" class="btn btn-primary">${isEdit ? 'Update Employee' : 'Create Employee'}</button>
                </div>
            </form>
        `;
        UI.openModal(title, content);
    },

    renderJobForm: () => {
        const content = `
            <form id="job-form" class="animate-in" style="display: flex; flex-direction: column; gap: 20px;">
                <div class="form-group">
                    <label style="display: block; margin-bottom: 8px; font-size: 0.85rem; color: var(--text-dim);">Job Title</label>
                    <input type="text" name="title" placeholder="e.g. Senior Frontend Developer" required style="width: 100%; background: var(--bg-sidebar); border: 1px solid var(--border-subtle); color: var(--text-main); padding: 10px; border-radius: 8px; outline: none;">
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div class="form-group">
                        <label style="display: block; margin-bottom: 8px; font-size: 0.85rem; color: var(--text-dim);">Department</label>
                        <select name="department" style="width: 100%; background: var(--bg-sidebar); border: 1px solid var(--border-subtle); color: var(--text-main); padding: 10px; border-radius: 8px; outline: none;">
                            <option value="IT">IT</option>
                            <option value="HR">HR</option>
                            <option value="Finance">Finance</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label style="display: block; margin-bottom: 8px; font-size: 0.85rem; color: var(--text-dim);">Type</label>
                        <select name="type" style="width: 100%; background: var(--bg-sidebar); border: 1px solid var(--border-subtle); color: var(--text-main); padding: 10px; border-radius: 8px; outline: none;">
                            <option value="Full Time">Full Time</option>
                            <option value="Contract">Contract</option>
                            <option value="Remote">Remote</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label style="display: block; margin-bottom: 8px; font-size: 0.85rem; color: var(--text-dim);">Description</label>
                    <textarea name="description" rows="4" style="width: 100%; background: var(--bg-sidebar); border: 1px solid var(--border-subtle); color: var(--text-main); padding: 10px; border-radius: 8px; outline: none;"></textarea>
                </div>
                <div style="display: flex; gap: 12px; justify-content: flex-end;">
                    <button type="button" class="btn" onclick="UI.closeModal()" style="background: rgba(255,255,255,0.05); color: var(--text-main); border: 1px solid var(--border-subtle);">Cancel</button>
                    <button type="submit" class="btn btn-primary">Post Job</button>
                </div>
            </form>
        `;
        UI.openModal('Post New Job Opportunity', content);
    },

    renderExpenseForm: () => {
        const content = `
            <form id="expense-form" class="animate-in" style="display: flex; flex-direction: column; gap: 20px;">
                <div class="form-group">
                    <label style="display: block; margin-bottom: 8px; font-size: 0.85rem; color: var(--text-dim);">Expense Category</label>
                    <select name="category" style="width: 100%; background: var(--bg-sidebar); border: 1px solid var(--border-subtle); color: var(--text-main); padding: 10px; border-radius: 8px; outline: none;">
                        <option value="Travel">Travel</option>
                        <option value="Meals">Meals</option>
                        <option value="Software">Software/SaaS</option>
                        <option value="Hardware">Hardware</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div class="form-group">
                        <label style="display: block; margin-bottom: 8px; font-size: 0.85rem; color: var(--text-dim);">Amount (₹)</label>
                        <input type="number" name="amount" placeholder="0.00" required style="width: 100%; background: var(--bg-sidebar); border: 1px solid var(--border-subtle); color: var(--text-main); padding: 10px; border-radius: 8px; outline: none;">
                    </div>
                    <div class="form-group">
                        <label style="display: block; margin-bottom: 8px; font-size: 0.85rem; color: var(--text-dim);">Date</label>
                        <input type="date" name="date" required style="width: 100%; background: var(--bg-sidebar); border: 1px solid var(--border-subtle); color: var(--text-main); padding: 10px; border-radius: 8px; outline: none;">
                    </div>
                </div>
                <div class="form-group">
                    <label style="display: block; margin-bottom: 8px; font-size: 0.85rem; color: var(--text-dim);">Purpose / Description</label>
                    <input type="text" name="purpose" placeholder="e.g. Travel to client site" required style="width: 100%; background: var(--bg-sidebar); border: 1px solid var(--border-subtle); color: var(--text-main); padding: 10px; border-radius: 8px; outline: none;">
                </div>
                <div style="display: flex; gap: 12px; justify-content: flex-end;">
                    <button type="button" class="btn" onclick="UI.closeModal()" style="background: rgba(255,255,255,0.05); color: var(--text-main); border: 1px solid var(--border-subtle);">Cancel</button>
                    <button type="submit" class="btn btn-primary">Submit Claim</button>
                </div>
            </form>
        `;
        UI.openModal('Submit Reimbursement Claim', content);
    },

    loadView: (viewId) => {
        const container = document.getElementById('content-area');
        container.innerHTML = `<div class="animate-in" style="padding: 20px; text-align: center; color: var(--text-muted);">
            <i class="fas fa-spinner fa-spin fa-2x"></i>
            <p style="margin-top: 15px;">Loading ${viewId} module...</p>
        </div>`;

        setTimeout(() => {
            switch(viewId) {
                case 'dashboard':
                    UI.renderDashboard();
                    break;
                case 'self-service':
                    UI.renderSelfService();
                    break;
                case 'reports':
                    UI.renderReports();
                    break;
                case 'recruitment':
                    UI.renderRecruitment();
                    break;
                case 'performance':
                    UI.renderPerformance();
                    break;
                case 'training':
                    UI.renderTraining();
                    break;
                case 'leaves':
                    UI.renderLeaves();
                    break;
                case 'payroll':
                    UI.renderPayroll();
                    break;
                case 'compliance':
                    UI.renderCompliance();
                    break;
                case 'expenses':
                    UI.renderExpenses();
                    break;
                case 'attendance':
                    UI.renderAttendance();
                    break;
                default:
                    container.innerHTML = `<div class="glass-card animate-in">
                        <h3>${viewId.toUpperCase()} Module</h3>
                        <p style="color: var(--text-muted); margin-top: 10px;">This module is under development.</p>
                    </div>`;
            }
        }, 300);
    },

    renderDashboard: () => {
        const container = document.getElementById('content-area');
        // Initial HTML already has dashboard, but we re-render or update charts here
        UI.initCharts();
    },

    initCharts: () => {
        const ctxAttendance = document.getElementById('attendanceChart');
        if (ctxAttendance) {
            new Chart(ctxAttendance, {
                type: 'line',
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [{
                        label: 'Present %',
                        data: [95, 98, 92, 94, 96, 40, 30],
                        borderColor: '#06b6d4',
                        backgroundColor: 'rgba(6, 182, 212, 0.1)',
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { display: false },
                        x: { grid: { display: false, color: 'rgba(255,255,255,0.05)' } }
                    }
                }
            });
        }

        const ctxDept = document.getElementById('deptChart');
        if (ctxDept) {
            new Chart(ctxDept, {
                type: 'doughnut',
                data: {
                    labels: ['IT', 'Finance', 'HR', 'Admin'],
                    datasets: [{
                        data: [45, 25, 15, 15],
                        backgroundColor: ['#06b6d4', '#2563eb', '#10b981', '#f59e0b'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } }
                }
            });
        }
    },

    renderEmployees: () => {
        const container = document.getElementById('content-area');
        const employees = getData('employees');

        container.innerHTML = `
            <div class="employees-controls" style="display: flex; justify-content: space-between; margin-bottom: 24px;">
                <div style="display: flex; gap: 12px;">
                    <button class="btn" style="background: var(--bg-card); color: var(--text-main); border: 1px solid var(--border-subtle);">
                        <i class="fas fa-filter"></i> Filter
                    </button>
                    <button class="btn" style="background: var(--bg-card); color: var(--text-main); border: 1px solid var(--border-subtle);">
                        <i class="fas fa-sort"></i> Sort
                    </button>
                </div>
                <div style="display: flex; gap: 12px;">
                    <button class="btn" id="btn-list-view" style="color: var(--accent-primary);"><i class="fas fa-list"></i></button>
                    <button class="btn" id="btn-card-view"><i class="fas fa-grip-horizontal"></i></button>
                    <button class="btn btn-primary" id="add-employee-btn"><i class="fas fa-plus"></i> Add Employee</button>
                </div>
            </div>

            <div class="glass-card animate-in" style="padding: 0; overflow: hidden;">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Employee</th>
                            <th>Department</th>
                            <th>Designation</th>
                            <th>Status</th>
                            <th>Joining Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${employees.map(emp => `
                            <tr>
                                <td>
                                    <div style="display: flex; align-items: center; gap: 12px;">
                                        <img src="${emp.photo || 'https://via.placeholder.com/32'}" style="width: 32px; height: 32px; border-radius: 8px;">
                                        <div>
                                            <p style="font-weight: 600;">${emp.name}</p>
                                            <p style="font-size: 0.7rem; color: var(--text-dim);">${emp.id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td>${emp.department}</td>
                                <td>${emp.designation}</td>
                                <td><span style="padding: 4px 8px; border-radius: 6px; font-size: 0.7rem; font-weight: 700; background: rgba(16, 185, 129, 0.1); color: var(--accent-success);">${emp.status}</span></td>
                                <td>${emp.joiningDate}</td>
                                <td>
                                    <button class="btn edit-emp-btn" data-id="${emp.id}" style="background: transparent; border: none; color: var(--text-dim); cursor: pointer;"><i class="fas fa-edit"></i></button>
                                    <button class="btn delete-emp-btn" data-id="${emp.id}" style="background: transparent; border: none; color: var(--text-dim); cursor: pointer; margin-left:10px;"><i class="fas fa-trash"></i></button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    renderAttendance: () => {
        const container = document.getElementById('content-area');
        const employees = getData('employees');
        const today = new Date().toISOString().split('T')[0];

        container.innerHTML = `
            <div class="glass-card animate-in" style="margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h3 style="font-size: 1.1rem; margin-bottom: 5px;">Daily Attendance Marking</h3>
                    <p style="color: var(--text-dim); font-size: 0.85rem;">Date: <strong>${today}</strong></p>
                </div>
                <div style="display: flex; gap: 12px;">
                    <button class="btn" style="background: var(--bg-card); color: var(--text-main); border: 1px solid var(--border-subtle);">
                        <i class="fas fa-file-import"></i> Import CSV
                    </button>
                    <button class="btn btn-primary" id="save-attendance-btn"><i class="fas fa-save"></i> Save Attendance</button>
                </div>
            </div>

            <div class="glass-card animate-in" style="padding: 0; overflow: hidden;">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Employee</th>
                            <th>Status</th>
                            <th>In Time</th>
                            <th>Out Time</th>
                            <th>Notes</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${employees.map(emp => `
                            <tr class="attendance-row" data-id="${emp.id}">
                                <td>
                                    <div style="display: flex; align-items: center; gap: 12px;">
                                        <div style="width: 32px; height: 32px; border-radius: 8px; background: var(--bg-sidebar); border: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: center; font-size: 0.6rem; font-weight: 800;">${emp.id}</div>
                                        <p style="font-weight: 600;">${emp.name}</p>
                                    </div>
                                </td>
                                <td>
                                    <select class="attendance-status" style="background: var(--bg-sidebar); border: 1px solid var(--border-subtle); color: var(--text-main); padding: 6px 10px; border-radius: 8px; font-size: 0.8rem; outline: none;">
                                        <option value="Present">Present</option>
                                        <option value="Absent">Absent</option>
                                        <option value="Half Day">Half Day</option>
                                        <option value="WFH">WFH</option>
                                        <option value="Leave">On Leave</option>
                                    </select>
                                </td>
                                <td><input type="time" class="attendance-in" value="09:00" style="background: transparent; border: 1px solid var(--border-subtle); color: var(--text-main); font-size: 0.8rem; padding: 4px; border-radius: 4px;"></td>
                                <td><input type="time" class="attendance-out" value="18:00" style="background: transparent; border: 1px solid var(--border-subtle); color: var(--text-main); font-size: 0.8rem; padding: 4px; border-radius: 4px;"></td>
                                <td><input type="text" class="attendance-notes" placeholder="Optional notes" style="background: transparent; border: 1px solid var(--border-subtle); color: var(--text-main); font-size: 0.8rem; padding: 6px; border-radius: 8px; width: 100%;"></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    renderLeaves: () => {
        const container = document.getElementById('content-area');
        container.innerHTML = `
            <div class="dashboard-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 30px;">
                <div class="glass-card stats-card">
                    <span class="stats-value">12</span>
                    <span class="stats-label">Pending Requests</span>
                </div>
                <div class="glass-card stats-card">
                    <span class="stats-value">04</span>
                    <span class="stats-label">Approved (Current Week)</span>
                </div>
                <div class="glass-card stats-card">
                    <span class="stats-value">02</span>
                    <span class="stats-label">On Leave Today</span>
                </div>
            </div>

            <div class="glass-card animate-in">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3>Leave Applications</h3>
                    <button class="btn btn-primary"><i class="fas fa-plus"></i> New Application</button>
                </div>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Employee</th>
                            <th>Type</th>
                            <th>Duration</th>
                            <th>Status</th>
                            <th>Reason</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Dipak Kadamb</td>
                            <td>Sick Leave</td>
                            <td>Mar 18 - Mar 19 (2 days)</td>
                            <td><span style="color: var(--accent-warning); font-weight: 700;">Pending</span></td>
                            <td>Fever and headache</td>
                            <td>
                                <button class="btn approve-leave-btn" data-id="1" style="padding: 5px 10px; font-size: 0.7rem; background: rgba(16, 185, 129, 0.1); color: var(--accent-success);">Approve</button>
                                <button class="btn reject-leave-btn" data-id="1" style="padding: 5px 10px; font-size: 0.7rem; background: rgba(239, 68, 68, 0.1); color: var(--accent-danger);">Reject</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    },

    renderPayroll: () => {
        const container = document.getElementById('content-area');
        const employees = getData('employees');
        
        container.innerHTML = `
            <div class="glass-card animate-in" style="margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h3 style="font-size: 1.1rem; margin-bottom: 5px;">Payroll Processing</h3>
                    <p style="color: var(--text-dim); font-size: 0.85rem;">Processing Cycle: <strong>March 2026</strong></p>
                </div>
                <div style="display: flex; gap: 12px;">
                    <button class="btn btn-primary" id="run-payroll-btn"><i class="fas fa-sync"></i> Run Monthly Payroll</button>
                </div>
            </div>

            <div class="glass-card animate-in" style="padding: 0; overflow: hidden;">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Employee</th>
                            <th>Salary Structure</th>
                            <th>LWP Days</th>
                            <th>Net Salary</th>
                            <th>Status</th>
                            <th>Payslip</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${employees.map(emp => {
                            const processed = getData('processed_payroll') || [];
                            const record = processed.find(p => p.employeeId === emp.id);
                            const status = record ? 'Generated' : 'Not Generated';
                            const statusColor = record ? 'var(--accent-success)' : 'var(--text-dim)';
                            const netSalary = record ? record.netSalary : (emp.salary * 0.9); // Fallback estimate

                            return `
                                <tr>
                                    <td>
                                        <div style="display: flex; align-items: center; gap: 12px;">
                                            <div style="width: 32px; height: 32px; border-radius: 8px; background: var(--bg-sidebar); border: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: center; font-size: 0.6rem; font-weight: 800;">${emp.id}</div>
                                            <p style="font-weight: 600;">${emp.name}</p>
                                        </div>
                                    </td>
                                    <td>Monthly CTC: ₹${emp.salary.toLocaleString()}</td>
                                    <td>0</td>
                                    <td style="font-weight: 700;">₹${Math.round(netSalary).toLocaleString()}</td>
                                    <td><span style="color: ${statusColor}; font-size: 0.75rem; font-weight: 700;">${status}</span></td>
                                    <td>
                                        ${record ? `<button class="btn preview-payslip-btn" data-id="${emp.id}" style="padding: 5px 10px; font-size: 0.7rem; background: rgba(16, 185, 129, 0.1); color: var(--accent-success);"><i class="fas fa-file-invoice"></i> Slip</button>` : ''}
                                        <button class="btn" style="padding: 5px 10px; font-size: 0.7rem; background: rgba(255, 255, 255, 0.05); color: var(--text-dim);"><i class="fas fa-eye"></i></button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    renderRecruitment: () => {
        const container = document.getElementById('content-area');
        const jobs = getData('jobs');
        const candidates = getData('candidates');

        container.innerHTML = `
            <div class="dashboard-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 30px;">
                <div class="glass-card stats-card">
                    <span class="stats-value">${jobs.filter(j => j.status === 'Open').length}</span>
                    <span class="stats-label">Active Job Openings</span>
                </div>
                <div class="glass-card stats-card">
                    <span class="stats-value">${candidates.length}</span>
                    <span class="stats-label">Total Applications</span>
                </div>
                <div class="glass-card stats-card">
                    <span class="stats-value">${candidates.filter(c => c.status === 'Interview').length}</span>
                    <span class="stats-label">Scheduled Interviews</span>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 24px;">
                <!-- Job Postings -->
                <div class="glass-card animate-in">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h3>Active Job Postings</h3>
                        <button class="btn btn-primary" id="post-job-btn" style="padding: 6px 12px; font-size: 0.75rem;"><i class="fas fa-plus"></i> Post Job</button>
                    </div>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Job Title</th>
                                <th>Dept</th>
                                <th>Vacancies</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${jobs.map(job => `
                                <tr>
                                    <td><p style="font-weight: 600;">${job.title}</p><p style="font-size: 0.65rem; color: var(--text-dim);">${job.id}</p></td>
                                    <td>${job.department}</td>
                                    <td>${job.vacancies || 1}</td>
                                    <td><span style="color: ${job.status === 'Open' ? 'var(--accent-success)' : 'var(--text-dim)'}; font-weight: 700;">${job.status}</span></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                <!-- Candidate Pipeline -->
                <div class="glass-card animate-in">
                    <h3>Recent Applications</h3>
                    <div style="margin-top: 20px; display: flex; flex-direction: column; gap: 12px;">
                        ${candidates.map(can => `
                            <div style="padding: 12px; border-radius: 12px; background: rgba(255, 255, 255, 0.02); display: flex; align-items: center; gap: 12px;">
                                <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--bg-sidebar); display: flex; align-items: center; justify-content: center; color: var(--accent-primary); font-size: 0.7rem; font-weight: 800;">${can.name.charAt(0)}</div>
                                <div style="flex: 1;">
                                    <p style="font-size: 0.85rem; font-weight: 600;">${can.name}</p>
                                    <p style="font-size: 0.7rem; color: var(--text-dim);">${can.jobId} · ${can.appliedDate}</p>
                                </div>
                                <span style="font-size: 0.65rem; padding: 4px 8px; border-radius: 4px; background: rgba(6, 182, 212, 0.1); color: var(--accent-primary); font-weight: 700;">${can.status}</span>
                            </div>
                        `).join('')}
                    </div>
                    <button class="btn" style="width: 100%; margin-top: 15px; background: transparent; border: 1px solid var(--border-subtle); color: var(--text-dim); font-size: 0.75rem;">View Full Pipeline</button>
                </div>
            </div>
        `;
    },

    renderPerformance: () => {
        const container = document.getElementById('content-area');
        const performance = getData('performance');
        const employees = getData('employees');

        container.innerHTML = `
            <div class="dashboard-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 30px;">
                <div class="glass-card stats-card">
                    <span class="stats-value">4.6</span>
                    <span class="stats-label">Avg Team Rating</span>
                </div>
                <div class="glass-card stats-card">
                    <span class="stats-value">92%</span>
                    <span class="stats-label">Goal Completion Rate</span>
                </div>
                <div class="glass-card stats-card">
                    <span class="stats-value">14</span>
                    <span class="stats-label">Pending Appraisals</span>
                </div>
            </div>

            <div class="glass-card animate-in">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3>Employee Performance Ratings</h3>
                    <button class="btn btn-primary" style="padding: 6px 12px; font-size: 0.75rem;"><i class="fas fa-gear"></i> Setup Cycle</button>
                </div>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Employee</th>
                            <th>Current Rating</th>
                            <th>KRA Completion</th>
                            <th>Next Appraisal</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${performance.map(perf => {
                            const emp = employees.find(e => e.id === perf.employeeId);
                            const avgKpi = perf.kpis.reduce((acc, k) => acc + (k.achieved/k.target), 0) / perf.kpis.length * 100;
                            return `
                                <tr>
                                    <td>
                                        <div style="display: flex; align-items: center; gap: 10px;">
                                            <div style="width: 28px; height: 28px; border-radius: 6px; background: var(--bg-sidebar); display: flex; align-items: center; justify-content: center; font-size: 0.6rem; font-weight: 800;">${perf.employeeId.slice(-3)}</div>
                                            <p style="font-weight: 600;">${emp ? emp.name : 'Unknown'}</p>
                                        </div>
                                    </td>
                                    <td>
                                        <div style="display: flex; align-items: center; gap: 5px;">
                                            <span style="font-weight: 700;">${perf.rating}</span>
                                            <i class="fas fa-star" style="color: var(--accent-warning); font-size: 0.7rem;"></i>
                                        </div>
                                    </td>
                                    <td>
                                        <div style="width: 80px; height: 6px; background: rgba(255,255,255,0.05); border-radius: 10px; overflow: hidden;">
                                            <div style="width: ${avgKpi}%; height: 100%; background: var(--accent-primary);"></div>
                                        </div>
                                        <p style="font-size: 0.6rem; color: var(--text-dim); margin-top: 4px;">${avgKpi.toFixed(1)}%</p>
                                    </td>
                                    <td>Oct 2026</td>
                                    <td><span style="font-size:0.7rem; color: var(--accent-success); font-weight:700;">Active</span></td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    renderTraining: () => {
        const container = document.getElementById('content-area');
        const trainings = getData('trainings');

        container.innerHTML = `
            <div class="dashboard-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 30px;">
                <div class="glass-card stats-card">
                    <span class="stats-value">02</span>
                    <span class="stats-label">Upcoming Sessions</span>
                </div>
                <div class="glass-card stats-card">
                    <span class="stats-value">85%</span>
                    <span class="stats-label">Attendance Rate</span>
                </div>
                <div class="glass-card stats-card">
                    <span class="stats-value">05</span>
                    <span class="stats-label">Certifications Issued</span>
                </div>
            </div>

            <div class="glass-card animate-in">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3>Training Calendar & Programs</h3>
                    <button class="btn btn-primary" style="padding: 6px 12px; font-size: 0.75rem;"><i class="fas fa-calendar-plus"></i> Schedule Training</button>
                </div>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Program Title</th>
                            <th>Trainer</th>
                            <th>Date</th>
                            <th>Attendees</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${trainings.map(trn => `
                            <tr>
                                <td><p style="font-weight: 600;">${trn.title}</p><p style="font-size: 0.65rem; color: var(--text-dim);">${trn.id}</p></td>
                                <td>${trn.trainer}</td>
                                <td>${trn.date}</td>
                                <td>${trn.attendees}</td>
                                <td><span style="color: ${trn.status === 'Open' ? 'var(--accent-primary)' : 'var(--accent-warning)'}; font-weight: 700;">${trn.status}</span></td>
                                <td><button class="btn" style="padding: 5px 10px; font-size: 0.7rem; background: rgba(6, 182, 212, 0.1); color: var(--accent-primary);">Manage</button></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    renderExpenses: () => {
        const container = document.getElementById('content-area');
        const expenses = getData('expenses');
        const employees = getData('employees');

        container.innerHTML = `
            <div class="dashboard-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 30px;">
                <div class="glass-card stats-card">
                    <span class="stats-value">₹12,450</span>
                    <span class="stats-label">Total Claims (Month)</span>
                </div>
                <div class="glass-card stats-card">
                    <span class="stats-value">₹2,500</span>
                    <span class="stats-label">Pending Approval</span>
                </div>
                <div class="glass-card stats-card">
                    <span class="stats-value">08</span>
                    <span class="stats-label">Approved Claims</span>
                </div>
            </div>

            <div class="glass-card animate-in">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3>Expense Reimbursement Claims</h3>
                    <button class="btn btn-primary" id="add-expense-btn" style="padding: 6px 12px; font-size: 0.75rem;"><i class="fas fa-file-invoice"></i> New Claim</button>
                </div>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Claimant</th>
                            <th>Category</th>
                            <th>Amount</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${expenses.map(exp => {
                            const emp = employees.find(e => e.id === exp.employeeId);
                            return `
                                <tr>
                                    <td><p style="font-weight: 600;">${emp ? emp.name : 'Unknown'}</p><p style="font-size: 0.65rem; color: var(--text-dim);">${exp.id}</p></td>
                                    <td>${exp.category}</td>
                                    <td style="font-weight: 700;">₹${exp.amount.toLocaleString()}</td>
                                    <td>${exp.date}</td>
                                    <td><span style="color: ${exp.status === 'Pending' ? 'var(--accent-warning)' : 'var(--accent-success)'}; font-weight: 700;">${exp.status}</span></td>
                                    <td>
                                        <button class="btn" style="padding: 5px 10px; font-size: 0.7rem; background: rgba(255, 255, 255, 0.05); color: var(--text-main);"><i class="fas fa-eye"></i></button>
                                        <button class="btn" style="padding: 5px 10px; font-size: 0.7rem; background: rgba(37, 99, 235, 0.1); color: var(--accent-secondary); margin-left: 5px;"><i class="fas fa-check"></i></button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    renderCompliance: () => {
        const container = document.getElementById('content-area');
        const compliance = getData('compliance');

        container.innerHTML = `
            <div class="dashboard-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 30px;">
                <div class="glass-card stats-card">
                    <span class="stats-value">₹45,200</span>
                    <span class="stats-label">Total PF Contribution</span>
                </div>
                <div class="glass-card stats-card">
                    <span class="stats-value">₹8,400</span>
                    <span class="stats-label">Total ESI Contribution</span>
                </div>
                <div class="glass-card stats-card">
                    <span class="stats-value">95%</span>
                    <span class="stats-label">Compliance Score</span>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1.5fr; gap: 24px;">
                <!-- Statutory Settings -->
                <div class="glass-card animate-in">
                    <h3 style="margin-bottom: 20px;">Statutory Configuration</h3>
                    <div style="display: flex; flex-direction: column; gap: 15px;">
                        <div style="display: flex; justify-content: space-between; padding-bottom: 10px; border-bottom: 1px solid var(--border-subtle);">
                            <span style="color: var(--text-muted); font-size: 0.85rem;">PF Contribution (Emp)</span>
                            <span style="font-weight: 700;">${compliance.pfRate}%</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding-bottom: 10px; border-bottom: 1px solid var(--border-subtle);">
                            <span style="color: var(--text-muted); font-size: 0.85rem;">ESI Contribution (Emp)</span>
                            <span style="font-weight: 700;">${compliance.esiRate}%</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding-bottom: 10px; border-bottom: 1px solid var(--border-subtle);">
                            <span style="color: var(--text-muted); font-size: 0.85rem;">PT Threshold</span>
                            <span style="font-weight: 700;">₹15,000</span>
                        </div>
                    </div>
                    <button class="btn btn-primary" style="width: 100%; margin-top: 20px;"><i class="fas fa-edit"></i> Update Rates</button>
                </div>

                <!-- Filing Status -->
                <div class="glass-card animate-in">
                    <h3 style="margin-bottom: 20px;">Statutory Filing Status</h3>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Report Type</th>
                                <th>Period</th>
                                <th>Due Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>PF Monthly ECR</td>
                                <td>Feb 2026</td>
                                <td>Mar 15, 2026</td>
                                <td><span style="color: var(--accent-success); font-weight: 700;">Filed</span></td>
                            </tr>
                            <tr>
                                <td>ESI Monthly Contribution</td>
                                <td>Feb 2026</td>
                                <td>Mar 15, 2026</td>
                                <td><span style="color: var(--accent-success); font-weight: 700;">Filed</span></td>
                            </tr>
                            <tr>
                                <td>PT Monthly Return</td>
                                <td>Feb 2026</td>
                                <td>Mar 21, 2026</td>
                                <td><span style="color: var(--accent-warning); font-weight: 700;">Pending</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    renderSelfService: () => {
        const container = document.getElementById('content-area');
        // Simulate logged in user
        const user = getData('employees')[0]; 

        container.innerHTML = `
            <div style="display: grid; grid-template-columns: 280px 1fr; gap: 24px;">
                <!-- Profile Sidebar -->
                <div class="glass-card animate-in" style="height: fit-content; text-align: center;">
                    <div style="width: 80px; height: 80px; border-radius: 50%; background: var(--bg-sidebar); border: 2px solid var(--accent-primary); margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 800; color: var(--accent-primary);">
                        ${user.name.charAt(0)}
                    </div>
                    <h3 style="margin-bottom: 5px;">${user.name}</h3>
                    <p style="color: var(--text-dim); font-size: 0.8rem; margin-bottom: 20px;">${user.designation} · ${user.department}</p>
                    
                    <div style="display: flex; flex-direction: column; gap: 10px; text-align: left;">
                        <button class="btn" style="width: 100%; background: rgba(255,255,255,0.02); text-align: left; font-size: 0.8rem;"><i class="fas fa-id-card" style="margin-right: 10px;"></i> Identity Details</button>
                        <button class="btn" style="width: 100%; background: rgba(255,255,255,0.02); text-align: left; font-size: 0.8rem;"><i class="fas fa-key" style="margin-right: 10px;"></i> Change Password</button>
                    </div>
                </div>

                <!-- Main Portal Content -->
                <div style="display: flex; flex-direction: column; gap: 24px;">
                    <!-- Quick Stats -->
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
                        <div class="glass-card" style="padding: 15px;">
                            <p style="color: var(--text-dim); font-size: 0.75rem;">Leave Balance</p>
                            <h4 style="font-size: 1.2rem; margin-top: 5px;">14 Days</h4>
                        </div>
                        <div class="glass-card" style="padding: 15px;">
                            <p style="color: var(--text-dim); font-size: 0.75rem;">Attendance (Month)</p>
                            <h4 style="font-size: 1.2rem; margin-top: 5px;">98.2%</h4>
                        </div>
                        <div class="glass-card" style="padding: 15px;">
                            <p style="color: var(--text-dim); font-size: 0.75rem;">Next Holiday</p>
                            <h4 style="font-size: 1.2rem; margin-top: 5px;">Mar 25 (Holi)</h4>
                        </div>
                    </div>

                    <!-- My Documents -->
                    <div class="glass-card animate-in">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                            <h3>My Recent Payslips</h3>
                            <a href="#" style="font-size: 0.75rem; color: var(--accent-primary);">View All</a>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 10px;">
                            <div style="padding: 12px; background: rgba(255,255,255,0.02); border-radius: 12px; display: flex; justify-content: space-between; align-items: center;">
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <i class="fas fa-file-pdf" style="color: #ef4444; font-size: 1.2rem;"></i>
                                    <div>
                                        <p style="font-size: 0.85rem; font-weight: 600;">February 2026.pdf</p>
                                        <p style="font-size: 0.7rem; color: var(--text-dim);">Generated on Mar 01, 2026</p>
                                    </div>
                                </div>
                                <button class="btn" style="padding: 5px 10px; font-size: 0.7rem; background: rgba(6, 182, 212, 0.1); color: var(--accent-primary);"><i class="fas fa-download"></i></button>
                            </div>
                            <div style="padding: 12px; background: rgba(255,255,255,0.02); border-radius: 12px; display: flex; justify-content: space-between; align-items: center;">
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <i class="fas fa-file-pdf" style="color: #ef4444; font-size: 1.2rem;"></i>
                                    <div>
                                        <p style="font-size: 0.85rem; font-weight: 600;">January 2026.pdf</p>
                                        <p style="font-size: 0.7rem; color: var(--text-dim);">Generated on Feb 01, 2026</p>
                                    </div>
                                </div>
                                <button class="btn" style="padding: 5px 10px; font-size: 0.7rem; background: rgba(6, 182, 212, 0.1); color: var(--accent-primary);"><i class="fas fa-download"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    renderDocuments: () => {
        const container = document.getElementById('content-area');
        
        container.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
                <!-- Template Selection -->
                <div class="glass-card animate-in">
                    <h3 style="margin-bottom: 20px;">Ready Templates</h3>
                    <div style="display: grid; gap: 15px;">
                        <div class="template-card" style="padding: 20px; border-radius: 12px; background: rgba(255,255,255,0.02); border: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <h4 style="margin-bottom: 5px;">Offer Letter</h4>
                                <p style="font-size: 0.75rem; color: var(--text-dim);">Candidate onboarding offer details</p>
                            </div>
                            <button class="btn btn-primary generate-doc-btn" data-template="OFFER_LETTER">Use Template</button>
                        </div>
                        <div class="template-card" style="padding: 20px; border-radius: 12px; background: rgba(255,255,255,0.02); border: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <h4 style="margin-bottom: 5px;">Appointment Letter</h4>
                                <p style="font-size: 0.75rem; color: var(--text-dim);">Official employment appointment document</p>
                            </div>
                            <button class="btn btn-primary generate-doc-btn" data-template="APPOINTMENT_LETTER">Use Template</button>
                        </div>
                        <div class="template-card" style="padding: 20px; border-radius: 12px; background: rgba(255,255,255,0.02); border: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <h4 style="margin-bottom: 5px;">Relieving Letter</h4>
                                <p style="font-size: 0.75rem; color: var(--text-dim);">Employee relieving and experience confirmation</p>
                            </div>
                            <button class="btn btn-primary generate-doc-btn" data-template="RELIEVING_LETTER">Use Template</button>
                        </div>
                    </div>
                </div>

                <!-- Custom Document -->
                <div class="glass-card animate-in" style="animation-delay: 0.2s;">
                    <h3 style="margin-bottom: 20px;">Quick Document Builder</h3>
                    <form id="doc-builder-form" style="display: flex; flex-direction: column; gap: 15px;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                            <div class="form-group">
                                <label style="display: block; font-size: 0.8rem; color: var(--text-dim); margin-bottom: 5px;">Recipient Name</label>
                                <input type="text" name="name" placeholder="Full Name" required style="width: 100%; background: var(--bg-sidebar); border: 1px solid var(--border-subtle); color: var(--text-main); padding: 10px; border-radius: 8px;">
                            </div>
                            <div class="form-group">
                                <label style="display: block; font-size: 0.8rem; color: var(--text-dim); margin-bottom: 5px;">Designation</label>
                                <input type="text" name="designation" placeholder="e.g. Software Engineer" required style="width: 100%; background: var(--bg-sidebar); border: 1px solid var(--border-subtle); color: var(--text-main); padding: 10px; border-radius: 8px;">
                            </div>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                            <div class="form-group">
                                <label style="display: block; font-size: 0.8rem; color: var(--text-dim); margin-bottom: 5px;">Joining Date</label>
                                <input type="date" name="joining_date" required style="width: 100%; background: var(--bg-sidebar); border: 1px solid var(--border-subtle); color: var(--text-main); padding: 10px; border-radius: 8px;">
                            </div>
                            <div class="form-group">
                                <label style="display: block; font-size: 0.8rem; color: var(--text-dim); margin-bottom: 5px;">Relieving Date (Optional)</label>
                                <input type="date" name="relieving_date" style="width: 100%; background: var(--bg-sidebar); border: 1px solid var(--border-subtle); color: var(--text-main); padding: 10px; border-radius: 8px;">
                            </div>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                            <div class="form-group">
                                <label style="display: block; font-size: 0.8rem; color: var(--text-dim); margin-bottom: 5px;">Salary (Annual)</label>
                                <input type="number" name="salary" placeholder="1200000" style="width: 100%; background: var(--bg-sidebar); border: 1px solid var(--border-subtle); color: var(--text-main); padding: 10px; border-radius: 8px;">
                            </div>
                            <div class="form-group">
                                <label style="display: block; font-size: 0.8rem; color: var(--text-dim); margin-bottom: 5px;">Base Template</label>
                                <select name="template" style="width: 100%; background: var(--bg-sidebar); border: 1px solid var(--border-subtle); color: var(--text-main); padding: 10px; border-radius: 8px;">
                                    <option value="OFFER_LETTER">Offer Letter</option>
                                    <option value="APPOINTMENT_LETTER">Appointment Letter</option>
                                    <option value="RELIEVING_LETTER">Relieving Letter</option>
                                </select>
                            </div>
                        </div>
                        <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 10px;"><i class="fas fa-magic"></i> Generate & Preview</button>
                    </form>
                </div>
            </div>

            <div class="glass-card animate-in" style="margin-top: 30px; animation-delay: 0.4s;">
                <h3 style="margin-bottom: 20px;">Recent Generated Documents</h3>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Document Name</th>
                            <th>Issued To</th>
                            <th>Date Generated</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Offer Letter - 2026/042</td>
                            <td>John Doe</td>
                            <td>Mar 17, 2026</td>
                            <td><button class="btn" style="padding: 5px 10px; font-size: 0.7rem; background: rgba(37, 99, 235, 0.1); color: var(--accent-secondary);"><i class="fas fa-download"></i></button></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    },

    showDocumentPreview: (title, content) => {
        const modalContent = `
            <div style="background: white; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; height: 80vh;">
                <div style="padding: 15px 25px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="color: #1e293b; margin: 0;">${title} Preview</h3>
                    <div style="display: flex; gap: 10px;">
                        <button class="btn" id="print-doc-btn" style="background: var(--accent-primary); color: white; padding: 6px 15px; font-size: 0.8rem;"><i class="fas fa-print"></i> Print / Save PDF</button>
                        <button class="btn" onclick="UI.closeModal()" style="background: #e2e8f0; color: #475569; padding: 6px 15px; font-size: 0.8rem;">Close</button>
                    </div>
                </div>
                <div id="print-area" style="flex: 1; overflow-y: auto; background: #94a3b8; padding: 40px; display: flex; justify-content: center;">
                    <div style="width: 210mm; background: white; box-shadow: 0 0 20px rgba(0,0,0,0.2); min-height: 297mm;">
                        ${content}
                    </div>
                </div>
            </div>
        `;
        // We override the default modal content for documents to look more professional/white
        document.getElementById('modal-body').innerHTML = modalContent;
        // Adjust modal max-width for document preview
        document.querySelector('#modal-container .glass-card').style.maxWidth = '1000px';
    },

    renderReports: () => {
        const container = document.getElementById('content-area');
        
        container.innerHTML = `
            <div class="dashboard-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 24px;">
                <div class="glass-card" style="padding: 15px;">
                    <p style="color: var(--text-dim); font-size: 0.7rem;">Turnover Rate</p>
                    <h4 style="color: var(--accent-success);">+2.4%</h4>
                </div>
                <div class="glass-card" style="padding: 15px;">
                    <p style="color: var(--text-dim); font-size: 0.7rem;">Avg Tenure</p>
                    <h4 style="color: var(--accent-primary);">3.2 Yrs</h4>
                </div>
                <div class="glass-card" style="padding: 15px;">
                    <p style="color: var(--text-dim); font-size: 0.7rem;">Female Ratio</p>
                    <h4 style="color: #f472b6;">42%</h4>
                </div>
                <div class="glass-card" style="padding: 15px;">
                    <p style="color: var(--text-dim); font-size: 0.7rem;">Training ROI</p>
                    <h4 style="color: var(--accent-secondary);">18%</h4>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;">
                <div class="glass-card">
                    <h3>Headcount by Department</h3>
                    <div style="height: 300px; margin-top: 20px;">
                        <canvas id="deptReportChart"></canvas>
                    </div>
                </div>
                <div class="glass-card">
                    <h3>Monthly Expenses Trend</h3>
                    <div style="height: 300px; margin-top: 20px;">
                        <canvas id="expenseReportChart"></canvas>
                    </div>
                </div>
            </div>

            <div class="glass-card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3>Available Reports</h3>
                </div>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
                    <div class="report-item" style="padding: 15px; border-radius: 12px; background: rgba(255,255,255,0.02); border: 1px solid var(--border-subtle); display: flex; align-items: center; gap: 15px;">
                        <i class="fas fa-file-excel" style="color: #10b981; font-size: 1.5rem;"></i>
                        <div style="flex: 1;">
                            <p style="font-weight: 600; font-size: 0.85rem;">Attendance Register</p>
                            <p style="font-size: 0.65rem; color: var(--text-dim);">Detailed monthly logs</p>
                        </div>
                        <button class="btn" style="padding: 5px;"><i class="fas fa-download"></i></button>
                    </div>
                    <div class="report-item" style="padding: 15px; border-radius: 12px; background: rgba(255,255,255,0.02); border: 1px solid var(--border-subtle); display: flex; align-items: center; gap: 15px;">
                        <i class="fas fa-file-pdf" style="color: #ef4444; font-size: 1.5rem;"></i>
                        <div style="flex: 1;">
                            <p style="font-weight: 600; font-size: 0.85rem;">Salary Summary</p>
                            <p style="font-size: 0.65rem; color: var(--text-dim);">Statutory deductions report</p>
                        </div>
                        <button class="btn" style="padding: 5px;"><i class="fas fa-download"></i></button>
                    </div>
                    <div class="report-item" style="padding: 15px; border-radius: 12px; background: rgba(255,255,255,0.02); border: 1px solid var(--border-subtle); display: flex; align-items: center; gap: 15px;">
                        <i class="fas fa-file-export" style="color: #3b82f6; font-size: 1.5rem;"></i>
                        <div style="flex: 1;">
                            <p style="font-weight: 600; font-size: 0.85rem;">Compliance Audit</p>
                            <p style="font-size: 0.65rem; color: var(--text-dim);">PF/ESI half-yearly check</p>
                        </div>
                        <button class="btn" style="padding: 5px;"><i class="fas fa-download"></i></button>
                    </div>
                </div>
            </div>
        `;

        // Initialize report charts after a short delay
        setTimeout(() => UI.initReportCharts(), 100);
    },

    initReportCharts: () => {
        const ctxDept = document.getElementById('deptReportChart');
        if (ctxDept) {
            new Chart(ctxDept, {
                type: 'doughnut',
                data: {
                    labels: ['IT', 'HR', 'Finance', 'Sales', 'Admin'],
                    datasets: [{
                        data: [45, 10, 15, 20, 10],
                        backgroundColor: ['#06b6d4', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'],
                        borderWidth: 0
                    }]
                },
                options: { cutout: '70%', plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } } }
            });
        }

        const ctxExp = document.getElementById('expenseReportChart');
        if (ctxExp) {
            new Chart(ctxExp, {
                type: 'bar',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr'],
                    datasets: [{
                        label: 'Expense Claimed',
                        data: [45000, 62000, 58000, 71000],
                        backgroundColor: 'var(--accent-primary)',
                        borderRadius: 8
                    }]
                },
                options: { plugins: { legend: { display: false } }, scales: { y: { display: false }, x: { grid: { display: false } } } }
            });
        }
    }
};
