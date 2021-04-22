<template>
  <div class="app-container">
    <el-form :inline="true" :model="searchForm" class="demo-form-inline">
      <el-form-item label="企业ID">
        <el-input v-model="searchForm.id" placeholder="名称"></el-input>
      </el-form-item>
      <el-form-item label="企业名称">
        <el-input v-model="searchForm.name" placeholder="名称"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button icon="el-icon-search" type="primary" size="small" @click="onSearch">查询</el-button>
        <el-button icon="el-icon-circle-plus-outline" type="danger" size="small" @click="onAdd">新增</el-button>
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
      <el-table-column label="企业名称" width="110" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="套餐类型" width="110" align="center">
        <template slot-scope="scope">
          {{ scope.row.paidType == 1 ? "按次付费" : "" }}
        </template>
      </el-table-column>
      <el-table-column label="问卷剩余配置个数" width="110" align="center">
        <template slot-scope="scope">
          {{ scope.row.remainQuestionnaire}}
        </template>
      </el-table-column>
      <el-table-column label="问卷剩余答题次数" width="110" align="center">
        <template slot-scope="scope">
          {{ scope.row.remainCommit}}
        </template>
      </el-table-column>

      <el-table-column align="center" prop="updater" label="最后修改人" width="200">
        <template slot-scope="scope">
          <span>{{ scope.row.updaterName }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="created" label="创建时间" width="200">
        <template slot-scope="scope">
          <span>{{ formatTime(scope.row.created) }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="updated" label="修改时间" width="200">
        <template slot-scope="scope">
          <span>{{ formatTime(scope.row.updated) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="primary"
            @click="onEdit(scope.$index, scope.row)">编辑
          </el-button>
          <el-button
            size="mini"
            type="danger"
            @click="onRecharge(scope.$index, scope.row)">充值
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
      @size-change="handlePageSizeChange"
      @current-change="handleCurrentPageChange"
      layout="prev, pager, next"
      :current-page=currentPage
      :page-size=pageSize
      :total=total>
    </el-pagination>

    <el-dialog title="新增/编辑" :visible.sync="formVisible">
      <el-form :model="form">
        <el-form-item label="企业名称">
          <el-input v-model="form.name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="套餐类型">
          <el-radio-group v-model="form.paidType">
            <el-radio :label="1">按次付费</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="问卷个数">
          <el-input-number v-model="form.remainQuestionnaire"></el-input-number>
        </el-form-item>
        <el-form-item label="答题次数">
          <el-input-number v-model="form.remainCommit"></el-input-number>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleCancel">取 消</el-button>
        <el-button type="primary" @click="handleSave">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="重置" :visible.sync="rechargeFormVisible">
      <el-form :model="rechargeForm">
        <el-form-item label="问卷个数">
          <el-input-number v-model="form.remainQuestionnaire"></el-input-number>
        </el-form-item>
        <el-form-item label="答题次数">
          <el-input-number v-model="form.remainCommit"></el-input-number>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleRechargeCancel">取 消</el-button>
        <el-button type="primary" @click="handleRecharge">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import {searchEnterprise, saveEnterprise, deleteEnterprise, rechargeEnterprise} from '@/api/enterprise'
  import {parseTime} from "@/utils";

  export default {
    filters: {},
    data() {
      return {
        list: null,
        listLoading: true,
        currentPage: 1,
        pageSize: 20,
        total: 20,
        searchForm: {
          id: null,
          name: '',
        },
        form: {
          id: null,
          name: null,
          paidType: null,
          remainQuestionnaire: null,
          remainCommit: null
        },
        formVisible: false,
        lastEditFormId: null,

        rechargeForm: {
          id: null,
          remainQuestionnaire: null,
          remainCommit: null
        },
        rechargeFormVisible: false,
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
      handlePageSizeChange(size) {
        this.pageSize = size;
        this.fetchData()
      },
      handleCurrentPageChange(page) {
        this.currentPage = page;
        this.fetchData()
      },
      fetchData() {
        this.listLoading = true
        searchEnterprise({
          pageNum: this.currentPage,
          pageSize: this.pageSize,
          id: this.searchForm.id,
          name: this.searchForm.name,
          sortField: "updated",
          sortMode: "desc"
        }).then(response => {
          this.list = response.data.items
          this.total = response.data.total
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
          deleteEnterprise(row.id).then(response => {
            this.fetchData()
          })
        })
      },

      onAdd() {
        this.form.id = null
        this.form.name = null
        this.form.paidType = null
        this.form.remainQuestionnaire = null
        this.form.remainCommit = null
        this.lastFormEditId = null
        this.formVisible = true
      },

      onEdit(index, row) {
        this.form.id = row.id
        this.form.name = row.name
        this.form.paidType = row.paidType
        this.form.remainQuestionnaire = row.remainQuestionnaire
        this.form.remainCommit = row.remainCommit
        this.lastFormEditId = row.id
        this.formVisible = true
      },

      handleCancel() {
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
          saveEnterprise(params).then(response => {
            this.form.id = null
            this.form.name = null
            this.form.paidType = null
            this.form.remainQuestionnaire = null
            this.form.remainCommit = null
            this.formVisible = false
            this.lastFormEditId = null
            this.fetchData()
          })
        })
      },


      onRecharge(index, row) {
        this.rechargeForm.id = row.id
        this.rechargeForm.remainQuestionnaire = null
        this.rechargeForm.remainCommit = null
      },

      handleRechargeCancel() {
        this.rechargeFormVisible = false
      },

      handleRecharge() {
        this.$confirm('确认充值?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          const params = {
            "id": this.rechargeForm.id,
            "remainQuestionnaire": this.rechargeForm.remainQuestionnaire,
            "remainCommit": this.rechargeForm.remainCommit,
          }
          rechargeEnterprise(params).then(response => {
            this.form.id = null
            this.form.remainQuestionnaire = null
            this.form.remainCommit = null
            this.fetchData()
          })
        })
      },
    }
  }
</script>
