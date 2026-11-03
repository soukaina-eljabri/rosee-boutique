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
