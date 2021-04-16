<template>
  <div class="virtual-cell">
    <slot />
  </div>
</template>
<script>
export default {
  name: 'VirtualCell',
};
</script>
<style lang="scss" scoped>
.virtual-cell {
  width:100%; 
  line-height: 18px;
  font-size: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-sizing: border-box;
  padding: 2px 4px;
  overflow: hidden;
}
</style>