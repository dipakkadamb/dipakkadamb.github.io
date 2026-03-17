/**
 * ASYNCRIX HRM - Payroll Calculation Engine
 */

export const PayrollEngine = {
    // Standard Statutory Constants (India)
    PF_EMPLOYEE_RATE: 0.12,
    PF_EMPLOYER_RATE: 0.12,
    ESI_EMPLOYEE_RATE: 0.0075,
    ESI_EMPLOYER_RATE: 0.0325,
    PT_LIMIT: 21000, // Example PT threshold

    calculateMonthlyPayroll: (employee, attendanceData) => {
        const { salary, id } = employee;
        const daysInMonth = 30; // Simplified for calculation
        
        // Attendance logic
        const presentDays = attendanceData.filter(a => a.employeeId === id && a.status === 'Present').length;
        const lwpDays = attendanceData.filter(a => a.employeeId === id && a.status === 'LWP').length;
        
        // Calculation
        const perDaySalary = salary / daysInMonth;
        const totalEarnings = salary - (perDaySalary * lwpDays);
        
        // Breakup
        const basic = totalEarnings * 0.50;
        const hra = basic * 0.40;
        const conveyance = 1600;
        const medical = 1250;
        const specialAllowance = totalEarnings - (basic + hra + conveyance + medical);

        // Deductions
        const pfEmployee = basic * PayrollEngine.PF_EMPLOYEE_RATE;
        const esiEmployee = totalEarnings < 21000 ? totalEarnings * PayrollEngine.ESI_EMPLOYEE_RATE : 0;
        const pt = totalEarnings > 15000 ? 200 : 0;
        const totalDeductions = pfEmployee + esiEmployee + pt;

        const netSalary = totalEarnings - totalDeductions;

        return {
            month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
            earnings: {
                basic,
                hra,
                conveyance,
                medical,
                specialAllowance,
                total: totalEarnings
            },
            deductions: {
                pf: pfEmployee,
                esi: esiEmployee,
                pt,
                total: totalDeductions
            },
            netSalary
        };
    }
};
