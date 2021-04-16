const list = new Array(300).fill('').map((it, index) => {
  return {
    name: 'test' + index,
    age: parseInt(100 * Math.random()),
  }
})
export default list;