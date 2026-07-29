export default function StarRating({ value = 0, count, size = 'text-base', onChange }) {
  const estrellas = [1, 2, 3, 4, 5];
  const interactivo = typeof onChange === 'function';

  return (
    <span className={`inline-flex items-center gap-0.5 ${size}`}>
      {estrellas.map((n) => (
        <button
          key={n}
          type="button"
          disabled={!interactivo}
          onClick={() => onChange?.(n)}
          className={`${interactivo ? 'cursor-pointer' : 'cursor-default'} leading-none`}
          aria-label={`${n} estrellas`}
        >
          <span className={n <= Math.round(value) ? 'text-amber-400' : 'text-gray-300'}>★</span>
        </button>
      ))}
      {typeof count === 'number' && (
        <span className="ml-1 text-xs text-gray-500">
          {value ? value.toFixed(1) : 'Sin calificar'} {count > 0 ? `(${count})` : ''}
        </span>
      )}
    </span>
  );
}
