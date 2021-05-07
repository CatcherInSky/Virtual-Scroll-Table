
<template>
  <div ref="background" class="virtual-container" :style="tableHeight && `max-height: ${tableHeight}px`">
    <div 
      v-if="!loading && data && data.length"
      v-press="{ handler: pressing }"
      ref="table"
      class="virtual-table" 
      :style="`padding: ${padding.top}px 0 ${padding.bottom}px`"
    >
      <slot />
    </div>
    <div
      v-else-if="loading"
      :class="[
        'virtual-table-else',
        'virtual-table-loading'
      ]" 
    >
      <span :class="[
        'iconfont',
        'icon-loading',
        'virtual-table-loading-icon'
      ]" />
      {{ loadingText }}
    </div>
    <div 
      v-else
      :class="[
        'virtual-table-else',
        'virtual-table-empty'
      ]" 
    >
      {{ emptyText }}
    </div>
    <virtual-tooltip 
      v-model:show="showTooltip" 
      :horizontal="horizontal"
      :vertical="vertical"
      :container="container"
    >
      <slot name="tooltip" :row="selected_row"/>
    </virtual-tooltip>
    <virtual-menu v-if="menu && selected_rows.length" :bottomHeight="0">
      <slot name="menu" :rows="selected_rows"/>
    </virtual-menu>
  </div>
</template>
<script>
import { ref, toRefs, onMounted, provide, reactive, readonly, computed, watch, onBeforeUnmount } from 'vue';
import { getDomPath, getValueByPath } from './utils/tool.js';
import { VirtualScroll } from './utils/core.js';
import { press } from './utils/directives.js';
import VirtualTooltip from './VirtualTooltip.vue';
import VirtualMenu from './VirtualMenu.vue';
export default {
  name: 'VirtualTable',
  props: {
    data: {
      type: Array,
      default: () => [],
    },
    show: {
      type: Number, 
      default: 30,
    },
    tableHeight: {
      type: Number,
    },
    fixedHeader: {
      type: Boolean,
      default: true,
    },
    height: {
      type: Number,
      default: 40,
    },
    width: {
      type: Number, 
      default: 90,
    },
    loading: {
      type: Boolean,
      default: true,
    },
    loadingText: {
      type: String,
      default: '加载中',
    },
    emptyText: {
      type: String,
      default: '暂无数据',
    },
    menu: {
      type: Boolean,
      default: false,
    }
  },
  components: {
    VirtualTooltip,
    VirtualMenu,
  },
  directives: {
    press,
  },
  emits: ['sort', 'checkbox'],
  setup(props, context) {
    // refs 
    const table = ref(null);    
    watch(table, (table) => {
      // 每列dataset加标志
      table && table.children.forEach((ele, index) => {
        ele.dataset.column = index;
      });
    });

    const { data, show, height, width, tableHeight, fixedHeader } = toRefs(props);
    // 给每行数据打上标志符_id
    watch(data, data => {
      data && data.forEach((item, index) => item._id = index);
    }, {immediate: true});
    // 高度
    provide('height', readonly(height));
    // 动态计算宽度
    const colWidth = ref(0);
    provide('width', readonly(colWidth));
    const getColWidth = () => {
      try {
        const slots = context.slots.default();
        // const col = slots[slots.length - 1].children.length || (slots.length - 1) + 1;
        const col = slots.length;
        const clientWidth = document.documentElement.clientWidth || document.body.clientWidth;
        colWidth.value =  Math.max(clientWidth / col, width.value) || width.value;
      } catch (e) {
        console.log('宽度计算错误', e);
        colWidth.value =  width.value;
      }
    };
    onMounted(() => {
      // resize 触发
      setTimeout(() => {
        getColWidth();
        window.addEventListener('resize', getColWidth, {passive: true});
      });
    });
    onBeforeUnmount(() => {
      window.removeEventListener('resize', getColWidth);
    });

    // 排序相关
    const sort = ref(null);
    const updateSort = (item) => {
      sort.value = item;
      context.emit('sort', item)
    };
    provide('sort', readonly(sort));
    provide('updateSort', updateSort);

    const sortedData = computed(() => {
      if(!sort.value) {
        return data.value;
      }
      const { path, order } = sort.value;
      if(!path) {
        return data.value;
      } else {
        return [...data.value].sort((a, b) => {
          let A = Number(getValueByPath(a, path) || 0), B = Number(getValueByPath(b, path) || 0);
          if(isNaN(A) || isNaN(B)) {
            return 1;
          } else {
            return (A - B) * (order === 'descend' ? -1 : 1)
          }
        });
      }
    });

    // 虚拟滚动计算
    const core = new VirtualScroll(sortedData, show, height, table, tableHeight);

    const padding = core.padding;
    provide('data', sortedData);
    provide('fragment', core.fragment);
    provide('headerTop', fixedHeader.value ? readonly(core.headerTop) : 0);
    provide('headerShow', fixedHeader.value ? readonly(core.headerShow) : false);
    provide('headerSticky', Boolean(tableHeight && tableHeight.value > 0));
    onBeforeUnmount(() => core.destroy());

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
    const selected_row = ref(null);
    const showTooltip = ref(false);
    const horizontal = ref('');
    const vertical = ref('');
    const container = ref({});
    const pressing = (e) => {
      let target = (getDomPath(e)).find(el => el && el.dataset && el.dataset.row !== undefined);
      if(!target) {
        window.console.log('找不到target', e);
        return;
      }
      let rowIndex = target.dataset.row;
      updatePosition({ row: rowIndex });
      selected_row.value = sortedData.value.find(it => it._id == rowIndex);
      console.log(selected_row.value);
      // 不存在tooltip
      if(!context.slots.tooltip) {
        return;
      } 
      // 弹窗位置
      const {top, left, bottom, right} = target.getBoundingClientRect();
      container.value = {top, left, bottom, right};
      let clientHeight = document.documentElement.clientHeight || document.body.clientHeight;
      let clientWidth = document.documentElement.clientWidth || document.body.clientWidth;
      vertical.value = top < clientHeight / 2 ? 'bottom': 'top';
      horizontal.value = left < clientWidth / 2 ? 'right' : 'left';
      showTooltip.value = true;
    };

    // checkbox模式相关
    const selected_rows = ref([]);
    const updateList = (e) => {
      selected_rows.value = e;
      context.emit('checkbox', e)
    };
    provide('list', readonly(selected_rows));
    provide('updateList', updateList);

    return {
      padding,
      table,
      pressing,
      showTooltip,
      container,
      horizontal,
      vertical,
      selected_rows,
      selected_row,
    };
  },
};
</script>

<style lang="scss">
@import './assets/iconfont.css';
// body,
// #app,
.virtual-container {
  width: 100%;
  height: 100%;
  overflow-x: scroll;
  // overflow: scroll;
  // max-height: 100vh;
  max-width: 100vw;
  // display: table !important;
}
.virtual-table {
  // display: flex;
  // 宽度由子元素总宽度决定
  display: inline-flex;
  // overflow-x: scroll;
  backface-visibility: hidden;
  // width: 100%;
  // position: relative;
  &-else {
    display: flex;
    justify-content: center;
    align-items: center;
    background: #fff;
    width: 100vw;
    height: 300px;
  }
  &-empty {
  }
  &-loading {
    flex-direction: column;
    color: #1989fa;
    &-icon {
      @keyframes rotate {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }
      // transform-origin: 2 1;
      animation: rotate 3s linear 0s infinite;
    }
  }
}
</style>