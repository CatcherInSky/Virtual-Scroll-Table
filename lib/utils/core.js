import { computed, ref, watch } from 'vue';
import { debounce, throttle } from './tool';
/**
 * 虚拟滚动钩子
 * 
 * @param {Object} data 数据
 * @param {Number} show 可视数据范围
 * @param {Number} height 每行高度
 */

// 滚动特定高度问题to be fixed
export class VirtualScroll {
  constructor(data, show, height, dom, tableHeight) {
    this.data = data;
    this.show = show;
    this.height = height; // 每行高度
    this.tableHeight = tableHeight; // 表格最大高度，默认自动撑开
    this.length = computed(() => this.data.value.length || 0); // 数据长度
    this.buffer = computed(() =>  Math.floor(this.show.value / 3) || 0); // 缓冲区域长度
    this.start = ref(0);
    this.end = ref(0);
    this.fragment = computed(() => this.data.value.slice(this.start.value, this.end.value)); // 数据碎片
    this.padding = computed(() => {
      return {
        top: this.start.value * this.height.value,
        bottom: Math.max((this.length.value - this.end.value) * this.height.value, 0) || 0,
      };
    });
    this.dom = dom;
    // 初始化
    watch(this.dom, (dom) => {
      dom && this.init();
    })
    //  表格据文档上方距离
    this.domScrollTop = ref(0);
    // 表头向下位移
    this.headerTop = ref(0);
    // 是否隐藏表头
    this.headerShow = ref(false);

    this.scrollTop = ref(0);
    
    // 初始化start/end -> padding/fragment
    watch(this.data, (data) => {
      const {end, start, show, length} = this;
      if(data.length != 0 && end.value === 0) {
        end.value = Math.min(start.value + show.value, length.value);
      }
    });
    // 计算start/end
    watch(this.scrollTop, (newTop, oldTop) => {
      const {height, start, buffer, end, show, length} = this;
      let index = newTop > 0
        ? Math.floor(newTop / height.value)
        : 0;
      if(newTop < oldTop) {
        // console.log('向上')
        if(index <= start.value) {
          start.value = Math.max(index - buffer.value, 0);
        }
      } else {
        // console.log('向下')
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

  // 防抖计算表格据文档高度
  debounceDomTop = debounce(() => {
    this.domScrollTop.value = this.dom.value
      ? this.dom.value.offsetTop
      : 0;
  }, 500) 

  // 无固定表格高度时
  // 滚动后显示表头
  throttleHeaderTop = throttle(() => {
    const { scrollTop, headerShow, padding } = this;
    let top = scrollTop.value - padding.value.top;
    if(top > 0) {
      this.headerTop.value = top;
    } else {
      this.headerTop.value = 0;
    }
    headerShow.value = false;
  }, 200)
  
  // 滚动事件
  onDocumentScroll = ({target: {scrollingElement: {scrollTop: documentScrollTop}}}) => {
    const { domScrollTop, scrollTop, headerShow, throttleHeaderTop, debounceDomTop } = this;
    headerShow.value = true;
    throttleHeaderTop();
    debounceDomTop();

    const clientHeight = document.documentElement.clientHeight || document.body.clientHeight,
      scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
    // 滚动超出范围属于错误， 中止
    if(!scrollHeight || scrollTop < 0 || scrollTop + clientHeight > scrollHeight + 1) {
      console.warn(`滚动超出范围，scrollHeight：${scrollHeight}，scrollTop：${scrollTop}，clientHeight：${clientHeight}`);
      return;
    }
    scrollTop.value = documentScrollTop - domScrollTop.value;
  }

  onTableScroll = ({target: {scrollTop}}) => {
    this.scrollTop.value = scrollTop
  };

  init() {
    if(this.tableHeight?.value) {
      this.dom.value.parentNode.addEventListener('scroll', this.onTableScroll, {passive: true, useCapture: true});
    } else {
      document.addEventListener('scroll', this.onDocumentScroll, {passive: true, useCapture: true});
    }
  }
  destroy() {
    if(this.tableHeight?.value) {
      this.dom.value.parentNode.removeEventListener('scroll', this.onTableScroll, true);
    } else {
      document.removeEventListener('scroll', this.onDocumentScroll, true);
    }
  }
}