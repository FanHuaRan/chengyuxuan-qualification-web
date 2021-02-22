<template>
  <div class="app-container">
    <el-form :inline="true" :model="searchForm" class="demo-form-inline">
      <el-form-item label="问卷ID">
        <el-input v-model="searchForm.id" placeholder="请输入问卷ID"></el-input>
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
      <el-table-column label="问卷名称" width="210" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="是否生效" width="110" align="center">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status === 1" effect="dark" type="primary">生效中</el-tag>
          <el-tag v-if="scope.row.status === 0" effect="dark" type="danger">未生效</el-tag>
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
            @click="handleDelete(scope.$index, scope.row)">删除
          </el-button>
          <el-button
            size="mini"
            @click="onClone(scope.$index, scope.row)">复制
          </el-button>
          <el-button
            v-if="scope.row.status === 1"
            size="mini"
            type="info"
            @click="handleUpdateStatus(scope.row.id, 0)">下线
          </el-button>
          <el-button
            v-if="scope.row.status === 0"
            size="mini"
            type="success"
            @click="handleUpdateStatus(scope.row.id, 1)">上线
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
        <el-form-item label="问卷名称">
          <el-input v-model="form.name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="问题列表">
          <i class="el-icon-circle-plus" @click="onQuestionAdd"></i>
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

            <el-table-column align="center" label="操作" width="150">
              <template slot-scope="scope">
                <i v-if="scope.$index < (form.questions.length - 1)"
                   class="el-icon-bottom" @click="onQuestionMoveOff(scope.$index)"></i>
                <i v-if="scope.$index > 0"
                   class="el-icon-top" @click="onQuestionMoveOn(scope.$index)"
                   style="margin-left: 10px"></i>
                <i class="el-icon-setting" @click="showQuestionEdit(scope.$index)"
                   style="margin-left: 10px"></i>
                <i class="el-icon-copy-document" @click="OnCloneQuestion(scope.$index)"
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

              <div v-for="(answer,index) in questionForm.questionOptions">
                <p style="margin-top: 5px"></p>
                <el-row>
                  <el-col :span="10">
                    <el-input v-model="answer.optionDesc" placeholder="请输入答案"></el-input>
                  </el-col>
                  <el-col :span="6">
                    <el-select v-model="answer.matchBankIds" filterable multiple placeholder="请选择命中银行">
                      <el-option
                        v-for="item in banks"
                        :key="item.id"
                        :label="item.name"
                        :value="item.id">
                      </el-option>
                    </el-select>
                  </el-col>
                  <el-col :span="8">
                    <el-button v-if="index < (questionForm.questionOptions.length - 1)"
                               size="small"
                               @click="onAnswerMoveOff(index)">下移
                    </el-button>
                    <el-button v-if="index > 0"
                               size="small"
                               @click="onAnswerMoveOn(index)">上移
                    </el-button>
                    <el-button size="small"
                               @click="OnCloneAnswer(index)">复制
                    </el-button>
                    <el-button v-if="questionForm.questionOptions.length > 1"
                               type="danger"
                               size="small"
                               @click="questionForm.questionOptions.remove(index)">删除
                    </el-button>
                  </el-col>
                </el-row>
              </div>
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
  import {
    allBank,
  } from '@/api/table'
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
        banks: [],
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
        lastFormEditId: null,
        questionForm: {
          questionEditIndex: null,
          questionDesc: null,
          questionOptions: [
            {
              optionDesc: null,
              matchBankIds: []
            }
          ],
        },
        questionFormVisible: false,
        lastQuestionEditIndex: null,
      }
    },

    created() {
      this.fetchData()
      allBank().then(response => {
        this.banks = response.data
      })
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
          id: this.searchForm.id,
          name: this.searchForm.name,
          status: this.searchForm.status,
          sortField: "updated",
          sortMode: "desc"
        }).then(response => {
          this.list = response.data.items
          this.total = response.data.total
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
        this.$confirm(status === 1? '确认上线?' : '确认下线?', '提示', {
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
        if (this.lastFormEditId != null){
          this.form.id = null
          this.form.name = null
          this.form.status = null
          this.form.questions = []
        }
        this.formVisible = true
        this.lastFormEditId = null
      },

      onEdit(index, row) {
        if (this.lastFormEditId !== row.id){
          this.form.id = row.id
          this.form.name = row.name
          this.form.status = row.status
          this.form.questions = row.questions
        }
        this.formVisible = true
        this.lastFormEditId = row.id
      },

      onClone(index, row) {
        this.form.id = null
        this.form.name = row.name + "复制"
        this.form.questions = JSON.parse(JSON.stringify(row.questions))
        this.formVisible = true
      },

      handleCancel() {
        // this.form.id = null
        // this.form.name = null
        // this.form.status = null
        // this.form.questions = []
        this.formVisible = false
        // this.lastFormEditId = null
      },

      handleSave() {
        this.$confirm('确认保存?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          const questions = []
          this.form.questions.forEach((value, index) => {
            const questionOptions = []
            value.questionOptions.forEach((optionValue, optionIndex) => {
              questionOptions.push({
                optionSeq: optionIndex + 1,
                optionDesc: optionValue.optionDesc,
                matchBankIds: optionValue.matchBankIds
              })
            })

            questions.push({
              seq: index + 1,
              questionDesc: value.questionDesc,
              questionOptions: questionOptions
            })
          })
          const params = {
            "id": this.form.id,
            "name": this.form.name,
            "questions": questions
          }
          saveQuestionnaire(params).then(response => {
            this.form.id = null
            this.form.name = null
            this.form.status = 0
            this.form.questions = []
            this.formVisible = false
            this.lastFormEditId = null
            this.fetchData()
          })
        })
      },

      onQuestionAdd() {
        if (this.lastQuestionEditIndex != null){
          this.questionForm = {
            questionEditIndex: null,
            questionDesc: null,
            questionOptions: [
              {
                optionDesc: null,
                matchBankIds: []
              }
            ],
          }
        }
        this.questionFormVisible = true
        this.lastQuestionEditIndex = null
      },

      OnCloneQuestion(index){
        const question = {
          questionDesc: this.form.questions[index].questionDesc,
          questionOptions: JSON.parse(JSON.stringify(this.form.questions[index].questionOptions)),
        }
        this.form.questions.splice(index, 0, question)
      },

      onAnswerAdd() {
        this.questionForm.questionOptions.push({
          optionDesc: null,
          matchBankIds: []
        });
      },

      OnCloneAnswer(index){
        const answer = {
          optionDesc: this.questionForm.questionOptions[index].optionDesc,
          matchBankIds: JSON.parse(JSON.stringify(this.questionForm.questionOptions[index].matchBankIds))
        }
        this.questionForm.questionOptions.splice(index, 0, answer)
      },

      onQuestionMoveOn(index) {
        const swapIndex = index - 1
        const arr = this.form.questions
        arr[swapIndex] = arr.splice(index, 1, arr[swapIndex])[0];
        this.form.questions = arr
      },

      onQuestionMoveOff(index) {
        const swapIndex = index + 1
        const arr = this.form.questions
        arr[swapIndex] = arr.splice(index, 1, arr[swapIndex])[0];
        this.form.questions = arr
      },

      onAnswerMoveOn(index) {
        const swapIndex = index - 1
        const arr = this.questionForm.questionOptions
        arr[swapIndex] = arr.splice(index, 1, arr[swapIndex])[0];
        this.questionForm.questionOptions = arr
      },

      onAnswerMoveOff(index) {
        const swapIndex = index + 1
        const arr = this.questionForm.questionOptions
        arr[swapIndex] = arr.splice(index, 1, arr[swapIndex])[0];
        this.questionForm.questionOptions = arr
      },

      showQuestionEdit(index) {
        this.questionForm = {
          questionEditIndex: index,
          questionDesc: this.form.questions[index].questionDesc,
          questionOptions: this.form.questions[index].questionOptions,
        }
        this.questionFormVisible = true
        this.lastQuestionEditIndex = index
      },

      handleQuestionSave() {
        const question = {
          questionDesc: this.questionForm.questionDesc,
          questionOptions: this.questionForm.questionOptions,
        }
        if (this.questionForm.questionEditIndex !== null){
            this.form.questions.splice(this.questionForm.questionEditIndex, 1, question)
        } else {
          this.form.questions.push(question)
        }
        this.lastQuestionEditIndex = this.form.questions.length - 1
        this.questionFormVisible = false
        this.questionForm = {
          questionEditIndex: null,
          questionDesc: null,
          questionOptions: [
            {
              optionDesc: null,
              matchBankIds: []
            }
          ],
        }
      },

      handleQuestionCancel() {
        this.questionFormVisible = false
        // this.questionForm = {
        //   questionEditIndex: null,
        //   questionDesc: null,
        //   questionOptions: [
        //     {
        //       optionDesc: null,
        //       matchBankIds: []
        //     }
        //   ],
        // }
      },
    }
  }
</script>
