<template>
  <div class="app-container">
    <el-form :inline="true" :model="searchForm" class="demo-form-inline">
      <el-form-item label="银行名称">
        <el-input v-model="searchForm.name" placeholder="名称"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" size="small" @click="onSearch">查询</el-button>
        <el-button type="danger" size="small" @click="onAdd">新增</el-button>
      </el-form-item>
    </el-form>

    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column align="center" label="ID" width="95">
        <template slot-scope="scope">
          {{ scope.row.id }}
        </template>
      </el-table-column>
      <el-table-column label="名称" width="110" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="联系电话" width="110" align="center">
        <template slot-scope="scope">
          {{ scope.row.phone }}
        </template>
      </el-table-column>
      <el-table-column label="政策">
        <template slot-scope="scope">
          <li v-for="value in scope.row.policies">
            {{ value }}
          </li>
        </template>
        i
      </el-table-column>
      <!--      <el-table-column class-name="status-col" label="Status" width="110" align="center">-->
      <!--        <template slot-scope  ="scope">-->
      <!--          <el-tag :type="scope.row.status | statusFilter">{{ scope.row.status }}</el-tag>-->
      <!--        </template>-->
      <!--      </el-table-column>-->
      <el-table-column align="center" prop="updater" label="最后修改人" width="200">
        <template slot-scope="scope">
          <span>{{ scope.row.updaterName }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="updated" label="修改时间" width="200">
        <template slot-scope="scope">
          <span>{{ formatTime(scope.row.updated) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
<!--          <el-button-->
<!--            size="mini"-->
<!--            @click="handleEdit(scope.$index, scope.row)">详情-->
<!--          </el-button>-->
          <el-button
            size="mini"
            type="primary"
            @click="onEdit(scope.$index, scope.row)">编辑
          </el-button>
          <el-button
            size="mini"
            type="danger"
            @click="handleDelete(scope.$index, scope.row)">删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      layout="prev, pager, next"
      :current-page=currentPage
      :page-size=pageSize
      :total=total>
    </el-pagination>

    <el-dialog title="新增/编辑" :visible.sync="formVisible">
      <el-form :model="form">
        <el-form-item label="银行名称">
          <el-input v-model="form.name" autocomplete="off" :readonly="form.id !== null"></el-input>
        </el-form-item>
        <el-form-item label="联系人电话">
          <el-input v-model="form.phone" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="政策">
          <i class="el-icon-circle-plus" @click="policeFormVisible=true"></i>
          <el-table
            :data="form.policies"
            border
            fit
            highlight-current-row
          >
            <el-table-column label="政策条例">
              <template slot-scope="scope">
                {{ scope.row }}
              </template>
            </el-table-column>

            <el-table-column align="center" label="操作" width="95">
              <template slot-scope="scope">
                <i class="el-icon-setting" @click="showPoliceEdit(scope.row, scope.$index)" style="margin-left: 10px"></i>
                <i class="el-icon-delete-solid" @click="form.policies.remove(scope.$index)" style="margin-left: 10px"></i>
              </template>
            </el-table-column>
          </el-table>

          <el-dialog
            width="30%"
            title="编辑政策"
            :visible.sync="policeFormVisible"
            append-to-body>
            <el-input
              type="textarea"
              :rows="5"
              placeholder="请输入内容"
              v-model="policeForm.policeValue">
            </el-input>
            <div slot="footer" class="dialog-footer">
              <el-button @click="handlePoliceCancel">取 消</el-button>
              <el-button type="primary" @click="handlePoliceSave">确 定</el-button>
            </div>
          </el-dialog>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleCancel">取 消</el-button>
        <el-button type="primary" @click="handleSave">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import {searchBank, saveBank, deleteBank} from '@/api/table'
  import {parseTime} from "@/utils";

  export default {
    filters: {
      statusFilter(status) {
        const statusMap = {
          published: 'success',
          draft: 'gray',
          deleted: 'danger'
        }
        return statusMap[status]
      },
    },
    data() {
      return {
        list: null,
        listLoading: true,
        currentPage: 1,
        pageSize: 20,
        total: 20,
        searchForm: {
          name: '',
        },
        form: {
          id: null,
          name: null,
          phone: null,
          policies: []
        },
        formVisible: false,
        policeForm: {
          policeValue: null,
          policeIndex: null,
        },
        policeFormVisible: false
      }
    },

    created() {
      this.fetchData()
    },

    methods: {
      onSearch() {
        this.currentPage = 1
        this.fetchData()
      },
      fetchData() {
        this.listLoading = true
        searchBank({
          pageNum: this.currentPage,
          pageSize: this.pageSize,
          name: this.searchForm.name,
          sortField: "updated",
          sortMode: "desc"
        }).then(response => {
          this.list = response.data.items
          this.listLoading = false
        })
      },
      formatTime(timeStamp) {
        return parseTime(timeStamp, "{y}-{m}-{d} {h}:{i}:{s}")
      },

      handleDelete(index, row) {
        this.$confirm('确认删除?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteBank(row.id).then(response => {
            this.fetchData()
          })
        })
      },

      onAdd(){
        this.formVisible = true
        this.form.id = null
        this.form.name = null
        this.form.phone = null
        this.form.policies = []
      },

      onEdit(index, row) {
        this.form.id = row.id
        this.form.name = row.name
        this.form.phone = row.phone
        this.form.policies = row.policies
        this.formVisible = true
      },

      handleCancel() {
        this.form.id = null
        this.form.name = null
        this.form.phone = null
        this.form.policies = []
        this.formVisible = false
      },

      handleSave() {
        this.$confirm('确认保存?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          const params = {
            "id": this.form.id,
            "name": this.form.name,
            "phone": this.form.phone,
            "policies": this.form.policies
          }
          saveBank(params).then(response => {
            this.form.id = null
            this.form.name = null
            this.form.phone = null
            this.form.policies = []
            this.formVisible = false
            this.fetchData()
          })
        })
      },

      showPoliceEdit(row, index) {
        this.policeForm.policeIndex = index
        this.policeForm.policeValue = row
        this.policeFormVisible = true
      },

      handlePoliceSave() {
        if (this.policeForm.policeIndex !== null) {
          this.form.policies.splice(this.policeForm.policeIndex, 1, this.policeForm.policeValue)
        } else {
          this.form.policies.push(this.policeForm.policeValue)
        }
        this.policeFormVisible = false
        this.policeForm.policeIndex = null
        this.policeForm.policeValue = null
      },

      handlePoliceCancel() {
        this.policeFormVisible = false
        this.policeForm.policeIndex = null
        this.policeForm.policeValue = null
      },
    }
  }
</script>
