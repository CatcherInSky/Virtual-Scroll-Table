
<template>
  <div ref="header" data-key="header"></div>
  <div
    v-if="!loading"
    ref="root"
    :class="bem()" 
    :style="`padding: ${padding.top}px 0 ${padding.bottom}px`"
    v-press="{handler: pressing}"
  >
    <slot v-if="data && data.length"/>
    <div v-else :class="bem('empty')" :style="`height: ${emptyHeight}`">暂无数据</div>
  </div>
  <div v-else :class="bem('loading')" :style="`height: ${emptyHeight}`">
    <VanLoading size="24px" vertical />
  </div>
  <div ref="footer" data-key="footer"></div>
  <VirtualTooltip 
    v-if="existTooltip"
    v-model:show="showTooltip" 
    :horizontal="horizontal"
    :vertical="vertical"
    :container="container"
  >
    <slot name="tooltip" />
  </VirtualTooltip>
  <VirtualMenu>
    <slot name="menu" />
  </VirtualMenu>
</template>
<script>
import { ref, toRefs, onMounted, provide, reactive, readonly, computed, watch, onBeforeUnmount } from 'vue';
import { createBEM } from '@/utils/bem.js';
import { getEventPath } from '@/utils/dom.js';
import { getValueByPath } from '@/utils/handle-object.js';
import { VirtualScroll } from './EventScroll';
import { press } from './Directives';
import VirtualTooltip from './VirtualTooltip.vue';
import VirtualMenu from './VirtualMenu.vue';
export default {
  name: 'VirtualTable',
  props: {
    data: {
      type: Array,
      default: () => [],
    },
    sort: {
      type: Object,
      default: () => {
        return {
          label: '',
          path: '',
          type: 'descending'
        };
      },
    },
    show: {
      type: Number, 
      default: 30,
    },
    height: {
      type: Number,
      default: 40,
    },
    width: {
      type: Number, 
      default: 90,
    },
    check: {
      type: Boolean
    },
    // 表头滚动后重设基准高度
    fixedHeight: {
      type: Number,
      default: 95,
      // document.querySelector('#anchor .van-sticky').getBoundingClientRect().height
    },
    loading: {
      type: Boolean,
      default: true,
    },
    // 加载中或无数据高度
    emptyHeight: {
      type: String,
      default: '300px' 
      // 横屏50 竖屏205 账户138 293
    },
  },
  components: {
    VirtualTooltip,
    VirtualMenu,
  },
  directives: {
    press,
  },
  emits: ['select'],
  setup(props, context) {
    const existTooltip = context.slots.tooltip && true;
    const { data, sort, show, height, width, fixedHeight } = toRefs(props);
    const root = ref(null);
    const header = ref(null);
    const footer = ref(null);
    provide('height', readonly(height));
    const sortedData = computed(() => {
      const { path, type } = sort.value;
      if(!type || !path) {
        return data.value;
      } else {
        const getValue = (obj, path) => ['info.ad_create_time'].includes(path) 
          ? new Date(getValueByPath(obj, path) || null).getTime()
          : Number(getValueByPath(obj, path) || 0);
        return data.value.sort((a, b) => (getValue(a, path) - getValue(b, path)) * (type === 'descending' ? -1 : 1));
      }
    });
    watch(sortedData, data => {
      data && data.forEach((item, index) => item.id = index);
    }, {immediate: true});
    watch(root, (root) => {
      root && root.children.forEach((ele, index) => {
        ele.dataset.column = index;
      });
    });
    // 计算宽度
    const colWidth = ref(0);
    provide('width', readonly(colWidth));
    const getColWidth = () => {
      try {
        const slots =  context.slots.default();
        const col = slots[slots.length - 1].children.length || (slots.length - 1) + 1;
        const clientWidth = document.documentElement.clientWidth || document.body.clientWidth;
        return Math.max(clientWidth / col, width.value) || width.value;
      } catch (e) {
        window.console.log('宽度计算错误', e);
        return width.value;
      }
    };
    const getColWidths = () => {
      colWidth.value = getColWidth();
    };
    // resize 触发
    onMounted(() => {
      setTimeout(() => {
        getColWidths();
        window.addEventListener('resize', getColWidths, {passive: true});
      });
    });
    onBeforeUnmount(() => {
      window.removeEventListener('resize', getColWidths);
    });

    
    const core = new VirtualScroll(sortedData, show, height, header, fixedHeight);
    const padding = core.padding;
    onMounted(() => core.getHeaderHeight(0));
    onBeforeUnmount(() => core.destroy());
    provide('data', sortedData);
    provide('fragment', core.fragment);
    provide('scrolling', readonly(core.scrolling));
    provide('top', readonly(core.tableTop));


    // 全局记录高亮行列
    const position = reactive({
      column: undefined,
      row: undefined,
    });
    const updatePosition = ({row, column}) => {
      row = row === undefined ? undefined : Number(row);
      column = column === undefined ? undefined : Number(column);
      if(position.row === row && position.column === column) {
        position.row = undefined;
        position.column = undefined;
      } else {
        position.row = row;
        position.column = column;
      }
    };
    provide('position', readonly(position));
    provide('updatePosition', updatePosition);
    // 长按
    const showTooltip = ref(false);
    const horizontal = ref('');
    const vertical = ref('');
    const container = ref({});
    const pressing = (e) => {
      let target = (getEventPath(e)).find(el => el && el.dataset && el.dataset.row !== undefined);
      if(!target) {
        window.console.log('找不到target', e);
        return;
      }
      let rowIndex = target.dataset.row;
      updatePosition({ row: rowIndex });
      console.log(sortedData.value[rowIndex]);
      context.emit('select', rowIndex);
      // 弹窗位置
      const {top, left, bottom, right} = target.getBoundingClientRect();
      container.value = {top, left, bottom, right};
      let clientHeight = document.documentElement.clientHeight || document.body.clientHeight;
      let clientWidth = document.documentElement.clientWidth || document.body.clientWidth;
      vertical.value = top < clientHeight / 2 ? 'bottom': 'top';
      horizontal.value = left < clientWidth / 2 ? 'right' : 'left';

      showTooltip.value = true;
      
    };

    return {
      bem: createBEM('virtual-table'),
      padding,
      root,
      header,
      footer,
      pressing,
      existTooltip,
      showTooltip,
      container,
      horizontal,
      vertical,
      // setHeight,
    };
  },
};

</script>

<style lang="scss" scoped>
@import "@/styles/variables.scss";
.virtual-table {
  display: flex;
  overflow-x: scroll;
  background: $gray-1;
  backface-visibility: hidden;
  width: 100%;
  &__main {
    white-space:nowrap;
    overflow:hidden;
    text-overflow:ellipsis;
  }
  &__main2 {
    word-break: break-all;
    text-overflow: ellipsis;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  &__sub {
    font-size: $font-size-xs;
    color: $gray-6;
    white-space:nowrap;
    overflow:hidden;
    text-overflow:ellipsis;
  }
  &__empty {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background: $white;
  }
  &__loading {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background: $white;
    color: $blue;
  }
}
</style>