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
