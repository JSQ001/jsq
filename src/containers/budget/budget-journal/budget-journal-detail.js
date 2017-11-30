/**
 * Created by 13576 on 2017/10/6.
 */
import React from 'react'
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl';
import { Popover,Button, Table, Select,Modal,message,Popconfirm,notification,Icon} from 'antd';
import "styles/budget/budget-journal/budget-journal-detail.scss";

import httpFetch from 'share/httpFetch';
import config from 'config';
import menuRoute from 'share/menuRoute';

import BasicInfo from 'components/basic-info';
import SlideFrame from 'components/slide-frame.js';
import BudgetJournalDetailLead from 'containers/budget/budget-journal/budget-journal-detail-lead.js';
import WrappedNewBudgetJournalDetail from 'containers/budget/budget-journal/new-budget-journal-detail.js';

class BudgetJournalDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isNew:true,
      params:{},
      loading: true,
      columnsSetFlag:true,
      data: [],
      listData:[],
      headerAndListData:{},
      showSlideFrameNew:false,
      showModal:false,
      updateState:false,
      pageSize:10,
      page:0,
      total:0,
      fileList:[],
      selectorItem:{},
      selectedRowKeys:[],
      rowSelection: {
        type:'checkbox',
        selectedRowKeys: [],
        onChange: this.onSelectChange,
      },
      commitFlag:false,
      infoDate:{},
      handleData:[
        {type: 'list', id: 'company',options: [], labelKey: 'name', valueKey: 'id', columnLabel: 'companyName', columnValue: 'companyId'},//公司
        {type: 'list', id: 'unit',options: [], labelKey: 'name',valueKey: 'id',columnLabel: 'unitId',columnValue: 'departmentName'},//部门
        {type: 'select', id:'item',options: [],labelKey:'itemName',valueKey:'id',columnLabel: 'itemName',columnValue: 'itemId'},     //预算项目
        {type: 'select', id:'periodName',options: [], labelKey:'periodName',valueKey:'periodName',columnLabel:'periodName',columnValue:'periodName'}, //期间
        {type: 'value_list', id: 'periodQuarter', options: [],labelKey:'periodQuarter',columnLabel:'periodQuarter',columnValue:'periodQuarterName',value:'periodQuarter'}, //季度
        {type: 'select', id:'periodYear', options:[],labelKey:'periodYear',valueKey:'periodYear',columnLabel:'periodYear',columnValue:'periodYear'}, //年度
        {type: 'select', id:'currency',method:'get', options: [],labelKey:'attribute5',columnLabel:'attribute4',columnLabel: 'currency', columnValue: 'currency'}, //币种
        {type: 'input', id:'rate',valueKey:'rate'},  //汇率
        {type: 'inputNumber', id:'amount',valueKey:'amount'},  //金额
        {type: 'inputNumber', id:'functionalAmount',valueKey:'functionalAmount'}, //本位金额
        {type: 'inputNumber', id:'quantity',valueKey:'quantity'}, //数量
        {type: 'input', id:'remark',valueKey:'remark'}  //备注
      ],
      infoList:[
        /*状态*/
        {type:'badge',label: this.props.intl.formatMessage({id:"budget.status"}),id:'status'},
        /*预算日记账编号*/
        {type: 'input', label: this.props.intl.formatMessage({id:"budget.journalCode"}), id: 'journalCode', disabled: true},
        /*总金额*/
        {type: 'input', label: this.props.intl.formatMessage({id:"budget.total.amount"}), id: 'totalAmount', disabled: true},
        /*申请人*/
        {type: 'input', label: this.props.intl.formatMessage({id:"budget.employeeId"}), id: 'employeeName', disabled: true},
        /*公司*/
        {type: 'input', label: this.props.intl.formatMessage({id:"budget.companyId"}), id: 'companyName', disabled: true},
        /*部门*/
        {type: 'input', label: this.props.intl.formatMessage({id:"budget.unitId"}), id: 'unitName', disabled: true},
        /*创建时间*/
        {type: 'date', label: this.props.intl.formatMessage({id:"budget.createdDate"}), id: 'createdDate', disabled: true},
        /*预算日记账类型*/
        {type: 'list', id: 'journalType',
          listType: 'budget_journal_type',
          labelKey: 'journalTypeName',
          valueKey: 'journalTypeId',
          label:this.props.intl.formatMessage({id: 'budget.journalTypeId'}),
          listExtraParams:{organizationId:this.props.organization.id},
          disabled: true
        },
        {type: 'select', id:'budgetStructure', label: '预算表', options: [], method: 'get',disabled: true,
          getUrl: `${config.budgetUrl}/api/budget/structures/queryAll`, getParams:{organizationId :this.props.organization.id},
          labelKey: 'structureName', valueKey: 'id'},
        /*预算版本*/
        {type: 'list', id: 'versionName',
          listType: 'budget_versions',
          labelKey: 'versionName',
          valueKey: 'id',
          label:this.props.intl.formatMessage({id: 'budget.version'}),  /*预算版本*/
          listExtraParams:{organizationId:this.props.organization.id}
        },
        /*预算场景*/
        {type: 'list', id: 'scenarioName',
          listType: 'budget_scenarios',
          labelKey: 'scenarioName',
          valueKey: 'id',
          label:this.props.intl.formatMessage({id: 'budget.scenarios'}),  /*预算场景*/
          listExtraParams:{organizationId:this.props.organization.id}
        },
        /*编辑期段*/
        {type: 'value_list', id: 'periodStrategy', label: '编制期段', options: [], valueListCode: 2002,disabled: true},
        /*附件*/
        {type:'file',label:'附件',id:'file',disabled: true},

      ],
      dimensionList:[],

      columns: [
        {          /*公司*/
          title: this.props.intl.formatMessage({id:"budget.companyId"}), key: "companyName", dataIndex: 'companyName',width:'10%',
          render: companyName => (
            <Popover content={companyName}>
              {companyName}
            </Popover>)
        },
        {          /*部门*/
          title: this.props.intl.formatMessage({id:"budget.unitId"}), key: "departmentName", dataIndex: 'departmentName',width:'10%',
          render: departmentName => (
            <Popover content={departmentName}>
              {departmentName}
            </Popover>)
        },
        {          /*预算项目*/
          title: this.props.intl.formatMessage({id:"budget.item"}), key: "itemName", dataIndex: 'itemName',width:'10%',
          render: itemName => (
            <Popover content={itemName}>
              {itemName}
            </Popover>)
        },
        {          /*期间*/
          title: this.props.intl.formatMessage({id:"budget.periodName"}), key: "periodName", dataIndex: 'periodName',
        },
        {          /*季度*/
          title: this.props.intl.formatMessage({id:"budget.periodQuarter"}), key: "periodQuarterName", dataIndex: 'periodQuarterName',
        },
        {          /*年度*/
          title: this.props.intl.formatMessage({id:"budget.periodYear"}), key: "periodYear", dataIndex: 'periodYear',
        },
        {          /*币种*/
          title: this.props.intl.formatMessage({id:"budget.currency"}), key: "currency", dataIndex: 'currency',
        },
        {          /*汇率*/
          title: this.props.intl.formatMessage({id:"budget.rate"}), key: "rate", dataIndex: 'rate',
          render: rate => (
            <Popover content={rate}>
              {rate}
            </Popover>)
        },
        {          /*金额*/
          title: this.props.intl.formatMessage({id:"budget.amount"}), key: "amount", dataIndex: 'amount',render: this.filterMoney
        },
        {          /*本币今额*/
          title: this.props.intl.formatMessage({id:"budget.functionalAmount"}), key: "functionalAmount", dataIndex: 'functionalAmount',render: this.filterMoney
        },
        {          /*数字*/
          title: this.props.intl.formatMessage({id:"budget.quantity"}), key: "quantity", dataIndex: 'quantity',
        },
        {          /*备注*/
          title: this.props.intl.formatMessage({id:"budget.remark"}), key: "remark", dataIndex: 'remark',
          render: remark => (
            <Popover content={remark}>
              {remark}
            </Popover>)
        },
      ],

      budgetJournalPage: menuRoute.getRouteItem('budget-journal','key'),    //预算日记账

    };
  }

  componentWillMount(){
    //根据编制期代码拿数据
    this.getDataByBudgetJournalCode();
  }




  //选项改变时的回调，重置selection
  onSelectChange = (selectedRowKeys,selectedRows) =>{
    console.log(selectedRowKeys);
    let { rowSelection } = this.state;
    rowSelection.selectedRowKeys = selectedRowKeys;
    this.setState({
      rowSelection,
      selectedRowKeys,
      selectedData:selectedRowKeys
    });
  };


  //删除预算日记账行
  handleDeleteLine=()=>{
    let data = this.state.selectedRowKeys;
    console.log(data);
    let  selectedRowKeys=[];
    data.map((item)=>{
      if(item){
        let id ={"id":item}
        selectedRowKeys.addIfNotExist(id)
      }
    })
    httpFetch.delete(`${config.budgetUrl}/api/budget/journals/batch/lines`,selectedRowKeys).then((req)=>{
      this.getDataByBudgetJournalCode();
      message.success("删除成功");
      this.setState({
        selectedRowKeys:[]
      })
    }).catch(e=>{
      message.error(`删除失败,${e.response.data.message}`);
    })
  }



//根据attachmentOID，查询附件
  getFile=(value)=>{
    httpFetch.get(`${config.budgetUrl}/api/budget/journals/getAttachmentDTOByOid?oid=${value}`,).then((resp)=>{
      let fileList = this.state.fileList;
      fileList.addIfNotExist(resp.data)
      this.setState({
        fileList:fileList
      })
    }).catch(e=>{
      message.error(`查询附件失败,${e.response.data.message}`);
    })
  }

  //根据预算表id，获得维度
  getDimensionByStructureId = (value) =>{
    httpFetch.get(`${config.budgetUrl}/api/budget/journals/getLayoutsByStructureId?structureId=${value}`).then((resp)=>{
      console.log(resp.data);
      this.setState({
        dimensionList:resp.data
      },()=>{
        //根据预算表，的维度.获取获取Columuns和获取维度的handleData数据
        this.getColumnsAndDimensionhandleData();
      })
    }).catch(e=>{
      message.error(`获得维度失败,${e.response.data.message}`);
    })
  }

  //根据预算表的维度.获取维度Columuns和获取维度的handleData数据
  getColumnsAndDimensionhandleData(){
    console.log("getColumns")
    let columns=this.state.columns;
    let handleData=this.state.handleData;
    const dimensionList = this.state.dimensionList;
    for(let i=0;i<dimensionList.length;i++){
     const item =dimensionList[i];
  //   let priority =item.priority;
      let priority =i+1;
     columns.push(
       {title:`${item.dimensionName}`, key:`dimension${priority}ValueName`, dataIndex: `dimension${priority}ValueName`,
         render: recode => (
           <Popover content={recode}>
             {recode}
           </Popover>)
       }
     )
     handleData.push(
      {type: 'select', id:`dimension${priority}`,options: [],labelKey:'id',valueKey:'name',columnLabel: `dimension${priority}ValueName`,columnValue: `dimension${priority}ValueId`},
     )
   }
    this.setState({
      columns,
      columnsSetFlag:false
    })
  }


  //根据预算日记账编码查询预算日记账头行
  getDataByBudgetJournalCode=()=>{
    this.setState({
      loading:true,
      fileList:[]
    })
    const journalCode =this.props.params.journalCode;
    httpFetch.get(`${config.budgetUrl}/api/budget/journals/query/${journalCode}`).then((response)=>{
      console.log(response.data);
      let listData = response.data.list;
      let headerData =response.data.dto;
      if(this.state.columnsSetFlag){
        this.getDimensionByStructureId(headerData.structureId);
      }
      headerData.attachmentOID.map((item)=>{
        this.getFile(item);
      })
      const journalType=[];
      const journalType1={
        "journalTypeName":headerData.journalTypeName,
        "journalTypeId":headerData.journalTypeId,
      }
      journalType.push(journalType1);

      //预算版本
      const versionName=[];
      const versionName1={
        "versionName":headerData.versionName,
        "id":headerData.versionId
      }
      versionName.push(versionName1);

      //预算场景
      const scenarioName=[]
      const scenarioName1={
        "scenarioName":headerData.scenario,
        "id":headerData.scenarioId
      }
      scenarioName.push(scenarioName1);

      //预算表
      const budgetStructure={
        "label":headerData.structureName,
        "value":headerData.structureId
      }

      //编制期段
      const period = headerData.periodStrategy;
      const periodStrategy={
        "label":period=="YEAR"?"年":(period=="QUARTER"?"季度":"月"),
        "value":period
      }

      //状态
      let statusData={};
      if(headerData.status=="NEW"){
        statusData={'status':'processing', 'value':'新建'};
      }else if(headerData.status=="REJECT"){
        statusData={'status':'error', 'label':'拒绝'};
      }

      //获取总金额
      let sum =0;
      listData.map((item)=>{
        sum+= item.functionalAmount;
      })
      const amountData = "CNY"+" "+sum.toFixed(2);
      const infoData={
        ...headerData,
        "status":statusData,
        "journalType":journalType,
        "versionName":versionName,
        "scenarioName":scenarioName,
        "budgetStructure":budgetStructure,
        "file":this.state.fileList,
        "periodStrategy":periodStrategy,
        "totalAmount":amountData
      }

      this.setState({
        loading:false,
        headerAndListData:response.data,
        infoDate:infoData,
        data:listData,
        commitFlag:listData.length>0
      })
    })
  }

  //保存编辑
  updateHandleInfo=(value)=>{
    const headerAndListData =this.state.headerAndListData;
    headerAndListData.dto.versionId=value.versionName[0];
    headerAndListData.dto.scenarioId=value.scenarioName[0];
    this.handleSaveJournal();
    this.setState({
      headerAndListData:headerAndListData,
      updateState:true
    })

  }

  //处理导入
  handleModal=(value)=>{
    this.setState({
      showModal: value,
    });
  }

  handleModalOk=()=>{
    this.handleModal(false)
  }

  showSlideFrameNew=(value)=>{
    this.setState({
      showSlideFrameNew:value,
    })
  }

  showSlideFrameNewData=()=> {
    let params = {
      "isNew": true,
      "periodStrategy": this.state.headerAndListData.dto.periodStrategy,
      "structureId":this.state.headerAndListData.dto.structureId,
      "journalTypeId":this.state.headerAndListData.dto.journalTypeId,
    }
    this.setState({
      params: params,
    },()=>{
      this.showSlide(true);
    });

  }

  showSlide = (value) =>{
    this.setState({
      showSlideFrameNew: value,
    })
  }

  //获得表单数据
  handleAfterCloseNewSlide=(value)=>{
    console.log(value);
    this.setState({
      showSlideFrameNew:false,
    });
    let data = this.state.data;
    let listData=this.state.listData;
    let headerAndListData = this.state.headerAndListData;
    if(value && value.isNew){
      headerAndListData.list.addIfNotExist(value);
      data.addIfNotExist(value);
      listData.addIfNotExist(value);
    } else{
      let list = headerAndListData.list;
      for(let a=0;a<list.length;a++){
        if(value && list[a].id === value.id){
          list[a]=value;
        }
      }
      headerAndListData.list=list;
    }
    let sum =0;
    data.map((item)=>{
      sum+= item.functionalAmount;
      console.log(sum)
    })
    let newData ="CNY"+" "+sum.toFixed(2);
    const infoDateNew =this.state.infoDate;
    let infoDate={
      ...infoDateNew,
      "totalAmount":newData
    }
    console.log(headerAndListData);
    this.setState({
      data:data,
      headerAndListData: headerAndListData,
      listData:listData,
      infoDate
    },()=>{});
  }

//删除该预算日记账
  handleDeleteJournal=()=> {
    const id = this.state.headerAndListData.dto.id;
    httpFetch.delete(`${config.budgetUrl}/api/budget/journals/${id}`).then((req) => {
      message.success("成功删除该预算日记账");
      //删除完该预算日记账，跳转
      let path=this.state.budgetJournalPage.url;
      this.context.router.push(path);
    }).catch((e) => {
      message.error("失败")
    })
  }

//保存新增，或修改
  handleSaveJournal=()=>{
    let headerAndListData = this.state.headerAndListData;
    console.log(headerAndListData);
    httpFetch.post(`${config.budgetUrl}/api/budget/journals`,headerAndListData).then((req) => {
      message.success("预算日记账行保存成功");
      this.getDataByBudgetJournalCode();
    }).catch((e)=>{
      console.log(e.response.data.message)
    })
  }

  //提交单据
  handlePut=()=>{
    if(this.state.commitFlag) {
      let header =this.state. headerAndListData.dto;
      console.log(header);
      httpFetch.post(`${config.baseUrl}/api/budget/journa/reports/submit`,header).then((req) => {
        message.success("提交成功");
        this.setState({
          listData:[],
        })
        let path=this.state.budgetJournalPage.url;
        this.context.router.push(path);
      }).catch(e => {
        message.error(e.response.data.message)
      })
    }else {
      notification.open({
        message: '行信息不能为空！',
        description: '请添加或导入预算日记账行信息',
        icon: <Icon type="frown-circle" style={{ color: '#e93652' }} />,
      });
    }
  }

  //编辑行前,数据处理，传入数据
  headleUpData(values) {
    let valuesData = {};
    const handData = this.state.handleData;
    handData.map((item)=>{
        if ( item.type === 'select' || item.type === 'value_list') {
          valuesData[item.id]=values[item.columnLabel];
      } else if (item.type === 'list' ){
          let result = [];
          let itemData ={
            "name":values[item.columnLabel],
            "id":values[item.columnValue],
            "key":values[item.columnValue]
          }
          result.push(itemData);
          valuesData[item.id] = result;
          console.log(result);
        } else if (item.type === 'input' || item.type === 'inputNumber'){
          valuesData[item.id] = values[item.valueKey];
      }
    })
    return valuesData;
  }

  //编辑行
  handlePutData=(value)=>{
    console.log(value);
    let valuePutData =this.headleUpData(value);
    this.setState({
     params:{...valuePutData,
              "id":value.id,
               "structureId":this.state.headerAndListData.dto.structureId,
              "journalTypeId":this.state.headerAndListData.dto.journalTypeId,
              "versionNumber":value.id,
              "isNew":false,
              "oldData":value,
            }
     },()=>{
     this.setState({
       isNew:false,
       showSlideFrameNew:true,
     })
     })

  }

  //返回预算日记账查询
  handleReturn = () =>{
    let path=this.state.budgetJournalPage.url;
    this.context.router.push(path);
  }

  render(){

    const {loading, data, columns, pagination,formData,infoDate,infoList,updateState,showModal,showSlideFrameNew,rowSelection} = this.state;
    const { formatMessage } = this.props.intl;
    return (
      <div className="budget-journal-detail">
        <div className="budget-journal-cent">
          <BasicInfo infoList={infoList}
                     infoData={infoDate}
                     updateHandle={this.updateHandleInfo}
                     updateState={updateState}/>

          <div className="table-header">
            <div className="table-header-title">{this.props.intl.formatMessage({id:'common.total'},{total:`${this.state.data.length}`})}/已经选择了{this.state.selectedRowKeys.length}条数据</div>
            <div className="table-header-buttons">
              <Button type="primary" onClick={this.showSlideFrameNewData}>{this.props.intl.formatMessage({id:"common.add"})}</Button>
              <Button type="primary" onClick={() => this.handleModal(true)}>{this.props.intl.formatMessage({id:"budget.leading"})}</Button>
              <Popconfirm placement="topLeft" title={"确认删除"} onConfirm={this.handleDeleteLine} okText="确定" cancelText="取消">
                <Button className="delete"    disabled={this.state.selectedRowKeys.length === 0} >{this.props.intl.formatMessage({id:"common.delete"}) }</Button>
              </Popconfirm>
            </div>
          </div>
          <Table columns={columns}
                 dataSource={data}
                 rowKey={record=>record.id}
                 bordered
                 size="middle"
                 scroll={{ x: '200%' }}
                 onRowClick={this.handlePutData}
                 rowSelection={rowSelection}
                 loading={loading}
          />

        </div>

        <BudgetJournalDetailLead
          visible={showModal}
          onOk={this.handleModalOk}
          onCancel={() => this.handleModal(false)}
        >
        </BudgetJournalDetailLead>

        <SlideFrame title={"预算日记账"}
                    show={showSlideFrameNew}
                    content={WrappedNewBudgetJournalDetail}
                    afterClose={this.handleAfterCloseNewSlide}
                    onClose={()=>this.showSlideFrameNew(false)}
                    params={this.state.params}/>
        <div className="divider"> </div>
        <div className="footer-operate">
          <Popconfirm style={{width:200}} placement="topLeft" title={"确认提交"} onConfirm={this.handlePut} okText="确定" cancelText="取消">
          <Button type="primary">提交</Button>
          </Popconfirm>
          <Button  type="primary"  onClick={this.handleSaveJournal}>{this.props.intl.formatMessage({id:"common.save"})}</Button>
          <Popconfirm placement="topLeft" title={"确认删除"} onConfirm={this.handleDeleteJournal} okText="确定" cancelText="取消">
            <Button className="delete">{this.props.intl.formatMessage({id:"budget.delete.journal"})}</Button>
          </Popconfirm>
          <Button onClick={this.handleReturn}>返回</Button>
        </div>
      </div>
    )
  }
}

BudgetJournalDetail.contextTypes ={
  router: React.PropTypes.object
}

function mapStateToProps(state) {
  return {
    organization: state.login.organization
  }
}

export default connect(mapStateToProps)(injectIntl(BudgetJournalDetail));
