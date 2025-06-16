

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { fetchAll } from '../api';

const Receipt = () => {
  // --- Fixed store information ---
  const [cgstRate, setCgstRate] = useState(1.5);
  const [sgstRate, setSgstRate] = useState(1.5);
  const [igstRate, setIgstRate] = useState(0);
  const [hallmarkingCharges, setHallmarkingCharges] = useState(45.00);
  const [hallmarkingPieces, setHallmarkingPieces] = useState(40);
  const [hallmarkingCgst, setHallmarkingCgst] = useState(9.0);
  const [hallmarkingSgst, setHallmarkingSgst] = useState(9.0);
  const [discount, setDiscount] = useState(0);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const storeInfo = {
    storeName: 'MDKJ JEWELLERS',
    storeAddress: 'Shop No. 45, Birhana Road\nKanpur, Uttar Pradesh 208001',
    phone: '+91 98765 12345',
    email: 'mdkjjewellers@gmail.com'
  };



  const [customers, setCustomers] = useState([]);
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const response = await fetchAll('customer_details', {
          page: 1,
          page_size: 100
        });
        setCustomers(response.data); // Assuming backend returns `{ records: [...] }`
      } catch (err) {
        console.error('Error loading customers:', err);
      } finally {
        ;
      }
    };

    loadCustomers();
  }, []);
  // --- Filter customers based on search term ---
  const filteredCustomers = useMemo(() => {
    if (!customerSearchTerm) return customers;
    return customers.filter(customer =>
      customer.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
      customer.phone.includes(customerSearchTerm)
    );
  }, [customerSearchTerm]);


  // --- State for bill header information ---
  const [billHeader, setBillHeader] = useState({
    billNumber: 'BILL-' + Date.now().toString().slice(-6),
    date: new Date().toISOString().split('T')[0],
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    customerEmail: ''
  });



  // --- State for bill items ---
  const [items, setItems] = useState([
    {
      id: 1,
      description: 'New Gold Ornaments',
      hsnSac: '7113',
      purity: '18 CT',
      weight: 0,
      rate: 7200.00,
      amount: 0,
      isEditing: true
    },
    // {
    //   id: 2,
    //   description: 'New Gold Ornaments',
    //   hsnSac: '7113',
    //   purity: '18 CT',
    //   weight: 260.770,
    //   rate: 7200.00,
    //   amount: 1877544.00,
    //   isEditing: false
    // },
  ]);

  // --- State for charges and taxes ---

  // --- Ref for the bill preview ---
  const billRef = useRef();


  // --- Memoized calculations for totals ---
  const calculations = useMemo(() => {
    const totalTaxable = items.reduce((sum, item) => sum + item.amount, 0);

    const cgstAmount = (totalTaxable * cgstRate) / 100;
    const sgstAmount = (totalTaxable * sgstRate) / 100;
    const igstAmount = (totalTaxable * igstRate) / 100;

    const hallmarkingTotal = hallmarkingCharges * hallmarkingPieces;
    const hallmarkingCgstAmount = (hallmarkingTotal * hallmarkingCgst) / 100;
    const hallmarkingSgstAmount = (hallmarkingTotal * hallmarkingSgst) / 100;

    const subtotal = totalTaxable + cgstAmount + sgstAmount + igstAmount + hallmarkingTotal + hallmarkingCgstAmount + hallmarkingSgstAmount;
    const roundOff = Math.round(subtotal) - subtotal;
    const grandTotal = Math.round(subtotal);

    return {
      totalTaxable: totalTaxable.toFixed(2),
      cgstAmount: cgstAmount.toFixed(2),
      sgstAmount: sgstAmount.toFixed(2),
      igstAmount: igstAmount.toFixed(2),
      hallmarkingTotal: hallmarkingTotal.toFixed(2),
      hallmarkingCgstAmount: hallmarkingCgstAmount.toFixed(2),
      hallmarkingSgstAmount: hallmarkingSgstAmount.toFixed(2),
      roundOff: roundOff.toFixed(2),
      grandTotal: grandTotal.toFixed(2),
      grandTotalWords: convertToWords(grandTotal)
    };
  }, [items, cgstRate, sgstRate, igstRate, hallmarkingCharges, hallmarkingPieces, hallmarkingCgst, hallmarkingSgst]);

  // --- Handle customer selection ---
  const handleCustomerSelect = (customer) => {
    setBillHeader(prev => ({
      ...prev,
      customerName: customer.name,
      customerPhone: customer.phone,
      customerAddress: customer.address,
      customerEmail: customer.email,
      customerGstin: customer.gstin || '' // Assuming customer object has gstin field
    }));
    setCustomerSearchTerm(customer.name);
    setShowCustomerDropdown(false);
  };

  // --- Handle customer search ---
  const handleCustomerSearch = (value) => {
    setCustomerSearchTerm(value);
    setBillHeader(prev => ({ ...prev, customerName: value }));
    setShowCustomerDropdown(value.length > 0);
  };

  // --- Handle changes to bill header fields ---
  const handleHeaderChange = (field, value) => {
    setBillHeader(prev => ({ ...prev, [field]: value }));
  };

  // --- Handle changes to an item field ---
  const handleItemChange = (rowIndex, field, value) => {
    const newItems = [...items];
    if (field === 'weight' || field === 'rate') {
      const numValue = parseFloat(value) || 0;
      newItems[rowIndex][field] = numValue;
      // Auto-calculate amount when weight or rate changes
      if (field === 'weight' || field === 'rate') {
        newItems[rowIndex].amount = newItems[rowIndex].weight * newItems[rowIndex].rate;
      }
    } else if (field === 'amount') {
      newItems[rowIndex][field] = parseFloat(value) || 0;
    } else {
      newItems[rowIndex][field] = value;
    }
    setItems(newItems);
  };

  // --- Toggle edit mode for an item row ---
  const handleEditClick = (rowIndex) => {
    const newItems = [...items];
    newItems[rowIndex].isEditing = !newItems[rowIndex].isEditing;
    setItems(newItems);
  };

  // --- Add a new item row ---
  const handleAddRow = () => {
    const newRowIndex = selectedRowIndex !== null ? selectedRowIndex + 1 : items.length;
    const newItems = [...items];
    newItems.splice(newRowIndex, 0, {
      id: Date.now(),
      description: '',
      hsnSac: '7113',
      purity: '18 CT',
      weight: 0,
      rate: 7200.00,
      amount: 0,
      isEditing: true
    });
    setItems(newItems);
    setSelectedRowIndex(newRowIndex);
  };

  // --- Delete an item row ---
  const handleDeleteRow = (rowIndex) => {
    if (items.length > 1) {
      const newItems = items.filter((_, index) => index !== rowIndex);
      setItems(newItems);
    }
  };

  // --- Keyboard navigation ---
  const handleKeyDown = (event, rowIndex, field) => {
    if (event.key === 'Enter') {
      handleEditClick(rowIndex);
    } else if (event.key === 'Tab') {
      event.preventDefault();
      const fields = ['description', 'hsnSac', 'purity', 'weight', 'rate', 'amount'];
      const currentFieldIndex = fields.indexOf(field);

      if (currentFieldIndex < fields.length - 1) {
        const nextField = fields[currentFieldIndex + 1];
        const nextInput = document.querySelector(`input[data-row="${rowIndex}"][data-field="${nextField}"]`);
        if (nextInput) nextInput.focus();
      } else if (rowIndex < items.length - 1) {
        const nextInput = document.querySelector(`input[data-row="${rowIndex + 1}"][data-field="description"]`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  // --- Print function ---
  const handlePrint = () => {
    const printContent = billRef.current.innerHTML;
    const printWindow = window.open('', '', 'height=600,width=800');

    printWindow.document.write(`
      <html>
        <head>
          <title>Print Bill - ${billHeader.billNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .bill-header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .bill-info { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .customer-info { text-align: left; }
            .bill-details { text-align: right; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; font-weight: bold; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .totals { margin-top: 20px; }
            .total-row { font-weight: bold; background-color: #f0f0f0; }
            .print-hide { display: none; }
            .grand-total { font-size: 18px; font-weight: bold; }
          </style>
        </head>
        <body>${printContent}</body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  // Styles
  const containerStyle = {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f8f9fa'
  };

  const headerSectionStyle = {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '8px',
    marginBottom: '20px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  };

  const formGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold',
    color: '#333'
  };

  const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px'
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

  const billPreviewStyle = {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '8px',
    marginBottom: '20px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    margin: '20px 0'
  };

  const thStyle = {
    border: '1px solid #ddd',
    padding: '12px',
    backgroundColor: '#f5f5f5',
    fontWeight: 'bold',
    textAlign: 'left'
  };

  const tdStyle = {
    border: '1px solid #ddd',
    padding: '8px'
  };

  const controlsStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '15px',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  };

  const buttonStyle = {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  };

  const editButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#007bff',
    color: 'white',
    marginRight: '5px'
  };

  const saveButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#28a745',
    color: 'white',
    marginRight: '5px'
  };

  const deleteButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#dc3545',
    color: 'white'
  };

  return (
    <div style={containerStyle}>
      {/* --- Customer Details Section --- */}
      <div style={headerSectionStyle}>
        <h2 style={{ margin: '0 0 20px 0', color: '#333' }}>Customer Information</h2>
        <div style={formGridStyle}>
          {/* Customer Name with Search */}
          <div style={{ position: 'relative' }}>
            <label style={labelStyle}>Customer Name:</label>
            <input
              type="text"
              style={inputStyle}
              value={customerSearchTerm}
              onChange={(e) => handleCustomerSearch(e.target.value)}
              onFocus={() => setShowCustomerDropdown(customerSearchTerm.length > 0)}
              placeholder="Search or enter customer name"
            />
            {showCustomerDropdown && (
              <div style={customerDropdownStyle}>
                {filteredCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    style={customerOptionStyle}
                    onClick={() => handleCustomerSelect(customer)}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                  >
                    <strong>{customer.name}</strong><br />
                    <small>{customer.phone}</small>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Customer Phone */}
          <div>
            <label style={labelStyle}>Customer Phone:</label>
            <input
              type="text"
              style={inputStyle}
              value={billHeader.customerPhone}
              onChange={(e) => handleHeaderChange('customerPhone', e.target.value)}
            />
          </div>
          {/* Customer GSTIN */}
          <div>
            <label style={labelStyle}>Customer GSTIN:</label>
            <input
              type="text"
              style={inputStyle}
              value={billHeader.customerGstin || ''}
              onChange={(e) => handleHeaderChange('customerGstin', e.target.value)}
            />
          </div>

          {/* Customer Address */}
          <div>
            <label style={labelStyle}>Customer Address:</label>
            <textarea
              style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }}
              value={billHeader.customerAddress}
              onChange={(e) => handleHeaderChange('customerAddress', e.target.value)}
            />
          </div>

          {/* Customer Email */}
          <div>
            <label style={labelStyle}>Customer Email:</label>
            <input
              type="email"
              style={inputStyle}
              value={billHeader.customerEmail}
              onChange={(e) => handleHeaderChange('customerEmail', e.target.value)}
            />
          </div>

          {/* Bill Date */}
          <div>
            <label style={labelStyle}>Bill Date:</label>
            <input
              type="date"
              style={inputStyle}
              value={billHeader.date}
              onChange={(e) => handleHeaderChange('date', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* --- Bill Preview Section --- */}
      <div ref={billRef} style={billPreviewStyle}>
        {/* Bill Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px', borderBottom: '2px solid #333', paddingBottom: '20px' }}>
          <h1 style={{ fontSize: '36px', margin: '0 0 10px 0', color: '#333' }}>INVOICE</h1>
          <h2 style={{ fontSize: '24px', margin: '0 0 15px 0', color: '#333' }}>{storeInfo.storeName}</h2>
          <div style={{ color: '#666', lineHeight: '1.4' }}>
            {storeInfo.storeAddress.split('\n').map((line, i) => (
              <p key={i} style={{ margin: '5px 0' }}>{line}</p>
            ))}
          </div>
          <p style={{ color: '#666', margin: '10px 0 0 0' }}>
            Phone: {storeInfo.phone} | Email: {storeInfo.email}
          </p>
        </div>

        {/* Bill Info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
          <div>
            <h3 style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>Bill To:</h3>
            <p style={{ margin: '5px 0', fontSize: '16px' }}>
              <strong>{billHeader.customerName || 'Customer Name'}</strong>
            </p>
            {billHeader.customerPhone && (
              <p style={{ margin: '5px 0', fontSize: '14px' }}>
                Phone: {billHeader.customerPhone}
              </p>
            )}
            {billHeader.customerGstin && (
              <p style={{ margin: '5px 0', fontSize: '14px' }}>
                GSTIN: {billHeader.customerGstin}
              </p>
            )}
            {billHeader.customerAddress && (
              <p style={{ margin: '5px 0', fontSize: '14px', whiteSpace: 'pre-line' }}>
                {billHeader.customerAddress}
              </p>
            )}
            {billHeader.customerEmail && (
              <p style={{ margin: '5px 0', fontSize: '14px' }}>
                Email: {billHeader.customerEmail}
              </p>
            )}
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: '5px 0' }}><strong>Bill #:</strong> {billHeader.billNumber}</p>
            <p style={{ margin: '5px 0' }}><strong>Date:</strong> {billHeader.date}</p>
          </div>
        </div>

        {/* Items Table */}
        <table style={tableStyle}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              <th style={{ ...thStyle, width: '30px', textAlign: 'center' }}>S.No</th>
              <th style={{ ...thStyle, width: '200px' }}>Description</th>
              <th style={{ ...thStyle, width: '80px', textAlign: 'center' }}>HSN/SAC</th>
              <th style={{ ...thStyle, width: '80px', textAlign: 'center' }}>Purity</th>
              <th style={{ ...thStyle, width: '100px', textAlign: 'center' }}>Weight(in gms)</th>
              <th style={{ ...thStyle, width: '100px', textAlign: 'right' }}>Rate (₹)</th>
              <th style={{ ...thStyle, width: '120px', textAlign: 'right' }}>Amount (₹)</th>
              <th style={{ ...thStyle, width: '150px', textAlign: 'center' }} className="print-hide">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, rowIndex) => (
              <tr
                key={item.id}
                style={{
                  backgroundColor: selectedRowIndex === rowIndex ? '#e3f2fd' : 'transparent',
                  cursor: 'pointer'
                }}
                onMouseEnter={() => setSelectedRowIndex(rowIndex)}
                onMouseLeave={() => setSelectedRowIndex(null)}
              >
                <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 'bold' }}>
                  {rowIndex + 1}
                </td>
                <td style={tdStyle}>
                  {item.isEditing ? (
                    <input
                      type="text"
                      style={{ ...inputStyle, margin: 0 }}
                      value={item.description}
                      data-row={rowIndex}
                      data-field="description"
                      onChange={(e) => handleItemChange(rowIndex, 'description', e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, rowIndex, 'description')}
                      autoFocus
                    />
                  ) : (
                    <span
                      onClick={() => handleEditClick(rowIndex)}
                      style={{ cursor: 'pointer', display: 'block', padding: '4px' }}
                    >
                      {item.description || 'Click to edit'}
                    </span>
                  )}
                </td>
                <td style={{ ...tdStyle, textAlign: 'center' }}>
                  {item.isEditing ? (
                    <input
                      type="text"
                      style={{ ...inputStyle, margin: 0, textAlign: 'center', width: '70px' }}
                      value={item.hsnSac}
                      data-row={rowIndex}
                      data-field="hsnSac"
                      onChange={(e) => handleItemChange(rowIndex, 'hsnSac', e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, rowIndex, 'hsnSac')}
                    />
                  ) : (
                    <span
                      onClick={() => handleEditClick(rowIndex)}
                      style={{ cursor: 'pointer', display: 'block', padding: '4px' }}
                    >
                      {item.hsnSac}
                    </span>
                  )}
                </td>
                <td style={{ ...tdStyle, textAlign: 'center' }}>
                  {item.isEditing ? (
                    <input
                      type="text"
                      style={{ ...inputStyle, margin: 0, textAlign: 'center', width: '70px' }}
                      value={item.purity}
                      data-row={rowIndex}
                      data-field="purity"
                      onChange={(e) => handleItemChange(rowIndex, 'purity', e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, rowIndex, 'purity')}
                    />
                  ) : (
                    <span
                      onClick={() => handleEditClick(rowIndex)}
                      style={{ cursor: 'pointer', display: 'block', padding: '4px' }}
                    >
                      {item.purity}
                    </span>
                  )}
                </td>
                <td style={{ ...tdStyle, textAlign: 'center' }}>
                  {item.isEditing ? (
                    <input
                      type="number"
                      style={{ ...inputStyle, margin: 0, textAlign: 'center', width: '90px' }}
                      value={item.weight}
                      data-row={rowIndex}
                      data-field="weight"
                      onChange={(e) => handleItemChange(rowIndex, 'weight', e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, rowIndex, 'weight')}
                      min="0"
                      step="0.001"
                    />
                  ) : (
                    <span
                      onClick={() => handleEditClick(rowIndex)}
                      style={{ cursor: 'pointer', display: 'block', padding: '4px' }}
                    >
                      {item.weight.toFixed(3)}
                    </span>
                  )}
                </td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>
                  {item.isEditing ? (
                    <input
                      type="number"
                      style={{ ...inputStyle, margin: 0, textAlign: 'right', width: '90px' }}
                      value={item.rate}
                      data-row={rowIndex}
                      data-field="rate"
                      onChange={(e) => handleItemChange(rowIndex, 'rate', e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, rowIndex, 'rate')}
                      min="0"
                      step="0.01"
                    />
                  ) : (
                    <span
                      onClick={() => handleEditClick(rowIndex)}
                      style={{ cursor: 'pointer', display: 'block', padding: '4px' }}
                    >
                      ₹{item.rate.toFixed(2)}
                    </span>
                  )}
                </td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>
                  {item.isEditing ? (
                    <input
                      type="number"
                      style={{ ...inputStyle, margin: 0, textAlign: 'right', width: '110px' }}
                      value={item.amount}
                      data-row={rowIndex}
                      data-field="amount"
                      onChange={(e) => handleItemChange(rowIndex, 'amount', e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, rowIndex, 'amount')}
                      min="0"
                      step="0.01"
                    />
                  ) : (
                    <span
                      onClick={() => handleEditClick(rowIndex)}
                      style={{ cursor: 'pointer', display: 'block', padding: '4px', fontWeight: 'bold' }}
                    >
                      ₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  )}
                </td>
                <td style={{ ...tdStyle, textAlign: 'center' }} className="print-hide">
                  <button
                    style={item.isEditing ? saveButtonStyle : editButtonStyle}
                    onClick={() => handleEditClick(rowIndex)}
                  >
                    {item.isEditing ? 'Save' : 'Edit'}
                  </button>
                  <button
                    style={deleteButtonStyle}
                    onClick={() => handleDeleteRow(rowIndex)}
                  >
                    Del
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        /* Totals Section */}
        <div style={{ width: '400px', marginLeft: 'auto', marginTop: '30px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ padding: '8px', fontWeight: 'bold', backgroundColor: '#f5f5f5', border: '1px solid #333' }}>
                  Total Taxable
                </td>
                <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold', backgroundColor: '#f5f5f5', border: '1px solid #333' }}>
                  ₹{parseFloat(calculations.totalTaxable).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '8px', border: '1px solid #333' }}>
                  CGST {cgstRate}%
                </td>
                <td style={{ padding: '8px', textAlign: 'right', border: '1px solid #333' }}>
                  ₹{parseFloat(calculations.cgstAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '8px', border: '1px solid #333' }}>
                  SGST {sgstRate}%
                </td>
                <td style={{ padding: '8px', textAlign: 'right', border: '1px solid #333' }}>
                  ₹{parseFloat(calculations.sgstAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '8px', border: '1px solid #333' }}>
                  IGST {igstRate}%
                </td>
                <td style={{ padding: '8px', textAlign: 'right', border: '1px solid #333' }}>
                  ₹{parseFloat(calculations.igstAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '8px', border: '1px solid #333' }}>
                  Hallmarking Charges 9983 @ ₹{hallmarkingCharges.toFixed(2)}<br />
                  <small>
                    Pieces:
                    <input
                      type="number"
                      style={{ ...inputStyle, width: '60px', marginLeft: '10px' }}
                      value={hallmarkingPieces}
                      onChange={(e) => setHallmarkingPieces(parseInt(e.target.value) || 0)}
                      min="0"
                      step="1"
                    />
                  </small>
                </td>
                <td style={{ padding: '8px', textAlign: 'right', border: '1px solid #333' }}>
                  ₹{parseFloat(calculations.hallmarkingTotal).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '8px', border: '1px solid #333', paddingLeft: '20px' }}>
                  CGST {hallmarkingCgst}%
                </td>
                <td style={{ padding: '8px', textAlign: 'right', border: '1px solid #333' }}>
                  ₹{parseFloat(calculations.hallmarkingCgstAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '8px', border: '1px solid #333', paddingLeft: '20px' }}>
                  SGST {hallmarkingSgst}%
                </td>
                <td style={{ padding: '8px', textAlign: 'right', border: '1px solid #333' }}>
                  ₹{parseFloat(calculations.hallmarkingSgstAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '8px', border: '1px solid #333', paddingLeft: '20px' }}>
                  IGST 0.0%
                </td>
                <td style={{ padding: '8px', textAlign: 'right', border: '1px solid #333' }}>
                  ₹0.00
                </td>
              </tr>
              <tr>
                <td style={{ padding: '8px', border: '1px solid #333' }}>
                  Round off
                </td>
                <td style={{ padding: '8px', textAlign: 'right', border: '1px solid #333' }}>
                  {parseFloat(calculations.roundOff) >= 0 ? '+' : ''}₹{calculations.roundOff}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '12px', fontWeight: 'bold', fontSize: '18px', backgroundColor: '#f0f0f0', border: '2px solid #333' }}>
                  Grand Total
                </td>
                <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', fontSize: '18px', backgroundColor: '#f0f0f0', border: '2px solid #333' }}>
                  ₹{parseFloat(calculations.grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Amount in Words */}
        <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f9f9f9', border: '1px solid #ddd', borderRadius: '4px' }}>
          <strong>Amount in word(s):</strong><br />
          <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>
            {calculations.grandTotalWords}
          </span>
        </div>

        {/* Thank you message */}
        <div style={{ textAlign: 'center', marginTop: '40px', color: '#666' }}>
          <p style={{ margin: 0, fontSize: '16px' }}>Thank you for choosing MDKJ Jewellers!</p>
        </div>
      </div>

      {/* Controls */}
      <div style={controlsStyle}>
        <button
          style={{ ...buttonStyle, backgroundColor: '#28a745', color: 'white', fontSize: '16px', padding: '12px 24px' }}
          onClick={handleAddRow}
        >
          Add Item
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '14px', fontWeight: 'bold' }}>CGST (%):</label>
          <input
            type="number"
            style={{ ...inputStyle, width: '80px' }}
            value={cgstRate}
            onChange={(e) => setCgstRate(parseFloat(e.target.value) || 0)}
            min="0"
            step="0.1"
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '14px', fontWeight: 'bold' }}>SGST (%):</label>
          <input
            type="number"
            style={{ ...inputStyle, width: '80px' }}
            value={sgstRate}
            onChange={(e) => setSgstRate(parseFloat(e.target.value) || 0)}
            min="0"
            step="0.1"
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '14px', fontWeight: 'bold' }}>IGST (%):</label>
          <input
            type="number"
            style={{ ...inputStyle, width: '80px' }}
            value={igstRate}
            onChange={(e) => setIgstRate(parseFloat(e.target.value) || 0)}
            min="0"
            step="0.1"
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Hallmark Rate (₹):</label>
          <input
            type="number"
            style={{ ...inputStyle, width: '80px' }}
            value={hallmarkingCharges}
            onChange={(e) => setHallmarkingCharges(parseFloat(e.target.value) || 0)}
            min="0"
            step="0.01"
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Pieces:</label>
          <input
            type="number"
            style={{ ...inputStyle, width: '80px' }}
            value={hallmarkingPieces}
            onChange={(e) => setHallmarkingPieces(parseInt(e.target.value) || 0)}
            min="0"
            step="1"
          />
        </div>

        <button
          style={{ ...buttonStyle, backgroundColor: '#007bff', color: 'white', fontSize: '16px', padding: '12px 24px' }}
          onClick={handlePrint}
        >
          Print Bill
        </button>
      </div>

      {/* Usage Instructions */}
      <div style={{
        marginTop: '20px',
        padding: '20px',
        backgroundColor: '#e3f2fd',
        borderRadius: '8px',
        border: '1px solid #2196f3'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#1976d2' }}>How to use:</h3>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#333', lineHeight: '1.6' }}>
          <li>Search for existing customers or enter new customer details manually</li>
          <li>Click on customer name in dropdown to auto-fill their information</li>
          <li>Click on any item cell to edit it directly</li>
          <li>Weight and Rate will auto-calculate Amount when changed</li>
          <li>Use Tab to move between fields, Enter to save</li>
          <li>Adjust tax rates and hallmarking charges as needed</li>
          <li>Print the final bill when ready</li>
        </ul>
      </div>
    </div >
  );
};

export default Receipt;


// ------------- END OF FILE -------------


// --- Convert number to words ---
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
// const dummyCustomers = [
//   {
//     id: 1,
//     name: 'Rajesh Kumar',
//     phone: '+91 98765 43210',
//     address: '123 MG Road\nKanpur, UP 208001',
//     email: 'rajesh.kumar@email.com'
//   },
//   {
//     id: 2,
//     name: 'Priya Sharma',
//     phone: '+91 87654 32109',
//     address: '456 Civil Lines\nKanpur, UP 208002',
//     email: 'priya.sharma@email.com'
//   },
//   {
//     id: 3,
//     name: 'Amit Gupta',
//     phone: '+91 76543 21098',
//     address: '789 Swaroop Nagar\nKanpur, UP 208003',
//     email: 'amit.gupta@email.com'
//   },
//   {
//     id: 4,
//     name: 'Sunita Verma',
//     phone: '+91 65432 10987',
//     address: '321 Kalyanpur\nKanpur, UP 208004',
//     email: 'sunita.verma@email.com'
//   },
//   {
//     id: 5,
//     name: 'Vikram Singh',
//     phone: '+91 54321 09876',
//     address: '654 Govind Nagar\nKanpur, UP 208005',
//     email: 'vikram.singh@email.com'
//   }
// ];



// ------------- SCROLL UP TO SEE THE END OF FILE -------------