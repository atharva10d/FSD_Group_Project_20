const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

const appendLog = async (fileName, sheetName, columns, dataRow) => {
    // Saves into the /backend directory
    const absolutePath = path.resolve(__dirname, '..', fileName);
    const workbook = new ExcelJS.Workbook();
    
    try {
        if (fs.existsSync(absolutePath)) {
            await workbook.xlsx.readFile(absolutePath);
            const worksheet = workbook.getWorksheet(sheetName);
            worksheet.addRow(dataRow);
            await workbook.xlsx.writeFile(absolutePath);
        } else {
            const worksheet = workbook.addWorksheet(sheetName);
            worksheet.columns = columns;
            worksheet.addRow(dataRow);
            await workbook.xlsx.writeFile(absolutePath);
        }
    } catch (error) {
        console.error(`ExcelJS Sync Error [${fileName}]:`, error.message);
    }
};

exports.logAuth = async (name, email) => {
    await appendLog(
        'auth_logs.xlsx',
        'Logins',
        [
            { header: 'Name', key: 'name', width: 25 },
            { header: 'Email', key: 'email', width: 35 },
            { header: 'Timestamp', key: 'timestamp', width: 30 }
        ],
        { name, email, timestamp: new Date().toLocaleString() }
    );
};

exports.logPayment = async (passengerName, flightDetails, amountPaid, transactionId) => {
    await appendLog(
        'passenger_payments.xlsx',
        'Bookings',
        [
            { header: 'Passenger Name', key: 'passengerName', width: 25 },
            { header: 'Flight Details', key: 'flightDetails', width: 20 },
            { header: 'Amount Paid', key: 'amountPaid', width: 15 },
            { header: 'Stripe Transaction ID', key: 'transactionId', width: 40 },
            { header: 'Timestamp', key: 'timestamp', width: 30 }
        ],
        { passengerName, flightDetails, amountPaid: `$${amountPaid}`, transactionId, timestamp: new Date().toLocaleString() }
    );
};

exports.logFeedback = async (name, email, message) => {
    await appendLog(
        'feedback_logs.xlsx',
        'Feedback',
        [
            { header: 'Name', key: 'name', width: 25 },
            { header: 'Email', key: 'email', width: 35 },
            { header: 'Message', key: 'message', width: 50 },
            { header: 'Timestamp', key: 'timestamp', width: 30 }
        ],
        { name, email, message, timestamp: new Date().toLocaleString() }
    );
};
