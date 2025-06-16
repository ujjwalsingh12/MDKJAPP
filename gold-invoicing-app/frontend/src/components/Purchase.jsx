import React from 'react';
import ExcelInterface from './ExcelInterface';
// import Apps from './Apps';

/**
 * Purchase component renders an Excel-like interface for managing purchase data.
 *
 * @component
 * @returns {JSX.Element} The rendered ExcelInterface component with purchase data.
 */
const Purchase = () => {
  const columns = [
    { key: 'Product', label: 'Product' },
    { key: 'Quantity', label: 'Quantity' },
    { key: 'Price', label: 'Price' },
    { key: 'Total', label: 'Total' },
  ];

  const initialData = [
    { id: 1, product: 'Product X', quantity: 8, price: '$40', total: '$320', isEditing: false },
    { id: 2, product: 'Product Y', quantity: 15, price: '$25', total: '$375', isEditing: false },
    // Add more rows as needed
  ];

  return (
    <ExcelInterface columns={columns} initialData={initialData} />
    // <Apps />
  );
};

export default Purchase;
