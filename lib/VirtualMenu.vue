<template>
  <div :class="bem('margin')" v-show="check"/>
  <div :class="[bem(), (navigator && !fullScreen) ? bem('bottom-up') : bem('bottom-down')]" v-show="check">
    <slot />
  </div>
</template>
<script>
import { computed, inject } from 'vue';
import { useStore } from 'vuex';
import { createBEM } from '@/utils/bem.js';
export default {
  name: 'VirtualMenu',
  setup() {
    const store = useStore();
    const navigator = computed(() => store.state.common.navigator);
    const check = computed(() => store.state.common.check);

    return {
      bem: createBEM('virtual-menu'),
      navigator,
      check,
      fullScreen: inject('fullScreen'),
    };
  }
};
</script>
<style lang="scss" scoped>
@import "@/styles/variables.scss";
@import "@/styles/mixins/text.scss";
.virtual-menu {
 @include descriptive-text;
  position: fixed;
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-around;
  align-items: center;
  background-color: white;
  width: 100%;
  height: $button-large-height;
  color: $blue;
  z-index: 10;
  transition: all 0.3s ease;
  &__bottom-up {
    bottom: $nav-bar-height;
  }
  &__bottom-down {
    bottom: 0;
  }
  &__margin {
    margin-top: $button-large-height;
  }
}
</style>