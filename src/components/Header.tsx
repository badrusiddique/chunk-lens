import { useCallback, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

function getInitialTheme(): Theme {
  const stored = localStorage.getItem('cl-theme');
  if (stored === 'dark' || stored === 'light') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function Header() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('cl-theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <span
          aria-hidden="true"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '22px',
            height: '22px',
            borderRadius: '4px',
            background: 'var(--accent-base)',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <rect x="0" y="0" width="5" height="13" rx="1" fill="#000" />
            <rect x="7" y="0" width="6" height="5" rx="1" fill="#000" />
            <rect x="7" y="8" width="6" height="5" rx="1" fill="#000" />
          </svg>
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            fontSize: '13px',
            letterSpacing: '-0.01em',
            color: 'var(--text-primary)',
          }}
        >
          chunk-lens
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            color: 'var(--text-muted)',
            background: 'var(--surface-overlay)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '3px',
            padding: '1px 5px',
          }}
        >
          v0.1.0-dev
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <a
          href="https://github.com/badrusiddique/chunk-lens"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View source on GitHub"
          style={{
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            transition: 'color 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-muted)';
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
        </a>

        <button
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          style={{
            background: 'none',
            border: '1px solid var(--border-subtle)',
            borderRadius: '5px',
            padding: '4px 8px',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            transition: 'border-color 0.15s, color 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-default)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
            e.currentTarget.style.color = 'var(--text-muted)';
          }}
        >
          {theme === 'dark' ? '☀' : '◑'}
        </button>
      </div>
    </div>
  );
}
