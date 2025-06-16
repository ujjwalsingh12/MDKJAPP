import React, { useState, useEffect } from 'react';
import { fetchData, addData, updateData } from '../apiService';
import 'bootstrap/dist/css/bootstrap.min.css';
import './ExcelInterface.css';

// JSON object to describe the structure of the table
// const tableLayout = [
//   { key: 'product', label: 'Product', type: 'text', editable: true },
//   { key: 'quantity', label: 'Quantity', type: 'number', editable: true },
//   { key: 'price', label: 'Price', type: 'number', editable: true },
//   { key: 'total', label: 'Total', type: 'number', editable: false },
// ];
// const layout = {
//   ID: Date.now(),
//   product: '',
//   quantity: '',
//   price: '',
//   total: ''
// };

// JSON object to describe the structure of the table
const tableLayout = [
  { key: 'PRODUCT', label: 'PRODUCT', type: 'text', editable: true },
  { key: 'QUANTITY', label: 'QUANTITY', type: 'number', editable: true },
  { key: 'PRICE', label: 'PRICE', type: 'number', editable: true },
  { key: 'TOTAL', label: 'TOTAL', type: 'number', editable: false },
];
const layout = {
  ID: Date.now(),
  PRODUCT: '',
  QUANTITY: '',
  PRICE: '',
  TOTAL: ''
};


// AddEntryForm Component
const AddEntryForm = ({ newEntry, setNewEntry, handleAddEntry }) => (
  <div className="mb-2">
    {tableLayout
      .filter((column) => column.editable) // Only render editable fields in the form
      .map((column) => (
        <input
          key={column.key}
          type={column.type === 'number' ? 'number' : 'text'}
          className="form-control mb-2"
          placeholder={column.label}
          value={newEntry[column.key] || ''}
          onChange={(e) => setNewEntry({ ...newEntry, [column.key]: e.target.value })}
        />
      ))}
    <button className="btn btn-success" onClick={handleAddEntry}>
      Add Entry
    </button>
  </div>
);

// DataRow Component
const DataRow = ({
  row,
  rowIndex,
  handleCellChange,
  handleEditClick,
  handleCancelClick,
  selectedRowIndex,
  handleRowHover,
}) => (
  <tr
    key={row.ID}
    className={selectedRowIndex === rowIndex ? 'table-active' : ''}
    onMouseEnter={() => handleRowHover(rowIndex)}
  >
    <td>{row.ID}</td>
    {tableLayout.map((column) => (
      <td key={column.key}>
        {row.isEditing && column.editable ? (
          <input
            type={column.type === 'number' ? 'number' : 'text'}
            className="form-control"
            value={row[column.key]}
            onChange={(e) => handleCellChange(rowIndex, column.key, e.target.value)}
          />
        ) : (
          row[column.key]
        )}
      </td>
    ))}
    <td>
      <button
        className={`btn ${row.isEditing ? 'btn-success' : 'btn-primary'}`}
        onClick={() => handleEditClick(rowIndex, !(row.isEditing))}
      >
        {row.isEditing ? 'Save' : 'Edit'}
      </button>
    </td>
    <td>
      {row.isEditing && (
        <button className="btn btn-danger" onClick={() => handleCancelClick(rowIndex)}>
          Cancel
        </button>
      )}
    </td>
  </tr>
);

// Table Component
const DataTable = ({
  data,
  handleCellChange,
  handleEditClick,
  handleCancelClick,
  selectedRowIndex,
  handleRowHover,
}) => (
  <table className="table table-bordered">
    <thead className="thead-dark">
      <tr>
        <th>ID</th>
        {tableLayout.map((column) => (
          <th key={column.key}>{column.label}</th>
        ))}
        <th>Edit</th>
        <th>Cancel</th>
      </tr>
    </thead>
    <tbody>
      {data.map((row, rowIndex) => (
        <DataRow
          key={rowIndex}
          row={row}
          rowIndex={rowIndex}
          handleCellChange={handleCellChange}
          handleEditClick={handleEditClick}
          handleCancelClick={handleCancelClick}
          selectedRowIndex={selectedRowIndex}
          handleRowHover={handleRowHover}
        />
      ))}
    </tbody>
  </table>
);

// Main ExcelInterface Component
/**
 * ExcelInterface is a React functional component that provides an Excel-like interface
 * for displaying, editing, and managing tabular data. It supports fetching data,
 * inline editing, adding new entries, and inserting rows at specific positions.
 *
 * State:
 * - data: Array of current table data.
 * - sdata: Synchronized copy of data for editing.
 * - selectedRowIndex: Index of the currently hovered or selected row.
 * - newEntry: Object representing a new entry to be added, initialized from `layout`.
 *
 * Effects:
 * - Fetches initial data on mount and synchronizes `data` and `sdata`.
 *
 * Handlers:
 * - handleCellChange: Updates cell value in both `data` and `sdata`.
 * - handleEditClick: Toggles edit mode for a row and manages original row state.
 * - handleCancelClick: Cancels editing and restores original row data.
 * - handleRowHover: Sets the currently hovered row index.
 * - handleAddEntry: Adds a new entry to the table and resets the entry form.
 * - handleAddRow: Inserts a new editable row after the selected row.
 *
 * Renders:
 * - AddEntryForm: Form for adding new entries.
 * - DataTable: Table displaying the data with editing capabilities.
 * - Add Row button: Button to insert a new row.
 *
 * @component
 */
const ExcelInterface = () => {
  const [data, setData] = useState([]);
  const [sdata, setsData] = useState([]);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const [newEntry, setNewEntry] = useState(layout);

  useEffect(() => {
    fetchData()
      .then((fetchedData) => {
        setData(fetchedData);
        const g = JSON.parse(JSON.stringify(fetchedData));
        setsData(g);
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  const handleCellChange = (rowIndex, columnKey, value) => {
    const newData = [...data];
    const snewData = [...sdata];
    newData[rowIndex][columnKey] = value;
    snewData[rowIndex][columnKey] = value;
    delete snewData[rowIndex].isEditing;
    setData(newData);
    setsData(snewData);
    console.log(data[rowIndex]);
    console.log(sdata[rowIndex]);
  };

  const handleEditClick = (rowIndex, editing) => {
    if (editing) {
      const newData = [...data];
      newData[rowIndex].isEditing = !newData[rowIndex].isEditing;
      setData(newData);
      if (newData[rowIndex].isEditing) {
        newData[rowIndex].original = { ...newData[rowIndex] };
      }
    } else {
      const row = data[rowIndex];
      const srow = sdata[rowIndex];
      updateData(srow)
        .then(() => {
          const newData = [...data];
          newData[rowIndex].isEditing = false;
          setData(newData);
          fetchData();
        })
        .catch((error) => {
          console.error('Error updating row:', error);
        });
    }
  };

  const handleCancelClick = (rowIndex) => {
    const newData = [...data];
    newData[rowIndex] = { ...newData[rowIndex].original };
    newData[rowIndex].isEditing = false;
    setData(newData);
  };

  const handleRowHover = (rowIndex) => {
    setSelectedRowIndex(rowIndex);
  };

  const handleAddEntry = () => {
    newEntry.ID = Date.now();
    addData(newEntry)
      .then((addedEntry) => {
        setData([...data, addedEntry]);
        setNewEntry(layout);
        fetchData();
      })
      .catch((error) => console.error('Error adding entry:', error));
  };

  const handleAddRow = () => {
    const newRowIndex = selectedRowIndex !== null ? selectedRowIndex + 1 : data.length;
    const newData = [...data];
    const snewData = [...sdata];
    const newline = layout;

    newline.ID = Date.now();
    newline.isEditing = true;
    ;
    newData.splice(newRowIndex, 0, newline);
    snewData.splice(newRowIndex, 0, newline);
    console.log(newData);
    setData(newData);
    setsData(snewData);
    // addData(sdata);
    setSelectedRowIndex(newRowIndex);
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Excel-Like Interface</h1>
      <AddEntryForm newEntry={newEntry} setNewEntry={setNewEntry} handleAddEntry={handleAddEntry} />
      <DataTable
        data={data}
        handleCellChange={handleCellChange}
        handleEditClick={handleEditClick}
        handleCancelClick={handleCancelClick}
        selectedRowIndex={selectedRowIndex}
        handleRowHover={handleRowHover}
      />
      <button className="btn btn-success" onClick={handleAddRow}>
        Add Row
      </button>
    </div>
  );
};

export default ExcelInterface;