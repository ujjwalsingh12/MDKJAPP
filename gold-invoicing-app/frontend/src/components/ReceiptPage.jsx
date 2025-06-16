import React, { useState, useMemo, useRef } from 'react';
import ReactDOMServer from 'react-dom/server';
import BillHeaderForm from './BillHeaderForm';
import ItemsTable from './ItemsTable';
import TaxSummary from './TaxSummary';
import PrintPreview from './PrintPreview';
// import { calculateTotals } from './utils';
import { containerStyle } from './styles';
// import { useReactToPrint } from 'react-to-print';
import BillPreview from './BillPreview';



function calculateTotals({
    items,
    cgstRate,
    sgstRate,
    igstRate,
    hallmarkingCharges,
    hallmarkingPieces,
    hallmarkingCgst,
    hallmarkingSgst,
    discount
}) {
    const totalAmount = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const totalTaxable = totalAmount;
    const cgstAmount = (cgstRate / 100) * totalAmount;
    const sgstAmount = (sgstRate / 100) * totalAmount;
    const igstAmount = (igstRate / 100) * totalAmount;

    const hallmarkingTotal = hallmarkingCharges * hallmarkingPieces;
    const hallmarkingCgstAmt = (hallmarkingCgst / 100) * hallmarkingTotal;
    const hallmarkingSgstAmt = (hallmarkingSgst / 100) * hallmarkingTotal;

    const grandTotal =
        totalAmount +
        cgstAmount +
        sgstAmount +
        igstAmount +
        hallmarkingTotal +
        hallmarkingCgstAmt +
        hallmarkingSgstAmt -
        discount;

    return {
        totalTaxable,
        totalAmount,
        cgstAmount,
        sgstAmount,
        igstAmount,
        hallmarkingTotal,
        hallmarkingCgstAmt,
        hallmarkingSgstAmt,
        grandTotal
    };
}


// Dummy customer data for autocomplete (move to a shared file if needed)
const dummyCustomers = [
    {
        id: 1,
        name: 'Rajesh Kumar',
        phone: '+91 98765 43210',
        address: '123 MG Road\nKanpur, UP 208001',
        email: 'rajesh.kumar@email.com'
    },
    {
        id: 2,
        name: 'Priya Sharma',
        phone: '+91 87654 32109',
        address: '456 Civil Lines\nKanpur, UP 208002',
        email: 'priya.sharma@email.com'
    },
    {
        id: 3,
        name: 'Amit Gupta',
        phone: '+91 76543 21098',
        address: '789 Swaroop Nagar\nKanpur, UP 208003',
        email: 'amit.gupta@email.com'
    },
    {
        id: 4,
        name: 'Sunita Verma',
        phone: '+91 65432 10987',
        address: '321 Kalyanpur\nKanpur, UP 208004',
        email: 'sunita.verma@email.com'
    },
    {
        id: 5,
        name: 'Vikram Singh',
        phone: '+91 54321 09876',
        address: '654 Govind Nagar\nKanpur, UP 208005',
        email: 'vikram.singh@email.com'
    }
];


const defaultItem = () => ({
    id: Date.now(),
    description: 'New Gold Ornaments',
    hsnSac: '7113',
    purity: '18 CT',
    weight: 0,
    rate: 7200.00,
    amount: 0,
    isEditing: false
});

const ReceiptPage = () => {
    // --- Bill Header State ---
    const [billHeader, setBillHeader] = useState({
        customerName: '',
        customerPhone: '',
        customerAddress: '',
        customerEmail: '',
        billNumber: 'BILL-' + Date.now().toString().slice(-6),
        date: new Date().toISOString().slice(0, 10)
    });

    // --- Customer Autocomplete State ---
    const [customerSearchTerm, setCustomerSearchTerm] = useState('');
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

    // --- Items State ---
    const [items, setItems] = useState([
        defaultItem()
    ]);
    const [total, setTotal] = useState(0);
    const [selectedRowIndex, setSelectedRowIndex] = useState(null);

    // --- Tax/Charges State ---
    const [cgstRate, setCgstRate] = useState(1.5);
    const [sgstRate, setSgstRate] = useState(1.5);
    const [igstRate, setIgstRate] = useState(0);
    const [hallmarkingCharges, setHallmarkingCharges] = useState(45.00);
    const [hallmarkingPieces, setHallmarkingPieces] = useState(0);
    const [hallmarkingCgst, setHallmarkingCgst] = useState(9);
    const [hallmarkingSgst, setHallmarkingSgst] = useState(9);
    const [discount, setDiscount] = useState(0);



    // --- Store Info ---
    const storeInfo = {
        pagetype: 'TAX INVOICE',
        storeName: 'MDKJ JEWELLERS',
        storeAddress: 'Shop No. 45, Birhana Road\nKanpur, Uttar Pradesh 208001',
        phone: '+91 98765 12345',
        email: 'mdkjjewellers@gmail.com'
    };

    const handleHallmarkingChargesChange = (hallmarkingCharges) => {
        setHallmarkingCharges(hallmarkingCharges);
        const total = hallmarkingCharges * hallmarkingPieces;
        // setHallmarkingCgst((total * hallmarkingCgst) / 100);
        // setHallmarkingSgst((total * hallmarkingSgst) / 100);
    };
    const handleHallmarkingPiecesChange = (hallmarkingPieces) => {
        setHallmarkingPieces(hallmarkingPieces);
        const total = hallmarkingCharges * hallmarkingPieces;
        // setHallmarkingCgst((total * hallmarkingCgst) / 100);
        // setHallmarkingSgst((total * hallmarkingSgst) / 100);
    };


    // --- Customer Autocomplete Logic ---
    const filteredCustomers = useMemo(() => {
        if (!customerSearchTerm) return dummyCustomers;
        return dummyCustomers.filter(customer =>
            customer.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
            customer.phone.includes(customerSearchTerm)
        );
    }, [customerSearchTerm]);

    const handleCustomerSelect = (customer) => {
        setBillHeader(prev => ({
            ...prev,
            customerName: customer.name,
            customerPhone: customer.phone,
            customerAddress: customer.address,
            customerEmail: customer.email
        }));
        setCustomerSearchTerm(customer.name);
        setShowCustomerDropdown(false);
    };

    const handleCustomerSearch = (value) => {
        setCustomerSearchTerm(value);
        setBillHeader(prev => ({ ...prev, customerName: value }));
        setShowCustomerDropdown(value.length > 0);
    };

    // --- Bill Header Change Handler ---
    const handleHeaderChange = (field, value) => {
        setBillHeader(prev => ({ ...prev, [field]: value }));
    };

    // --- Items Logic (auto-calc amount, edit/save, add/delete, keyboard nav) ---
    const handleItemChange = (rowIndex, field, value) => {
        const updatedItems = [...items];
        if (field === 'weight' || field === 'rate') {
            const numValue = parseFloat(value) || 0;
            updatedItems[rowIndex][field] = numValue;
            updatedItems[rowIndex].amount = (parseFloat(updatedItems[rowIndex].weight) || 0) * (parseFloat(updatedItems[rowIndex].rate) || 0);
        } else if (field === 'amount') {
            updatedItems[rowIndex][field] = parseFloat(value) || 0;
        } else {
            updatedItems[rowIndex][field] = value;
        }
        setItems(updatedItems);
    };

    const handleEditClick = (rowIndex) => {
        const updatedItems = [...items];
        updatedItems[rowIndex].isEditing = !updatedItems[rowIndex].isEditing;
        setItems(updatedItems);
    };

    const handleAddRow = () => {
        const newRowIndex = selectedRowIndex !== null ? selectedRowIndex + 1 : items.length;
        const updatedItems = [...items];
        updatedItems.splice(newRowIndex, 0, {
            ...defaultItem(),
            id: Date.now(),
            isEditing: true
        });
        setItems(updatedItems);
        setSelectedRowIndex(newRowIndex);
    };

    const handleDeleteRow = (rowIndex) => {
        if (items.length > 1) {
            const updatedItems = items.filter((_, idx) => idx !== rowIndex);
            setItems(updatedItems);
        }
    };

    const handleKeyDown = (event, rowIndex, field) => {
        if (event.key === 'Enter') {
            handleEditClick(rowIndex);
        } else if (event.key === 'Tab') {
            event.preventDefault();
            const fields = ['description', 'hsnSac', 'purity', 'weight', 'rate', 'amount'];
            const currentFieldIndex = fields.indexOf(field);

            if (currentFieldIndex < fields.length - 1) {
                const nextField = fields[currentFieldIndex + 1];
                const nextInput = document.querySelector(`input[data-row="${rowIndex}"][data-field="${nextField}"]`);
                if (nextInput) nextInput.focus();
            } else if (rowIndex < items.length - 1) {
                const nextInput = document.querySelector(`input[data-row="${rowIndex + 1}"][data-field="description"]`);
                if (nextInput) nextInput.focus();
            }
        }
    };

    // --- Calculations ---
    const calculations = useMemo(() => {
        return calculateTotals({
            items,
            cgstRate,
            sgstRate,
            igstRate,
            hallmarkingCharges,
            hallmarkingPieces,
            hallmarkingCgst,
            hallmarkingSgst,
            discount
        });
    }, [
        items,
        cgstRate,
        sgstRate,
        igstRate,
        hallmarkingCharges,
        hallmarkingPieces,
        hallmarkingCgst,
        hallmarkingSgst,
        discount
    ]);

    // --- Print Handler ---

    const componentRef = useRef(null);
    // const handlePrint = useReactToPrint({
    //     contentRef: componentRef,
    //     documentTitle: 'MDKJ_Receipt',
    //     copyStyles: true,
    // });

    const containerStyle = {
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#f8f9fa'
    };

    const headerSectionStyle = {
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    };

    const formGridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px'
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '5px',
        fontWeight: 'bold',
        color: '#333'
    };

    const inputStyle = {
        width: '100%',
        padding: '8px 12px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '14px'
    };

    const customerDropdownStyle = {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: 'white',
        border: '1px solid #ddd',
        borderTop: 'none',
        borderRadius: '0 0 4px 4px',
        maxHeight: '200px',
        overflowY: 'auto',
        zIndex: 1000
    };

    const customerOptionStyle = {
        padding: '10px',
        cursor: 'pointer',
        borderBottom: '1px solid #eee'
    };

    const billPreviewStyle = {
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    };

    const tableStyle = {
        width: '100%',
        borderCollapse: 'collapse',
        margin: '20px 0'
    };

    const thStyle = {
        border: '1px solid #ddd',
        padding: '12px',
        backgroundColor: '#f5f5f5',
        fontWeight: 'bold',
        textAlign: 'left'
    };

    const tdStyle = {
        border: '1px solid #ddd',
        padding: '8px'
    };

    const controlsStyle = {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '15px',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    };

    const buttonStyle = {
        padding: '8px 16px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px'
    };

    const editButtonStyle = {
        ...buttonStyle,
        backgroundColor: '#007bff',
        color: 'white',
        marginRight: '5px'
    };

    const saveButtonStyle = {
        ...buttonStyle,
        backgroundColor: '#28a745',
        color: 'white',
        marginRight: '5px'
    };

    const deleteButtonStyle = {
        ...buttonStyle,
        backgroundColor: '#dc3545',
        color: 'white'
    };

    const billInfo = {
        storeName: storeInfo.storeName,
        storeAddress: storeInfo.storeAddress,
        phone: storeInfo.phone,
        email: storeInfo.email,
        billNumber: billHeader.billNumber,
        date: billHeader.date,
        customerName: billHeader.customerName,
        customerPhone: billHeader.customerPhone,
        customerAddress: billHeader.customerAddress,
        customerEmail: billHeader.customerEmail
    };

    return (<div style={containerStyle}>
        {/* --- Bill Header Form Section --- */}
        <div style={{ marginBottom: '40px' }}>
            <BillHeaderForm
                billHeader={billHeader}
                onChange={setBillHeader}
                customerSearchTerm={customerSearchTerm}
                onCustomerSearch={handleCustomerSearch}
                filteredCustomers={filteredCustomers}
                showCustomerDropdown={showCustomerDropdown}
                onCustomerSelect={handleCustomerSelect}
                setShowCustomerDropdown={setShowCustomerDropdown}
            />
        </div>

        {/* --- Bill Preview Section --- */}
        <div style={{ marginBottom: '40px' }}>
            <BillPreview
                items={items}
                setItems={setItems}
                total={total}
                selectedRowIndex={selectedRowIndex}
                setSelectedRowIndex={setSelectedRowIndex}
                calculations={calculations}
                cgstRate={cgstRate}
                sgstRate={sgstRate}
                igstRate={igstRate}
                hallmarkingCharges={hallmarkingCharges}
                hallmarkingPieces={hallmarkingPieces}
                hallmarkingCgst={hallmarkingCgst}
                hallmarkingSgst={hallmarkingSgst}
                discount={discount}
                storeInfo={storeInfo}
                billHeader={billHeader}
                onTotalChange={setTotal}
                onChange={handleItemChange}
                onAdd={handleAddRow}
                onDelete={handleDeleteRow}
                onEditClick={handleEditClick}
                onKeyDown={handleKeyDown}
                onCgstChange={setCgstRate}
                onSgstChange={setSgstRate}
                onIgstChange={setIgstRate}
                onHallmarkingCgstChange={setHallmarkingCgst}
                onHallmarkingSgstChange={setHallmarkingSgst}
                onHallmarkingChange={handleHallmarkingChargesChange}
                onPiecesChange={handleHallmarkingPiecesChange}
                onDiscountChange={setDiscount}
            />


        </div>

        {/* --- Action Buttons Section --- */}
        {/* <div style={controlsStyle}>
            <button
                onClick={handlePrint}
                style={{
                    ...buttonStyle,
                    backgroundColor: '#333',
                    color: 'white',
                    fontSize: '16px',
                    padding: '10px 20px',
                    transition: 'background-color 0.3s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#555')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#333')}
            >
                Print Receipt
            </button>
        </div>

        {/* --- Hidden Print Preview --- */}
        {/* <div style={{ display: 'none' }}>
            <PrintPreview
                ref={componentRef}
                billHeader={billHeader}
                items={items}
                calculations={calculations}
                storeInfo={storeInfo}
            />
        </div>  */}
    </div>);
};

export default ReceiptPage;