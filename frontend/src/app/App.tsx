import { useState, useRef } from 'react';
import { Search, ArrowRight, Sparkles, Home, Loader2, AlertCircle } from 'lucide-react';
import { PropertyCard, type Property } from './components/PropertyCard';

const SUGGESTIONS = [
  '2 bedroom apartment in Cairo',
  'Villas with a pool in Zayed',
  'Properties under 10M',
];

interface SearchResult {
  summary: string;
  properties: Property[];
}

export default function App() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSearch(q?: string) {
    const searchQuery = q ?? query;
    if (!searchQuery.trim()) return;

    setQuery(searchQuery);
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('http://127.0.0.1:8000/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data: SearchResult = await res.json();
      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not connect to the backend. Make sure the FastAPI server is running on port 8000.'
      );
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleSearch();
  }

  const hasResults = result && result.properties.length > 0;

  return (
    <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', flexDirection: 'column' }}>
      {/* Nav */}
      <header style={{
        display: 'flex', alignItems: 'center', padding: '20px 32px',
        borderBottom: '1px solid #f3f4f6',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 32, height: 32, background: '#4F46E5', borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Home size={16} color="#fff" />
          </div>
          <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#111827', letterSpacing: '-0.01em' }}>
            Estato AI
          </span>
        </div>
      </header>

      {/* Main */}
      <main style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 16px',
      }}>
        {/* Hero */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          marginTop: hasResults ? 40 : 112,
          marginBottom: hasResults ? 32 : 40,
          transition: 'margin 0.4s ease',
        }}>
          <div style={{
            width: 56, height: 56, background: '#EEF2FF', borderRadius: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24,
          }}>
            <Sparkles size={24} color="#6366F1" />
          </div>

          {!hasResults ? (
            <>
              <h1 style={{ textAlign: 'center', marginBottom: 16, maxWidth: 520, color: '#111827' }}>
                Find your perfect home
              </h1>
              <p style={{
                color: '#9CA3AF', textAlign: 'center', maxWidth: 420,
                fontSize: '1rem', lineHeight: 1.6,
              }}>
                Search real estate using natural language. Powered by semantic
                search and Large Language Models.
              </p>
            </>
          ) : (
            <h2 style={{ color: '#111827', textAlign: 'center' }}>Find your perfect home</h2>
          )}
        </div>

        {/* Search bar */}
        <div style={{ width: '100%', maxWidth: 600, marginBottom: 16 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: '#fff', border: '1.5px solid #E5E7EB', borderRadius: 20,
            padding: '12px 16px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}>
            <Search size={18} color="#D1D5DB" style={{ flexShrink: 0 }} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g., 'Apartment with 2 bedrooms in Cairo under 10 million'"
              style={{
                flex: 1, border: 'none', outline: 'none', background: 'transparent',
                fontSize: '0.875rem', color: '#374151',
              }}
            />
            <button
              onClick={() => handleSearch()}
              disabled={loading || !query.trim()}
              style={{
                width: 36, height: 36, background: loading || !query.trim() ? '#A5B4FC' : '#6366F1',
                border: 'none', borderRadius: 12, cursor: loading || !query.trim() ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                transition: 'background 0.15s',
              }}
            >
              {loading
                ? <Loader2 size={16} color="#fff" style={{ animation: 'spin 1s linear infinite' }} />
                : <ArrowRight size={16} color="#fff" />}
            </button>
          </div>
        </div>

        {/* Suggestion chips */}
        {!hasResults && !loading && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 48 }}>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => handleSearch(s)}
                style={{
                  padding: '8px 16px', borderRadius: 999, border: '1.5px solid #E5E7EB',
                  background: '#fff', fontSize: '0.875rem', color: '#6B7280',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = '#A5B4FC';
                  (e.currentTarget as HTMLButtonElement).style.color = '#4F46E5';
                  (e.currentTarget as HTMLButtonElement).style.background = '#EEF2FF';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = '#E5E7EB';
                  (e.currentTarget as HTMLButtonElement).style.color = '#6B7280';
                  (e.currentTarget as HTMLButtonElement).style.background = '#fff';
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            width: '100%', maxWidth: 600, marginBottom: 32,
            background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 16,
            padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: 12,
          }}>
            <AlertCircle size={18} color="#EF4444" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <p style={{ fontSize: '0.875rem', color: '#DC2626', marginBottom: 4 }}>{error}</p>
              <p style={{ fontSize: '0.75rem', color: '#F87171' }}>
                Run: <code style={{ background: '#FEE2E2', padding: '1px 4px', borderRadius: 4 }}>uvicorn backend.api:app --reload</code>
              </p>
            </div>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div style={{ width: '100%', maxWidth: 900, marginBottom: 40 }}>
            <div style={{ height: 80, background: '#EEF2FF', borderRadius: 16, marginBottom: 24, opacity: 0.7 }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ height: 240, background: '#F9FAFB', borderRadius: 16 }} />
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div style={{ width: '100%', maxWidth: 900, paddingBottom: 64 }}>
            {result.summary && (
              <div style={{
                display: 'flex', gap: 16, background: '#EEF2FF',
                border: '1px solid #C7D2FE', borderRadius: 16, padding: '20px 24px', marginBottom: 32,
              }}>
                <div style={{
                  width: 32, height: 32, background: '#E0E7FF', borderRadius: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Sparkles size={16} color="#6366F1" />
                </div>
                <div>
                  <p style={{ fontSize: '0.7rem', fontWeight: 600, color: '#818CF8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                    AI Summary
                  </p>
                  <p style={{ fontSize: '0.875rem', color: '#3730A3', lineHeight: 1.7 }}>{result.summary}</p>
                </div>
              </div>
            )}

            {result.properties.length > 0 ? (
              <>
                <p style={{ fontSize: '0.8rem', color: '#9CA3AF', marginBottom: 16 }}>
                  {result.properties.length} propert{result.properties.length === 1 ? 'y' : 'ies'} found
                </p>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: 16,
                }}>
                  {result.properties.map((p) => (
                    <PropertyCard key={p.property_id} property={p} />
                  ))}
                </div>
              </>
            ) : (
              <p style={{ textAlign: 'center', color: '#9CA3AF', padding: '48px 0' }}>
                No properties matched your search. Try a different query.
              </p>
            )}
          </div>
        )}
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
