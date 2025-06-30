<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="图书id" prop="bookId">
        <el-input
          v-model="queryParams.bookId"
          placeholder="请输入图书id"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="书籍名称" prop="title">
        <el-input
          v-model="queryParams.title"
          placeholder="请输入书籍名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="作者名称" prop="author">
        <el-input
          v-model="queryParams.author"
          placeholder="请输入作者名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="类别id" prop="categoryId">
        <el-input
          v-model="queryParams.categoryId"
          placeholder="请输入类别id"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="出版社id" prop="publisherId">
        <el-input
          v-model="queryParams.publisherId"
          placeholder="请输入出版社id"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['manage:book:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['manage:book:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['manage:book:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['manage:book:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="bookList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="图书id" align="center" prop="bookId" />
      <el-table-column label="书籍名称" align="center" prop="title" />
      <el-table-column label="作者名称" align="center" prop="author" />
      <el-table-column label="类别id" align="center" prop="categoryId" />
      <el-table-column label="出版社id" align="center" prop="publisherId" />
      <el-table-column label="进货价" align="center" prop="purchasePrice" />
      <el-table-column label="零售价" align="center" prop="retailPrice" />
      <el-table-column label="总库存" align="center" prop="totalStock" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['manage:book:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['manage:book:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改图书信息管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="bookRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="书籍名称" prop="title">
          <el-input v-model="form.title" placeholder="请输入书籍名称" />
        </el-form-item>
        <el-form-item label="作者名称" prop="author">
          <el-input v-model="form.author" placeholder="请输入作者名称" />
        </el-form-item>
        <el-form-item label="类别id" prop="categoryId">
          <el-input v-model="form.categoryId" placeholder="请输入类别id" />
        </el-form-item>
        <el-form-item label="出版社id" prop="publisherId">
          <el-input v-model="form.publisherId" placeholder="请输入出版社id" />
        </el-form-item>
        <el-form-item label="进货价" prop="purchasePrice">
          <el-input v-model="form.purchasePrice" placeholder="请输入进货价" />
        </el-form-item>
        <el-form-item label="零售价" prop="retailPrice">
          <el-input v-model="form.retailPrice" placeholder="请输入零售价" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Book">
import { listBook, getBook, delBook, addBook, updateBook } from "@/api/manage/book"

const { proxy } = getCurrentInstance()

const bookList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref("")

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    bookId: null,
    title: null,
    author: null,
    categoryId: null,
    publisherId: null,
  },
  rules: {
    title: [
      { required: true, message: "书籍名称不能为空", trigger: "blur" }
    ],
    author: [
      { required: true, message: "作者名称不能为空", trigger: "blur" }
    ],
    categoryId: [
      { required: true, message: "类别id不能为空", trigger: "blur" }
    ],
    publisherId: [
      { required: true, message: "出版社id不能为空", trigger: "blur" }
    ],
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询图书信息管理列表 */
function getList() {
  loading.value = true
  listBook(queryParams.value).then(response => {
    bookList.value = response.rows
    total.value = response.total
    loading.value = false
  })
}

// 取消按钮
function cancel() {
  open.value = false
  reset()
}

// 表单重置
function reset() {
  form.value = {
    bookId: null,
    title: null,
    author: null,
    categoryId: null,
    publisherId: null,
    purchasePrice: null,
    retailPrice: null,
    totalStock: null
  }
  proxy.resetForm("bookRef")
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef")
  handleQuery()
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.bookId)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加图书信息管理"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const _bookId = row.bookId || ids.value
  getBook(_bookId).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改图书信息管理"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["bookRef"].validate(valid => {
    if (valid) {
      if (form.value.bookId != null) {
        updateBook(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addBook(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _bookIds = row.bookId || ids.value
  proxy.$modal.confirm('是否确认删除图书信息管理编号为"' + _bookIds + '"的数据项？').then(function() {
    return delBook(_bookIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('manage/book/export', {
    ...queryParams.value
  }, `book_${new Date().getTime()}.xlsx`)
}

getList()
</script>
