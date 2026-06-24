import { useState } from 'react';
import { Users, Search, UserPlus, CheckCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

export default function SupervisorUsers() {
  const { toast } = useToast();
  const [users, setUsers] = useState([
    { id: 4244, name: 'Jean-Pierre M.', role: 'Mineur', site: 'MPAMA', status: 'Actif' },
    { id: 4245, name: 'Vincent K.', role: 'Shift Boss', site: 'MPAMA', status: 'Actif' },
    { id: 4246, name: 'David K.', role: 'Géologue', site: 'MPAMA', status: 'Actif' },
    { id: 4247, name: 'BAHATI M.', role: 'Driver', site: 'MPAMA', status: 'Inactif' },
  ]);

  const handleCreateUser = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newUser = {
      id: formData.get('matricule'),
      name: formData.get('name'),
      role: formData.get('role'),
      site: formData.get('site'),
      status: 'Actif'
    };
    
    setUsers([...users, newUser]);
    toast("Nouvel utilisateur créé avec succès", "success");
    e.target.reset();
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <div style={{ padding: '0.75rem', background: 'rgba(168, 85, 247, 0.1)', borderRadius: 'var(--radius-md)', color: 'var(--color-purple)' }}>
          <Users size={28} />
        </div>
        <div>
          <h2 style={{ margin: 0, color: 'var(--color-white)', fontWeight: 800, fontSize: '1.5rem' }}>Gestion Utilisateurs</h2>
          <p style={{ margin: 0, color: 'var(--color-stone)' }}>Annuaire et création de comptes pour le shift</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        
        {/* Liste des utilisateurs */}
        <div style={{ background: 'var(--color-rock-2)', border: '1px solid var(--color-rock-3)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-rock-3)', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={18} color="var(--color-stone)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input type="text" placeholder="Rechercher un utilisateur..." className="premium-input" style={{ width: '100%', paddingLeft: '2.5rem' }} />
            </div>
            <button className="premium-button primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--color-purple)', borderColor: 'var(--color-purple)' }}>
              <UserPlus size={18} /> NOUVEAU
            </button>
          </div>
          
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
              <tr style={{ color: 'var(--color-stone)', textAlign: 'left', fontSize: '0.85rem' }}>
                <th style={{ padding: '1rem 1.5rem' }}>Matricule</th>
                <th style={{ padding: '1rem 1.5rem' }}>Nom</th>
                <th style={{ padding: '1rem 1.5rem' }}>Rôle</th>
                <th style={{ padding: '1rem 1.5rem' }}>Site</th>
                <th style={{ padding: '1rem 1.5rem' }}>Statut</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderTop: '1px solid var(--color-rock-3)', color: 'var(--color-chalk)' }}>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 700, color: 'var(--color-white)' }}>{u.id}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>{u.name}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span style={{ padding: '0.25rem 0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', fontSize: '0.8rem' }}>{u.role}</span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>{u.site}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    {u.status === 'Actif' ? (
                      <span style={{ color: 'var(--color-emerald)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600, fontSize: '0.85rem' }}><CheckCircle size={14}/> Actif</span>
                    ) : (
                      <span style={{ color: 'var(--color-warning)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600, fontSize: '0.85rem' }}><AlertTriangle size={14}/> Inactif</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Création Utilisateur */}
        <div style={{ background: 'var(--color-rock-2)', border: '1px solid var(--color-purple)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <UserPlus size={20} color="var(--color-purple)" />
            <h3 style={{ margin: 0, color: 'var(--color-white)', fontSize: '1.1rem' }}>Création Utilisateur</h3>
          </div>
          
          <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
              <div>
                <label className="form-label">Matricule</label>
                <input type="text" name="matricule" className="premium-input" style={{ width: '100%' }} placeholder="Ex: 4248" required />
              </div>
              <div>
                <label className="form-label">Nom / Prénom</label>
                <input type="text" name="name" className="premium-input" style={{ width: '100%' }} placeholder="Nom complet" required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="form-label">Rôle</label>
                <select name="role" className="premium-input" style={{ width: '100%' }} required>
                  <option>Mineur</option>
                  <option>Shift Boss</option>
                  <option>Géologue</option>
                  <option>Driver</option>
                </select>
              </div>
              <div>
                <label className="form-label">Site</label>
                <select name="site" className="premium-input" style={{ width: '100%' }} required>
                  <option>MPAMA North</option>
                  <option>MPAMA South</option>
                </select>
              </div>
            </div>

            <div>
              <label className="form-label">Entreprise</label>
              <select className="premium-input" style={{ width: '100%' }} required>
                <option>Reliant Congo</option>
                <option>Sous-traitant A</option>
              </select>
            </div>

            <div>
              <label className="form-label">Mot de passe temporaire</label>
              <input type="password" className="premium-input" style={{ width: '100%' }} placeholder="********" required />
            </div>

            <div>
              <label className="form-label">Notifications requises</label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <label className="form-checkbox-label"><input type="checkbox" className="form-checkbox" defaultChecked /> Push</label>
                <label className="form-checkbox-label"><input type="checkbox" className="form-checkbox" defaultChecked /> SMS</label>
                <label className="form-checkbox-label"><input type="checkbox" className="form-checkbox" /> Email</label>
              </div>
            </div>

            <button type="submit" className="premium-button primary" style={{ width: '100%', padding: '1rem', marginTop: '1rem', background: 'var(--color-purple)', borderColor: 'var(--color-purple)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
              <CheckCircle size={18} /> CRÉER COMPTE
            </button>

          </form>
        </div>

      </div>
    </div>
  );
}
