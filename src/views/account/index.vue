<template>
  <div class="app-container">

    <el-form :inline="true" class="demo-form-inline">
      <el-form-item>
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
      <el-table-column label="用户名" width="210" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="昵称" width="210" align="center">
        <template slot-scope="scope">
          {{ scope.row.nickName }}
        </template>
      </el-table-column>
      <el-table-column label="企业" width="210" align="center">
        <template slot-scope="scope">
          {{ scope.row.enterpriseName }}
        </template>
      </el-table-column>
      <el-table-column label="角色" width="250" align="center">
        <template slot-scope="scope">
          {{ scope.row.roleNames.join(",") }}
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
            v-if="scope.row.name !== 'admin' && scope.row.name !== 'chengyuxuan'"
            size="mini"
            type="primary"
            @click="onEdit(scope.$index, scope.row)">编辑
          </el-button>
          <el-button
            v-if="scope.row.name !== 'admin' && scope.row.name !== 'chengyuxuan'"
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
        <el-form-item v-if=" name === 'admin' || name === 'chengyuxuan'" label="企业">
          <el-select v-model="form.enterpriseId" filterable placeholder="请选择">
            <el-option
              v-for="item in enterprises"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="form.roles" filterable multiple placeholder="角色">
            <el-option v-if=" name === 'admin' || name === 'chengyuxuan'" key="enterpriser" label="企业管理员"
                       value="enterpriser"></el-option>
            <el-option key="worker" label="企业用户" value="worker"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="用户名">
          <el-input v-model="form.name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="form.nickName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input placeholder="若不修改密码请不要填写" v-model="form.password" autocomplete="off" show-password></el-input>
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
  import {searchAccount, saveAccount, deleteAccount} from '@/api/account'
  import {allEnterprise} from '@/api/enterprise'
  import {parseTime} from "@/utils";
  import md5 from 'js-md5';
  import {mapGetters} from "vuex";

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
    name: '',
    computed: {
      ...mapGetters([
        'name'
      ])
    },

    data() {
      return {
        enterprises: [],
        list: null,
        listLoading: true,
        currentPage: 1,
        pageSize: 20,
        total: 20,
        form: {
          id: null,
          name: null,
          enterpriseId: null,
          roles: [],
          nickName: null,
          password: null,
        },
        formVisible: false,
      }
    },

    created() {
      this.fetchData()
      allEnterprise().then(response => {
        this.enterprises = response.data
      })
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
        searchAccount({
          pageNum: this.currentPage,
          pageSize: this.pageSize,
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
          deleteAccount(row.id).then(response => {
            this.fetchData()
          })
        })
      },

      onAdd() {
        this.form.id = null
        this.form.name = null
        this.form.nickName = null
        this.form.password = null
        this.form.enterpriseId = null
        this.form.roles = []
        this.formVisible = true
      },

      onEdit(index, row) {
        this.form.id = row.id
        this.form.name = row.name
        this.form.nickName = row.nickName
        this.form.enterpriseId = row.enterpriseId
        this.form.roles = row.roles
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
          let password = null
          if (this.form.password !== null && this.form.password !== '') {
            password = md5(this.form.password)
          }
          const params = {
            "id": this.form.id,
            "name": this.form.name,
            "nickName": this.form.nickName,
            "enterpriseId": this.form.enterpriseId,
            "roles": this.form.roles,
            "password": password
          }
          saveAccount(params).then(response => {
            this.form.id = null
            this.form.name = null
            this.form.nickName = null
            this.form.password = null
            this.form.enterpriseId = null
            this.form.roles = []
            this.formVisible = false
            this.fetchData()
          })
        })
      },
    }
  }
</script>
