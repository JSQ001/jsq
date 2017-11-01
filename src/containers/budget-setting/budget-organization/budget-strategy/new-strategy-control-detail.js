import React from 'react'
import { connect } from 'react-redux'
import httpFetch from 'share/httpFetch'
import config from 'config'
import { Form, Button, Radio, Select, Col, InputNumber, Popover, Icon, message } from 'antd'
const FormItem = Form.Item;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const Option = Select.Option;
class NewStrategyControlDetail extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      objectValue: '',
      rangeValue: '',
      mannerValue: '',
      operatorValue: '',
      valueValue: '',
      periodStrategyValue: '',
      updateParams: {},
      loading: false,
      controlObjectOptions: [], //控制对象
      rangeOptions: [], //比较
      mannerOptions: [], //方式
      operatorOptions: [], //运算符号(+,-,*,/)
      periodStrategyOptions: [], //控制期段
    };
  }
  componentWillMount(){
    this.getSystemValueList(2008).then(res => { //控制对象
      let controlObjectOptions = res.data.values;
      this.setState({ controlObjectOptions })
    });
    this.getSystemValueList(2007).then(res => { //比较
      let rangeOptions = res.data.values;
      this.setState({ rangeOptions })
    });
    this.getSystemValueList(2009).then(res => { //方式
      let mannerOptions = res.data.values;
      this.setState({ mannerOptions })
    });
    this.getSystemValueList(2010).then(res => { //运算符号(+,-,*,/)
      let operatorOptions = res.data.values;
      this.setState({ operatorOptions })
    });
    this.getSystemValueList(2011).then(res => { //控制期段
      let periodStrategyOptions = res.data.values;
      this.setState({ periodStrategyOptions })
    });
  }
  componentWillReceiveProps(nextProps){
    if(!nextProps.params.id) {
      console.log(nextProps.params.strategyControlId, this.state.updateParams.strategyControlId);
      this.setState({
        updateParams: nextProps.params
      })
    } else if(nextProps.params.id != this.state.updateParams.id){ //更新
      this.setState({
        updateParams: nextProps.params,
        objectValue: nextProps.params.object,
        rangeValue: nextProps.params.range,
        mannerValue: nextProps.params.manner,
        operatorValue: nextProps.params.operator,
        valueValue: nextProps.params.value,
        periodStrategyValue: this.handlePeriodStrategy(nextProps.params.periodStrategy)
      });
      let params = {
        object: nextProps.params.object,
        range: nextProps.params.range,
        manner: nextProps.params.manner,
        operator: nextProps.params.operator,
        value: nextProps.params.value,
        periodStrategy: nextProps.params.periodStrategy
      };
      console.log(nextProps.params);
      this.props.form.setFieldsValue(params)
    }
  }
  onCancel = () =>{
    this.props.close();
  };
  handleSave = (e) =>{
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.setState({loading: true});
        values.controlStrategyDetailId = this.props.params.strategyControlId;
        values.value = Number(values.value).toFixed(4);
        httpFetch.post(`${config.budgetUrl}/api/budget/control/strategy/mp/conds`, values).then((res)=>{
          this.setState({loading: false});
          if(res.status == 200){
            this.props.close(true);
            message.success('保存成功');
          }
        }).catch((e)=>{
          if(e.response){
            message.error(`保存失败, ${e.response.data.validationErrors[0].message}`);
            this.setState({loading: false});
          } else {
            console.log(e)
          }
        })
      }
    });
  };
  handleUpdate = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.setState({loading: true});
        values.id = this.state.updateParams.id;
        values.controlStrategyDetailId = this.props.params.strategyControlId;
        values.versionNumber = this.state.updateParams.versionNumber++;
        values.value = Number(values.value).toFixed(4);
        httpFetch.put(`${config.budgetUrl}/api/budget/control/strategy/mp/conds`, values).then((res)=>{
          if(res.status == 200){
            this.setState({loading: false});
            this.props.close(true);
            message.success('保存成功');
          }
        }).catch((e)=>{
          if(e.response){
            message.error(`保存失败, ${e.response.data.validationErrors[0].message}`);
            this.setState({ loading: false })
          } else {
            console.log(e)
          }
        })
      }
    });
  };
  handlePeriodStrategy = (value) => {
    const config = {
      '年度': '全年预算额',
      '年度至今': '年初至今预算额',
      '累计季度': '年初至当季度预算额',
      '季度滚动': '当月至后两个月共3个月合计预算额',
      '季度': '当季预算额',
      '季度至今': '季度初至今预算额',
      '期间': '当月录入预算额'
    };
    this.setState({ periodStrategyValue: config[value] });
    return config[value]
  };
  render(){
    const { getFieldDecorator } = this.props.form;
    const { objectValue, rangeValue, mannerValue, operatorValue, valueValue, periodStrategyValue, updateParams, loading, controlObjectOptions, rangeOptions, mannerOptions, operatorOptions, periodStrategyOptions } = this.state;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14, offset: 1 },
    };
    const content = (
      <div style={{color:'#999'}}>
        <div style={{marginBottom:'10px'}}>控制策略控制期段即以何种方式对预算进行控制</div>
        <div>
          <span style={{color:'#666'}}>【月度】</span>：按当月录入预算额控制<br/>
          <span style={{color:'#666'}}>【季度】</span>：按当季预算额控制<br/>
          <span style={{color:'#666'}}>【年度】</span>：按全年预算额控制<br/>
          <span style={{color:'#666'}}>【季初至今】</span>：按季度初至今预算额控制<br/>
          <span style={{color:'#666'}}>【年初至今】</span>：按年初至今预算额控制<br/>
          <span style={{color:'#666'}}>【滚动季度】</span>：按当月至后两个月共3个月合计预算额控制<br/>
          <span style={{color:'#666'}}>【累计季度】</span>：按年初至当季度预算额控制
        </div>
      </div>
    );
    let renderOperator;
    let renderValue;
    if (mannerValue == '百分比') {
      renderValue = (
        <Col span={6}>
          <FormItem>
            {getFieldDecorator('value', {
              rules: [{
                required: true,
                message: '请输入'
              }],
              initialValue: updateParams.value
            })(
              <InputNumber min={0}
                           formatter={value => `${value}%`}
                           parser={value => value.replace('%', '')}
                           onChange={value => {this.setState({ valueValue:value })}}/>
            )}
          </FormItem>
        </Col>
      );
    } else {
      renderValue = (
        <Col span={6}>
          <FormItem>
            {getFieldDecorator('value', {
              rules: [{
                required: true,
                message: '请输入'
              }],
              initialValue: updateParams.value
            })(
              <InputNumber min={0}
                           onChange={(value)=>{this.setState({ valueValue:value })}}/>
            )}
          </FormItem>
        </Col>
      );
      renderOperator = (
        <Col span={8} style={{marginRight:'15px'}}>
          <FormItem>
            {getFieldDecorator('operator', {
              rules: [{
                required: true,
                message: '请选择'
              }],
              initialValue: updateParams.operator
            })(
              <Select onChange={(value)=>{this.setState({ operatorValue:value })}} placeholder="请选择">
                {operatorOptions.map((option)=>{
                  return <Option key={option.messageKey}>{option.messageKey}</Option>
                })}
              </Select>
            )}
          </FormItem>
        </Col>
      );
    }
    return (
      <div className="new-strategy-control-detail">
        <Form onSubmit={updateParams.id ? this.handleUpdate : this.handleSave}>
          <FormItem {...formItemLayout} label="类型" style={{margin:'24px 0'}}>
            {getFieldDecorator('organizationName', { initialValue: '公式' })(
              <RadioGroup>
                <RadioButton value="公式">公式</RadioButton>
              </RadioGroup>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="控制对象">
            {getFieldDecorator('object', {
              rules: [{
                required: true,
                message: '请选择'
              }],
              initialValue: updateParams.object
            })(
              <Select onChange={(value)=>{this.setState({ objectValue: value })}} placeholder="请选择">
                {controlObjectOptions.map((option)=>{
                  return <Option key={option.messageKey}>{option.messageKey}</Option>
                })}
              </Select>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="比较">
            {getFieldDecorator('range', {
              rules: [{
                required: true,
                message: '请选择'
              }],
              initialValue: updateParams.range
            })(
              <Select onChange={(value)=>{this.setState({ rangeValue: value })}} placeholder="请选择">
                {rangeOptions.map((option)=>{
                  return <Option key={option.messageKey}>{option.messageKey}</Option>
                })}
              </Select>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="方式">
            <Col span={8} style={{marginRight:'15px'}}>
              <FormItem>
                {getFieldDecorator('manner', {
                  rules: [{
                    required: true,
                    message: '请选择'
                  }],
                  initialValue: updateParams.manner
                })(
                  <Select onChange={(value)=>{this.setState({ mannerValue: value })}} placeholder="请选择">
                    {mannerOptions.map((option)=>{
                      return <Option key={option.messageKey}>{option.messageKey}</Option>
                    })}
                  </Select>
                )}
              </FormItem>
            </Col>
            {renderOperator}
            {renderValue}
          </FormItem>
          <FormItem {...formItemLayout} label="控制期段">
            <Col span={20} style={{marginRight:'20px'}}>
              <FormItem>
                {getFieldDecorator('periodStrategy', {
                  rules: [{
                    required: true,
                    message: '请选择'
                  }],
                  initialValue: updateParams.periodStrategy
                })(
                  <Select onChange={this.handlePeriodStrategy} placeholder="请选择">
                    {periodStrategyOptions.map((option)=>{
                      return <Option key={option.messageKey}>{option.messageKey}</Option>
                    })}
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col span={2}>
              <Popover placement="topLeft" content={content} title="预算控制期段">
                <div><Icon type="question-circle-o" style={{fontSize:'18px',color:'#bababa',cursor:'pointer',verticalAlign:'middle',color:'#49a9ee'}}/></div>
              </Popover>
            </Col>
          </FormItem>
          <FormItem {...formItemLayout} label="条件">
            {getFieldDecorator('scenarioName')(
              <div>{objectValue} {rangeValue} {periodStrategyValue}
                {mannerValue == '百分比' && valueValue ? Number(valueValue).toFixed(4) + '%' : operatorValue + Number(valueValue).toFixed(4)}</div>
            )}
          </FormItem>
          <div className="slide-footer">
            <Button type="primary" htmlType="submit" loading={loading}>保存</Button>
            <Button onClick={this.onCancel}>取消</Button>
          </div>
        </Form>
      </div>
    )
  }
}
function mapStateToProps() {
  return {}
}
const WrappedNewStrategyControlDetail = Form.create()(NewStrategyControlDetail);
export default connect(mapStateToProps)(WrappedNewStrategyControlDetail);
