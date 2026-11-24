import { useAuth } from '../contexts/AuthContext';

const greetingFor = (h) => (h < 12 ? 'Bonjour' : h < 18 ? 'Bon après-midi' : 'Bonsoir');

/**
 * En-tete degrade de la maquette : date, salutation + nom, et une rangee
 * de boutons ronds a droite (actions). `title` remplace la salutation
 * quand la page a un vrai titre (ex. « Stocks & consommation »).
 */
export default function PageHero({ title, subtitle, actions, left, children }) {
  const { user } = useAuth();
  const now = new Date();
  const raw = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  const date = raw.charAt(0).toUpperCase() + raw.slice(1);
  let second = subtitle ?? `${user?.name || ''},`;
  // Comptes de demo nommes comme le role (« Support technique ») : on evite le doublon.
  if (title && second.replace(/,$/, '').trim().toLowerCase() === title.toLowerCase()) {
    second = `${greetingFor(now.getHours())} !`;
  }

  return (
    <header className={`mt-hero${left || actions ? '' : ' mt-hero--plain'}`}>
      {(left || actions) && (
        <div className="mt-hero__bar">
          <div>{left}</div>
          <div className="mt-hero__actions">{actions}</div>
        </div>
      )}
      <p className="mt-hero__date">{date}</p>
      <h1 className="mt-hero__title">
        {title || greetingFor(now.getHours())}
        <span>{second}</span>
      </h1>
      {children}
    </header>
  );
}
