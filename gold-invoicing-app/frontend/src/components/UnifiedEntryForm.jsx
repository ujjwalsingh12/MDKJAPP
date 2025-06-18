import React, { useState } from 'react';
import { insertUnifiedEntry } from '../api';

export default function UnifiedEntryForm() {
    const [entryType, setEntryType] = useState('bill');
    const [form, setForm] = useState({
        entry_type_or_data: 'bill',
        gstin: '',
        dated: '',
        bank: false,
        bill_no: '',
        purity: '',
        wt: '',
        rate: '',
        cgst: '',
        sgst: '',
        igst: '',
        weight: '',
        cash_amount: ''
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
        setForm((prev) => ({ ...prev, entry_type_or_data: newType }));
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
                    <select name="entry_type_or_data" value={entryType} onChange={handleEntryTypeChange}>
                        <option value="bill">Bill</option>
                        <option value="cash">Cash</option>
                        <option value="gold">Gold</option>
                        <option value="stock">Stock</option>
                    </select>
                </label>
                <br />
                <input name="gstin" placeholder="GSTIN" onChange={handleChange} />

                {(entryType === 'bill' || entryType === 'gold' || entryType === 'stock') && (
                    <>
                        <input name="purity" placeholder="Purity" onChange={handleChange} />
                        <input name="weight" type="number" placeholder="Weight" onChange={handleChange} />
                    </>
                )}

                {entryType === 'bill' && (
                    <>
                        <input name="bill_no" placeholder="Bill No" onChange={handleChange} />
                        <input name="wt" type="number" placeholder="Bill Weight" onChange={handleChange} />
                        <input name="rate" type="number" placeholder="Rate" onChange={handleChange} />
                        <input name="cgst" type="number" placeholder="CGST" onChange={handleChange} />
                        <input name="sgst" type="number" placeholder="SGST" onChange={handleChange} />
                        <input name="igst" type="number" placeholder="IGST" onChange={handleChange} />
                    </>
                )}

                {entryType === 'cash' && (
                    <input name="cash_amount" type="number" placeholder="Cash Amount" onChange={handleChange} />
                )}

                <label>
                    Bank Entry:
                    <input type="checkbox" name="bank" onChange={handleChange} />
                </label>

                <input type="date" name="dated" onChange={handleChange} />

                <button type="submit">Submit Entry</button>
            </form>
        </div>
    );
}