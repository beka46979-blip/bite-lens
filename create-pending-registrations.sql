-- Создание таблицы для временных регистраций
CREATE TABLE IF NOT EXISTS pending_registrations (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  verification_code VARCHAR(10) NOT NULL,
  code_expires_at TIMESTAMP(6) NOT NULL,
  created_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Создание индексов
CREATE INDEX IF NOT EXISTS idx_pending_registrations_email ON pending_registrations(email);
CREATE INDEX IF NOT EXISTS idx_pending_registrations_code_expires_at ON pending_registrations(code_expires_at);

-- Комментарий
COMMENT ON TABLE pending_registrations IS 'Временное хранилище данных регистрации до подтверждения email';
