import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../server/app.js';
import { products, shop } from '../server/catalog.js';

let server;
let base;
before(async () => {
  server = createApp();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
});
async function get(path) {
  const response = await fetch(base + path);
  return { status: response.status, data: await response.json() };
}
async function quote(items) {
  const response = await fetch(base + '/api/cart/quote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
  });
  return { status: response.status, data: await response.json() };
}

test('le catalogue fournit 8 produits, catégories et règles de livraison', async () => {
  const { status, data } = await get('/api/products');
  assert.equal(status, 200);
  assert.equal(data.products.length, 8);
  assert.equal(data.categories.length, 3);
  assert.equal(data.shop.currency, 'MAD');
  assert.equal(data.products[0].images.length, 3);
});
test('les filtres catégorie, utilité, nouveauté et prix se combinent', async () => {
  const { data } = await get(
    '/api/products?category=accessoires&utility=emporter&new=true&maxPrice=180',
  );
  assert.deepEqual(
    data.products.map((item) => item.id),
    ['lunchbox-pause'],
  );
});
test('le tri croissant et la recherche fonctionnent', async () => {
  const { data } = await get('/api/products?sort=price-asc');
  const prices = data.products.map((item) => item.priceCents);
  assert.deepEqual(
    prices,
    [...prices].sort((a, b) => a - b),
  );
  const found = await get('/api/products?q=nomade');
  assert.equal(found.data.total, 1);
});
test('les filtres invalides sont refusés', async () => {
  for (const query of [
    'maxPrice=NaN',
    'minPrice=-1',
    'minPrice=200&maxPrice=100',
    'sort=constructor',
    'category=inconnue',
    'utility=autre',
    'new=oui',
  ]) {
    assert.equal((await get('/api/products?' + query)).status, 400, query);
  }
});
test('la fiche produit est disponible et un identifiant inconnu renvoie 404', async () => {
  assert.equal(
    (await get('/api/products/gourde-nomade')).data.product.name,
    'La gourde Nomade',
  );
  assert.equal((await get('/api/products/inconnu')).status, 404);
});
test('le total utilise le prix serveur, même si le client envoie un faux prix', async () => {
  const { status, data } = await quote([
    { productId: 'gourde-nomade', quantity: 2, priceCents: 1 },
  ]);
  assert.equal(status, 200);
  assert.equal(data.subtotalCents, 37800);
  assert.equal(data.shippingCents, 2900);
  assert.equal(data.totalCents, 40700);
});
test('la livraison est offerte à partir du seuil et le panier vide vaut zéro', async () => {
  const full = await quote([{ productId: 'gourde-nomade', quantity: 3 }]);
  assert.equal(full.data.subtotalCents, 56700);
  assert.equal(full.data.shippingCents, 0);
  const exact = await quote([
    { productId: 'pochette-douce', quantity: 1 },
    { productId: 'gourde-nomade', quantity: 1 },
  ]);
  assert.equal(exact.data.shippingCents, shop.shippingCents);
  const empty = await quote([]);
  assert.equal(empty.data.totalCents, 0);
});
test('les lignes répétées sont agrégées avant vérification du stock', async () => {
  const result = await quote([
    { productId: 'vase-aube', quantity: 5 },
    { productId: 'vase-aube', quantity: 5 },
  ]);
  assert.equal(result.status, 409);
});
test('quantités nulles, négatives, fractionnaires, chaînes et stock insuffisant sont refusés', async () => {
  for (const quantity of [0, -1, 1.5, '2', 100]) {
    assert.equal(
      (await quote([{ productId: 'mug-nuage', quantity }])).status,
      400,
    );
  }
  assert.equal(
    (await quote([{ productId: 'lampe-luna', quantity: 8 }])).status,
    409,
  );
  assert.equal(
    (await quote([{ productId: 'organiseur-accord', quantity: 1 }])).status,
    409,
  );
  assert.equal(
    (await quote([{ productId: 'inconnu', quantity: 1 }])).status,
    404,
  );
});
test('JSON invalide, gros payload et mauvais type de contenu produisent des erreurs contrôlées', async () => {
  for (const [body, contentType, expected] of [
    ['{', 'application/json', 400],
    ['{}', 'text/plain', 415],
    [JSON.stringify({ padding: 'x'.repeat(34000) }), 'application/json', 413],
  ]) {
    const response = await fetch(base + '/api/cart/quote', {
      method: 'POST',
      headers: { 'Content-Type': contentType },
      body,
    });
    assert.equal(response.status, expected);
    assert.equal(typeof (await response.json()).error, 'string');
  }
});
test('les routes inconnues et les méthodes non autorisées sont explicites', async () => {
  assert.equal((await get('/api/absent')).status, 404);
  assert.equal((await get('/api/cart/quote')).status, 405);
  assert.equal(
    (await fetch(base + '/api/products', { method: 'DELETE' })).status,
    405,
  );
});
test('les pages profondes et les illustrations sont servies après compilation', async () => {
  const page = await fetch(base + '/produit/gourde-nomade');
  assert.equal(page.status, 200);
  assert.match(await page.text(), /id="root"/);
  const image = await fetch(base + products[0].images[0]);
  assert.equal(image.status, 200);
  assert.equal(image.headers.get('content-type'), 'image/svg+xml');
  const head = await fetch(base + '/catalogue', { method: 'HEAD' });
  assert.equal(head.status, 200);
  assert.equal(await head.text(), '');
  assert.equal((await fetch(base + '/.env')).status, 404);
});
