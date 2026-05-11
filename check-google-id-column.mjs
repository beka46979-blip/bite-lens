import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: 'postgresql://postgres:12345@localhost:5432/bite-lens?schema=public'
});

async function checkColumn() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Проверка колонки google_id...\n');
    
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('google_id', 'name', 'avatar', 'email')
      ORDER BY column_name;
    `);
    
    console.log('📋 Найденные колонки:');
    result.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    
    if (!result.rows.find(r => r.column_name === 'google_id')) {
      console.log('\n❌ Колонка google_id НЕ НАЙДЕНА!');
      console.log('Нужно применить миграцию.');
    } else {
      console.log('\n✅ Колонка google_id существует!');
    }
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkColumn();
