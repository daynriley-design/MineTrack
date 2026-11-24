/* eslint-disable react-refresh/only-export-components */
import { useState, useCallback, useContext, createContext } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

function playToastSound(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const freq = type === 'error' ? 440 : type === 'success' ? 880 : 660;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type === 'error' ? 'square' : 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (type === 'error' ? 0.5 : 0.25));
    osc.start();
    osc.stop(ctx.currentTime + (type === 'error' ? 0.5 : 0.25));
    // Erreur/critique : double bip pour attirer l'attention (peut signaler un danger)
    if (type === 'error') {
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(440, ctx.currentTime + 0.25);
      gain2.gain.setValueAtTime(0.25, ctx.currentTime + 0.25);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
      osc2.start(ctx.currentTime + 0.25);
      osc2.stop(ctx.currentTime + 0.7);
    }
  } catch { /* autoplay bloqué par le navigateur avant interaction utilisateur */ }
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    playToastSound(type);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const icons = {
    success: <CheckCircle size={16} />,
    error: <XCircle size={16} />,
    info: <Info size={16} />,
  };

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            {icons[t.type]}
            <span>{t.message}</span>
            <button
              className="btn btn-ghost btn-icon btn-sm"
              style={{ marginLeft: 'auto', padding: '0.2rem' }}
              onClick={() => setToasts((p) => p.filter((x) => x.id !== t.id))}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
