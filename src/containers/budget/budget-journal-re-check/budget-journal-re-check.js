/**
 * Created by 13576 on 2017/10/20.
 */
import React from 'react'
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl';
import { Button, Table, Select } from 'antd';

import httpFetch from 'share/httpFetch';
import config from 'config'
import menuRoute from 'share/menuRoute'
import SearchArea from 'components/search-area.js';

import "styles/budget/budget-journal-re-check/budget-journal-re-check.scss"


const journalTypeCode = [];

class BudgetJournalReCheck extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      data: [],
      params:{},
      organization:{},
      pagination: {
        current:0,
        page:0,
        total:0,
        pageSize:10,

      },

      searchForm: [

        {type: 'input', id: 'journalCode',
          label: this.props.intl.formatMessage({id: 'budget.journalCode'}), /*预算日记账编号*/
        },

        {type: 'list', id: 'journalTypeName',
          listType: 'budget_journal_type',
          labelKey: 'journalTypeName',
          valueKey: 'id',
          label:this.props.intl.formatMessage({id: 'budget.journalTypeId'}),  /*预算日记账类型*/
          listExtraParams:{organizationId:1}
        },

        {type: 'select', id: 'periodStrategy',
          label:  this.props.intl.formatMessage({id: 'budget.journal'})+this.props.intl.formatMessage({id: 'budget.periodStrategy'}),
          options:
            [
              {value:'Y',label:this.props.intl.formatMessage({id:"budget.year"})},
              {value:'Q',label:this.props.intl.formatMessage({id:"budget.quarter"})},
              {value:'M',label:this.props.intl.formatMessage({id:"budget.month"})}

            ]
        },

        {type: 'select', id:'versionId', label: '预算版本', options: [], method: 'get',
          getUrl: `${config.budgetUrl}/api/budget/versions/queryAll`, getParams: {organizationId:1},
          labelKey: 'versionName', valueKey: 'id'},
        {type: 'select', id:'structureId', label: '预算表',  options: [], method: 'get',
          getUrl: `${config.budgetUrl}/api/budget/structures/queryAll`, getParams: {organizationId:1},
          labelKey: 'structureName', valueKey: 'id'},
        {type: 'select', id:'scenarioId', label: '预算场景', options: [], method: 'get',
          getUrl: `${config.budgetUrl}/api/budget/scenarios/queryAll`, getParams: {organizationId:1},
          labelKey: 'scenarioName', valueKey: 'id'},
        {type: 'select', id:'employeeId', label: '申请人', options: [], method: 'get',
          getUrl: ``, getParams: {},
          labelKey: 'name', valueKey: 'id'},
        {type:'date',id:'createData', label: '创建时间' }

      ],

      columns: [
        {          /*预算日记账编号*/
          title: this.props.intl.formatMessage({id:"budget.journalCode"}), key: "journalCode", dataIndex: 'journalCode'
        },
        {          /*预算日记账类型*/
          title: this.props.intl.formatMessage({id:"budget.journalTypeId"}), key: "journalTypeName", dataIndex: 'journalTypeId'
        },
        {          /*编制期段*/
          title: this.props.intl.formatMessage({id:"budget.periodStrategy"}), key: "periodStrategy", dataIndex: 'periodStrategy'
        },
        {          /*预算表*/
          title: this.props.intl.formatMessage({id:"budget.structureName"}), key: "structureName", dataIndex: 'structureId'
        },
        {          /*预算期间*/
          title: this.props.intl.formatMessage({id:"budget.periodName"}), key: "periodName", dataIndex: 'periodName'
        },
        {          /*状态*/
          title: this.props.intl.formatMessage({id:"budget.status"}), key: "status", dataIndex: 'status'
        },
      ],

      budgetJournalDetailReCheckDetailPage: menuRoute.getRouteItem('budget-journal-re-check-detail','key'),    //预算日记账复核详情
      selectedEntityOIDs: []    //已选择的列表项的OIDs
    };
  }

  componentWillMount(){
    this.getList();
    this.getOrganization();
  }

  //获取预算组织
  getOrganization(){
    httpFetch.get(`${config.budgetUrl}/api/budget/organizations/default/organization/by/login`).then((request)=>{
      console.log(request.data)
      this.setState({
        organization:request.data
      })
    })
  }

  //获取预算日记账数据
  getList(){
    httpFetch.get(`${config.budgetUrl}/api/budget/journals/query/headers?page=${this.state.pagination.page}&size=${this.state.pagination.pageSize}&journalTypeId=${this.state.params.journalTypeId||''}&journalCode=${this.state.params.journalCode||''}&periodStrategy=${this.state.params.periodStrategy||''}&structureId=${this.state.params.structureId||''}&versionId=${this.state.params.versionId||''}&scenarioId=${this.state.params.scenarioId||''}&createDate=${this.state.params.createData||''}&empId=${this.state.params.employeeId||''}`).then((response)=>{
      this.setState({
        loading: false,
        data: response.data,
        pagination: {
          page: this.state.pagination.page,
          current: this.state.pagination.current,
          pageSize:this.state.pagination.pageSize,
          showSizeChanger:true,
          showQuickJumper:true,
          total: Number(response.headers['x-total-count']),
        }
      },()=>{

      })
    })
  }

  //分页点击
  onChangePager = (pagination,filters, sorter) =>{
    this.setState({
      pagination:{
        page: pagination.current-1,
        current: pagination.current,
        pageSize: pagination.pageSize
      }
    }, ()=>{
      this.getList();
    })
  };

  //点击搜搜索
  handleSearch = (values) =>{
    console.log(values);
    this.setState({
      params:values,
    },()=>{
      this.getList()
    })
  };

  //新建
  handleCreate = () =>{
    let path=this.state.newBudgetJournalDetailPage.url;
    this.context.router.push(path)
  };

  //跳转到详情
  HandleRowClick=(value)=>{
    console.log(value);
    const journalCode =value.journalCode;

    let path=this.state.budgetJournalDetailReCheckDetailPage.url.replace(":journalCode",journalCode);
    this.context.router.push(path);
    //budgetJournalDetailSubmit

  }

  render(){
    const { loading, searchForm ,data, selectedRowKeys, pagination, columns, batchCompany,organization} = this.state;
    return (
      <div className="budget-journal">
        <SearchArea searchForm={searchForm} submitHandle={this.handleSearch}/>
        <div className="table-header">
          <div className="table-header-title">{this.props.intl.formatMessage({id:'common.total'},{total:`${pagination.total}`})}</div>  {/*共搜索到*条数据*/}
        </div>
        <Table
          loading={loading}
          dataSource={data}
          columns={columns}
          pagination={pagination}
          size="middle"
          bordered
          onRowClick={this.HandleRowClick}
        />
      </div>
    )
  }

}

BudgetJournalReCheck.contextTypes ={
  router: React.PropTypes.object
}

function mapStateToProps() {
  return {}
}

export default connect(mapStateToProps)(injectIntl(BudgetJournalReCheck));