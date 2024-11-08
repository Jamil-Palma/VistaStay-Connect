#!/bin/bash

# Create environment for requirements.txt
echo "Creating 'env_requirements' environment..."
python3 -m venv env_requirements
source env_requirements/bin/activate
echo "Installing dependencies from requirements.txt..."
if ! pip install -r requirements.txt; then
    echo "Error installing requirements.txt. Please try again."
    exit 1
fi
deactivate

# Create environment for requirements2.txt
echo "Creating 'env_requirements2' environment..."
python3 -m venv env_requirements2
source env_requirements2/bin/activate
echo "Installing dependencies from requirements2.txt..."
if ! pip install -r requirements2.txt; then
    echo "Error installing requirements2.txt. Please try again."
    exit 1
fi
deactivate

echo "Environments setup completed successfully."
