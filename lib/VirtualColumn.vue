<template>
  <component 
    :is="'virtual-column-' + $props.type"
    v-bind="$props"
  >
    <template #header="header">
      <slot name="header" v-bind="header"/>
    </template>
    <template #body="body">
      <slot name="body" v-bind="body"/>
    </template>
  </component>
</template>
<script>
import VirtualColumnDefault from './VirtualColumnDefault.vue';
import VirtualColumnCheckbox from './VirtualColumnCheckbox.vue';
export default {
  name: 'VirtualColumn',
  components: {
    VirtualColumnDefault,
    VirtualColumnCheckbox,
  },
  props: {
    // 列类型，可选[checkbox, default]
    type: {
      type: String,
      default: 'default',
    },
  },
};
</script>