## database commands

### create new migration
- `alembic revision --autogenerate -m "___________"

### update db
- `alembic upgrade head`



### ...
`test_models.py` - check models against db
`models.py` - db models
`db.py` - test connection
`migrations/versions/` - db migrations