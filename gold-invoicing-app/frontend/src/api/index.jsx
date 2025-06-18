import axios from 'axios';

const API_BASE = 'http://localhost:5003/api/queries';

// --- JOURNAL ENTRY INSERT (Only insert endpoint used for all types)
export const insertUnifiedEntry = (data) =>
    axios.post(`${API_BASE}/journal/entry`, data);

// Generic fetch for any table
export const fetchAll = (table, params = {}) =>
    axios.get(`${API_BASE}/${table}/all`, { params });

// Fetch by GSTIN
export const fetchByGSTIN = (table, gstin) =>
    axios.get(`${API_BASE}/${table}/customer/${gstin}`);

// Add a new record to a specified table
export const addRecord = (table, data) =>
    axios.post(`${API_BASE}/${table}/add`, data);

// Fetch schema of a specified table
export const fetchTableSchema = (table) =>
    axios.get(`${API_BASE}/${table}/schema`);

// Utility function to sanitize responses by converting NaN to null
export const sanitizeResponse = (data) => {
    if (Array.isArray(data)) {
        return data.map((row) =>
            Object.fromEntries(
                Object.entries(row).map(([key, value]) => [
                    key,
                    isNaN(value) && typeof value === 'number' ? null : value,
                ])
            )
        );
    } else if (typeof data === 'object' && data !== null) {
        return Object.fromEntries(
            Object.entries(data).map(([key, value]) => [
                key,
                isNaN(value) && typeof value === 'number' ? null : value,
            ])
        );
    }
    return data;
};

// Example usage of sanitizeResponse in fetchAll
export const fetchAllSanitized = async (table, params = {}) => {
    const response = await fetchAll(table, params);
    return sanitizeResponse(response.data);
};

// Update a record in a specified table
export const updateRecord = (table, data) =>
    axios.put(`${API_BASE}/${table}/update`, data);
// Delete a record from a specified table
export const deleteRecord = (table, id) =>
    axios.delete(`${API_BASE}/${table}/delete/${id}`);  