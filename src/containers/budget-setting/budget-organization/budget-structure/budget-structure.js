/**
 * created by jsq on 2017/9/18
 */
import React from 'react'
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl';
import { Button, Table, Badge, notification, Popover  } from 'antd';
import SearchArea from 'components/search-area.js';
import httpFetch from 'share/httpFetch';
import config from 'config'

import menuRoute from 'share/menuRoute'

import 'styles/budget-setting/budget-organization/budget-structure/budget-structure.scss';

class BudgetStructure extends React.Component {
  constructor(props) {
    super(props);
    const { formatMessage } = this.props.intl;
    this.state = {
      loading: true,
      data: [],
      organization:{},
      searchParams: {
        structureCode: "",
        structureName: ""
      },
      pagination: {
        current: 1,
        page: 0,
        total:0,
        pageSize:10,
        showSizeChanger:true,
        showQuickJumper:true,
      },
      searchForm: [
        {type: 'input', id: 'structureCode', label: formatMessage({id: 'budget.structureCode'}) }, /*预算表代码*/
        {type: 'input', id: 'structureName', label: formatMessage({id: 'budget.structureName'}) }, /*预算表名称*/
      ],
      columns: [
        {          /*预算表代码*/
          title: formatMessage({id:"budget.structureCode"}), key: "structureCode", dataIndex: 'structureCode'
        },
        {          /*预算表名称*/
          title: formatMessage({id:"budget.structureName"}), key: "structureName", dataIndex: 'structureName'
        },
        {          /*编制期段*/
          title: formatMessage({id:"budget.periodStrategy"}), key: "periodStrategy", dataIndex: 'periodStrategy', width: '10%',
          render: (recode)=>{
            if(recode === "MONTH")
              return formatMessage({id:"periodStrategy.month"}) /*月度*/
            if(recode === "QUARTER")
              return formatMessage({id:"periodStrategy.quarter"}) /*季度*/
            if(recode === "YEAR")
              return formatMessage({id:"periodStrategy.year"}) /*年度*/
          }
        },
        {           /*备注*/
          title: formatMessage({id:"budget.structureDescription"}), key: "description", dataIndex: 'description',
          render: desc => <span>{desc ? <Popover placement="topLeft" content={desc}>{desc}</Popover> : '-'}</span>
        },
        {           /*状态*/
          title: formatMessage({id:"common.column.status"}),
          key: 'status',
          width: '10%',
          dataIndex: 'isEnabled',
          render: isEnabled => (
            <Badge status={isEnabled ? 'success' : 'error'}
                   text={isEnabled ? formatMessage({id: "common.status.enable"}) : formatMessage({id: "common.status.disable"})} />
          )
        }
      ],
    }
  }
  componentWillMount(){
    //查出当前预算组织数据
    httpFetch.get(`${config.budgetUrl}/api/budget/organizations/${this.props.id}`).then((response)=>{
      this.setState({
        organization: response.data
      })
    });
    this.getList();
  }

  //获取预算表数据
  getList(){
    let params = this.state.searchParams;
    let url = `${config.budgetUrl}/api/budget/structures/query?organizationId=${this.props.id}&page=${this.state.pagination.page}&size=${this.state.pagination.pageSize}`;
    for(let paramsName in params){
      url += params[paramsName] ? `&${paramsName}=${params[paramsName]}` : '';
    }
    httpFetch.get(url).then((response)=>{
      response.data.map((item,index)=>{
        item.key = item.structureCode;
      });
      this.setState({
        data: response.data,
        pagination: {
          total: Number(response.headers['x-total-count']),
          current: this.state.pagination.current,
          page: this.state.pagination.page,
          pageSize:this.state.pagination.pageSize,
          showSizeChanger:true,
          showQuickJumper:true,
        },
        loading: false
      })
    })
  };

  handleSearch = (values) =>{
    let searchParams = {
      structureName: values.structureName,
      structureCode: values.structureCode
    };
    this.setState({
      searchParams:searchParams,
      loading: true,
      page: 1
    }, ()=>{
      this.getList();
    })
  };

  //分页点击
  onChangePager = (pagination,filters, sorter) =>{
    let temp = this.state.pagination;
    temp.page = pagination.current-1;
    temp.current = pagination.current;
    temp.pageSize = pagination.pageSize;
    this.setState({
      loading: true,
      pagination: temp
    }, ()=>{
      this.getList();
    })
  };

  handleCreate = () =>{

    if(this.state.organization.isEnabled) {
      this.context.router.push(menuRoute.getMenuItemByAttr('budget-organization', 'key').children.newBudgetStructure.url.replace(':id', this.props.id));
    }else{
      notification["error"]({
        description: this.props.intl.formatMessage({id:"structure.validateCreate"})  /*请维护当前账套下的预算组织*/
      })
    }
  };

  //点击行，进入该行详情页面
  handleRowClick = (record, index, event) =>{
    this.context.router.push(menuRoute.getMenuItemByAttr('budget-organization', 'key').children.budgetStructureDetail.url.replace(':id', this.props.id).replace(':structureId', record.id));
  };

  render(){
    const { formatMessage } = this.props.intl;
    const { searchForm, loading, data, columns, pagination } = this.state;
    return (
      <div className="budget-structure">
        <SearchArea searchForm={searchForm} submitHandle={this.handleSearch}/>
        <div className="table-header">
          <div className="table-header-title">{formatMessage({id:'common.total'},{total:`${pagination.total}`})}</div>  {/*共搜索到*条数据*/}
          <div className="table-header-buttons">
            <Button type="primary" onClick={this.handleCreate}>{formatMessage({id: 'common.create'})}</Button>  {/*新 建*/}
          </div>
        </div>
        <Table
            loading={loading}
            dataSource={data}
            columns={columns}
            pagination={pagination}
            onChange={this.onChangePager}
            onRow={record => ({
              onClick: () => this.handleRowClick(record)
            })}
            size="middle"
            bordered/>
      </div>
    )
  }

}

BudgetStructure.contextTypes = {
  router: React.PropTypes.object
};

function mapStateToProps(state) {
  return {
    organization: state.budget.organization
  }
}

export default connect(mapStateToProps)(injectIntl(BudgetStructure));
