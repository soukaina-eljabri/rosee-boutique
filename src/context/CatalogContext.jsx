import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api.js';

const CatalogContext = createContext(null);
export function CatalogProvider({ children }) {
  const [state, setState] = useState({
    products: [],
    categories: [],
    shop: null,
    status: 'loading',
    error: '',
  });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setState((old) => ({ ...old, status: 'loading', error: '' }));
    api('/products', { signal: controller.signal })
      .then((data) => {
        setState({ ...data, status: 'ready', error: '' });
      })
      .catch((error) => {
        if (error.name !== 'AbortError')
          setState((old) => ({
            ...old,
            status: 'error',
            error: error.message,
          }));
      });
    return () => controller.abort();
  }, [attempt]);
  return (
    <CatalogContext.Provider
      value={{ ...state, retry: () => setAttempt((n) => n + 1) }}
    >
      {children}
    </CatalogContext.Provider>
  );
}
export function useCatalog() {
  return useContext(CatalogContext);
}
