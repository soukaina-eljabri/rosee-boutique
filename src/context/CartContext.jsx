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
