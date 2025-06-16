import React from 'react';
import './Sidebar.css'; // Import custom CSS

const Sidebar = ({ isOpen, handleNavigation }) => {
  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <ul className="list-unstyled">
        <li className="nav-item" onClick={() => handleNavigation('dashboard')}>Dashboard</li>
        <li className="nav-item" onClick={() => handleNavigation('sales')}>Sales</li>
        <li className="nav-item" onClick={() => handleNavigation('purchase')}>Purchase</li>
        <li className="nav-item" onClick={() => handleNavigation('stock')}>Stock</li>
        <li className="nav-item" onClick={() => handleNavigation('bills')}>Bills</li>
        <li className="nav-item" onClick={() => handleNavigation('receipt')}>Receipt</li>
        <li className="nav-item" onClick={() => handleNavigation('createbill')}>CreateBill</li>
        <li className="nav-item" onClick={() => handleNavigation('receipt2')}>ReceiptPage</li>
      </ul>
    </div>
  );
};

export default Sidebar;
