/**
 * ASYNCRIX HRM - Document Generation Engine
 */

export const DocumentTemplates = {
    OFFER_LETTER: {
        title: 'Offer Letter',
        content: `
            <div style="font-family: 'Times New Roman', serif; padding: 40px; color: #000; background: #fff; line-height: 1.6;">
                <div style="text-align: right; margin-bottom: 40px;">
                    <h1 style="color: #06b6d4; margin: 0;">ASYNCRIX</h1>
                    <p style="font-size: 0.8rem; color: #666;">HR Department · Tech Hub</p>
                </div>
                
                <p>Date: {{date}}</p>
                
                <div style="margin: 30px 0;">
                    <p><strong>To,</strong></p>
                    <p><strong>{{name}}</strong></p>
                    <p>{{address}}</p>
                </div>

                <h2 style="text-align: center; text-decoration: underline; margin-bottom: 30px;">Subject: Offer of Employment</h2>

                <p>Dear {{name}},</p>
                
                <p>Following our recent discussions, we are delighted to offer you the position of <strong>{{designation}}</strong> within our <strong>{{department}}</strong> department at ASYNCRIX.</p>

                <p>The details of your compensation package are as follows:</p>
                <div style="margin: 20px 40px; border: 1px solid #ccc; padding: 15px;">
                    <p><strong>Total Annual CTC:</strong> ₹{{salary_annual}}</p>
                    <p><strong>Monthly Gross:</strong> ₹{{salary_monthly}}</p>
                    <p><strong>Joining Date:</strong> {{joining_date}}</p>
                </div>

                <p>Your employment will be subject to the terms and conditions outlined in our standard employment agreement. We look forward to having you join our team and contribute to our mutual success.</p>

                <p>Please sign and return a copy of this letter as a token of your acceptance.</p>

                <div style="margin-top: 60px; display: flex; justify-content: space-between;">
                    <div>
                        <p>____________________</p>
                        <p><strong>HR Manager</strong></p>
                        <p>ASYNCRIX Solutions</p>
                    </div>
                    <div style="text-align: right;">
                        <p>____________________</p>
                        <p><strong>Candidate Signature</strong></p>
                        <p>{{name}}</p>
                    </div>
                </div>
            </div>
        `
    },
    PAYSLIP: {
        title: 'Salary Slip',
        content: `
            <div style="font-family: Arial, sans-serif; padding: 30px; color: #000; background: #fff; border: 2px solid #333;">
                <div style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px;">
                    <h2 style="margin: 0;">ASYNCRIX SOLUTIONS PVT LTD</h2>
                    <p style="margin: 5px 0;">Payslip for the month of {{month}} {{year}}</p>
                </div>

                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <tr>
                        <td style="padding: 5px;"><strong>Emp ID:</strong> {{emp_id}}</td>
                        <td style="padding: 5px;"><strong>Name:</strong> {{name}}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px;"><strong>Designation:</strong> {{designation}}</td>
                        <td style="padding: 5px;"><strong>Department:</strong> {{department}}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px;"><strong>Bank A/c:</strong> ************4521</td>
                        <td style="padding: 5px;"><strong>PAN:</strong> {{pan}}</td>
                    </tr>
                </table>

                <table style="width: 100%; border: 1px solid #333; border-collapse: collapse;">
                    <tr style="background: #f0f0f0;">
                        <th style="border: 1px solid #333; padding: 10px; text-align: left;">Earnings</th>
                        <th style="border: 1px solid #333; padding: 10px; text-align: right;">Amount (₹)</th>
                        <th style="border: 1px solid #333; padding: 10px; text-align: left;">Deductions</th>
                        <th style="border: 1px solid #333; padding: 10px; text-align: right;">Amount (₹)</th>
                    </tr>
                    <tr>
                        <td style="border: 1px solid #333; padding: 8px;">Basic Salary</td>
                        <td style="border: 1px solid #333; padding: 8px; text-align: right;">{{basic}}</td>
                        <td style="border: 1px solid #333; padding: 8px;">Provident Fund (PF)</td>
                        <td style="border: 1px solid #333; padding: 8px; text-align: right;">{{pf}}</td>
                    </tr>
                    <tr>
                        <td style="border: 1px solid #333; padding: 8px;">HRA</td>
                        <td style="border: 1px solid #333; padding: 8px; text-align: right;">{{hra}}</td>
                        <td style="border: 1px solid #333; padding: 8px;">Professional Tax</td>
                        <td style="border: 1px solid #333; padding: 8px; text-align: right;">{{pt}}</td>
                    </tr>
                    <tr>
                        <td style="border: 1px solid #333; padding: 8px;">Special Allowance</td>
                        <td style="border: 1px solid #333; padding: 8px; text-align: right;">{{allowance}}</td>
                        <td style="border: 1px solid #333; padding: 8px;">LWP Deductions</td>
                        <td style="border: 1px solid #333; padding: 8px; text-align: right;">{{lwp}}</td>
                    </tr>
                    <tr style="background: #f0f0f0; font-weight: bold;">
                        <td style="border: 1px solid #333; padding: 10px;">Gross Earnings</td>
                        <td style="border: 1px solid #333; padding: 10px; text-align: right;">{{gross}}</td>
                        <td style="border: 1px solid #333; padding: 10px;">Total Deductions</td>
                        <td style="border: 1px solid #333; padding: 10px; text-align: right;">{{total_deductions}}</td>
                    </tr>
                </table>

                <div style="margin-top: 20px; padding: 15px; background: #e0f2fe; border: 1px solid #333; display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 1.1rem; font-weight: bold;">NET TAKE HOME:</span>
                    <span style="font-size: 1.4rem; font-weight: bold; color: #0369a1;">₹{{net_pay}}</span>
                </div>

                <p style="font-size: 0.8rem; color: #666; margin-top: 20px;">* This is a computer-generated payslip and does not require a physical signature.</p>
            </div>
        `
    },
    APPOINTMENT_LETTER: {
        title: 'Appointment Letter',
        content: `
            <div style="font-family: serif; padding: 40px; color: #000; background: #fff; line-height: 1.6;">
                <h1 style="text-align: center; color: #06b6d4;">Appointment Letter</h1>
                <p>Dear {{name}},</p>
                <p>We are pleased to appoint you as <strong>{{designation}}</strong> at ASYNCRIX Solutions effective {{joining_date}}.</p>
                <!-- ... more content ... -->
            </div>
        `
    }
};

export const DocumentEngine = {
    generate: (templateId, data) => {
        let template = DocumentTemplates[templateId]?.content || '';
        
        // Basic replacement logic
        Object.keys(data).forEach(key => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            template = template.replace(regex, data[key]);
        });

        return template;
    },

    print: (content) => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Print Document</title>
                    <style>@page { size: A4; margin: 0; } body { margin: 0; }</style>
                </head>
                <body>${content}</body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    }
};
