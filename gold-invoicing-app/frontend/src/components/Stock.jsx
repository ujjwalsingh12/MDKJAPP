import React from 'react';
import PageTemplate from './PageTemplate';
import ViewTables from './ViewTables';

const Stock = () => {
  const tableHeaders = ['Product', 'Available Quantity'];
  const tableData = [
    ['Product A', 20],
    ['Product B', 10],
    // Add more rows as needed
  ];

  return (
    <div className="container">
      <h1 className="text-center my-4">Stock Management</h1>
      <ViewTables
        tableName="journal" // Replace with the actual table name for stock in your backend
        initialParams={{
          // page_size: 10, // Default page size
          // sort_by: "gstin", // Replace with the actual column name for sorting
          sort_order: "asc", // Default sort order
        }}
      />
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              {tableHeaders.map((header, index) => (
                <th key={index}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
// Using PageTemplate to render the stock page
//   // If you want to use PageTemplate, you can replace the above return with:
//     <PageTemplate title="Stock Page" tableHeaders={tableHeaders} tableData={tableData} />
//   );
// };

export default Stock;
