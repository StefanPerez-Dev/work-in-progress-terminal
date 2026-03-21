import { ref, nextTick } from 'vue'

/**
 * Input state and submit handler for the terminal command line.
 * @param {(cmd: string) => void} runCommand - Called with the current input value on submit
 * @returns {{ inputValue: Ref<string>, inputLineRef: Ref, focusInput: () => void, onSubmit: () => void }}
 */
export function useTerminalInput(runCommand) {
  const inputValue = ref('')
  const inputLineRef = ref(null)

  function focusInput() {
    inputLineRef.value?.focusInput?.()
  }

  function onSubmit() {
    const cmd = inputValue.value
    if (!cmd?.trim()) return
    runCommand(cmd.trim())
    inputValue.value = ''
    nextTick(focusInput)
  }

  return {
    inputValue,
    inputLineRef,
    focusInput,
    onSubmit,
  }
}
