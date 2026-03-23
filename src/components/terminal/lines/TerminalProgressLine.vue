<script setup lang="ts">
defineProps({
  line: { type: Object, required: true },
})
</script>

<template>
  <div class="terminal-line flex flex-wrap items-baseline gap-x-1 whitespace-pre">
    <span class="text-term-text whitespace-pre">[</span>
    <span
      class="progressbar"
      :style="{
        '--progress-scale': Math.max(0, Math.min(1, (line.content?.percent ?? 0) / 100)),
        '--progress-steps': Math.max(1, Number(line.content?.width ?? 18)),
      }"
      role="img"
      :aria-label="`Progress ${line.content?.percent ?? 0}%`"
    >
      <span class="progressbar-base" aria-hidden="true">{{ '░'.repeat(Number(line.content?.width ?? 18)) }}</span>
      <span class="progressbar-fill" aria-hidden="true">{{ '█'.repeat(Number(line.content?.width ?? 18)) }}</span>
    </span>
    <span class="text-term-text whitespace-pre">]</span>
    <span class="text-term-text whitespace-pre"> {{ line.content?.percent ?? 0 }}%</span>
  </div>
</template>

<style scoped>
.progressbar {
  position: relative;
  display: inline-block;
  line-height: 1;
}

.progressbar-base {
  color: color-mix(in srgb, var(--term-muted) 70%, transparent);
}

.progressbar-fill {
  position: absolute;
  inset: 0;
  color: var(--term-success);
  transform-origin: left center;
  transform: scaleX(0);
  animation: progress-fill 900ms steps(var(--progress-steps)) forwards;
}

@keyframes progress-fill {
  to {
    transform: scaleX(var(--progress-scale));
  }
}
</style>

