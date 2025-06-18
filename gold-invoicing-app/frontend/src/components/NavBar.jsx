import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { DarkModeContext } from '../DarkModeContext'; // Import the context
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './NavBar.css'

function NavItem({ to, label }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                isActive
                    ? 'nav-item active fw-bold btn btn-primary d-block fs-6'
                    : 'nav-item btn fs-6'
            }
            style={({ isActive }) =>
                isActive ? { borderRadius: '5px' } : {}
            }
        >
            {label}
        </NavLink>
    );
}

export default function NavBar() {
    const { darkMode, toggleDarkMode } = useContext(DarkModeContext); // Use the context

    const navLinks = [
        { to: '/', label: 'Dashboard' },
        { to: '/view/journal', label: 'View Journal' },
        { to: '/view/bill', label: 'View Bills' },
        { to: '/view/stock', label: 'View Stock' },
        { to: '/create-bill', label: 'Create Bill' },
        { to: '/UnifiedEntryForm', label: 'Unified Entry Form' },
        { to: '/accounts', label: 'Accounts' },
    ];

    return (
        <nav
            className={`navbar navbar-expand-lg ${darkMode ? 'navbar-dark bg-dark ms-auto' : 'navbar-light bg-light ms-auto'
                }`}
        >
            <div className="container-fluid">
                <span className="navbar-brand fw-bold fs-4">MDKJ Invoicing App</span>
                <button
                    className="btn btn-outline-secondary ms-auto"
                    onClick={toggleDarkMode}
                >
                    {darkMode ? '🌞' : '🌙'}
                </button>
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
                    <ul className="navbar-nav">
                        {navLinks.map((link, index) => (
                            <NavItem key={index} to={link.to} label={link.label} />
                        ))}
                    </ul>
                </div>
            </div>
        </nav>
    );
}