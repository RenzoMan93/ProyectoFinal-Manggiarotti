import React from 'react';
import styles from './StarPicker.module.css';

/** Clickable 1-5 star rating. Clicking the currently-selected star clears it back to null. */
export default function StarPicker({ value, onChange }) {
  return (
    <div className={styles.row}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={`${styles.star} ${n <= (value || 0) ? styles.filled : ''}`}
          onClick={() => onChange(value === n ? null : n)}
          aria-label={`${n} estrella${n > 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
