import { Link } from 'react-router-dom';

export default function NavBar() {
    return (
        <nav style={{ padding: '1em', backgroundColor: '#f2f2f2' }}>
            <Link to="/">Dashboard</Link> | <Link to="/add">Add Entry</Link> | <Link to="/view/bill">View Bills</Link>
        </nav>
    );
}