-- Database initialization script for Miami School Bus Service
-- This script will be run when the PostgreSQL container starts

-- Create the database if it doesn't exist
-- (This is handled by the POSTGRES_DB environment variable)

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE bus_service TO bus_user;

-- The Flask application will create the tables using SQLAlchemy
-- when it starts up for the first time

