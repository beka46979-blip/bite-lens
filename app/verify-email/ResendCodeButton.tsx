'use client';

import { useState } from 'react';

export function ResendCodeButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleResend = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/verify-email/send-code', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage('Ошибка при отправке кода');
        setTimeout(() => setMessage(''), 3000);
        return;
      }

      if (data.code) {
        setMessage(`Код для демо: ${data.code}`);
      } else {
        setMessage('Код отправлен повторно!');
      }
      
      setTimeout(() => setMessage(''), 5000);
    } catch (err) {
      setMessage('Ошибка сервера');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleResend}
        disabled={isLoading}
        style={{
          width: "100%", padding: "13px 0",
          background: "transparent",
          border: "1px solid var(--lp-border)",
          borderRadius: "var(--lp-radius-sm)",
          color: "var(--lp-text)",
          fontSize: 14, fontWeight: 500,
          cursor: isLoading ? "not-allowed" : "pointer",
          opacity: isLoading ? 0.7 : 1,
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all .2s",
          marginTop: 16,
        }}
        onMouseEnter={e => { 
          if (!isLoading) {
            (e.currentTarget as HTMLElement).style.background = "var(--lp-bg3)";
            (e.currentTarget as HTMLElement).style.borderColor = "var(--lp-green)";
          }
        }}
        onMouseLeave={e => { 
          (e.currentTarget as HTMLElement).style.background = "transparent";
          (e.currentTarget as HTMLElement).style.borderColor = "var(--lp-border)";
        }}
      >
        {isLoading ? 'Отправка...' : 'Отправить код повторно'}
      </button>
      
      {message && (
        <p style={{
          textAlign: "center",
          fontSize: 13,
          color: message.includes('Ошибка') ? "#f87171" : "var(--lp-green)",
          marginTop: 12,
          marginBottom: 0,
        }}>
          {message}
        </p>
      )}
    </>
  );
}
