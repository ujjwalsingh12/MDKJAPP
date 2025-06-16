import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import AddEntry from './pages/AddEntry';
import ViewRecords from './pages/ViewRecords';
import NavBar from './components/NavBar';

const AppRoutes = () => (
    <Router>

        <NavBar />
        <Dashboard />
        <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/add" element={<AddEntry />} />
            <Route path="/view/:table" element={<ViewRecords />} />
        </Routes>
    </Router>
);


export default AppRoutes;
// const AppRoutes = () => (
//     <Dashboard />
// );



import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
// import Header from './components/Header';
// import Sidebar from './components/Sidebar';
// import Dashboard from './components/Dashboard';
// import Sales from './components/Sales';
// import Purchase from './components/Purchase';
// import Stock from './components/Stock';
// import Bills from './components/Bills';
// import Receipt from './components/Receipt';
// import ExcelInterface from './components/ExcelInterface';
// import CreateBill from './components/CreateBill';
// import ReceiptPage from './components/ReceiptPage';

