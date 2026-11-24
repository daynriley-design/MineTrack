import { useState, useEffect, useRef } from 'react';
import { Map as MapIcon, Maximize2, Layers, Download, Printer, Share2, ZoomIn, ZoomOut, Rotate3d, Ruler, Search, X } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { pegsAPI } from '../../api';

export default function GeologistMap() {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [measureMode, setMeasureMode] = useState(false);
  const [allPegs, setAllPegs] = useState([]);
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  const { toast } = useToast();

  useEffect(() => {
    pegsAPI.list().then(res => {
      const items = Array.isArray(res.data) ? res.data : res.data?.items || [];
      setAllPegs(items);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowResults(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const results = query.trim().length > 0
    ? allPegs.filter(p =>
        (p.peg_id || '').toLowerCase().includes(query.toLowerCase()) ||
        (p.zone || '').toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : [];

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.2, 2.5));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 45) % 360);
  const toggleMeasure = () => {
    setMeasureMode(!measureMode);
    if (!measureMode) toast('Mode mesure activé. Cliquez sur deux points.', 'info');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', height: '100%' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ color: 'var(--color-white)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <MapIcon size={28} color="var(--color-gold)" />
          CARTOGRAPHIE 3D - MPAMA North
        </h2>

        <div ref={searchRef} style={{ position: 'relative', flex: '1 1 260px', maxWidth: '340px' }}>
          <Search size={16} color="var(--color-stone)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setShowResults(true); }}
            onFocus={() => setShowResults(true)}
            placeholder="Rechercher un PEG ou chantier..."
            className="premium-input"
            style={{ width: '100%', paddingLeft: '2.4rem' }}
          />
          {query && (
            <button type="button" onClick={() => { setQuery(''); setShowResults(false); }} style={{ position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-stone)', cursor: 'pointer' }}>
              <X size={14} />
            </button>
          )}
          {showResults && query.trim() && (
            <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: 'var(--color-rock-2)', border: '1px solid var(--color-rock-3)', borderRadius: 'var(--radius-md)', zIndex: 50, maxHeight: '260px', overflowY: 'auto', boxShadow: '0 8px 24px rgba(17,18,20,0.06)' }}>
              {results.length === 0 ? (
                <div style={{ padding: '0.75rem 1rem', color: 'var(--color-stone)', fontSize: '0.85rem' }}>Aucun résultat</div>
              ) : results.map(p => (
                <div
                  key={p.id}
                  onClick={() => { toast(`PEG ${p.peg_id} — zone ${p.zone || '—'}, statut ${p.status}`, 'info'); setShowResults(false); }}
                  style={{ padding: '0.6rem 1rem', cursor: 'pointer', borderBottom: '1px solid var(--color-rock-3)', display: 'flex', justifyContent: 'space-between' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(17,18,20,0.05)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ color: 'var(--color-white)', fontFamily: 'monospace', fontWeight: 700 }}>{p.peg_id}</span>
                  <span style={{ color: 'var(--color-stone)', fontSize: '0.8rem' }}>{p.zone || '—'} · {p.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="premium-button secondary"><Download size={16}/> EXPORTER</button>
          <button className="premium-button secondary"><Printer size={16}/> IMPRIMER</button>
          <button className="premium-button"><Share2 size={16}/> RAPPORT</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2rem', flex: 1 }}>
        
        {/* Vue 3D simulée avec SVG Isométrique */}
        <div style={{ 
          flex: 3, background: 'var(--color-rock-2)', border: '1px solid var(--color-rock-3)', 
          borderRadius: 'var(--radius-lg)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column'
        }}>
          {/* Outils Map */}
          <div style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button style={{ background: 'var(--color-rock)', border: '1px solid var(--color-stone)', color: 'var(--color-chalk)', width: '40px', height: '40px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Plein écran">
              <Maximize2 size={18} />
            </button>
            <button style={{ background: 'var(--color-rock)', border: '1px solid var(--color-stone)', color: 'var(--color-chalk)', width: '40px', height: '40px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Couches">
              <Layers size={18} />
            </button>
          </div>

          <div 
            style={{ 
              flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', 
              background: 'radial-gradient(circle at center, #262626 0%, #171717 100%)',
              cursor: measureMode ? 'crosshair' : 'grab',
              overflow: 'hidden'
            }}
            onClick={() => measureMode && toast('Distance calculée : ~45.2m', 'success')}
          >
            {/* SVG Isometric Map Simulation */}
            <svg viewBox="0 0 800 600" style={{ width: '100%', height: '100%', transform: `scale(${scale}) rotate(${rotation}deg)`, transition: 'transform 0.4s ease-out' }}>
              <defs>
                <linearGradient id="peg1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--color-emerald)" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#064e3b" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id="peg2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--color-gold)" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#78350f" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id="unstable" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--color-ruby)" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#7f1d1d" stopOpacity="0.6" />
                </linearGradient>
              </defs>

              {/* Grille de fond isométrique */}
              <g stroke="rgba(17,18,20,0.05)" strokeWidth="1">
                {[...Array(20)].map((_, i) => (
                  <line key={`h${i}`} x1="0" y1={i * 40} x2="800" y2={i * 40 + 200} />
                ))}
                {[...Array(20)].map((_, i) => (
                  <line key={`v${i}`} x1={i * 60} y1="0" x2={i * 60 - 300} y2="600" />
                ))}
              </g>

              {/* Pegmatite 1 (Active) */}
              <g transform="translate(300, 200)">
                <polygon points="0,0 150,-75 200,-50 50,25" fill="url(#peg1)" stroke="var(--color-emerald)" strokeWidth="2" />
                <polygon points="50,25 200,-50 200,50 50,125" fill="url(#peg1)" opacity="0.7" stroke="var(--color-emerald)" />
                <polygon points="0,0 50,25 50,125 0,100" fill="url(#peg1)" opacity="0.5" stroke="var(--color-emerald)" />
                <text x="100" y="-30" fill="white" fontSize="12" fontWeight="bold" transform="skewX(30)">PEG-10L-XC5SS (67%)</text>
                
                {/* Echantillons sur PEG 1 */}
                <circle cx="120" cy="-20" r="4" fill="var(--color-info)" stroke="white" strokeWidth="1" />
                <text x="130" y="-15" fill="var(--color-chalk)" fontSize="10">Lab-045</text>
              </g>

              {/* Pegmatite 2 (Exploitee / Instable) */}
              <g transform="translate(450, 350)">
                <polygon points="0,0 120,-60 160,-40 40,20" fill="url(#peg2)" stroke="var(--color-gold)" strokeWidth="2" />
                <polygon points="40,20 160,-40 160,20 40,80" fill="url(#peg2)" opacity="0.7" stroke="var(--color-gold)" />
                <polygon points="0,0 40,20 40,80 0,60" fill="url(#peg2)" opacity="0.5" stroke="var(--color-gold)" />
                <text x="70" y="-20" fill="white" fontSize="12" fontWeight="bold">PEG-11L-FWS (100%)</text>
                
                {/* Zone instable */}
                <circle cx="100" cy="10" r="25" fill="url(#unstable)" className="pulse-anim" />
                <path d="M95,0 L105,0 L100,15 Z" fill="var(--color-ruby)" />
                <circle cx="100" cy="20" r="2" fill="var(--color-ruby)" />
                <text x="130" y="15" fill="var(--color-ruby)" fontSize="10" fontWeight="bold">Zone Instable</text>
              </g>

              {/* My Position */}
              <g transform="translate(350, 450)">
                <circle cx="0" cy="0" r="6" fill="var(--color-info)" />
                <circle cx="0" cy="0" r="15" fill="transparent" stroke="var(--color-info)" strokeWidth="1" opacity="0.5" />
                <text x="15" y="4" fill="var(--color-white)" fontSize="12" fontWeight="bold">Ma Position</text>
              </g>

            </svg>
          </div>

          <div style={{ padding: '1rem', background: 'rgba(17,18,20,0.06)', display: 'flex', gap: '2rem', borderTop: '1px solid var(--color-rock-3)' }}>
            <span style={{ color: 'var(--color-stone)', fontSize: '0.85rem' }}>▲ Pegmatite active</span>
            <span style={{ color: 'var(--color-stone)', fontSize: '0.85rem' }}>■ Zone exploitée</span>
            <span style={{ color: 'var(--color-stone)', fontSize: '0.85rem' }}>⬡ Échantillon</span>
            <span style={{ color: 'var(--color-ruby)', fontSize: '0.85rem' }}>⚠️ Zone instable</span>
            <span style={{ color: 'var(--color-info)', fontSize: '0.85rem' }}>📍 Position GPS</span>
          </div>
        </div>

        {/* Panneau latéral */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ background: 'var(--color-rock-2)', border: '1px solid var(--color-rock-3)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
            <h3 style={{ color: 'var(--color-white)', fontSize: '1rem', margin: '0 0 1rem 0' }}>CONTROLES</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <button className="premium-button secondary" onClick={handleZoomIn}><ZoomIn size={16}/> Zoom +</button>
              <button className="premium-button secondary" onClick={handleZoomOut}><ZoomOut size={16}/> Zoom -</button>
              <button className="premium-button secondary" onClick={handleRotate}><Rotate3d size={16}/> Rotation</button>
              <button className={`premium-button ${measureMode ? '' : 'secondary'}`} onClick={toggleMeasure}><Ruler size={16}/> Mesurer</button>
            </div>
          </div>

          <div style={{ background: 'var(--color-rock-2)', border: '1px solid var(--color-rock-3)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
            <h3 style={{ color: 'var(--color-white)', fontSize: '1rem', margin: '0 0 1rem 0' }}>FILTRES</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-chalk)', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked /> Pegmatites (PEG)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-chalk)', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked /> Échantillons
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-warning)', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked /> Zones Instables
              </label>
            </div>
          </div>

          <div style={{ background: 'var(--color-rock-2)', border: '1px solid var(--color-rock-3)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
            <h3 style={{ color: 'var(--color-white)', fontSize: '1rem', margin: '0 0 1rem 0' }}>MODÈLE SÉLECTIONNÉ</h3>
            <div style={{ color: 'var(--color-gold)', fontWeight: 800, fontSize: '1.2rem', marginBottom: '1rem' }}>PEG-10L-XC5SS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--color-stone)', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Longueur:</span> <span style={{ color: 'var(--color-white)' }}>120 m</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Largeur:</span> <span style={{ color: 'var(--color-white)' }}>45 m</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Hauteur:</span> <span style={{ color: 'var(--color-white)' }}>35 m</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--color-rock-3)' }}>
                <span>Volume estimé:</span> <span style={{ color: 'var(--color-info)', fontWeight: 700 }}>189,000 m³</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Ressources:</span> <span style={{ color: 'var(--color-emerald)', fontWeight: 700 }}>45,000 t</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 0.4; }
          100% { transform: scale(0.95); opacity: 0.8; }
        }
        .pulse-anim {
          animation: pulse 2s infinite ease-in-out;
          transform-origin: center;
        }
      `}</style>
    </div>
  );
}
