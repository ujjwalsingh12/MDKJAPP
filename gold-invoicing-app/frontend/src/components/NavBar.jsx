import { Link } from 'react-router-dom';

export default function NavBar() {
    return (
        <nav style={{ padding: '1em', backgroundColor: '#f2f2f2' }}>
            <Link to="/">Dashboard</Link> | <Link to="/add">Add Entry</Link> | <Link to="/view/bill">View Bills</Link>
            | <Link to="/view/receipt">View Receipts</Link> | <Link to="/sales">Sales</Link> | <Link to="/stock">Stock</Link>
            {/* Add more links as needed */}
            <Link to="/bills">Bills</Link> | <Link to="/receipt">Receipt</Link>
            <Link to="/UnifiedEntryForm">Unified Entry Form</Link>
            {/* <Link to="/excel">Excel Interface</Link> */}
            {/* <Link to="/create-bill">Create Bill</Link> */}
            <Link to="/receipt-page">Receipt Page</Link>
            <Link to="/entry-dashboard">Entry Dashboard</Link>
        </nav>
    );
}