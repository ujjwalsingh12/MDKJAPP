import { NavLink } from 'react-router-dom';
import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // Import Bootstrap JS

function NavItem({ to, label }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                isActive
                    ? 'nav-item active  fw-bold btn btn-primary d-block  fs-6 '
                    : 'nav-item btn fs-6'
            }
            style={({ isActive }) =>
                isActive ? { borderRadius: '5px' } : {}
            }
        >

            {label}

        </NavLink >
    );
}

export default function NavBar() {
    const navLinks = [
        { to: '/', label: 'Dashboard' },

        { to: '/view/journal', label: 'View Journal' },
        { to: '/view/bill', label: 'View Bills' },
        { to: '/view/stock', label: 'View Stock' },
        // { to: '/view/customer_details', label: 'View Customer Details' },


        // { to: '/view/stock', label: 'View Stock' },
        // { to: '/view/customer_details', label: 'View Customer Details' },
        // { to: '/view/?table=journal', label: 'View Journal' },
        // { to: '/view/?table=bill', label: 'View Bills' },
        // { to: '/view/?table=stock', label: 'View Stock' },
        // { to: '/view/?table=customer_details', label: 'View Customer Details' },
        // { to: '/add', label: 'Add Entry' },
        // { to: '/view/bill', label: 'View Bills' },

        // { to: '/view/receipt', label: 'View Receipts' },
        // { to: '/sales', label: 'Sales' },
        // { to: '/stock', label: 'Stock' },
        // { to: '/bills', label: 'Bills' },
        { to: '/receipt', label: 'Receipt' },
        { to: '/UnifiedEntryForm', label: 'Unified Entry Form' },
        // { to: '/receipt-page', label: 'Receipt Page' },
        { to: '/accounts', label: 'Accounts' },

        // Uncomment the following line if you want to include the Entry Dashboard link
        // { to: '/entry-dashboard', label: 'Entry Dashboard' },
    ];

    const [darkMode, setDarkMode] = React.useState(false);

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        document.body.classList.toggle('bg-dark', !darkMode);
        document.body.classList.toggle('text-white', !darkMode);
    };

    return (
        <nav className={`navbar navbar-expand-lg 
        ${darkMode ? 'navbar-dark bg-dark ms-auto' : 'navbar-light bg-light ms-auto'

            }`}>
            <div className="container-fluid">
                <span className="navbar-brand fw-bold fs-4">Gold Invoicing App</span>
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav fs-6">
                        {navLinks.map((link, index) => (
                            <NavItem key={index} to={link.to} label={link.label} />
                        ))}
                    </ul>
                    <button
                        className="btn btn-outline-secondary ms-auto"
                        onClick={toggleDarkMode}
                    >
                        {darkMode ? 'Light Mode' : 'Dark Mode'}
                    </button>
                </div>
            </div>
        </nav>
    );
}

//