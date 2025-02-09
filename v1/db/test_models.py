import os
import sys
from pathlib import Path

# Add project root to Python path when running as script
if __name__ == '__main__':
    project_root = str(Path(__file__).parent.parent.parent)
    sys.path.append(project_root)

from sqlalchemy import inspect, MetaData, create_engine
import logging
from v1.db.db import DATABASE_URL, Base
from v1.db.models import *

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def compare_schemas():
    """Compare SQLAlchemy models with actual database schema"""
    
    # Create engine and get actual database metadata
    engine = create_engine(DATABASE_URL)
    inspector = inspect(engine)
    
    # Get all tables from our models
    model_tables = Base.metadata.tables
    
    # Get all tables from database
    db_tables = inspector.get_table_names()
    
    # Compare table names
    model_table_names = set(model_tables.keys())
    db_table_names = set(db_tables)
    
    # Exclude migration and system tables
    excluded_tables = {
        'knex_migrations', 
        'knex_migrations_lock', 
        'test_table',
        'alembic_version'
    }
    db_table_names = db_table_names - excluded_tables
    
    if model_table_names != db_table_names:
        logger.error(f"Missing tables in models: {db_table_names - model_table_names}")
        logger.error(f"Extra tables in models: {model_table_names - db_table_names}")
        return False
    
    # For each table, compare columns
    for table_name in db_table_names:
        logger.info(f"\nChecking table: {table_name}")
        
        # Get database columns
        db_columns = {col['name']: col for col in inspector.get_columns(table_name)}
        
        # Get model columns
        model_columns = {col.name: col for col in model_tables[table_name].columns}
        
        # Compare column names
        if set(db_columns.keys()) != set(model_columns.keys()):
            logger.error(f"Column mismatch in {table_name}:")
            logger.error(f"Missing in model: {set(db_columns.keys()) - set(model_columns.keys())}")
            logger.error(f"Extra in model: {set(model_columns.keys()) - set(db_columns.keys())}")
            return False
        
        # Compare indexes
        db_indexes = {idx['name']: idx for idx in inspector.get_indexes(table_name)}
        model_indexes = model_tables[table_name].indexes
        
        db_index_names = set(db_indexes.keys())
        model_index_names = {idx.name for idx in model_indexes if idx.name}
        
        if db_index_names != model_index_names:
            logger.error(f"Index mismatch in {table_name}:")
            logger.error(f"Missing in model: {db_index_names - model_index_names}")
            logger.error(f"Extra in model: {model_index_names - db_index_names}")
            return False
        
        logger.info(f"✓ Table {table_name} matches database schema")
    
    return True

def main():
    try:
        if compare_schemas():
            logger.info("\n✅ All models match database schema!")
        else:
            logger.error("\n❌ Schema validation failed!")
    except Exception as e:
        logger.error(f"\n❌ Error during validation: {str(e)}")

if __name__ == '__main__':
    main() 