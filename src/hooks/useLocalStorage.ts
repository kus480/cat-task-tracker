import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  deserialize?: (value: unknown) => T,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    const storedValue = window.localStorage.getItem(key);
    if (storedValue === null) {
      return initialValue;
    }

    const parsedValue: unknown = JSON.parse(storedValue);
    return deserialize ? deserialize(parsedValue) : (parsedValue as T);
  });

  useEffect(() => {
    const serializedValue = JSON.stringify(value);
    if (serializedValue === undefined) {
      throw new TypeError(`Value for localStorage key "${key}" is not serializable`);
    }

    window.localStorage.setItem(key, serializedValue);
  }, [key, value]);

  return [value, setValue];
}
