/**
 * Created By ZaraNengap on 2017/09/21
 */
import React from 'react';
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'
import { Modal, Table, message, Button, Input, Row, Col, Card, Checkbox } from 'antd'

const Search = Input.Search;
const CheckboxGroup = Checkbox.Group;

import httpFetch from 'share/httpFetch'
import SearchArea from 'components/search-area'

import config from 'config'

import 'styles/pre-payment/my-pre-payment/select-contract.scss'

class SelectEmployeeGroup extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            toData: [],
            useData: [],
            userGroup: [],
            useUserGroup: [],
            toSelectList: [],  //代选区已经选中的列表
            useSelectList: [],  //使用区以选中的列表
            toSearchText: '',
            useSearchText: ''
        };
    }

    componentDidMount() {
        httpFetch.get(`${config.baseUrl}/api/user/groups/company/all`).then(res => {
            let temp = res.data.map(item => {
                return { label: item.name, value: item.id }
            })
            this.setState({ userGroup: temp, toData: temp.concat([]) });
        })
    }

    checkboxChange = (values) => {
        this.setState({ toSelectList: values });
    }

    useCheckboxChange = (values) => {
        this.setState({ useSelectList: values });
    }

    addToUse = () => {
        let array = [];
        let temp = this.state.userGroup.concat([]);
        let toData = this.state.toData.concat([]);
        this.state.toSelectList.map(item => {

            temp.splice(temp.findIndex(o => o.value == item), 1);
            toData.splice(toData.findIndex(o => o.value == item), 1);

            let record = this.state.userGroup.find(o => o.value == item);
            if (record) {
                array.push(record);
            }

        });

        this.setState({
            useUserGroup: this.state.useUserGroup.concat(array),
            useData: this.state.useData.concat(array),
            toData: toData,
            userGroup: temp,
            toSelectList: []
        }, () => {
            this.useSearch(this.state.useSearchText);
        });
    }
    removeFromUse = () => {
        let temp = this.state.useUserGroup.concat([]);
        let useData = this.state.useData.concat([]);

        let array = [];

        this.state.useSelectList.map(item => {

            let record = this.state.useUserGroup.find(o => o.value == item);
            if (record) {
                array.push(record);
            }

            temp.splice(temp.findIndex(o => o.value == item), 1);
            useData.splice(useData.findIndex(o => o.value == item), 1);

        });

        this.setState({
            useUserGroup: temp,
            useData: useData,
            useSelectList: [],
            userGroup: this.state.userGroup.concat(array),
            toData: this.state.toData.concat(array)
        }, () => {
            this.toSearch(this.state.toSearchText)
        });
    }

    onCheckAllChange = (e) => {
        this.setState({
            toSelectList: e.target.checked ? this.state.userGroup.map(o => o.value) : []
        })
    }

    onCheckAllChange = (e) => {
        this.setState({
            toSelectList: e.target.checked ? this.state.userGroup.map(o => o.value) : []
        })
    }

    onUseCheckAllChange = (e) => {
        this.setState({
            useSelectList: e.target.checked ? this.state.useUserGroup.map(o => o.value) : []
        })
    }

    toSearch = (value) => {

        if (!value) {
            this.setState({ userGroup: this.state.toData, toSearchText: value });
        }
        else {
            let temp = this.state.toData.filter(o => o.label.indexOf(value) >= 0);

            this.setState({ userGroup: temp, toSearchText: value });
        }
    }

    useSearch = (value) => {

        if (!value) {
            this.setState({ useUserGroup: this.state.useData, useSearchText: value });
        }
        else {
            let temp = this.state.useData.filter(o => o.label.indexOf(value) >= 0);

            this.setState({ useUserGroup: temp, useSearchText: value });
        }
    }

    handleOk = () => {
        this.props.onOk(this.state.useData);
    }

    render() {
        const { visible, onCancel, afterClose } = this.props;
        const { data, pagination, loading, userGroup, toSelectList, useUserGroup, useSelectList } = this.state;
        return (
            <Modal title={"选择人员组"} visible={visible} onCancel={onCancel} afterClose={afterClose} width={800} onOk={this.handleOk} className="list-selector select-employee-group">
                <Row gutter={10}>
                    <Col span={10}>
                        <Card title={
                            <Checkbox onChange={this.onCheckAllChange}
                                checked={!!toSelectList.length && toSelectList.length == userGroup.length}
                                indeterminate={!!toSelectList.length && (toSelectList.length < userGroup.length)} >{toSelectList.length}/{userGroup.length}</Checkbox>} extra={<span>代选区</span>}>
                            <Search
                                placeholder="请输入"
                                onChange={(e) => this.toSearch(e.target.value)}
                            />
                            {
                                <div style={{ margin: "10px 15px" }}>
                                    <CheckboxGroup value={toSelectList} onChange={this.checkboxChange} options={userGroup}></CheckboxGroup>
                                </div>
                            }

                        </Card>
                    </Col>
                    <Col span={4}>
                        <div style={{ height: 360, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <div>
                                <Button disabled={!toSelectList.length} onClick={this.addToUse} size="small" type="primary">加入使用&gt;</Button>
                                <br />
                                <Button disabled={!useSelectList.length} onClick={this.removeFromUse} style={{ marginTop: 15 }} size="small" type="primary">&lt;回到代选</Button>
                            </div>
                        </div>
                    </Col>
                    <Col span={10}>
                        <Card title={<Checkbox onChange={this.onUseCheckAllChange} checked={!!useSelectList.length && useSelectList.length == useUserGroup.length} indeterminate={!!useSelectList.length && (useSelectList.length < useUserGroup.length)} >{useSelectList.length}/{useUserGroup.length}</Checkbox>} extra={<span>使用列表</span>}>
                            <Search
                                placeholder="请输入"
                                onChange={(e) => this.useSearch(e.target.value)}
                            />
                            {
                                <div style={{ margin: "10px 15px" }}>
                                    <CheckboxGroup value={useSelectList} onChange={this.useCheckboxChange} options={useUserGroup}></CheckboxGroup>
                                </div>
                            }
                        </Card>
                    </Col>
                </Row>
            </Modal >
        );
    }
}

SelectEmployeeGroup.propTypes = {
    visible: React.PropTypes.bool,  //对话框是否可见
    onOk: React.PropTypes.func,  //点击OK后的回调，当有选择的值时会返回一个数组
    onCancel: React.PropTypes.func,  //点击取消后的回调
    afterClose: React.PropTypes.func,  //关闭后的回调
    type: React.PropTypes.string,  //选择类型
    selectedData: React.PropTypes.array,  //默认选择的值id数组
    extraParams: React.PropTypes.object,  //搜索时额外需要的参数,如果对象内含有组件内存在的变量将替换组件内部的数值
    selectorItem: React.PropTypes.object,  //组件查询的对象，如果存在普通配置没法实现的可单独传入，例如参数在url中间动态变换时，表单项需要参数搜索时
    single: React.PropTypes.bool  //是否单选
};

SelectEmployeeGroup.defaultProps = {
    afterClose: () => { },
    extraParams: {},
    single: false
};

function mapStateToProps() {
    return {}
}

export default connect(mapStateToProps)(injectIntl(SelectEmployeeGroup));
