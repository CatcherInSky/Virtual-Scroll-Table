<template>
  <virtual-column-default v-bind="$props">
    <template #header>
      <div
        :class="[
          'iconfont', 
          'icon-checkbox-' + status, 
          'virtual-column-checkbox-icon',
          'virtual-column-checkbox-icon-' + status,
        ]" 
        @click="toggleAll(status == 'empty')"
      />
    </template>
    <template #body="{row, id}">
      <div
        :class="[
          'iconfont', 
          'icon-checkbox-' + (listId.includes(id) ? 'full' : 'empty'),
          'virtual-column-checkbox-icon',
          'virtual-column-checkbox-icon-' + (listId.includes(id) ? 'full' : 'empty'),
        ]"
        @click="toggleId(row)"
      />
    </template>
  </virtual-column-default>
</template>
<script>
import { computed, inject } from 'vue';
import VirtualColumnDefault from './VirtualColumnDefault.vue';
export default {
  name: 'VirtualColumnCheckbox',
  components: {
    VirtualColumnDefault
  },
  props: {
    align: {
      type: String,
      default: 'left',
    }
  },
  setup() {
    const data = inject('data');
    const list = inject('list');
    const listId = computed(() => list.value.map(it => it._id));
    const updateList = inject('updateList');
    const toggleAll = (bool) => {
      updateList(
        bool 
          ? [...data.value]
          : []
      )
    };
    const toggleId = (row) => {
      updateList(
        listId.value.includes(row._id) 
          ? list.value.filter(it => it._id != row._id)
          : [row, ...list.value]
      )
    };
    const status = computed(() => 
      list.value.length > 0
        ? (
            list.value.length < data.value.length 
              ? 'half' 
              : 'full'
          ) 
        : 'empty'
    )
    return {
      listId,
      status,
      toggleAll,
      toggleId,
    };
  }
};
</script>
<style lang="scss" scoped>
.virtual-column-checkbox {
  &-icon {
    font-size: 16px;
    cursor: pointer;  
    box-sizing: border-box;
    height: 20px;
    width: 20px;
    line-height: 16px;
    display: contents;
    &-full, &-half {
      color: #1989fa;
    }

    &-empty {
      color: #c8c9cc;
    }
  }
}
</style>