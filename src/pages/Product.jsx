import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useCatalog } from '../context/CatalogContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { money } from '../utils/money.js';
import ProductGrid from '../components/ProductGrid.jsx';
import QuantityInput from '../components/QuantityInput.jsx';
import Icon from '../components/Icon.jsx';

function ProductDetails({ product }) {
  const [image, setImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addItem, quantityOf } = useCart();
  const remaining = Math.max(0, product.stock - quantityOf(product.id));
  const currentQuantity = Math.min(quantity, Math.max(1, remaining));
  function move(step) {
    setImage(
      (old) => (old + step + product.images.length) % product.images.length,
    );
  }
  return (
    <section className="product-detail">
      <div className="product-gallery">
        <div
          className="gallery-main"
          role="region"
          aria-roledescription="carrousel"
          aria-label={`Images de ${product.name}`}
        >
          <img
            src={product.images[image]}
            width="720"
            height="840"
            alt={`${product.name} — vue ${image + 1} sur ${product.images.length}`}
          />
          <button
            className="gallery-prev icon-button"
            onClick={() => move(-1)}
            aria-label="Image précédente"
          >
            <Icon name="chevron" />
          </button>
          <button
            className="gallery-next icon-button"
            onClick={() => move(1)}
            aria-label="Image suivante"
          >
            <Icon name="chevron" />
          </button>
          <span className="gallery-counter" aria-live="polite">
            0{image + 1} / 0{product.images.length}
          </span>
        </div>
        <div className="gallery-thumbnails">
          {product.images.map((src, index) => (
            <button
              key={src}
              className={image === index ? 'active' : ''}
              onClick={() => setImage(index)}
              aria-label={`Afficher la vue ${index + 1}`}
              aria-pressed={image === index}
            >
              <img src={src} alt="" width="90" height="100" />
            </button>
          ))}
        </div>
      </div>
      <div className="product-detail-copy">
        <p className="eyebrow">
          UN PETIT ESSENTIEL ROSÉE {product.isNew ? '· NOUVEAU' : ''}
        </p>
        <h1>{product.name}</h1>
        <p className="product-tagline">{product.subtitle}</p>
        <p className="detail-price">{money(product.priceCents)}</p>
        <p className="detail-description">{product.description}</p>
        <ul className="benefits">
          {product.benefits.map((benefit) => (
            <li key={benefit}>
              <Icon name="check" size={16} />
              {benefit}
            </li>
          ))}
        </ul>
        <div className="detail-color">
          <span className={`color-swatch swatch-${product.category}`} />
          <span>
            Coloris : <strong>{product.color}</strong>
          </span>
        </div>
        <p
          className={`stock-status ${product.stock === 0 ? 'out-of-stock' : ''}`}
        >
          <span />
          {product.stock === 0
            ? 'Bientôt de retour'
            : remaining > 0
              ? 'Disponible, prêt à vous accompagner'
              : 'Toutes les unités disponibles sont dans votre panier'}
        </p>
        <div className="add-to-cart-row">
          <QuantityInput
            label={product.name}
            value={currentQuantity}
            max={remaining}
            onChange={setQuantity}
          />
          <button
            className="button button-dark"
            disabled={remaining === 0}
            onClick={() => addItem(product, currentQuantity)}
          >
            Ajouter au panier <Icon name="bag" size={19} />
          </button>
        </div>
        <p className="product-shipping">
          <Icon name="truck" size={18} /> Livraison à 29 DH · offerte dès 500 DH
        </p>
        <details className="product-details" open>
          <summary>Les petits détails</summary>
          <p>{product.details}</p>
        </details>
        <details className="product-details">
          <summary>Un mot sur cette sélection</summary>
          <p>
            Catalogue de démonstration : les caractéristiques et illustrations
            sont des exemples à remplacer par celles de vos produits avant
            ouverture.
          </p>
        </details>
      </div>
    </section>
  );
}
export default function ProductPage() {
  const { id } = useParams();
  const { products, status } = useCatalog();
  const product = products.find((item) => item.id === id);
  if (status === 'loading')
    return (
      <div className="container section" role="status">
        Votre essentiel arrive…
      </div>
    );
  if (!product)
    return (
      <div className="empty-state container">
        <h1>Cet essentiel reste à découvrir.</h1>
        <p>Ce produit n’existe pas ou n’est plus au catalogue.</p>
        <Link className="button button-dark" to="/catalogue">
          Retour à la boutique
        </Link>
      </div>
    );
  return (
    <div className="container product-page">
      <nav className="breadcrumbs" aria-label="Fil d’Ariane">
        <Link to="/">Accueil</Link>
        <span>/</span>
        <Link to="/catalogue">La boutique</Link>
        <span>/</span>
        <span>{product.name}</span>
      </nav>
      <ProductDetails key={product.id} product={product} />
      <section className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">LES BELLES ASSOCIATIONS</p>
            <h2>
              Et avec ceci, <em>un peu de douceur ?</em>
            </h2>
          </div>
        </div>
        <ProductGrid
          products={products
            .filter((item) => item.id !== product.id)
            .slice(0, 4)}
        />
      </section>
    </div>
  );
}
