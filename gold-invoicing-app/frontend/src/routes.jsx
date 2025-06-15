// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
// import AddEntry from './pages/AddEntry';
// import ViewRecords from './pages/ViewRecords';
// import NavBar from './components/NavBar';

// const AppRoutes = () => (
//     <Router>

//         <NavBar />
//         <Dashboard />
//         <Routes>
//             <Route path="/" element={<Dashboard />} />
//             <Route path="/add" element={<AddEntry />} />
//             <Route path="/view/:table" element={<ViewRecords />} />
//         </Routes>
//     </Router>
// );

const AppRoutes = () => (
    <Dashboard />
);

export default AppRoutes;