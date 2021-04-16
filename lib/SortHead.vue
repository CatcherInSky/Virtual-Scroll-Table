<template>
  <div @click="sortChange">
    <div :class="[
      bem('main'),
      head && head.path == column.path && bem(head.type)
    ]">{{ column.label }}</div>
    <div v-if="column.sub_label" :class="[
      bem('sub'), 
      head && head.path == column.sub_path && bem(head.type)
    ]">{{ column.sub_label }}</div>
  </div>
</template>
<script>
import { computed, toRefs } from 'vue';
import { createBEM } from '@/utils/bem.js';
import { compareObj } from '@/utils/handle-object.js';
export default {
  name: 'SortHead',
  props: {
    sort: {
      type: Object,
      default: () => {
        return {
          label: '',
          path: '',
          type: 'descending'
        };
      }
    },
    column: {
      type: Object,
      default: () => {
        return {
          label: '',
          path: '',
          sub_label: '',
          sub_path: '',
        };
      }
    }
  },
  setup(props) {
    const { column, sort } = toRefs(props);
    const { label, path, sub_label, sub_path } = column.value;
    const orderList = [
      {label, path, type: 'descending'}, 
      {label, path, type: 'ascending'}
    ].concat(sub_path 
      ? [
        {label: sub_label, path: sub_path, type: 'descending'}, 
        {label: sub_label, path: sub_path, type: 'ascending'}
      ]
      : []
    );
    const orderMatch = (obj, arr) => {
      let order = -1;
      arr.forEach((it, index) => {
        if(compareObj(obj, it)) {
          order = index;
        }
      });
      return order;
    };
    const sortChange = () => {
      const index = order.value === ( sub_path ? 3 : 1 ) ? 0 : (order.value + 1);
      const { label, path, type } = orderList[index];
      sort.value.label = label;
      sort.value.path = path;
      sort.value.type = type;
    };
    const order = computed(() => orderMatch(sort.value, orderList));
    const head = computed(() => order.value == -1 ? null : orderList[order.value]);
    return {
      bem: createBEM('sort-head'),
      sortChange,
      head,
    };

  }  
};
</script>
<style lang="scss" scoped>
@import '@/styles/variables.scss';
.sort-head {
  &__main {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: $font-weight-bolder;
    font-size: 14px;
  }
  &__sub {
    font-size: $font-size-xs;
    color: $gray-6;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  &__ascending {
    // color: $green
    &::before {
      content: '';
      display: inline-block;
      bottom: 5px;
      right: 1px;
      position: relative;
      width: 0;
      height: 0;
      border: 5px solid;
      border-color: transparent transparent $blue transparent;
    }
  }
  &__descending {
    // color: $red
    &::before {
      content: '';
      display: inline-block;
      top: 5px;
      right: 1px;
      position: relative;
      width: 0;
      height: 0;
      border: 5px solid;
      border-color: $blue transparent transparent transparent;
    }
  }
}
</style>