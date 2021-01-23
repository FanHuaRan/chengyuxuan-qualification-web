<template>
  <div class="app-container">
    <el-form :inline="true" :model="searchForm" class="demo-form-inline">
      <el-form-item label="问卷ID">
        <el-input v-model="searchForm.name" placeholder="请输入问卷ID"></el-input>
      </el-form-item>

      <el-form-item label="问卷名称">
        <el-input v-model="searchForm.name" placeholder="请输入问卷名称"></el-input>
      </el-form-item>

      <el-form-item label="问卷状态">
        <el-select v-model="searchForm.status" placeholder="请选择状态">
          <el-option label="生效中" value="1"></el-option>
          <el-option label="未生效" value="0"></el-option>
        </el-select>
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
      <el-table-column label="问卷名称" width="110" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="是否生效" width="110" align="center">
        <template slot-scope="scope">
          {{ scope.row.status === 1 ? "生效中": "未生效" }}
        </template>
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
          <el-button
            v-if="scope.row.status === 1"
            size="mini"
            type="danger"
            @click="handleUpdateStatus(scope.row.id, 0)">下线
          </el-button>
          <el-button
            v-if="scope.row.status === 0"
            size="mini"
            type="danger"
            @click="handleUpdateStatus(scope.row.id, 1)">上线
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
        <el-form-item label="问卷名称">
          <el-input v-model="form.name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="问题列表">
          <i class="el-icon-circle-plus" @click="policeFormVisible=true"></i>
          <el-table
            :data="form"
            border
            fit
            highlight-current-row
          >
            <el-table-column label="问题信息">
              <template slot-scope="scope">
                {{ scope.row }}
              </template>
            </el-table-column>

            <el-table-column align="center" label="操作" width="95">
              <template slot-scope="scope">
                <i class="el-icon-setting" @click="showPoliceEdit(scope.row, scope.$index)"
                   style="margin-left: 10px"></i>
                <i class="el-icon-delete-solid" @click="form.policies.remove(scope.$index)"
                   style="margin-left: 10px"></i>
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
  import {
    searchQuestionnaire,
    saveQuestionnaire,
    deleteQuestionnaire,
    updateQuestionnaireStatus
  } from '@/api/questionnaire'
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
          id: null,
          name: null,
          status: null,
        },
        form: {
          id: null,
          name: null,
          status: 0,
          questions: []
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
        searchQuestionnaire({
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
          deleteQuestionnaire(row.id).then(response => {
            this.fetchData()
          })
        })
      },

      handleUpdateStatus(id, status) {
        this.$confirm('确认' + status === 1 ? '上线?' : '下线?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteQuestionnaire(row.id).then(response => {
            this.fetchData()
          })
        })
      },

      onAdd() {
        this.formVisible = true
        this.form.id = null
        this.form.name = null
        this.form.status = null
        this.form.questions = []
      },

      onEdit(index, row) {
        this.form.id = row.id
        this.form.name = row.name
        this.form.status = row.status
        this.form.questions = row.questions
        this.formVisible = true
      },

      handleCancel() {
        this.form.id = null
        this.form.name = null
        this.form.status = null
        this.form.questions = []
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
            "questions": this.form.questions
          }
          saveQuestionnaire(params).then(response => {
            this.form.id = null
            this.form.name = null
            this.form.status = 0
            this.form.questions = []
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
