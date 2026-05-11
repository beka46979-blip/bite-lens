import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: 'postgresql://postgres:12345@localhost:5432/bite-lens?schema=public'
});

async function applyMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Применяю миграцию...');
    
    // Проверяем текущую структуру
    const checkColumns = await client.query(`
      SELECT column_name, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('password_hash', 'google_id', 'name', 'avatar', 'gender')
      ORDER BY column_name;
    `);
    
    console.log('📋 Текущие колонки:', checkColumns.rows);
    
    // Применяем миграцию по частям
    await client.query('BEGIN');
    
    try {
      // 1. Делаем password_hash nullable
      await client.query('ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL');
      console.log('✅ password_hash теперь nullable');
      
      // 2. Добавляем новые колонки
      await client.query(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS google_id VARCHAR(255),
        ADD COLUMN IF NOT EXISTS name VARCHAR(255),
        ADD COLUMN IF NOT EXISTS avatar TEXT
      `);
      console.log('✅ Добавлены колонки: google_id, name, avatar');
      
      // 3. Делаем остальные поля nullable
      await client.query(`
        ALTER TABLE users 
        ALTER COLUMN gender DROP NOT NULL,
        ALTER COLUMN birth_date DROP NOT NULL,
        ALTER COLUMN height_cm DROP NOT NULL,
        ALTER COLUMN weight_start DROP NOT NULL,
        ALTER COLUMN weight_goal DROP NOT NULL,
        ALTER COLUMN activity_level DROP NOT NULL,
        ALTER COLUMN daily_kcal_target DROP NOT NULL
      `);
      console.log('✅ Поля профиля теперь nullable');
      
      // 4. Создаем индекс
      await client.query('CREATE UNIQUE INDEX IF NOT EXISTS users_google_id_key ON users(google_id)');
      console.log('✅ Создан индекс для google_id');
      
      await client.query('COMMIT');
      console.log('\n✅ Миграция успешно применена!');
      
      // Проверяем результат
      const result = await client.query(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        ORDER BY ordinal_position;
      `);
      
      console.log('\n📊 Обновленная структура таблицы users:');
      result.rows.forEach(row => {
        console.log(`  ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
      });
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

applyMigration();
