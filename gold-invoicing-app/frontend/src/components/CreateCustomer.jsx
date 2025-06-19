import React, { useState } from 'react';
// import { createCustomer } from '../api/index'; // Uncomment and implement this API call
import '../pages/EntryDashboard.css';
const initialState = {
    gstin: '',
    name: '',
    address: '',
    phone: '',
    email: '',
};

const NewCustomerForm = ({ onSuccess }) => {
    const [form, setForm] = useState(initialState);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const validate = () => {
        if (!form.gstin || form.gstin.length < 5) return "GSTIN is required";
        if (!form.name) return "Name is required";
        // Optionally add more validation here
        return '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const err = validate();
        if (err) {
            setError(err);
            return;
        }
        setLoading(true);
        try {
            // await createCustomer(form); // Implement this API call
            setLoading(false);
            alert('Customer created successfully!');
            setForm(initialState);
            if (onSuccess) onSuccess();
        } catch (err) {
            setLoading(false);
            setError(err?.response?.data?.error || 'Failed to create customer');
        }
    };

    return (
        <div className="entry-dashboard__container">
            <h2 className="entry-dashboard__title">Add New Customer</h2>
            <form className="entry-dashboard__form" onSubmit={handleSubmit}>
                <div className="entry-dashboard__field">
                    <label>GSTIN *</label>
                    <input
                        className="entry-dashboard__input"
                        value={form.gstin}
                        onChange={e => handleChange('gstin', e.target.value.toUpperCase())}
                        maxLength={15}
                        required
                        placeholder="Enter GSTIN"
                    />
                </div>
                <div className="entry-dashboard__field">
                    <label>Name *</label>
                    <input
                        className="entry-dashboard__input"
                        value={form.name}
                        onChange={e => handleChange('name', e.target.value)}
                        required
                        placeholder="Customer Name"
                    />
                </div>
                <div className="entry-dashboard__field">
                    <label>Address</label>
                    <textarea
                        className="entry-dashboard__textarea"
                        value={form.address}
                        onChange={e => handleChange('address', e.target.value)}
                        placeholder="Address"
                    />
                </div>
                <div className="entry-dashboard__field">
                    <label>Phone</label>
                    <input
                        className="entry-dashboard__input"
                        value={form.phone}
                        onChange={e => handleChange('phone', e.target.value)}
                        maxLength={15}
                        placeholder="Phone Number"
                    />
                </div>
                <div className="entry-dashboard__field">
                    <label>Email</label>
                    <input
                        className="entry-dashboard__input"
                        type="email"
                        value={form.email}
                        onChange={e => handleChange('email', e.target.value)}
                        placeholder="Email"
                    />
                </div>
                {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
                <button
                    type="submit"
                    className="entry-dashboard__submit-button"
                    disabled={loading}
                >
                    {loading ? 'Saving...' : 'Create Customer'}
                </button>
            </form>
        </div>
    );
};

export default NewCustomerForm;