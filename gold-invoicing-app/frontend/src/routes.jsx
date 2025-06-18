import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import AddEntry from './pages/AddEntry';
import ViewRecords from './pages/ViewRecords';
import NavBar from './components/NavBar';
import EntryDashboard from './pages/EntryDashboard';

import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboardx from './components/Dashboardx';
import Sales from './components/Sales';
import Bills from './components/Bills';
import Receipt from './components/CreateBill';
import UnifiedEntryForm from './components/UnifiedEntryForm';
// import ExcelInterface from './components/ExcelInterface';
import ReceiptPage from './components/ReceiptPage';
import Accounts from './pages/Accounts';
import ViewTables from './components/ViewTables';
import Stock from './pages/Stock';
import Journal from './pages/Journal';
import Bill from './pages/Bill';
import CreateBill from './components/CreateBill';


const AppRoutes = () => (
    <Router>

        {/* <Header /> */}
        <NavBar />
        <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/UnifiedEntryForm" element={<UnifiedEntryForm />} />
            <Route path="/add" element={<AddEntry />} />
            <Route path="view/stock" element={<Stock />} />
            <Route path="view/bill" element={<Bill />} />
            <Route path="view/journal" element={<Journal />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/stock" element={<Stock />} />
            <Route path="/bills" element={<Bills />} />
            <Route path="/create-bill" element={<CreateBill />} />
            <Route path="/receipt-page" element={<ReceiptPage />} />
            <Route path="/entry-dashboard" element={<EntryDashboard />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/view-tables" element={<ViewTables />} />
        </Routes>
    </Router>
);


export default AppRoutes;



