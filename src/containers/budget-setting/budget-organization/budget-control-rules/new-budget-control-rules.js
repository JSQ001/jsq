/**
 *  created by jsq on 2017/9/27
 */
import React from 'react'
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl';

import { Button, Form, Select,Input, Col, Row, Switch, message, Icon, DatePicker, InputNumber  } from 'antd';

import httpFetch from 'share/httpFetch';
import config from 'config'
import menuRoute from 'share/menuRoute'
import debounce from 'lodash.debounce';

import "styles/budget-setting/budget-organization/budget-control-rules/new-budget-control-rules.scss"

const FormItem = Form.Item;
const Option = Select.Option;

class NewBudgetControlRules extends React.Component{
 constructor(props){
   super(props);
   this.state = {
     loading: true,
     strategyGroup: [],
     startValue: null,
     endValue: null,
   };
   this.validateRuleCode = debounce(this.validateRuleCode,1000)
 }

 componentWillMount(){
   //加载页面时，获取启用的控制策略
   httpFetch.get(`${config.budgetUrl}/api/budget/control/strategies/query?organizationId=${this.props.organization.id}&isEnabled=true`).then((response)=>{
     if(response.status === 200){
       let strategyGroup = [];
       response.data.map((item)=>{
         let strategy = {
           id: item.id,
           key: item.controlStrategyCode,
           value: item.controlStrategyCode+" - "+item.controlStrategyName,
           title: item.controlStrategyName
         };
         strategyGroup.push(strategy);
       });
       this.setState({
         strategyGroup: strategyGroup
       })
     }
   })
 }

 //处理开始时间
  handleDisabledStartDate = (startValue) =>{

    if(!this.state.endValue || !startValue){
      return false
    }
    return startValue.valueOf() > this.state.endValue.valueOf();
  };

  HandleStartChange = (value) =>{
    this.onChange("startValue",value)
  };

  HandleEndChange = (value) =>{
    this.onChange("endValue",value)
  };

  onChange = (field, value) => {
    this.setState({
      [field]: value,
    });
  };

  handleDisabledEndDate = (endValue) =>{
    if (!this.state.startValue || !endValue) {
      return false;
    }
    return endValue.valueOf() <= this.state.startValue.valueOf();
  };

  //新建预算规则
  handleSave = (e) =>{
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        values.organizationId = this.props.organization.id
        values.strategyGroupId = values.controlStrategy.key;
        httpFetch.post(`${config.budgetUrl}/api/budget/control/rules`,values).then((response)=>{
          if(response.status === 200) {
            message.success(this.props.intl.formatMessage({id:"structure.saveSuccess"})); /*保存成功！*/
            this.context.router.push(menuRoute.getMenuItemByAttr('budget-organization', 'key').children.
                 budgetControlRulesDetail.url.replace(':id', this.props.params.id).replace(':ruleId', response.data.id));
          }
        }).catch((e)=>{
          if(e.response){
            message.error(`${this.props.intl.formatMessage({id:"common.save.filed"})}, ${e.response.data.message}`);
          }
          this.setState({loading: false});
        })
      }
    })
  };

  handleCancel = (e) =>{
    e.preventDefault();
    this.context.router.push(menuRoute.getMenuItemByAttr('budget-organization', 'key').children.budgetOrganizationDetail.url.replace(':id', this.props.params.id)+ '?tab=RULE');
  };

  validateRuleCode = (item,value,callback)=>{
    httpFetch.get(`${config.budgetUrl}/api/budget/control/rules/query?organizationId=${this.props.params.id}&controlRuleCode=${value}`).then((response)=>{
      let flag = false;
      if(response.data.length > 0 ){
        response.data.map((item)=>{
          if(item.structureCode === value) {
            flag = true;
          }
        })
      }
      flag >0 ? callback(this.props.intl.formatMessage({id:"budget.structureCode.exist"})) : callback();

    });
  };

  handleSelect=()=>{
    let value = this.props.form.getFieldValue("controlStrategy");
    console.log(value)
    if(typeof value !== 'undefined'){
      let controlStrategy = {
        key: value.key,
        label: value.title,
        title: value.title
      };
      this.props.form.setFieldsValue({"controlStrategy": controlStrategy})
    }
  };


 render(){
   const { getFieldDecorator } = this.props.form;
   const { strategyGroup, startValue, endValue} = this.state;
   const { formatMessage } = this.props.intl;
   return(
     <div className="new-budget-control-rules">
       <div className="budget-control-rules-form">
         <Form onSubmit={this.handleSave} className="budget-control-rules-form">
            <Row gutter={60}>
              <Col span={8}>
                <FormItem
                  label={ formatMessage({id:"budget.controlRuleCode"}) /*业务规则代码*/}
                  colon={true}>
                  {getFieldDecorator('controlRuleCode', {
                    rules:[
                      {required:true,message: formatMessage({id:"common.please.enter"})},
                      {
                        validator:(item,value,callback)=>this.validateRuleCode(item,value,callback)
                      }
                    ]
                  })(
                    <Input placeholder={ formatMessage({id:"common.please.enter"})}/>)
                  }
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={ formatMessage({id:"budget.controlRuleName"}) /*控制规则名称*/}
                  colon={true}>
                  {getFieldDecorator('controlRuleName', {
                    rules:[
                      {required:true,message: formatMessage({id:"common.please.enter"})},
                    ]
                  })(
                    <Input placeholder={ formatMessage({id:"common.please.enter"})}/>)
                  }
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label= {this.props.intl.formatMessage({id:"budget.strategy"})}
                  colon={true}>
                  {getFieldDecorator('controlStrategy', {
                    rules:[
                      {required:true,message: formatMessage({id:"common.please.enter"})},
                    ]
                  })(
                    <Select
                      labelInValue
                      onBlur={this.handleSelect}
                      placeholder={ formatMessage({id:"common.please.select"})}>
                      {strategyGroup.map((item)=><Option key={item.id} value={item.id}  title={item.title}>{item.value}</Option>)}
                    </Select>)
                  }
                </FormItem>
              </Col>
            </Row>
            <Row gutter={60}>
              <Col span={8}>
              <Col span={11}>
                <FormItem
                  label={this.props.intl.formatMessage({id:"budget.controlRule.effectiveDate"}) /*有效日期*/}
                  colon={true}>
                  {getFieldDecorator('startDate', {
                    rules:[
                      {required:true,message:this.props.intl.formatMessage({id:"common.please.enter"})},
                      {
                        validator:(item,value,callback)=>{
                          if(value === "undefined" || value === ""){
                            callback();
                            return
                          }
                          callback();
                        }
                      }
                    ]
                  })(
                    <DatePicker
                      placeholder={this.props.intl.formatMessage({id:"budget.controlRule.startDate"})}
                      setFieldsValue={startValue}
                      onChange={this.HandleStartChange}
                      disabledDate={this.handleDisabledStartDate}/>)
                  }
                </FormItem>
              </Col>
              <Col span={11} offset={2}>
                <FormItem
                  label=" "
                  colon={false}>
                  {getFieldDecorator('endDate', {
                    rules:[
                      {
                        validator:(item,value,callback)=>{
                          if(value === "undefined" || value === ""){
                            callback("请选择结束时间");
                            return
                          }
                          callback()
                        }
                      }
                    ]
                  })(
                    <DatePicker
                      placeholder={this.props.intl.formatMessage({id:"budget.controlRule.endDate"})}
                      setFieldsValue={endValue}
                      onChange={this.HandleEndChange}
                      disabledDate={this.handleDisabledEndDate}/>)
                  }
                </FormItem>
              </Col>
              </Col>
              <Col span={6}>
                <FormItem
                  label={this.props.intl.formatMessage({id:"budget.controlRules.priority"}) /*优先级*/}
                  colon={true}>
                  {getFieldDecorator('priority', {
                    rules:[
                      {required:true,message:this.props.intl.formatMessage({id:"common.please.enter"})},
                      {
                        validator:(item,value,callback)=>{
                          if(value === "undefined" || value === ""){
                            callback();
                            return
                          }
                          callback();
                        }
                      }
                    ]
                  })(
                    <InputNumber  placeholder={this.props.intl.formatMessage({id:"common.please.enter"})}/>)
                  }
                </FormItem>
              </Col>
            </Row>
           <Button type="primary" htmlType="submit">{this.props.intl.formatMessage({id:"common.save"}) /*保存*/}</Button>
           <Button onClick={this.handleCancel} style={{ marginLeft: 8 }}> {this.props.intl.formatMessage({id:"common.cancel"}) /*取消*/}</Button>
         </Form>
       </div>
     </div>
   )
 }
}

NewBudgetControlRules.contextTypes = {
  router: React.PropTypes.object
}

function mapStateToProps(state) {
  return {
    organization: state.budget.organization
  }
}

const WrappedNewBudgetControlRules = Form.create()(NewBudgetControlRules);
export default connect(mapStateToProps)(injectIntl(WrappedNewBudgetControlRules));
