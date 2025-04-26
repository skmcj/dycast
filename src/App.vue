<template>
  <IndexView />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import IndexView from './views/IndexView.vue';
</script>

<style lang="scss">
body::selection {
  background-color: #8b968d;
  color: #fff;
}
</style>
