

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { fetchAll, addRecord, insertUnifiedEntry } from '../api';
import { json } from 'react-router-dom';
import './CreateBill.css';

const CreateBill = () => {
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

  const hallmarking_jax = (hallmarkingPieces, hallmarkingCharges) => {
    return (


      <tr>
        <td className="create-bill__table-cell create-bill__table-cell--center"></td>

        <td className="create-bill__table-cell">
          {hallmarkingPieces > 0 ? "Hallmarking Charges" : ""}
        </td>

        <td className="create-bill__table-cell create-bill__table-cell--center"></td>

        <td className="create-bill__table-cell create-bill__table-cell--center"></td>

        <td className="create-bill__table-cell create-bill__table-cell--center">
          {hallmarkingPieces > 0 ? `${hallmarkingPieces} Pieces` : ""}
        </td>

        <td className="create-bill__table-cell create-bill__table-cell--center">
          {hallmarkingPieces > 0 ? hallmarkingCharges.toFixed(2) : ""}
        </td>

        <td className="create-bill__table-cell create-bill__table-cell--center">
          {hallmarkingPieces > 0 ? (hallmarkingPieces * hallmarkingCharges).toFixed(2) : ""}
        </td>
      </tr>
    )
  }

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
      </head>
      <style>
     
      </style>
      
    
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
    // backgroundColor: '#f8f9fa'
  };


  const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px'
  };


  const buttonStyle = {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  };

  return (
    <div style={containerStyle} >
      {/* --- Customer Details Section --- */}
      <div className="create-bill__header-section print-hide">
        <h2 className="create-bill__header-title">Customer Information</h2>
        <div className="create-bill__form-grid">
          {/* Customer Name with Search */}
          <div className="create-bill__form-group create-bill__form-group--relative">
            <label className="create-bill__label">Customer Name:</label>
            <input
              type="text"
              className="create-bill__input"
              value={customerSearchTerm}
              onChange={(e) => handleCustomerSearch(e.target.value)}
              onFocus={() => setShowCustomerDropdown(customerSearchTerm.length > 0)}
              placeholder="Search or enter customer name"
            />
            {showCustomerDropdown && (
              <div className="create-bill__dropdown">
                {filteredCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    className="create-bill__dropdown-item"
                    onClick={() => handleCustomerSelect(customer)}
                    onMouseEnter={(e) => e.target.classList.add('create-bill__dropdown-item--hover')}
                    onMouseLeave={(e) => e.target.classList.remove('create-bill__dropdown-item--hover')}
                  >
                    <strong>{customer.name}</strong><br />
                    <small>{customer.phone}</small>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Customer Phone */}
          <div className="create-bill__form-group">
            <label className="create-bill__label">Customer Phone:</label>
            <input
              type="text"
              className="create-bill__input"
              value={billHeader.customerPhone}
              onChange={(e) => handleHeaderChange('customerPhone', e.target.value)}
            />
          </div>

          {/* Customer GSTIN */}
          <div className="create-bill__form-group">
            <label className="create-bill__label">Customer GSTIN:</label>
            <input
              type="text"
              className="create-bill__input"
              value={billHeader.customerGstin || ''}
              onChange={(e) => handleHeaderChange('customerGstin', e.target.value)}
            />
          </div>

          {/* Customer Address */}
          <div className="create-bill__form-group">
            <label className="create-bill__label">Customer Address:</label>
            <textarea
              className="create-bill__textarea"
              value={billHeader.customerAddress}
              onChange={(e) => handleHeaderChange('customerAddress', e.target.value)}
            />
          </div>

          {/* Customer Email */}
          <div className="create-bill__form-group">
            <label className="create-bill__label">Customer Email:</label>
            <input
              type="email"
              className="create-bill__input"
              value={billHeader.customerEmail}
              onChange={(e) => handleHeaderChange('customerEmail', e.target.value)}
            />
          </div>

          {/* Bill Date */}
          <div className="create-bill__form-group">
            <label className="create-bill__label">Bill Date:</label>
            <input
              type="date"
              className="create-bill__input"
              value={billHeader.date}
              onChange={(e) => handleHeaderChange('date', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* --- Bill Preview Section --- */}
      <div ref={billRef} className="bill-preview">
        {/* Bill Header */}
        <div className="bill-header">
          <h1 className="bill-title">INVOICE</h1>
          <h2 className="bill-subtitle">{storeInfo.storeName}</h2>
          <div className="bill-store-address">
            {storeInfo.storeAddress.split('|').map((line, i) => (
              <p key={i} className="bill-store-address-line">{line}</p>
            ))}
          </div>
          <p className="bill-store-contact">
            Phone: {storeInfo.phone} | Email: {storeInfo.email}
          </p>
        </div>

        {/* Bill Info */}
        <div className="bill-info">
          <div className="bill-customer">
            <h3 className="bill-section-title">Bill To:</h3>
            <p className="bill-customer-name"><strong>{billHeader.customerName || 'Customer Name'}</strong></p>
            {billHeader.customerPhone && <p className="bill-customer-detail">Phone: {billHeader.customerPhone}</p>}
            {billHeader.customerGstin && <p className="bill-customer-detail">GSTIN: {billHeader.customerGstin}</p>}
            {billHeader.customerAddress && <p className="bill-customer-detail" style={{ whiteSpace: 'pre-line' }}>{billHeader.customerAddress}</p>}
            {billHeader.customerEmail && <p className="bill-customer-detail">Email: {billHeader.customerEmail}</p>}
          </div>
          <div className="bill-metadata">
            <p className="bill-metadata-line"><strong>Bill #:</strong> {billHeader.billNumber}</p>
            <p className="bill-metadata-line"><strong>Date:</strong> {billHeader.date}</p>
          </div>
        </div>

        {/* Items Table */}
        <table className="create-bill__table">
          <thead className="create-bill__table-head">
            <tr className="create-bill__table-row create-bill__table-row--header">
              <th className="create-bill__table-cell create-bill__table-cell--header create-bill__table-cell--center">S.No</th>
              <th className="create-bill__table-cell create-bill__table-cell--header">Description</th>
              <th className="create-bill__table-cell create-bill__table-cell--header create-bill__table-cell--center">HSN/SAC</th>
              <th className="create-bill__table-cell create-bill__table-cell--header create-bill__table-cell--center">Purity</th>
              <th className="create-bill__table-cell create-bill__table-cell--header create-bill__table-cell--center">Weight (in gms)</th>
              <th className="create-bill__table-cell create-bill__table-cell--header create-bill__table-cell--right">Rate (₹)</th>
              <th className="create-bill__table-cell create-bill__table-cell--header create-bill__table-cell--right">Amount (₹)</th>
              <th className="create-bill__table-cell create-bill__table-cell--header create-bill__table-cell--center print-hide">Actions</th>
            </tr>
          </thead>
          <tbody className="create-bill__table-body">
            {items.map((item, rowIndex) => (
              <tr
                key={item.id}
                className={`create-bill__table-row ${selectedRowIndex === rowIndex ? 'create-bill__table-row--highlight' : ''} ${item.isEditing === true ? 'create-bill__is-editing' : ''}`}
                onMouseEnter={() => setSelectedRowIndex(rowIndex)}
                onMouseLeave={() => setSelectedRowIndex(null)}
              >
                <td className="create-bill__table-cell create-bill__table-cell--center create-bill__table-cell--bold ">
                  {rowIndex + 1}
                </td>
                <td className="create-bill__table-cell">
                  {item.isEditing ? (
                    <input
                      type="text"
                      className="create-bill__input"
                      value={item.description}
                      data-row={rowIndex}
                      data-field="description"
                      onChange={(e) => handleItemChange(rowIndex, 'description', e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, rowIndex, 'description')}
                      autoFocus
                    />
                  ) : (
                    <span
                      className="create-bill__editable-text"
                      onClick={() => handleEditClick(rowIndex)}
                    >
                      {item.description || 'Click to edit'}
                    </span>
                  )}
                </td>
                <td className="create-bill__table-cell create-bill__table-cell--center">
                  {item.isEditing ? (
                    <input
                      type="text"
                      className="create-bill__input create-bill__input--small"
                      value={item.hsnSac}
                      data-row={rowIndex}
                      data-field="hsnSac"
                      onChange={(e) => handleItemChange(rowIndex, 'hsnSac', e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, rowIndex, 'hsnSac')}
                    />
                  ) : (
                    <span
                      className="create-bill__editable-text"
                      onClick={() => handleEditClick(rowIndex)}
                    >
                      {item.hsnSac}
                    </span>
                  )}
                </td>
                <td className="create-bill__table-cell create-bill__table-cell--center">
                  {item.isEditing ? (
                    <input
                      type="text"
                      className="create-bill__input create-bill__input--small"
                      value={item.purity}
                      data-row={rowIndex}
                      data-field="purity"
                      onChange={(e) => handleItemChange(rowIndex, 'purity', e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, rowIndex, 'purity')}
                    />
                  ) : (
                    <span
                      className="create-bill__editable-text"
                      onClick={() => handleEditClick(rowIndex)}
                    >
                      {item.purity}
                    </span>
                  )}
                </td>
                <td className="create-bill__table-cell create-bill__table-cell--center">
                  {item.isEditing ? (
                    <input
                      type="number"
                      className="create-bill__input create-bill__input--small"
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
                      className="create-bill__editable-text"
                      onClick={() => handleEditClick(rowIndex)}
                    >
                      {item.weight.toFixed(3)}
                    </span>
                  )}
                </td>
                <td className="create-bill__table-cell create-bill__table-cell--right">
                  {item.isEditing ? (
                    <input
                      type="number"
                      className="create-bill__input create-bill__input--small"
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
                      className="create-bill__editable-text"
                      onClick={() => handleEditClick(rowIndex)}
                    >
                      ₹{item.rate.toFixed(2)}
                    </span>
                  )}
                </td>
                <td className="create-bill__table-cell create-bill__table-cell--right">
                  {item.isEditing ? (
                    <input
                      type="number"
                      className="create-bill__input create-bill__input--small"
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
                      className="create-bill__editable-text create-bill__editable-text--bold"
                      onClick={() => handleEditClick(rowIndex)}
                    >
                      ₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  )}
                </td>
                <td className="create-bill__table-cell create-bill__table-cell--center print-hide">
                  <button
                    className={`create-bill__button ${item.isEditing ? 'create-bill__button--save' : 'create-bill__button--edit'}`}
                    onClick={() => handleEditClick(rowIndex)}
                  >
                    {item.isEditing ? 'Save' : 'Edit'}
                  </button>
                  <button
                    className="create-bill__button create-bill__button--delete"
                    onClick={() => handleDeleteRow(rowIndex)}
                  >
                    Del
                  </button>
                </td>
              </tr>
            ))}
            {hallmarkingPieces > 0 ?
              hallmarking_jax(hallmarkingPieces, hallmarkingCharges) : ""
            }
          </tbody>
        </table>
        <div>

          <div className='controlStyle print-hide'>
            <button
              style={{ ...buttonStyle, backgroundColor: '#28a745', color: 'white', fontSize: '16px', padding: '12px 24px' }}
              onClick={handleAddRow}
              className="create-bill__button create-bill__button--add print-hide"
            >
              Add Item
            </button>
          </div>

          {/* Totals Section */}
          <div style={{ display: 'flex', 'justify-content': 'flex-end', 'align-items': 'flex-start', gap: '20px' }}>
            <div style={{ 'flex-grow': 1 }}>
              <p>

              </p>
            </div>

            <div className="bill-totals-container">
              <table className="bill-totals-table">
                <tbody>
                  <tr>
                    <td className="bill-totals-label bold-cell shaded-cell">
                      Total Taxable
                    </td>
                    <td className="bill-totals-value bold-cell shaded-cell right-align">
                      ₹{parseFloat(calculations.totalTaxable).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr>
                    <td className="bill-totals-label">CGST {cgstRate}%</td>
                    <td className="bill-totals-value right-align">
                      ₹{parseFloat(calculations.cgstAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr>
                    <td className="bill-totals-label">SGST {sgstRate}%</td>
                    <td className="bill-totals-value right-align">
                      ₹{parseFloat(calculations.sgstAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr>
                    <td className="bill-totals-label">IGST {igstRate}%</td>
                    <td className="bill-totals-value right-align">
                      ₹{parseFloat(calculations.igstAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr>
                    <td className="bill-totals-label">
                      Hallmarking Charges
                    </td>
                    <td id='hallmarking_total' className="bill-totals-value right-align">
                      ₹{parseFloat(calculations.hallmarkingTotal).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr>
                    <td className="bill-totals-label indent">CGST {hallmarkingCgst}%</td>
                    <td className="bill-totals-value right-align">
                      ₹{parseFloat(calculations.hallmarkingCgstAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr>
                    <td className="bill-totals-label indent">SGST {hallmarkingSgst}%</td>
                    <td className="bill-totals-value right-align">
                      ₹{parseFloat(calculations.hallmarkingSgstAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr>
                    <td className="bill-totals-label indent">IGST 0.0%</td>
                    <td className="bill-totals-value right-align">₹0.00</td>
                  </tr>
                  <tr>
                    <td className="bill-totals-label">Round off</td>
                    <td className="bill-totals-value right-align">
                      {parseFloat(calculations.roundOff) >= 0 ? '+' : ''}₹{calculations.roundOff}
                    </td>
                  </tr>
                  <tr>
                    <td className="grand-total-label">Grand Total</td>
                    <td className="grand-total-value right-align">
                      ₹{parseFloat(calculations.grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          {/* Amount in Words */}
          <div className='bottom-fixed'>
            <div className='amount-in-words'>
              <strong>Amount in word(s):</strong><br />
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>
                {calculations.grandTotalWords}
              </span>
            </div>

            {/* Thank you message */}
            <div style={{ textAlign: 'center', marginTop: '40px', color: '#666' }}>
              <p style={{ margin: 0, fontSize: '16px' }}>Thank you for choosing MDKJ Jewellers!</p>
              <p style={{ margin: 20, fontSize: '11px' }}>This is a computer generated bill</p>
            </div>
          </div >

          {/* Controls */}

          < div className='print-hide controlStyle' >
            <div style={{ alignItems: 'center', gap: '8px' }} >
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
            <div style={{ display: 'flex', alignSelf: "center", alignItems: 'right', gap: '8px' }}
            >
              <button
                style={{ ...buttonStyle, backgroundColor: '#ffc107', color: 'black', fontSize: '16px', padding: '12px 24px' }}
                onClick={async () => {
                  // Validation checks
                  if (!billHeader.customerName || !billHeader.customerPhone || !billHeader.customerAddress) {
                    alert('Please fill all mandatory customer details.');
                    return;
                  }

                  const customerExists = customers.some(customer => customer.gstin === billHeader.customerGstin);
                  if (!customerExists && billHeader.customerGstin) {
                    const confirmCreate = window.confirm(
                      'The GSTIN provided does not exist in the database. Do you want to create a new customer?'
                    );
                    if (!confirmCreate) return;

                    try {
                      await addRecord('customer_details', {
                        name: billHeader.customerName,
                        phone: billHeader.customerPhone,
                        address: billHeader.customerAddress,
                        email: billHeader.customerEmail,
                        gstin: billHeader.customerGstin
                      });
                      alert('New customer created successfully.');
                    } catch (err) {
                      console.error('Error creating customer:', err);
                      alert('Failed to create new customer.');
                      return;
                    }
                  }

                  // Prepare bill data
                  const billData = items.map(item => ({
                    entry_type: 'bill',
                    gstin: billHeader.customerGstin || null,
                    dated: billHeader.date,
                    bank: false, // Assuming bank is false by default
                    bill_no: billHeader.billNumber || 'N/A',
                    purity: item.purity || 'N/A',
                    wt: item.weight,
                    rate: item.rate,
                    cgst: ((item.amount * cgstRate) / 100).toFixed(2),
                    sgst: ((item.amount * sgstRate) / 100).toFixed(2),
                    igst: ((item.amount * igstRate) / 100).toFixed(2),
                    weight: item.weight,
                    cash_amount: item.amount.toFixed(2),
                    is_debit: true
                  }));

                  try {
                    console.log(billData);
                    await insertUnifiedEntry(billData[0]);
                    alert('Bill submitted successfully.');
                  } catch (err) {
                    console.error('Error submitting bill:', err);
                    alert('Failed to submit bill.');
                  }
                }}
              >
                Submit Bill
              </button>
              <button
                style={{ ...buttonStyle, backgroundColor: '#007bff', color: 'white', fontSize: '16px', padding: '12px 24px' }}
                onClick={handlePrint}
              >
                Print Bill
              </button>
            </div>
          </div >
        </div>
        {/* Usage Instructions */}
        < div className='print-hide' style={{
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
        </div >
      </div >
    </div>

  );
};

export default CreateBill;


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


// <style>
//   body {font - family: Arial, sans-serif; margin: 20px; }
//   .bill-header {text - align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
//   .bill-info {display: flex; justify-content: space-between; margin-bottom: 20px; }
//   .customer-info {text - align: left; }
//   .bill-details {text - align: right; }
//   table {width: 100%; border-collapse: collapse; margin: 20px 0; }
//   th, td {border: 1px solid #ddd; padding: 8px; text-align: left; }
//   th {background - color: #f5f5f5; font-weight: bold; }
//   .text-right {text - align: right; }
//   .text-center {text - align: center; }
//   .totals {margin - top: 20px; }
//   .total-row {font - weight: bold; background-color: #f0f0f0; }
//   .print-hide {display: none; }
//   .grand-total {font - size: 18px; font-weight: bold; }
// </style>