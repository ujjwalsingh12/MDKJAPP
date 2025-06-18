import React, { createContext, useState, useEffect } from 'react';

// Create the context
export const DarkModeContext = createContext();

// Create the provider component
export const DarkModeProvider = ({ children }) => {
    const [darkMode, setDarkMode] = useState(false);

    // Load dark mode preference from localStorage on mount
    useEffect(() => {
        const savedMode = localStorage.getItem('darkMode') === 'true';
        setDarkMode(savedMode);
        document.body.classList.toggle('dark-mode', savedMode);
        document.body.classList.toggle('bg-dark', savedMode);
        document.body.classList.toggle('text-white', savedMode);
    }, []);

    // Toggle dark mode and save preference to localStorage
    const toggleDarkMode = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        localStorage.setItem('darkMode', newMode);
        document.body.classList.toggle('dark-mode', newMode);
        document.body.classList.toggle('bg-dark', newMode);
        document.body.classList.toggle('text-white', newMode);
    };

    return (
        <DarkModeContext.Provider value={{ darkMode, toggleDarkMode }}>
            {children}
        </DarkModeContext.Provider>
    );
};