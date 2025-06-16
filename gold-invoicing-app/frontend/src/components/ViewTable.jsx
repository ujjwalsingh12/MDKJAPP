import React, { useEffect, useState } from 'react';
import { fetchAll } from '../api';

export default function ViewTable({ table }) {
    const [records, setRecords] = useState([]);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetchAll(table);
                setRecords(res.data);
            } catch (err) {
                console.error('Failed to fetch records:', err);
            }
        };
        load();
    }, [table]);

    return (
        <div>
            <h2>{table.toUpperCase()} Records</h2>
            <table border="1">
                <thead>
                    <tr>{records[0] && Object.keys(records[0]).map(col => <th key={col}>{col}</th>)}</tr>
                </thead>
                <tbody>
                    {records.map((row, i) => (
                        <tr key={i}>
                            {Object.values(row).map((val, j) => <td key={j}>{val?.toString()}</td>)}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}