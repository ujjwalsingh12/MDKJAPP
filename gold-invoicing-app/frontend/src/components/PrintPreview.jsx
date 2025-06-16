import React, { forwardRef } from 'react';
import convertToWords from './utils.js';
const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px',
};

const thStyle = {
    border: '1px solid #ddd',
    padding: '8px',
    backgroundColor: '#f5f5f5',
    textAlign: 'left',
    fontWeight: 'bold',
};

const tdStyle = {
    border: '1px solid #ddd',
    padding: '8px',
    textAlign: 'left',
};

const PrintPreview = forwardRef(({
    billHeader,
    items,
    calculations,
    storeInfo,
}, ref) => (
    <div ref={ref} style={{ padding: '40px', backgroundColor: '#fff', color: '#333', fontFamily: 'Segoe UI', boxShadow: '0 0 10px rgba(0,0,0,0.1)', maxWidth: '900px', margin: 'auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px', borderBottom: '2px solid #333', paddingBottom: '20px' }}>
            <p style={{ margin: '0 0 10px' }}>{storeInfo.pagetype}</p>
            <h1 style={{ fontSize: '36px', margin: '0 0 15px' }}>{storeInfo.storeName}</h1>
            <div style={{ color: '#666', lineHeight: '1.4' }}>
                {storeInfo.storeAddress.split('\n').map((line, i) => (
                    <p key={i} style={{ margin: '5px 0' }}>{line}</p>
                ))}
            </div>
            <p style={{ color: '#666', marginTop: '10px' }}>
                Phone: {storeInfo.phone} | Email: {storeInfo.email}
            </p>
        </div>

        {/* Customer Info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
            <div>
                <h3 style={{ margin: '0 0 10px' }}>Bill To:</h3>
                <p style={{ margin: '5px 0', fontSize: '16px' }}>
                    <strong>{billHeader.customerName || 'Customer Name'}</strong>
                </p>
                {billHeader.customerPhone && <p style={{ margin: '5px 0' }}>Phone: {billHeader.customerPhone}</p>}
                {billHeader.customerAddress && <p style={{ margin: '5px 0', whiteSpace: 'pre-line' }}>{billHeader.customerAddress}</p>}
                {billHeader.customerEmail && <p style={{ margin: '5px 0' }}>Email: {billHeader.customerEmail}</p>}
            </div>
            <div style={{ textAlign: 'right' }}>
                <p style={{ margin: '5px 0' }}><strong>Bill #:</strong> {billHeader.billNumber}</p>
                <p style={{ margin: '5px 0' }}><strong>Date:</strong> {billHeader.date}</p>
            </div>
        </div>

        {/* Items Table */}
        <div>
            <h3 style={{ marginBottom: '16px', color: '#444' }}>Items</h3>
            <table style={tableStyle}>
                <thead>
                    <tr>
                        <th style={thStyle}>S.No</th>
                        <th style={thStyle}>Description</th>
                        <th style={thStyle}>HSN/SAC</th>
                        <th style={thStyle}>Purity</th>
                        <th style={thStyle}>Weight (gms)</th>
                        <th style={thStyle}>Rate (₹)</th>
                        <th style={thStyle}>Amount (₹)</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, index) => (
                        <tr key={item.id || index}>
                            <td style={tdStyle}>{index + 1}</td>
                            <td style={tdStyle}>{item.description}</td>
                            <td style={tdStyle}>{item.hsnSac}</td>
                            <td style={tdStyle}>{item.purity}</td>
                            <td style={tdStyle}>{item.weight.toFixed(3)}</td>
                            <td style={tdStyle}>{item.rate.toFixed(2)}</td>
                            <td style={tdStyle}>{item.amount.toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        {/* Tax Summary */}
        <div style={{ marginTop: '30px' }}>
            <h3 style={{ marginBottom: '16px', color: '#444' }}>Tax Summary</h3>
            <table style={tableStyle}>
                <tbody>
                    <tr>
                        <td style={tdStyle}>Total Taxable</td>
                        <td style={{ ...tdStyle, textAlign: 'right' }}>₹{calculations.totalTaxable}</td>
                    </tr>
                    <tr>
                        <td style={tdStyle}>CGST ({calculations.cgstRate}%)</td>
                        <td style={{ ...tdStyle, textAlign: 'right' }}>₹{calculations.cgstAmount}</td>
                    </tr>
                    <tr>
                        <td style={tdStyle}>SGST ({calculations.sgstRate}%)</td>
                        <td style={{ ...tdStyle, textAlign: 'right' }}>₹{calculations.sgstAmount}</td>
                    </tr>
                    <tr>
                        <td style={tdStyle}>IGST ({calculations.igstRate}%)</td>
                        <td style={{ ...tdStyle, textAlign: 'right' }}>₹{calculations.igstAmount}</td>
                    </tr>
                    <tr>
                        <td style={tdStyle}>Hallmarking Charges</td>
                        <td style={{ ...tdStyle, textAlign: 'right' }}>₹{calculations.hallmarkingTotal}</td>
                    </tr>
                    <tr>
                        <td style={tdStyle}>Discount</td>
                        <td style={{ ...tdStyle, textAlign: 'right' }}>-₹{calculations.discount}</td>
                    </tr>
                    <tr>
                        <td style={tdStyle}>Round Off</td>
                        <td style={{ ...tdStyle, textAlign: 'right' }}>{calculations.roundOff >= 0 ? '+' : ''}₹{calculations.roundOff}</td>
                    </tr>
                    <tr>
                        <td style={{ ...tdStyle, fontWeight: 'bold' }}>Grand Total</td>
                        <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 'bold' }}>₹{calculations.grandTotal}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '30px', fontSize: '14px', color: '#666' }}>
            <p>Amount in Words: <strong>{convertToWords(calculations.grandTotal)}</strong></p>
            <p>Thank you for your business!</p>
        </div>
    </div>
));

export default PrintPreview;