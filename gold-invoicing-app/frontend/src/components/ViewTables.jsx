import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchAll } from "../api/index";

const ViewTables = ({ tableName, initialParams = {} }) => {
    // const [searchParams] = useSearchParams();
    // const tableName = searchParams.get('table');
    // const pageSize = searchParams.get('pageSize');

    // const [table, setTable] = useState(tableName);

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [params, setParams] = useState({
        page: 1,
        page_size: 10,
        sort_by: null,
        sort_order: "asc",
        ...initialParams,
    });

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
                            </tr>
                        </thead>
                        <tbody>
                            {data.length > 0 ? (
                                data.map((row, index) => (
                                    <tr key={index}>
                                        {Object.values(row).map((value, i) => (
                                            <td key={i}>
                                                {value === null || (isNaN(value) && value.length == 0) ? "N/A" : value} {/* Handle null or NaN */}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={data.length > 0 ? Object.keys(data[0]).length : 1} className="text-center">
                                        No data available
                                    </td>
                                </tr>
                            )}
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