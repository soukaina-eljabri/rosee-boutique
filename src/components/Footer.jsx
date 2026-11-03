import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import Icon from './Icon.jsx';
export default function Footer() {
  const { setOpen } = useCart();
  return (
    <footer className="site-footer">
      <div className="footer-grid container">
        <div>
          <Link className="wordmark" to="/">
            rosée<span>✳</span>
          </Link>
          <p>
            Les belles idées
            <br />
            du quotidien.
          </p>
        </div>
        <div>
          <h2>La sélection</h2>
          <Link to="/catalogue?category=maison">Pour la maison</Link>
          <Link to="/catalogue?category=lifestyle">Pour vos rituels</Link>
          <Link to="/catalogue?category=accessoires">
            Pour vous accompagner
          </Link>
        </div>
        <div>
          <h2>À votre rythme</h2>
          <Link to="/catalogue?new=true">Nos nouveautés</Link>
          <a href="/#esprit">L’esprit Rosée</a>
          <button onClick={() => setOpen(true)}>Retrouver mon panier</button>
        </div>
        <div className="footer-note">
          <Icon name="sparkle" size={36} />
          <p>
            Une petite touche de beau.
            <br />
            Un grand plaisir au quotidien.
          </p>
        </div>
      </div>
      <div className="footer-bottom container">
        <span>
          © {new Date().getFullYear()} Rosée. Boutique de démonstration.
        </span>
        <span>Imaginée avec soin, pour les petits riens qui comptent.</span>
      </div>
    </footer>
  );
}
