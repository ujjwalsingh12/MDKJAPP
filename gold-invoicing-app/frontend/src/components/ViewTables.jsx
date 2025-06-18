import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchAll } from "../api/index";
import { fetchTableSchema } from "../api/index"; // Import the function to fetch table schema
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // Import Bootstrap JS




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




let checked = false;



const ViewTables = ({ tableName, initialParams = {} }) => {
    const [data, setData] = useState([]);
    const [selectedRowIndex, setSelectedRowIndex] = useState(null);
    const [sdata, setsData] = useState([]); // State for storing original data
    const [tableLayout, setTableLayout] = useState([]); // Dynamic table layout
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [params, setParams] = useState({
        page: 1,
        page_size: 10,
        sort_by: null,
        sort_order: "asc",
        ...initialParams,
    });
    const fetchSchema = async () => {
        try {
            const response = await fetchTableSchema(tableName);
            const schema = response.data.schema || [];
            const layout = schema.map((column) => ({
                key: column.column_name, // Use the correct property name
                label: column.column_name.toUpperCase(), // Use the correct property name
                type: (column.data_type === "integer" || column.data_type === "numeric") ? "number" : "text", // Use the correct property name
                editable: true, // Assume all columns are editable for now
            }));
            setTableLayout(layout);
            checked = true;
        } catch (err) {
            console.error(`Error fetching schema for table: ${tableName}`, err);
            setError("Failed to fetch table schema");
            checked = true;
        }
    };
    if (!checked)
        fetchSchema();
    if (tableLayout.length > 0) {
        console.log("tableLayout", tableLayout[2]['type']);
    }
    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log(`Fetching data for table: ${tableName} with params:`, params);
            const response = await fetchAll(tableName, params);
            console.log(`API response for table: ${tableName}`, response);

            // Ensure response.data is an array
            if (Array.isArray(response.data)) {
                setData(response.data);
                console.log(data);
            } else {
                console.error(`Unexpected data format for table: ${tableName}`, response.data);
                setData([]); // Fallback to an empty array
            }
        } catch (err) {
            console.error(`Error fetching data for table: ${tableName}`, err);
            setError(err.message || "Failed to fetch data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        try {
            console.log(`Params changed for table: ${tableName}, fetching data...`);
            fetchData();
        } catch (err) {
            console.error(`Error in useEffect for table: ${tableName}`, err);
        }
    }, [params]);

    const handleSort = (column) => {
        try {
            console.log(`Sorting by column: ${column}`);
            setParams((prev) => ({
                ...prev,
                sort_by: column,
                sort_order: prev.sort_by === column && prev.sort_order === "asc" ? "desc" : "asc",
            }));
        } catch (err) {
            console.error(`Error handling sort for column: ${column}`, err);
        }
    };

    const handlePageChange = (newPage) => {
        try {
            console.log(`Changing to page: ${newPage}`);
            setParams((prev) => ({ ...prev, page: newPage }));
        } catch (err) {
            console.error(`Error changing page to: ${newPage}`, err);
        }
    };

    const handlePageSizeChange = (e) => {
        try {
            const newPageSize = parseInt(e.target.value, 10) || 10;
            console.log(`Changing page size to: ${newPageSize}`);
            setParams((prev) => ({ ...prev, page_size: newPageSize }));
        } catch (err) {
            console.error(`Error changing page size`, err);
        }
    };
    //----------------------------------------------------

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

    const handleRowHover = (rowIndex) => {
        try {
            console.log(`Row hovered: ${rowIndex}`);
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
        try {
            console.log(`Cancel clicked for row: ${rowIndex}`);
            const newData = [...data];
            newData[rowIndex] = { ...newData[rowIndex].original }; // Restore original data
            newData[rowIndex].isEditing = false; // Reset editing state
            setData(newData);
        } catch (err) {
            console.error(`Error handling cancel click for row: ${rowIndex}`, err);
        }
    };
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
            key={rowIndex}
            className={selectedRowIndex === rowIndex ? 'table-active' : ''}
            onMouseEnter={() => handleRowHover(rowIndex)}
        >
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


    //----------------------------------------------------

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
                    <table className="table table-bordered">
                        <thead>
                            <tr>
                                {data.length > 0 &&
                                    Object.keys(data[0]).map((key) => (
                                        <th key={key} onClick={() => handleSort(key)} style={{ cursor: "pointer" }}>
                                            {key} {params.sort_by === key ? (params.sort_order === "asc" ? "↑" : "↓") : ""}
                                        </th>
                                    ))}
                                <th>Edit</th>
                                <th>Cancel</th>
                            </tr>
                        </thead>
                        <tbody>
                            {


                                data.map((row, rowIndex) => (
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
                                ))

                                //         data.length > 0 ? (
                                //     data.map((row, index) => (
                                // <tr key={index}>
                                //     {Object.values(row).map((value, i) => (
                                //         <td key={i}>
                                //             {value === null || (isNaN(value) && value.length == 0) ? "N/A" : value} {/* Handle null or NaN */}
                                //         </td>
                                //     ))}
                                // </tr>
                                //     ))
                                // ) : (
                                //     <tr>
                                //         <td colSpan={data.length > 0 ? Object.keys(data[0]).length : 1} className="text-center">
                                //             No data available
                                //         </td>
                                //     </tr>
                                //     )
                            }
                        </tbody>
                    </table>
                    <div className="d-flex justify-content-between align-items-center">
                        <button
                            className="btn btn-primary"
                            onClick={() => handlePageChange(params.page - 1)}
                            disabled={params.page === 1}
                        >
                            Previous
                        </button>
                        <span>
                            Page {params.page}
                        </span>
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