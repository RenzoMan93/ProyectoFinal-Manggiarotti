import { useEffect, useState } from 'react';
import { getUsdToUyuRate } from '../services/exchangeRateService';

/** Live (cached-daily) USD->UYU rate; null until the first fetch/cache read resolves. */
export function useExchangeRate() {
  const [rate, setRate] = useState(null);

  useEffect(() => {
    let active = true;
    getUsdToUyuRate().then((r) => {
      if (active) setRate(r);
    });
    return () => {
      active = false;
    };
  }, []);

  return rate;
}
