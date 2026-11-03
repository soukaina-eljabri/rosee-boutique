export async function api(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: {
      ...options.headers,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    },
  });
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error('Le serveur a renvoyé une réponse inattendue.');
  }
  if (!response.ok) throw new Error(data.error || 'Une erreur est survenue.');
  return data;
}
