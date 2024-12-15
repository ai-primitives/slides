<template>
  <div class="slidev-layout split">
    <slot />
  </div>
</template>

<style>
.slidev-layout.split {
  @apply grid grid-cols-2 gap-8 p-8;
}
</style>
