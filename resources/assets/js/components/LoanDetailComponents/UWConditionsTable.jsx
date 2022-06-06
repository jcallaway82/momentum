import React, { Component } from 'react';
import ReactDOM from 'react-dom';
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

export default class UWConditionsTable extends Component {
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
            //uwCondList: this.props.uwCondList,
            comments: this.props.comments,
            loanOfficers: {},
            loanProcessors: {}
        };

        this.columns = [
            {
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
                title: 'Prior To',
                dataIndex: 'prior_to',
                key: 'prior_to',
                width: 100,
                filters: [
                    { text: 'Approval', value: 'Approval' },
                    { text: 'Closing', value: 'Closing' },
                    { text: 'Docs', value: 'Docs' },
                    { text: 'Funding', value: 'Funding' },
                ],
                render: (text, record) => (
                    <EditableCellSelect
                        route='/updateCondList'
                        item={record}
                        column='prior_to'
                        value={text}
                        onChange={this.onCellChange(record.key, 'name')}
                        options={[
                            'Approval',
                            'Closing',
                            'Docs',
                            'Funding'
                        ]}
                        width={120}
                        refresh={this.updateTable}
                    />
                ),
                onFilter: (value, record) => record.prior_to.indexOf(value) === 0,
                sorter: (a, b) => { return a.prior_to.localeCompare(b.prior_to) },
            }, {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
                width: 130,
                filters: [
                    { text: 'Added', value: 'Added' },
                    { text: 'Rejected', value: 'Rejected' },
                    { text: 'Requested', value: 'Requested' },
                    { text: 'Received', value: 'Received' },
                    { text: 'Fulfilled', value: 'Fulfilled' },
                    { text: 'Cleared', value: 'Cleared' },
                    { text: 'Waived', value: 'Waived' },
                ],
                render: (text, record) => (
                    <EditableCellSelect
                        route='/updateCondList'
                        item={record}
                        column='status'
                        value={text}
                        onChange={this.onCellChange(record.key, 'name')}
                        options={[
                            'Added',
                            'Rejected',
                            'Requested',
                            'Received',
                            'Fulfilled',
                            'Cleared',
                            'Waived',
                        ]}
                        width={130}
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
                        route='/updateCondList'
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
                                     fieldName='uwCondList'
                                     item_id={record.id}
                                     tabKey={5}
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
                this.getUwCondList();
                console.log(message);
            }
        });

        this.pubnub.subscribe({
            channels: ['uwCondList']
        });
    }

    getUwCondList = () => {
        let self = this;
        axios.post('/getCondList', {
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
                    self.props.refreshList(response.data.condList);
                    self.pubnub.publish(
                        {
                            message: 'UW Condition List Updated',
                            channel: 'uwCondList'
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
        const condList = this.props.uwCondList;

        return (
            <Table
                columns={this.columns}
                dataSource={condList}
                rowKey={record => record.id}
                size="middle"
                bordered
                pagination={{ pageSize: 50 }}
            />
        );
    }
}
