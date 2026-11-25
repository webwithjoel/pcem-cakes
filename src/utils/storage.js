export function readStorage(key, fallbackValue) {
  try {
    const storedValue = window.localStorage.getItem(key);
    return {
      value: storedValue === null ? fallbackValue : JSON.parse(storedValue),
      error: null,
    };
  } catch (error) {
    console.error(`Unable to read localStorage key "${key}".`, error);
    return { value: fallbackValue, error };
  }
}

export function writeStorage(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return null;
  } catch (error) {
    console.error(`Unable to write localStorage key "${key}".`, error);
    return error;
  }
}
