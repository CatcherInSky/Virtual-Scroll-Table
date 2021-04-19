<template>
  <div :style="`margin-top: ${placeholderHeight}`"/>
  <div
    ref="menu"
    class="virtual-menu"
    :style="`bottom: ${bottomHeight}`">
    <slot />
  </div>
</template>
<script>
import { onMounted, ref } from 'vue';
/**
 * @props bottomHeight 
 * 
 */
export default {
  name: 'VirtualMenu',
  props: {
    bottomHeight: {
      type: Number,
      default: 0,
    },
  },
  setup() {
    const menu = ref(null);
    const placeholderHeight = ref(0);
    onMounted(() => {
      menu.value && menu.value && (placeholderHeight.value = menu.value.getBoundingClientRect().height)
    });
    return {
      menu,
      placeholderHeight,
    };
  }
};
</script>
<style lang="scss" scoped>
.virtual-menu {
  font-size: 14px;
  line-height: 20px;
  position: fixed;
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-around;
  align-items: center;
  background-color: white;
  width: 100%;
  color: #1989fa;
  z-index: 10;
  transition: all 0.3s ease;
}
</style>