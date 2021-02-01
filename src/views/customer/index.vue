<template>
  <div class="app-container">
    <el-form :inline="true" :model="searchForm" class="demo-form-inline">
      <el-form-item label="客户姓名">
        <el-input v-model="searchForm.name" placeholder="名称"></el-input>
      </el-form-item>
      <el-form-item label="客户手机号">
        <el-input v-model="searchForm.phone" placeholder="手机号"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button icon="el-icon-search" type="primary" size="small" @click="onSearch">查询</el-button>
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

      <el-table-column label="客户姓名" width="150" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>

      <el-table-column label="客户手机号" width="150" align="center">
        <template slot-scope="scope">
          {{ scope.row.phone }}
        </template>
      </el-table-column>

      <el-table-column label="客户年龄" width="150" align="center">
        <template slot-scope="scope">
          {{ scope.row.age }}
        </template>
      </el-table-column>

      <el-table-column label="匹配银行">
        <template slot-scope="scope">
          <li v-for="value in scope.row.matchBankNames">
            {{ value }}
          </li>
        </template>
      </el-table-column>

      <el-table-column class-name="status-col" label="状态" width="110" align="center">
        <template slot-scope="scope">
          <el-tag effect="dark" :type="scope.row.status | statusFilter">{{ statusNameMap[scope.row.status.toString()] }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" prop="updated" label="问卷记录" width="200">
        <template slot-scope="scope">
          <el-button icon="el-icon-zoom-in"  size="mini"  @click="handleShowCommit(scope.row.phone)">点击查看</el-button>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="updated" label="创建时间" width="200">
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

          <el-button v-if="scope.row.status !== 0"
            size="mini"
            type="gray"
            @click="handleUpdateStatus(scope.row.id, 0)">待转化
          </el-button>
          <el-button v-if="scope.row.status !== 1"
            size="mini"
            type="success"
            @click="handleUpdateStatus(scope.row.id, 1)">转化
          </el-button>
          <el-button v-if="scope.row.status !== -1"
                     size="mini"
                     type="danger"
                     @click="handleUpdateStatus(scope.row.id, -1)">拉黑
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

    <el-dialog
            width="60%"
            title="问卷记录"
            :visible.sync="showCommitVisible">
      <el-table
        :data="commits"
        element-loading-text="Loading"
        border
        fit
        highlight-current-row
      >
        <el-table-column label="客户姓名" width="150" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.customerName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="客户手机号" width="150" align="center">
          <template slot-scope="scope">
            {{ scope.row.customerPhone }}
          </template>
        </el-table-column>
        <el-table-column label="客户年龄" width="150" align="center">
          <template slot-scope="scope">
            {{ scope.row.customerAge }}
          </template>
        </el-table-column>
        <el-table-column label="匹配银行">
          <template slot-scope="scope">
            <li v-for="value in scope.row.matchBankNames">
              {{ value }}
            </li>
          </template>
        </el-table-column>

        <el-table-column align="center" prop="updated" label="提交时间" width="200">
          <template slot-scope="scope">
            <span>{{ formatTime(scope.row.commitTime) }}</span>
          </template>
        </el-table-column>
      </el-table>

      <div slot="footer" class="dialog-footer">
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import {searchCustomer, updateCustomerStatus} from '@/api/customer'
  import {searchQuestionnaireCommitByPhone} from '@/api/questionnaire_commit'
  import {parseTime} from "@/utils";

  export default {
    filters: {
      statusFilter(status) {
        const statusMap = {
          "0": 'gray',
          "1": 'success',
          "-1": 'danger'
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
          name: null,
          phone: null,
        },
        statusNameMap: {
          "0": "待转化",
          "1": "已转化",
          "-1": "拉黑",
        },
        showCommitVisible: false,
        commits:[]
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
        searchCustomer({
          pageNum: this.currentPage,
          pageSize: this.pageSize,
          name: this.searchForm.name,
          phone: this.searchForm.phone,
          sortField: "updated",
          sortMode: "desc"
        }).then(response => {
          this.list = response.data.items
          this.total = response.data.total
          this.listLoading = false
        }).catch(e => {
          this.listLoading = false
        })
      },

      handlePageSizeChange(size){
        this.pageSize = size;
        this.fetchData()
      },

      handleCurrentPageChange(page){
        this.currentPage = page;
        this.fetchData()
      },

      formatTime(timeStamp) {
        return parseTime(timeStamp, "{y}-{m}-{d} {h}:{i}:{s}")
      },

      handleUpdateStatus(id, status) {
        this.$confirm('确认更改状态', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          updateCustomerStatus({
            id: id,
            status: status
          }).then(response => {
            this.fetchData()
          })
        })
      },

      handleShowCommit(phone) {
        this.commits = []
          searchQuestionnaireCommitByPhone(phone).then(response => {
            this.commits = response.data
            this.showCommitVisible = true
          })
      },
    }
  }
</script>
