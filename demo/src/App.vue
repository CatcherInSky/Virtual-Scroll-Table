<template>
  <span style="margin: 39px" />
  <virtual-table
    :data="data"
    :show="60"
    :loading="loading"
    @sort="sortChange"
    @checkbox="checkboxChange"
  >
    <template #tooltip="{row}">
      <div>修改2</div>
      <div>修改{{row._id}}</div>
    </template>
    <!-- <template #menu="{rows}">
      <div>批量1</div>
      <div>批量2</div>
    </template> -->
    <virtual-column
      type="checkbox"
      align="center"
      fixed
    />
    <virtual-column fixed align="left">
      <template #header>名字</template>
      <template #body="{row}">{{ row.name }}</template>
    </virtual-column>
    <virtual-column align="center" title="id" path="_id" sortable/>
    <virtual-column align="center" title="年龄2" path="age" sortable/>
    <!-- <virtual-column align="center" sortable>
      <template #header>年龄</template>
      <template #body="{row}">{{ row.age }}</template>
    </virtual-column> -->
    <virtual-column align="center" title="年龄2" path="age" sortable/>
    <!-- <virtual-column align="center" title="年龄2" path="age" sortable/>
    <virtual-column align="center" title="年龄2" path="age" sortable/> -->
    <!-- <virtual-column align="center" title="年龄2" path="age" sortable/> -->
  </virtual-table>
  <div style="margin: 39px" />
</template>

<script>
import { onMounted, ref } from 'vue';
import VirtualTable from './components/table/VirtualTable.vue';
import VirtualColumn from './components/table/VirtualColumn.vue';
import list from './components/table/utils/data';

export default {
  name: 'App',
  components: {
    VirtualTable,
    VirtualColumn,
  },
  setup() {
    const data = ref([]);
    const loading = ref(false);
    
    const sortChange = (sort) => {
      console.log('sort change:', sort)
    };
    const checkboxChange = (rows) => {
      console.log('rows chagne:', rows);
    }
    onMounted(() => {
      loading.value = true;
      setTimeout(() => {
        data.value = list;
        loading.value = false;
      }, 1000);
    });
    return {
      data,
      loading,
      checkboxChange,
      sortChange,
    };
  },
};
</script>

<style>
body {
  margin: 0;
}
</style>
