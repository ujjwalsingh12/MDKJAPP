import React, { useState } from 'react';
import { insertUnifiedEntry } from '../api';

export default function UnifiedEntryForm() {
    const [entryType, setEntryType] = useState('bill');
    const [form, setForm] = useState({
        entry_type: 'bill',
        gstin: 'GSTIN001',
        dated: '2025-06-15',
        bank: false,
        bill_no: 'BILL123',
        purity: '91.6',
        wt: '100',
        rate: '5800',
        cgst: '2.5',
        sgst: '2.5',
        igst: '0',
        weight: '100',
        cash_amount: '580000'
    });

    const handleChange = (e) => {
        const { name, type, value, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleEntryTypeChange = (e) => {
        const newType = e.target.value;
        setEntryType(newType);
        setForm((prev) => ({ ...prev, entry_type: newType }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await insertUnifiedEntry(form);
            alert('Entry inserted successfully');
            console.log(response.data);
        } catch (error) {
            console.error(error);
            alert('Failed to insert entry');
        }
    };

    return (
        <div>
            <h2>Add Entry</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Entry Type:
                    <select name="entry_type" value={form.entry_type} onChange={handleEntryTypeChange}>
                        <option value="bill">Bill</option>
                        <option value="cash">Cash</option>
                        <option value="gold">Gold</option>
                        <option value="stock">Stock</option>
                    </select>
                </label>
                <br />

                <input
                    name="gstin"
                    placeholder="GSTIN"
                    value={form.gstin}
                    onChange={handleChange}
                />

                {(form.entry_type === 'bill' || form.entry_type === 'gold' || form.entry_type === 'stock') && (
                    <>
                        <input
                            name="purity"
                            placeholder="Purity"
                            value={form.purity}
                            onChange={handleChange}
                        />
                        <input
                            name="weight"
                            type="number"
                            placeholder="Weight"
                            value={form.weight}
                            onChange={handleChange}
                        />
                    </>
                )}

                {form.entry_type === 'bill' && (
                    <>
                        <input
                            name="bill_no"
                            placeholder="Bill No"
                            value={form.bill_no}
                            onChange={handleChange}
                        />
                        <input
                            name="wt"
                            type="number"
                            placeholder="Bill Weight"
                            value={form.wt}
                            onChange={handleChange}
                        />
                        <input
                            name="rate"
                            type="number"
                            placeholder="Rate"
                            value={form.rate}
                            onChange={handleChange}
                        />
                        <input
                            name="cgst"
                            type="number"
                            placeholder="CGST"
                            value={form.cgst}
                            onChange={handleChange}
                        />
                        <input
                            name="sgst"
                            type="number"
                            placeholder="SGST"
                            value={form.sgst}
                            onChange={handleChange}
                        />
                        <input
                            name="igst"
                            type="number"
                            placeholder="IGST"
                            value={form.igst}
                            onChange={handleChange}
                        />
                    </>
                )}

                {form.entry_type === 'cash' && (
                    <input
                        name="cash_amount"
                        type="number"
                        placeholder="Cash Amount"
                        value={form.cash_amount}
                        onChange={handleChange}
                    />
                )}

                <label>
                    Bank Entry:
                    <input
                        type="checkbox"
                        name="bank"
                        checked={form.bank}
                        onChange={handleChange}
                    />
                </label>

                <input
                    type="date"
                    name="dated"
                    value={form.dated}
                    onChange={handleChange}
                />

                <button type="submit">Submit Entry</button>
            </form>
        </div>
    );
}