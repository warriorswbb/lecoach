import os
import subprocess
import sys

def apply_migrations():
    # Set environment to production
    os.environ['DB_ENVIRONMENT'] = 'PROD'
    
    # Get current revision
    current = subprocess.check_output(
        ['alembic', 'current']
    ).decode('utf-8').strip()
    print(f"Current database revision: {current}")
    
    # Get migration target
    target = subprocess.check_output(
        ['alembic', 'heads']
    ).decode('utf-8').strip()
    print(f"Target revision: {target}")
    
    # Check if we need to migrate
    if current == target:
        print("Database is up to date. No migrations needed.")
        return
    
    # Confirm before proceeding
    confirmation = input("Apply migrations to RDS database? (yes/no): ")
    if confirmation.lower() != 'yes':
        print("Migration cancelled.")
        return
    
    # Run migration
    try:
        print("Applying migrations...")
        subprocess.check_call(['alembic', 'upgrade', 'head'])
        print("Migrations successfully applied.")
    except subprocess.CalledProcessError as e:
        print(f"Migration failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    apply_migrations() 