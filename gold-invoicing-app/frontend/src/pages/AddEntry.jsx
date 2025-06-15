import { useState } from 'react';
import axios from 'axios';

export default function AddEntry() {
    const [form, setForm] = useState({
        entry_type: 'gold',
        gstin: '',
        weight: '',
        purity: '',
        dated: '',
        bank: false
    });

    const handleChange = e => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5003/journal/entry', form);
            alert('Entry added!');
        } catch (err) {
            alert('Error adding entry');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Add Entry</h2>
            {Object.entries(form).map(([key, val]) => (
                <div key={key}>
                    <label>{key}:</label>
                    <input
                        type={typeof val === 'boolean' ? 'checkbox' : 'text'}
                        name={key}
                        checked={typeof val === 'boolean' ? val : undefined}
                        value={typeof val !== 'boolean' ? val : undefined}
                        onChange={handleChange}
                    />
                </div>
            ))}
            <button type="submit">Submit</button>
        </form>
    );
}