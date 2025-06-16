import React from 'react';
import PageTemplate from './PageTemplate';

const Stock = () => {
  const tableHeaders = ['Product', 'Available Quantity'];
  const tableData = [
    ['Product A', 20],
    ['Product B', 10],
    // Add more rows as needed
  ];

  return (
    <PageTemplate title="Stock Page" tableHeaders={tableHeaders} tableData={tableData} />
  );
};

export default Stock;
