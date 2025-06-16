import React from 'react';
import PageTemplate from './PageTemplate';

const Sales = () => {
  const tableHeaders = ['Product', 'Quantity', 'Price', 'Total'];
  const tableData = [
    ['Product A', 10, '$50', '$500'],
    ['Product B', 5, '$30', '$150'],
    // Add more rows as needed
  ];

  return (
    <PageTemplate title="Sales Page" tableHeaders={tableHeaders} tableData={tableData} />
  );
};

export default Sales;
