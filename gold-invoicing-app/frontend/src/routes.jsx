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
// import Purchase from './components/Purchase';
import Stock from './components/Stock';
import Bills from './components/Bills';
import Receipt from './components/Receipt';
import UnifiedEntryForm from './components/UnifiedEntryForm';
// import ExcelInterface from './components/ExcelInterface';
// import CreateBill from './components/CreateBill';
import ReceiptPage from './components/ReceiptPage';

const AppRoutes = () => (
    <Router>

        <NavBar />
        <Header />
        <Dashboard />
        <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/UnifiedEntryForm" element={<UnifiedEntryForm />} />
            <Route path="/add" element={<AddEntry />} />
            <Route path="/view/:table" element={<ViewRecords />} />
            <Route path="/sales" element={<Sales />} />
            {/* <Route path="/purchase" element={<Purchase />} /> */}
            <Route path="/stock" element={<Stock />} />
            <Route path="/bills" element={<Bills />} />
            <Route path="/receipt" element={<Receipt />} />
            {/* <Route path="/excel" element={<ExcelInterface />} /> */}
            {/* <Route path="/create-bill" element={<CreateBill />} /> */}
            <Route path="/receipt-page" element={<ReceiptPage />} />
            <Route path="/entry-dashboard" element={<EntryDashboard />} />
        </Routes>
    </Router>
);


export default AppRoutes;
// const AppRoutes = () => (
//     <Dashboard />    
// );



