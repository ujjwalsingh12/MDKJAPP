import React, { useState, useEffect } from "react";
import { fetchAll, updateRecord, check, fetchTableSchema } from "../api/index";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './ViewTables.css';

const formatFriendlyDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const sameDay = (d1, d2) => (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
    );

    if (sameDay(date, today)) return "Today";
    if (sameDay(date, yesterday)) return "Yesterday";
    return date.toLocaleDateString();
};

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
        {tableLayout.map((column) => (
            <td key={column.key} className="view-tables__cell">
                {row.isEditing && column.editable ? (
                    <input
                        type={
                            column.type === 'number' ? 'number' :
                                column.type === 'date' ? 'date' :
                                    'text'
                        }
                        className="view-tables__input"
                        value={row[column.key] || ""}
                        onChange={(e) => handleCellChange(rowIndex, column.key, e.target.value)}
                    />
                ) : (
                    column.type === 'date'
                        ? formatFriendlyDate(row[column.key])
                        : (row[column.key] ?? "N/A")
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
                    tableLayout={tableLayout}
                />
            ))}
        </tbody>
    </table>
);

const ViewTables = ({ tableName, initialParams = {} }) => {
    const [data, setData] = useState([]);
    const [sdata, setsData] = useState([]);
    const [tableLayout, setTableLayout] = useState([]);
    const [selectedRowIndex, setSelectedRowIndex] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [params, setParams] = useState({
        page: 1,
        page_size: 10,
        sort_by: 'id',
        sort_order: "desc",
        ...initialParams,
    });

    const fetchSchema = async () => {
        try {
            const response = await fetchTableSchema(tableName);
            const schema = response.data.schema || [];
            const layout = schema.map((column) => ({
                key: column.column_name,
                label: column.column_name.toUpperCase(),
                type:
                    column.data_type === "integer" || column.data_type === "numeric" ? "number" :
                        column.data_type === "date" || column.data_type === "timestamp without time zone" ? "date" :
                            "text",
                editable: true,
            }));
            setTableLayout(layout);
        } catch (err) {
            console.error(`Error fetching schema for table: ${tableName}`, err);
            setError("Failed to fetch table schema");
        }
    };

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetchAll(tableName, params);
            if (Array.isArray(response.data)) {
                setData(response.data);
                setsData(JSON.parse(JSON.stringify(response.data)));
            } else {
                setData([]);
            }
        } catch (err) {
            setError(err.message || "Failed to fetch data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
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
        fetchSchema();
        fetchData();
    }, [tableName]);

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
        newData[rowIndex] = { ...newData[rowIndex], [columnKey]: value };
        setData(newData);
    };

    const handleRowHover = (rowIndex) => {
        setSelectedRowIndex(rowIndex);
    };

    const handleSaveClick = async (rowIndex) => {
        const cleanRowData = { ...data[rowIndex] };
        delete cleanRowData.isEditing;

        try {
            await check(tableName, cleanRowData);
            alert('Record updated successfully');
            await fetchData();
        } catch (error) {
            setError('Failed to update record. Please try again.');
        }
    };

    const handleEditClick = (rowIndex) => {
        const newData = [...data];
        newData[rowIndex].isEditing = true;
        setData(newData);
        setsData(JSON.parse(JSON.stringify(data)));
    };

    const handleCancelClick = (rowIndex) => {
        const restored = JSON.parse(JSON.stringify(sdata));
        restored[rowIndex].isEditing = false;
        setData(restored);
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