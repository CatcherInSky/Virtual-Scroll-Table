<template>
  <div
    v-if="show"
    class="virtual-tooltip-modal"
    @click.self="$emit('update:show', false)"
    @touchmove.stop.prevent
  >
    <div
      ref="tooltip"
      :class="['virtual-tooltip', `virtual-tooltip-${horizontal + vertical}`]"
      :style="`top: ${size.top}px; left: ${size.left}px`"
      @click.capture="$emit('update:show', false)"
    >
      <slot />
    </div>
  </div>
</template>
<script>
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
  setup(props) {
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
    return {
      size,
      tooltip,
    };
  },
};
</script>
<style lang="scss" scoped>
.virtual-tooltip {
  position: fixed !important;
  z-index: 2;
  display: flex;
  color: #fff;
  background: #646566;
  border: 1px solid #ebedf0;
  border-radius: 4px;
  padding: 4px;
  box-shadow: 0 2px 10px #f3f3f5;
  
  // 取消长按自动选中文字
  -webkit-touch-callout:none;
  -webkit-user-select:none;
  -khtml-user-select:none;
  -moz-user-select:none;
  -ms-user-select:none;
  user-select:none;

  &-modal {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    z-index: 2;
  }
  &-righttop:after {
    content: '';
    position: absolute;
    display: block;
    z-index: -1;
    left: 15px;
    bottom: -5px;
    border-left: 10px solid transparent;
    border-top: 10px solid #646566;
    border-right: 10px solid transparent;
  }
  &-lefttop:after {
    content: '';
    position: absolute;
    display: block;
    z-index: -1;
    right: 15px;
    bottom: -5px;
    border-left: 10px solid transparent;
    border-top: 10px solid #646566;
    border-right: 10px solid transparent;
  }
  &-rightbottom:after {
    content: '';
    position: absolute;
    display: block;
    z-index: -1;
    left: 15px;
    top: -5px;
    border-left: 10px solid transparent;
    border-bottom: 10px solid #646566;
    border-right: 10px solid transparent;
  }
  &-leftbottom:after {
    content: '';
    position: absolute;
    display: block;
    z-index: -1;
    right: 15px;
    top: -5px;
    border-left: 10px solid transparent;
    border-bottom: 10px solid #646566;
    border-right: 10px solid transparent;
  }
}
</style>
