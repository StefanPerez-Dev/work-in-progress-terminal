import { ref, onMounted } from 'vue'

/**
 * Reactive preference for reduced motion. Updates on mount and can be re-checked.
 */
export function useReducedMotion() {
  const reducedMotion = ref(false)

  function detect() {
    reducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  onMounted(detect)

  return { reducedMotion, detectReducedMotion: detect }
}
