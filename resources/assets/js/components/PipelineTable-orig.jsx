var strtotime = require('strtotime');
var moment = require('moment');
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import axios from 'axios';

function enumFormatter(cell, row, enumObject) {
    return enumObject[cell];
}

const loanPurpose = {
    'Purchase': 'Purchase',
    'No Cash-Out Refi': 'No Cash-Out Refi',
    'Cash-Out Refi': 'Cash out Refi',
    'Construction': 'Construction'
};

const loanMilestone = {
    'Started': 'Started',
    'Qualification': 'Qualification',
    'Setup': 'Setup',
    'Processing': 'Processing',
    'Submittal': 'Submittal',
    'Received in UW': 'Received in UW',
    'Decision Rendered': 'Decision Rendered',
    'Resubmittal': 'Resubmittal',
    'Approval': 'Approval',
    'Clear to Close': 'Clear to Close',
    'Docs Out': 'Docs Out',
    'Docs Signing': 'Docs Signing'
};

const milestoneTypes = [
    'Started',
    'Qualification',
    'Setup',
    'Processing',
    'Submittal',
    'Received in UW',
    'Decision Rendered',
    'Resubmittal',
    'Approval',
    'Clear to Close',
    'Docs Out',
    'Docs Signing'
];

const reviewStatus = {
    'Construction Pending Completion': 'Construction Pending Completion',
    'Dead': 'Dead',
    'null': 'Active'
};

const statusTypes = [
    'Construction Pending Completion',
    'Dead',
    'null'
];

function arraySearch(arr, val) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] === val) {
            return i;
        }
    }
    return false;
}

function columnClassNameFormat(fieldValue, row, rowIdx, colIdx) {
    var today = new Date();
    var currentDate = today.getFullYear()+'-'+("0" + (today.getMonth() + 1)).slice(-2)+'-'+("0" + today.getDate()).slice(-2);

    if(fieldValue === null) {
        return;
    }
    //console.log(currentDate);
    var key = null;
    switch (colIdx) {
        case 12: //qualification
            return 'td-on-time';
            break;
        case 13: //setup
            key = arraySearch(milestoneTypes, row.milestone);
            if(key >= 2 ) {
                return 'td-on-time';
            } else if (strtotime(fieldValue) > strtotime(currentDate)) {
                return;
            } else if (strtotime(fieldValue) === strtotime(currentDate) && (key < 2)) {
                return 'td-warning';
            } else {
                return 'td-late';
            }
            break;
        case 14: //processing
            key = arraySearch(milestoneTypes, row.milestone);
            if(key >= 3) {
                return 'td-on-time';
            } else if (strtotime(fieldValue) > strtotime(currentDate)) {
                return;
            } else if (strtotime(fieldValue) === strtotime(currentDate) && (key < 3)) {
                return 'td-warning';
            } else {
                return 'td-late';
            }
            break;
        case 15: //submission
            key = arraySearch(milestoneTypes, row.milestone);
            if(key >= 4) {
                return 'td-on-time';
            } else if (strtotime(fieldValue) > strtotime(currentDate)) {
                return;
            } else if (strtotime(fieldValue) === strtotime(currentDate) && (key < 4)) {
                return 'td-warning';
            } else {
                return 'td-late';
            }
            break;
        case 16: //resubmittal
            key = arraySearch(milestoneTypes, row.milestone);
            if(key >= 7) {
                return 'td-on-time';
            } else if (strtotime(fieldValue) > strtotime(currentDate)) {
                return;
            } else if (strtotime(fieldValue) === strtotime(currentDate) && (key < 7)) {
                return 'td-warning';
            } else {
                return 'td-late';
            }
            break;
        case 17: //clear to close
            key = arraySearch(milestoneTypes, row.milestone);
            if(key >= 9) {
                return 'td-on-time';
            } else if (strtotime(fieldValue) > strtotime(currentDate)) {
                return;
            } else if (strtotime(fieldValue) === strtotime(currentDate) && (key < 9)) {
                return 'td-warning';
            } else {
                return 'td-late';
            }
            break;
        case 18: //docs out
            key = arraySearch(milestoneTypes, row.milestone);
            if(key >= 10) {
                return 'td-on-time';
            } else if (strtotime(fieldValue) > strtotime(currentDate)) {
                return;
            } else if (strtotime(fieldValue) === strtotime(currentDate) && (key < 10)) {
                return 'td-warning';
            } else {
                return 'td-late';
            }
            break;
        case 19: //actual closing date
            key = arraySearch(milestoneTypes, row.milestone);
            if(key >= 11) {
                return 'td-on-time';
            } else if (strtotime(fieldValue) > strtotime(currentDate)) {
                return;
            } else if (strtotime(fieldValue) === strtotime(currentDate) && (key < 11)) {
                return 'td-warning';
            } else {
                return 'td-late';
            }
            break;
    }
}

export default class PipelineTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loans: this.getLoans(),
            procWorksheets: null,
            loanOfficers: {},
            loanProcessors: {}
        };
    }

    getLoans() {
        let self = this;
        axios.get('/getActiveLoans')
            .then(function(response) {
                self.setState({
                    loans: response.data[0],
                    procWorksheets: response.data[1],
                    loanOfficers: response.data[2],
                    loanProcessors: response.data[3]
                });
            }.bind(this))
            .catch(function(error){
                console.log(error);
                alert('We were unable to retrieve all loans, please reload the page or contact your System' +
                    ' Administrator');
            });
    }

    afterSaveCell(row, cellName, cellValue) {
        let self = this;

        axios.post('/updateLoan', {
            data: {
                loan_id: row.id,
                column: cellName,
                value: cellValue
            }
        })
        .then(function(response){
            if(response.status == 200){
                //console.log('success');
                self.getLoans();
            }
        })
        .catch(function(error){
            if(error.response.status == 403){
                let errors = error.response.data.messages;
                alert(errors);
                self.getLoans();
            }
            console.log(error);
        });
    }

    onRowDoubleClick(row) {
        window.open('/loanDetail/' + row.id + '/1/convoLog', row.borrower_name);
    }

    tooltipFormatter(cell, row, enumObject) {
        let procWorksheet;
        enumObject.forEach(function(outerArr) {
            outerArr.forEach(function(item) {
                if(item.loan_id == row.id) {
                    procWorksheet = item;
                }
            });
        });

        return (<OverlayTrigger placement="right"
                                overlay={<Tooltip id={String(row.id)}>
                                    <strong>Appraisal</strong><br />
                                    <p>Ordered: {(procWorksheet.appraisal_ord == 0) ? 'No':'Yes'}</p><br />
                                    <p>Received: {(procWorksheet.appraisal_rcvd == 0) ? 'No':'Yes'}</p><br />
                                    <p>Disclosed:{(procWorksheet.appraisal_disclosed == 0) ? 'No':'Yes'}</p><br />
                                    <p>Due Date: {procWorksheet.appraisal_due_date}</p><br />
                                    <p>Value: {procWorksheet.appraisal_value}</p><br />
                                    <p>Status: {procWorksheet.appraisal_status}</p><br />
                                    <strong>Survey</strong><br />
                                    <p>Request Status: {(procWorksheet.survey_req == 0) ? 'No':'Yes'}</p><br />
                                    <p>Ordered: {(procWorksheet.survey_ord == 0) ? 'No':'Yes'}</p><br />
                                    <p>Received: {(procWorksheet.survey_rcvd == 0) ? 'No':'Yes'}</p><br />
                                    <p>DueDate: {procWorksheet.survey_ord_due_date}</p><br />
                                    <strong>Title Work</strong><br />
                                    <p>Requested: {(procWorksheet.title_work_req == 0) ? 'No':'Yes'}</p><br />
                                    <p>Received: {(procWorksheet.title_work_rcvd == 0) ? 'No':'Yes'}</p><br />
                                    <strong>Hazard Insurance</strong><br />
                                    <p>Quote: {(procWorksheet.haz_ins_quote_req == 0) ? 'No':'Yes'}</p><br />
                                    <p>Binder Request: {(procWorksheet.haz_ins_bind_req == 0) ? 'No':'Yes'}</p><br />
                                    <p>Binder Received: {(procWorksheet.haz_ins_bind_rcvd == 0) ? 'No':'Yes'}</p><br />
                                    </Tooltip>}><span>{cell}</span></OverlayTrigger>);
    }

    dateFormatter(cell, row) {
        return cell ? moment(cell, "YYYY/MM/DD").format("MM/DD/YYYY") : "";
    }

    render() {
        const cellEditProp = {
            mode: 'click',
            blurToSave: 'true',
            afterSaveCell: this.afterSaveCell.bind(this)
        };

        const options = {
            onRowDoubleClick: this.onRowDoubleClick.bind(this),
        };

        return (
            <BootstrapTable data={ this.state.loans }
                            cellEdit={ cellEditProp }
                            options={ options }
                            striped hover condensed
                            height='700px'
                            scrollTop={ 'Bottom' }>
                <TableHeaderColumn
                    width='100'
                    headerAlign='center'
                    thStyle={ { whiteSpace: 'normal' } }
                    tdStyle={ { whiteSpace: 'normal' } }
                    dataField='review_status'
                    filterFormatted dataFormat={ enumFormatter }
                    formatExtraData={ reviewStatus }
                    filter={ { type: 'SelectFilter', options: reviewStatus } }
                    editable={ { type: 'select', options: { values: statusTypes } } }>
                    Review Status
                </TableHeaderColumn>
                <TableHeaderColumn
                    width='85'
                    headerAlign='center'
                    dataField='loan_id'
                    isKey
                    hidden>
                    Loan ID
                </TableHeaderColumn>
                <TableHeaderColumn
                    width='120'
                    headerAlign='center'
                    dataFormat={ this.tooltipFormatter }
                    formatExtraData={ this.state.procWorksheets }
                    thStyle={ { whiteSpace: 'normal' } }
                    tdStyle={ { whiteSpace: 'normal' } }
                    dataField='borrower_name'
                    editable={ false }
                    dataSort={ true }>
                    Borrower Name
                </TableHeaderColumn>
                <TableHeaderColumn
                    width='80'
                    headerAlign='center'
                    dataField='loan_type'
                    editable={ false }
                    dataSort={ true }>
                    Loan Type
                </TableHeaderColumn>
                <TableHeaderColumn
                    width='110'
                    headerAlign='center'
                    thStyle={ { whiteSpace: 'normal' } }
                    tdStyle={ { whiteSpace: 'normal' } }
                    dataField='loan_purpose'
                    editable={ false }
                    filterFormatted dataFormat={ enumFormatter }
                    formatExtraData={ loanPurpose }
                    filter={ { type: 'SelectFilter', options: loanPurpose } }>
                    Loan Purpose
                </TableHeaderColumn>
                <TableHeaderColumn
                    width='100'
                    headerAlign='center'
                    thStyle={ { whiteSpace: 'normal' } }
                    tdStyle={ { whiteSpace: 'normal' } }
                    dataField='milestone'
                    filterFormatted dataFormat={ enumFormatter }
                    formatExtraData={ loanMilestone }
                    filter={ { type: 'SelectFilter', options: loanMilestone } }
                    editable={ { type: 'select', options: { values: milestoneTypes } } }>
                    Current Milestone
                </TableHeaderColumn>
                <TableHeaderColumn
                    width='100'
                    headerAlign='center'
                    thStyle={ { whiteSpace: 'normal' } }
                    tdStyle={ { whiteSpace: 'normal' } }
                    dataField='tm_loan_officer'
                    editable={ false }
                    dataSort={ true }
                    filterFormatted dataFormat={ enumFormatter }
                    formatExtraData={ this.state.loanOfficers }
                    filter={ { type: 'SelectFilter', options: this.state.loanOfficers } }>
                    Loan Officer
                </TableHeaderColumn>
                <TableHeaderColumn
                    width='120'
                    headerAlign='center'
                    thStyle={ { whiteSpace: 'normal' } }
                    tdStyle={ { whiteSpace: 'normal' } }
                    dataField='tm_loan_processor'
                    editable={ false }
                    dataSort={ true }
                    filterFormatted dataFormat={ enumFormatter }
                    formatExtraData={ this.state.loanProcessors }
                    filter={ { type: 'SelectFilter', options: this.state.loanProcessors } }>
                    Loan Processor
                </TableHeaderColumn>
                <TableHeaderColumn
                    width='100'
                    headerAlign='center'
                    thStyle={ { whiteSpace: 'normal' } }
                    tdStyle={ { whiteSpace: 'normal' } }
                    dataField='lock_status'
                    editable={ false }>
                    Lock & Request Status
                </TableHeaderColumn>
                <TableHeaderColumn
                    width='72'
                    headerAlign='center'
                    dataAlign='center'
                    thStyle={ { whiteSpace: 'normal' } }
                    dataField='cd_sent_date'
                    dataFormat = {this.dateFormatter.bind(this)}
                    editable={ false }>
                    CD Sent Date
                </TableHeaderColumn>
                <TableHeaderColumn
                    width='72'
                    headerAlign='center'
                    dataAlign='center'
                    thStyle={ { whiteSpace: 'normal' } }
                    dataField='cd_received_date'
                    dataFormat = {this.dateFormatter.bind(this)}
                    editable={ false }>
                    CD Received Date
                </TableHeaderColumn>
                <TableHeaderColumn
                    width='72'
                    headerAlign='center'
                    dataAlign='center'
                    thStyle={ { whiteSpace: 'normal' } }
                    dataField='application_date'
                    editable={ false }
                    dataFormat = {this.dateFormatter.bind(this)}
                    dataSort={ true }>
                    Application Date
                </TableHeaderColumn>
                <TableHeaderColumn
                    width='80'
                    headerAlign='center'
                    dataAlign='center'
                    dataField='qualification_date'
                    editable={ false }
                    dataFormat = {this.dateFormatter.bind(this)}
                    columnClassName={ columnClassNameFormat }>
                    Qualification
                </TableHeaderColumn>
                <TableHeaderColumn
                    width='80'
                    headerAlign='center'
                    dataAlign='center'
                    dataField='setup_date'
                    editable={ false }
                    dataFormat = {this.dateFormatter.bind(this)}
                    columnClassName={ columnClassNameFormat }>
                    Setup
                </TableHeaderColumn>
                <TableHeaderColumn
                    width='80'
                    headerAlign='center'
                    dataAlign='center'
                    thStyle={ { whiteSpace: 'normal' } }
                    dataField='processing_date'
                    editable={ false }
                    dataFormat = {this.dateFormatter.bind(this)}
                    columnClassName={ columnClassNameFormat }>
                    In Process
                </TableHeaderColumn>
                <TableHeaderColumn
                    width='80'
                    headerAlign='center'
                    dataAlign='center'
                    dataField='initial_uw_date'
                    editable={ false }
                    dataFormat = {this.dateFormatter.bind(this)}
                    columnClassName={ columnClassNameFormat }>
                    Submission
                </TableHeaderColumn>
                <TableHeaderColumn
                    width='80'
                    headerAlign='center'
                    dataAlign='center'
                    dataField='le_locked_resub_date'
                    editable={ false }
                    dataFormat = {this.dateFormatter.bind(this)}
                    columnClassName={ columnClassNameFormat }>
                    Resubmittal
                </TableHeaderColumn>
                <TableHeaderColumn
                    width='80'
                    headerAlign='center'
                    dataAlign='center'
                    thStyle={ { whiteSpace: 'normal' } }
                    dataField='cd_closing_date'
                    editable={ false }
                    dataFormat = {this.dateFormatter.bind(this)}
                    columnClassName={ columnClassNameFormat }>
                    Clear to Close
                </TableHeaderColumn>
                <TableHeaderColumn
                    width='80'
                    headerAlign='center'
                    dataAlign='center'
                    dataField='docs_out_date'
                    editable={ false }
                    dataFormat = {this.dateFormatter.bind(this)}
                    columnClassName={ columnClassNameFormat }>
                    Docs out
                </TableHeaderColumn>
                <TableHeaderColumn
                    width='140'
                    headerAlign='center'
                    dataAlign='center'
                    thStyle={ { whiteSpace: 'normal' } }
                    dataField='actual_closing_date'
                    dataSort={ true }
                    editable={ { type: 'date' } }
                    dataFormat = {this.dateFormatter.bind(this)}
                    columnClassName={ columnClassNameFormat }>
                    Actual Closing Date
                </TableHeaderColumn>
                <TableHeaderColumn
                    width='72'
                    headerAlign='center'
                    dataAlign='center'
                    thStyle={ { whiteSpace: 'normal' } }
                    dataField='scheduled_closing_date'
                    dataFormat = {this.dateFormatter.bind(this)}
                    editable={ false }>
                    Scheduled Closing Date
                </TableHeaderColumn>
                <TableHeaderColumn
                    width='150'
                    headerAlign='center'
                    thStyle={ { whiteSpace: 'normal' } }
                    tdStyle={ { whiteSpace: 'normal' } }
                    dataField='subject_property_address'
                    editable={ false }>
                    Subject Property Address
                </TableHeaderColumn>
                <TableHeaderColumn
                    width='65'
                    headerAlign='center'
                    thStyle={ { whiteSpace: 'normal' } }
                    dataField='loan_amount'
                    editable={ false }>
                    Total Loan Amount
                </TableHeaderColumn>
            </BootstrapTable>
        );
    }
}

// We only want to try to render our component on pages that have a div with an ID
// of "example"; otherwise, we will see an error in our console
if (document.getElementById('pipeline')) {
    ReactDOM.render(<PipelineTable />, document.getElementById('pipeline'));
}