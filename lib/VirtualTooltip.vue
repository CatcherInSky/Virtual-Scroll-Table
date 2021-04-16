<template>
  <!-- <transition name="fade"> -->
    <div
      v-if="show"
      @click.self="handleClose"
      :class="bem('modal')"
      @touchmove.stop.prevent
    >
      <div
        :class="[bem(), bem(horizontal + vertical)]"
        :style="`top:${size.top}px;left:${size.left}px`"
        @click.capture="$emit('update:show', false)"
        id="VirtualTooltip"
        ref="tooltip"
      >
        <slot />
      </div>
    </div>
  <!-- </transition> -->
</template>
<script>
import { createBEM } from '@/utils/bem.js';
import { reactive, toRefs, watch, ref, nextTick } from 'vue';
export default {
  name: 'VirtualTooltip',
  props: {
    show: {
      type: Boolean,
    },
    container: {
      type: Object,
    },
    horizontal: {
      type: String,
    },
    vertical: {
      type: String,
    },
  },
  emits: ['update:show'],
  setup(props, context) {
    const tooltip = ref(null);

    const { vertical, horizontal, container, show } = toRefs(props);
    const size = reactive({
      top: 0,
      left: 0,
    });
    watch(show, show => {
      if (show) {
        const { top, left, bottom, right } = container.value;
        nextTick(() => {
          const { width, height } = tooltip.value.getBoundingClientRect();
          size.top = vertical.value == 'top' ? top - height - 8 : bottom + 5;
          size.left = horizontal.value == 'left' ? right - width : left;
        });
      }
    });

    const handleClose = e => {
      console.log(`触发关闭事件`, e);
      context.emit('update:show', false);
    };

    return {
      bem: createBEM('virtual-tooltip'),
      size,
      tooltip,
      handleClose,
    };
  },
};
</script>
<style lang="scss" scoped>
@import '@/styles/variables.scss';
.virtual-tooltip {
  position: fixed !important;
  z-index: 2;
  display: flex;
  color: $white;
  background: $gray-7;
  border: $border-width-base solid $gray-3;
  border-radius: $border-radius-md;
  box-shadow: 0 2px 10px $gray-1;
  // &__button {
  //   width: 33%;
  //   padding: $padding-base;
  //   display: flex;
  //   justify-content: center;
  //   align-items: center;
  //   font-size: $font-size-sm;
  //   line-height: $line-height-xs;
  //   &:hover {
  //     background: $gray-5;
  //   }
  // }
  &__modal {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    z-index: 2;
  }
  &__righttop:after {
    content: '';
    position: absolute;
    display: block;
    z-index: -1;
    left: 15px;
    bottom: -5px;
    border-left: 10px solid transparent;
    border-top: 10px solid $gray-7;
    border-right: 10px solid transparent;
  }
  &__lefttop:after {
    content: '';
    position: absolute;
    display: block;
    z-index: -1;
    right: 15px;
    bottom: -5px;
    border-left: 10px solid transparent;
    border-top: 10px solid $gray-7;
    border-right: 10px solid transparent;
  }
  &__rightbottom:after {
    content: '';
    position: absolute;
    display: block;
    z-index: -1;
    left: 15px;
    top: -5px;
    border-left: 10px solid transparent;
    border-bottom: 10px solid $gray-7;
    border-right: 10px solid transparent;
  }
  &__leftbottom:after {
    content: '';
    position: absolute;
    display: block;
    z-index: -1;
    right: 15px;
    top: -5px;
    border-left: 10px solid transparent;
    border-bottom: 10px solid $gray-7;
    border-right: 10px solid transparent;
  }
}
// .fade-enter-active,
// .fade-leave-active {
//   transition: opacity 0.5s ease;
// }
// .fade-enter-from,
// .fade-leave-to {
//   opacity: 0;
// }
</style>
