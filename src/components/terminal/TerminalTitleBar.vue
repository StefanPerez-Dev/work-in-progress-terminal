<script setup lang="ts">
import avatarImage from '../../assets/avatar.png'
import profileContent from '../../content/profile.json'
</script>

<template>
  <div
    class="flex items-start justify-between px-6 pt-4 pb-5 border-b border-term-border/35 bg-term-surface shrink-0 select-none">
    <div class="flex items-center gap-3 min-w-0 flex-1">
      <div
        class="w-20 h-20 rounded-full overflow-hidden shrink-0 ring-1 ring-term-border/70 shadow-sm">
        <img :src="avatarImage" alt="profile picture" class="w-full h-full object-cover" />
      </div>
      <div class="min-w-0 leading-tight">
        <p class="text-term-text text-xl md:text-2xl font-semibold truncate">{{ profileContent.name }}</p>
        <p class="text-term-muted text-base md:text-lg font-normal truncate">{{ profileContent.title }}</p>
        <p class="text-term-muted text-sm md:text-base truncate">{{ profileContent.tagline }}</p>
      </div>
    </div>
  </div>
</template>
