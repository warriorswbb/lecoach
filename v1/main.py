from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from db.db import get_db
from db.models import Base, Team, Player, Game
from db.db import engine
from sqlalchemy import text

# Create the FastAPI app
app = FastAPI()

# Create database tables
Base.metadata.create_all(bind=engine)

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    try:
        # Test database connection using text()
        db.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": str(e)} 