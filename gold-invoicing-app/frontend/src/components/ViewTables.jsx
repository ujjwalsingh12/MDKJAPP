import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchAll } from "../api/index";
import { fetchTableSchema } from "../api/index"; // Import the function to fetch table schema
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // Import Bootstrap JS
import './ViewTables.css'; // Import custom CSS for styling
// import { updateData } from "../api/index"; // Import the function to update data



const DataRow = ({
    row,
    rowIndex,
    handleCellChange,
    handleEditClick,
    handleCancelClick,
    selectedRowIndex,
    handleRowHover,
    tableLayout
}) => (
    <tr
        key={rowIndex}
        className={selectedRowIndex === rowIndex ? 'table-active' : ''}
        onMouseEnter={() => handleRowHover(rowIndex)}
    >
        <td></td>
        {
            tableLayout.map((column, i) => (
                <td key={column.key}>
                    {row.isEditing && column.editable ? (
                        <input
                            type={column.type === 'number' ? 'number' : 'text'}
                            className="form-control"
                            value={row[column.key] || ""}
                            onChange={(e) => handleCellChange(rowIndex, column.key, e.target.value)}
                        />
                    ) : (
                        row[column.key] === null || row[column.key] === undefined || row[column.key] === ""
                            ? "N/A" // Handle null or missing values
                            : row[column.key]
                    )}
                </td>
            ))

            // Display value or "N/A" if null or NaN
            // row[column.key] === null || (isNaN(row[column.key]) && row[column.key].length === 0) ? "N/A" : row[column.key]
        }
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
    </tr >
);

// Table Component
const DataTable = ({
    data,
    handleCellChange,
    handleEditClick,
    handleCancelClick,
    selectedRowIndex,
    handleRowHover,
    handleSort,
    tableLayout,
    params
}) => (
    <table className="table table-bordered">
        <thead className="thead-dark">
            <tr>
                <th>ID</th>
                {tableLayout.map((column) => (
                    // <th key={column.key}>{column.label}</th>
                    <th
                        key={column.key}
                        onClick={() => handleSort(column.key)}
                        style={{ cursor: "pointer" }}
                    >
                        {column.label} {params.sort_by === column.key ? (params.sort_order === "asc" ? "↑" : "↓") : ""}
                    </th>
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
                    tableLayout={tableLayout} // Pass tableLayout
                />
            ))}
        </tbody>
    </table>
);


const handleRowHover = (rowIndex) => {
    try {
        console.log(`Row hovered: ${rowIndex}`);
        setSelectedRowIndex(rowIndex);
    } catch (err) {
        console.error(`Error handling row hover for row: ${rowIndex}`, err);
    }
};

let checked = false;


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
        const newData = [...data];
        const snewData = [...sdata];
        newData[rowIndex][columnKey] = value;
        snewData[rowIndex][columnKey] = value;
        delete snewData[rowIndex].isEditing;
        setData(newData);
        setsData(snewData);
    };

    const handleRowHover = (rowIndex) => {
        try {
            setSelectedRowIndex(rowIndex);
        } catch (err) {
            console.error(`Error handling row hover for row: ${rowIndex}`, err);
        }
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
        newData[rowIndex] = { ...newData[rowIndex].original }; // Restore original data
        newData[rowIndex].isEditing = false; // Reset editing state
        setData(newData);
    };

    return (
        <div>
            <h3>Viewing Table: {tableName}</h3>
            {error && <div className="alert alert-danger">{error}</div>}
            {loading ? (
                <div>Loading...</div>
            ) : (
                <>
                    <div className="mb-3">
                        <label>Page Size: </label>
                        <select value={params.page_size} onChange={handlePageSizeChange}>
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
                        handleCancelClick={handleCancelClick}
                        tableLayout={tableLayout}
                        handleSort={handleSort}
                        params={params}
                        handleRowHover={handleRowHover}
                        selectedRowIndex={selectedRowIndex}
                    />
                    <div className="d-flex justify-content-between align-items-center">
                        <button
                            className="btn btn-primary"
                            onClick={() => handlePageChange(params.page - 1)}
                            disabled={params.page === 1}
                        >
                            Previous
                        </button>
                        <span>Page {params.page}</span>
                        <button
                            className="btn btn-primary"
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