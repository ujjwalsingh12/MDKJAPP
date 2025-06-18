import React, { useEffect, useMemo, useState } from 'react';
import { insertUnifiedEntry } from '../api/index';
import { fetchAll } from '../api/index'; // assumes you have fetchAll API to get customers
import ViewTables from '../components/ViewTables'; // assumes you have a ViewTables component to display recent entries
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // Import Bootstrap JS for dropdowns and other components
import './EntryDashboard.css'; // Custom styles for EntryDashboard

const EntryDashboard = () => {
    const [entryType, setEntryType] = useState('');
    const [form, setForm] = useState({
        dated: new Date().toISOString().slice(0, 10),
        bank: false,
        remark_text: null,
        bill_no: null,
        purity: null,
        wt: null,
        rate: null,
        cgst: null,
        sgst: null,
        igst: null,
        cash_amount: null,
        weight: null,
        is_debit: false,
    });

    const [customers, setCustomers] = useState([]);
    const [customerSearchTerm, setCustomerSearchTerm] = useState('');
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    useEffect(() => {
        const loadCustomers = async () => {
            try {
                const res = await fetchAll('customer_details', { page: 1, page_size: 100 });
                setCustomers(res.data);
            } catch (err) {
                console.error('Failed to load customers:', err);
            }
        };
        loadCustomers();
    }, []);

    const filteredCustomers = useMemo(() => {
        if (!customerSearchTerm) return customers;
        return customers.filter(c =>
            c.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
            c.phone?.includes(customerSearchTerm)
        );
    }, [customerSearchTerm, customers]);

    const handleCustomerSelect = (customer) => {
        setSelectedCustomer(customer);
        setCustomerSearchTerm(customer.name);
        setShowCustomerDropdown(false);
        sessionStorage.setItem('lastSelectedCustomer', JSON.stringify(customer));
    };

    useEffect(() => {
        const lastCustomer = sessionStorage.getItem('lastSelectedCustomer');
        if (lastCustomer) {
            const parsedCustomer = JSON.parse(lastCustomer);
            setSelectedCustomer(parsedCustomer);
            setCustomerSearchTerm(parsedCustomer.name);
        }
    }, []);

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedCustomer?.gstin) {
            alert('Please select a valid customer with GSTIN.');
            return;
        }

        const payload = {
            ...form,
            entry_type: entryType,
            gstin: selectedCustomer.gstin,
        };

        const confirmationMessage = `
    Please confirm the following details before submission:

    - Date: ${form.dated} (${new Date(form.dated).toLocaleDateString('en-US', { weekday: 'long' })})
    - ${selectedCustomer?.name || 'N/A'}
    - ${entryType || 'N/A'} Entry
    - ${form.bank ? 'BANK' : 'CASH'} Transaction
    ${entryType === 'bill' ? `
    Bill Details:
    - Bill No: ${form.bill_no || 'N/A'}
    - Purity: ${form.purity || 'N/A'}
    - Weight: ${form.wt || 'N/A'}
    - Rate: ${form.rate || 'N/A'}
    `.trim() : ''}
    ${entryType === 'cash' ? `
    Cash Details:
    - Cash Amount: ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(form.cash_amount || 0)}
    `.trim() : ''}
    ${(entryType === 'stock' || entryType === 'gold') ? `
    Stock/Gold Details:
    - Purity: ${form.purity || 'N/A'}
    - Weight: ${form.weight || 'N/A'}
    `.trim() : ''}
    ${entryType === 'remarks' || form.remark_text ? `
    Remarks:
    - ${form.remark_text || 'N/A'}
    `.trim() : ''}
    `.trim();
        if (!window.confirm(confirmationMessage)) {
            return;
        }

        try {
            console.log('Submitting entry with payload:', { payload });
            await insertUnifiedEntry(payload);
            alert('Entry added successfully!');
            setForm({
                dated: new Date().toISOString().slice(0, 10),
                bank: false,
                remark_text: null,
                bill_no: null,
                purity: null,
                wt: null,
                rate: null,
                cgst: null,
                sgst: null,
                igst: null,
                cash_amount: null,
                weight: null,
                is_debit: false
            });
        } catch (error) {
            console.error(error);
            alert(error?.response?.data?.error || 'Failed to insert entry.');
        }
    };

    const renderFields = () => {
        switch (entryType) {
            case 'bill':
                return (
                    <>
                        <input className="entry-dashboard__input" placeholder="Bill No" value={form.bill_no} onChange={(e) => handleChange('bill_no', e.target.value)} />
                        <div></div >
                        Weight Details: <span></span>
                        <input className="entry-dashboard__input" placeholder="Purity" value={form.purity} onChange={(e) => handleChange('purity', e.target.value)} />
                        <input
                            className="entry-dashboard__input"
                            placeholder="Weight (wt)"
                            type="number"
                            value={parseFloat(form.wt).toFixed(3) || ''}
                            onChange={(e) => handleChange('wt', parseFloat(e.target.value) || 0)}
                        />
                        <input className="entry-dashboard__input" placeholder="Rate" type="number" value={form.rate} onChange={(e) => handleChange('rate', e.target.value)} />
                        <div></div>
                        Taxes: <span></span>
                        <input className="entry-dashboard__input" placeholder="CGST" type="number" value={form.cgst} onChange={(e) => handleChange('cgst', e.target.value)} />
                        <input className="entry-dashboard__input" placeholder="SGST" type="number" value={form.sgst} onChange={(e) => handleChange('sgst', e.target.value)} />
                        <input className="entry-dashboard__input" placeholder="IGST" type="number" value={form.igst} onChange={(e) => handleChange('igst', e.target.value)} />
                        <button
                            type="button"
                            className={`entry-dashboard__button ${form.is_debit ? 'entry-dashboard__button--debit' : 'entry-dashboard__button--credit'}`}
                            onClick={() => handleChange('is_debit', !form.is_debit)}
                        >
                            {form.is_debit ? 'Debit' : 'Credit'}
                        </button>
                        <div className="entry-dashboard__summary">
                            <strong>Formatted Amount: </strong>
                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(form.amount || 0)}
                            <span>
                                {form.is_debit ? ' Debited' : ' Credited'}
                            </span>
                        </div>
                    </>
                );
            case 'cash':
                return (
                    <>

                        <div className="entry-dashboard__button-group div">
                            <input
                                className="entry-dashboard__input"
                                placeholder="Cash Amount"
                                type="number"
                                value={form.cash_amount}
                                onChange={(e) => handleChange('cash_amount', parseFloat(e.target.value) || 0)}
                                style={{ color: form.cash_amount < 0 ? 'red' : 'green' }}
                            />
                            <button
                                type="button"
                                className="entry-dashboard__button"
                                onClick={() => handleChange('cash_amount', (form.cash_amount || 0) * 100000)}
                            >
                                Convert to Lakhs
                            </button>
                            <button
                                type="button"
                                className={`entry-dashboard__button ${form.is_debit ? 'entry-dashboard__button--debit' : 'entry-dashboard__button--credit'}`}
                                onClick={() => {
                                    handleChange('is_debit', !form.is_debit);
                                }}
                            >
                                {form.is_debit ? 'Debit' : 'Credit'}
                            </button >
                        </div>
                        <div className="entry-dashboard__summary">
                            <strong>Formatted Amount: </strong>
                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(form.cash_amount || 0)}
                            <span>
                                {form.is_debit ? ' Debited' : ' Credited'}
                            </span>
                        </div>
                    </>
                );
            case 'stock':
            case 'gold':
                return (
                    <>
                        <div className="entry-dashboard__field">
                            <div>
                                <div className="entry-dashboard__button-group div">
                                    <label >Purity</label>
                                    <input
                                        className="entry-dashboard__input"
                                        placeholder="Enter purity"
                                        value={form.purity}
                                        onChange={(e) => handleChange('purity', e.target.value)}
                                    />
                                    {['18CT', '22CT', '99.5', '99.99'].map((option) => (
                                        <button
                                            key={option}
                                            type="button"
                                            className={`entry-dashboard__button ${form.purity === option ? 'entry-dashboard__button--active' : ''}`}
                                            onClick={() => handleChange('purity', option)}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <input
                            className="entry-dashboard__input"
                            placeholder="Weight"
                            type="number"
                            value={form.weight || ''}
                            onChange={(e) => handleChange('weight', parseFloat(e.target.value) || 0)}
                        />
                        <button
                            type="button"
                            className={`entry-dashboard__button ${form.is_debit ? 'entry-dashboard__button--debit' : 'entry-dashboard__button--credit'}`}
                            onClick={() => handleChange('is_debit', !form.is_debit)}
                        >
                            {form.is_debit ? 'Debit' : 'Credit'}
                        </button>
                        <div className="entry-dashboard__summary">
                            <h4>
                                <strong>Final Weight: </strong>
                                {new Intl.NumberFormat('en-IN', { style: 'decimal', minimumFractionDigits: 3 }).format(form.weight || 0)}
                                <span>
                                    {form.is_debit ? ' Debited' : ' Credited'}
                                </span>
                            </h4>
                        </div>
                    </>
                );
            case 'remarks':
                return (
                    <textarea className="entry-dashboard__textarea" placeholder="Remark Text" value={form.remark_text} onChange={(e) => handleChange('remark_text', e.target.value)} />
                );
            default:
                return null;
        }
    };

    const [showTable, setShowTable] = useState(false);

    return (
        <div className="entry-dashboard__container">
            <h2 className="entry-dashboard__title">{(entryType.toUpperCase() || "Unified")} Dashboard</h2>

            <form onSubmit={handleSubmit} className="entry-dashboard__form">
                <div className="entry-dashboard__field">
                    <div className="entry-dashboard__button-group-nav">
                        {['bill', 'cash', 'stock', 'gold', 'remarks'].map((type) => (
                            <button
                                key={type}
                                type="button"
                                className={`entry-dashboard__button ${entryType === type ? 'entry-dashboard__button--active' : ''}`}
                                onClick={() => setEntryType(type)}
                            >
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="entry-dashboard__field">
                    <button
                        type="button"
                        className={`entry-dashboard__button ${form.bank ? 'entry-dashboard__button--bank' : 'entry-dashboard__button--cash'}`}
                        onClick={() => handleChange('bank', !form.bank)}
                    >
                        {form.bank ? 'Bank Transaction' : 'Cash Transaction'}
                    </button>
                </div>
                <div className="entry-dashboard__field">
                    <label>Customer Name</label>
                    <input
                        className="entry-dashboard__input"
                        value={customerSearchTerm}
                        placeholder="Search or enter customer name"
                        onChange={(e) => {
                            setCustomerSearchTerm(e.target.value);
                            setShowCustomerDropdown(true);
                        }}
                        onFocus={() => setShowCustomerDropdown(true)}
                    />
                    {showCustomerDropdown && (
                        <ul className="entry-dashboard__dropdown">
                            {filteredCustomers.map((c, i) => (
                                <li
                                    key={i}
                                    className="entry-dashboard__dropdown-item"
                                    onClick={() => handleCustomerSelect(c)}
                                >
                                    {c.name} ({c.phone})
                                </li>
                            ))}
                        </ul>
                    )}
                    {selectedCustomer && (
                        <>
                            <input className="entry-dashboard__input" disabled value={selectedCustomer.gstin} placeholder="GSTIN" />
                            <input className="entry-dashboard__input" disabled value={selectedCustomer.address} placeholder="Address" />
                        </>
                    )}
                </div>

                <div className="entry-dashboard__button-group">
                    <input type="date" className="entry-dashboard__input" value={form.dated} onChange={(e) => handleChange('dated', e.target.value)} />
                    <button
                        type="button"
                        className={`entry-dashboard__button ${form.dated === new Date().toISOString().slice(0, 10) ? 'entry-dashboard__button--active' : ''}`}
                        onClick={() => handleChange('dated', new Date().toISOString().slice(0, 10))}
                    >
                        Today
                    </button>
                    <button
                        type="button"
                        className={`entry-dashboard__button ${form.dated === new Date(Date.now() - 86400000).toISOString().slice(0, 10) ? 'entry-dashboard__button--active' : ''}`}
                        onClick={() => handleChange('dated', new Date(Date.now() - 86400000).toISOString().slice(0, 10))}
                    >
                        Yesterday
                    </button>
                    <button
                        type="button"
                        className={`entry-dashboard__button ${form.dated === new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10) ? 'entry-dashboard__button--active' : ''}`}
                        onClick={() => handleChange('dated', new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10))}
                    >
                        Day Before Yesterday
                    </button>
                </div>


                {renderFields()}

                <div className="entry-dashboard__summary">
                    <h5>Entry Summary</h5>
                    <p><strong>Date:</strong> {form.dated} ({new Date(form.dated).toLocaleDateString('en-US', { weekday: 'long' })})</p>
                    <p><strong>Customer Name:</strong> {selectedCustomer?.name || 'N/A'}</p>
                    <p><strong>Entry Type:</strong> {entryType || 'N/A'}</p>
                    {entryType === 'bill' && (
                        <>
                            <p><strong>Bill No:</strong> {form.bill_no || 'N/A'}</p>
                            <p><strong>Purity:</strong> {form.purity || 'N/A'}</p>
                            <p><strong>Weight:</strong> {form.wt || 'N/A'}</p>
                            <p><strong>Rate:</strong> {form.rate || 'N/A'}</p>
                        </>
                    )}
                    {entryType === 'cash' && (
                        <p><strong>Cash Amount:</strong> {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(form.cash_amount || 0)}</p>
                    )}
                    {entryType === 'stock' || entryType === 'gold' ? (
                        <>
                            <p><strong>Purity:</strong> {form.purity || 'N/A'}</p>
                            <p><strong>Weight:</strong> {form.weight || 'N/A'}</p>
                        </>
                    ) : null}
                    {entryType === 'remarks' && (
                        <p><strong>Remark:</strong> {form.remark_text || 'N/A'}</p>
                    )}
                    <p><strong>Bank Transaction:</strong> {form.bank ? 'Yes' : 'No'}</p>
                </div>

                <button type="submit" className="entry-dashboard__submit-button">Submit Entry</button>

                {entryType !== 'remarks' && (
                    <textarea className="entry-dashboard__textarea" placeholder="Remark (Optional)" value={form.remark_text} onChange={(e) => handleChange('remark_text', e.target.value)} />
                )}
            </form>

            <button
                type="button"
                className="entry-dashboard__toggle-button"
                onClick={() => setShowTable(!showTable)}
            >
                {showTable ? 'Hide Recent Entries' : 'Show Recent Entries'}
            </button>

            {showTable && (
                <>
                    <h3 className="entry-dashboard__recent-title">Recent Journal Entries</h3>
                    <ViewTables
                        tableName={entryType || 'journal'}
                        initialParams={{
                            page_size: 5,
                            sort_by: 'id',
                            sort_order: "desc"
                        }}
                    />
                </>
            )}
        </div>
    );
};

export default EntryDashboard;