/**
 * Created by 13576 on 2017/10/6.
 */
import React from 'react'
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl';
import { Button, Table, Select,Form,Input,Switch,Icon,Upload,message} from 'antd';
import axios from 'axios'
const FormItem = Form.Item;
const Option = Select.Option;

import Chooser from  'components/Chooser';
import ListSelector from 'components/list-selector.js';
import httpFetch from 'share/httpFetch';
import config from 'config'
import menuRoute from 'share/menuRoute'
import "styles/budget/budget-journal/new-budget-journal.scss"

class NewBudgetJournalFrom extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isEnabled:false,
      showListSelector:false,
      organization:{},
      organizationId:{organizationId:''},
      listType:'',
      listExtraParams: {},
      budgetJournalDetailPage: menuRoute.getRouteItem('budget-journal-detail','key'),    //预算日记账详情
      structureGroup:[],
      fromData:{ periodYear:'',},
      idSelectJournal:false,
      isStructureIn:false,
      periodStrategy:[],
      periodPeriodQuarter:[],
      periodPeriod:[],
      structureFlag:true,
      periodFlag:true,
      periodYearFlag:true,
      periodQuarterFlag:true,
      periodStrategyFlag:true,
      fileList: [],
      file:{},
      uploading: false,
    };
  }



  //跳转到预算日记账详情
  handleLastStep=(value)=>{
    const data =value;
    console.log(value);
    const period =value.periodName?JSON.parse(value.periodName):'';
    const  periodName=period.periodName;
    const periodYear=period.periodYear;
    //处理期间
    let periodNameData;
    if(periodName!=''&& periodName!=null && periodName!=undefined) {
      const periodNameArray = periodName.split("-");
      for (let i = 0; i < periodNameArray.length; i++) {
        console.log(periodNameArray[i])
        if (periodNameArray[i] != periodYear) {
          periodNameData = periodYear + "" + periodNameArray[i]
        }
      }
    }else {
      periodNameData='';
    }


    console.log(this.props.user);
    let userData ={
      "dto" :
        {
          "companyId":this.props.company.id,
          "companyName":this.props.company.name,
          "organizationId":this.props.organization.id,
          "organizationName":this.props.organization.organizationName,
          "structureId":value.structureId,
          "structureName":"structureName",
          "periodYear":value.periodYear!=''?value.periodYear:period.periodYear,
          "periodQuarter":value.periodQuarter!=''?value.periodQuarter:period.quarterNum,
          "periodName":periodNameData,
          "description": "",
          "reversedFlag":"N",
          "sourceBudgetHeaderId":undefined,
          "sourceType":undefined,
          "employeeId":this.props.user.id,
          "employeeName":this.props.user.fullName,
          "periodNumber":period.quarterNum?period.quarterNum:'',
          "unitId": "1",
          "unitName":"periodNumber",
          'versionId':value.versionName[0].id,
          'versionName':value.versionName[0].versionName,
          'scenarioId':value.scenarioName[0].id,
          'scenarioName':value.scenarioName[0].scenarioName,
          "status":"NEW",
          "journalTypeId":value.journalTypeName[0].journalTypeId,
          "journalTypeName":value.journalTypeName[0].journalTypeName,
          "periodStrategy":value.periodStrategy,
          "versionNumber":"1",
          "attachmentOID":'',
        }
      ,
      "list":[]
    }

    console.log(userData);
    this.saveHeard(userData);


  }


  componentWillMount(){
    this.getPeriodStrategy();
    this.getPeriodQuarter();
    this.getPeriod();
  }


  //获取编制期段
  getPeriodStrategy=()=>{
    this.getSystemValueList(2002).then((response)=>{
      console.log(response.data);
      let periodStrategy = [];
      response.data.values.map((item)=>{
        let option = {
          key: item.code,
          label: item.messageKey
        };
        periodStrategy.push(option);
      });
      this.setState({
        periodStrategy: periodStrategy,
      })
    });
  }

//获取季度
  getPeriodQuarter=()=>{
    this.getSystemValueList(2021).then((response)=>{
      let  periodPeriodQuarter = [];
      response.data.values.map((item)=>{
        let option = {
          key: item.code,
          label: item.messageKey
        };
        periodPeriodQuarter.push(option);
      });
      this.setState({
        periodPeriodQuarter: periodPeriodQuarter
      })
    });
  }

  //获取期间
  getPeriod=()=>{
    httpFetch.get(`http://139.224.220.217:9084/api/company/group/assign/query/budget/periods?setOfBooksId=910833336382156802`).then(( response)=>{
     console.log(response.data);
      let periodPeriod = [];
      response.data.map((item)=>{
        let option = {
          value:item,
          key: item.periodName,
          label: item.periodName
        };
        periodPeriod.push(option);
      });
      this.setState({
        periodPeriod: periodPeriod
      })
    })

  }

  //保存日记账头
  saveHeard=(value)=>{
    httpFetch.post(`${config.budgetUrl}/api/budget/journals`,value).then(( response)=>{
      let path=this.state.budgetJournalDetailPage.url.replace(":journalCode",response.data.dto.journalCode);
      this.context.router.push(path);
    })
  }




  //处理表单数据
  handleFrom=(e)=>{
    e.preventDefault();
    let value =this.props.form.getFieldsValue();
    this.handleLastStep(value);
  }



  handleFocus = (Type) => {
    this.refs.blur.focus();
    this.showList(Type)

  };


  //list-selector取消
  handleListCancel=()=>{
    this.setState({
      showListSelector:false
    })
  }


  //选择预算日记账类型，设置对应的预算表选
  handleJournalTypeChange=(values)=>{
    let value = values[0];
    this.setState({
      idSelectJournal:true,
      structureFlag:false
    })
    this.props.form.setFieldsValue({
      structureId:''
    })
    this.props.form.setFieldsValue({
      periodYear:''
    })
    this.props.form.setFieldsValue({
      periodQuarter:''
    })
    this.props.form.setFieldsValue({
      periodName:''
    })
    this.getStructure(value.journalTypeId);

  }


  //根据账套类型，获得预算表
  getStructure(value){
    httpFetch.get(`${config.budgetUrl}/api/budget/journal/type/assign/structures/queryStructureId?journalTypeId=${value}`).then(response=>{
      console.log(response.data);
      this.setState(
        {
          structureGroup:response.data,
        }
      )
    })
  }


  //选择预算表时，获得期间段
  handleSelectChange=(values)=>{

    console.log(values);
    const data =new Date();
    const year = data.getFullYear();
    const month =data.getMonth()+1;
    const po=(month<2?2:month);
    const quarter =parseInt((po-1)/3+1);
    console.log(values);

    this.state.structureGroup.map((item)=>{
      if(item.id==values){
        const periodStrategy  =item.periodStrategy;
        if(periodStrategy=='MONTH'){
          this.props.form.setFieldsValue({
            periodYear:''
          })

          this.props.form.setFieldsValue({
            periodQuarter:''
          })
          this.props.form.setFieldsValue({
            periodName:''
          })
          this.setState({
            periodYearFlag:true,
            periodQuarterFlag:true,
            periodFlag:false
          })
        }else if(periodStrategy=='YEAR'){
          this.props.form.setFieldsValue({
            periodYear:year
          })
          this.props.form.setFieldsValue({
            periodQuarter:''
          })
          this.props.form.setFieldsValue({
            periodName:''
          })
          this.setState({
            periodFlag:true,
            periodQuarterFlag:true,
            periodYearFlag:false,
          })
        }else{
          this.props.form.setFieldsValue({
            periodYear:year
          })

          this.props.form.setFieldsValue({
            periodQuarter:quarter
          })
          this.props.form.setFieldsValue({
            periodName:''
          })
          this.setState({

            periodFlag:true,
            periodYearFlag:false,
            periodQuarterFlag:false,
          })
        }


        this.props.form.setFieldsValue({
          periodStrategy:periodStrategy,
        });
      }
    });

  }

//选择期间，获取年度和季度
  handleSelectPeriodName=(value)=>{
    console.log(value);

  }


  //选择期间编制期间段，的时候获取年度，季度，和期间
  handSelectPeriodStrategy=(values)=>{
    console.log(values);
    const data =new Date();
    const year = data.getFullYear();
    const month =data.getMonth()+1;
    const po=(month<2?2:month);
    const quarter =(po-1)/3+1;


    if(values=="YEAR"){
      this.props.form.setFieldsValue({
        periodYear:year
      })

    }else if(values=="QUARTER"){
      this.props.form.setFieldsValue({
        periodYear:year
      })

      this.props.form.setFieldsValue({
        periodQuarter:quarter
      })

    }else {
      this.props.form.setFieldsValue({
        periodYear:year
      })

      this.props.form.setFieldsValue({
        periodQuarter:quarter
      })

      this.props.form.setFieldsValue({
        periodName:month
      })

    }
  }


  scenarioChange=(value)=>{
    //console.log(value);

  }

  normFile = (e) => {
    console.log('Upload event:', e);
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  }


  //鼠标移动到预算表选择时，
  handleStructure=()=>{
    this.state.setState({
      isStructureIn:true
    })
  }


  handleUpload = () => {
    const { fileList } = this.state;
    const formData = new FormData();
    fileList.forEach((file) => {
      formData.append('files[]', file);
    });

    this.setState({
      uploading: true,
    });

    // You can use any AJAX library you like
    axios({
      headers:{
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.token
      },
      url: `${config.baseUrl}/api/upload/attachment`,
      method: 'post',
      mode: 'cors',
      headers:{
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.token
      },
      data:{
        attachmentType:"PDF",
        file:fileList[0]
      },

    }).then();
  }




  render(){
    const { getFieldDecorator } = this.props.form;
    const organization =this.props.organization;
    const { structureGroup,periodStrategy,periodPeriodQuarter,periodPeriod,structureFlag,periodFlag,periodYearFlag,periodQuarterFlag,periodStrategyFlag,uploading} = this.state;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14, offset: 1 },
    };


    const strategyOptions = structureGroup.map((item)=> <Option key={item.id} value={item.id}>{item.structureName}</Option>);
    const periodStrategyOptions = periodStrategy.map((item)=><Option key={item.key} value={item.key}>{item.label}</Option>);
    const periodPeriodQuarterOptions = periodPeriodQuarter.map((item)=><Option key={item.key} value={item.key}>{item.label}</Option>);
    const periodPeriodOptions =periodPeriod.map((item)=><Option key={item.key} value={JSON.stringify(item.value)}>{item.label}</Option>);
    let nowYear = new Date().getFullYear();
    let yearOptions = [];
    for(let i = nowYear - 20; i <= nowYear + 20; i++)
      yearOptions.push({label: i, key: i})
    const yearOptionsData = yearOptions.map((item)=><Option key={item.key} value={item.key}>{item.label}</Option>);


    const props = {
      action:`${config.baseUrl}/api/upload/attachment`,
      onRemove: (file) => {
        this.setState(({ fileList }) => {
          const index = fileList.indexOf(file);
          const newFileList = fileList.slice();
          newFileList.splice(index, 1);
          return {
            fileList: newFileList,
          };
        });
      },
      beforeUpload: (file) => {
        this.setState(({ fileList }) => ({
          fileList: [...fileList, file],
        }));
        return false;
      },
      fileList: this.state.fileList,
    };



   /* const props = {
        name: 'file',
        multiple: true,
        showUploadList: true,
        action:`${config.baseUrl}/api/upload/attachment`,
        headers:{
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.token
        },
        data:{
          attachmentType:"PDF",
          file:this.state.file
        },
        onChange(info) {
          const status = info.file.status;
          if (status !== 'uploading') {
            console.log(info.file, info.fileList);
          }
          if (status === 'done') {
            message.success(`${info.file.name} file uploaded successfully.`);
          } else if (status === 'error') {
            message.error(`${info.file.name} file upload failed.`);
          }
        },

      beforeUpload: (file) => {
        this.setState(({ fileList }) => ({
          fileList: [...fileList, file],
        }));
        return false;
      },
      fileList: this.state.fileList,




      };
*/

    return (
      <div className="new-budget-journal">
        <Form onSubmit={this.handleFrom} style={{width:'55%',margin:'0 auto'}}>
          <FormItem {...formItemLayout} label={this.props.intl.formatMessage({id:"budget.journalCode"})} >
            {getFieldDecorator('journalCode', {
              rules: [{
              }],
              initialValue: '-'
            })(
              <Input  disabled={true} />
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={this.props.intl.formatMessage({id:"budget.employeeId"})} >
            {getFieldDecorator('employeeId', {
              rules: [{
                required: true,
                message: '',
              }],
              initialValue:this.props.user.fullName
            })(
              <Input  disabled={true} />
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={this.props.intl.formatMessage({id:"budget.organization"})} >
            {getFieldDecorator('organizationName', {
              rules: [{
                required: true,
                message: '',
              }],
              initialValue:organization.organizationName
            })(
              <Input  disabled={true} />
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={this.props.intl.formatMessage({id:"budget.companyId"})} >
            {getFieldDecorator('companyId', {
              rules: [{
                required: true,
                message: 'this.props.intl.formatMessage({id: "common.can.not.be.empty"}, {name:"journalTypeName"}',
              }],
              initialValue: this.props.company.name
            })(
              <Input  disabled={true} />
            )}
          </FormItem>

         <FormItem {...formItemLayout} label={this.props.intl.formatMessage({id:"budget.journalTypeId"})} >
            {getFieldDecorator('journalTypeName', {
              rules: [{
                required: true,
                message: this.props.intl.formatMessage({id: "common.can.not.be.empty"}, {name:"journalTypeName"})
              }],

            })(
              <Chooser
              type='budget_journal_type'
              labelKey='journalTypeName'
              valueKey='journalTypeId'
              single={true}
              listExtraParams={{"organizationId":1}}
              onChange={this.handleJournalTypeChange}
              />

            )}
          </FormItem>

          <FormItem {...formItemLayout} label={this.props.intl.formatMessage({id:"budget.structureId"})}
          >
            {getFieldDecorator('structureId', {
              rules: [{
                required: true,
                message: this.props.intl.formatMessage({id: "common.can.not.be.empty"}, {name:"预算表"})
              }],

            })(

              <Select onSelect={this.handleSelectChange}  disabled={structureFlag}>
                {strategyOptions}
              </Select>
            )}
          </FormItem>



          <FormItem {...formItemLayout} label={this.props.intl.formatMessage({id:"budget.periodStrategy"})} >
            {getFieldDecorator('periodStrategy', {
              rules: [{
                required: true,
                message: this.props.intl.formatMessage({id: "common.can.not.be.empty"}, {name:"编制期段"})
              }],

            })(

              <Select onSelect={this.handSelectPeriodStrategy}  disabled={periodStrategyFlag}>
                {periodStrategyOptions}
              </Select>
            )}
          </FormItem>

          <FormItem {...formItemLayout} label={this.props.intl.formatMessage({id:"budget.periodYear"})} >
            {getFieldDecorator('periodYear', {
              rules: [{
                required: true,
                message: this.props.intl.formatMessage({id: "common.can.not.be.empty"}, {name:"年度"})
              }],

            })(

              <Select  disabled={periodYearFlag}>
                {yearOptionsData}
              </Select>
            )}
          </FormItem>


          <FormItem {...formItemLayout} label={this.props.intl.formatMessage({id:"budget.periodQuarter"})} >
            {getFieldDecorator('periodQuarter', {
              rules: [{
                required: true,
                message: this.props.intl.formatMessage({id: "common.can.not.be.empty"}, {name:"季度"})
              }],

            })(

              <Select  disabled={periodQuarterFlag}>
                {periodPeriodQuarterOptions}
              </Select>
            )}
          </FormItem>


          {/*periodName*/}

          <FormItem {...formItemLayout} label={this.props.intl.formatMessage({id:"budget.periodName"})} >
            {getFieldDecorator('periodName', {
              rules: [{
                required: true,
                message: this.props.intl.formatMessage({id: "common.can.not.be.empty"}, {name:"期间"})
              }],

            })(

              <Select disabled={periodFlag} onSelect={this.handleSelectPeriodName()}>
                {periodPeriodOptions}
              </Select>
            )}
          </FormItem>




          <FormItem {...formItemLayout} label={this.props.intl.formatMessage({id:"budget.version"})} >
            {getFieldDecorator('versionName', {
              rules: [{
                required: true,
                message: this.props.intl.formatMessage({id: "common.can.not.be.empty"}, {name:"versionId"})
              }],

            })(
              <Chooser
                type='budget_versions'
                labelKey='versionName'
                valueKey='id'
                single={true}
                listExtraParams={{"organizationId":1}}
              />
            )}
          </FormItem>

          <FormItem {...formItemLayout} label={this.props.intl.formatMessage({id:"budget.scenarios"})} >
            {getFieldDecorator('scenarioName', {
              rules: [{
                required: true,
                message: this.props.intl.formatMessage({id: "common.can.not.be.empty"}, {name:"scenarioId"})
              }],

            })(

              <Chooser
              type='budget_scenarios'
              labelKey='scenarioName'
              valueKey='id'
              single={true}
              listExtraParams={{"organizationId":1}}
             />

            )}
          </FormItem>


          <FormItem
            {...formItemLayout}
            label="附件"
          >
            <div className="dropbox">
              {getFieldDecorator('file', {
                valuePropName: 'fileList',
                getValueFromEvent: this.normFile,
              })(


                <Upload.Dragger  {...props}

                >
                  <p className="ant-upload-drag-icon">
                    <Icon type="cloud-upload-o" />
                  </p>
                  <p className="ant-upload-text">点击或将文件拖拽到这里上传</p>
                  <p className="ant-upload-hint">支持扩展名：.rar .zip .doc .docx .pdf .jpg...</p>
                </Upload.Dragger>
              )}
            </div>
          </FormItem>

          <FormItem wrapperCol={{ offset: 7 }}>
            <Button type="primary" htmlType="submit" loading={this.state.loading} style={{marginRight:'10px'}}>下一步</Button>
            <Button>取消</Button>
            <Button
              className="upload-demo-start"
              type="primary"
              onClick={this.handleUpload}
              disabled={this.state.fileList.length === 0}
              loading={uploading}
            >
              {uploading ? 'Uploading' : 'Start Upload' }
            </Button>
          </FormItem>
        </Form>

        <div>

        </div>
      </div>
    )
  }

}


NewBudgetJournalFrom.contextTypes ={
  router: React.PropTypes.object
}


const NewBudgetJournal = Form.create()(NewBudgetJournalFrom);

function mapStateToProps(state) {
  return {
    user: state.login.user,
    company: state.login.company,
    organization: state.login.organization

  }

}

export default connect(mapStateToProps)(injectIntl(NewBudgetJournal));
