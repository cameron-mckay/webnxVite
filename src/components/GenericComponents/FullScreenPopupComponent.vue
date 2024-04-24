<template>
  <div
    class="pointer-events-auto fixed top-0 left-0 z-40 h-full w-full overflow-y-scroll scrollPopup"
  >
    <div
      class="pointer-events-none fixed top-0 left-0 z-30 h-full w-full bg-zinc-700 opacity-50"
    ></div>
    <div
      class="pointer-events-auto fixed top-0 left-0 z-20 -ml-8 h-full w-full"
      @click="$emit('toggle')"
    ></div>
    <div
      class="card pointer-events-auto relative z-40 mx-4 mt-32 block max-w-4xl p-4 shadow-lg transition md:mx-auto"
    >
      <slot></slot>
    </div>
  </div>
</template>
