import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function testPendingRegistrations() {
  try {
    console.log('🧪 Testing pending_registrations table...\n');

    // Test 1: Check if table exists
    console.log('1️⃣ Checking if table exists...');
    const tableCheck = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'pending_registrations'
      );
    `;
    console.log('✅ Table exists:', tableCheck[0].exists);

    // Test 2: Check table structure
    console.log('\n2️⃣ Checking table structure...');
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'pending_registrations'
      ORDER BY ordinal_position;
    `;
    console.log('📋 Columns:');
    columns.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });

    // Test 3: Check indexes
    console.log('\n3️⃣ Checking indexes...');
    const indexes = await prisma.$queryRaw`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'pending_registrations';
    `;
    console.log('🔍 Indexes:');
    indexes.forEach(idx => {
      console.log(`   - ${idx.indexname}`);
    });

    // Test 4: Try to insert and delete a test record
    console.log('\n4️⃣ Testing insert/delete operations...');
    const testId = crypto.randomUUID();
    const testEmail = `test-${Date.now()}@example.com`;
    
    await prisma.pending_registrations.create({
      data: {
        id: testId,
        email: testEmail,
        password_hash: 'test_hash',
        verification_code: '123456',
        code_expires_at: new Date(Date.now() + 15 * 60 * 1000),
      },
    });
    console.log('✅ Insert successful');

    const found = await prisma.pending_registrations.findUnique({
      where: { email: testEmail },
    });
    console.log('✅ Read successful:', found ? 'Record found' : 'Record not found');

    await prisma.pending_registrations.delete({
      where: { email: testEmail },
    });
    console.log('✅ Delete successful');

    console.log('\n🎉 All tests passed! The pending_registrations table is working correctly.');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

testPendingRegistrations();
