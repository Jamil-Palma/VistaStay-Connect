# Create environment for requirements.txt
Write-Output "Creating 'env_requirements' environment..."
python -m venv env_requirements
& env_requirements\Scripts\Activate
Write-Output "Installing dependencies from requirements.txt..."
pip install -r requirements.txt
if ($LASTEXITCODE -ne 0) {
    Write-Output "Error installing requirements.txt. Please try again."
    exit 1
}
deactivate

# Create environment for requirements2.txt
Write-Output "Creating 'env_requirements2' environment..."
python -m venv env_requirements2
& env_requirements2\Scripts\Activate
Write-Output "Installing dependencies from requirements2.txt..."
pip install -r requirements2.txt
if ($LASTEXITCODE -ne 0) {
    Write-Output "Error installing requirements2.txt. Please try again."
    exit 1
}
deactivate

Write-Output "Environments setup completed successfully."
