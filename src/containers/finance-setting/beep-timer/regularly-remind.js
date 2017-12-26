/**
 * Created by 13576 on 2017/12/26.
 */
import React from 'react'
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl';

import { Form, Input, Switch, Button, Icon ,Tabs,Row,Col,message} from 'antd'
import httpFetch from 'share/httpFetch'
import config from 'config'
import menuRoute from 'share/menuRoute'
const FormItem = Form.Item;
const TabPane =Tabs.TabPane;

import WrappedBeepFrom from 'containers/finance-setting/beep-timer/beep-from.js'
import BeepInfo from 'containers/finance-setting/beep-timer/beep-info.js'

import 'styles/finance-setting/beep-timer/apply-traver.scss'



class RegularlyRemind extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      fromData:[]
    };
  }

  componentWillMount(){
    this.getData();
  }

  //获得已经有的差旅申请单数据
  getData(){
    httpFetch.get(`${config.baseUrl}/api/custom/forms/company/travel/application/all`).then((req)=>{
      console.log(req);
      this.setState({
        fromData: req.data
      })
    })
  }

  //Tabs点击
  onChangeTabs = (key) => {
    this.setState({

    },()=>{
      this.setState({
        status: key
      },()=>{
        this.getData()
      });
    });
  };


  componentWillMount(){

  }

  onCancel = () =>{
    this.props.close();
  };

  render(){
    const {} = this.state;
    return (
      <div className="beep-timer">
        <div>
          <BeepInfo
            type={"regularly"}
            applyData ={{}}
          />
        </div>
        <div>
          <Button type="dashed"  style={{ width: '100%', high:40}}>
            <Icon type="plus" /> 添加
          </Button>
        </div>
        <WrappedBeepFrom
          type={"regularly"}
          applyData ={{}}
        />
      </div>

    )
  }
}


function mapStateToProps(state) {
  return {}
}

export default connect(mapStateToProps)(injectIntl(RegularlyRemind));
