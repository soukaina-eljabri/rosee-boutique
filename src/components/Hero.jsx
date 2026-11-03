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
