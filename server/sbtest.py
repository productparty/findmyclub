import os
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client
import psycopg2

# Load environment variables from server/.env
BASE_DIR = Path(__file__).resolve().parent
load_dotenv(os.path.join(BASE_DIR, '.env'))

def get_db_config(connection_type="direct"):
    """Get database configuration from environment variables"""
    db_password = os.getenv("DB_PASSWORD")
    db_user = os.getenv("DB_USER", "postgres")
    db_name = os.getenv("DB_NAME", "postgres")
    supabase_project_ref = os.getenv("SUPABASE_PROJECT_REF")
    
    if not db_password:
        raise ValueError("DB_PASSWORD environment variable is required")
    
    base_config = {
        "dbname": db_name,
        "sslmode": "require"
    }
    
    if connection_type == "direct":
        db_host = os.getenv("DB_HOST")
        db_port = os.getenv("DB_PORT", "5432")
        
        if not db_host:
            raise ValueError("DB_HOST environment variable is required for direct connection")
        
        base_config.update({
            "user": db_user,
            "password": db_password,
            "host": db_host,
            "port": db_port
        })
    elif connection_type == "transaction":
        db_pooler_host = os.getenv("DB_POOLER_HOST")
        db_pooler_port = os.getenv("DB_POOLER_PORT", "6543")
        
        if not db_pooler_host:
            raise ValueError("DB_POOLER_HOST environment variable is required for transaction pooler")
        if not supabase_project_ref:
            raise ValueError("SUPABASE_PROJECT_REF environment variable is required for pooler connections")
        
        base_config.update({
            "user": f"{db_user}.{supabase_project_ref}",
            "password": db_password,
            "host": db_pooler_host,
            "port": db_pooler_port
        })
    elif connection_type == "session":
        db_pooler_host = os.getenv("DB_POOLER_HOST")
        db_port = os.getenv("DB_PORT", "5432")
        
        if not db_pooler_host:
            raise ValueError("DB_POOLER_HOST environment variable is required for session pooler")
        if not supabase_project_ref:
            raise ValueError("SUPABASE_PROJECT_REF environment variable is required for pooler connections")
        
        base_config.update({
            "user": f"{db_user}.{supabase_project_ref}",
            "password": db_password,
            "host": db_pooler_host,
            "port": db_port
        })
    else:
        raise ValueError(f"Unknown connection type: {connection_type}")
    
    return base_config

def test_direct_connection():
    print("\n=== Testing Direct Connection ===")
    try:
        db_config = get_db_config("direct")
        try_connection(db_config, "Direct")
    except ValueError as e:
        print(f"❌ Configuration error: {e}")

def test_transaction_pooler():
    print("\n=== Testing Transaction Pooler ===")
    try:
        db_config = get_db_config("transaction")
        try_connection(db_config, "Transaction Pooler")
    except ValueError as e:
        print(f"❌ Configuration error: {e}")

def test_session_pooler():
    print("\n=== Testing Session Pooler ===")
    try:
        db_config = get_db_config("session")
        try_connection(db_config, "Session Pooler")
    except ValueError as e:
        print(f"❌ Configuration error: {e}")

def try_connection(config, connection_type):
    print(f"\nTrying {connection_type} connection with:")
    for key, value in config.items():
        if key != "password":
            print(f"{key}: {value}")
    
    try:
        conn = psycopg2.connect(**config)
        with conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) FROM golfclub")
            count = cur.fetchone()[0]
        print(f"✅ {connection_type} connection successful")
        print(f"Number of golf clubs in database: {count}")
        conn.close()
    except Exception as e:
        print(f"❌ {connection_type} connection failed")
        print(f"Error: {str(e)}")

def test_supabase():
    print("\n=== Testing Supabase API Connection ===")
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if not supabase_url or not supabase_key:
        print("❌ Missing required environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")
        return
    
    try:
        supabase = create_client(supabase_url, supabase_key)
        response = supabase.table("golfclub").select("*").limit(1).execute()
        print("✅ Supabase API connection successful")
        print(f"Sample data: {response.data}")
    except Exception as e:
        print("❌ Supabase API connection failed")
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    test_direct_connection()
    test_transaction_pooler()
    test_session_pooler()
    test_supabase()
