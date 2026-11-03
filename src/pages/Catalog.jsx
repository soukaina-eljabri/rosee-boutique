import { useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCatalog } from '../context/CatalogContext.jsx';
import ProductGrid from '../components/ProductGrid.jsx';
import Icon from '../components/Icon.jsx';
import { money } from '../utils/money.js';

export default function Catalog() {
  const { products, categories, status } = useCatalog();
  const [params, setParams] = useSearchParams();
  const searchRef = useRef(null);
  const category = params.get('category') || '';
  const utility = params.get('utility') || '';
  const onlyNew = params.get('new') === 'true';
  const rawPrice = Number(params.get('maxPrice') ?? 400);
  const maxPrice = Number.isFinite(rawPrice)
    ? Math.max(0, Math.min(rawPrice, 400))
    : 400;
  const query = params.get('q') || '';
  const sort = params.get('sort') || 'featured';
  useEffect(() => {
    if (params.get('focus') === 'search') searchRef.current?.focus();
  }, [params]);
  function update(name, value) {
    // Lire la dernière URL évite de perdre un filtre lors de clics rapides.
    const next = new URLSearchParams(window.location.search);
    next.delete('focus');
    if (value === '' || value === false) next.delete(name);
    else next.set(name, String(value));
    setParams(next, { replace: true, preventScrollReset: true });
  }
  const comparators = {
    featured: (a, b) => a.featured - b.featured,
    'price-asc': (a, b) => a.priceCents - b.priceCents,
    'price-desc': (a, b) => b.priceCents - a.priceCents,
    newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
  };
  const filtered = products
    .filter(
      (product) =>
        (!category || product.category === category) &&
        (!utility || product.utility === utility) &&
        (!onlyNew || product.isNew) &&
        product.priceCents <= maxPrice * 100 &&
        `${product.name} ${product.subtitle}`
          .toLocaleLowerCase('fr')
          .includes(query.toLocaleLowerCase('fr').trim()),
    )
    .sort(
      Object.hasOwn(comparators, sort)
        ? comparators[sort]
        : comparators.featured,
    );
  const active = category || utility || onlyNew || maxPrice < 400 || query;
  return (
    <div className="catalog-page container">
      <nav className="breadcrumbs" aria-label="Fil d’Ariane">
        <Link to="/">Accueil</Link>
        <span>/</span>
        <span>La boutique</span>
      </nav>
      <header className="catalog-header">
        <div>
          <p className="eyebrow">DU PRATIQUE. DU BEAU. POUR VOUS.</p>
          <h1>
            Vos nouveaux <em>essentiels.</em>
          </h1>
          <p>Les petits détails qui font les belles journées.</p>
        </div>
        <span className="catalog-flower">✳</span>
      </header>
      <div className="catalog-topline">
        <div className="category-tabs" aria-label="Catégories">
          <button
            className={!category ? 'active' : ''}
            aria-pressed={!category}
            onClick={() => update('category', '')}
          >
            Tout explorer
          </button>
          {categories.map((item) => (
            <button
              key={item.id}
              className={category === item.id ? 'active' : ''}
              aria-pressed={category === item.id}
              onClick={() => update('category', item.id)}
            >
              {item.shortName}
            </button>
          ))}
        </div>
        <label className="search-field">
          <Icon name="search" size={18} />
          <span className="sr-only">Rechercher un produit</span>
          <input
            type="search"
            placeholder="Votre prochain essentiel…"
            value={query}
            ref={searchRef}
            onChange={(event) => update('q', event.target.value)}
          />
        </label>
      </div>
      <form
        className="filter-bar"
        onSubmit={(event) => event.preventDefault()}
        aria-label="Filtrer le catalogue"
      >
        <span className="filter-label">
          <Icon name="filter" size={17} /> Affiner
        </span>
        <label className="price-filter">
          <span>
            Budget : jusqu’à <strong>{money(maxPrice * 100)}</strong>
          </span>
          <input
            type="range"
            min="0"
            max="400"
            step="1"
            value={maxPrice}
            onChange={(event) => update('maxPrice', event.target.value)}
            aria-label="Prix maximum en MAD"
          />
        </label>
        <label className="select-label">
          <span>Votre envie</span>
          <select
            value={utility}
            onChange={(event) => update('utility', event.target.value)}
          >
            <option value="">Toutes les utilités</option>
            <option value="organiser">Mieux s’organiser</option>
            <option value="emporter">Tout emporter</option>
            <option value="ralentir">Prendre une pause</option>
          </select>
        </label>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={onlyNew}
            onChange={(event) => update('new', event.target.checked)}
          />
          <span>Nouveautés</span>
          <span className="new-dot" />
        </label>
        {active ? (
          <button
            className="reset-filters"
            onClick={() =>
              setParams({}, { replace: true, preventScrollReset: true })
            }
            type="button"
          >
            Tout effacer
          </button>
        ) : null}
      </form>
      <div className="results-bar">
        <p role="status">
          {status === 'loading'
            ? 'Un instant de douceur…'
            : `${filtered.length} essentiel${filtered.length > 1 ? 's' : ''} à découvrir`}
        </p>
        <label>
          Trier par{' '}
          <select
            value={sort}
            onChange={(event) => update('sort', event.target.value)}
          >
            <option value="featured">Notre sélection</option>
            <option value="price-asc">Prix croissant</option>
            <option value="price-desc">Prix décroissant</option>
            <option value="newest">Les plus récents</option>
          </select>
        </label>
      </div>
      <ProductGrid
        products={filtered}
        loading={status === 'loading'}
        emptyAction={
          <button
            className="button button-outline"
            onClick={() =>
              setParams({}, { replace: true, preventScrollReset: true })
            }
          >
            Réinitialiser les filtres
          </button>
        }
      />
    </div>
  );
}
