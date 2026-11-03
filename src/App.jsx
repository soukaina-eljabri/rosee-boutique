import { useEffect } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Cart from './components/Cart.jsx';
import Home from './pages/Home.jsx';
import Catalog from './pages/Catalog.jsx';
import ProductPage from './pages/Product.jsx';
import { useCatalog } from './context/CatalogContext.jsx';

export default function App() {
  const { status, error, retry } = useCatalog();
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash)
      document
        .getElementById(hash.slice(1))
        ?.scrollIntoView({ behavior: 'auto' });
    else window.scrollTo({ top: 0 });
    document.title =
      pathname === '/catalogue'
        ? 'La boutique — Rosée'
        : pathname.startsWith('/produit/')
          ? 'Votre essentiel — Rosée'
          : 'Rosée — Les belles idées du quotidien';
  }, [pathname, hash]);
  return (
    <>
      <a className="skip-link" href="#main">
        Aller au contenu
      </a>
      <Navbar />
      {status === 'error' ? (
        <div className="error-banner" role="alert">
          <p>Le catalogue est momentanément indisponible. {error}</p>
          <button className="text-link" onClick={retry}>
            Réessayer
          </button>
        </div>
      ) : null}
      <main id="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalogue" element={<Catalog />} />
          <Route path="/produit/:id" element={<ProductPage />} />
          <Route
            path="*"
            element={
              <div className="empty-state container">
                <h1>Une petite pause hors chemin.</h1>
                <Link className="button button-dark" to="/">
                  Retour à l’accueil
                </Link>
              </div>
            }
          />
        </Routes>
      </main>
      <Footer />
      <Cart />
    </>
  );
}
