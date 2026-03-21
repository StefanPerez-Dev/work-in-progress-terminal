<script setup>
import { useTemplateRef, onMounted, ref, watch, nextTick } from 'vue'

const props = defineProps({
  prompt: { type: String, required: true },
  cursorVisible: { type: Boolean, default: true },
})

const input = useTemplateRef('inputEl')

onMounted(() => {
  input.value.focus()
})

const model = defineModel({ type: String, default: '' })
const emit = defineEmits(['submit', 'focus', 'blur', 'key'])

const hasFocus = ref(false)
const caretPos = ref(0)

function syncCaretPos() {
  const el = input.value
  if (!el) return
  const pos = typeof el.selectionStart === 'number' ? el.selectionStart : model.value.length
  caretPos.value = Math.max(0, pos)
}

watch(model, () => {
  nextTick(syncCaretPos)
})

function onFocus() {
  hasFocus.value = true
  syncCaretPos()
  emit('focus')
}

function onBlur() {
  hasFocus.value = false
  emit('blur')
}

function onKeydown(event) {
  syncCaretPos()
  emit('key', event)
}
</script>

<template>
  <div class="flex items-center p-4 border-t border-term-border/60 bg-term-bg/50 shrink-0" role="form">
    <span class="text-term-prompt font-bold shrink-0 whitespace-pre" aria-hidden="true">{{ prompt }}</span>
    <span class="whitespace-pre" aria-hidden="true"> </span>
    <label class="sr-only" for="terminal-input">Command input</label>
    <div class="relative flex-1 min-w-0">
      <input
        ref="inputEl"
        id="terminal-input"
        name="terminal-input"
        v-model="model"
        type="text"
        autocomplete="off"
        autocapitalize="off"
        spellcheck="false"
        class="w-full bg-transparent text-term-text outline-none rounded pl-1 pr-1 font-normal"
        aria-label="Command input"
        :style="{
          caretColor: 'transparent',
        }"
        @keydown.enter="emit('submit')"
        @input="syncCaretPos"
        @keydown="onKeydown"
        @keyup="syncCaretPos"
        @click="syncCaretPos"
        @focus="onFocus"
        @blur="onBlur" />

      <span
        v-if="props.cursorVisible && hasFocus"
        class="custom-caret"
        :style="{ left: `calc(${caretPos} * 1ch + 0.25rem)` }"
        aria-hidden="true" />
    </div>
  </div>
</template>

<style scoped>
.custom-caret {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 5px;
  height: 1.25em;
  background: rgba(148, 163, 184, 1);
  border-radius: 2px;
  animation: caret-blink 1s steps(2, start) infinite;
  pointer-events: none;
}

@media (prefers-reduced-motion: reduce) {
  .custom-caret {
    animation: none;
  }
}

@keyframes caret-blink {
  0%,
  49% {
    opacity: 1;
  }
  50%,
  100% {
    opacity: 0;
  }
}
</style>
