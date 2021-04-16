# Virtual-Scroll-Table
Vue 3.0 开发的移动端虚拟滚动列表

## Table props
| props | type | required | description | default |
|:---:|:---:|:---:|:---:|:---:|
| data | Array.<Object> | true | 列表渲染数据 | [] |
| show | Number | false | 虚拟滚动每次展示数据长度 | 30 |
| width | Number | false | 单元格统一最小宽度 | 80 |
| height | Number | false | 单元格统一高度 | 40 |
| loading | Boolean | false | 等待状态 | false |
| loading-text | String | false | 等待中提示语 | '加载中' |
| empty-text | String | false | 无数据提示语 | '暂无数据' |


## Table events
| event | arguments | description |
|:---:|:---:|:---:|:---:|:---:|
| sort | {order: ['descend', 'ascend'] , path: String} | 排序后触发 |
| checkbox | rows 为data的子集 | checkbox 改变触发 | 

## Column props
| props | type | required | description | default |
|:---:|:---:|:---:|:---:|:---:|
| type | ['default', 'checkbox'] | false | 列类型 | 'default' |
| fixed | Boolean | false | 是否固定列 | false |
| align | ['center', 'left', 'right'] | false | 列对齐方式 | 'center' |
| sortable | Boolean | false | 是否可点击排序，需要填写path属性，目前只支持Number类型的prop | false | 
| title | String | false | 列标题 | '' | 
| path | String | false | 列数据的键，支持嵌套对象 'b.c' | '' |
| header-class | String | false | 表头类名 | '' |
| body-class | String | false | 表格类名 | '' |

## Slots
| slots | scope | description |
|:---:|:---:|:---:|
| default | -- | 列表 | 只能是virtual-column组件，且为必填 |
| column.header | { column } | 列表头 |
| column.body | { row, index, id } | 列表内容 |
| tooltip | { row } | 选中单条 |
| menu | { rows } | 选中多条 |
