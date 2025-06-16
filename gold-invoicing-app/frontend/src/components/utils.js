// utils.js

// Basic number to words for INR currency (can be replaced by a library for full feature)
export function numberToWords(num) {
    // For demo, return the formatted number + suffix
    if (typeof num !== 'number') num = parseFloat(num);
    if (isNaN(num)) return '';
    return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' Rupees Only';
}

// Format currency INR with 2 decimals
export function formatINR(amount) {
    if (typeof amount !== 'number') amount = parseFloat(amount);
    if (isNaN(amount)) amount = 0;
    return '₹' + amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Round to 2 decimals
export function round2Decimals(value) {
    return Math.round(value * 100) / 100;
}

// utils.js

const convertToWords = (num) => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const convertHundreds = (n) => {
        let result = '';
        if (n > 99) {
            result += ones[Math.floor(n / 100)] + ' Hundred ';
            n %= 100;
        }
        if (n > 19) {
            result += tens[Math.floor(n / 10)] + ' ';
            n %= 10;
        }
        if (n > 0) {
            result += ones[n] + ' ';
        }
        return result;
    };

    if (num === 0) return 'Zero';

    const crore = Math.floor(num / 10000000);
    const lakh = Math.floor((num % 10000000) / 100000);
    const thousand = Math.floor((num % 100000) / 1000);
    const remainder = num % 1000;

    let result = '';
    if (crore > 0) result += convertHundreds(crore) + 'Crore ';
    if (lakh > 0) result += convertHundreds(lakh) + 'Lakh(s) ';
    if (thousand > 0) result += convertHundreds(thousand) + 'Thousand ';
    if (remainder > 0) result += convertHundreds(remainder);

    return 'Rupees ' + result.trim() + ' Only';
};

// exports = {
//     convertToWords,
//     numberToWords,
//     formatINR,
//     round2Decimals
// };
export default convertToWords;