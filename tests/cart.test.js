import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseSavedCart, cartReducer } from '../src/context/cartState.js';

test('un panier corrompu ou d’une ancienne version ne casse pas le démarrage', () => {
  for (const value of [
    null,
    'invalide',
    '{}',
    '{"version":2,"items":[]}',
    '{"version":1,"items":null}',
  ]) {
    assert.deepEqual(parseSavedCart(value), []);
  }
  const saved = parseSavedCart(
    JSON.stringify({
      version: 1,
      items: [
        { productId: 'mug-nuage', quantity: 2 },
        { productId: 'gourde-nomade', quantity: -1 },
        { productId: 'mug-nuage', quantity: 3 },
        { productId: '../secret', quantity: 1 },
      ],
    }),
  );
  assert.deepEqual(saved, [{ productId: 'mug-nuage', quantity: 3 }]);
});
test('un panier restauré se réconcilie avec le stock et retire les produits disparus', () => {
  const initial = [
    { productId: 'a', quantity: 5 },
    { productId: 'b', quantity: 2 },
    { productId: 'deleted', quantity: 1 },
  ];
  const products = new Map([
    ['a', { stock: 3 }],
    ['b', { stock: 0 }],
  ]);
  assert.deepEqual(cartReducer(initial, { type: 'reconcile', products }), [
    { productId: 'a', quantity: 3 },
  ]);
});
test('des ajouts successifs ne dépassent pas le stock et la suppression vide la ligne', () => {
  let state = cartReducer([], {
    type: 'add',
    productId: 'mug',
    quantity: 2,
    max: 3,
  });
  state = cartReducer(state, {
    type: 'add',
    productId: 'mug',
    quantity: 2,
    max: 3,
  });
  assert.deepEqual(state, [{ productId: 'mug', quantity: 3 }]);
  assert.deepEqual(
    cartReducer(state, { type: 'remove', productId: 'mug' }),
    [],
  );
});
