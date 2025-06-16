import React from 'react';
import ItemsTable from './ItemsTable.jsx';
import TaxSummary from './TaxSummary.jsx';
import convertToWords from './utils.js';


const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '30px',
};

const thStyle = {
    padding: '10px',
    border: '1px solid #ddd',
    fontWeight: 'bold',
    textAlign: 'left',
    fontSize: '14px',
};

const tdStyle = {
    padding: '10px',
    border: '1px solid #ddd',
    fontSize: '14px',
};

const BillPreview = ({ items, setItems, total, selectedRowIndex, setSelectedRowIndex, calculations, cgstRate, sgstRate, igstRate, hallmarkingCharges, hallmarkingPieces, hallmarkingCgst, hallmarkingSgst, discount, storeInfo, billHeader, onTotalChange, onChange, onAdd, onDelete, onEditClick, onKeyDown, onCgstChange, onSgstChange, onIgstChange, onHallmarkingCgstChange, onHallmarkingSgstChange, onHallmarkingChange, onPiecesChange, onDiscountChange }) => {
    return (
        <div style={{ padding: '40px', backgroundColor: '#fff', color: '#333', fontFamily: 'Segoe UI', boxShadow: '0 0 10px rgba(0,0,0,0.1)', maxWidth: '900px', margin: 'auto' }}>
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

            <ItemsTable
                items={items}
                setItems={setItems}
                total={total}
                onTotalChange={onTotalChange}
                selectedRowIndex={selectedRowIndex}
                onChange={onChange}
                onAdd={onAdd}
                onDelete={onDelete}
                onEditClick={onEditClick}
                onKeyDown={onKeyDown}
                setSelectedRowIndex={setSelectedRowIndex}
            />

            <TaxSummary
                calculations={calculations}
                cgstRate={cgstRate}
                sgstRate={sgstRate}
                igstRate={igstRate}
                hallmarkingCharges={hallmarkingCharges}
                hallmarkingPieces={hallmarkingPieces}
                hallmarkingCgst={hallmarkingCgst}
                hallmarkingSgst={hallmarkingSgst}
                discount={discount}
                onCgstChange={onCgstChange}
                onSgstChange={onSgstChange}
                onIgstChange={onIgstChange}
                onHallmarkingCgstChange={onHallmarkingCgstChange}
                onHallmarkingSgstChange={onHallmarkingSgstChange}
                onHallmarkingChange={onHallmarkingChange}
                onPiecesChange={onPiecesChange}
                onDiscountChange={onDiscountChange}
            />

            <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f9f9f9', border: '1px solid #ddd', borderRadius: '4px' }}>
                <strong>Amount in word(s):</strong><br />
                <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>
                    {convertToWords(calculations.grandTotal || 0)}
                </span>
            </div>


            {/* Thank you message */}
            <div style={{ textAlign: 'center', marginTop: '40px', color: '#666' }}>
                <p style={{ margin: 0, fontSize: '16px' }}>Thank you for choosing MDKJ Jewellers!</p>
            </div>
        </div>

    );
};

export default BillPreview;