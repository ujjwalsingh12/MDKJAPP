import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import DataTable from '../components/DataTable';

export default function ViewRecords() {
    const { table } = useParams();
    const [records, setRecords] = useState([]);

    useEffect(() => {
        axios.get(`http://localhost:5003/api/queries/${table}/all`)
            .then(res => setRecords(res.data || []))
            // .then(res => console.log(res.data))
            .catch(err => console.error(err));
    }, [table]);

    return (
        <div>
            <h2>Viewing Records: {table}</h2>
            <DataTable data={records} />
        </div>
    );
}