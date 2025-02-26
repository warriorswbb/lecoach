from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.exc import SQLAlchemyError
import os
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

# Get database URL based on environment
DB_ENVIRONMENT = os.getenv('DB_ENVIRONMENT', 'LOCAL')
if DB_ENVIRONMENT == 'DOCKER':
    DATABASE_URL = os.getenv('DOCKER_DATABASE_URL')
elif DB_ENVIRONMENT == 'PROD':
    # Handle production database
    raw_url = os.getenv('PROD_DATABASE_URL')
    DB_PASSWORD = os.getenv('PROD_DB_PASSWORD')
    DATABASE_URL = raw_url.replace('${PROD_DB_PASSWORD}', DB_PASSWORD)
else:
    DATABASE_URL = os.getenv('LOCAL_DATABASE_URL')

# Create the SQLAlchemy engine
engine = create_engine(DATABASE_URL)

# Create a base class for declarative models
Base = declarative_base()

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def get_db():
    """
    Get database session with automatic closing
    """
    db = SessionLocal()
    try:
        yield db
        logger.debug("Database session created successfully")
    except SQLAlchemyError as e:
        logger.error(f"Database error occurred: {str(e)}")
        raise
    finally:
        db.close()
        logger.debug("Database session closed")

# Add connection logging
try:
    engine.connect()
    logger.info("Database connection established successfully")
except SQLAlchemyError as e:
    logger.error(f"Failed to connect to database: {str(e)}")
    raise

def test_db_connection():
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            print("Database connection test successful!")
            # Test if we can create tables
            Base.metadata.create_all(engine)
            print("Database tables created successfully!")
    except Exception as e:
        print(f"Database connection test failed: {str(e)}")

# Call the test function
test_db_connection()
