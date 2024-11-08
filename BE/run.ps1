# Run api.py with uvicorn in env_requirements on port 8000
Write-Output "Activating 'env_requirements' and running api.py on port 8000 with uvicorn..."
& env_requirements\Scripts\Activate
uvicorn api:app --reload --loop asyncio --port 8000
if ($LASTEXITCODE -ne 0) {
    Write-Output "Error running api.py with uvicorn. Please check the script and try again."
    exit 1
}
deactivate

# Run guardials.py in env_requirements2 on port 8001
Write-Output "Activating 'env_requirements2' and running guardials.py on port 8001..."
& env_requirements2\Scripts\Activate
python guardials.py --port 8001
if ($LASTEXITCODE -ne 0) {
    Write-Output "Error running guardials.py. Please check the script and try again."
    exit 1
}
deactivate

Write-Output "Scripts executed successfully."
