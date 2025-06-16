# Gold Invoicing and Financial Management Application

This project is a comprehensive **Gold Invoicing and Financial Management Application**, designed with a **three-tier architecture** to handle various financial transactions and customer details.

---

## **1. Architecture Overview**

The application is structured into distinct layers:

- **Database Layer**:  
  - **PostgreSQL** serves as the primary data store, housing the financial schema, tables, and core business logic implemented through stored procedures and functions.

- **Backend Layer**:  
  - A **Python Flask API** acts as the intermediary, exposing endpoints for data management, performing business logic, and interacting with the PostgreSQL database.

- **Frontend Layer**:  
  - A **React-based web application** provides the interactive user interface for data input, visualization, and user interaction.

---

## **2. Backend Application (Python/Flask)**

The backend is built with **Flask**, a Python web framework, responsible for handling all API requests from the frontend and managing data persistence.

### **Core Technologies**

- **Flask** – Web framework
- **SQLAlchemy** – ORM abstraction
- **Psycopg2** – PostgreSQL adapter with `NOTICE` capturing
- **Flask-CORS** – Cross-Origin support
- **Environment Variables** – Dynamic DB connection (`DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, `DB_NAME`)

### **API Structure and Endpoints**

- **Blueprint: `/api/queries`**
  - `GET /api/queries/<table_name>/all`
  - `GET /api/queries/<table_name>/customer/<gstin>`
  - `POST /api/queries/<table_name>/add`
  - `PUT /api/queries/<table_name>/update/<record_id>`
  - `DELETE /api/queries/<table_name>/delete/<record_id>`
  - `POST /api/queries/journal/entry`

- **Blueprint: `/api/entries`**
  - `POST /entries/insert`
  - `POST /entries/delete`

- **Blueprint: `/api/customers`**
  - `GET /customer/health`

### **Database Interaction**

- **Explicit Transaction Management**: 
  - Python wrappers handle `conn.begin()`, `trans.commit()`, `trans.rollback()`.

- **Python Wrapper: `unified_insert_journal_entry`**
  - Validates input
  - Handles `remark` insertion
  - Executes main DB function with parameterized queries

- **Convenience Wrappers**
  - `insert_bill_entry`, `insert_cash_entry`, `insert_stock_entry`, `insert_remark_entry`

- **Diagnostic Functions**
  - `diagnose_cash_table()`, `test_cash_insert()`

---

## **3. PostgreSQL Financial Schema & Functions**

PostgreSQL contains the core schema and business logic.

### **Core Tables**

- `bill`, `cash`, `stock`, `gold`, `remarks`, `customer_details`, `journal`, `journal_entry`

### **Key Functions**

- `unified_insert_journal_entry`  
  - Main function for inserting entries of all types  
  - Handles validation, inserts into corresponding table, logs in `journal`  
  - Returns success/failure and `entry_id`

- `delete_cash_entry(p_id, p_gstin)`
- `log_journal_entry(...)`
- `update_cash_entry(...)`
- `diagnose_cash_table()`, `test_cash_insert()`

### **Data Integrity**

- **Primary Keys**
- **Foreign Keys** linking `gstin`, `remark_id`
- **Check Constraints** on `entry_type` and more

---

## **4. Frontend Application (React)**

Built with **React + Vite**, providing a smooth and responsive UI.

### **Core Technologies**

- **React**, **Vite**, **Axios**, **React Router DOM**, **Bootstrap**

### **Main Components**

- **`UnifiedEntryForm.jsx`**
  - Dynamic form based on `entryType`
  - Submits to `/api/queries/journal/entry`

- **`Receipt.jsx` / `ReceiptPage.jsx`**
  - Fetches `customer_details`
  - Inline-editable bill items
  - Performs real-time calculations (taxes, totals)
  - Auto-creates customer if `GSTIN` not found
  - Print functionality

- **`ViewRecords.jsx`**
  - Fetches and displays any table's data

- **`Bills.jsx`**
  - Mock-based component for viewing and editing bills

- **`ExcelInterface.jsx`**
  - Excel-like grid UI for mock table editing

- **Navigation**
  - `NavBar.jsx`, `Sidebar.jsx`

---

## **5. Key Business Logic Flow (Unified Journal Entry)**

The core unified transaction flow:

1. **Frontend**: User inputs data via `UnifiedEntryForm` or `Receipt`
2. **API Request**: Frontend sends `POST` request to `/api/queries/journal/entry`
3. **Backend**: Flask receives request → calls `unified_insert_journal_entry` Python wrapper
4. **Transaction**: Explicit `BEGIN` transaction
5. **PostgreSQL**: Runs `unified_insert_journal_entry`
    - Validates inputs
    - Inserts `remarks` if any
    - Inserts into correct table
    - Logs in `journal`
    - Raises `NOTICE` for step debugging
6. **Response**: On success → commit + return `entry_id`
7. **Frontend Update**: Updates UI with response

---

## **Things to Remember**

### **Database Dumping & Loading**

1. **Create DB Dump**
    ```bash
    docker exec -t gold_pg pg_dump -U postgres gold_db > gold_db_dump.sql
    ```

2. **Copy SQL to Docker**
    ```bash
    docker cp schema_dump.sql gold_pg:/sql_dump.sql
    ```

3. **Open Bash in Container**
    ```bash
    docker exec -it gold_pg bash
    ```

4. **Load SQL Dump**
    ```bash
    psql -U postgres -d gold_db -f /sql_dump.sql
    ```

### **Sample Data**
- Refer to `sampledata.sql`

### **PostgreSQL CLI in Docker**
```bash
docker exec -it gold_pg psql -U postgres -d gold_db
```

---

### **Docker Commands**

- **Stop and Clean**
    ```bash
    docker-compose down --volumes --remove-orphans
    ```

- **Build and Start**
    ```bash
    docker-compose up --build
    ```

---
