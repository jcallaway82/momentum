import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { Tabs, List, Alert, message,
    Form, Input, Select, Button, Modal} from 'antd';
const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
const Option = Select.Option;

const formItemLayout = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 7 },
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 12 },
    },
};

export default class TeamMembers extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            teamMembers: teamMembers,
            visible: false
        };
        this.onUnload = this.onUnload.bind(this);
    }

    componentDidMount() {
        window.addEventListener("beforeunload", this.onUnload);
    }

    componentWillUnmount() {
        window.removeEventListener("beforeunload", this.onUnload);
    }

    onUnload(event) { // the method that will be used for both add and remove event
        if(this.state.inputChanged) {
            event.returnValue = "Changes have not been saved." +
                " Are you sure you want to leave?";
        }
    }

    showModal = () => {
        this.setState({
            visible: true,
        });
    };

    handleOk = (e) => {
        console.log(e);
        this.setState({
            visible: false,
        });
    };

    handleCancel = (e) => {
        console.log(e);
        this.setState({
            visible: false,
        });
    };

    handleTeamMemberChange = (e) => {
        console.log(e)
    };

    render() {
        let options, teamForm;

        options = Object.keys(this.state.teamMembers.SystemUsers).map((key, index) =>
            <Option key={index} value={this.state.teamMembers.SystemUsers[key]}>{this.state.teamMembers.SystemUsers[key]}</Option>
        );

        teamForm = Object.entries(this.state.teamMembers.ImportUsers).map((item, index) =>
            <FormItem
                key={index}
                {...formItemLayout}
                label={item[0]}>
                <Select
                    value={item[1] === null ? 'Not Assigned' : item[1]}
                    onChange={this.handleTeamMemberChange}
                >
                    {item[0] === 'Loan Officer' ?
                        <Option value={item[1]}>
                            {item[1]}
                        </Option>
                        :
                        options}
                </Select>
            </FormItem>

        );

        return (
            <Tabs
                defaultActiveKey="1"
                id="teamMembers">
                <TabPane key="1" tab="Team Members">
                    <List
                        itemLayout="horizontal"
                        dataSource={Object.entries(this.state.teamMembers.ImportUsers)}
                        renderItem={item => (
                            <List.Item>
                                <List.Item.Meta
                                    title={item[0]}
                                    description={item[1] === null ? 'Not Assigned' : item[1]}
                                />
                            </List.Item>
                        )}
                    />
                    <br />
                    {/*<Button icon="edit" onClick={this.showModal}>Manage Team</Button>*/}
                    <Modal
                        title="Manage Team Members"
                        visible={this.state.visible}
                        onOk={this.handleOk}
                        onCancel={this.handleCancel}
                    >
                        <Form>
                            {teamForm}
                        </Form>
                    </Modal>
                </TabPane>
            </Tabs>
        );
    }
}

if (document.getElementById('teamMembers')) {
    ReactDOM.render(<TeamMembers
                        data={window.teamMembers}
                    />, document.getElementById('teamMembers'));
}
