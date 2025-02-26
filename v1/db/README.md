## database commands

### create new migration
- `alembic revision --autogenerate -m "___________"`

### update db
- `alembic upgrade head`

### start db
- `docker-compose down`
- `docker-compose up --build`


### ...
`test_models.py` - check models against db
`models.py` - db models
`db.py` - test connection
`migrations/versions/` - db migrations


## docker

### Working with local database
- `brew services start postgresql`
- `export DB_ENVIRONMENT=LOCAL  # or edit .env`
- `python your_script.py`

### Switching to Docker
- `brew services stop postgresql`
- `export DB_ENVIRONMENT=DOCKER  # or edit .env`
- `docker-compose up -d`
- `python your_script.py`

### pg dump
- `pg_dump -c -O -U postgres gqldb | docker exec -i v1-db-1 psql -U postgres app`

## Working with RDS Database

### Create migrations
- Create migrations locally: `alembic revision --autogenerate -m "description"`
- Test locally: `alembic upgrade head`

### Apply to RDS
- `export DB_ENVIRONMENT=PROD`
- `alembic upgrade head`