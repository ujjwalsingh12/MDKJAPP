
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








// // src/api/index.js
// import axios from 'axios';

// const API_BASE = 'http://localhost:5003'; // Your backend port

// // Generic Fetch All Records
// export const fetchAll = (table, params = {}) =>
//     axios.get(`${API_BASE}/${table}/all`, { params });

// // Get Records by GSTIN
// export const fetchByGSTIN = (table, gstin) =>
//     axios.get(`${API_BASE}/${table}/customer/${gstin}`);

// // Add a Record
// export const addRecord = (table, data) =>
//     axios.post(`${API_BASE}/${table}/add`, data);

// // Update a Record
// export const updateRecord = (table, id, data) =>
//     axios.put(`${API_BASE}/${table}/update/${id}`, data);

// // Delete a Record
// export const deleteRecord = (table, id) =>
//     axios.delete(`${API_BASE}/${table}/delete/${id}`);

// // Add Journal Entry (smart function that hits your unified_insert_journal_entry logic)
// export const addJournalEntry = (data) =>
//     axios.post(`${API_BASE}/journal/entry`, data);

// // Health Check
// export const healthCheck = () =>
//     axios.get(`${API_BASE}/health`);