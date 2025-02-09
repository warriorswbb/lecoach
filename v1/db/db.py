from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.exc import SQLAlchemyError
import os
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

# Get database URL from environment variables
DATABASE_URL = os.getenv('DATABASE_URL')

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
