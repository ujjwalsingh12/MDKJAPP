import React, { useState, useMemo } from 'react';

// Dummy customer data for autocomplete
const dummyCustomers = [
    {
        id: 1,
        name: 'Rajesh Kumar',
        phone: '+91 98765 43210',
        address: '123 MG Road\nKanpur, UP 208001',
        email: 'rajesh.kumar@email.com'
    },
    {
        id: 2,
        name: 'Priya Sharma',
        phone: '+91 87654 32109',
        address: '456 Civil Lines\nKanpur, UP 208002',
        email: 'priya.sharma@email.com'
    },
    {
        id: 3,
        name: 'Amit Gupta',
        phone: '+91 76543 21098',
        address: '789 Swaroop Nagar\nKanpur, UP 208003',
        email: 'amit.gupta@email.com'
    },
    {
        id: 4,
        name: 'Sunita Verma',
        phone: '+91 65432 10987',
        address: '321 Kalyanpur\nKanpur, UP 208004',
        email: 'sunita.verma@email.com'
    },
    {
        id: 5,
        name: 'Vikram Singh',
        phone: '+91 54321 09876',
        address: '654 Govind Nagar\nKanpur, UP 208005',
        email: 'vikram.singh@email.com'
    }
];

// Basic inline styles
const labelStyle = { display: 'block', marginBottom: '6px', fontWeight: 'bold' };
const inputStyle = {
    width: '100%',
    padding: '8px',
    boxSizing: 'border-box',
    borderRadius: '4px',
    border: '1px solid #ccc',
};
const headerSectionStyle = {
    padding: '20px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    maxWidth: '600px',
    margin: 'auto',
    backgroundColor: '#fafafa',
};
const formGridStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
};
const customerDropdownStyle = {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    border: '1px solid #ddd',
    borderTop: 'none',
    borderRadius: '0 0 4px 4px',
    maxHeight: '200px',
    overflowY: 'auto',
    zIndex: 1000
};
const customerOptionStyle = {
    padding: '10px',
    cursor: 'pointer',
    borderBottom: '1px solid #eee'
};

// BillHeaderForm with autocomplete for customer name
const BillHeaderForm = ({ billHeader = {}, onChange, customerSearchTerm, onCustomerSearch, filteredCustomers, showCustomerDropdown, onCustomerSelect, setShowCustomerDropdown }) => {
    return (
        <div style={headerSectionStyle}>
            <h2 style={{ marginBottom: '20px', color: '#333' }}>Bill Information</h2>

            <div style={formGridStyle}>
                {/* Customer Name with Autocomplete */}
                <div style={{ position: 'relative' }}>
                    <label style={labelStyle}>Customer Name:</label>
                    <input
                        type="text"
                        style={inputStyle}
                        value={customerSearchTerm}
                        onChange={(e) => onCustomerSearch(e.target.value)}
                        onFocus={() => setShowCustomerDropdown(customerSearchTerm.trim().length > 0)}
                        placeholder="Search or enter customer name"
                        autoComplete="off"
                    />
                    {showCustomerDropdown && (
                        <div style={customerDropdownStyle}>
                            {filteredCustomers.length > 0 ? (
                                filteredCustomers.map((customer) => (
                                    <div
                                        key={customer.id}
                                        style={customerOptionStyle}
                                        onClick={() => onCustomerSelect(customer)}
                                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f0f0f0')}
                                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
                                    >
                                        <strong>{customer.name}</strong><br />
                                        <small>{customer.phone}</small>
                                    </div>
                                ))
                            ) : (
                                <div style={{ padding: '10px', color: '#999' }}>No customers found</div>
                            )}
                        </div>
                    )}
                </div>

                {/* Customer Phone */}
                <div>
                    <label style={labelStyle}>Customer Phone:</label>
                    <input
                        type="text"
                        style={inputStyle}
                        value={billHeader.customerPhone || ''}
                        onChange={(e) => onChange('customerPhone', e.target.value)}
                        placeholder="Enter phone number"
                    />
                </div>

                {/* Customer Address */}
                <div style={{ gridColumn: 'span 2' }}>
                    <label style={labelStyle}>Customer Address:</label>
                    <textarea
                        style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }}
                        value={billHeader.customerAddress || ''}
                        onChange={(e) => onChange('customerAddress', e.target.value)}
                        placeholder="Enter customer address"
                    />
                </div>

                {/* Customer Email */}
                <div>
                    <label style={labelStyle}>Customer Email:</label>
                    <input
                        type="email"
                        style={inputStyle}
                        value={billHeader.customerEmail || ''}
                        onChange={(e) => onChange('customerEmail', e.target.value)}
                        placeholder="Enter email address"
                    />
                </div>

                {/* Bill Number */}
                <div>
                    <label style={labelStyle}>Bill Number:</label>
                    <input
                        type="text"
                        style={inputStyle}
                        value={billHeader.billNumber || ''}
                        onChange={(e) => onChange('billNumber', e.target.value)}
                        placeholder="Enter bill number"
                    />
                </div>

                {/* Bill Date */}
                <div>
                    <label style={labelStyle}>Bill Date:</label>
                    <input
                        type="date"
                        style={inputStyle}
                        value={billHeader.date || ''}
                        onChange={(e) => onChange('date', e.target.value)}
                    />
                </div>
            </div>
        </div>

    );
};

export default BillHeaderForm;
