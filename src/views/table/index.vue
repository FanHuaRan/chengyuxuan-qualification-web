<template>
  <div class="app-container">
    <el-form :inline="true" :model="searchForm" class="demo-form-inline">
      <el-form-item label="银行名称">
        <el-input v-model="searchForm.name" placeholder="名称"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" size="small" @click="onSearch">查询</el-button>
      </el-form-item>
    </el-form>

    <div>
      <p><el-button type="primary" size="small" class="right">新增</el-button></p>
    </div>

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
          {{ scope.row.polices }}
        </template>
      </el-table-column>
      <!--      <el-table-column class-name="status-col" label="Status" width="110" align="center">-->
      <!--        <template slot-scope="scope">-->
      <!--          <el-tag :type="scope.row.status | statusFilter">{{ scope.row.status }}</el-tag>-->
      <!--        </template>-->
      <!--      </el-table-column>-->
      <el-table-column align="center" prop="updater" label="最后修改人" width="200">
        <template slot-scope="scope">
          <span>{{ formatTime(scope.row.updater) }}</span>
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
            @click="handleEdit(scope.$index, scope.row)">详情</el-button>
          <el-button
            size="mini"
            type="primary"
            @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
          <el-button
            size="mini"
            type="danger"
            @click="handleDelete(scope.$index, scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      layout="prev, pager, next"
      :current-page=currentPage
      :page-size=pageSize
      :total=total>
    </el-pagination>
  </div>
</template>

<script>
  import {getList} from '@/api/table'
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
        }
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
        getList({
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
      handleEdit(index, row) {
        console.log(index, row);
      },
      handleDelete(index, row) {
        console.log(index, row);
      }
    }
  }
</script>
