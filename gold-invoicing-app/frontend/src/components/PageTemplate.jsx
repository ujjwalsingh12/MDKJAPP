import React from 'react';

/**
 * Renders a page template with a title and a table.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {string} props.title - The title to display above the table.
 * @param {string[]} props.tableHeaders - An array of strings representing the table headers.
 * @param {Array<Array<React.ReactNode>>} props.tableData - A 2D array representing the table rows and cells.
 * @returns {JSX.Element} The rendered page template component.
 */
const PageTemplate = ({ title, tableHeaders, tableData }) => {
  return (
    <div className="page-container p-4">
      <h2>{title}</h2>
      <table className="table table-bordered mt-3">
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
  );
};

export default PageTemplate;
