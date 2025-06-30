<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="进货订单id" prop="orderId">
        <el-input
          v-model="queryParams.orderId"
          placeholder="请输入进货订单id"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="进货日期" prop="orderDate">
        <el-date-picker clearable
          v-model="queryParams.orderDate"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择进货日期">
        </el-date-picker>
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
          v-hasPermi="['manage:purchaseorder:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['manage:purchaseorder:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['manage:purchaseorder:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['manage:purchaseorder:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="purchaseorderList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="进货订单id" align="center" prop="orderId" />
      <el-table-column label="进货日期" align="center" prop="orderDate" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.orderDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['manage:purchaseorder:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['manage:purchaseorder:remove']">删除</el-button>
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

    <!-- 添加或修改进货订单管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="purchaseorderRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="进货日期" prop="orderDate">
          <el-date-picker clearable
            v-model="form.orderDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择进货日期">
          </el-date-picker>
        </el-form-item>
        <el-divider content-position="center">进货从表管理信息</el-divider>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" icon="Plus" @click="handleAddTbPurchaseDetail">添加</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" icon="Delete" @click="handleDeleteTbPurchaseDetail">删除</el-button>
          </el-col>
        </el-row>
        <el-table :data="tbPurchaseDetailList" :row-class-name="rowTbPurchaseDetailIndex" @selection-change="handleTbPurchaseDetailSelectionChange" ref="tbPurchaseDetail">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column label="序号" align="center" prop="index" width="50"/>
          <el-table-column label="仓库id" prop="warehouseId" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.warehouseId" placeholder="请输入仓库id" />
            </template>
          </el-table-column>
          <el-table-column label="图书id" prop="bookId" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.bookId" placeholder="请输入图书id" />
            </template>
          </el-table-column>
          <el-table-column label="数量" prop="quantity" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.quantity" placeholder="请输入数量" />
            </template>
          </el-table-column>
        </el-table>
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

<script setup name="Purchaseorder">
import { listPurchaseorder, getPurchaseorder, delPurchaseorder, addPurchaseorder, updatePurchaseorder } from "@/api/manage/purchaseorder"

const { proxy } = getCurrentInstance()

const purchaseorderList = ref([])
const tbPurchaseDetailList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const checkedTbPurchaseDetail = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref("")

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    orderId: null,
    orderDate: null
  },
  rules: {
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询进货订单管理列表 */
function getList() {
  loading.value = true
  listPurchaseorder(queryParams.value).then(response => {
    purchaseorderList.value = response.rows
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
    orderId: null,
    orderDate: null
  }
  tbPurchaseDetailList.value = []
  proxy.resetForm("purchaseorderRef")
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
  ids.value = selection.map(item => item.orderId)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加进货订单管理"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const _orderId = row.orderId || ids.value
  getPurchaseorder(_orderId).then(response => {
    form.value = response.data
    tbPurchaseDetailList.value = response.data.tbPurchaseDetailList
    open.value = true
    title.value = "修改进货订单管理"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["purchaseorderRef"].validate(valid => {
    if (valid) {
      form.value.tbPurchaseDetailList = tbPurchaseDetailList.value
      if (form.value.orderId != null) {
        updatePurchaseorder(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addPurchaseorder(form.value).then(response => {
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
  const _orderIds = row.orderId || ids.value
  proxy.$modal.confirm('是否确认删除进货订单管理编号为"' + _orderIds + '"的数据项？').then(function() {
    return delPurchaseorder(_orderIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 进货从表管理序号 */
function rowTbPurchaseDetailIndex({ row, rowIndex }) {
  row.index = rowIndex + 1
}

/** 进货从表管理添加按钮操作 */
function handleAddTbPurchaseDetail() {
  let obj = {}
  obj.warehouseId = ""
  obj.bookId = ""
  obj.quantity = ""
  tbPurchaseDetailList.value.push(obj)
}

/** 进货从表管理删除按钮操作 */
function handleDeleteTbPurchaseDetail() {
  if (checkedTbPurchaseDetail.value.length == 0) {
    proxy.$modal.msgError("请先选择要删除的进货从表管理数据")
  } else {
    const tbPurchaseDetails = tbPurchaseDetailList.value
    const checkedTbPurchaseDetails = checkedTbPurchaseDetail.value
    tbPurchaseDetailList.value = tbPurchaseDetails.filter(function(item) {
      return checkedTbPurchaseDetails.indexOf(item.index) == -1
    })
  }
}

/** 复选框选中数据 */
function handleTbPurchaseDetailSelectionChange(selection) {
  checkedTbPurchaseDetail.value = selection.map(item => item.index)
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('manage/purchaseorder/export', {
    ...queryParams.value
  }, `purchaseorder_${new Date().getTime()}.xlsx`)
}

getList()
</script>
