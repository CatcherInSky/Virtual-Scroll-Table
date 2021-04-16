/**
 * 防抖
 * 
 * @param {Function} fn 需要包装的函数
 * @param {number} delay 延迟执行时间(ms)，默认: 200
 */
 export const debounce = (fn, delay = 200) => {
  let timeout = null;
  return () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      fn.apply(this, arguments);
    }, delay);
  };
}
/**
 * 节流
 * 
 * @param {Function} fn 需要包装的函数
 * @param {number} delay 执行最高频率(ms)，默认: 200
 */
export const throttle = (fn, delay = 200) => {
  let canRun = true;
  return () => {
    if(!canRun) {
      return;
    }
    // 改为先执行后标记 
    fn.apply(this, arguments);
    canRun = false;
    setTimeout(() => {
      canRun = true;
    }, delay);
  };
}

/**
 *  循环查询dom父节点列表
 * @param {Event} event 
 * @returns 
 */
export const getDomPath = (event) => {
  const path = (event.composedPath && event.composedPath()) || event.path;

  if(!path) {
    return path;
  }

  const target = event.target;

  let result = [target];
  let node = target;

  while((node = node.parentNode)) {
    result.push(node);
  }

  return result;
}

/**
 * 获取嵌套对象值
 * @param {Object} object 
 * @param {String} path 
 * @returns 
 */
export const getValueByPath = (object, path) => {
  path = path || '';
  const paths = path.split('.');
  let current = object;
  let result = null;
  for(let i = 0, j = paths.length; i < j; i++) {
    const path = paths[i];
    if(!current) {
      break;
    }

    if(i === j - 1) {
      result = current[path];
      break;
    }
    current = current[path];
  }
  return result;
};
