<template>
  <div class="slidev-layout center">
    <div class="my-auto">
      <slot />
    </div>
  </div>
</template>

<style>
.slidev-layout.center {
  @apply flex items-center justify-center min-h-screen p-8;
}
</style>
