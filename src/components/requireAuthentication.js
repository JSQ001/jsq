/**
 * Created by zaranengap on 2017/7/11.
 */
import React from 'react'
import {connect} from 'react-redux';
import httpFetch from 'share/httpFetch'
import configureStore from 'stores'

function requireAuthentication(Component) {

  // 组件有已登陆的模块 直接返回 (防止从新渲染)
  if (Component.AuthenticatedComponent) {
    return Component.AuthenticatedComponent
  }

  // 创建验证组件
  class AuthenticatedComponent extends React.Component {

    constructor(){
      super();
      this.state = {login: false}
    }

    componentWillMount() {
      this.checkAuth();
    }

    componentWillReceiveProps() {
      this.checkAuth();
    }

    checkAuth() {
      const login = !!localStorage.token;
      if (!login) {
        this.props.history.replace('/');
      } else {
        if(Object.keys(configureStore.store.getState().login.user).length === 0)
          httpFetch.getInfo().then(()=>{
            this.setState({login: true});
          });
      }
    }

    render() {
      if (this.state.login) {
        return <Component {...this.props}/>
      }
      return (
        <div className="base">
          <div className="cube"/><div className="cube"/><div className="cube"/>
          <div className="cube"/><div className="cube"/><div className="cube"/>
          <div className="cube"/><div className="cube"/><div className="cube"/>
        </div>
      )
    }
  }

  function mapStateToProps(state) {
    return {};
  }

  function mapDispatchToProps(dispatch) {
    return {};
  }
  Component.AuthenticatedComponent = connect(mapStateToProps, mapDispatchToProps)(AuthenticatedComponent);
  return Component.AuthenticatedComponent
}

export default requireAuthentication
