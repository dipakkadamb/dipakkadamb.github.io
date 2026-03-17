/**
 * ASYNCRIX HRM - Core Database Logic
 */

export const STORAGE_KEY = 'asyncrix_hrm_data';

const DEFAULT_DATA = {
    employees: [
        {
            id: 'EMP001',
            name: 'Dipak Kadamb',
            department: 'IT',
            designation: 'Lead Developer',
            type: 'Full-time',
            joiningDate: '2024-01-15',
            email: 'dipak@asyncrix.com',
            status: 'Active',
            salary: 120000,
            photo: 'https://via.placeholder.com/150'
        },
        {
            id: 'EMP002',
            name: 'Sarah Chen',
            department: 'Finance',
            designation: 'CFO',
            type: 'Full-time',
            joiningDate: '2023-11-01',
            email: 'sarah@asyncrix.com',
            status: 'Active',
            salary: 150000
        },
        {
            id: 'EMP003',
            name: 'Marcus Thorne',
            department: 'HR',
            designation: 'HR Manager',
            type: 'Full-time',
            joiningDate: '2024-02-10',
            email: 'marcus@asyncrix.com',
            status: 'Active',
            salary: 95000
        }
    ],
    attendance: [],
    leaves: [],
    payroll: [],
    jobs: [
        {
            id: 'JOB001',
            title: 'Senior Frontend Engineer',
            department: 'IT',
            status: 'Open',
            postedDate: '2026-03-01',
            vacancies: 2
        },
        {
            id: 'JOB002',
            title: 'Finance Analyst',
            department: 'Finance',
            status: 'Closed',
            postedDate: '2026-02-15',
            vacancies: 1
        }
    ],
    candidates: [
        {
            id: 'CAN001',
            name: 'John Doe',
            jobId: 'JOB001',
            status: 'Applied',
            email: 'john@example.com',
            appliedDate: '2026-03-10'
        },
        {
            id: 'CAN002',
            name: 'Alice Wong',
            jobId: 'JOB001',
            status: 'Interview',
            email: 'alice@example.com',
            appliedDate: '2026-03-12'
        }
    ],
    performance: [
        {
            employeeId: 'EMP001',
            rating: 4.8,
            kpis: [
                { title: 'Project Delivery', target: 100, achieved: 95 },
                { title: 'Code Quality', target: 90, achieved: 92 }
            ],
            appraisals: [
                { cycle: 'Annual 2025', status: 'Completed', score: 4.5 }
            ]
        },
        {
            employeeId: 'EMP002',
            rating: 4.5,
            kpis: [
                { title: 'Budget Management', target: 100, achieved: 102 },
                { title: 'Compliance', target: 100, achieved: 100 }
            ],
            appraisals: [
                { cycle: 'Annual 2025', status: 'Pending', score: 0 }
            ]
        }
    ],
    trainings: [
        {
            id: 'TRN001',
            title: 'Advanced React Patterns',
            trainer: 'External Expert',
            date: '2026-04-05',
            status: 'Upcoming',
            attendees: 5
        },
        {
            id: 'TRN002',
            title: 'Financial Compliance 101',
            trainer: 'Sarah Chen',
            date: '2026-03-20',
            status: 'Open',
            attendees: 12
        }
    ],
    expenses: [
        {
            id: 'EXP001',
            employeeId: 'EMP001',
            category: 'Travel',
            amount: 2500,
            date: '2026-03-15',
            status: 'Pending',
            description: 'Visit to branch office'
        },
        {
            id: 'EXP002',
            employeeId: 'EMP003',
            category: 'Food',
            amount: 450,
            date: '2026-03-14',
            status: 'Approved',
            description: 'Client meeting dinner'
        }
    ],
    compliance: {
        pfRate: 12,
        esiRate: 0.75,
        ptSlabs: [
            { limit: 15000, amount: 0 },
            { limit: 21000, amount: 200 }
        ],
        lastFilingDate: '2026-03-10',
        upcomingAudits: [
            { title: 'Annual Tax Audit', date: '2026-06-15' }
        ]
    },
    settings: {
        company: {
            name: 'ASYNCRIX SYSTEMS',
            logo: '',
            address: 'Pune, India'
        }
    }
};

export function initDatabase() {
    if (!localStorage.getItem(STORAGE_KEY)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DATA));
        console.log('HRM: Database initialized with sample data.');
    }
}

export function getData(collection) {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return collection ? data[collection] : data;
}

export function saveData(collection, items) {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    data[collection] = items;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function addToCollection(collection, item) {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    data[collection].push(item);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function updateInCollection(collection, id, updatedItem) {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    const index = data[collection].findIndex(item => item.id === id);
    if (index !== -1) {
        data[collection][index] = { ...data[collection][index], ...updatedItem };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return true;
    }
    return false;
}

export function deleteFromCollection(collection, id) {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    data[collection] = data[collection].filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
