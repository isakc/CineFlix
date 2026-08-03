import React, { useState, useEffect } from 'react';
import { apiUrl } from '../config/api';

export default function MovieNewsSection() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/news?query=영화'));
      if (res.ok) {
        const data = await res.json();
        setNews(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch movie news:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section style={{ marginTop: '20px', marginBottom: '60px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>📰</span> 영화 뉴스
        </h2>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card-skeleton" style={{ height: '140px', borderRadius: '14px' }} />
          ))}
        </div>
      ) : news.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          등록된 뉴스가 없습니다.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '18px' }}>
          {news.map((item, idx) => (
            <a
              key={idx}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="glass"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justify: 'space-between',
                padding: '18px',
                borderRadius: '14px',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.2s ease',
                border: '1px solid var(--border-color)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.borderColor = 'var(--accent-gold)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--border-color)';
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span
                    style={{
                      background: 'rgba(255, 193, 7, 0.12)',
                      color: 'var(--accent-gold)',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: '700'
                    }}
                  >
                    {item.press || '뉴스'}
                  </span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                    {item.pubDate || '최신'}
                  </span>
                </div>

                <h3
                  style={{
                    fontSize: '1.05rem',
                    fontWeight: '700',
                    lineHeight: '1.4',
                    color: 'var(--text-primary)',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {item.title}
                </h3>
              </div>

              <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--accent-gold)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>기사 읽기</span>
                <span>➔</span>
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
