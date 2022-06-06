var strtotime = require('strtotime');
var moment = require('moment');
import React, { Component } from 'react';
import { Table, Alert, message } from 'antd';
import axios from 'axios';
import EditableCellSelect from '../PipelineTableComponents/EditableCellSelect';
import TableNotes from './TableNotes';
import PubNubReact from 'pubnub-react';

function priorityBackgroundSwitch(param) {
    switch(param) {
        case 'High':
            return "td-late";
        case 'Medium':
            return "td-warning";
        case 'Low':
            return "td-on-time";
        default:
            return "";
    }
}

export default class ProcessingNeedsTable extends Component {
    constructor(props) {
        super(props);

        this.pubnub = new PubNubReact({
            /*//test
            publishKey: 'pub-c-da0761ac-b7dc-405f-8ad3-2b5770592dde',
            subscribeKey: 'sub-c-79291c04-20c4-11e8-8bcf-5e8597732562'*/

            //production
             publishKey: 'pub-c-3e92d54c-a7b3-411a-bd49-ab865d1db21f',
             subscribeKey: 'sub-c-a80b5efe-23af-11e8-be22-c2fd0b475b93'
        });

        this.state = {
            //procNeedsList: this.props.procNeedsList,
            comments: this.props.comments,
            loanOfficers: {},
            loanProcessors: {}
        };

        this.columns = [
            {
                title: 'Priority',
                dataIndex: 'priority',
                key: 'priority',
                filters: [
                    { text: 'High', value: 'High' },
                    { text: 'Medium', value: 'Medium' },
                    { text: 'Low', value: 'Low' },
                    { text: 'None', value: 'None' }
                ],
                width: 95,
                render: (text, record) => {
                    return {
                        props: {
                            className: priorityBackgroundSwitch(text)
                        },
                        children: <EditableCellSelect
                            route='/updateProcNeeds'
                            item={record}
                            column='priority'
                            value={text}
                            onChange={this.onCellChange(record.key, 'name')}
                            options={[
                                'High',
                                'Medium',
                                'Low',
                                'None',
                            ]}
                            width={120}
                            refresh={this.updateTable}
                        />,
                    };
                },
                onFilter: (value, record) => record.priority.indexOf(value) === 0,
                sorter: (a, b) => { return a.priority.localeCompare(b.priority) },
            },{
                title: 'Name',
                dataIndex: 'name',
                key: 'name',
                width: 150,
                sorter: (a, b) => { return a.name.localeCompare(b.name)},
            }, {
                title: 'Description',
                dataIndex: 'description',
                key: 'description',
                width: 400
            }, {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
                width: 100,
                filters: [
                    { text: 'Added', value: 'Added' },
                    { text: 'Requested', value: 'Requested' },
                    { text: 'Received', value: 'Received' },
                    { text: 'Cleared', value: 'Cleared' },
                    { text: 'Rejected', value: 'Rejected' },
                    { text: 'Waived', value: 'Waived' },
                ],
                render: (text, record) => (
                    <EditableCellSelect
                        route='/updateProcNeeds'
                        item={record}
                        column='status'
                        value={text}
                        onChange={this.onCellChange(record.key, 'name')}
                        options={[
                            'Added',
                            'Requested',
                            'Received',
                            'Cleared',
                            'Rejected',
                            'Waived'
                        ]}
                        width={120}
                        refresh={this.updateTable}
                    />
                ),
                onFilter: (value, record) => record.status.indexOf(value) === 0,
                sorter: (a, b) => { return a.status.localeCompare(b.status) },
            }, {
                title: 'Assigned To',
                dataIndex: 'assigned_to',
                key: 'assigned_to',
                width: 130,
                filters: [
                    { text: 'LO', value: 'LO' },
                    { text: 'LOA', value: 'LOA' },
                    { text: 'Processor', value: 'Processor' },
                    { text: 'UW', value: 'UW' },
                    { text: 'Not Assigned', value: 'Not Assigned' },
                ],
                render: (text, record) => (
                    <EditableCellSelect
                        route='/updateProcNeeds'
                        item={record}
                        column='assigned_to'
                        value={text}
                        onChange={this.onCellChange(record.key, 'name')}
                        options={[
                            'LO',
                            'LOA',
                            'Processor',
                            'UW',
                            'Not Assigned'
                        ]}
                        width={130}
                        refresh={this.updateTable}
                    />
                ),
                onFilter: (value, record) => record.assigned_to.indexOf(value) === 0,
                sorter: (a, b) => { return a.assigned_to.localeCompare(b.assigned_to) },
            }, {
                title: 'Notes',
                dataIndex: 'notes',
                key: 'notes',
                width: 300,
                render: (text, record) => (
                    <TableNotes loan_id={record.loan_id}
                                     users={this.props.users}
                                     fieldName='procNeedsList'
                                     item_id={record.id}
                                     tabKey={4}
                                     comments={this.state.comments}
                                     refreshComments={this.props.refreshComments}
                    />
                )
            }];
    }

    componentWillMount() {
        this.pubnub.addListener({
            status: function(statusEvent) {
                if (statusEvent.category === "PNConnectedCategory") {
                    console.log("Listener working!");
                } else if (statusEvent.category === "PNUnknownCategory") {
                    var newState = {
                        new: 'error'
                    };
                    pubnub.setState(
                        {
                            state: newState
                        },
                        function (status) {
                            console.log(statusEvent.errorData.message)
                        }
                    );
                }
            },
            message: (message) => {
                this.getProcNeedsList();
                console.log(message);
            }
        });

        this.pubnub.subscribe({
            channels: ['procNeedsList']
        });
    }

    getProcNeedsList = () => {
        let self = this;
        axios.post('/getNeedsList', {
            loan_id: self.props.loan_id
        })
            .then(function(response) {
                self.props.refreshList(response.data);
            }.bind(this))
            .catch(function(error){
                console.log(error);
                alert('We were unable to retrieve all loans, please reload the page or contact your System' +
                    ' Administrator');
            });
    };

    updateTable = (data) => {
        let self = this;
        axios.post(data.route, {
            data: {
                loan_id: data.loan_id,
                item_id: data.item_id,
                column: data.column,
                value: data.value
            }
        })
            .then(function(response){
                if(response.status == 200){
                    self.props.refreshList(response.data.needsList);
                    self.pubnub.publish(
                        {
                            message: 'Processor Needs List Updated',
                            channel: 'procNeedsList'
                        },
                        function (status, response) {
                            if (status.error) {
                                console.log(status)
                            } else {
                                console.log("message Published w/ timetoken", response.timetoken)
                            }
                        }
                    );
                }
            })
            .catch(function(error){
                if(error.response.status == 403){
                    message.error(error.response.data.messages);
                    self.setState({ editable: false });
                }
                console.log(error);
            });
    };

    onCellChange = (key, dataIndex) => {
        return (value) => {
            const dataSource = [...this.state.loans];
            const target = dataSource.find(item => item.key === key);
            message.success("on cell change called.");
            if (target) {
                target[dataIndex] = value;
                this.setState({ loans });
            }
        };
    };

    render() {
        const needsList = this.props.procNeedsList;

        return (
            <Table
                columns={this.columns}
                dataSource={needsList}
                rowKey={record => record.id}
                size="middle"
                bordered
                pagination={{ pageSize: 50 }}
            />
        );
    }
}
