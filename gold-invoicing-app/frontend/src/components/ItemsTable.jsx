import React, { useEffect } from 'react';

const fields = ['description', 'hsnSac', 'purity', 'weight', 'rate', 'amount'];

const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '20px',
    border: '1px solid #ddd'
};

const thStyle = {
    border: '1px solid #ddd',
    padding: '8px',
    backgroundColor: '#f5f5f5',
    textAlign: 'left',
    fontWeight: 'bold'
};

const tdStyle = {
    border: '1px solid #ddd',
    padding: '8px',
    verticalAlign: 'middle'
};

const inputStyle = {
    width: '100%',
    padding: '6px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '14px'
};

const editButtonStyle = {
    padding: '4px 8px',
    marginRight: '5px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
};

const saveButtonStyle = {
    ...editButtonStyle,
    backgroundColor: '#28a745'
};

const deleteButtonStyle = {
    padding: '4px 8px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
};

const ItemsTable = ({ items, setItems, selectedRowIndex, setSelectedRowIndex }) => {
    useEffect(() => {
        const total = items.reduce((sum, item) => sum + Number(item.amount || 0), 0);
        // Optionally notify parent component
        // onTotalChange && onTotalChange(total);
        console.log('Total:', total);
    }, [items]);

    const handleItemChange = (rowIndex, field, value) => {
        const newItems = [...items];
        if (field === 'weight' || field === 'rate') {
            const numValue = parseFloat(value) || 0;
            newItems[rowIndex][field] = numValue;
            newItems[rowIndex].amount = newItems[rowIndex].weight * newItems[rowIndex].rate;
        } else if (field === 'amount') {
            newItems[rowIndex][field] = parseFloat(value) || 0;
        } else {
            newItems[rowIndex][field] = value;
        }
        setItems(newItems);
    };

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

    const handleDeleteRow = (rowIndex) => {
        if (items.length > 1) {
            const newItems = items.filter((_, index) => index !== rowIndex);
            setItems(newItems);
        }
    };

    const handleEditClick = (rowIndex) => {
        const newItems = [...items];
        newItems[rowIndex].isEditing = !newItems[rowIndex].isEditing;
        setItems(newItems);
    };

    const handleKeyDown = (event, rowIndex, field) => {
        if (event.key === 'Enter') {
            handleEditClick(rowIndex);
        } else if (event.key === 'Tab') {
            event.preventDefault();
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

    return (
        <div>
            <table style={tableStyle}>
                <thead>
                    <tr>
                        <th style={{ ...thStyle, width: '30px', textAlign: 'center' }}>S.No</th>
                        <th style={{ ...thStyle, width: '200px' }}>Description</th>
                        <th style={{ ...thStyle, width: '80px', textAlign: 'center' }}>HSN/SAC</th>
                        <th style={{ ...thStyle, width: '80px', textAlign: 'center' }}>Purity</th>
                        <th style={{ ...thStyle, width: '100px', textAlign: 'center' }}>Weight (gms)</th>
                        <th style={{ ...thStyle, width: '100px', textAlign: 'right' }}>Rate (₹)</th>
                        <th style={{ ...thStyle, width: '120px', textAlign: 'right' }}>Amount (₹)</th>
                        <th style={{ ...thStyle, width: '150px', textAlign: 'center' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, rowIndex) => (
                        <tr
                            key={item.id || rowIndex}
                            style={{
                                backgroundColor: selectedRowIndex === rowIndex ? '#e3f2fd' : 'transparent',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={() => setSelectedRowIndex && setSelectedRowIndex(rowIndex)}
                            onMouseLeave={() => setSelectedRowIndex && setSelectedRowIndex(null)}
                        >
                            <td style={{ ...tdStyle, textAlign: 'center' }}>{rowIndex + 1}</td>
                            {fields.map((field) => (
                                <td key={field} style={{ ...tdStyle, textAlign: field === 'rate' || field === 'amount' ? 'right' : 'left' }}>
                                    {item.isEditing ? (
                                        <input
                                            style={inputStyle}
                                            type={field === 'weight' || field === 'rate' || field === 'amount' ? 'number' : 'text'}
                                            value={item[field]}
                                            onChange={(e) => handleItemChange(rowIndex, field, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(e, rowIndex, field)}
                                            data-row={rowIndex}
                                            data-field={field}
                                        />
                                    ) : (
                                        item[field]
                                    )}
                                </td>
                            ))}
                            <td style={{ ...tdStyle, textAlign: 'center' }}>
                                {item.isEditing ? (
                                    <button style={saveButtonStyle} onClick={() => handleEditClick(rowIndex)}>
                                        Save
                                    </button>
                                ) : (
                                    <button style={editButtonStyle} onClick={() => handleEditClick(rowIndex)}>
                                        Edit
                                    </button>
                                )}
                                <button style={deleteButtonStyle} onClick={() => handleDeleteRow(rowIndex)}>
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div style={{ textAlign: 'right' }}>
                <button onClick={handleAddRow} style={{ marginBottom: '10px', ...editButtonStyle }}>
                    + Add Item
                </button>
            </div>
        </div>
    );
};

export default ItemsTable;