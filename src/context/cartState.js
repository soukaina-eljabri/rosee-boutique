export const CART_KEY = 'rosee:cart:v1';

export function parseSavedCart(raw) {
  try {
    const saved = JSON.parse(raw);
    if (saved?.version !== 1 || !Array.isArray(saved.items)) return [];
    const unique = new Map();
    for (const item of saved.items.slice(0, 40)) {
      if (
        typeof item?.productId === 'string' &&
        /^[-a-z0-9]{1,80}$/.test(item.productId) &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0 &&
        item.quantity <= 99
      ) {
        unique.set(item.productId, {
          productId: item.productId,
          quantity: item.quantity,
        });
      }
    }
    return [...unique.values()];
  } catch {
    return [];
  }
}

export function cartReducer(items, action) {
  switch (action.type) {
    case 'add': {
      if (
        !Number.isInteger(action.quantity) ||
        action.quantity < 1 ||
        action.max < 1
      )
        return items;
      const existing = items.find(
        (item) => item.productId === action.productId,
      );
      const quantity = Math.min(
        (existing?.quantity || 0) + action.quantity,
        action.max,
        99,
      );
      return existing
        ? items.map((item) =>
            item.productId === action.productId ? { ...item, quantity } : item,
          )
        : [...items, { productId: action.productId, quantity }];
    }
    case 'quantity':
      if (!Number.isInteger(action.quantity) || action.quantity < 1)
        return items;
      return items.map((item) =>
        item.productId === action.productId
          ? { ...item, quantity: Math.min(action.quantity, action.max, 99) }
          : item,
      );
    case 'remove':
      return items.filter((item) => item.productId !== action.productId);
    case 'reconcile':
      return items.flatMap((item) => {
        const stock = action.products.get(item.productId)?.stock || 0;
        return stock > 0
          ? [{ ...item, quantity: Math.min(item.quantity, stock, 99) }]
          : [];
      });
    default:
      return items;
  }
}
