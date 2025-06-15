export default function DataTable({ data }) {
    if (!data.length) return <p>No data found.</p>;

    const keys = Object.keys(data[0]);

    return (
        <table border="1" cellPadding="5" style={{ width: '100%', marginTop: '1em' }}>
            <thead>
                <tr>{keys.map(key => <th key={key}>{key}</th>)}</tr>
            </thead>
            <tbody>
                {data.map((row, idx) => (
                    <tr key={idx}>
                        {keys.map(key => <td key={key}>{row[key]}</td>)}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}