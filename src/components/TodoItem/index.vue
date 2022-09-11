<template>
  <el-card
    shadow="always"
    class="todo-card"
    :body-style="{padding: '12px 10px'}"
  >
    <el-descriptions
        :title="todo.name"
        :column="1"
        :size="size"
        border
    >
        <template #title>
            <el-input v-if="isEditModel" v-model="editForm.name" />
            <div v-else class="todo-card-title">
                <el-checkbox v-if="showAction" v-model="isCompleted" size="small" @change="$emit('onChange')" :disabled="editIdx!==-1"/>
                <div v-html='filterRes(todo.name)'></div>
            </div>
        </template>
        <template #extra>
            <div v-if="showAction">
                <el-button type="primary" size="small" v-if="isEditModel" @click="onSave()">確定</el-button>
                <el-button type="primary" size="small" v-else @click="onEdit" :disabled="editIdx!==-1">修改</el-button>
                <el-button type="danger" size="small" @click="onDelete" :disabled="editIdx!==-1">刪除</el-button>
            </div>
        </template>
        <el-descriptions-item>
            <template #label>
                重要性
            </template>
            <el-select v-model="editForm.level" v-if="isEditModel">
                <el-option label="不做也罷~" :value="1" />
                <el-option label="中等" :value="2" />
                <el-option label="重要" :value="3" />
            </el-select>
            <div v-else >{{formatLevel(todo.level)}}</div>
        </el-descriptions-item>
        <el-descriptions-item>
            <template #label>
                <div>創建時間</div>
            </template>
            {{formatDate(todo.createTime)}}
        </el-descriptions-item>
        <el-descriptions-item>
            <template #label>
            <div>描述</div>
            </template>
            <el-input v-if="isEditModel" v-model="editForm.desc" type="textarea" />
            <div v-else v-html='filterRes(todo.desc)'></div>
        </el-descriptions-item>
        </el-descriptions>
    </el-card>
</template>
<script setup>
import { formatDate, formatLevel } from '@/utils/common.js'
import {
  defineProps,
  defineEmits,
  reactive,
  ref,
  watch,
  computed
} from 'vue'

const props = defineProps({
  todo: {
    type: Object
  },
  todoIndex: {
    type: [Number, String]
  },
  editIdx: {
    type: [Number, String]
  },
  showAction: {
    type: Boolean,
    default: true
  },
  filterText: {
    type: [Number, String]
  }
})
const emits = defineEmits(['onChange', 'changeSave', 'changeEditIndex', 'changeDelete'])
const editForm = reactive({
  name: '',
  level: '',
  desc: ''
})
const filterRes = computed(() => {
  return (txt) => {
    if (props.filterText.length && txt.indexOf(props.filterText) > -1) {
      return txt.substr(0, txt.indexOf(props.filterText)) +
      `<span style="font-size:18px;font-weight: bold; color: #3bb4b7">${props.filterText}</span>` +
      txt.substr(txt.indexOf(props.filterText) + props.filterText.length)
    } else {
      return txt
    }
  }
})
const isCompleted = ref(props.todo.isDone)
watch(() => props.todo.isDone, (nV, oV) => {
  console.log('watch change: ', nV, oV)
  isCompleted.value = nV
}, {
  immediate: true
})
const editIdx = ref(props.editIdx)
watch(() => props.editIdx, (nV, oV) => {
  editIdx.value = nV
}, {
  immediate: true
})
const isEditModel = computed(() => props.editIdx !== -1 && props.editIdx === props.todoIndex)
// 編輯
const onEdit = () => {
  editIdx.value = props.todoIndex
  emits('changeEditIndex', props.todoIndex)
  editForm.name = props.todo.name
  editForm.level = props.todo.level
  editForm.category = props.todo.category
  editForm.desc = props.todo.desc
  editForm.createTime = props.todo.createTime
  editForm.notify = props.todo.notify
}
// 保存
const onSave = () => {
  editIdx.value = -1
  emits('changeSave', editForm)
}
// 刪除
const onDelete = () => {
  // 沒設計id, 創立時間噹噹唯一值
  emits('changeDelete', props.todo.createTime)
}
</script>

<style lang="scss" scoped>
::v-deep(td.el-descriptions__label.is-bordered-label.is-left){
  background-color: rgb(20, 108, 231);
  color: white;
}

.todo-card{
    margin-bottom: 6px;
    margin-right:4px;
    border-radius: 8px;
}
.todo-card-title{
  display:flex;
  justify-content: center;
  align-items: center;
}
</style>
