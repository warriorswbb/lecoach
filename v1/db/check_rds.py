from sqlalchemy import create_engine, text, inspect
import os
from dotenv import load_dotenv
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def check_rds():
    # Load environment variables
    load_dotenv()
    
    # Get RDS connection details
    raw_url = os.getenv('PROD_DATABASE_URL')
    DB_PASSWORD = os.getenv('PROD_DB_PASSWORD')
    DATABASE_URL = raw_url.replace('${PROD_DB_PASSWORD}', DB_PASSWORD)
    
    print(f"\n🔍 Checking RDS connection to: {DATABASE_URL.replace(DB_PASSWORD, '********')}")
    
    try:
        # Create engine
        engine = create_engine(DATABASE_URL)
        
        # Test connection
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version()")).scalar()
            print(f"\n✅ Successfully connected to PostgreSQL version: {result}")
            
            # Get list of all tables
            inspector = inspect(engine)
            tables = inspector.get_table_names()
            print(f"\n📋 Found {len(tables)} tables:")
            
            # Check each table
            for table in tables:
                row_count = conn.execute(text(f"SELECT COUNT(*) FROM {table}")).scalar()
                print(f"   - {table}: {row_count} rows")
                
            # Check database size
            size_query = """
            SELECT pg_size_pretty(pg_database_size(current_database()))
            AS db_size;
            """
            db_size = conn.execute(text(size_query)).scalar()
            print(f"\n💾 Database size: {db_size}")
            
    except Exception as e:
        print(f"\n❌ Error connecting to RDS: {str(e)}")
        raise

if __name__ == "__main__":
    check_rds() 