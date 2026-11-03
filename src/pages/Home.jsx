import { Link } from 'react-router-dom';
import Hero from '../components/Hero.jsx';
import ProductGrid from '../components/ProductGrid.jsx';
import Icon from '../components/Icon.jsx';
import { useCatalog } from '../context/CatalogContext.jsx';

export default function Home() {
  const { products, categories, status } = useCatalog();
  return (
    <>
      <Hero />
      <div className="values-bar container">
        <span>
          <Icon name="heart" size={18} /> Sélectionnés avec attention
        </span>
        <span>
          <Icon name="bag" size={18} /> Pensés pour la vraie vie
        </span>
        <span>
          <Icon name="truck" size={19} /> Livraison offerte dès 500 DH
        </span>
      </div>
      <section className="section container" aria-labelledby="categories-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">À CHAQUE ENVIE, SON ESSENTIEL</p>
            <h2 id="categories-title">
              Dans votre <em>élément.</em>
            </h2>
          </div>
          <span className="heading-note">
            Les petites choses qui changent tout.
          </span>
        </div>
        <div className="category-grid">
          {categories.map((category) => (
            <Link
              className={`category-card category-${category.id}`}
              key={category.id}
              to={`/catalogue?category=${category.id}`}
            >
              <div className="category-copy">
                <span className="eyebrow">{category.shortName}</span>
                <h3>{category.name}</h3>
                <span className="category-cta">
                  Explorer <Icon name="arrow" size={17} />
                </span>
              </div>
              <img
                src={category.image}
                alt=""
                width="720"
                height="840"
                loading="lazy"
              />
            </Link>
          ))}
        </div>
      </section>
      <section
        className="section selection-section container"
        aria-labelledby="selection-title"
      >
        <div className="section-heading">
          <div>
            <p className="eyebrow">LA SÉLECTION DU MOMENT</p>
            <h2 id="selection-title">
              De futurs <em>favoris.</em>
            </h2>
          </div>
          <Link className="text-link" to="/catalogue">
            Tout voir <Icon name="arrow" size={17} />
          </Link>
        </div>
        <ProductGrid
          products={products.slice(0, 4)}
          loading={status === 'loading'}
        />
      </section>
      <section
        className="story-section container"
        id="esprit"
        aria-labelledby="story-title"
      >
        <div className="story-art">
          <img
            src="/images/ritual.svg"
            width="800"
            height="640"
            alt="Illustration d’un mug crème, d’un livre et d’une fleur sur une table rose"
            loading="lazy"
          />
          <span className="story-caption">
            LES RITUELS LES PLUS SIMPLES SONT SOUVENT LES PLUS BEAUX.
          </span>
        </div>
        <div className="story-copy">
          <span className="eyebrow">L’ESPRIT ROSÉE</span>
          <h2 id="story-title">
            Moins de superflu.
            <br />
            <em>Plus de vous.</em>
          </h2>
          <p>
            On aime les objets qui ont une raison d’être là. Ceux qui
            simplifient un geste, illuminent un coin de maison, ou rendent une
            pause un peu plus douce.
          </p>
          <p>
            Notre idée du quotidien ? Du pratique, du beau, et juste ce qu’il
            faut.
          </p>
          <Link to="/catalogue?utility=organiser" className="text-link">
            Faire de la place à l’essentiel <Icon name="arrow" size={18} />
          </Link>
        </div>
      </section>
      <section className="closing-note container">
        <span>✳</span>
        <p>
          La douceur se cache
          <br />
          dans les <em>petites choses.</em>
        </p>
        <Link className="button button-outline" to="/catalogue?new=true">
          Découvrir les nouveautés <Icon name="arrow" size={17} />
        </Link>
      </section>
    </>
  );
}
