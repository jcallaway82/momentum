//require('./PipelineTableComponents/cellStyle.scss');
var strtotime = require('strtotime');
var moment = require('moment');
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Table, Alert, message } from 'antd';
import axios from 'axios';
import EditableCellSelect from './PipelineTableComponents/EditableCellSelect';
import EditableCellDatePicker from './PipelineTableComponents/EditableCellDatePicker';
import DisplayTooltip from './PipelineTableComponents/DisplayTooltip';
import PipelineTableHeader from './PipelineTableComponents/PipelineTableHeader';
import PubNubReact from 'pubnub-react';

const milestoneTypes = [
    'Started',
    'Qualification',
    'Processing',
    'Submittal',
    'Cond. Approval',
    'Resubmittal',
    'Approval',
    'Ready for Docs',
    'Docs Out',
    'Docs Signing',
    'Funding',
    'Shipping',
    'Purchased',
    'Reconciled',
    'Completion',
    'Doc Preparation',
    'Post Closing',
];

function arraySearch(arr, val) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] === val) {
            return i;
        }
    }
    return false;
}

function dateFormatter(cell) {
    return cell ? moment(cell, "YYYY/MM/DD").format("MM/DD/YYYY") : "";
}

function backgroundFormat(fieldValue, milestone, columnName) {
    var today = new Date();
    var currentDate = today.getFullYear()+'-'+("0" + (today.getMonth() + 1)).slice(-2)+'-'+("0" + today.getDate()).slice(-2);

    if(fieldValue === null) {
        return;
    }

    var key = null;
    switch (columnName) {
        case 'qualification_date': //qualification
            return 'td-on-time';
        case 'processing_date': //processing
            key = arraySearch(milestoneTypes, milestone);
            if(key >= 2) {
                return 'td-on-time';
            } else if (strtotime(fieldValue) > strtotime(currentDate)) {
                return;
            } else if (strtotime(fieldValue) === strtotime(currentDate) && (key < 3)) {
                return 'td-warning';
            } else {
                return 'td-late';
            }
            break;
        case 'initial_uw_date': //submittal
            key = arraySearch(milestoneTypes, milestone);
            if(key >= 3) {
                return 'td-on-time';
            } else if (strtotime(fieldValue) > strtotime(currentDate)) {
                return;
            } else if (strtotime(fieldValue) === strtotime(currentDate) && (key < 4)) {
                return 'td-warning';
            } else {
                return 'td-late';
            }
        case 'le_locked_resub_date': //resubmittal
            key = arraySearch(milestoneTypes, milestone);
            if(key >= 5) {
                return 'td-on-time';
            } else if (strtotime(fieldValue) > strtotime(currentDate)) {
                return;
            } else if (strtotime(fieldValue) === strtotime(currentDate) && (key < 7)) {
                return 'td-warning';
            } else {
                return 'td-late';
            }
        case 'cd_closing_date': //Ready for Docs
            key = arraySearch(milestoneTypes, milestone);
            if(key >= 7) {
                return 'td-on-time';
            } else if (strtotime(fieldValue) > strtotime(currentDate)) {
                return;
            } else if (strtotime(fieldValue) === strtotime(currentDate) && (key < 9)) {
                return 'td-warning';
            } else {
                return 'td-late';
            }
            break;
        case 'docs_out_date': //docs out
            key = arraySearch(milestoneTypes, milestone);
            if(key >= 8) {
                return 'td-on-time';
            } else if (strtotime(fieldValue) > strtotime(currentDate)) {
                return;
            } else if (strtotime(fieldValue) === strtotime(currentDate) && (key < 10)) {
                return 'td-warning';
            } else {
                return 'td-late';
            }
        case 'actual_closing_date': //actual closing date
            key = arraySearch(milestoneTypes, milestone);
            if(key >= 9) {
                return 'td-on-time';
            } else if (strtotime(fieldValue) > strtotime(currentDate)) {
                return;
            } else if (strtotime(fieldValue) === strtotime(currentDate) && (key < 11)) {
                return 'td-warning';
            } else {
                return 'td-late';
            }
    }
}

export default class PipelineTableAntD extends Component {
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
            loans: data.loans,
            procWorksheets: data.procWorksheets,
            loanOfficers: data.loanOfficers,
            loanProcessors: data.loanProcessors,
            filters: data.filters
        };

        this.columns = [
            {
                title: 'Review Status',
                dataIndex: 'review_status',
                key: 'review_status',
                render: (text, record) => (
                    <EditableCellSelect
                        route='/updateLoan'
                        item={record}
                        column='review_status'
                        value={text === null ? 'Active' : text}
                        onChange={this.onCellChange(record.key, 'name')}
                        options={[
                            'Construction Pending Completion',
                            'Dead',
                            'Active'
                        ]}
                        width={180}
                        refresh={this.updateTable}
                    />
                ),
                sorter: (a, b) => { return a.review_status.localeCompare(b.review_status) },
                width: 110,
                //align: 'center',
            }, {
                title: 'Borrower Name',
                dataIndex: 'borrower_name',
                key: 'borrower_name',
                render: (text, record) => {
                    return {
                        children: this.tooltipFormatter(text, record)
                    };
                },
                sorter: (a, b) => { return a.borrower_name.localeCompare(b.borrower_name) },
                width: 120
            }, {
                title: 'Loan Type',
                dataIndex: 'loan_type',
                key: 'loan_type',
                sorter: (a, b) => { return a.loan_type.localeCompare(b.loan_type) },
                width: 100
            }, {
                title: 'Loan Purpose',
                dataIndex: 'loan_purpose',
                key: 'loan_purpose',
                width: 110
            }, {
                title: 'Current Milestone',
                dataIndex: 'milestone',
                key: 'milestone',
                render: (text, record) => (
                    <EditableCellSelect
                        route='/updateLoan'
                        item={record}
                        column='milestone'
                        value={text === null ? 'Active' : text}
                        onChange={this.onCellChange(record.key, 'name')}
                        options={[
                            'Started',
                            'Qualification',
                            'Processing',
                            'Submittal',
                            'Cond. Approval',
                            'Resubmittal',
                            'Approval',
                            'Ready for Docs',
                            'Docs Out',
                            'Docs Signing',
                            'Funding',
                            'Shipping',
                            'Purchased',
                            'Reconciled',
                            'Completion',
                            'Doc Preparation',
                            'Post Closing',
                        ]}
                        width={160}
                        refresh={this.updateTable}
                    />
                ),
                width: 100
            }, {
                title: 'Loan Officer',
                dataIndex: 'tm_loan_officer',
                key: 'tm_loan_officer',
                sorter: (a, b) => { return a.tm_loan_officer.localeCompare(b.tm_loan_officer) },
                width: 110
            }, {
                title: 'Loan Processor',
                dataIndex: 'tm_loan_processor',
                key: 'tm_loan_processor',
                sorter: (a, b) => { return a.tm_loan_officer.localeCompare(b.tm_loan_officer) },
                width: 128
            }, {
                title: 'Lock & Request Status',
                dataIndex: 'lock_status',
                key: 'lock_status',
                width: 100
            }, {
                title: 'CD Sent Date',
                dataIndex: 'cd_sent_date',
                key: 'cd_sent_date',
                render: (text) => {
                    return {
                        children: dateFormatter(text)
                    };
                },
                align: 'center',
                width: 72
            }, {
                title: 'CD Received Date',
                dataIndex: 'cd_received_date',
                key: 'cd_received_date',
                render: (text) => {
                    return {
                        children: dateFormatter(text)
                    };
                },
                align: 'center',
                width: 72
            }, {
                title: 'Application Date',
                dataIndex: 'application_date',
                key: 'application_date',
                render: (text) => {
                    return {
                        children: dateFormatter(text)
                    };
                },
                sorter: (a, b) => { return a.application_date.localeCompare(b.application_date) },
                align: 'center',
                width: 80
            }, {
                title: 'Qualification',
                dataIndex: 'qualification_date',
                key: 'qualification_date',
                render: (text, record, index) => {
                    return {
                        props: {
                            className: backgroundFormat(text, record.milestone, 'qualification_date')
                        },
                        children: dateFormatter(text)
                    };
                },
                align: 'center',
                width: 85
            }, {
                title: 'In Process',
                dataIndex: 'processing_date',
                key: 'processing_date',
                render: (text, record, index) => {
                    return {
                        props: {
                            className: backgroundFormat(text, record.milestone, 'processing_date')
                        },
                        children: dateFormatter(text)
                    };
                },
                align: 'center',
                width: 85
            }, {
                title: 'Submission',
                dataIndex: 'initial_uw_date',
                key: 'initial_uw_date',
                render: (text, record, index) => {
                    return {
                        props: {
                            className: backgroundFormat(text, record.milestone, 'initial_uw_date')
                        },
                        children: dateFormatter(text)
                    };
                },
                align: 'center',
                width: 85
            }, {
                title: 'Resubmittal',
                dataIndex: 'le_locked_resub_date',
                key: 'le_locked_resub_date',
                render: (text, record, index) => {
                    return {
                        props: {
                            className: backgroundFormat(text, record.milestone, 'le_locked_resub_date')
                        },
                        children: dateFormatter(text)
                    };
                },
                align: 'center',
                width: 85
            }, {
                title: 'Clear to Close',
                dataIndex: 'cd_closing_date',
                key: 'cd_closing_date',
                render: (text, record, index) => {
                    return {
                        props: {
                            className: backgroundFormat(text, record.milestone, 'cd_closing_date')
                        },
                        children: dateFormatter(text)
                    };
                },
                align: 'center',
                width: 85
            }, {
                title: 'Docs Out',
                dataIndex: 'docs_out_date',
                key: 'docs_out_date',
                render: (text, record, index) => {
                    return {
                        props: {
                            className: backgroundFormat(text, record.milestone, 'docs_out_date')
                        },
                        children: dateFormatter(text)
                    };
                },
                align: 'center',
                width: 85
            }, {
                title: 'Actual Closing Date',
                dataIndex: 'actual_closing_date',
                key: 'actual_closing_date',
                render: (text, record) => {
                    return {
                        props: {
                            className: backgroundFormat(text, record.milestone, 'actual_closing_date')
                        },
                        children: <EditableCellDatePicker
                            route='/updateLoan'
                            item={record}
                            column='actual_closing_date'
                            value={text}
                            onChange={this.onCellChange(record.key, 'name')}
                            refresh={this.updateTable}
                        />
                    };
                },
                sorter: (a, b) => { return a.actual_closing_date.localeCompare(b.actual_closing_date) },
                align: 'center',
                width: 140
            }, {
                title: 'Scheduled Closing Date',
                dataIndex: 'scheduled_closing_date',
                key: 'scheduled_closing_date',
                render: (text) => {
                    return {
                        children: dateFormatter(text)
                    };
                },
                width: 80,
                align: 'center',
            }, {
                title: 'Subject Property Address',
                dataIndex: 'subject_property_address',
                key: 'subject_property_address',
                width: 150
            }, {
                title: 'Total Loan Amount',
                dataIndex: 'loan_amount',
                key: 'loan_amount',
                width: 80
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
                if(message.message === 'Processor Worksheet Updated') {
                    this.updateToolTip();
                } else {
                    this.getLoans();
                }
            }
        });

        this.pubnub.subscribe({
            channels: ['pipelineTable']
        });
    }

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

    getLoans = () => {
        let self = this;
        axios.get('/getActiveLoans')
            .then(function(response) {
                self.setState({
                    loans: response.data.loans,
                    procWorksheets: response.data.procWorksheets,
                    loanOfficers: response.data.loanOfficers,
                    loanProcessors: response.data.loanProcessors,
                    filters: response.data.filters
                });
            }.bind(this))
            .catch(function(error){
                console.log(error);
                alert('We were unable to retrieve all loans, please reload the page or contact your System' +
                    ' Administrator');
            });
    };

    updateToolTip = () => {
        let self = this;
        axios.get('/getProcWorksheets')
            .then(function(response) {
                self.setState({ procWorksheets: response.data.procWorksheets });
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
                    self.setState({ loans: response.data.loans });
                    self.pubnub.publish(
                        {
                            message: 'Pipeline Table Updated',
                            channel: 'pipelineTable'
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

    onRowDoubleClick = (row) => {
        window.open('/loanDetail/' + row.id + '/1/convoLog', row.borrower_name);
    };

    tooltipFormatter = (cell, row) => {
        return (
            <DisplayTooltip
                cell={cell}
                row={row}
                data={this.state.procWorksheets}
            />
        );
    };

    render() {

        return (
            <div>
                <PipelineTableHeader
                    loanOfficers={this.state.loanOfficers}
                    loanProcessors={this.state.loanProcessors}
                    filters={this.state.filters}
                    refreshTable={this.getLoans}
                />
                <br />
                <Table
                    columns={this.columns}
                    dataSource={this.state.loans}
                    rowKey={record => record.id}
                    onRow={(record) => ({
                        onDoubleClick: () => {this.onRowDoubleClick(record)},
                    })}
                    size="middle"
                    bordered
                    pagination={{ pageSize: 50 }}
                    scroll={{ x: 2100, y: 700 }}
                />
            </div>
        );
    }
}

// We only want to try to render our component on pages that have a div with an ID
// of "example"; otherwise, we will see an error in our console
if (document.getElementById('pipeline-new')) {
    ReactDOM.render(<PipelineTableAntD data={window.data} />, document.getElementById('pipeline-new'));
}