import { BedDouble, Bath, Maximize2, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

export interface Property {
  property_id: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  area_sqm: number;
  price_egp: number;
  compound?: string;
  city?: string;
  district?: string;
  features?: string[];
  description?: string;
}

function formatPrice(price: number): string {
  if (price >= 1_000_000) {
    return `EGP ${(price / 1_000_000).toFixed(1)}M`;
  }
  return `EGP ${price.toLocaleString('en-EG')}`;
}

export function PropertyCard({ property }: { property: Property }) {
  const [expanded, setExpanded] = useState(false);

  const location = [property.compound, property.district, property.city]
    .filter(Boolean)
    .join(', ');

  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      border: '1px solid #F3F4F6',
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      transition: 'box-shadow 0.2s',
    }}
    onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(99,102,241,0.12)'; }}
    onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'; }}
    >
      {/* Image area */}
      <div style={{
        position: 'relative',
        background: 'linear-gradient(135deg, #EEF2FF 0%, #DBEAFE 100%)',
        height: 160,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 44, height: 44, margin: '0 auto 8px',
            background: '#E0E7FF', borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="22" height="22" fill="none" stroke="#818CF8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3 9.75L12 3l9 6.75V21a.75.75 0 01-.75.75H3.75A.75.75 0 013 21V9.75z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 21V12h6v9" />
            </svg>
          </div>
          <span style={{ fontSize: '0.7rem', color: '#A5B4FC', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {property.type}
          </span>
        </div>
        <div style={{
          position: 'absolute', top: 12, right: 12,
          background: 'rgba(255,255,255,0.92)', borderRadius: 8,
          padding: '4px 10px', fontSize: '0.75rem', fontWeight: 700,
          color: '#4338CA',
        }}>
          {formatPrice(property.price_egp)}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ marginBottom: 12 }}>
          <h3 style={{ color: '#111827', marginBottom: 4, fontSize: '0.95rem' }}>{property.type}</h3>
          {location && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <MapPin size={13} color="#D1D5DB" />
              <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{location}</span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          {[
            { Icon: BedDouble, label: `${property.bedrooms} Beds` },
            { Icon: Bath, label: `${property.bathrooms} Baths` },
            { Icon: Maximize2, label: `${property.area_sqm} m²` },
          ].map(({ Icon, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Icon size={13} color="#818CF8" />
              <span style={{ fontSize: '0.72rem', color: '#6B7280' }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Features */}
        {property.features && property.features.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
            {property.features.slice(0, 3).map((f) => (
              <span key={f} style={{
                padding: '2px 8px', background: '#EEF2FF', color: '#6366F1',
                borderRadius: 999, fontSize: '0.7rem',
              }}>{f}</span>
            ))}
            {property.features.length > 3 && (
              <span style={{
                padding: '2px 8px', background: '#F9FAFB', color: '#9CA3AF',
                borderRadius: 999, fontSize: '0.7rem',
              }}>+{property.features.length - 3}</span>
            )}
          </div>
        )}

        {/* Description toggle */}
        {property.description && (
          <div style={{ marginTop: 'auto', paddingTop: 8, borderTop: '1px solid #F9FAFB' }}>
            <button
              onClick={() => setExpanded(!expanded)}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                fontSize: '0.75rem', color: '#6366F1', background: 'none',
                border: 'none', cursor: 'pointer', padding: 0,
              }}
            >
              {expanded ? 'Hide details' : 'View details'}
              {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
            {expanded && (
              <p style={{
                marginTop: 8, fontSize: '0.75rem', color: '#6B7280', lineHeight: 1.6,
              }}>
                {property.description}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
