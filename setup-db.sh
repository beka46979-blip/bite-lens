#!/bin/bash

# 🗄️ Database Setup Script for Bite Lens

echo "🚀 Starting database setup..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "📝 Please create .env file with DATABASE_URL"
    echo "   Example: DATABASE_URL=\"postgresql://postgres:postgres@localhost:5432/bite_lens?schema=public\""
    exit 1
fi

# Check if DATABASE_URL is set
if ! grep -q "DATABASE_URL=" .env; then
    echo "❌ Error: DATABASE_URL not found in .env file!"
    exit 1
fi

echo "✅ .env file found"

# Generate Prisma Client
echo "📦 Generating Prisma Client..."
npx prisma generate

if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma Client"
    exit 1
fi

echo "✅ Prisma Client generated"

# Run migrations
echo "🔄 Running database migrations..."
npx prisma migrate deploy

if [ $? -ne 0 ]; then
    echo "❌ Failed to run migrations"
    echo "💡 Make sure:"
    echo "   1. PostgreSQL is running"
    echo "   2. Database credentials in .env are correct"
    echo "   3. Database 'bite_lens' exists"
    exit 1
fi

echo "✅ Migrations completed successfully"

# Optional: Open Prisma Studio
read -p "🎨 Do you want to open Prisma Studio? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npx prisma studio
fi

echo "🎉 Database setup complete!"
echo "📖 For more information, see MIGRATION_GUIDE.md"
