const pressScope = {
  timer: null,
  start: () => {},
  cancel: () => {}
};
export const press = {
  /**
   * 
   * @param {Object} binding
   * @param {function} binding.handler 触发函数
   * @param {Number} binding.time 触发间隔
   */
  mounted(el, binding) {
    // let isiOS = /iphone/gi.test(navigator.userAgent);
 
    if(typeof binding.value.handler !== 'function') {
      console.warn('长按指令的handler必须是函数');
    }
    // 运行函数
    const handler = (e) => {
      // 执行传递给指令的方法
      binding.value.handler(e);
    };
    pressScope.start = (e) => {
      if(e.type === 'click' && e.button !== 0) {
        return;
      }
      if(pressScope.timer === null) {
        pressScope.timer = setTimeout(() => {
          // 执行函数
          handler(e);
        }, binding.value.time || 500);
      }
    };
    // 取消计时器
    pressScope.cancel = () => {
      // 检查计时器是否有值
      if(pressScope.timer !== null) {
        clearTimeout(pressScope.timer);
        pressScope.timer = null;
      }
      return true;
    };
    const { start, cancel } = pressScope;
    // 添加事件监听器
    el.addEventListener('touchstart', start, {passive: true});
    // 取消计时器
    el.addEventListener('touchmove', cancel, {passive: true});
    el.addEventListener('touchend', cancel, {passive: true});
    el.addEventListener('touchcancel', cancel, {passive: true});
  },
  beforeUnmount(el) {
    const { start, cancel } = pressScope;
    // 消除事件监听器
    el.removeEventListener('touchstart', start);
    el.removeEventListener('touchmove', cancel);
    el.removeEventListener('touchend', cancel);
    el.removeEventListener('touchcancel', cancel);
  },
};