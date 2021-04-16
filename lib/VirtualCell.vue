<template>
  <div 
    :class="bem()" 
    :style="`height: ${height}px`"
  >
    <slot />
  </div>
</template>
<script>
import { createBEM } from '@/utils/bem.js';
export default {
  name: 'VirtualCell',
  props: {
    height: {
      type: Number,
      default: 40,
    },
  },
  setup() {
    return {
      bem: createBEM('virtual-cell'),
    };
  }
};
</script>
<style lang="scss" scoped>
@import "@/styles/variables.scss";
.virtual-cell {
  width:100%; 
  line-height: $line-height-sm;
  font-size: $font-size-sm;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: $white;
  box-sizing: border-box;
  padding: $padding-base / 2 $padding-base;
  overflow: hidden;
}
</style>