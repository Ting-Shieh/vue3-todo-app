<template>
  <el-row :gutter="10">
    <el-col :xs="24" :md="8" class="form-col">
      <div class="add-header-box">
        <p class="add-header-box-title">新增項目</p>
      </div>
      <el-card shadow="never" :body-style="{padding: '12px 10px'}" style="background-color: #fdf4e5;">
        <el-form :model="todoForm" label-width="120px">
          <el-form-item label="待辦名稱">
            <el-input v-model="todoForm.name" />
          </el-form-item>
          <el-form-item label="詳細">
            <el-input v-model="todoForm.desc" type="textarea" />
          </el-form-item>
          <el-form-item label="分類">
            <el-select v-model="todoForm.category" placeholder="請選擇類目">
              <el-option label="類目1" value="C001" />
              <el-option label="類目2" value="C002" />
            </el-select>
          </el-form-item>
          <el-form-item label="是否啟用通知">
            <el-switch v-model="todoForm.notify" />
          </el-form-item>
          <el-form-item label="重要性">
            <el-select v-model="todoForm.level" placeholder="請選擇重要程度">
              <el-option label="不做也罷~" :value="1" />
              <el-option label="中等" :value="2" />
              <el-option label="重要" :value="3" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button size="small" type="primary" @click="addTodo">新增</el-button>
            <el-button size="small" @click="reset">清除</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </el-col>
    <el-col :xs="24" :md="8" class="main-col" style="">
      <div class="main-header-box">
        <span class="main-header-box-title">{{showTitle}}</span>
        <div class="main-header-box-action">
          <div class="search-action">
            <el-input v-model="searchText" placeholder="關鍵字搜尋" size="small"/>
            <el-button size="small" @click="search" style="margin-left:4px;margin-right:4px;">搜尋</el-button>
          </div>
          <el-select v-model="sortSelected" class="m-2" size="small" @change="sortTodo">
            <el-option label="近到遠排序" value="new2Old" />
            <el-option label="遠到近排序" value="old2New" />
          </el-select>
        </div>
      </div>
      <div>
        <el-tabs
          v-model="tabAactiveName"
          type="card"
          @tab-click="tabClick"
          :before-leave="beforeLeave"
        >
          <el-tab-pane v-for="c in tabList" :key="c.cId" :label="c.name" :name="c.cId" style="height:445px;">
            <div class="scrollArea" v-if="categoryTodoList.length" style="height:100%;">
              <transition-group  name="scale-slide">
                <todo-item
                  v-for="(item, todoIndex) in categoryTodoList"
                  :key="item.createTime"
                  :todo-index="todoIndex"
                  :todo="item"
                  :edit-idx="editIdx"
                  :filter-text="toFilterTxt"
                  v-model="item.isDone"
                  @onChange="finish(item)"
                  @changeSave="save"
                  @changeEditIndex="getEditIndex"
                  @changeDelete="deleteTodo"
                  class="running-card"
                >
                </todo-item>
              </transition-group>
            </div>
            <div v-else>
              查無與<span class="search-tag-text">{{searchText}}</span>相關的資料
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-col>
    <el-col :xs="24" :md="8" class="main-col">
      <div class="done-header-box">
        <span class="done-header-box-title">已完成項目</span>
      </div>
      <div class="scrollArea"  v-if="doneTodoList.length" style="height:600px;">
          <todo-item
            v-for="(todo) in doneTodoList"
            :key="todo.createTime"
            :todo="todo"
            :showAction="false"
            :edit-idx="editIdx"
            :filter-text="toFilterTxt"
            v-model="todo.isDone"
            class="done-card"
            :body-style="{padding: '12px 10px'}"
          >
          </todo-item>
      </div>
      <div v-else>
        查無與<span class="search-tag-text">{{searchText}}</span>相關的資料
      </div>
    </el-col>
  </el-row>
</template>
<script setup>
import TodoItem from '@/components/TodoItem'
import { ElMessage } from 'element-plus'
import mockData from '@/mock/data.json'
import { ref, onMounted, nextTick, reactive, computed } from 'vue'

const tabList = ref(mockData.tabList)
const todoList = ref(mockData.todoList)
const categoryTodoList = ref([])
const doneTodoList = ref([])
const todoForm = reactive({
  name: '',
  level: 1,
  category: 'C001',
  desc: '',
  createTime: '',
  notify: false
})
const reset = () => {
  todoForm.name = ''
  todoForm.level = 1
  todoForm.category = 'C001'
  todoForm.desc = ''
  todoForm.createTime = ''
  todoForm.notify = false
}
const addTodo = () => {
  if (!todoForm.name.length) {
    return ElMessage({
      showClose: true,
      message: '代辦名稱不得為空!',
      type: 'error'
    })
  }
  todoForm.createTime = new Date()
  todoForm.isDone = false
  const _todo = todoForm
  todoList.value.unshift({ ..._todo })
  initData()
  reset()
}
const showTitle = computed(() => toFilterTxt.value.length ? `查詢"${toFilterTxt.value}"結果項目` : '顯示項目')
// 排序
const sortSelected = ref('new2Old')
const sortTodo = () => {
  const _categoryTodoList = categoryTodoList.value
  switch (sortSelected.value) {
    case 'new2Old': {
      const new2OldSort = _categoryTodoList.sort((todo1, todo2) => new Date(todo2.createTime).getTime() - new Date(todo1.createTime).getTime())
      categoryTodoList.value = new2OldSort
      break
    }
    case 'old2New': {
      const old2NewSort = _categoryTodoList.sort((todo1, todo2) => new Date(todo1.createTime).getTime() - new Date(todo2.createTime).getTime())
      categoryTodoList.value = old2NewSort
      break
    }
  }
}

// tab 切換
const tabAactiveName = ref('all')
const tabClick = () => {
  let _todoList = todoList.value
  if (toFilterTxt.value.length > 0) {
    _todoList = searchFilter()
  }
  if (tabAactiveName.value !== 'all') {
    categoryTodoList.value = _todoList.filter(item => item.category === tabAactiveName.value && item.isDone === false)
  } else {
    categoryTodoList.value = _todoList.filter(item => item.isDone === false)
  }
  sortTodo()
}
const beforeLeave = () => {
  if (editIdx.value !== -1) {
    ElMessage({
      showClose: true,
      message: '尚未保存!',
      type: 'warning'
    })
    return false
  } else {
    return true
  }
}

const editIdx = ref(-1)
const filterTodoType = () => {
  let _todoList = todoList.value
  if (toFilterTxt.value.length > 0) {
    _todoList = searchFilter()
  }
  doneTodoList.value = _todoList.filter((item) => item.isDone === true)
}
// 勾選完成
const finish = (obj) => {
  obj.isDone = true
  initData()
  toFilterTxt.value = ''
}
// 點擊編輯
const getEditIndex = (parmas) => {
  nextTick(() => {
    editIdx.value = parmas
  })
}
// 點擊確定保存
const save = (editForm) => {
  const _todoList = todoList.value
  todoList.value = _todoList.map(obj => {
    if (obj.createTime === editForm.createTime) {
      return { ...obj, ...editForm }
    }
    return obj
  })
  initData()
  editIdx.value = -1
}
// 點擊刪除
const deleteTodo = (cTime) => {
  const _todoList = todoList.value
  const _idx = _todoList.findIndex(item => item.createTime === cTime)
  if (_idx > -1) {
    _todoList.splice(_idx, 1)
    initData()
  } else {
    ElMessage({
      showClose: true,
      message: '該筆資料不存災，刪除失敗!',
      type: 'error'
    })
    return false
  }
}
//
const searchText = ref('')
const toFilterTxt = ref('')
const isMatch = (item) => {
  return (item.name.indexOf(toFilterTxt.value) > -1 || item.desc.indexOf(toFilterTxt.value) > -1)
}
const searchFilter = () => {
  const _todoList = todoList.value
  return _todoList.filter((item) => isMatch(item))
}
// 點擊關鍵字搜尋
const search = () => {
  toFilterTxt.value = searchText.value
  initData()
}
const initData = async () => {
  await filterTodoType()
  await tabClick()
  await sortTodo()
  searchText.value = ''
}
onMounted(() => {
  initData()
})
</script>

<style lang="scss" scoped>

.main-header-box{
  display:flex;
  flex-direction:column;
  height:70px;
  margin-bottom:10px;
  border-bottom:2px solid #eee;
  .main-header-box-title{
    font-size:20px;
    font-weight:bold;
    text-align:left;
    padding:2px;
    margin:0px;
  }
  .main-header-box-action{
    margin-top:2px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .search-action{
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
}
.form-col{
  height: 4ㄓ0px;
  border: 1px solid #dcdbdb;
  border-radius: 8px;
  margin-bottom:10px;
  background-color: #fdf4e5;
  .add-header-box{
    padding:4px;
    margin-bottom:8px;
    border-bottom:2px solid #eee;
    .add-header-box-title{
      font-size:20px;
      font-weight:bold;
      text-align:left;
      padding:4px;
      margin:0px;
    }
  }
}
.main-col{
  height: 600px;
  border: 1px solid #dcdbdb;
  margin-bottom:10px;
  border-radius: 8px;
  background-color: #fdf4e5;
  .done-header-box{
    padding:4px;
    margin-bottom:8px;
    border-bottom:2px solid #eee;
    .done-header-box-title{
      font-size:20px;
      font-weight:bold;
      text-align:left;
      padding:4px;
      margin:0px;
    }
  }
}
.done-card{
  margin-bottom: 6px;
  background-color: #26809B;
}
.running-card{
  background-color: #ea5288;
}

//todo
// .close{
//   &-enter, &-leave-to{
//     opacity: 0;
//   }
//   // 進入
//   &-enter{
//     transform: translateX(-50vw);
//   }

//   &-leave-to{
//     transform: translateX(50vw);
//   }
//   &-enter-active{
//     transition: opacity .6s linear, transform 1s cubic-bezier(.68,-0.12,0,1.18);
//   }
//   &-leave-active{
//     transition: opacity .6s linear, transform 1s cubic-bezier(.68,-0.12,0,1.18);
//   }
//   &-move{
//     transition: all 1.5s ease-in-out;
//   }
// }
//
.search-tag-text{
  color: red;
  font-weight: bold;
}
// 刪除動畫
.scale-slide-leave-active {
  transition: all 0.5s ease;
  overflow: hidden;
}
.scale-slide-leave-from {
  width: 100%;
  height: 215px;
}
.scale-slide-leave-to {
  width: 0%;
  height: 0px;
}
// 新增動畫
.scale-slide-enter-from{
  opacity: 0;
  transform: translateX(-50vw);
}
.scale-slide-enter-to{
  opacity: 1;
  transform: translateX(0vw);
}
.scale-slide-enter-active{
  transition: opacity .6s linear, transform 1s cubic-bezier(.68,-0.12,0,1.18);
}
</style>
