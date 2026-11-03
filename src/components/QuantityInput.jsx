import Icon from './Icon.jsx';
export default function QuantityInput({ value, max, onChange, label }) {
  return (
    <div
      className="quantity-control"
      role="group"
      aria-label={`Quantité de ${label}`}
    >
      <button
        type="button"
        aria-label={`Diminuer la quantité de ${label}`}
        disabled={value <= 1}
        onClick={() => onChange(value - 1)}
      >
        <Icon name="minus" size={14} />
      </button>
      <output aria-live="polite">{value}</output>
      <button
        type="button"
        aria-label={`Augmenter la quantité de ${label}`}
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
      >
        <Icon name="plus" size={14} />
      </button>
    </div>
  );
}
