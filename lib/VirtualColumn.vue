<template>
  <div 
    ref="column"
    :class="[bem(), fixed && bem('fixed'), columnIndex === position.column && 'virtual-selected']" 
    :style="`width: ${width}px; padding-top: ${height * 2}px; text-align: ${align}`"
    @click="getPosition"
  >
    <div 
      :class="[bem('header'), scrolling && bem('header-scrolling')]" 
      :style="`top: ${top}px`"
    >
      <VirtualCell :height="height">
        <slot name="header" />
      </VirtualCell>
      <VirtualCell :height="height" v-if="showTotal">
        <slot name="total"/>
      </VirtualCell>
    </div>
    <VirtualCell 
      v-for="(row,index) in data" 
      :key="index" 
      :class="[bem('body'),row.id === position.row && 'virtual-selected' ]" 
      :height="height"
      :data-row="row.id"
    >
      <slot name="body" :row="row" :index="index" :id="row.id">
        {{getValueByPath(row, prop)}}
      </slot>
    </VirtualCell>
  </div>
</template>
<script>
import { inject, computed, ref } from 'vue';
import { getValueByPath } from '@/utils/handle-object.js';
import { createBEM } from '@/utils/bem.js';
import {getEventPath} from '@/utils/dom.js';
import VirtualCell from './VirtualCell.vue';
export default {
  name: 'VirtualColumn',
  components: {
    VirtualCell,
  },
  props: {
    prop: {
      type: String,
    },
    fixed: {
      type: Boolean,
    },
    columnId: {
      type: Number,
    },
    align: {
      type: String,
      default: 'right',
    },
    showTotal: {
      type: Boolean,
      default: true,
    },
  },
  setup() {
    const column = ref(null);
    // 获取列数
    const columnIndex = computed(() => column.value? Number(column.value.dataset.column): 0);
    // 获取选中行列
    const position = inject('position');
    const updatePosition = inject('updatePosition');
    const getPosition = (e) => {
      updatePosition(getEventPath(e).map(el => el.dataset).filter(el =>  el && (el.column || el.row)).reduce((total, cur) => {
        cur.column && (total.column = cur.column);
        cur.row && (total.row = cur.row);
        return total;
      }, {}));
    };
    const data = inject('fragment');
    const width = inject('width');
    const height = inject('height');
    const top = inject('top');
    const scrolling = inject('scrolling');
    return {
      column,
      getPosition,
      getValueByPath,
      bem: createBEM('virtual-column'),
      data,
      top,
      scrolling,
      width,
      height,
      columnIndex,
      position,
    };
  }
};
</script>
<style lang="scss" scoped>
@import "@/styles/variables.scss";
.virtual-column {
  background: $gray-1;
  flex-shrink: 0;
  position: relative;
  cursor: pointer;
  &__header {
    z-index: 1;
    width: 100%;
    position: absolute;
    & .virtual-cell {
      background: $gray-1;
      border-bottom: solid $border-width-base $border-color;
    }
    &-scrolling {
      opacity: 0;
      z-index: 0;
    }
  }
  &__body {
    border-bottom: solid $border-width-base $border-color;
  }
  &__fixed {
    position: -webkit-sticky;
    position: sticky;
    left: 0;
    z-index: 2;
  }
}
</style>
<style lang="scss">
.virtual-selected, .virtual-selected .virtual-cell {
  background: $orange-light !important;
}
</style>