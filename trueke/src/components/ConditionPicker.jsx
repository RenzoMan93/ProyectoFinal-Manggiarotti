import React from 'react';
import { starString, USED_CONDITION_LEVELS } from '../utils/condition';
import styles from './ConditionPicker.module.css';

/** Named condition levels for "Usado" listings, backed by a 1-5 star value. */
export default function ConditionPicker({ value, onChange }) {
  return (
    <div className={styles.list}>
      {USED_CONDITION_LEVELS.map((level) => (
        <div
          key={level.stars}
          className={`${styles.row} ${value === level.stars ? styles.sel : ''}`}
          onClick={() => onChange(level.stars)}
        >
          <span className={styles.stars}>{starString(level.stars)}</span>
          <div className={styles.text}>
            <div className={styles.title}>{level.title}</div>
            {level.subtitle && <div className={styles.subtitle}>{level.subtitle}</div>}
          </div>
          <div className={styles.radioDot} />
        </div>
      ))}
    </div>
  );
}
