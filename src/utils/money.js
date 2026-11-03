const formatter = new Intl.NumberFormat('fr-MA', {
  style: 'currency',
  currency: 'MAD',
  maximumFractionDigits: 2,
});
export function money(cents) {
  return formatter.format(cents / 100);
}
