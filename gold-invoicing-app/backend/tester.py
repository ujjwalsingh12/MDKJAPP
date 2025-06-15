"""
SQLAlchemy PostgreSQL NOTICE Message Capture
Multiple methods to capture RAISE NOTICE messages from PostgreSQL functions
"""

import logging
from sqlalchemy import create_engine, text, event
from sqlalchemy.orm import sessionmaker
from sqlalchemy.dialects import postgresql
import psycopg2

# Method 1: Using psycopg2 event handlers (Most comprehensive)
class NoticeCapture:
    def __init__(self):
        self.notices = []
    
    def notice_receiver(self, notice):
        """Callback function to capture notices"""
        self.notices.append(notice.message_primary)
        print(f"NOTICE: {notice.message_primary}")
    
    def get_notices(self):
        """Get all captured notices"""
        return self.notices.copy()
    
    def clear_notices(self):
        """Clear the notices list"""
        self.notices.clear()

# Create the notice capture instance
notice_capture = NoticeCapture()

# Method 1a: Engine with notice capture
def create_engine_with_notices(connection_string):
    """Create SQLAlchemy engine that captures NOTICE messages"""
    
    # Create engine
    engine = create_engine(
        connection_string,
        echo=False,  # Set to True for SQL debugging
    )
    
    # Event listener to set up notice handling on each connection
    @event.listens_for(engine, "connect")
    def set_notice_receiver(dbapi_connection, connection_record):
        # Set the notice receiver for psycopg2 connection
        dbapi_connection.add_notice_processor(notice_capture.notice_receiver)
    
    return engine

# Method 1b: Using the engine with notice capture
def call_function_with_notices(engine, function_call):
    """
    Call a PostgreSQL function and capture NOTICE messages
    
    Args:
        engine: SQLAlchemy engine with notice capture
        function_call: SQL function call as string
    
    Returns:
        tuple: (result, notices_list)
    """
    notice_capture.clear_notices()
    
    with engine.connect() as conn:
        # Set client_min_messages to NOTICE
        conn.execute(text("SET client_min_messages TO NOTICE"))
        
        # Execute the function
        result = conn.execute(text(function_call))
        
        # Get the results and notices
        rows = result.fetchall()
        notices = notice_capture.get_notices()
    
    return rows, notices

# Method 2: Using raw psycopg2 with SQLAlchemy-style results
def call_function_raw_psycopg2(connection_string, function_call):
    """
    Call function using raw psycopg2 to guarantee notice capture
    
    Args:
        connection_string: PostgreSQL connection string
        function_call: SQL function call
    
    Returns:
        tuple: (results, notices)
    """
    notices = []
    
    def notice_handler(notice):
        notices.append(str(notice).strip())
        print(f"NOTICE: {notice}")
    
    # Connect using psycopg2 directly
    conn = psycopg2.connect(connection_string)
    conn.add_notice_processor(notice_handler)
    
    try:
        cursor = conn.cursor()
        cursor.execute("SET client_min_messages TO NOTICE")
        cursor.execute(function_call)
        
        # Fetch results
        results = cursor.fetchall()
        column_names = [desc[0] for desc in cursor.description] if cursor.description else []
        
        conn.commit()
        
        return {
            'results': results,
            'columns': column_names,
            'notices': notices
        }
    
    finally:
        conn.close()

# Method 3: Custom SQLAlchemy function caller with logging
def setup_notice_logging():
    """Setup logging to capture notices via Python logging"""
    
    # Create a custom logger for notices
    notice_logger = logging.getLogger('postgresql_notices')
    notice_logger.setLevel(logging.INFO)
    
    # Create handler if not exists
    if not notice_logger.handlers:
        handler = logging.StreamHandler()
        formatter = logging.Formatter('%(asctime)s - NOTICE: %(message)s')
        handler.setFormatter(formatter)
        notice_logger.addHandler(handler)
    
    return notice_logger

# Method 4: Context manager for clean notice handling
class PostgreSQLNoticeSession:
    """Context manager for PostgreSQL sessions with notice capture"""
    
    def __init__(self, engine):
        self.engine = engine
        self.notices = []
        self.connection = None
    
    def __enter__(self):
        self.connection = self.engine.connect()
        # Clear previous notices
        notice_capture.clear_notices()
        # Set notice level
        self.connection.execute(text("SET client_min_messages TO NOTICE"))
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.connection:
            self.connection.close()
    
    def execute_function(self, function_call):
        """Execute function and return results with notices"""
        result = self.connection.execute(text(function_call))
        rows = result.fetchall()
        notices = notice_capture.get_notices()
        return {
            'results': rows,
            'notices': notices
        }

# Example usage functions
def example_usage():
    """Example of how to use the notice capture methods"""
    
    # Your connection string
    CONNECTION_STRING = "postgresql://username:password@localhost:5432/database_name"
    
    print("=== Method 1: SQLAlchemy with Notice Capture ===")
    engine = create_engine_with_notices(CONNECTION_STRING)
    
    # Test the cash function
    function_call = """
    SELECT * FROM unified_insert_journal_entry(
        'cash', 'TEST_GSTIN_123', CURRENT_DATE, false, 'Test cash with notices',
        NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 250.00
    )
    """
    
    try:
        results, notices = call_function_with_notices(engine, function_call)
        
        print("Function Results:")
        for row in results:
            print(f"  {row}")
        
        print(f"\nCaptured {len(notices)} NOTICE messages:")
        for i, notice in enumerate(notices, 1):
            print(f"  {i}. {notice}")
    
    except Exception as e:
        print(f"Error: {e}")
    
    print("\n=== Method 2: Raw psycopg2 ===")
    try:
        result = call_function_raw_psycopg2(CONNECTION_STRING, function_call)
        
        print("Function Results:")
        for row in result['results']:
            print(f"  {row}")
        
        print(f"\nCaptured {len(result['notices'])} NOTICE messages:")
        for i, notice in enumerate(result['notices'], 1):
            print(f"  {i}. {notice}")
    
    except Exception as e:
        print(f"Error: {e}")
    
    print("\n=== Method 3: Context Manager ===")
    try:
        with PostgreSQLNoticeSession(engine) as session:
            result = session.execute_function(function_call)
            
            print("Function Results:")
            for row in result['results']:
                print(f"  {row}")
            
            print(f"\nCaptured {len(result['notices'])} NOTICE messages:")
            for i, notice in enumerate(result['notices'], 1):
                print(f"  {i}. {notice}")
    
    except Exception as e:
        print(f"Error: {e}")

# Utility function to test if notice capture is working
def test_notice_capture(engine):
    """Test function to verify notice capture is working"""
    
    test_function = """
    DO $$
    BEGIN
        RAISE NOTICE 'Test notice message 1';
        RAISE NOTICE 'Test notice message 2 with timestamp: %', NOW();
        RAISE NOTICE 'Test notice message 3';
    END $$;
    """
    
    print("Testing notice capture...")
    results, notices = call_function_with_notices(engine, test_function)
    
    print(f"Captured {len(notices)} test notices:")
    for notice in notices:
        print(f"  - {notice}")
    
    return len(notices) > 0

# Flask/FastAPI integration example
def create_api_function_caller(engine):
    """Create a function caller suitable for API endpoints"""
    
    def call_journal_function(entry_type, gstin, **kwargs):
        """
        API-friendly function caller that returns structured results
        
        Returns:
            dict: {
                'success': bool,
                'data': list,
                'notices': list,
                'error': str or None
            }
        """
        # Build function call
        params = [f"'{entry_type}'", f"'{gstin}'"]
        
        # Add optional parameters
        optional_params = [
            'dated', 'bank', 'remark_text', 'bill_no', 'purity',
            'wt', 'rate', 'cgst', 'sgst', 'igst', 'weight', 'cash_amount'
        ]
        
        for param in optional_params:
            value = kwargs.get(param)
            if value is not None:
                if isinstance(value, str):
                    params.append(f"'{value}'")
                elif isinstance(value, bool):
                    params.append(str(value).lower())
                else:
                    params.append(str(value))
            else:
                params.append('NULL')
        
        function_call = f"SELECT * FROM unified_insert_journal_entry({', '.join(params)})"
        
        try:
            results, notices = call_function_with_notices(engine, function_call)
            
            # Convert results to dictionaries
            data = []
            if results:
                columns = results[0].keys() if hasattr(results[0], 'keys') else []
                data = [dict(zip(columns, row)) if columns else list(row) for row in results]
            
            return {
                'success': True,
                'data': data,
                'notices': notices,
                'error': None
            }
        
        except Exception as e:
            return {
                'success': False,
                'data': [],
                'notices': notice_capture.get_notices(),
                'error': str(e)
            }
    
    return call_journal_function

if __name__ == "__main__":
    # Run example usage
    example_usage()