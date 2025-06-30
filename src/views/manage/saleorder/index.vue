<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="销售订单id" prop="orderId">
        <el-input
          v-model="queryParams.orderId"
          placeholder="请输入销售订单id"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="销售日期" prop="orderDate">
        <el-date-picker clearable
          v-model="queryParams.orderDate"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择销售日期">
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
          v-hasPermi="['manage:saleorder:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['manage:saleorder:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['manage:saleorder:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['manage:saleorder:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="saleorderList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="销售订单id" align="center" prop="orderId" />
      <el-table-column label="销售日期" align="center" prop="orderDate" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.orderDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['manage:saleorder:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['manage:saleorder:remove']">删除</el-button>
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

    <!-- 添加或修改销售订单管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="saleorderRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="销售日期" prop="orderDate">
          <el-date-picker clearable
            v-model="form.orderDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择销售日期">
          </el-date-picker>
        </el-form-item>
        <el-divider content-position="center">销售从表管理信息</el-divider>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" icon="Plus" @click="handleAddTbSalesDetail">添加</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" icon="Delete" @click="handleDeleteTbSalesDetail">删除</el-button>
          </el-col>
        </el-row>
        <el-table :data="tbSalesDetailList" :row-class-name="rowTbSalesDetailIndex" @selection-change="handleTbSalesDetailSelectionChange" ref="tbSalesDetail">
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

<script setup name="Saleorder">
import { listSaleorder, getSaleorder, delSaleorder, addSaleorder, updateSaleorder } from "@/api/manage/saleorder"

const { proxy } = getCurrentInstance()

const saleorderList = ref([])
const tbSalesDetailList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const checkedTbSalesDetail = ref([])
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

/** 查询销售订单管理列表 */
function getList() {
  loading.value = true
  listSaleorder(queryParams.value).then(response => {
    saleorderList.value = response.rows
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
  tbSalesDetailList.value = []
  proxy.resetForm("saleorderRef")
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
  title.value = "添加销售订单管理"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const _orderId = row.orderId || ids.value
  getSaleorder(_orderId).then(response => {
    form.value = response.data
    tbSalesDetailList.value = response.data.tbSalesDetailList
    open.value = true
    title.value = "修改销售订单管理"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["saleorderRef"].validate(valid => {
    if (valid) {
      form.value.tbSalesDetailList = tbSalesDetailList.value
      if (form.value.orderId != null) {
        updateSaleorder(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addSaleorder(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除销售订单管理编号为"' + _orderIds + '"的数据项？').then(function() {
    return delSaleorder(_orderIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 销售从表管理序号 */
function rowTbSalesDetailIndex({ row, rowIndex }) {
  row.index = rowIndex + 1
}

/** 销售从表管理添加按钮操作 */
function handleAddTbSalesDetail() {
  let obj = {}
  obj.warehouseId = ""
  obj.bookId = ""
  obj.quantity = ""
  tbSalesDetailList.value.push(obj)
}

/** 销售从表管理删除按钮操作 */
function handleDeleteTbSalesDetail() {
  if (checkedTbSalesDetail.value.length == 0) {
    proxy.$modal.msgError("请先选择要删除的销售从表管理数据")
  } else {
    const tbSalesDetails = tbSalesDetailList.value
    const checkedTbSalesDetails = checkedTbSalesDetail.value
    tbSalesDetailList.value = tbSalesDetails.filter(function(item) {
      return checkedTbSalesDetails.indexOf(item.index) == -1
    })
  }
}

/** 复选框选中数据 */
function handleTbSalesDetailSelectionChange(selection) {
  checkedTbSalesDetail.value = selection.map(item => item.index)
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('manage/saleorder/export', {
    ...queryParams.value
  }, `saleorder_${new Date().getTime()}.xlsx`)
}

getList()
</script>
