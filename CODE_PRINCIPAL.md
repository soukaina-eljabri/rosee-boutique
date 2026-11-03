# Code principal — Rosée

Les fichiers ci-dessous sont reproduits intégralement. Le projet ZIP contient également les imports, données, pages, illustrations et configurations nécessaires à leur exécution. Voir README.md pour l’architecture, le contrat API et le lancement.

## `src/components/Hero.jsx`

```jsx
import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';
export default function Hero() {
  return (
    <section className="hero container" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="eyebrow">
          <span className="tiny-star">✳</span> LES INDISPENSABLES DE LA SEMAINE
        </p>
        <h1 id="hero-title">
          Un quotidien
          <br />
          plus simple.
          <br />
          <em>Et plus joli.</em>
        </h1>
        <p className="hero-description">
          Des objets bien pensés, de petites attentions.
          <br className="desktop-break" /> Tout ce qu’il faut pour aimer un peu
          plus chaque jour.
        </p>
        <Link className="button button-dark" to="/catalogue">
          Trouver mes essentiels <Icon name="arrow" size={18} />
        </Link>
        <div className="hero-footnote">
          <span className="mini-flower">✿</span> De belles idées, à portée de
          main.
        </div>
      </div>
      <div className="hero-art">
        <img
          src="/images/hero.svg"
          width="900"
          height="900"
          fetchPriority="high"
          alt="Composition illustrée : gourde rose, vase en céramique et mug crème dans une lumière douce"
        />
        <div className="hero-stamp">
          <Icon name="sparkle" size={23} />
          <span>
            Utile.
            <br />
            Beau. Vous.
          </span>
        </div>
        <Link to="/produit/gourde-nomade" className="hero-product">
          <span className="product-dot" />
          <span>
            La gourde Nomade<small>Votre nouvelle complice</small>
          </span>
          <Icon name="arrow" size={18} />
        </Link>
        <span className="art-caption">LA SÉLECTION ROSÉE — ÉDITION 01</span>
      </div>
    </section>
  );
}

```

## `src/components/ProductGrid.jsx`

```jsx
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

```

## `src/components/Cart.jsx`

```jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useCatalog } from '../context/CatalogContext.jsx';
import { api } from '../api.js';
import { money } from '../utils/money.js';
import useDialog from '../hooks/useDialog.js';
import QuantityInput from './QuantityInput.jsx';
import Icon from './Icon.jsx';

export default function Cart() {
  const { lines, count, isOpen, setOpen, setQuantity, removeItem } = useCart();
  const { shop, status: catalogStatus } = useCatalog();
  const close = () => setOpen(false);
  const dialog = useDialog(isOpen, close);
  const [quote, setQuote] = useState(null);
  const [calculation, setCalculation] = useState({ status: 'idle', error: '' });
  const [attempt, setAttempt] = useState(0);
  const [recap, setRecap] = useState(false);
  const signature = JSON.stringify(
    lines.map(({ productId, quantity }) => ({ productId, quantity })),
  );

  useEffect(() => {
    setRecap(false);
    if (!isOpen || !shop || signature === '[]') {
      setQuote(null);
      setCalculation({ status: 'idle', error: '' });
      return;
    }
    const controller = new AbortController();
    setCalculation({ status: 'pending', error: '' });
    // Une courte temporisation regroupe les clics successifs sur + et −.
    const timer = setTimeout(() => {
      api('/cart/quote', {
        method: 'POST',
        body: JSON.stringify({ items: JSON.parse(signature) }),
        signal: controller.signal,
      })
        .then((data) => {
          setQuote({ ...data, signature });
          setCalculation({ status: 'ready', error: '' });
        })
        .catch((error) => {
          if (error.name !== 'AbortError')
            setCalculation({ status: 'error', error: error.message });
        });
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [signature, isOpen, shop, attempt]);

  const subtotal = lines.reduce(
    (sum, item) => sum + item.product.priceCents * item.quantity,
    0,
  );
  const shipping =
    !subtotal || (shop && subtotal >= shop.freeShippingThresholdCents)
      ? 0
      : shop?.shippingCents || 0;
  const verified =
    calculation.status === 'ready' && quote?.signature === signature;
  const total = verified ? quote.totalCents : subtotal + shipping;
  const remaining = Math.max(
    0,
    (shop?.freeShippingThresholdCents || 0) - subtotal,
  );

  function backdropClick(event) {
    if (event.target !== event.currentTarget) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    if (
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom
    )
      close();
  }

  return (
    <dialog
      {...dialog}
      className="cart-drawer"
      aria-labelledby="cart-title"
      onClick={backdropClick}
    >
      <div className="cart-header">
        <div>
          <p className="eyebrow">LES PETITES CHOSES QU’ON AIME</p>
          <h2 id="cart-title">
            Votre panier <span>({count})</span>
          </h2>
        </div>
        <button
          className="icon-button"
          onClick={close}
          autoFocus
          aria-label="Fermer le panier"
        >
          <Icon name="close" />
        </button>
      </div>
      {catalogStatus === 'loading' ? (
        <div className="empty-cart" role="status">
          On retrouve votre sélection…
        </div>
      ) : !lines.length ? (
        <div className="empty-cart">
          <span className="empty-cart-icon">
            <Icon name="bag" size={38} />
          </span>
          <h3>
            Une place pour vos
            <br />
            <em>prochains favoris.</em>
          </h3>
          <p>Votre panier attend ses premiers essentiels.</p>
          <Link to="/catalogue" className="button button-dark" onClick={close}>
            Explorer la boutique <Icon name="arrow" size={18} />
          </Link>
        </div>
      ) : (
        <>
          <div className="cart-shipping-note">
            <Icon name="truck" size={19} />
            <p>
              {remaining ? (
                <>
                  Encore <strong>{money(remaining)}</strong> pour la livraison
                  offerte.
                </>
              ) : (
                <>
                  Une petite attention :{' '}
                  <strong>la livraison est offerte.</strong>
                </>
              )}
            </p>
            <progress
              max={shop?.freeShippingThresholdCents || 1}
              value={subtotal}
              aria-label="Progression vers la livraison offerte"
            />
          </div>
          <div className="cart-items">
            {lines.map(({ productId, product, quantity }) => (
              <article className="cart-item" key={productId}>
                <Link to={`/produit/${productId}`} onClick={close}>
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    width="95"
                    height="110"
                  />
                </Link>
                <div className="cart-item-copy">
                  <Link to={`/produit/${productId}`} onClick={close}>
                    <h3>{product.name}</h3>
                  </Link>
                  <p>{product.color}</p>
                  <div className="cart-item-bottom">
                    <QuantityInput
                      value={quantity}
                      max={product.stock}
                      onChange={(value) => setQuantity(productId, value)}
                      label={product.name}
                    />
                    <strong>{money(product.priceCents * quantity)}</strong>
                  </div>
                </div>
                <button
                  className="remove-item icon-button"
                  onClick={() => removeItem(productId)}
                  aria-label={`Retirer ${product.name} du panier`}
                >
                  <Icon name="trash" size={16} />
                </button>
              </article>
            ))}
          </div>
          <div className="cart-summary">
            <dl>
              <div>
                <dt>Sous-total</dt>
                <dd>{money(verified ? quote.subtotalCents : subtotal)}</dd>
              </div>
              <div>
                <dt>Livraison</dt>
                <dd>
                  {(verified ? quote.shippingCents : shipping) === 0
                    ? 'Offerte'
                    : money(verified ? quote.shippingCents : shipping)}
                </dd>
              </div>
              <div className="cart-total">
                <dt>Total</dt>
                <dd>{money(total)}</dd>
              </div>
            </dl>
            <p
              className={`quote-status ${calculation.status === 'error' ? 'quote-error' : ''}`}
              role="status"
            >
              {calculation.status === 'pending'
                ? 'Vérification de votre sélection…'
                : calculation.status === 'error'
                  ? calculation.error
                  : verified
                    ? 'Prix et disponibilités vérifiés.'
                    : 'Total estimé.'}
            </p>
            {calculation.status === 'error' ? (
              <button
                className="button button-outline full-width"
                onClick={() => setAttempt((n) => n + 1)}
              >
                Réessayer le calcul
              </button>
            ) : (
              <button
                className="button button-dark full-width"
                disabled={!verified}
                onClick={() => setRecap((value) => !value)}
              >
                {recap ? 'Masquer le récapitulatif' : 'Voir le récapitulatif'}
                <Icon name="arrow" size={18} />
              </button>
            )}
            {recap && verified ? (
              <div className="cart-recap" role="status">
                <Icon name="check" size={19} />
                <div>
                  <strong>Votre sélection est prête.</strong>
                  <p>
                    {count} article{count > 1 ? 's' : ''} ·{' '}
                    {money(quote.totalCents)}, livraison comprise.
                  </p>
                  <p>Cette démonstration ne prend pas encore de commandes.</p>
                </div>
              </div>
            ) : null}
            <p className="demo-note">
              Boutique de démonstration · paiement non activé
            </p>
            <button className="continue-shopping" onClick={close}>
              Continuer ma découverte
            </button>
          </div>
        </>
      )}
    </dialog>
  );
}

```

## `src/context/CartContext.jsx`

```jsx
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react';
import { useCatalog } from './CatalogContext.jsx';
import { CART_KEY, cartReducer, parseSavedCart } from './cartState.js';

const CartContext = createContext(null);
function loadCart() {
  try {
    return parseSavedCart(localStorage.getItem(CART_KEY));
  } catch {
    return [];
  }
}
export function CartProvider({ children }) {
  const { products, status } = useCatalog();
  const [items, dispatch] = useReducer(cartReducer, undefined, loadCart);
  const [isOpen, setOpen] = useState(false);
  const productMap = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  );
  useEffect(() => {
    if (status === 'ready')
      dispatch({ type: 'reconcile', products: productMap });
  }, [status, productMap]);
  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify({ version: 1, items }));
    } catch {
      /* Le panier reste utilisable lorsque le stockage est désactivé. */
    }
  }, [items]);
  const lines = items.flatMap((item) => {
    const product = productMap.get(item.productId);
    return product?.stock > 0
      ? [{ ...item, quantity: Math.min(item.quantity, product.stock), product }]
      : [];
  });
  function addItem(product, quantity = 1) {
    dispatch({
      type: 'add',
      productId: product.id,
      quantity,
      max: product.stock,
    });
    setOpen(true);
  }
  function setQuantity(productId, quantity) {
    dispatch({
      type: 'quantity',
      productId,
      quantity,
      max: productMap.get(productId)?.stock || 0,
    });
  }
  const value = {
    lines,
    count: lines.reduce((sum, item) => sum + item.quantity, 0),
    isOpen,
    setOpen,
    addItem,
    setQuantity,
    quantityOf: (id) =>
      items.find((item) => item.productId === id)?.quantity || 0,
    removeItem: (productId) => dispatch({ type: 'remove', productId }),
  };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export function useCart() {
  return useContext(CartContext);
}

```

## `src/styles.css`

```css
/* ROSÉE — CSS natif. Grid structure les pages et les composants. */
:root {
  color-scheme: light;
  --cream: #fcf8f4;
  --paper: #fffdfa;
  --ink: #392b2b;
  --muted: #796a65;
  --rose: #b56578;
  --rose-dark: #925066;
  --blush: #f2dfdb;
  --line: #e9ddd5;
  --radius: 4px;
  --font: 'Avenir Next', Avenir, 'Segoe UI', Arial, sans-serif;
  --serif:
    'Iowan Old Style', 'Baskerville', 'Palatino Linotype', Georgia, serif;
}
* {
  box-sizing: border-box;
}
html {
  scroll-behavior: smooth;
  scroll-padding-top: 110px;
}
body {
  margin: 0;
  background: var(--cream);
  color: var(--ink);
  font-family: var(--font);
  font-size: 14px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}
button,
input,
select {
  font: inherit;
  color: inherit;
}
button,
a,
input,
select,
summary {
  -webkit-tap-highlight-color: transparent;
}
button {
  cursor: pointer;
}
button,
a {
  touch-action: manipulation;
}
button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}
button {
  border: 0;
}
a {
  color: inherit;
  text-decoration: none;
}
img {
  max-width: 100%;
  height: auto;
  display: block;
}
h1,
h2,
h3,
p {
  margin: 0;
}
h1,
h2,
h3 {
  line-height: 1.1;
}
em {
  color: var(--rose);
  font-weight: 400;
}
::selection {
  background: var(--blush);
}
:focus-visible {
  outline: 2px solid var(--rose-dark);
  outline-offset: 5px;
}
.container {
  width: min(1280px, calc(100% - 112px));
  margin-inline: auto;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
.skip-link {
  position: fixed;
  top: -100px;
  left: 16px;
  background: var(--ink);
  color: white;
  padding: 12px;
  z-index: 100;
}
.skip-link:focus {
  top: 12px;
}
.eyebrow {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.16em;
  line-height: 1.6;
  text-transform: uppercase;
}
.button {
  display: inline-grid;
  grid-auto-flow: column;
  align-items: center;
  justify-content: center;
  gap: 26px;
  padding: 17px 24px;
  border-radius: var(--radius);
  border: 1px solid transparent;
  font-weight: 500;
  font-size: 12px;
  line-height: 1.5;
  transition:
    background 0.2s,
    translate 0.2s,
    box-shadow 0.2s;
}
.button:not(:disabled):hover {
  translate: 0 -3px;
  box-shadow: 0 8px 20px #392b2b12;
}
.button svg {
  transition: translate 0.2s;
}
.button:not(:disabled):hover svg {
  translate: 3px 0;
}
.button-dark {
  background: var(--ink);
  color: var(--paper);
}
.button-dark:not(:disabled):hover {
  background: #66424a;
}
.button-outline {
  border-color: #c8b6ab;
  background: transparent;
}
.button-outline:hover {
  background: #f2e8e0;
}
.text-link {
  display: inline-grid;
  grid-auto-flow: column;
  align-items: center;
  justify-content: start;
  gap: 14px;
  border: 0;
  background: transparent;
  padding: 0 0 6px;
  border-bottom: 1px solid #bba69d;
  font-size: 12px;
}
.text-link:hover {
  color: var(--rose-dark);
}
.icon-button {
  width: 40px;
  height: 40px;
  padding: 0;
  display: inline-grid;
  place-items: center;
  border-radius: 50%;
  background: transparent;
  transition: background 0.2s;
}
.icon-button:hover {
  background: var(--blush);
}
.announcement {
  background: #b96c7d;
  color: #fff9f4;
  text-align: center;
  font-size: 10px;
  letter-spacing: 0.06em;
  padding: 8px 20px;
}
.announcement span {
  padding: 0 22px;
  font-size: 12px;
}
.site-header {
  position: sticky;
  top: 0;
  z-index: 20;
  background: #fcf8f4f5;
  border-bottom: 1px solid var(--line);
  backdrop-filter: blur(16px);
}
.navbar {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  min-height: 88px;
}
.wordmark {
  font-family: var(--serif);
  font-size: 44px;
  line-height: 1.2;
  letter-spacing: -0.065em;
  display: inline-grid;
  grid-auto-flow: column;
  align-items: center;
  justify-content: start;
  gap: 7px;
}
.wordmark span {
  font-family: Georgia, serif;
  color: var(--rose);
  font-size: 25px;
  margin-top: -15px;
  letter-spacing: 0;
}
.desktop-nav {
  display: grid;
  grid-auto-flow: column;
  gap: 32px;
  font-size: 11px;
  align-items: center;
}
.desktop-nav a {
  padding-block: 10px;
  position: relative;
}
.desktop-nav a::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 3px;
  height: 1px;
  background: var(--ink);
  scale: 0 1;
  transition: scale 0.2s;
  transform-origin: left;
}
.desktop-nav a:hover::after,
.desktop-nav a.active::after {
  scale: 1;
}
.nav-dot,
.new-dot {
  width: 5px;
  height: 5px;
  background: var(--rose);
  display: inline-block;
  border-radius: 50%;
  vertical-align: middle;
  margin-left: 4px;
}
.navbar-actions {
  justify-self: end;
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  gap: 16px;
}
.cart-trigger {
  display: grid;
  grid-auto-flow: column;
  gap: 10px;
  align-items: center;
  padding: 8px 0;
  background: transparent;
  font-size: 11px;
}
.cart-count {
  width: 21px;
  height: 21px;
  border-radius: 50%;
  background: var(--blush);
  display: grid;
  place-items: center;
  font-size: 10px;
}
.mobile-menu-trigger {
  display: none;
}
.mobile-menu {
  padding: 20px 28px;
  display: grid;
  gap: 18px;
  border-top: 1px solid var(--line);
}
.hero {
  display: grid;
  grid-template-columns: 1fr 1.05fr;
  min-height: 600px;
  padding-block: 40px;
  gap: 55px;
  align-items: center;
}
.hero-copy {
  padding-block: 30px;
}
.tiny-star {
  color: var(--rose);
  margin-right: 8px;
  font-size: 17px;
  vertical-align: middle;
}
.hero h1 {
  font-family: var(--serif);
  font-size: clamp(48px, 4.6vw, 76px);
  letter-spacing: -0.055em;
  line-height: 1.02;
  font-weight: 400;
  margin: 24px 0;
}
.hero h1 em {
  letter-spacing: -0.045em;
}
.hero-description {
  font-size: 12px;
  color: var(--muted);
  line-height: 1.85;
  margin-bottom: 29px;
}
.hero-footnote {
  display: grid;
  grid-auto-flow: column;
  justify-content: start;
  align-items: center;
  gap: 10px;
  font-size: 10px;
  color: var(--muted);
  margin-top: 30px;
}
.mini-flower {
  color: var(--rose);
  font-size: 23px;
}
.hero-art {
  position: relative;
  isolation: isolate;
}
.hero-art > img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 48% 48% 3px 3px;
}
.hero-stamp {
  position: absolute;
  right: -21px;
  top: 8%;
  height: 108px;
  width: 108px;
  border-radius: 50%;
  border: 1px solid #c39b8d;
  outline: 5px solid var(--cream);
  background: #f2e5d3;
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 5px;
  rotate: 10deg;
  font-size: 12px;
  font-family: var(--serif);
  text-align: center;
  line-height: 1.2;
  color: #775844;
}
.hero-stamp svg {
  color: var(--rose);
}
.hero-product {
  position: absolute;
  bottom: 16%;
  left: -25px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 12px;
  align-items: center;
  padding: 16px 20px;
  background: #fffdf8ed;
  box-shadow: 0 10px 30px #68492c0d;
  font-size: 11px;
  border-radius: 4px;
  transition: translate 0.2s;
}
.hero-product:hover {
  translate: 5px 0;
}
.hero-product small {
  display: block;
  color: var(--muted);
  margin-top: 3px;
  font-size: 9px;
}
.product-dot {
  background: var(--rose);
  width: 7px;
  height: 7px;
  border-radius: 50%;
  box-shadow: 0 0 0 5px #b5657815;
  margin-right: 5px;
}
.art-caption {
  position: absolute;
  bottom: 19px;
  right: 18px;
  font-size: 8px;
  letter-spacing: 0.15em;
  color: #765548;
}
.values-bar {
  padding: 22px 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border-block: 1px solid var(--line);
  font-size: 10px;
  color: var(--muted);
}
.values-bar > span {
  display: grid;
  grid-auto-flow: column;
  justify-content: center;
  align-items: center;
  gap: 12px;
}
.values-bar > span + span {
  border-left: 1px solid var(--line);
}
.values-bar svg {
  color: #a97b69;
}
.section {
  padding-block: 70px 0;
}
.section-heading {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: end;
  gap: 24px;
  margin-bottom: 28px;
}
.section-heading .eyebrow {
  color: var(--muted);
  font-size: 9px;
  margin-bottom: 11px;
}
.section-heading h2 {
  font-family: var(--serif);
  font-size: clamp(30px, 3vw, 43px);
  font-weight: 400;
  letter-spacing: -0.035em;
}
.heading-note {
  color: var(--muted);
  font-size: 10px;
  padding-bottom: 5px;
}
.category-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
}
.category-card {
  min-height: 205px;
  overflow: hidden;
  position: relative;
  display: grid;
  grid-template-columns: 1fr 0.85fr;
  align-items: center;
  background: #f0e3d7;
  border-radius: var(--radius);
}
.category-lifestyle {
  background: #e8e9de;
}
.category-accessoires {
  background: #f1dedc;
}
.category-copy {
  padding: 30px 0 30px 25px;
  z-index: 1;
}
.category-copy .eyebrow {
  color: #81695a;
  font-size: 8px;
  letter-spacing: 0.12em;
}
.category-copy h3 {
  font-family: var(--serif);
  font-size: 24px;
  font-weight: 400;
  line-height: 1.1;
  margin: 10px 0 22px;
  max-width: 145px;
}
.category-cta {
  display: inline-grid;
  grid-auto-flow: column;
  gap: 12px;
  align-items: center;
  font-size: 10px;
}
.category-card > img {
  mix-blend-mode: multiply;
  width: 220px;
  max-width: none;
  margin-left: -28px;
  transition:
    scale 0.35s,
    rotate 0.35s;
}
.category-card:hover > img {
  scale: 1.08;
  rotate: -4deg;
}
.selection-section {
  padding-block: 65px 0;
}
.product-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 34px 22px;
}
.product-card {
  min-width: 0;
}
.product-visual {
  position: relative;
  border-radius: var(--radius);
  overflow: hidden;
  background: #efe5dd;
}
.product-visual > a {
  display: block;
  overflow: hidden;
}
.product-visual img {
  width: 100%;
  aspect-ratio: 6 / 7;
  object-fit: cover;
  transition: scale 0.5s cubic-bezier(0.2, 0.65, 0.3, 1);
}
.product-card:hover .product-visual img {
  scale: 1.05;
}
.product-badge,
.stock-badge {
  position: absolute;
  top: 14px;
  left: 13px;
  background: #fffdf6d9;
  padding: 5px 9px;
  font-size: 8px;
  border-radius: 2px;
  letter-spacing: 0.015em;
  pointer-events: none;
}
.badge-new {
  color: #86465b;
  background: #f9e8e7;
}
.stock-badge {
  color: #5f554c;
}
.quick-add {
  position: absolute;
  right: 13px;
  bottom: 13px;
  border-radius: 50%;
  width: 37px;
  height: 37px;
  background: var(--paper);
  display: grid;
  place-items: center;
  transition:
    color 0.2s,
    background 0.2s,
    rotate 0.2s;
  box-shadow: 0 2px 5px #30201a0a;
}
.quick-add:not(:disabled):hover {
  background: var(--ink);
  color: white;
  rotate: 90deg;
}
.product-card-info {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 6px;
  padding-top: 16px;
}
.product-card h3 {
  font-size: 12px;
  font-weight: 500;
  line-height: 1.4;
}
.product-card h3 a:hover {
  color: var(--rose-dark);
}
.product-card p {
  color: var(--muted);
  font-size: 9px;
  margin-top: 4px;
}
.product-price {
  font-size: 10px;
  white-space: nowrap;
  font-weight: 500;
  padding-top: 2px;
}
.color-swatch {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  display: inline-block;
  background: #d2a19f;
  margin-top: 10px;
  box-shadow:
    0 0 0 2px var(--cream),
    0 0 0 3px #c6b4a480;
}
.swatch-maison {
  background: #c99580;
}
.swatch-accessoires {
  background: #bda58b;
}
.story-section {
  display: grid;
  grid-template-columns: 1.05fr 1fr;
  background: #f1e8df;
  margin-top: 80px;
  border-radius: var(--radius);
  overflow: hidden;
}
.story-art {
  position: relative;
}
.story-art img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.story-caption {
  position: absolute;
  left: 24px;
  bottom: 20px;
  color: #735846;
  font-size: 7px;
  letter-spacing: 0.14em;
}
.story-copy {
  align-self: center;
  padding: 48px 60px;
}
.story-copy > .eyebrow {
  font-size: 8px;
  color: #7d6a60;
}
.story-copy h2 {
  font-family: var(--serif);
  font-weight: 400;
  font-size: clamp(29px, 3vw, 44px);
  letter-spacing: -0.035em;
  margin: 16px 0 22px;
}
.story-copy p {
  font-size: 11px;
  line-height: 1.9;
  color: #7d6a60;
  margin-top: 12px;
}
.story-copy .text-link {
  margin-top: 25px;
  font-size: 10px;
}
.closing-note {
  text-align: center;
  padding-block: 65px;
  display: grid;
  justify-items: center;
  gap: 24px;
}
.closing-note > span {
  color: var(--rose);
  font-size: 30px;
}
.closing-note > p {
  font-family: var(--serif);
  font-size: 32px;
  line-height: 1.1;
  letter-spacing: -0.025em;
}
.closing-note .button {
  font-size: 10px;
  padding: 14px 20px;
}
.site-footer {
  background: #efe4dc;
  border-top: 1px solid #e7d8cd;
}
.footer-grid {
  padding-block: 45px;
  display: grid;
  grid-template-columns: 1.1fr 1fr 1fr 1.25fr;
  gap: 30px;
}
.footer-grid .wordmark {
  font-size: 40px;
}
.footer-grid p {
  font-size: 11px;
  color: #806d62;
  line-height: 1.7;
  margin-top: 12px;
}
.footer-grid h2 {
  font-size: 10px;
  font-weight: 600;
  margin: 12px 0 20px;
}
.footer-grid > div > a:not(.wordmark),
.footer-grid > div > button {
  display: block;
  font-size: 10px;
  color: #806d62;
  padding: 0;
  margin-bottom: 9px;
  background: transparent;
}
.footer-grid > div > a:not(.wordmark):hover,
.footer-grid button:hover {
  color: var(--rose-dark);
  text-decoration: underline;
}
.footer-note {
  justify-self: end;
  padding-top: 12px;
}
.footer-note svg {
  color: var(--rose);
}
.footer-bottom {
  display: grid;
  grid-template-columns: 1fr auto;
  padding-block: 18px;
  border-top: 1px solid #dbccbf;
  gap: 20px;
  font-size: 8px;
  color: #847467;
}
.breadcrumbs {
  display: grid;
  grid-auto-flow: column;
  justify-content: start;
  gap: 12px;
  color: var(--muted);
  font-size: 10px;
  padding-block: 25px;
}
.breadcrumbs a:hover {
  color: var(--rose-dark);
}
.catalog-page {
  padding-bottom: 85px;
  min-height: 70vh;
}
.catalog-header {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  padding-block: 30px 40px;
}
.catalog-header .eyebrow {
  color: var(--rose-dark);
  font-size: 9px;
}
.catalog-header h1 {
  font-family: var(--serif);
  font-size: clamp(36px, 4vw, 58px);
  font-weight: 400;
  letter-spacing: -0.04em;
  margin: 16px 0 14px;
}
.catalog-header > div > p:last-child {
  color: var(--muted);
  font-size: 12px;
}
.catalog-flower {
  color: #c49492;
  font-size: 80px;
  padding-right: 35px;
}
.catalog-topline {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 20px;
  border-bottom: 1px solid var(--line);
}
.category-tabs {
  display: grid;
  grid-auto-flow: column;
  justify-content: start;
  gap: 24px;
}
.category-tabs button {
  background: transparent;
  padding: 18px 0;
  font-size: 12px;
  border-bottom: 2px solid transparent;
  color: var(--muted);
}
.category-tabs button.active {
  color: var(--ink);
  border-bottom-color: var(--rose);
}
.search-field {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 9px;
  padding: 7px 11px;
  border: 1px solid var(--line);
  border-radius: 3px;
  background: var(--paper);
}
.search-field input {
  min-width: 0;
  width: 190px;
  font-size: 10px;
  background: transparent;
  border: 0;
  outline-offset: 3px;
}
.filter-bar {
  display: grid;
  grid-template-columns: auto minmax(150px, 1.15fr) 1fr auto auto;
  gap: 24px;
  align-items: center;
  border-bottom: 1px solid var(--line);
  padding: 23px 0;
}
.filter-label {
  display: inline-grid;
  grid-auto-flow: column;
  align-items: center;
  gap: 10px;
  font-size: 11px;
}
.price-filter {
  display: grid;
  grid-template-columns: 1fr;
  font-size: 10px;
  line-height: 1.4;
  gap: 8px;
}
.price-filter strong {
  font-weight: 500;
}
input[type='range'] {
  width: 100%;
  accent-color: var(--rose-dark);
  cursor: pointer;
  min-height: 20px;
}
.select-label {
  display: grid;
  gap: 4px;
  font-size: 9px;
  color: var(--muted);
}
select {
  padding: 8px 24px 8px 0;
  background: transparent;
  border: 0;
  font-size: 11px;
  max-width: 100%;
}
.checkbox-label {
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  gap: 7px;
  font-size: 11px;
  white-space: nowrap;
}
input[type='checkbox'] {
  width: 16px;
  height: 16px;
  accent-color: var(--rose-dark);
}
.reset-filters {
  padding: 5px 0;
  background: transparent;
  text-decoration: underline;
  font-size: 10px;
}
.results-bar {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  padding-block: 22px;
  font-size: 10px;
  color: var(--muted);
}
.results-bar label {
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  gap: 10px;
}
.empty-state {
  min-height: 280px;
  padding: 60px 20px;
  display: grid;
  align-content: center;
  justify-items: center;
  text-align: center;
  gap: 20px;
}
.empty-state h1,
.empty-state h2 {
  font-family: var(--serif);
  font-weight: 400;
  font-size: 30px;
}
.empty-state p {
  color: var(--muted);
  font-size: 13px;
}
.skeleton-card > div {
  background: #eee3da;
  aspect-ratio: 6 / 7;
  animation: pulse 1.4s ease-in-out infinite alternate;
}
.skeleton-card > span {
  display: block;
  width: 60%;
  height: 12px;
  background: #eee3da;
  margin-top: 16px;
}
@keyframes pulse {
  to {
    opacity: 0.45;
  }
}
.product-detail {
  display: grid;
  grid-template-columns: 1.05fr 1fr;
  gap: 75px;
  align-items: start;
  padding-block: 20px 10px;
}
.gallery-main {
  position: relative;
  background: #eee4db;
  border-radius: 4px;
  overflow: hidden;
}
.gallery-main > img {
  width: 100%;
}
.gallery-prev,
.gallery-next {
  position: absolute;
  top: 50%;
  background: #fffaf2d9;
}
.gallery-prev {
  left: 16px;
  rotate: 180deg;
}
.gallery-next {
  right: 16px;
}
.gallery-counter {
  position: absolute;
  right: 20px;
  bottom: 20px;
  font-size: 10px;
  letter-spacing: 0.1em;
}
.gallery-thumbnails {
  display: grid;
  grid-template-columns: repeat(3, 70px);
  gap: 12px;
  margin-top: 15px;
}
.gallery-thumbnails button {
  padding: 0;
  border: 1px solid transparent;
  background: transparent;
  opacity: 0.6;
}
.gallery-thumbnails button.active {
  border-color: var(--rose);
  opacity: 1;
  outline: 1px solid var(--rose);
  outline-offset: 3px;
}
.gallery-thumbnails img {
  width: 100%;
}
.product-detail-copy {
  padding-top: 25px;
}
.product-detail-copy > .eyebrow {
  font-size: 9px;
  color: var(--rose-dark);
}
.product-detail h1 {
  font-family: var(--serif);
  font-size: clamp(34px, 3.8vw, 52px);
  font-weight: 400;
  letter-spacing: -0.04em;
  margin: 20px 0 10px;
}
.product-tagline {
  font-size: 13px;
  color: var(--muted);
}
.detail-price {
  font-size: 20px;
  margin-block: 22px;
}
.detail-description {
  font-size: 12px;
  line-height: 1.9;
  color: var(--muted);
}
.benefits {
  display: grid;
  gap: 12px;
  list-style: none;
  padding: 25px 0;
  margin: 0;
  font-size: 11px;
}
.benefits li {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 12px;
  align-items: start;
}
.benefits svg {
  color: #9b806b;
  margin-top: 2px;
}
.detail-color {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 12px;
  align-items: center;
  font-size: 11px;
  padding-block: 20px;
  border-top: 1px solid var(--line);
}
.detail-color .color-swatch {
  margin: 0 4px;
  width: 13px;
  height: 13px;
}
.detail-color strong {
  font-weight: 500;
}
.stock-status {
  font-size: 10px;
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  justify-content: start;
  gap: 7px;
  margin: 0 0 15px;
  color: #65745e;
}
.stock-status > span {
  width: 5px;
  height: 5px;
  background: currentColor;
  border-radius: 50%;
}
.stock-status.out-of-stock {
  color: #8e7167;
}
.add-to-cart-row {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 14px;
}
.quantity-control {
  display: inline-grid;
  grid-template-columns: 32px 24px 32px;
  align-items: center;
  justify-content: start;
  border: 1px solid var(--line);
  border-radius: 3px;
  font-size: 12px;
}
.quantity-control button {
  background: transparent;
  height: 35px;
  display: grid;
  place-items: center;
  padding: 0;
}
.quantity-control button:not(:disabled):hover {
  background: var(--blush);
}
.quantity-control output {
  text-align: center;
}
.add-to-cart-row .quantity-control {
  grid-template-columns: 34px 24px 34px;
}
.add-to-cart-row .quantity-control button {
  height: 51px;
}
.product-shipping {
  display: grid;
  grid-auto-flow: column;
  justify-content: start;
  align-items: center;
  gap: 10px;
  font-size: 9px;
  color: var(--muted);
  margin: 17px 0 24px;
}
.product-details {
  border-top: 1px solid var(--line);
  padding-block: 17px;
  font-size: 11px;
}
.product-details summary {
  cursor: pointer;
  font-weight: 500;
}
.product-details p {
  padding-top: 12px;
  font-size: 10px;
  line-height: 1.8;
  color: var(--muted);
}
.product-page {
  padding-bottom: 75px;
}
.cart-drawer {
  position: fixed;
  inset: 0 0 0 auto;
  width: min(460px, 100vw);
  height: 100dvh;
  max-height: none;
  max-width: none;
  margin: 0;
  border: 0;
  padding: 0;
  background: var(--paper);
  color: var(--ink);
  box-shadow: -20px 0 70px #392b2b1a;
  translate: 100% 0;
  transition:
    translate 0.35s ease,
    overlay 0.35s allow-discrete,
    display 0.35s allow-discrete;
}
.cart-drawer[open] {
  display: grid;
  grid-template-rows: auto auto minmax(0, 1fr) auto;
  translate: 0 0;
}
.cart-drawer::backdrop {
  background: #33232155;
  backdrop-filter: blur(2px);
  opacity: 0;
  transition:
    opacity 0.35s,
    display 0.35s allow-discrete,
    overlay 0.35s allow-discrete;
}
.cart-drawer[open]::backdrop {
  opacity: 1;
}
@starting-style {
  .cart-drawer[open] {
    translate: 100% 0;
  }
  .cart-drawer[open]::backdrop {
    opacity: 0;
  }
}
.cart-header {
  padding: 28px;
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 15px;
  border-bottom: 1px solid var(--line);
}
.cart-header .eyebrow {
  font-size: 8px;
  color: var(--muted);
}
.cart-header h2 {
  font-family: var(--serif);
  font-size: 32px;
  font-weight: 400;
  margin-top: 10px;
  letter-spacing: -0.03em;
}
.cart-header h2 span {
  color: var(--rose);
  font-size: 23px;
}
.cart-shipping-note {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 10px;
  padding: 18px 28px;
  background: #f7efea;
}
.cart-shipping-note svg {
  color: #a47b68;
}
.cart-shipping-note p {
  font-size: 10px;
}
.cart-shipping-note strong {
  font-weight: 500;
}
.cart-shipping-note progress {
  grid-column: 1 / -1;
  width: 100%;
  border: 0;
  height: 3px;
  border-radius: 5px;
  accent-color: var(--rose);
  background: #e7d7ce;
}
progress::-webkit-progress-bar {
  background: #e7d7ce;
  border-radius: 5px;
}
progress::-webkit-progress-value {
  background: var(--rose);
  border-radius: 5px;
}
progress::-moz-progress-bar {
  background: var(--rose);
  border-radius: 5px;
}
.cart-items {
  overflow-y: auto;
  padding-inline: 28px;
  min-height: 90px;
}
.cart-item {
  position: relative;
  display: grid;
  grid-template-columns: 82px 1fr;
  gap: 16px;
  padding-block: 23px;
  border-bottom: 1px solid var(--line);
}
.cart-item img {
  border-radius: 3px;
  width: 82px;
  aspect-ratio: 6 / 7;
  object-fit: cover;
}
.cart-item-copy {
  display: grid;
  align-content: center;
}
.cart-item h3 {
  font-size: 12px;
  font-weight: 500;
  padding-right: 20px;
}
.cart-item-copy > p {
  color: var(--muted);
  font-size: 9px;
  margin-top: 5px;
}
.cart-item-bottom {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  margin-top: 13px;
  gap: 12px;
}
.cart-item-bottom strong {
  justify-self: end;
  font-size: 11px;
  font-weight: 500;
}
.cart-item .quantity-control {
  grid-template-columns: 25px 20px 25px;
  font-size: 10px;
}
.cart-item .quantity-control button {
  height: 27px;
}
.remove-item {
  position: absolute;
  top: 15px;
  right: -10px;
  color: var(--muted);
  width: 32px;
  height: 32px;
}
.cart-summary {
  padding: 23px 28px 20px;
  overflow-y: auto;
  max-height: 55dvh;
}
.cart-summary dl {
  margin: 0;
  display: grid;
  gap: 9px;
  font-size: 11px;
}
.cart-summary dl > div {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 15px;
}
.cart-summary dd {
  margin: 0;
}
.cart-summary .cart-total {
  border-top: 1px solid var(--line);
  padding-top: 15px;
  margin-top: 6px;
  font-size: 17px;
  font-weight: 500;
}
.quote-status {
  font-size: 9px;
  color: var(--muted);
  padding-block: 12px;
  min-height: 39px;
}
.quote-error {
  color: #a43b51;
}
.full-width {
  width: 100%;
}
.demo-note {
  font-size: 8px;
  color: var(--muted);
  text-align: center;
  margin-top: 12px;
}
.continue-shopping {
  display: block;
  background: transparent;
  font-size: 10px;
  margin: 15px auto 0;
  padding: 2px 0;
  border-bottom: 1px solid #c5b2a8;
}
.empty-cart {
  grid-row: 2 / -1;
  display: grid;
  align-content: center;
  justify-items: center;
  text-align: center;
  gap: 22px;
  padding: 35px;
}
.empty-cart-icon {
  width: 85px;
  height: 85px;
  background: #f6e9e3;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: var(--rose);
}
.empty-cart h3 {
  font-family: var(--serif);
  font-size: 34px;
  font-weight: 400;
}
.empty-cart > p {
  color: var(--muted);
  font-size: 11px;
}
.cart-recap {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: start;
  gap: 10px;
  background: #f1f2e9;
  padding: 15px;
  font-size: 11px;
  margin-top: 15px;
}
.cart-recap svg {
  color: #6b7a59;
}
.cart-recap p {
  font-size: 9px;
  color: var(--muted);
  margin-top: 4px;
}
.error-banner {
  padding: 20px;
  text-align: center;
  background: #f4dfdc;
  font-size: 12px;
}
.error-banner button {
  margin-top: 10px;
}
@media (min-width: 1600px) {
  .hero {
    min-height: 700px;
  }
}
@media (max-width: 1150px) {
  .container {
    width: calc(100% - 64px);
  }
  .navbar {
    grid-template-columns: auto 1fr auto;
    gap: 25px;
  }
  .desktop-nav {
    justify-content: center;
    gap: 20px;
    font-size: 10px;
  }
  .navbar-actions {
    gap: 8px;
  }
  .hero {
    gap: 36px;
    min-height: 520px;
  }
  .hero h1 {
    font-size: 59px;
  }
  .hero .eyebrow {
    font-size: 8px;
  }
  .hero-description {
    font-size: 11px;
  }
  .category-grid {
    gap: 14px;
  }
  .category-card {
    min-height: 185px;
  }
  .category-copy {
    padding-left: 18px;
  }
  .category-copy h3 {
    font-size: 21px;
  }
  .category-card > img {
    width: 185px;
    margin-left: -35px;
  }
  .product-grid {
    gap: 28px 17px;
  }
  .product-card-info {
    grid-template-columns: 1fr;
  }
  .story-copy {
    padding: 36px;
  }
  .product-detail {
    gap: 40px;
  }
  .filter-bar {
    gap: 18px;
  }
}
@media (max-width: 850px) {
  .desktop-nav {
    gap: 18px;
  }
  .desktop-nav a:last-child {
    display: none;
  }
  .cart-label,
  .search-button {
    display: none;
  }
  .hero h1 {
    font-size: 48px;
  }
  .hero-stamp {
    width: 80px;
    height: 80px;
    right: -12px;
    font-size: 10px;
  }
  .hero-product {
    padding: 12px;
    left: -16px;
    gap: 9px;
    font-size: 9px;
  }
  .hero-footnote {
    margin-top: 19px;
    font-size: 9px;
  }
  .hero-description br {
    display: none;
  }
  .hero {
    min-height: auto;
    padding-block: 28px;
    gap: 28px;
  }
  .hero-copy {
    padding-block: 20px;
  }
  .hero .button {
    font-size: 11px;
    gap: 18px;
    padding: 14px 18px;
  }
  .category-card {
    min-height: 180px;
    grid-template-columns: 1fr;
  }
  .category-copy h3 {
    max-width: 125px;
  }
  .category-card > img {
    position: absolute;
    right: -45px;
    bottom: -23px;
    width: 140px;
    opacity: 0.85;
  }
  .category-copy {
    padding-top: 22px;
  }
  .category-copy h3 {
    font-size: 21px;
  }
  .heading-note {
    display: none;
  }
  .product-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .product-card-info {
    grid-template-columns: minmax(0, 1fr) auto;
  }
  .story-copy {
    padding: 30px;
  }
  .story-copy h2 {
    font-size: 31px;
  }
  .story-copy p {
    font-size: 10px;
  }
  .story-caption {
    font-size: 6px;
    max-width: 70%;
  }
  .footer-grid {
    grid-template-columns: 1fr 1fr 1fr;
  }
  .footer-note {
    display: none;
  }
  .filter-bar {
    grid-template-columns: 1.2fr 1fr auto;
    gap: 20px;
  }
  .filter-label {
    display: none;
  }
  .reset-filters {
    grid-column: 1 / -1;
    justify-self: start;
  }
  .catalog-topline {
    grid-template-columns: 1fr;
    gap: 0;
  }
  .search-field {
    grid-row: 1;
    margin-bottom: 12px;
    width: 100%;
  }
  .search-field input {
    width: 100%;
  }
  .product-detail {
    gap: 30px;
  }
  .product-detail-copy {
    padding-top: 0;
  }
  .add-to-cart-row {
    grid-template-columns: 1fr;
  }
  .add-to-cart-row .quantity-control {
    justify-self: start;
  }
  .add-to-cart-row .button {
    gap: 15px;
    padding: 15px;
    font-size: 11px;
  }
}
@media (max-width: 600px) {
  html {
    scroll-padding-top: 80px;
  }
  .container {
    width: calc(100% - 40px);
  }
  .announcement {
    font-size: 8px;
    padding: 7px 10px;
  }
  .announcement span {
    padding-inline: 7px;
  }
  .navbar {
    min-height: 72px;
    grid-template-columns: 1fr auto;
    gap: 10px;
  }
  .wordmark {
    font-size: 39px;
  }
  .desktop-nav {
    display: none;
  }
  .mobile-menu-trigger {
    display: grid;
  }
  .navbar-actions {
    gap: 10px;
  }
  .cart-trigger {
    gap: 7px;
  }
  .hero {
    grid-template-columns: 1fr;
    gap: 24px;
    padding-block: 26px 32px;
  }
  .hero-copy {
    padding: 8px 4px 0;
  }
  .hero h1 {
    font-size: clamp(49px, 13vw, 68px);
    margin-block: 20px;
  }
  .hero .eyebrow {
    font-size: 8px;
  }
  .hero h1 br:nth-child(2) {
    display: none;
  }
  .hero h1 em::before {
    content: ' ';
  }
  .hero-description {
    font-size: 12px;
    max-width: 330px;
  }
  .hero .button {
    padding: 16px 20px;
  }
  .hero-footnote {
    font-size: 9px;
  }
  .hero-art {
    width: calc(100% - 12px);
    margin-inline: auto;
  }
  .hero-art > img {
    max-height: 420px;
  }
  .hero-stamp {
    right: -8px;
    top: 8%;
    width: 85px;
    height: 85px;
  }
  .hero-product {
    left: -10px;
    bottom: 13%;
    padding: 13px 16px;
  }
  .values-bar {
    grid-template-columns: 1fr;
    gap: 14px;
    padding-block: 20px;
    font-size: 10px;
  }
  .values-bar > span + span {
    border-left: 0;
  }
  .values-bar > span {
    justify-content: start;
    padding-left: 12%;
  }
  .section {
    padding-top: 43px;
  }
  .section-heading {
    gap: 16px;
    margin-bottom: 23px;
  }
  .section-heading h2 {
    font-size: 30px;
  }
  .section-heading .eyebrow {
    font-size: 7px;
    letter-spacing: 0.13em;
  }
  .section-heading > .text-link {
    font-size: 9px;
    gap: 7px;
  }
  .category-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  .category-card {
    min-height: 150px;
  }
  .category-copy {
    padding: 23px;
  }
  .category-copy h3 {
    max-width: 200px;
    font-size: 26px;
    margin-block: 7px 15px;
  }
  .category-copy .eyebrow {
    font-size: 8px;
  }
  .category-card > img {
    width: 180px;
    right: -5px;
    bottom: -28px;
  }
  .category-cta {
    font-size: 9px;
  }
  .selection-section {
    padding-top: 43px;
  }
  .product-grid {
    gap: 25px 13px;
  }
  .product-badge,
  .stock-badge {
    top: 10px;
    left: 8px;
    font-size: 7px;
    padding: 4px 6px;
  }
  .quick-add {
    width: 31px;
    height: 31px;
    bottom: 9px;
    right: 9px;
  }
  .product-card-info {
    grid-template-columns: 1fr;
    padding-top: 12px;
    gap: 3px;
  }
  .product-card h3 {
    font-size: 11px;
  }
  .product-card p {
    font-size: 8px;
    line-height: 1.6;
  }
  .product-price {
    font-size: 10px;
  }
  .color-swatch {
    margin-top: 9px;
    width: 7px;
    height: 7px;
  }
  .story-section {
    grid-template-columns: 1fr;
    margin-top: 48px;
  }
  .story-art {
    max-height: 270px;
  }
  .story-art img {
    height: 270px;
  }
  .story-copy {
    padding: 35px 27px;
  }
  .story-copy h2 {
    font-size: 35px;
  }
  .story-copy p {
    font-size: 11px;
  }
  .story-caption {
    font-size: 6px;
    left: 18px;
  }
  .closing-note {
    padding-block: 45px;
    gap: 20px;
  }
  .closing-note > p {
    font-size: 29px;
  }
  .footer-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    padding-block: 34px;
    gap: 30px 16px;
  }
  .footer-grid > div:first-child {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: center;
  }
  .footer-grid > div:first-child p {
    margin: 0;
  }
  .footer-bottom {
    grid-template-columns: 1fr;
    gap: 8px;
    font-size: 8px;
  }
  .catalog-header {
    padding-block: 20px 30px;
  }
  .catalog-header h1 {
    font-size: 39px;
    line-height: 1.1;
  }
  .catalog-header .eyebrow {
    font-size: 7px;
  }
  .catalog-flower {
    display: none;
  }
  .category-tabs {
    gap: 19px;
    overflow-x: auto;
    max-width: 100%;
  }
  .category-tabs button {
    white-space: nowrap;
    font-size: 10px;
  }
  .filter-bar {
    grid-template-columns: 1fr 1fr;
    gap: 18px 20px;
  }
  .checkbox-label {
    grid-column: 1;
    font-size: 10px;
    justify-content: start;
  }
  .reset-filters {
    grid-column: 2;
    grid-row: 2;
    justify-self: end;
  }
  .results-bar {
    gap: 10px;
    font-size: 8px;
  }
  .results-bar select {
    font-size: 9px;
    padding-right: 5px;
  }
  .results-bar label {
    gap: 4px;
  }
  .product-detail {
    grid-template-columns: 1fr;
    padding-top: 0;
    gap: 28px;
  }
  .product-detail-copy {
    padding-top: 8px;
  }
  .product-detail h1 {
    font-size: 40px;
  }
  .product-tagline {
    font-size: 12px;
  }
  .add-to-cart-row {
    grid-template-columns: auto 1fr;
    gap: 10px;
  }
  .add-to-cart-row .quantity-control {
    grid-template-columns: 29px 21px 29px;
  }
  .add-to-cart-row .button {
    font-size: 10px;
    padding-inline: 12px;
    gap: 10px;
  }
  .breadcrumbs {
    font-size: 9px;
    gap: 8px;
    overflow-x: auto;
    white-space: nowrap;
  }
  .product-page {
    padding-bottom: 50px;
  }
  .cart-header {
    padding: 23px;
  }
  .cart-shipping-note {
    padding: 15px 23px;
  }
  .cart-items {
    padding-inline: 23px;
  }
  .cart-summary {
    padding: 20px 23px;
  }
}
@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
  *,
  *::before,
  *::after {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
  }
}

```

## `server/index.js`

```javascript
import { createApp } from './app.js';

const port = Number(process.env.PORT || 3001);
const host = process.env.HOST || '127.0.0.1';
if (!Number.isInteger(port) || port < 1 || port > 65535)
  throw new Error('PORT invalide.');
const server = createApp();
server.requestTimeout = 15000;
server.headersTimeout = 10000;
server.listen(port, host, () =>
  console.log(`API Rosée : http://${host}:${port}`),
);
server.on('error', (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
function shutdown() {
  server.close(() => {
    process.exitCode = 0;
  });
  server.closeIdleConnections();
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

```

## `server/app.js`

```javascript
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { categories, products, productsById, shop } from './catalog.js';

const DIST = fileURLToPath(new URL('../dist/', import.meta.url));
const MAX_BODY_BYTES = 32 * 1024;
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
};
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function json(response, status, value) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  response.end(JSON.stringify(value));
}

function readJson(request) {
  if (
    !/^application\/json(?:\s*;|$)/i.test(request.headers['content-type'] || '')
  ) {
    request.resume();
    throw new HttpError(
      415,
      'Le contenu doit être au format application/json.',
    );
  }
  return new Promise((accept, reject) => {
    let size = 0;
    const chunks = [];
    let tooLarge = false;
    request.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        if (!tooLarge) reject(new HttpError(413, 'Requête trop volumineuse.'));
        tooLarge = true;
        chunks.length = 0;
      } else if (!tooLarge) chunks.push(chunk);
    });
    request.on('end', () => {
      if (tooLarge) return;
      try {
        accept(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch {
        reject(new HttpError(400, 'JSON invalide.'));
      }
    });
    request.on('error', reject);
  });
}

function moneyParam(params, name, fallback) {
  if (!params.has(name)) return fallback;
  const raw = params.get(name);
  const value = Number(raw);
  if (!raw.trim() || !Number.isFinite(value) || value < 0 || value > 1000000) {
    throw new HttpError(
      400,
      `Le paramètre ${name} doit être un prix positif en MAD.`,
    );
  }
  return Math.round(value * 100);
}

export function filterProducts(params) {
  const category = params.get('category') || '';
  const utility = params.get('utility') || '';
  const novelty = params.get('new');
  const sort = params.get('sort') || 'featured';
  const min = moneyParam(params, 'minPrice', 0);
  const max = moneyParam(params, 'maxPrice', Infinity);
  if (min > max)
    throw new HttpError(400, 'Le prix minimum dépasse le maximum.');
  if (category && !categories.some((item) => item.id === category))
    throw new HttpError(400, 'Catégorie inconnue.');
  if (utility && !['emporter', 'organiser', 'ralentir'].includes(utility))
    throw new HttpError(400, 'Utilité inconnue.');
  if (novelty !== null && !['true', 'false'].includes(novelty))
    throw new HttpError(400, 'Le filtre new attend true ou false.');
  const comparators = {
    featured: (a, b) => a.featured - b.featured,
    'price-asc': (a, b) => a.priceCents - b.priceCents,
    'price-desc': (a, b) => b.priceCents - a.priceCents,
    newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
  };
  if (!Object.hasOwn(comparators, sort))
    throw new HttpError(400, 'Tri inconnu.');
  const q = (params.get('q') || '').trim().toLocaleLowerCase('fr');
  return products
    .filter(
      (product) =>
        (!category || product.category === category) &&
        (!utility || product.utility === utility) &&
        (novelty === null || product.isNew === (novelty === 'true')) &&
        product.priceCents >= min &&
        product.priceCents <= max &&
        (!q ||
          `${product.name} ${product.subtitle}`
            .toLocaleLowerCase('fr')
            .includes(q)),
    )
    .sort(comparators[sort]);
}

export function quoteCart(body) {
  if (!body || !Array.isArray(body.items) || body.items.length > 40) {
    throw new HttpError(
      400,
      'Le panier doit contenir un tableau de 40 lignes maximum.',
    );
  }
  const quantities = new Map();
  for (const item of body.items) {
    if (
      !item ||
      typeof item.productId !== 'string' ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > 99
    ) {
      throw new HttpError(
        400,
        'Identifiant ou quantité invalide (entier entre 1 et 99).',
      );
    }
    if (!productsById.has(item.productId))
      throw new HttpError(404, 'Un article du panier n’existe plus.');
    quantities.set(
      item.productId,
      (quantities.get(item.productId) || 0) + item.quantity,
    );
  }
  const items = [...quantities].map(([productId, quantity]) => {
    const product = productsById.get(productId);
    if (quantity > product.stock || quantity > 99)
      throw new HttpError(409, `Stock insuffisant pour ${product.name}.`);
    // Aucun prix transmis par le navigateur n’est utilisé.
    return {
      productId,
      name: product.name,
      quantity,
      unitPriceCents: product.priceCents,
      lineTotalCents: product.priceCents * quantity,
    };
  });
  const subtotalCents = items.reduce(
    (sum, item) => sum + item.lineTotalCents,
    0,
  );
  const shippingCents =
    subtotalCents === 0 || subtotalCents >= shop.freeShippingThresholdCents
      ? 0
      : shop.shippingCents;
  return {
    ...shop,
    items,
    subtotalCents,
    shippingCents,
    totalCents: subtotalCents + shippingCents,
  };
}

async function serveClient(request, response, pathname, distDirectory) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    throw new HttpError(400, 'Adresse invalide.');
  }
  if (
    decoded.includes('\0') ||
    decoded.split('/').some((part) => part.startsWith('.')) ||
    decoded.includes('\\')
  ) {
    throw new HttpError(404, 'Page introuvable.');
  }
  const root = resolve(distDirectory);
  let filename = resolve(root, `.${decoded === '/' ? '/index.html' : decoded}`);
  if (!filename.startsWith(root + sep))
    throw new HttpError(404, 'Page introuvable.');
  let content;
  try {
    content = await readFile(filename);
  } catch {
    if (
      decoded === '/' ||
      decoded === '/catalogue' ||
      /^\/produit\/[-a-z0-9]+\/?$/.test(decoded)
    ) {
      filename = resolve(root, 'index.html');
      try {
        content = await readFile(filename);
      } catch {
        throw new HttpError(
          503,
          'Interface non compilée. Exécutez npm run build ou npm run dev.',
        );
      }
    } else throw new HttpError(404, 'Ressource introuvable.');
  }
  response.writeHead(200, {
    'Content-Type': mime[extname(filename)] || 'application/octet-stream',
    'Cache-Control': filename.includes(`${sep}assets${sep}`)
      ? 'public, max-age=31536000, immutable'
      : 'no-cache',
    'Content-Security-Policy':
      "default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'",
  });
  response.end(request.method === 'HEAD' ? undefined : content);
}

export function createApp({ distDirectory = DIST } = {}) {
  return createServer(async (request, response) => {
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    try {
      const url = new URL(request.url, 'http://localhost');
      const { pathname, searchParams } = url;
      if (pathname === '/api/health' && request.method === 'GET')
        return json(response, 200, { status: 'ok' });
      if (pathname === '/api/products' && request.method === 'GET') {
        const items = filterProducts(searchParams);
        return json(response, 200, {
          products: items,
          total: items.length,
          categories,
          shop,
        });
      }
      if (pathname.startsWith('/api/products/') && request.method === 'GET') {
        const product = productsById.get(
          pathname.slice('/api/products/'.length),
        );
        if (!product) throw new HttpError(404, 'Produit introuvable.');
        return json(response, 200, { product, shop });
      }
      if (pathname === '/api/cart/quote' && request.method === 'POST') {
        return json(response, 200, quoteCart(await readJson(request)));
      }
      if (pathname.startsWith('/api/')) {
        if (
          ['/api/products', '/api/cart/quote', '/api/health'].includes(pathname)
        ) {
          response.setHeader(
            'Allow',
            pathname === '/api/cart/quote' ? 'POST' : 'GET',
          );
          throw new HttpError(405, 'Méthode non autorisée.');
        }
        throw new HttpError(404, 'Route API introuvable.');
      }
      if (!['GET', 'HEAD'].includes(request.method))
        throw new HttpError(405, 'Méthode non autorisée.');
      await serveClient(request, response, pathname, distDirectory);
    } catch (error) {
      if (!error.status) console.error(error);
      if (!response.headersSent)
        json(response, error.status || 500, {
          error: error.status ? error.message : 'Erreur interne du serveur.',
        });
      else response.end();
    }
  });
}

```
