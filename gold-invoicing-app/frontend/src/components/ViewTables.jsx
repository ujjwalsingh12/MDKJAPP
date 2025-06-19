import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchAll, updateRecord } from "../api/index"; // Import updateRecord
import { fetchTableSchema } from "../api/index"; // Import the function to fetch table schema
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // Import Bootstrap JS
import './ViewTables.css'; // Import custom CSS for styling

const DataRow = ({
    row,
    rowIndex,
    handleCellChange,
    handleEditClick,
    handleSaveClick,
    handleCancelClick,
    selectedRowIndex,
    handleRowHover,
    tableLayout
}) => (
    <tr
        key={rowIndex}
        className={`view-tables__row ${selectedRowIndex === rowIndex ? 'view-tables__row--active' : ''}`}
        onMouseEnter={() => handleRowHover(rowIndex)}
    >
        <td></td>
        {tableLayout.map((column, i) => (
            <td key={column.key} className="view-tables__cell">
                {row.isEditing && column.editable ? (
                    <input
                        type={column.type === 'number' ? 'number' : 'text'}
                        className="view-tables__input"
                        value={row[column.key] || ""}
                        // onChange={(e) => handleCellChange(rowIndex, column.key, e.target.value)}
                        onChange={(e) => row[column.key] = e.target.value}
                    />
                ) : (
                    row[column.key] === null || row[column.key] === undefined || row[column.key] === ""
                        ? "N/A" // Handle null or missing values
                        : row[column.key]
                )}
            </td>
        ))}
        <td className="view-tables__cell">
            <button
                className={`view-tables__button ${row.isEditing ? 'view-tables__button--save' : 'view-tables__button--edit'}`}
                onClick={() => row.isEditing ? handleSaveClick(rowIndex) : handleEditClick(rowIndex)}
            >
                {row.isEditing ? 'Save' : 'Edit'}
            </button>
        </td>
        <td className="view-tables__cell">
            {row.isEditing && (
                <button className="view-tables__button view-tables__button--cancel" onClick={() => handleCancelClick(rowIndex)}>
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
    handleSaveClick,
    handleCancelClick,
    selectedRowIndex,
    handleRowHover,
    handleSort,
    tableLayout,
    params
}) => (
    <table className="view-tables__table">
        <thead className="view-tables">
            <tr className="view-tables__header-row">
                <th className="view-tables__header-cell">ID</th>
                {tableLayout.map((column) => (
                    <th
                        key={column.key}
                        className="view-tables__header-cell view-tables__header-cell--sortable"
                        onClick={() => handleSort(column.key)}
                    >
                        {column.label} {params.sort_by === column.key ? (params.sort_order === "asc" ? "↑" : "↓") : ""}
                    </th>
                ))}
                <th className="view-tables__header-cell">Edit</th>
                <th className="view-tables__header-cell">Cancel</th>
            </tr>
        </thead>
        <tbody className="view-tables__body">
            {data.map((row, rowIndex) => (
                <DataRow
                    key={rowIndex}
                    row={row}
                    rowIndex={rowIndex}
                    handleCellChange={handleCellChange}
                    handleEditClick={handleEditClick}
                    handleSaveClick={handleSaveClick}
                    handleCancelClick={handleCancelClick}
                    selectedRowIndex={selectedRowIndex}
                    handleRowHover={handleRowHover}
                    tableLayout={tableLayout} // Pass tableLayout
                />
            ))}
        </tbody>
    </table>
);

const ViewTables = ({ tableName, initialParams = {} }) => {
    const [data, setData] = useState([]);
    const [sdata, setsData] = useState([]); // State for storing original data
    const [tableLayout, setTableLayout] = useState([]); // Dynamic table layout
    const [selectedRowIndex, setSelectedRowIndex] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [params, setParams] = useState({
        page: 1,
        page_size: 10,
        sort_by: null,
        sort_order: "asc",
        ...initialParams,
    });

    // Fetch schema for the table
    const fetchSchema = async () => {
        try {
            const response = await fetchTableSchema(tableName);
            const schema = response.data.schema || [];
            const layout = schema.map((column) => ({
                key: column.column_name,
                label: column.column_name.toUpperCase(),
                type: column.data_type === "integer" || column.data_type === "numeric" ? "number" : "text",
                editable: true,
            }));
            setTableLayout(layout);
        } catch (err) {
            console.error(`Error fetching schema for table: ${tableName}`, err);
            setError("Failed to fetch table schema");
        }
    };

    // Fetch data for the table
    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetchAll(tableName, params);
            if (Array.isArray(response.data)) {
                setData(response.data);
                setsData(response.data); // Store original data
            } else {
                console.error(`Unexpected data format for table: ${tableName}`, response.data);
                setData([]);
            }
        } catch (err) {
            console.error(`Error fetching data for table: ${tableName}`, err);
            setError(err.message || "Failed to fetch data");
        } finally {
            setLoading(false);
        }
    };

    // Handle tableName change
    useEffect(() => {
        // Reset state when tableName changes
        setData([]);
        setsData([]);
        setTableLayout([]);
        setError(null);
        setParams({
            page: 1,
            page_size: 10,
            sort_by: null,
            sort_order: "asc",
            ...initialParams,
        });

        // Fetch schema and data for the new table
        fetchSchema();
        fetchData();
    }, [tableName]); // Re-run when tableName changes

    // Handle params change (e.g., pagination, sorting)
    useEffect(() => {
        fetchData();
    }, [params]);

    const handleSort = (column) => {
        setParams((prev) => ({
            ...prev,
            sort_by: column,
            sort_order: prev.sort_by === column && prev.sort_order === "asc" ? "desc" : "asc",
        }));
    };

    const handlePageChange = (newPage) => {
        setParams((prev) => ({ ...prev, page: newPage }));
    };

    const handlePageSizeChange = (e) => {
        const newPageSize = parseInt(e.target.value, 10) || 10;
        setParams((prev) => ({ ...prev, page_size: newPageSize }));
    };

    const handleCellChange = (rowIndex, columnKey, value) => {
        // const newData = [...data];
        // const snewData = [...sdata];
        // data[rowIndex][columnKey] = value;
        // snewData[rowIndex][columnKey] = value;
        // delete snewData[rowIndex].isEditing;
        // setData(newData);
        // setsData(snewData);
    };

    const handleRowHover = (rowIndex) => {
        try {
            setSelectedRowIndex(rowIndex);
        } catch (err) {
            console.error(`Error handling row hover for row: ${rowIndex}`, err);
        }
    };

    // Dedicated function for handling save operation
    const handleSaveClick = async (rowIndex) => {
        const row = data[rowIndex];

        try {
            // Create a copy of the row data without the editing flags
            const cleanRowData = row;
            delete cleanRowData.isEditing;
            delete cleanRowData.original;

            // Call the updateRecord function with tableName and clean data
            console.log('clean', cleanRowData);
            await updateRecord(tableName, cleanRowData);

            // Update the local state
            // const newData = [...data];
            data[rowIndex].isEditing = false;
            // delete newData[rowIndex].original;
            // setData(Data);

            // Optionally refresh the data from server
            await fetchData();

            console.log('Record updated successfully');

        } catch (error) {
            console.error('Error updating row:', error);
            setError('Failed to update record. Please try again.');
        }
    };

    // Function for handling edit button click (to enter edit mode)
    const handleEditClick = (rowIndex) => {
        setsData(data);
        data[rowIndex].isEditing = true;
        // Store original data for cancel functionality
        // newData[rowIndex].original = { ...newData[rowIndex] };
        // setData(newData);
    };

    const handleCancelClick = (rowIndex) => {
        const newData = [...data];
        newData[rowIndex] = { ...newData[rowIndex].original }; // Restore original data
        newData[rowIndex].isEditing = false; // Reset editing state
        delete newData[rowIndex].original; // Clean up
        setData(newData);
    };

    return (
        <div className="view-tables">
            <h3 className="view-tables__title">Viewing Table: {tableName}</h3>
            {error && <div className="view-tables__alert view-tables__alert--error">{error}</div>}
            {loading ? (
                <div className="view-tables__loading">Loading...</div>
            ) : (
                <>
                    <div className="view-tables__controls">
                        <label className="view-tables__label">Page Size: </label>
                        <select
                            className="view-tables__select"
                            value={params.page_size}
                            onChange={handlePageSizeChange}
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                    </div>
                    <DataTable
                        data={data}
                        handleCellChange={handleCellChange}
                        handleEditClick={handleEditClick}
                        handleSaveClick={handleSaveClick}
                        handleCancelClick={handleCancelClick}
                        tableLayout={tableLayout}
                        handleSort={handleSort}
                        params={params}
                        handleRowHover={handleRowHover}
                        selectedRowIndex={selectedRowIndex}
                    />
                    <div className="view-tables__pagination">
                        <button
                            className="view-tables__button view-tables__button--prev"
                            onClick={() => handlePageChange(params.page - 1)}
                            disabled={params.page === 1}
                        >
                            Previous
                        </button>
                        <span className="view-tables__pagination-info">Page {params.page}</span>
                        <button
                            className="view-tables__button view-tables__button--next"
                            onClick={() => handlePageChange(params.page + 1)}
                            disabled={data.length < params.page_size}
                        >
                            Next
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default ViewTables;