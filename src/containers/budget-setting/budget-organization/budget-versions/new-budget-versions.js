/**
 * Created by 13576 on 2017/9/18.
 */
import React from 'React'
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl';
import config from 'config'
import httpFetch from 'share/httpFetch';
import menuRoute from 'share/menuRoute'
import { Form, Input, Switch, Button,Col,Row,Select,DatePicker,Alert,notification,Icon,message} from 'antd'
import 'styles/budget/budget-versions/new-budget-versions.scss'

const FormItem = Form.Item;
const sd = this;


class NewBudgetVersions extends React.Component {

  constructor(props){
    super(props)
    this.state = {
      versionCodeError:false,
      statusError:false,
      newData:[],
      checkoutCodeData:[
        {versionCode:'Tom'},
        {versionCode:'123'},
        {versionCode:'pop'}
      ],
      budgetVersionsDetailDetailPage: menuRoute.getRouteItem('budget-versions-detail','key'),    //预算版本详情的页面项

    };
  }

  componentWillMount(){
    console.log(this.props.organization.id)
    console.log(this.props.id)

  }

  //弹出警告
  openNotification (value) {
    const key = `open${Date.now()}`;
    const btnClick = function () {
      notification.close(key);
    };
    const btn = (
      <Button type="primary" size="large" onClick={btnClick}>
        知道了
      </Button>
    );
    notification.open({
      message: '一个预算组织下只能有一个‘当前’版本',
      description: `预算组织 ${this.props.organization.organizationName}  下已经有预算版本代码为 ${value} 的当前版本`,
      duration:null,
      btn,
      key,
      icon:<Icon type="close-circle" style={{ color:'#F04134' }} />,
      style: {
        Button:{
          marginRight:150.

        }
      },

    });
  };


//查询预算组织代码下是否已经  当前 版本'
  checkoutStatus=(value)=>{
    return httpFetch.get(`${config.budgetUrl}/api/budget/versions/query?organizationId=${this.props.id}&&status="CURRENT"`, ).then((response)=>{
      response.data.map((item, index)=>{
        item.index = this.state.page * this.state.pageSize + index + 1;
        item.key = item.index;
      });

      console.log(response.data)
      if(true){
        this.openNotification ("code1")
      }
      this.state.statusError =true;
    });
  }


  //检查处理提交数据
  handleSave = (e) =>{
    e.preventDefault();
    console.log(this.props.form.getFieldsValue())

    let value =this.props.form.getFieldsValue();
  /*  value.organizationId=this.props.organization.organizationId;*/

    if (value.status=='CURRENT'){
      this.checkoutStatus(value);
    }

    console.log(this.state.statusError)
    if(!this.state.statusError){
      const dataValue=value['versionDate']
      const toleValues={
        ...value,
        'versionDate': value['versionDate']?value['versionDate'].format('YYYY-MM-DD'):'',
        'organizationId':this.props.organization.id
      }

      this.saveData(toleValues);
    }
  };

  //保存数据
  saveData(value){
    const path = this.state.budgetVersionsDetailDetailPage.url.replace(':id', value.organizationId);
    let  locations={
      key: 'budget-versions-detail',
      pathname:path,
      state: {
        Data:{}
      }
    }

    return httpFetch.post(`${config.budgetUrl}/api/budget/versions`,value).then((response)=>{
      locations.state.Data = response.data;

        message.success('保存成功', 2);
        setTimeout(() => {
          this.setState({ newData: response.data }, () => this.context.router.push(locations))
        },200)

    } ).catch(e=>{
      if(e.response){
        message.error(e.response.data.message)
      }
    });
  }



//跳转到详情

  toBudgetVersionsDetail=()=>{

  }





  CancelHandle = () =>{
    this.props.form.resetFields;
  };



  checkVersionCode=(rule, value, callback)=>{
    const checkoutCodeData = this.state.checkoutCodeData;

    console.log(this.state.checkoutCodeData)
    let a;
    for(a in checkoutCodeData) {
      if(value == checkoutCodeData[a].versionCode){
        callback("该预算版本代码已经存在");
      }
    }

    callback();
  }

  render(){

    const { getFieldDecorator } = this.props.form;
    const versionCodeError = false
    return (

      <div className="new-budget-versions">

        <div className="new-budget-versions-help">
          <Alert
            message="帮助提示"
            description="一个预算组织下的版本代码不可重复，一个预算组织下只能有一个当前版本，一个预算组织下允许多个预算版本同时生效。"
            type=""
            showIcon
          />
          {this.props.id}
        </div>

        <div className="new-budget-versions-from">
          <Form onSubmit={this.handleSave}>
            <Row gutter={40}>


              <Col span={8} style={{ display: 'inline-block'}}>
                <FormItem
                  label="预算组织"
                >
                  {getFieldDecorator('organizationName',
                    {
                      initialValue:this.props.organization.organizationName,
                      rules: [
                        { required: true,}
                      ],
                    })(
                    <Input disabled={true} />
                  )}
                </FormItem>
              </Col>

              <Col span={8} style={{ display: 'inline-block'}}>
                <FormItem
                  label="预算版本代码"
                  hasFeedback
                >
                  {getFieldDecorator('versionCode',
                    {
                      rules: [{ required: true, message: '必填!' },
                        {validator: this.checkVersionCode}
                      ],
                    })(
                    <Input />
                  )}
                </FormItem>
              </Col>

              <Col span={8}  style={{ display: 'inline-block'}}>
                <FormItem label="预算版本名称"
                          hasFeedback
                >
                  {getFieldDecorator('versionName', {

                    rules: [{ required: true, message: '预算版本名称必填!' }],
                  })(<Input />)}

                </FormItem>
              </Col>

              <Col span={8} style={{ display: 'inline-block'}}>
                <FormItem
                  label="状态"

                >
                  {getFieldDecorator('status', {
                    initialValue:"NEW",
                    rules: [{ required: true, message: '状态' }],
                  })(
                    <Select
                      placeholder=""

                    >
                      <Select.Option value="NEW">新建</Select.Option>
                      <Select.Option value="CURRENT">当前</Select.Option>
                      <Select.Option value="HISTORY">历史</Select.Option>
                    </Select>
                  )}
                </FormItem>
            </Col>


            <Col span={8}  style={{ display: 'inline-block'}}>
              <FormItem label="预算版本描述"

              >
                {getFieldDecorator('description',{

                })(<Input />)}
              </FormItem>
            </Col>



            <Col span={8} style={{ display: 'inline-block'}}>
              <FormItem

                label="版本日期"
              >
                {getFieldDecorator('versionDate',
                  {
                    valuePropName:"defaultValue",
                  }
                )(
                  <DatePicker />
                )}
              </FormItem>
            </Col>


            <Col span={8}  style={{ display: 'inline-block'}}>
              <FormItem

                label="是否启用"
              >
                {getFieldDecorator('isEnabled', {
                    valuePropName:"checked",
                    initialValue:true
                  }
                )(
                  <Switch checkedChildren="开" unCheckedChildren="关"/>
                )}
              </FormItem>
            </Col>


          </Row>
          <Row  gutter={40}>

          </Row>

          <div className="">
            <Button type="primary" htmlType="submit" >保 存</Button>
            <Button onClick={this.CancelHandle}>取 消</Button>
          </div>


        </Form>
        </div>


      </div>

    )
  }

}


NewBudgetVersions.contextTypes={
  router:React.PropTypes.object
}

const WrappedNewBudgetVersions= Form.create()(NewBudgetVersions);

function mapStateToProps(state) {
  return {
    organization:state.budget.organization
  }
}

export default connect(mapStateToProps)(injectIntl(WrappedNewBudgetVersions));