import React from 'react'
import { connect } from 'react-redux'

import menuRoute from 'share/menuRoute'
import httpFetch from 'share/httpFetch'
import config from 'config'
import { Form, Input, Row, Col, Select, Button, message } from 'antd'
const FormItem = Form.Item;
const Option = Select.Option;

import 'styles/budget/budget-strategy/new-budget-strategy-detail.scss'

class NewBudgetStrategyDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      controlMethodNotice: '',
      budgetStrategyDetail:  menuRoute.getRouteItem('budget-strategy-detail','key'),    //控制策略详情
    }
  }

  handleSave = (e) =>{
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.setState({loading: true});
        values.controlStrategyId = this.props.params.strategyId;
        httpFetch.post(`${config.budgetUrl}/api/budget/control/strategy/details`, values).then((res)=>{
          console.log(res);
          if(res.status == 200){
            this.setState({loading: false});
            message.success('操作成功');
            this.handleCancle();
          }
        }).catch((e)=>{
          this.setState({loading: false});
          if(e.response.data.validationErrors){
            message.error(`新建失败, ${e.response.data.validationErrors[0].message}`);
          } else {
            message.error('呼，服务器出了点问题，请联系管理员或稍后再试:(');
          }
        })
      }
    });
  };

  handleCancle = () => {
    this.context.router.push(this.state.budgetStrategyDetail.url.replace(':id', this.props.params.id).replace(':strategyId', this.props.params.strategyId));
  };

  handleMethodChange = (value) => {
    console.log(value);
    let notice = '';
    if(value == '禁止') {
      notice = '如果满足触发条件，当单据提交时，禁止提交';
    } else if(value=='警告') {
      notice = '如果满足触发条件，当单据提交时，进行提示';
    } else {
      notice = '不做任何控制';
    }
    this.setState({
      controlMethodNotice: notice
    })
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { controlMethod, controlMethodNotice } = this.state;
    return (
      <div className="new-budget-strategy-detail">
        <Form onSubmit={this.handleSave}>
          <Row gutter={40}>
            <Col span={8} style={{ display: 'inline-block'}}>
              <FormItem label="序号">
                {getFieldDecorator('detailSequence', {
                  rules: [{
                    required: true,
                    message: '请输入'
                  }],
                  initialValue: ''
                })(
                  <Input placeholder="请输入" />
                )}
              </FormItem>
            </Col>
            <Col span={8} style={{ display: 'inline-block'}}>
              <FormItem label="明细代码">
                {getFieldDecorator('detailCode', {
                  rules: [{
                    required: true,
                    message: '请输入'
                  }],
                  initialValue: ''
                })(
                  <Input placeholder="请输入" />
                )}
              </FormItem>
            </Col>
            <Col span={8} style={{ display: 'inline-block'}}>
              <FormItem label="控制策略" help={controlMethodNotice}>
                {getFieldDecorator('controlMethod', {
                  rules: [{
                    required: true,
                    message: '请选择'
                  }]})(
                  <Select placeholder="请选择" onChange={this.handleMethodChange}>
                    <Option value="禁止">禁止</Option>
                    <Option value="警告">警告</Option>
                    <Option value="通过">通过</Option>
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col span={8} style={{ display: 'inline-block'}}>
              <FormItem label="控制规则描述">
                {getFieldDecorator('detailName', {
                  rules: [{
                    required: true,
                    message: '请输入'
                  }],
                  initialValue: ''
                })(
                  <Input placeholder="请输入" />
                )}
              </FormItem>
            </Col>
            <Col span={8} style={{ display: 'inline-block'}}>
              <FormItem label="消息">
                {getFieldDecorator('messageCode', {
                  /*rules: [{
                    required: true,
                    message: '请输入'
                  }],*/
                  initialValue: ''
                })(
                  <Input placeholder="请输入" />
                )}
              </FormItem>
            </Col>
            <Col span={8} style={{ display: 'inline-block'}}>
              <FormItem label="事件">
                {getFieldDecorator('expWfEvent', {
                  /*rules: [{
                    required: true,
                    message: '请输入'
                  }],*/
                  initialValue: ''
                })(
                  <Input placeholder="请输入" />
                )}
              </FormItem>
            </Col>
          </Row>
          <div>
            <Button type="primary" htmlType="submit" style={{marginRight:'20px'}} loading={this.state.loading}>保存</Button>
            <Button onClick={this.handleCancle}>取消</Button>
          </div>
        </Form>
      </div>
    )
  }
}

NewBudgetStrategyDetail.contextTypes={
  router:React.PropTypes.object
};

function mapStateToProps(state) {
  return { }
}

const WrappedNewBudgetStrategyDetail = Form.create()(NewBudgetStrategyDetail);

export default connect(mapStateToProps)(WrappedNewBudgetStrategyDetail);

