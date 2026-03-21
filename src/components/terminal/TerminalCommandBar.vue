<script setup lang="ts">
const props = defineProps<{
  commands: readonly string[]
  hint: string
  ariaLabel: string
}>()

const emit = defineEmits<{
  (e: 'run', command: string): void
}>()
</script>

<template>
  <div class="border-t border-term-border/60 bg-term-bg/40 shrink-0">
    <div class="px-4 pt-3 pb-2 text-term-muted text-xs md:hidden">
      {{ props.hint }}
    </div>
    <div
      class="px-4 pb-3 flex flex-wrap gap-2"
      role="toolbar"
      :aria-label="props.ariaLabel"
    >
      <button
        v-for="cmd in props.commands"
        :key="cmd"
        type="button"
        class="command-chip"
        :aria-label="`Run ${cmd}`"
        @click="emit('run', cmd)"
      >
        <span class="text-term-prompt font-semibold">$</span>
        <span class="text-term-text">{{ cmd }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.command-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.45rem 0.6rem;
  border-radius: 9999px;
  border: 1px solid color-mix(in srgb, var(--term-border) 60%, transparent);
  background: color-mix(in srgb, var(--term-surface) 70%, transparent);
  line-height: 1;
  font-size: 0.9em;
  white-space: normal;
  max-width: 100%;
  min-width: 0;
}

.command-chip:hover {
  border-color: color-mix(in srgb, var(--term-border) 75%, transparent);
  background: color-mix(in srgb, var(--term-surface) 85%, transparent);
}

.command-chip:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--term-accent) 40%, transparent);
}
</style>

