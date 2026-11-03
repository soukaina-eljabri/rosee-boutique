import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import Icon from './Icon.jsx';

export default function Navbar() {
  const { count, setOpen } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const expanded = menuOpen === location.pathname + location.search;
  return (
    <>
      <div className="announcement">
        Un peu de douceur dans votre quotidien <span>✳</span> Livraison offerte
        dès 500 DH
      </div>
      <header className="site-header">
        <div className="navbar container">
          <Link className="wordmark" to="/" aria-label="Rosée, accueil">
            rosée<span>✳</span>
          </Link>
          <nav className="desktop-nav" aria-label="Navigation principale">
            <NavLink end to="/">
              Accueil
            </NavLink>
            <NavLink to="/catalogue">La boutique</NavLink>
            <Link to="/catalogue?new=true">
              Les nouveautés <span className="nav-dot" />
            </Link>
            <a href="/#esprit">L’esprit Rosée</a>
          </nav>
          <div className="navbar-actions">
            <Link
              className="icon-button search-button"
              to="/catalogue?focus=search"
              aria-label="Rechercher un produit"
            >
              <Icon name="search" />
            </Link>
            <button
              className="cart-trigger"
              type="button"
              onClick={() => setOpen(true)}
              aria-label={`Ouvrir le panier, ${count} article${count > 1 ? 's' : ''}`}
            >
              <Icon name="bag" />
              <span className="cart-label">Mon panier</span>
              <span className="cart-count">{count}</span>
            </button>
            <button
              className="icon-button mobile-menu-trigger"
              aria-label={expanded ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={expanded}
              aria-controls="mobile-menu"
              onClick={() =>
                setMenuOpen(
                  expanded ? false : location.pathname + location.search,
                )
              }
            >
              <Icon name={expanded ? 'close' : 'menu'} />
            </button>
          </div>
        </div>
        {expanded ? (
          <nav
            id="mobile-menu"
            className="mobile-menu"
            aria-label="Navigation mobile"
            onClick={() => setMenuOpen(false)}
          >
            <Link to="/">Accueil</Link>
            <Link to="/catalogue">La boutique</Link>
            <Link to="/catalogue?new=true">Les nouveautés</Link>
            <a href="/#esprit">L’esprit Rosée</a>
          </nav>
        ) : null}
      </header>
    </>
  );
}
