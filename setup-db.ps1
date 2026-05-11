# 🗄️ Database Setup Script for Bite Lens (PowerShell)

Write-Host "🚀 Starting database setup..." -ForegroundColor Cyan

# Check if .env exists
if (-not (Test-Path .env)) {
    Write-Host "❌ Error: .env file not found!" -ForegroundColor Red
    Write-Host "📝 Please create .env file with DATABASE_URL" -ForegroundColor Yellow
    Write-Host '   Example: DATABASE_URL="postgresql://postgres:postgres@localhost:5432/bite_lens?schema=public"' -ForegroundColor Yellow
    exit 1
}

# Check if DATABASE_URL is set
$envContent = Get-Content .env -Raw
if ($envContent -notmatch "DATABASE_URL=") {
    Write-Host "❌ Error: DATABASE_URL not found in .env file!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ .env file found" -ForegroundColor Green

# Generate Prisma Client
Write-Host "📦 Generating Prisma Client..." -ForegroundColor Cyan
npx prisma generate

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to generate Prisma Client" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Prisma Client generated" -ForegroundColor Green

# Run migrations
Write-Host "🔄 Running database migrations..." -ForegroundColor Cyan
npx prisma migrate deploy

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to run migrations" -ForegroundColor Red
    Write-Host "💡 Make sure:" -ForegroundColor Yellow
    Write-Host "   1. PostgreSQL is running" -ForegroundColor Yellow
    Write-Host "   2. Database credentials in .env are correct" -ForegroundColor Yellow
    Write-Host "   3. Database 'bite_lens' exists" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Migrations completed successfully" -ForegroundColor Green

# Optional: Open Prisma Studio
$response = Read-Host "🎨 Do you want to open Prisma Studio? (y/n)"
if ($response -eq 'y' -or $response -eq 'Y') {
    npx prisma studio
}

Write-Host "🎉 Database setup complete!" -ForegroundColor Green
Write-Host "📖 For more information, see MIGRATION_GUIDE.md" -ForegroundColor Cyan
