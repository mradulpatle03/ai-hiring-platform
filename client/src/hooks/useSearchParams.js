import { useSearchParams } from 'react-router-dom'
import { useCallback }     from 'react'

export const useFilters = (defaults = {}) => {
  const [params, setParams] = useSearchParams()

  const get = (key) => params.get(key) ?? defaults[key] ?? ''

  const set = useCallback((updates) => {
    setParams(prev => {
      const next = new URLSearchParams(prev)
      Object.entries(updates).forEach(([k, v]) => {
        if (v === '' || v === null || v === undefined) next.delete(k)
        else next.set(k, String(v))
      })
      // Reset page when filters change
      if (!('page' in updates)) next.set('page', '1')
      return next
    })
  }, [setParams])

  const reset = useCallback(() => setParams({}), [setParams])

  const toObject = useCallback(() => {
    const obj = {}
    params.forEach((v, k) => { obj[k] = v })
    return obj
  }, [params])

  return { get, set, reset, toObject, params }
}