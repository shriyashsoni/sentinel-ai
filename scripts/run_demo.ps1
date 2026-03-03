Set-Location "$PSScriptRoot\.."

$python = "E:/chainlink project '/.venv/Scripts/python.exe"

if (!(Test-Path $python)) {
    Write-Error "Python environment not found at $python"
    exit 1
}

& $python scripts/api_demo_runner.py
if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}

Write-Host "Demo complete. Output: simulation-data/demo_api_result.json"
