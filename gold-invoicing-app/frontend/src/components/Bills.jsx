/**
 * Bills.js
 * 
 * This component renders a Bills management page with the following features:
 * - Displays a table of bills with columns for Bill Number, Amount, and Date.
 * - Allows inline editing of bill rows and saving changes.
 * - Supports adding new rows.
 * - Provides filtering options for each column, including date range filtering.
 * - Enables printing of individual bill rows.
 * - Keyboard navigation and accessibility for editing cells.
 * - Uses Bootstrap for styling.
 */

import React, { useState, useMemo, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Bills.css'; // Custom CSS for styling

const Bills = () => {
  // State for table data, including editing state for each row
  const [data, setData] = useState([
    { id: 1, billNumber: 12345, amount: '$150', date: '2024-01-06', isEditing: false },
    { id: 2, billNumber: 67890, amount: '$200', date: '2024-01-07', isEditing: false },
    // Add more rows as needed
  ]);

  // State for the currently selected row index (for highlighting/navigation)
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);

  // State for filter values for each column
  const [filters, setFilters] = useState({
    billNumber: '',
    amount: '',
    dateStart: '',
    dateEnd: '',
  });

  // Table column definitions
  const columns = [
    { key: 'billNumber', label: 'Bill Number' },
    { key: 'amount', label: 'Amount' },
    { key: 'date', label: 'Date' },
    // Add more columns as needed
  ];

  /**
   * Updates the value of a cell in the table.
   * @param {number} rowIndex - Index of the row to update.
   * @param {string} columnKey - Key of the column to update.
   * @param {string} value - New value for the cell.
   */
  const handleCellChange = (rowIndex, columnKey, value) => {
    const newData = [...data];
    newData[rowIndex][columnKey] = value;
    setData(newData);
  };

  /**
   * Toggles the editing state of a row.
   * @param {number} rowIndex - Index of the row to edit/save.
   */
  const handleEditClick = (rowIndex) => {
    const newData = [...data];
    newData[rowIndex].isEditing = !newData[rowIndex].isEditing;
    setData(newData);
  };

  /**
   * Sets the currently hovered row index for highlighting.
   * @param {number} rowIndex - Index of the hovered row.
   */
  const handleRowHover = (rowIndex) => {
    setSelectedRowIndex(rowIndex);
  };

  /**
   * Handles keyboard navigation and editing in table cells.
   * @param {object} event - Keyboard event.
   * @param {number} rowIndex - Index of the current row.
   * @param {string} columnKey - Key of the current column.
   */
  const handleKeyDown = (event, rowIndex, columnKey) => {
    if (event.key === 'Enter') {
      handleEditClick(rowIndex);
    } else if (event.key === 'ArrowUp' && rowIndex > 0) {
      setSelectedRowIndex(rowIndex - 1);
    } else if (event.key === 'ArrowDown' && rowIndex < data.length - 1) {
      setSelectedRowIndex(rowIndex + 1);
    } else if (event.key === 'ArrowLeft' && columnKey !== 'billNumber') {
      handleEditClick(rowIndex); // Edit the cell when pressing left arrow
    } else if (event.key === 'ArrowRight' && columnKey !== 'date') {
      handleEditClick(rowIndex); // Edit the cell when pressing right arrow
    }
  };

  /**
   * Adds a new row to the table, placing it after the selected row if any.
   */
  const handleAddRow = () => {
    const newRowIndex = selectedRowIndex !== null ? selectedRowIndex + 1 : data.length;
    const newData = [...data];
    newData.splice(newRowIndex, 0, { id: Date.now(), billNumber: '', amount: '', date: '', isEditing: true });
    setData(newData);
    setSelectedRowIndex(newRowIndex);
  };

  /**
   * Saves all rows by setting their editing state to false.
   */
  const handleSaveAll = () => {
    const newData = data.map(row => ({ ...row, isEditing: false }));
    setData(newData);
  };

  /**
   * Opens a print window for the selected bill row.
   * @param {object} row - The bill row to print.
   */
  const handlePrintRow = (row) => {
    // Customize this function to handle the print logic for the row
    const printWindow = window.open('', '', 'height=600,width=800');
    const billContent = `<div>
      <h1>Bill Number: ${row.billNumber}</h1>
      <p>Amount: ${row.amount}</p>
      <p>Date: ${row.date}</p>
    </div>`;

    printWindow.document.write('<html><head><title>Print Bill</title></head><body>');
    printWindow.document.write(billContent);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  /**
   * Updates the filter value for a specific column or date range.
   * @param {string} filterKey - The key of the filter to update.
   * @param {string} value - The new filter value.
   */
  const handleFilterChange = (filterKey, value) => {
    setFilters({
      ...filters,
      [filterKey]: value,
    });
  };

  /**
   * Returns the filtered data based on the current filter values.
   */
  const filteredData = useMemo(() => {
    return data.filter(row => {
      return columns.every(column => {
        const filterValue = filters[column.key];
        if (!filterValue) {
          return true; // No filter applied for this column
        }

        if (column.key === 'date') {
          // Check if the date falls within the specified range
          const startDate = new Date(filters.dateStart);
          const endDate = new Date(filters.dateEnd);

          const rowDate = new Date(row[column.key]);

          return rowDate >= startDate && rowDate <= endDate;
        }

        return String(row[column.key]).toLowerCase().includes(filterValue.toLowerCase());
      });
    });
  }, [data, filters, columns]);

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Bills Page</h1>

      <div className="mb-2">
        {columns.map(column => (
          <div key={column.key} className="mb-2">
            <label className="mr-2">{column.label}:</label>
            {column.key === 'date' ? (
              <div className="d-flex">
                <input
                  type="date"
                  className="form-control mr-2"
                  placeholder="Start Date"
                  value={filters.dateStart || ''}
                  onChange={(e) => handleFilterChange('dateStart', e.target.value)}
                />
                <input
                  type="date"
                  className="form-control"
                  placeholder="End Date"
                  value={filters.dateEnd || ''}
                  onChange={(e) => handleFilterChange('dateEnd', e.target.value)}
                />
              </div>
            ) : (
              <input
                type="text"
                className="form-control"
                value={filters[column.key] || ''}
                onChange={(e) => handleFilterChange(column.key, e.target.value)}
              />
            )}
          </div>
        ))}
      </div>

      <table className="table table-bordered">
        <thead className="thead-dark">
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
            <th>Edit</th>
            <th>Print</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((row, rowIndex) => (
            <tr
              key={row.id}
              className={selectedRowIndex === rowIndex ? 'table-active' : ''}
              onMouseEnter={() => handleRowHover(rowIndex)}
            >
              {columns.map((column) => (
                <td key={column.key}>
                  {row.isEditing ? (
                    column.key === 'date' ? (
                      <input
                        type="date"
                        className="form-control"
                        value={row[column.key]}
                        onChange={(e) => handleCellChange(rowIndex, column.key, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, rowIndex, column.key)}
                      />
                    ) : (
                      <input
                        type="text"
                        className="form-control"
                        value={row[column.key]}
                        onChange={(e) => handleCellChange(rowIndex, column.key, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, rowIndex, column.key)}
                      />
                    )
                  ) : (
                    row[column.key]
                  )}
                </td>
              ))}
              <td>
                <button
                  className={`btn ${row.isEditing ? 'btn-success' : 'btn-primary'}`}
                  onClick={() => handleEditClick(rowIndex)}
                >
                  {row.isEditing ? 'Save' : 'Edit'}
                </button>
              </td>
              <td>
                <button className="btn btn-info" onClick={() => handlePrintRow(row)}>
                  Print
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className="btn btn-success" onClick={handleAddRow}>
        Add Row
      </button>
      <button className="btn btn-primary ml-2" onClick={handleSaveAll}>
        Save All
      </button>
    </div>
  );
};

export default Bills;
