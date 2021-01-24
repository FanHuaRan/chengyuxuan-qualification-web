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
          <i class="el-icon-circle-plus" @click="questionFormVisible=true"></i>
          <el-table
            :data="form.questions"
            border
            fit
            highlight-current-row
          >
            <el-table-column label="问题编号" width="100">
              <template slot-scope="scope">
                {{ scope.$index + 1 }}
              </template>
            </el-table-column>

            <el-table-column label="问题描述">
              <template slot-scope="scope">
                {{ scope.row.questionDesc }}
              </template>
            </el-table-column>

            <el-table-column align="center" label="操作" width="95">
              <template slot-scope="scope">
                <i class="el-icon-setting" @click="showQuestionEdit(scope.$index)"
                   style="margin-left: 10px"></i>
                <i class="el-icon-delete-solid" @click="form.questions.remove(scope.$index)"
                   style="margin-left: 10px"></i>
              </template>
            </el-table-column>
          </el-table>

          <el-dialog
            width="60%"
            title="编辑问题"
            :visible.sync="questionFormVisible"
            append-to-body>

            <el-form :model="form">
              <el-form-item label="问题描述">
                <el-input
                  type="textarea"
                  :rows="5"
                  placeholder="请输入问题"
                  v-model="questionForm.questionDesc">
                </el-input>
              </el-form-item>

              <el-form-item label="答案选项">
                <i class="el-icon-circle-plus" @click="onAnswerAdd"></i>
              </el-form-item>

              <el-row v-for="(answer,index) in questionForm.questionAnswers">
                <span style="margin-top: 5px"></span>
                <el-col :span="10">
                  <el-input v-model="answer.answerDesc" placeholder="请输入答案"></el-input>
                </el-col>
                <el-col :span="6">
                  <el-select v-model="answer.matchBankIds" placeholder="请选择命中银行"></el-select>
                </el-col>
                <el-col :span="8">
                  <el-button v-if="questionForm.questionAnswers.length > 1" type="danger" @click="questionForm.questionAnswers.remove(index)">删除</el-button>
                </el-col>
              </el-row>

            </el-form>

            <div slot="footer" class="dialog-footer">
              <el-button @click="handleQuestionCancel">取 消</el-button>
              <el-button type="primary" @click="handleQuestionSave">确 定</el-button>
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
        questionForm: {
          questionDesc: null,
          questionAnswers: [
            {
              answerDesc: null,
              matchBankIds: []
            }
          ],
        },
        questionFormVisible: false
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
          updateQuestionnaireStatus({
            id: id,
            status: status
          }).then(response => {
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

      onAnswerAdd() {
       this.questionForm.questionAnswers.push({
          answerDesc: null,
          matchBankIds: []
       });
      },

      showQuestionEdit(index){
        this.questionForm = {
          questionDesc: this.form.questions[index].questionDesc,
          questionAnswers: this.form.questions[index].questionAnswers,
        }
        this.questionFormVisible = true
      },

      handleQuestionSave() {
        this.form.questions.push({
          questionDesc: this.questionForm.questionDesc,
          questionAnswers: this.questionForm.questionAnswers,
        })
        this.questionFormVisible = false
        this.questionForm = {
          questionDesc: null,
          questionAnswers: [
            {
              answerDesc: null,
              matchBankIds: []
            }
          ],
        }
      },

      handleQuestionCancel() {
        this.questionFormVisible = false
        this.questionForm ={
          questionDesc: null,
            questionAnswers: [
            {
              answerDesc: null,
              matchBankIds: []
            }
          ],
        }
      },
    }
  }
</script>
