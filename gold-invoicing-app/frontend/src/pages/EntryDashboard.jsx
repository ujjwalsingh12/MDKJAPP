import React, { useEffect, useMemo, useState } from 'react';
import { insertUnifiedEntry } from '../api';
import { fetchAll } from '../api/index'; // assumes you have fetchAll API to get customers
import 'bootstrap/dist/css/bootstrap.min.css';

const EntryDashboard = () => {
    const [entryType, setEntryType] = useState('');
    const [form, setForm] = useState({
        dated: new Date().toISOString().slice(0, 10),
        bank: false,
        remark_text: '',
        bill_no: '',
        purity: '',
        wt: '',
        rate: '',
        cgst: '',
        sgst: '',
        igst: '',
        cash_amount: '',
        weight: '',
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
    };

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

        try {
            await insertUnifiedEntry(payload);
            alert('Entry added successfully!');
            setForm({ ...form, bill_no: '', wt: '', rate: '', cash_amount: '', purity: '', weight: '', remark_text: '' });
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
                        <input className="form-control mb-2" placeholder="Bill No" value={form.bill_no} onChange={(e) => handleChange('bill_no', e.target.value)} />
                        <input className="form-control mb-2" placeholder="Purity" value={form.purity} onChange={(e) => handleChange('purity', e.target.value)} />
                        <input
                            className="form-control mb-2"
                            placeholder="Weight (wt)"
                            type="number"
                            value={parseFloat(form.wt).toFixed(3) || ''}
                            onChange={(e) => handleChange('wt', parseFloat(e.target.value) || 0)}
                        />
                        <input className="form-control mb-2" placeholder="Rate" type="number" value={form.rate} onChange={(e) => handleChange('rate', e.target.value)} />
                        <input className="form-control mb-2" placeholder="CGST" type="number" value={form.cgst} onChange={(e) => handleChange('cgst', e.target.value)} />
                        <input className="form-control mb-2" placeholder="SGST" type="number" value={form.sgst} onChange={(e) => handleChange('sgst', e.target.value)} />
                        <input className="form-control mb-2" placeholder="IGST" type="number" value={form.igst} onChange={(e) => handleChange('igst', e.target.value)} />
                    </>
                );
            case 'cash':
                return (
                    <>
                        <input
                            className="form-control mb-2"
                            placeholder="Cash Amount"
                            type="number"
                            value={form.cash_amount}
                            onChange={(e) => handleChange('cash_amount', parseFloat(e.target.value) || 0)}
                            style={{ color: form.cash_amount < 0 ? 'red' : 'green' }}
                        />
                        <div className="mb-2">
                            <strong>Formatted Amount: </strong>
                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(form.cash_amount || 0)}
                        </div>
                        <button
                            type="button"
                            className={`btn mb-2 ${form.cash_amount < 0 ? 'btn-danger' : 'btn-success'}`}
                            onClick={() => handleChange('cash_amount', form.cash_amount > 0 ? -Math.abs(form.cash_amount) : Math.abs(form.cash_amount))}
                        >
                            {form.cash_amount < 0 ? 'Set to Credit' : 'Set to Debit'}
                        </button>
                    </>
                );
            case 'stock':
            case 'gold':
                return (
                    <>
                        <div className="mb-2">
                            <label>Purity</label>
                            <div>
                                <input
                                    className="form-control"
                                    placeholder="Enter purity"
                                    value={form.purity}
                                    onChange={(e) => handleChange('purity', e.target.value)}
                                />
                                <div className="btn-group">
                                    {['18CT', '22CT', '99.5', '99.99'].map((option) => (
                                        <button
                                            key={option}
                                            type="button"
                                            className={`btn ${form.purity === option ? 'btn-primary' : 'btn-outline-primary'}`}
                                            onClick={() => handleChange('purity', option)}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <input
                            className="form-control mb-2"
                            placeholder="Weight"
                            type="number"
                            value={form.weight || ''}
                            onChange={(e) => handleChange('weight', parseFloat(e.target.value) || 0)}
                        />
                        <button
                            type="button"
                            className={`btn mb-2 ${form.weight < 0 ? 'btn-danger' : 'btn-success'}`}
                            onClick={() => handleChange('weight', form.weight > 0 ? -Math.abs(form.weight) : Math.abs(form.weight))}
                        >
                            {form.weight < 0 ? 'Set to Credit' : 'Set to Debit'}
                        </button>
                        <div className="mb-2">
                            <h4>
                                <strong>Final Weight: </strong>
                                {new Intl.NumberFormat('en-IN', { style: 'decimal', minimumFractionDigits: 3 }).format(form.weight || 0)}
                            </h4>
                        </div>
                    </>
                );
            case 'remarks':
                return (
                    <textarea className="form-control mb-2" placeholder="Remark Text" value={form.remark_text} onChange={(e) => handleChange('remark_text', e.target.value)} />
                );
            default:
                return null;
        }
    };

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Unified Entry Dashboard</h2>

            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label>Entry Type</label>
                    <div className="btn-group w-100">
                        {['bill', 'cash', 'stock', 'gold', 'remarks'].map((type) => (
                            <button
                                key={type}
                                type="button"
                                className={`btn ${entryType === type ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => setEntryType(type)}
                            >
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mb-3 position-relative">
                    <label>Customer Name</label>
                    <input
                        className="form-control"
                        value={customerSearchTerm}
                        placeholder="Search or enter customer name"
                        onChange={(e) => {
                            setCustomerSearchTerm(e.target.value);
                            setShowCustomerDropdown(true);
                        }}
                        onFocus={() => setShowCustomerDropdown(true)}
                    />
                    {showCustomerDropdown && (
                        <ul className="list-group position-absolute w-100" style={{ zIndex: 1000 }}>
                            {filteredCustomers.map((c, i) => (
                                <li
                                    key={i}
                                    className="list-group-item list-group-item-action"
                                    onClick={() => handleCustomerSelect(c)}
                                >
                                    {c.name} ({c.phone})
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {selectedCustomer && (
                    <>
                        <input className="form-control mb-2" disabled value={selectedCustomer.phone} placeholder="Phone" />
                        <input className="form-control mb-2" disabled value={selectedCustomer.address} placeholder="Address" />
                    </>
                )}

                <input type="date" className="form-control mb-2" value={form.dated} onChange={(e) => handleChange('dated', e.target.value)} />

                <div className="form-check mb-2">
                    <label className="form-check-label">Bank Transaction</label>
                    <input className="form-check-input" type="checkbox" checked={form.bank} onChange={(e) => handleChange('bank', e.target.checked)} />
                </div>


                {renderFields()}
                <button type="submit" className="btn btn-primary mt-3">Submit Entry</button>
                <p></p>
                {entryType !== 'remarks' && (
                    <textarea className="form-control mb-2" placeholder="Remark (Optional)" value={form.remark_text} onChange={(e) => handleChange('remark_text', e.target.value)} />
                )}

            </form>
        </div>
    );
};

export default EntryDashboard;