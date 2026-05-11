import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: 'postgresql://postgres:12345@localhost:5432/bite-lens?schema=public'
});

async function addFields() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Добавление полей для 2FA...\n');
    
    await client.query('BEGIN');
    
    // Добавляем поля для 2FA
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS two_factor_secret VARCHAR(255);
    `);
    
    console.log('✅ Поля для 2FA добавлены!');
    
    await client.query('COMMIT');
    
    // Проверяем результат
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name LIKE '%two_factor%'
      ORDER BY column_name;
    `);
    
    console.log('\n📋 Добавленные колонки:');
    result.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Ошибка:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

addFields();
