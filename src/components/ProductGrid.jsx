import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { money } from '../utils/money.js';
import Icon from './Icon.jsx';

export function ProductCard({ product }) {
  const { addItem, quantityOf } = useCart();
  const available = product.stock > quantityOf(product.id);
  return (
    <article className="product-card">
      <div className="product-visual">
        <Link
          to={`/produit/${product.id}`}
          aria-label={`Découvrir ${product.name}`}
        >
          <img
            src={product.images[0]}
            alt={`${product.name}, coloris ${product.color}`}
            width="720"
            height="840"
            loading="lazy"
          />
        </Link>
        {product.badge ? (
          <span className={`product-badge ${product.isNew ? 'badge-new' : ''}`}>
            {product.badge}
          </span>
        ) : null}
        {product.stock === 0 ? (
          <span className="stock-badge">Bientôt de retour</span>
        ) : null}
        <button
          className="quick-add"
          type="button"
          disabled={!available}
          aria-label={`Ajouter ${product.name} au panier`}
          onClick={() => addItem(product)}
        >
          <Icon name={available ? 'plus' : 'check'} size={19} />
        </button>
      </div>
      <div className="product-card-info">
        <div>
          <h3>
            <Link to={`/produit/${product.id}`}>{product.name}</Link>
          </h3>
          <p>{product.subtitle}</p>
        </div>
        <span className="product-price">{money(product.priceCents)}</span>
      </div>
      <span
        className={`color-swatch swatch-${product.category}`}
        aria-label={`Coloris ${product.color}`}
      />
    </article>
  );
}
export default function ProductGrid({
  products,
  loading = false,
  emptyAction,
}) {
  if (loading)
    return (
      <div
        className="product-grid"
        role="status"
        aria-label="Chargement des produits"
      >
        {[0, 1, 2, 3].map((id) => (
          <div className="skeleton-card" key={id}>
            <div />
            <span />
          </div>
        ))}
      </div>
    );
  if (!products.length)
    return (
      <div className="empty-state">
        <Icon name="search" size={36} />
        <h2>Aucun essentiel pour ces critères.</h2>
        <p>Essayez un autre budget ou une autre catégorie.</p>
        {emptyAction}
      </div>
    );
  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
