import { useEffect, useState } from 'react'

const getInitialValue = (key, defaultValue) => {
  try {
    const storedValue = window.localStorage.getItem(key)
    return storedValue ? JSON.parse(storedValue) : defaultValue
  } catch {
    return defaultValue
  }
}

export const useLocalStorage = (key, defaultValue) => {
  const [value, setValue] = useState(() => getInitialValue(key, defaultValue))

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  return [value, setValue]
}
