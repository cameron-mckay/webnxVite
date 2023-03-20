<template>
  <div
    class="pointer-events-auto fixed top-0 left-0 z-50 h-full w-full overflow-y-scroll"
  >
    <div
      class="pointer-events-none fixed top-0 left-0 z-40 h-full w-full bg-zinc-700 opacity-50"
    ></div>
    <div
      class="pointer-events-auto fixed top-0 left-0 z-30 -ml-8 h-full w-full"
      @click="$emit('toggle')"
    ></div>
    <div
      class="pointer-events-auto relative z-50 mx-auto mt-32 block max-w-xl rounded-xl bg-zinc-300 p-4 shadow-lg"
    >
      <slot></slot>
    </div>
  </div>
</template>
