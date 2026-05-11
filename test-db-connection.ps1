# Test Database Connection Script

Write-Host "Testing PostgreSQL connection..." -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (-not (Test-Path .env)) {
    Write-Host "[ERROR] .env file not found!" -ForegroundColor Red
    exit 1
}

# Read DATABASE_URL from .env
$envContent = Get-Content .env -Raw
if ($envContent -match 'DATABASE_URL="(.+)"') {
    $dbUrl = $matches[1]
    Write-Host "[OK] DATABASE_URL found in .env" -ForegroundColor Green
    Write-Host ""
    Write-Host "Connection string: $dbUrl" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "[ERROR] DATABASE_URL not found in .env!" -ForegroundColor Red
    exit 1
}

# Check if PostgreSQL service is running
Write-Host "Checking PostgreSQL service..." -ForegroundColor Cyan
$pgServices = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue

if ($pgServices) {
    foreach ($service in $pgServices) {
        $status = $service.Status
        $statusColor = if ($status -eq "Running") { "Green" } else { "Red" }
        Write-Host "  $($service.Name): $status" -ForegroundColor $statusColor
    }
    Write-Host ""
} else {
    Write-Host "[WARNING] PostgreSQL service not found in Windows Services" -ForegroundColor Yellow
    Write-Host "  PostgreSQL might not be installed or running via Docker" -ForegroundColor Yellow
    Write-Host ""
}

# Test connection using Prisma
Write-Host "Testing connection with Prisma..." -ForegroundColor Cyan
$output = npx prisma db pull 2>&1 | Out-String
$exitCode = $LASTEXITCODE

if ($exitCode -eq 0) {
    Write-Host "[SUCCESS] Connection successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your database is ready for migration!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Run: npm run db:migrate" -ForegroundColor White
    Write-Host "  2. Run: npm run db:generate" -ForegroundColor White
    Write-Host "  3. Run: npm run db:studio (optional)" -ForegroundColor White
} else {
    Write-Host "[FAILED] Connection failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error details:" -ForegroundColor Yellow
    Write-Host $output -ForegroundColor Red
    Write-Host ""
    Write-Host "Common solutions:" -ForegroundColor Cyan
    Write-Host "  1. Check if PostgreSQL is running" -ForegroundColor White
    Write-Host "  2. Verify password in .env is correct" -ForegroundColor White
    Write-Host "  3. Make sure database exists" -ForegroundColor White
    Write-Host "  4. Check firewall settings" -ForegroundColor White
    Write-Host ""
    Write-Host "See TROUBLESHOOTING.md for detailed help" -ForegroundColor Cyan
}
