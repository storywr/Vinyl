import { useEffect, useState } from 'react'

const useDebouncedValue = <T extends any>(value: T, delay: number = 500): T => {
  const [state, setState] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => setState(value), delay)

    return () => clearTimeout(handler)
  }, [value])

  return state
}

export default useDebouncedValue
