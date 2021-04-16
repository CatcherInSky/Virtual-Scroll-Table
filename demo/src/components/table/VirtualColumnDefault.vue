<template>
  <div 
    ref="column"
    :class="[ 
      'virtual-column', 
      fixed && 'virtual-column-fixed', 
      columnIndex === position.column && 'virtual-colomn-selected',
    ]" 
    :style="`width: ${width}px; text-align: ${align}`"
    @click="getPosition"
  >
    <virtual-cell 
      :class="[
        'virtual-column-header',
        headerClass,
      ]" 
      :style="`height: ${height}px;`"
      @click="sortChange"
    >
      <slot name="header" :column="column">
        <span 
          :class=" sort && sort.path && sort.path == path && `virtual-column-sort-${sort.order}` "
        >{{ title }}</span>
      </slot>
    </virtual-cell>
    <virtual-cell 
      v-for="(row, index) in data" 
      :key="index" 
      :height="height"
      :data-row="row._id"
      :class="[ 
        'virtual-column-body', 
        row._id === position.row && 'virtual-column-selected',
        bodyClass,
      ]" 
      :style="`height: ${height}px;`"
    >
      <slot name="body" :row="row" :index="index" :id="row._id">
        {{ getValueByPath(row, path) }}
      </slot>
    </virtual-cell>
  </div>
</template>
<script>
import { inject, computed, ref, toRefs } from 'vue';
import { getDomPath, getValueByPath } from './utils/tool.js';
import VirtualCell from './VirtualCell.vue';
export default {
  name: 'VirtualColumn',
  components: {
    VirtualCell,
  },
  props: {
    // 列类型，可选[checkbox, default]
    type: {
      type: String,
      default: 'default',
    },
    // 是否固定在左边
    fixed: {
      type: Boolean,
    },
    // 对齐
    align: {
      type: String,
      default: 'right',
    },
    // 是否可以点击排序
    sortable: {
      type: Boolean,
      default: true,
    },
    // 表头
    title: {
      type: String,
    },
    // 值路径
    path: {
      type: String,
    },
    headerClass: {
      type: String,
    },
    bodyClass: {
      type: String,
    },
  },
  setup(props) {
    // refs
    const column = ref(null);
    // 获取列数
    const columnIndex = computed(() => 
      column.value
        ? Number(column.value.dataset.column)
        : 0
    );

    // 获取选中行列
    const position = inject('position');
    const updatePosition = inject('updatePosition');
    const getPosition = (e) => {
      updatePosition(
        getDomPath(e)
        .map(el => el.dataset)
        .filter(el =>  el && (el.column || el.row)
      ).reduce(
        (total, cur) => {
          cur.column && (total.column = cur.column);
          cur.row && (total.row = cur.row);
          return total;
        }, {})
      );
    };

    // core 计算后表格数据
    const data = inject('fragment');
    const width = inject('width');
    const height = inject('height');

    // 排序相关
    const { sortable, path } = toRefs(props);
    const sort = inject('sort');
    const updateSort = inject('updateSort');
    const sortChange = () => {
      if(!sortable.value || !path || !path.value) {
        return;
      }
      const order = !sort.value || sort.value.path != path.value || sort.value.order == 'ascend' 
        ? 'descend'
        : 'ascend';
      updateSort({ path: path.value, order })
    }

    return {
      column,
      columnIndex,

      getPosition,
      position,

      data,
      width,
      height,
      
      sort,
      sortChange,

      getValueByPath,
    };
  }
};
</script>
<style lang="scss" scoped>
.virtual-column {
  // background: #f3f3f5;
  background: #fff;
  flex-shrink: 0;
  position: relative;
  cursor: pointer;
  &-header {
    z-index: 1;
    width: 100%;
    position: sticky;
    top: 0;
    border-bottom: solid 1px #ebedf0;
    background: #f3f3f5;
  }
  &-body {
    border-bottom: solid 1px #ebedf0;
  }
  &-fixed {
    position: sticky;
    left: 0;
    z-index: 2;
  }
  &-selected {
    background: #e6f7ff;
    // e6f7ff 蓝色 faab0c
  }
  &-sort {
    &-ascend::after {
      content: '';
      display: inline-block;
      bottom: 5px;
      left: 1px;
      position: relative;
      width: 0;
      height: 0;
      border: 5px solid;
      border-color: transparent transparent #1989fa transparent;
    }
    &-descend::after {
      content: '';
      display: inline-block;
      top: 5px;
      left: 1px;
      position: relative;
      width: 0;
      height: 0;
      border: 5px solid;
      border-color: #1989fa transparent transparent transparent;
    }
  }
}
</style>