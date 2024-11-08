#!/bin/bash

# Run api.py with uvicorn in env_requirements on port 8000
echo "Activating 'env_requirements' and running api.py on port 8000 with uvicorn..."
source env_requirements/bin/activate
if ! uvicorn api:app --reload --loop asyncio --port 8000; then
    echo "Error running api.py with uvicorn. Please check the script and try again."
    exit 1
fi
deactivate

# Run guardials.py in env_requirements2 on port 8001
echo "Activating 'env_requirements2' and running guardials.py on port 8001..."
source env_requirements2/bin/activate
if ! python guardials.py --port 8001; then
    echo "Error running guardials.py. Please check the script and try again."
    exit 1
fi
deactivate

echo "Scripts executed successfully."
