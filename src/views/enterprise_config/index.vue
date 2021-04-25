<template>
  <div class="app-container">
    <h4>问卷配置（该配置作用于该企业下的所有问卷）</h4>
    <div style="width: 800px; margin: 0 auto">
      <el-form :model="form">
        <el-form-item label="问卷头信息配置">
          <i class="el-icon-circle-plus" @click="onAdd"></i>
          <el-table
            :data="form.configFields"
            border
            fit
            highlight-current-row
          >
            <el-table-column label="编号" width="100">
              <template slot-scope="scope">
                {{ scope.$index + 1 }}
              </template>
            </el-table-column>

            <el-table-column label="字段描述">
              <template slot-scope="scope">
                <el-input v-model="scope.row.name" placeholder="请输入"></el-input>
              </template>
            </el-table-column>

            <el-table-column align="center" label="操作" width="200">
              <template slot-scope="scope">
                <i v-if="scope.$index < (form.configFields.length - 1)"
                   class="el-icon-bottom" @click="onMoveOff(scope.$index)"></i>
                <i v-if="scope.$index > 0"
                   class="el-icon-top" @click="onMoveOn(scope.$index)"
                   style="margin-left: 10px"></i>
                <i class="el-icon-delete-solid" @click="form.configFields.remove(scope.$index)"
                   style="margin-left: 10px"></i>
              </template>
            </el-table-column>
          </el-table>

        </el-form-item>
        <el-form-item>
          <el-button type="danger" size="small" @click="handleSave">保存</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
  import {getEnterpriseQuestionnaireConfig, saveEnterpriseQuestionnaireConfig} from '@/api/enterprise_config'

  export default {
    filters: {},
    data() {
      return {
        form: {
          configFields: [],
        },
      }
    },

    created() {
      this.fetchData()
    },

    methods: {
      fetchData() {
        getEnterpriseQuestionnaireConfig({}).then(response => {
          if (response && response.data && response.data.configFields) {
            this.form.configFields = response.data.configFields.map(p =>{
              return {name: p}
            });
          }
        })
      },

      handleSave() {
        this.$confirm('确认保存?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          const params = {
            "configFields": this.form.configFields.map(p => p.name),
          }
          saveEnterpriseQuestionnaireConfig(params).then(response => {
            this.fetchData()
          })
        })
      },

      onAdd() {
        this.form.configFields.push({
          name: ''
        });
      },

      onMoveOn(index) {
        const swapIndex = index - 1
        const arr = this.form.configFields
        arr[swapIndex] = arr.splice(index, 1, arr[swapIndex])[0];
        this.form.configFields = arr
      },

      onMoveOff(index) {
        const swapIndex = index + 1
        const arr = this.form.configFields
        arr[swapIndex] = arr.splice(index, 1, arr[swapIndex])[0];
        this.form.configFields = arr
      },
    }
  }
</script>
