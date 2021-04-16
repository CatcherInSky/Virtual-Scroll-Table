<template>
  <VirtualColumn fixed style="width: 40px">
    <template #header>
      <div :class="[bem('checkbox'), bem(selectStatus)]" 
          @click="toggleAll(selectStatus == 'empty')">
        <VanIcon
          :class="bem('icon')"
          v-if="['half', 'full'].includes(selectStatus)"
          :name="selectStatus == 'half' ? 'minus': 'success' "
        />
      </div>
    </template>
    <template #body="{id}">
      <VanCheckbox
        :modelValue="selected.has(id)"
        @click="toggleId(id)"
      />
    </template>
  </VirtualColumn>
</template>
<script>
import { computed, ref, inject, watch, toRefs } from 'vue';
import { createBEM } from '@/utils/bem.js';
import VirtualColumn from '@/components/table/VirtualColumn.vue';
export default {
  name: 'SelectColumn',
  components: {
    VirtualColumn,
  },
  // 可改V-model
  props: {
    list: {
      type: Array,
      default: () => []
    }
  },
  emits: ['select'],
  setup(props, context) {
    const data = inject('data');
    const { list } = toRefs(props);
    watch(list, list => {
      selected.value = new Set(list);
    });
    const selected = ref(new Set(list.value));
    watch(selected, (selected) => {
      context.emit('select', [...selected]);
    }, {deep: true});
    const selectStatus = computed(() => selected.value.size > 0 ? (selected.value.size < data.value.length ? 'half' : 'full') : 'empty');
    const toggleAll = (bool) => {
      bool 
        ? data.value.forEach(el => selected.value.add(el.id)) 
        : selected.value.clear();
    };
    const toggleId = (id) => {
      if(selected.value.has(id)) {
        selected.value.delete(id);
      } else {
        selected.value.add(id);
      }
    };
    return {
      selected,
      selectStatus,
      toggleAll,
      toggleId,
      bem: createBEM('select-column'),
    };
  }
};
</script>
<style lang="scss" scoped>
@import "@/styles/variables.scss";
.select-column {
  &__checkbox {
    height: 1em;
    font-size: $font-size-lg;
    line-height: 1em;
    cursor: pointer;    
    display: flex;
    box-sizing: border-box;
    width: 1.25em;
    height: 1.25em;
    color: transparent;
    line-height: 1.25;
    text-align: center;
    border: 1px solid #c8c9cc;
    border-radius: 100%;
    -webkit-transition-duration: 0.2s;
    transition-duration: 0.2s;
    -webkit-transition-property: color, border-color, background-color;
    transition-property: color, border-color, background-color;
    justify-content: center;
    align-items: center;
    overflow: hidden;
  }
  &__full {
    font-size: $font-size-lg;
    color: $white;
    background: $blue;
    border-color: $blue;
  }
  &__half {
    color: $blue;
    font-size: $font-size-lg;
    color: $white;
    background: $blue;
    border-color: $blue;
  }
  &__empty {
    color: $gray-5;
  }
  &__full &__icon {
    font-size: $font-size-lg;
  }
}
</style>