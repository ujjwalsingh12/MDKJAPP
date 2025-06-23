import React, { useEffect, useMemo, useState } from 'react';
import { fetchAll, fetchByGSTIN } from '../api';
import DataTable from '../components/DataTable';
import ViewTables from '../components/ViewTables';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // Import Bootstrap JS
import CreateCustomer from '../components/CreateCustomer';

export default function Accounts() {
    const [customers, setCustomers] = useState([]);
    const [customerSearchTerm, setCustomerSearchTerm] = useState('');
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [journalEntries, setJournalEntries] = useState([]);

    const [overallMetrics, setOverallMetrics] = useState({
        totalCustomers: 0,
        totalJournalEntries: 0,
        totalBillAmount: 0,
    });

    // Load all customers
    useEffect(() => {
        const loadCustomers = async () => {
            try {
                const res = await fetchAll('customer_details', { page: 1, page_size: 100 });
                setCustomers(res.data);
                setOverallMetrics(prev => ({ ...prev, totalCustomers: res.data.length }));
            } catch (err) {
                console.error('Failed to load customers:', err);
            }
        };
        loadCustomers();
    }, []);

    // Load overall journal and metrics
    useEffect(() => {
        const loadMetrics = async () => {
            try {
                const res = await fetchAll('journal', { page: 1, page_size: 1000 });
                const entries = res.data || [];
                const totalBillAmount = entries
                    .filter(e => e.entry_type === 'bill')
                    .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
                setOverallMetrics(prev => ({
                    ...prev,
                    totalJournalEntries: entries.length,
                    totalBillAmount,
                }));
            } catch (err) {
                console.error('Failed to load journal entries:', err);
            }
        };
        loadMetrics();
    }, []);

    const filteredCustomers = useMemo(() => {
        if (!customerSearchTerm) return customers;
        return customers.filter(c =>
            c.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
            (c.phone || '').includes(customerSearchTerm)
        );
    }, [customerSearchTerm, customers]);

    const handleCustomerSelect = (customer) => {
        setSelectedCustomer(customer);
        setCustomerSearchTerm(customer.name);
        setShowCustomerDropdown(false);

        // Load customer journal
        fetchByGSTIN('journal', customer.gstin)
            .then(res => setJournalEntries(res.data || []))
            .catch(err => {
                console.error('Failed to fetch customer journal:', err);
                setJournalEntries([]);
            });
    };

    const handleCustomerSearch = (val) => {
        setCustomerSearchTerm(val);
        setSelectedCustomer(null);
        setShowCustomerDropdown(val.length > 0);
        setJournalEntries([]);
    };

    return (
        <div className="container mt-4">
            <h1 className="mb-4">Accounts Overview</h1>

            {/* Section 1: Overall Metrics */}
            <div className="card p-4 mb-4">
                <h3>Overall Metrics</h3>
                <div className="row mt-3">
                    <div className="col-md-4">
                        <div className="p-3 bg-light border rounded">
                            <h6>Total Customers</h6>
                            <p className="h4 text-primary">{overallMetrics.totalCustomers}</p>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="p-3 bg-light border rounded">
                            <h6>Total Journal Entries</h6>
                            <p className="h4 text-success">{overallMetrics.totalJournalEntries}</p>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="p-3 bg-light border rounded">
                            <h6>Total Bill Amount</h6>
                            <p className="h4 text-info">₹{overallMetrics.totalBillAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section 2: Customer Summary */}
            <div className="card p-4">
                <h3>Customer Account Summary</h3>

                {/* Customer Search */}
                <div className="mb-3 position-relative">
                    <label className="form-label">Search Customer by Name/Phone</label>
                    <input
                        className="form-control"
                        value={customerSearchTerm}
                        onChange={(e) => handleCustomerSearch(e.target.value)}
                        onFocus={() => setShowCustomerDropdown(customerSearchTerm.trim().length > 0)}
                        placeholder="e.g. Rajesh or 9876543210"
                    />
                    {showCustomerDropdown && (
                        <ul className="list-group position-absolute w-100 zindex-dropdown mt-1" style={{ zIndex: 999 }}>
                            {filteredCustomers.length > 0 ? (
                                filteredCustomers.map((c) => (
                                    <li
                                        key={c.gstin}
                                        className="list-group-item list-group-item-action"
                                        onClick={() => handleCustomerSelect(c)}
                                    >
                                        <strong>{c.name}</strong> ({c.phone})<br />
                                        <small>{c.address}</small>
                                    </li>
                                ))
                            ) : (
                                <li className="list-group-item">No customers found</li>
                            )}
                        </ul>
                    )}
                </div>

                {/* Selected Customer Journal */}
                {selectedCustomer && (
                    <>
                        <div className="mt-3 mb-3">
                            <h5>
                                Transactions for: <strong>{selectedCustomer.name}</strong> (GSTIN: {selectedCustomer.gstin})
                            </h5>
                        </div>
                        <ViewTables
                            tableName="journal"
                            initialParams={{ page: 1, page_size: 1000, gstin: selectedCustomer.gstin }}
                        // render={(data) => {
                        //     const filteredEntries = data.filter(entry => entry.gstin === selectedCustomer.gstin);

                        //     // Consolidate data (e.g., summing amounts by entry type)
                        //     const consolidatedData = filteredEntries.reduce(
                        //         (acc, entry) => {
                        //             acc.totalAmount += parseFloat(entry.amount || 0);
                        //             acc[entry.entry_type] = (acc[entry.entry_type] || 0) + parseFloat(entry.amount || 0);
                        //             return acc;
                        //         },
                        //         { totalAmount: 0 }
                        //     );
                        //     console.log('Consolidated Data:', consolidatedData);

                        //     return filteredEntries.length > 0 ? (
                        //         <>
                        //             <DataTable data={filteredEntries} />
                        //             <div className="mt-4">
                        //                 <h5>Consolidated Data</h5>
                        //                 <p>Total Amount: ₹{consolidatedData.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                        //                 {Object.entries(consolidatedData).map(([key, value]) =>
                        //                     key !== 'totalAmount' ? (
                        //                         <p key={key}>
                        //                             {key}: ₹{value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        //                         </p>
                        //                     ) : null
                        //                 )}
                        //             </div>
                        //         </>
                        //     ) : (
                        //         <p>No entries found for this customer.</p>
                        //     );
                        // }}
                        />
                    </>
                )}
            </div>
            <CreateCustomer />
        </div>
    );
}