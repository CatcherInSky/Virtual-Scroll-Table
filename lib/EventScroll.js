import { computed, nextTick, ref, watch } from 'vue';
import { debounce } from '@/utils/transformFunction.js';
/**
 * 虚拟滚动钩子
 * 
 * @param {Object} data 数据
 * @param {Number} show 可视数据范围
 * @param {Number} height 每行高度
 */
export class VirtualScroll {
  constructor(data, show, height, header, fixedHeight) {
    this.data = data;
    this.show = show;
    this.height = height; // 每行高度
    this.length = computed(() => this.data.value.length || 0); // 数据长度
    this.buffer = computed(() =>  Math.floor(this.show.value / 3) || 0); // 缓冲区域长度
    this.start = ref(0);
    this.end = ref(0);
    this.fragment = computed(() => this.data.value.slice(this.start.value, this.end.value)); // 数据碎片
    this.padding = computed(() => {
      return {
        top: this.start.value * height.value,
        bottom: Math.max((this.length.value - this.end.value) * this.height.value, 0) || 0,
      };
    });

    // 表头
    this.header = header;
    // 固定页面顶端部分高度
    this.fixedHeight = fixedHeight;
    // 表头上方高度
    this.headerHeight = 0;
    // 表头位置
    this.tableTop = ref(0);
    // 表格滚动高度 = 页面滚动高度 - 表头上方高度 
    this.tableScrollTop = ref(0);
    // 滚动状态：滚动中隐藏表头，滚动防抖停止显示表头
    this.scrolling = ref(false);
    // 初始化
    this.init();
    this.debounceTableTop = debounce(this.getTableTop, 300);
    // 初始化start/end -> padding/fragment
    watch(this.data, (data) => {
      const {end, start, show, length} = this;
      if(data.length != 0 && end.value === 0) {
        end.value = Math.min(start.value + show.value, length.value);
      }
    });
    // 计算start/end
    watch(this.tableScrollTop, (newTop, oldTop) => {
      const {height, start, buffer, end, show, length} = this;
      let index = newTop > 0
        ? Math.floor(newTop / height.value)
        : 0;
      if(newTop < oldTop) {
        // 向上
        if(index <= start.value) {
          start.value = Math.max(index - buffer.value, 0);
        }
      } else {
        // 向下
        if(index >= start.value + buffer.value) {
          start.value = Math.max(index, 0);
        }
      }
      end.value = Math.min(start.value + show.value, length.value);
      // 溢出控制
      if(end.value - start.value < show.value) {
        start.value = Math.max(end.value - show.value, 0);
      }
    }, {immediate: true});
  }
  // 节流
  getHeaderHeight = (scrollTop) => {
    const {header, fixedHeight, } = this;
    const headerTop = header.value ? header.value.getBoundingClientRect().top : 0;
    this.headerHeight = scrollTop + headerTop - fixedHeight.value;
  }
  getTableTop = (scrollTop) => {
    const {scrolling, tableTop, padding, headerHeight} = this;    
    if(scrolling.value) {
      scrolling.value = false;
      tableTop.value = scrollTop - headerHeight  - padding.value.top - 1;
    }
  }
  // 防抖
  getTableHeader = (scrollTop) => {
    const {scrolling, tableTop, debounceTableTop, headerHeight} = this;
    if(scrollTop > headerHeight) {
      scrolling.value = true;
      debounceTableTop(scrollTop);
    } else {
      scrolling.value = false;
      tableTop.value = 0;
    }
  }
  // 滚动事件
  onScroll = ({target: {scrollingElement: {scrollTop}}}) => {
    const clientHeight = document.documentElement.clientHeight || document.body.clientHeight,
      scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
    // 滚动超出范围属于错误
    if(!scrollHeight || scrollTop < 0 || scrollTop + clientHeight > scrollHeight + 1) {
      window.console.log(`滚动超出范围，scrollHeight：${scrollHeight}，scrollTop：${scrollTop}，clientHeight：${clientHeight}`);
      return;
    }
    const { headerHeight, tableScrollTop, getTableHeader, getHeaderHeight} = this;
    getHeaderHeight(scrollTop);
    tableScrollTop.value = scrollTop - headerHeight;
    getTableHeader(scrollTop);
  }
  init() {
    // document.body.scrollTo(0,0);
    document.addEventListener('scroll', this.onScroll, { passive: true });
  }
  destroy() {
    document.removeEventListener('scroll', this.onScroll, { passive: true });
  }
}