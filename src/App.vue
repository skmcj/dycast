<template>
  <IndexView />
</template>

<script setup lang="ts">
import IndexView from './views/IndexView.vue';
import { printInfo, printSKMCJ } from './utils/logUtil';

setTimeout(() => {
  console?.clear();
  printSKMCJ();
  printInfo();
}, 1500);
</script>

<style lang="scss">
::selection {
  background-color: #8b968d;
  color: #fff;
}
</style>
