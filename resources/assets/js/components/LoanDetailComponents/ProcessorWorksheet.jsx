import React, { Component } from 'react';
import {
    Form, Checkbox, FormControl, Popover, InputGroup,
    Button, Row, Col, HelpBlock, OverlayTrigger,
    ControlLabel, Alert, Modal, Glyphicon
    } from 'react-bootstrap';
import { Popconfirm, message } from 'antd';
import axios from 'axios';
import CountdownTimer from './WorksheetComponents/CountdownTimer';
import Properties from './WorksheetComponents/Properties';
import DisplayNotes from './CommentComponents/DisplayNotes';
import AddDate from './WorksheetComponents/AddDate';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import PubNubReact from 'pubnub-react';

var titles = {
    fontWeight: 'bold',
};

const resIncomePopOver = (
    <Popover id="res_income">
        <div style={{ width: 'auto', height: 'auto' }}>
            <embed type="image/png"
                   src="/images/res_income_chart.png"
                   width="700"
                   height="232"/>
        </div>
    </Popover>
);

function cancel(e) {
    console.log(e);
    //message.error('Click on No');
}

export default class ProcessorWorksheet extends Component {
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
            worksheet: this.props.worksheet,
            inputChanged: this.props.inputChanged,
            borrowers: this.props.borrowers,
            reos: this.props.reos,
            loanInfo: this.props.loanInfo,
            comments: this.props.comments,
            notesField: this.props.notesField,
            userEditingWorksheet: null,
            isWorksheetEditable: false,
            editStartTime: null,
        };
        this.onUnload = this.onUnload.bind(this);
        this.getTaskLockedUser = this.getTaskLockedUser.bind(this);
        this.allowTaskListEdit = this.allowTaskListEdit.bind(this);
        this.updateTaskList = this.updateTaskList.bind(this);
        this.cancelUpdate = this.cancelUpdate.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleChangeBorrower = this.handleChangeBorrower.bind(this);
        this.handleChangeReo = this.handleChangeReo.bind(this);
        this.refreshReos = this.refreshReos.bind(this);
        this.handleDatePickerChange = this.handleDatePickerChange.bind(this);
        this.refreshComments = this.refreshComments.bind(this);
        this.closeNotes = this.closeNotes.bind(this);
    }

    componentDidMount() {
        let self = this;
        self.getTaskLockedUser();
        window.addEventListener("beforeunload", this.onUnload)
    }

    componentWillUnmount() {
        window.removeEventListener("beforeunload", this.onUnload)
    }

    onUnload(event) { // the method that will be used for both add and remove event
        if(this.state.inputChanged) {
            event.returnValue = "Changes have not been saved." +
                " Are you sure you want to leave?";
            //event.returnValue = message;
            //return message;
        }
    }

    /**
     * Get user from DB that has locked the task list
     */
    getTaskLockedUser() {
        let self = this;
        axios.post('/checkIfTaskLocked', {
            data: {
                loan_id: self.state.worksheet[0].loan_id,
                table: 'processorWorksheets'
            }
        })
            .then(function(response) {
                self.setState({userEditingWorksheet: response.data});
            }.bind(this))
            .catch(function(error){
                console.log(error);
                alert('We were unable to check if this record is locked. ' +
                    'Please contact your System Administrator for assistance');
            });
    }

    /**
     * Update state to allow task list fields to be editable
     */
    allowTaskListEdit() {
        let self = this;
        if(self.state.userEditingWorksheet) {
            alert(self.state.userEditingWorksheet + ' is already editing this loan. Please try again later')
        } else {
            axios.post('/lockTaskForEdit', {
                data: {
                    loan_id: self.state.worksheet[0].loan_id,
                    table: 'processorWorksheets'
                }
            })
                .then(function(response) {
                    //let tempWorksheet = JSON.parse(JSON.stringify(self.state.worksheet));
                    self.setState({
                        isWorksheetEditable: true,
                        inputChanged: true ,
                        editStartTime: Date.now(),
                        //worksheetBackup: tempWorksheet
                    });
                }.bind(this))
                .catch(function(error){
                    console.log(error);
                    alert(error.response.data.messages);
                });
        }
    }

    /**
     * Update DB with new state changes from task list
     */
    updateTaskList() {
        let self = this;
        axios.post('/updateTask', {
            data: {
                tableName: 'processorWorksheets',
                worksheet: self.state.worksheet[0],
                borrower: self.state.borrowers,
                reo: self.state.reos
            }
        })
            .then(function(response) {
                if(response.status == 403) {
                    alert('You do not have this record locked for editing. Please click edit and re-save' +
                        ' your changes.')
                }
                self.setState({
                    isWorksheetEditable: false,
                    userEditingWorksheet: null,
                    inputChanged: null,
                    worksheetBackup: null
                });
                self.pubnub.publish(
                    {
                        message: 'Processor Worksheet Updated',
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
            }.bind(this))
            .catch(function(error){
                console.log(error);
                alert(error.response.data.messages);
            });
    }

    /**
     * Cancel changes to worksheet and refresh page
     */
    cancelUpdate() {
        let self = this;
        axios.post('/cancelUpdate', {
            data: {
                tableName: 'processorWorksheets',
                loan_id: self.state.worksheet[0].loan_id,
            }
        })
            .then(function(response) {
                self.setState({ inputChanged: null });
                window.location.reload();
            }.bind(this))
            .catch(function(error){
                console.log(error);
                alert('There was a problem saving the data. ' +
                    'Please contact your System Administrator for assistance');
            });
    }

    /*resetWorksheet(tempWorksheet) {
        //let self = this;
        //let tempWorksheet = JSON.parse(JSON.stringify(self.state.worksheetBackup));
        this.setState({
            worksheet: tempWorksheet,
            isWorksheetEditable: false,
            userEditingWorksheet: null,
            inputChanged: null,
            worksheetBackup: null
        });
    }*/

    /**
     * Updates state from changes in task list
     * @param event - item that is being changed
     */
    handleChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        let tempWorksheet = this.state.worksheet.slice(); //creates the clone of the state
        tempWorksheet[0][name] = value;
        switch(name) {
            case 'appraisal_ord':
                if (value === true) {
                    this.setState({ appraisal_ord_date:true})
                } else {
                    tempWorksheet[0]['appraisal_ord_date'] = null;
                }
                break;
            case 'survey_ord':
                if (value === true) {
                    this.setState({ survey_ord_date:true})
                } else {
                    tempWorksheet[0]['survey_ord_date'] = null;
                }
                break;
            case 'title_work_req':
                if (value === true) {
                    this.setState({ title_work_req_date:true})
                } else {
                    tempWorksheet[0]['title_work_req_date'] = null;
                }
                break;
            case 'haz_ins_quote_req':
                if (value === true) {
                    this.setState({ haz_ins_quote_req_date:true})
                } else {
                    tempWorksheet[0]['haz_ins_quote_req_date'] = null;
                }
                break;
            case 'haz_ins_quote_sent':
                if (value === true) {
                    this.setState({ haz_ins_quote_sent_date:true})
                } else {
                    tempWorksheet[0]['haz_ins_quote_sent_date'] = null;
                }
                break;
            case 'haz_ins_binder_req':
                if (value === true) {
                    this.setState({ haz_ins_binder_req_date:true})
                } else {
                    tempWorksheet[0]['haz_ins_binder_req_date'] = null;
                }
                break;
            case 'final_ord':
                if (value === true) {
                    this.setState({ final_ord_date:true})
                } else {
                    tempWorksheet[0]['final_ord_date'] = null;
                }
                break;
            default:
                break;
        }
        this.setState({worksheet: tempWorksheet});
    }

    /**
     * Updates state from changes in task list
     * @param event - item that is being changed
     * @param borrNum - borrower number
     */
    handleChangeBorrower(borrNum, event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        let tempBorrower = this.state.borrowers.slice();
        tempBorrower[borrNum][name] = value;
        this.setState({borrowers: tempBorrower});
    }

    /**
     * Updates state from changes in task list
     * @param event - item that is being changed
     * @param reoNum - reo number
     */
    handleChangeReo(reoNum, event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        let tempReo = this.state.reos.slice();
        tempReo[reoNum][name] = value;
        this.setState({reos: tempReo});
    }

    /**
     * Refreshes state from REO's that have been added or deleted
     * @param newReos   array of current REO's
     */
    refreshReos(newReos) {
        let self = this;
        self.setState({reos: newReos});
    }

    handleDatePickerChange(field, date) {
        const value = date;
        const formattedDate = value.format('YYYY-MM-DD')

        let tempWorksheet = this.state.worksheet.slice();
        tempWorksheet[0][field] = formattedDate;
        this.setState({worksheet: tempWorksheet});

    }

    refreshComments(comments) {
        let self = this;
        self.setState({comments: comments});
    }

    closeNotes(fieldName) {
        this.setState({ [fieldName]: false})
    }

    render() {
        let cancelButton, saveButton, countdownTimer, userEditing, final,
            currentVOE, priorVOE, ssValidation, transcripts, fhaCaseAssign,
            coe, novRequest, txCashOut, mortPayoffs, reoItem;

        if(this.state.isWorksheetEditable) {
            cancelButton =
                <Popconfirm title="Are you sure you want to cancel changes?" onConfirm={this.cancelUpdate} onCancel={cancel} okText="Yes" cancelText="No">
                    <Button
                        bsStyle="danger"
                        bsSize="small"
                        disabled={!this.state.isWorksheetEditable}
                        //onClick={this.cancelUpdate}
                    >
                        Cancel
                    </Button>
                </Popconfirm>;
            saveButton =
                <Button
                    bsStyle="success"
                    bsSize="small"
                    disabled={!this.state.isWorksheetEditable}
                    onClick={this.updateTaskList}>
                    Save
                </Button>;
            countdownTimer = <CountdownTimer startTime={this.state.editStartTime}/>;
        }

        if(this.state.userEditingWorksheet) {
            userEditing =
                <Alert bsStyle="warning">
                    <strong>{this.state.userEditingWorksheet}</strong> is currently editing this task list.
                </Alert>
        }

        if(!this.state.worksheet[0].voe_curr_emp_na) {
            currentVOE = this.state.borrowers.map((borrower, i) =>
                <Row key={i}>
                    &nbsp;
                    <ControlLabel>Borrower #{i+1}</ControlLabel>
                    <br />
                    &nbsp;
                    <Checkbox
                        defaultChecked={borrower.voe_curr_emp_req}
                        inline
                        disabled={!this.state.isWorksheetEditable}
                        onChange={(e) => this.handleChangeBorrower(i, e)}
                        name="voe_curr_emp_req">
                        Requested
                    </Checkbox>
                    &nbsp;&nbsp;&nbsp;
                    <Checkbox
                        defaultChecked={borrower.voe_curr_emp_rcvd}
                        inline
                        disabled={!this.state.isWorksheetEditable}
                        onChange={(e) => this.handleChangeBorrower(i, e)}
                        name="voe_curr_emp_rcvd">
                        Received
                    </Checkbox>
                </Row>
            );
        } else {
            currentVOE =
                <HelpBlock>Please deselect N/A to view fields.</HelpBlock>
        }

        if(!this.state.worksheet[0].voe_prev_emp_na) {
            priorVOE = this.state.borrowers.map((borrower, i) =>
                <Row key={i}>
                    &nbsp;
                    <ControlLabel>Borrower #{i+1}</ControlLabel>
                    <br />
                    &nbsp;
                    <Checkbox
                        defaultChecked={borrower.voe_prev_emp_req}
                        inline
                        disabled={!this.state.isWorksheetEditable}
                        onChange={(e) => this.handleChangeBorrower(i, e)}
                        name="voe_prev_emp_req">
                        Requested
                    </Checkbox>
                    &nbsp;&nbsp;&nbsp;
                    <Checkbox
                        defaultChecked={borrower.voe_prev_emp_rcvd}
                        inline
                        disabled={!this.state.isWorksheetEditable}
                        onChange={(e) => this.handleChangeBorrower(i, e)}
                        name="voe_prev_emp_rcvd">
                        Received
                    </Checkbox>
                </Row>
            );
        } else {
            priorVOE =
                <HelpBlock>Please deselect N/A to view fields.</HelpBlock>
        }

        ssValidation = this.state.borrowers.map((borrower, i) =>
            <Row key={i}>
                &nbsp;
                <ControlLabel>Borrower #{i+1}</ControlLabel>
                <br />
                &nbsp;
                <Checkbox
                    defaultChecked={borrower.ss_val_req}
                    inline
                    disabled={!this.state.isWorksheetEditable}
                    onChange={(e) => this.handleChangeBorrower(i, e)}
                    name="ss_val_req">
                    Requested
                </Checkbox>
                &nbsp;&nbsp;&nbsp;
                <Checkbox
                    defaultChecked={borrower.ss_val_rcvd}
                    inline
                    disabled={!this.state.isWorksheetEditable}
                    onChange={(e) => this.handleChangeBorrower(i, e)}
                    name="ss_val_rcvd">
                    Received
                </Checkbox>
            </Row>);

        transcripts = this.state.borrowers.map((borrower, i) =>
            <Row key={i}>
                <Row>
                    &nbsp;
                    <ControlLabel>Borrower #{i+1}</ControlLabel>
                    <br />
                    &nbsp;
                    1040:
                    &nbsp;
                    <Checkbox
                        defaultChecked={borrower.tax_trans_ord}
                        inline
                        disabled={!this.state.isWorksheetEditable}
                        onChange={(e) => this.handleChangeBorrower(i, e)}
                        name="tax_trans_ord">
                        Ordered
                    </Checkbox>
                    {' '}
                    <Checkbox
                        defaultChecked={borrower.tax_trans_rcvd}
                        inline
                        disabled={!this.state.isWorksheetEditable}
                        onChange={(e) => this.handleChangeBorrower(i, e)}
                        name="tax_trans_rcvd">
                        Received
                    </Checkbox>
                    {' '}
                    <Checkbox
                        defaultChecked={borrower.tax_trans_na}
                        inline
                        disabled={!this.state.isWorksheetEditable}
                        onChange={(e) => this.handleChangeBorrower(i, e)}
                        name="tax_trans_na">
                        N/A(W2 only)
                    </Checkbox>
                </Row>
                <Row>
                    &nbsp;
                    W2:
                    &nbsp;
                    <Checkbox
                        defaultChecked={borrower.w2_trans_ord}
                        inline
                        disabled={!this.state.isWorksheetEditable}
                        onChange={(e) => this.handleChangeBorrower(i, e)}
                        name="w2_trans_ord">
                        Ordered
                    </Checkbox>
                    {' '}
                    <Checkbox
                        defaultChecked={borrower.w2_trans_rcvd}
                        inline
                        disabled={!this.state.isWorksheetEditable}
                        onChange={(e) => this.handleChangeBorrower(i, e)}
                        name="w2_trans_rcvd">
                        Received
                    </Checkbox>
                    {' '}
                    <Checkbox
                        defaultChecked={borrower.w2_trans_na}
                        inline
                        disabled={!this.state.isWorksheetEditable}
                        onChange={(e) => this.handleChangeBorrower(i, e)}
                        name="w2_trans_na">
                        N/A
                    </Checkbox>
                </Row>
            </Row>);

        if(!this.state.reos.length) {
            reoItem =
                <Row>
                    <Alert bsStyle="warning">No properties have been added for this loan.</Alert>
                </Row>
        } else {
            reoItem = this.state.reos.map((reo, i) =>
                <Row key={i}>
                    &nbsp;
                    <ControlLabel>REO #{i+1}</ControlLabel>
                    <br />
                    &nbsp;
                    Property:{' '}
                    <FormControl
                        type="text"
                        style={{ width: "250px"}}
                        value={reo.property || ''}
                        disabled={!this.state.isWorksheetEditable}
                        onChange={(e) => this.handleChangeReo(i, e)}
                        name="property"/>
                    &nbsp;&nbsp;&nbsp;
                    Status: {' '}
                    <FormControl
                        componentClass="select"
                        name="status"
                        value={reo.status}
                        disabled={!this.state.isWorksheetEditable || ''}
                        onChange={(e) => this.handleChangeReo(i, e)}>
                        <option value="none">...</option>
                        <option value="rental">rental</option>
                        <option value="investment">investment</option>
                    </FormControl>
                    &nbsp;&nbsp;&nbsp;
                    <Checkbox
                        defaultChecked={reo.deed}
                        inline
                        disabled={!this.state.isWorksheetEditable}
                        onChange={(e) => this.handleChangeReo(i, e)}
                        name="deed">
                        Deed
                    </Checkbox>
                    &nbsp;&nbsp;&nbsp;
                    <Checkbox
                        defaultChecked={reo.mortgage_stmnt}
                        inline
                        disabled={!this.state.isWorksheetEditable}
                        onChange={(e) => this.handleChangeReo(i, e)}
                        name="mortgage_stmnt">
                        Mortgage Statement
                    </Checkbox>
                    &nbsp;&nbsp;&nbsp;
                    <Checkbox
                        defaultChecked={reo.taxes}
                        inline
                        disabled={!this.state.isWorksheetEditable}
                        onChange={(e) => this.handleChangeReo(i, e)}
                        name="taxes">
                        Taxes
                    </Checkbox>
                    &nbsp;&nbsp;&nbsp;
                    <Checkbox
                        defaultChecked={reo.insurance}
                        inline
                        disabled={!this.state.isWorksheetEditable}
                        onChange={(e) => this.handleChangeReo(i, e)}
                        name="insurance">
                        Insurance
                    </Checkbox>
                    &nbsp;&nbsp;&nbsp;
                    <Checkbox
                        defaultChecked={reo.lease}
                        inline
                        disabled={!this.state.isWorksheetEditable}
                        onChange={(e) => this.handleChangeReo(i, e)}
                        name="lease">
                        Lease
                    </Checkbox>
                </Row>);
        }

        if(this.state.loanInfo['type'] === 'FHA') {
            fhaCaseAssign =
                <Row>
                    <h4 style={titles}>
                        <Button bsSize="xsmall"
                                onClick={() => this.setState({ fhaCaseAssign:true})}>
                            <Glyphicon glyph="comment" />
                        </Button>
                        <DisplayNotes
                            loan_id={this.state.worksheet[0].loan_id}
                            displayModal={this.state.fhaCaseAssign}
                            comments={this.state.comments}
                            users={this.props.users}
                            refreshComments={this.refreshComments}
                            title='FHA Case Assign Notes'
                            fieldName='FHA Case Assign'
                            modalName='fhaCaseAssign'
                            tabKey={3}
                            close={this.closeNotes} />
                        &nbsp;
                        Case# Assignment
                    </h4>
                    <Row>
                        &nbsp;
                        <Checkbox
                            defaultChecked={this.state.worksheet[0].fha_case_num_ord}
                            inline
                            disabled={!this.state.isWorksheetEditable}
                            onChange={this.handleChange}
                            name="fha_case_num_ord">
                            Ordered
                        </Checkbox>
                    </Row>
                    <Row>
                        &nbsp;
                        <Checkbox
                            defaultChecked={this.state.worksheet[0].fha_case_num_val}
                            inline
                            disabled={!this.state.isWorksheetEditable}
                            onChange={this.handleChange}
                            name="fha_case_num_val">
                            Borrower Validation
                        </Checkbox>
                    </Row>
                    <Row>
                        &nbsp;
                        Transferred?&nbsp;
                        <FormControl
                            componentClass="select"
                            name="fha_case_num_trans"
                            value={this.state.worksheet[0].fha_case_num_trans || ''}
                            disabled={!this.state.isWorksheetEditable}
                            onChange={this.handleChange}>
                            <option value="none">...</option>
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                        </FormControl>
                    </Row>
                </Row>
        }

        if(this.state.loanInfo['type'] === 'VA') {
            coe =
                <Row>
                    <h4 style={titles}>
                        <Button bsSize="xsmall"
                                onClick={() => this.setState({ coe:true})}>
                            <Glyphicon glyph="comment" />
                        </Button>
                        <DisplayNotes
                            loan_id={this.state.worksheet[0].loan_id}
                            displayModal={this.state.coe}
                            comments={this.state.comments}
                            users={this.props.users}
                            refreshComments={this.refreshComments}
                            title='COE Notes'
                            fieldName='COE'
                            modalName='coe'
                            tabKey={3}
                            close={this.closeNotes} />
                        &nbsp;
                        COE
                    </h4>
                    <Row>
                        &nbsp;
                        <Checkbox
                            defaultChecked={this.state.worksheet[0].coe_trans_req}
                            inline
                            disabled={!this.state.isWorksheetEditable}
                            onChange={this.handleChange}
                            name="coe_trans_req">
                            Requested
                        </Checkbox>
                    </Row>
                    <Row>
                        &nbsp;
                        <Checkbox
                            defaultChecked={this.state.worksheet[0].coe_trans_rcvd}
                            inline
                            disabled={!this.state.isWorksheetEditable}
                            onChange={this.handleChange}
                            name="coe_trans_rcvd">
                            Received
                        </Checkbox>
                    </Row>
                </Row>;
            novRequest =
                <Row>
                    <Col lg={3}>
                        <Row>
                            &nbsp;&nbsp;
                            <ControlLabel>NOV Request:</ControlLabel>
                        </Row>
                        <Row>
                            <Checkbox
                                defaultChecked={this.state.worksheet[0].nov_req}
                                inline
                                disabled={!this.state.isWorksheetEditable}
                                onChange={this.handleChange}
                                name="nov_req">
                                Requested
                            </Checkbox>
                        </Row>
                        <Row>
                            <Checkbox
                                defaultChecked={this.state.worksheet[0].nov_rcvd}
                                inline
                                disabled={!this.state.isWorksheetEditable}
                                onChange={this.handleChange}
                                name="nov_rcvd">
                                Received
                            </Checkbox>
                        </Row>
                    </Col>
                    <Col lg={9}>
                        <Row><br /></Row>
                        <Alert bsStyle="warning">Must be issued within 5 days of receiving app.</Alert>
                    </Col>
                </Row>
        }

        if(this.state.loanInfo['purpose'] === 'No Cash-Out Refi') {
            txCashOut =
                <Row>
                    <h4 style={titles}>
                        TX Cash Out Disclosure
                    </h4>
                    <Row>
                        &nbsp;
                        <Checkbox
                            defaultChecked={this.state.worksheet[0].tx_cash_req}
                            inline
                            disabled={!this.state.isWorksheetEditable}
                            onChange={this.handleChange}
                            name="tx_cash_req">
                            Requested
                        </Checkbox>
                    </Row>
                    <Row>
                        &nbsp;
                        <Checkbox
                            defaultChecked={this.state.worksheet[0].tx_cash_rcvd}
                            inline
                            disabled={!this.state.isWorksheetEditable}
                            onChange={this.handleChange}
                            name="tx_cash_rcvd">
                            Received
                        </Checkbox>
                    </Row>
                    <Row>
                        &nbsp;
                        <Checkbox
                            defaultChecked={this.state.worksheet[0].tx_cash_na}
                            inline
                            disabled={!this.state.isWorksheetEditable}
                            onChange={this.handleChange}
                            name="tx_cash_na">
                            N/A
                        </Checkbox>
                    </Row>
                </Row>;
            mortPayoffs =
                <Row>
                    <h4 style={titles}>
                        Mortgage Payoffs
                    </h4>
                    <Row>
                        &nbsp;
                        <Checkbox
                            defaultChecked={this.state.worksheet[0].mort_payoff_req}
                            inline
                            disabled={!this.state.isWorksheetEditable}
                            onChange={this.handleChange}
                            name="mort_payoff_req">
                            Requested
                        </Checkbox>
                    </Row>
                    <Row>
                        &nbsp;
                        <Checkbox
                            defaultChecked={this.state.worksheet[0].mort_payoff_rcvd}
                            inline
                            disabled={!this.state.isWorksheetEditable}
                            onChange={this.handleChange}
                            name="mort_payoff_rcvd">
                            Received
                        </Checkbox>
                    </Row>
                    <Row>
                        &nbsp;
                        <Checkbox
                            defaultChecked={this.state.worksheet[0].mort_payoff_na}
                            inline
                            disabled={!this.state.isWorksheetEditable}
                            onChange={this.handleChange}
                            name="mort_payoff_na">
                            N/A
                        </Checkbox>
                    </Row>
                </Row>;
        }

        if(this.state.loanInfo['purpose'] === 'Cash-Out Refi') {
            mortPayoffs =
                <Row>
                    <h4 style={titles}>
                        Mortgage Payoffs
                    </h4>
                    <Row>
                        &nbsp;
                        <Checkbox
                            defaultChecked={this.state.worksheet[0].mort_payoff_req}
                            inline
                            disabled={!this.state.isWorksheetEditable}
                            onChange={this.handleChange}
                            name="mort_payoff_req">
                            Requested
                        </Checkbox>
                    </Row>
                    <Row>
                        &nbsp;
                        <Checkbox
                            defaultChecked={this.state.worksheet[0].mort_payoff_rcvd}
                            inline
                            disabled={!this.state.isWorksheetEditable}
                            onChange={this.handleChange}
                            name="mort_payoff_rcvd">
                            Received
                        </Checkbox>
                    </Row>
                    <Row>
                        &nbsp;
                        <Checkbox
                            defaultChecked={this.state.worksheet[0].mort_payoff_na}
                            inline
                            disabled={!this.state.isWorksheetEditable}
                            onChange={this.handleChange}
                            name="mort_payoff_na">
                            N/A
                        </Checkbox>
                    </Row>
                </Row>;
        }

        if(!this.state.worksheet[0].final_na) {
            final =
                <Row>
                    <Row>
                        &nbsp;
                        <Checkbox
                            defaultChecked={this.state.worksheet[0].final_ord}
                            inline
                            disabled={!this.state.isWorksheetEditable}
                            onChange={this.handleChange}
                            name="final_ord">
                            Ordered
                        </Checkbox>
                        <AddDate
                            displayModal={this.state.final_ord_date}
                            title='Final Inspection Ordered Date'
                            modalName='final_ord_date'
                            value={this.state.worksheet[0].final_ord_date}
                            handleDateChange={this.handleDatePickerChange}
                            close={this.closeNotes} />
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        Due Date: {' '}
                        <label onClick={e => e.preventDefault()}>
                            <DatePicker
                                className="form-control"
                                disabled={!this.state.isWorksheetEditable}
                                placeholderText="Please select a date."
                                selected={(this.state.worksheet[0].final_due_date) ? moment(this.state.worksheet[0].final_due_date) : null}
                                onChange={(e) => this.handleDatePickerChange('final_due_date', e)}
                            />
                        </label>
                    </Row>
                    <Row>
                        &nbsp;
                        <ControlLabel>Paid:</ControlLabel>
                        &nbsp;&nbsp;
                        <Checkbox
                            defaultChecked={this.state.worksheet[0].final_paid_poc}
                            inline
                            disabled={!this.state.isWorksheetEditable}
                            onChange={this.handleChange}
                            name="final_paid_poc">
                            POC
                        </Checkbox>
                        &nbsp;
                        <Checkbox
                            defaultChecked={this.state.worksheet[0].final_paid_pac}
                            inline
                            disabled={!this.state.isWorksheetEditable}
                            onChange={this.handleChange}
                            name="final_paid_pac">
                            PAC
                        </Checkbox>
                    </Row>
                    <Row>
                        &nbsp;
                        <Checkbox
                            defaultChecked={this.state.worksheet[0].final_rcvd}
                            inline
                            disabled={!this.state.isWorksheetEditable}
                            onChange={this.handleChange}
                            name="final_rcvd">
                            Received
                        </Checkbox>
                    </Row>
                </Row>
        } else {
            final =
                <HelpBlock>Please deselect N/A to view fields.</HelpBlock>
        }

        return (
            <Form inline onSubmit={this.updateTaskList}>
                <br />
                <Button
                    bsStyle="primary"
                    bsSize="small"
                    disabled={this.state.isWorksheetEditable}
                    onClick={this.allowTaskListEdit}>
                    Edit
                </Button>{' '}
                {saveButton}{' '}
                {cancelButton}{' '}
                {countdownTimer}
                {userEditing}
                <br />
                <br />
                <Row>
                    <Col lg={3}>
                        <h4 style={titles}>
                            <Button bsSize="xsmall"
                                    onClick={() => this.setState({ titleWork:true})}>
                                <Glyphicon glyph="comment" />
                            </Button>
                            <DisplayNotes
                                loan_id={this.state.worksheet[0].loan_id}
                                displayModal={this.state.titleWork}
                                comments={this.state.comments}
                                users={this.props.users}
                                refreshComments={this.refreshComments}
                                title='Title Work Notes'
                                fieldName='Title Work'
                                modalName='titleWork'
                                tabKey={3}
                                close={this.closeNotes} />
                            &nbsp;
                            Title Work
                        </h4>
                        <Row>
                            &nbsp;
                            <Checkbox
                                defaultChecked={this.state.worksheet[0].title_work_req}
                                inline
                                disabled={!this.state.isWorksheetEditable}
                                onChange={this.handleChange}
                                name="title_work_req">
                                Requested
                            </Checkbox>
                            <AddDate
                                displayModal={this.state.title_work_req_date}
                                title='Title Work Requested Date'
                                modalName='title_work_req_date'
                                value={this.state.worksheet[0].title_work_req_date}
                                handleDateChange={this.handleDatePickerChange}
                                close={this.closeNotes} />
                        </Row>
                        <Row>
                            &nbsp;
                            <Checkbox
                                defaultChecked={this.state.worksheet[0].title_work_rcvd}
                                inline
                                disabled={!this.state.isWorksheetEditable}
                                onChange={this.handleChange}
                                name="title_work_rcvd">
                                Received
                            </Checkbox>
                        </Row>
                        <Row>
                            &nbsp;&nbsp;&nbsp;
                            <ControlLabel>Received Items:</ControlLabel>
                        </Row>
                        <Row>
                            &nbsp;
                            <Checkbox
                                defaultChecked={this.state.worksheet[0].title_work_rcvd_comm}
                                inline
                                disabled={!this.state.isWorksheetEditable}
                                onChange={this.handleChange}
                                name="title_work_rcvd_comm">
                                Title Commitment
                            </Checkbox>
                        </Row>
                        <Row>
                            &nbsp;
                            <Checkbox
                                defaultChecked={this.state.worksheet[0].title_work_rcvd_cpl}
                                inline
                                disabled={!this.state.isWorksheetEditable}
                                onChange={this.handleChange}
                                name="title_work_rcvd_cpl">
                                CPL
                            </Checkbox>
                            &nbsp;&nbsp;&nbsp;
                            <Checkbox
                                defaultChecked={this.state.worksheet[0].title_work_rcvd_title}
                                inline
                                disabled={!this.state.isWorksheetEditable}
                                onChange={this.handleChange}
                                name="title_work_rcvd_title">
                                24 Month Chain of Title
                            </Checkbox>
                        </Row>
                        <Row>
                            &nbsp;
                            <Checkbox
                                defaultChecked={this.state.worksheet[0].title_work_rcvd_tax}
                                inline
                                disabled={!this.state.isWorksheetEditable}
                                onChange={this.handleChange}
                                name="title_work_rcvd_tax">
                                Tax Cert
                            </Checkbox>
                            &nbsp;&nbsp;&nbsp;
                            <Checkbox
                                defaultChecked={this.state.worksheet[0].title_work_rcvd_eo}
                                inline
                                disabled={!this.state.isWorksheetEditable}
                                onChange={this.handleChange}
                                name="title_work_rcvd_eo">
                                E & O
                            </Checkbox>
                        </Row>
                        <Row>
                            &nbsp;
                            <Checkbox
                                defaultChecked={this.state.worksheet[0].title_work_rcvd_wiring}
                                inline
                                disabled={!this.state.isWorksheetEditable}
                                onChange={this.handleChange}
                                name="title_work_rcvd_wiring">
                                Wiring Instr.
                            </Checkbox>
                            &nbsp;&nbsp;&nbsp;
                            <Checkbox
                                defaultChecked={this.state.worksheet[0].title_work_rcvd_prelim}
                                inline
                                disabled={!this.state.isWorksheetEditable}
                                onChange={this.handleChange}
                                name="title_work_rcvd_prelim">
                                Prelim CD
                            </Checkbox>
                        </Row>
                    </Col>
                    <Col lg={5}>
                        <h4 style={titles}>
                            <Button bsSize="xsmall"
                                    onClick={() => this.setState({ survey:true})}>
                                <Glyphicon glyph="comment" />
                            </Button>
                            <DisplayNotes
                                loan_id={this.state.worksheet[0].loan_id}
                                displayModal={this.state.survey}
                                comments={this.state.comments}
                                users={this.props.users}
                                refreshComments={this.refreshComments}
                                title='Survey Notes'
                                fieldName='Survey'
                                modalName='survey'
                                tabKey={3}
                                close={this.closeNotes} />
                            &nbsp;
                            Survey
                        </h4>
                        <Row>
                            &nbsp;
                            <Checkbox
                                defaultChecked={this.state.worksheet[0].survey_req}
                                inline
                                disabled={!this.state.isWorksheetEditable}
                                onChange={this.handleChange}
                                name="survey_req">
                                Requested Status
                            </Checkbox>
                        </Row>
                        <Row>
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            At who's expense: {' '}
                            <FormControl
                                componentClass="select"
                                name="survey_expense"
                                value={this.state.worksheet[0].survey_expense || ''}
                                disabled={!this.state.isWorksheetEditable}
                                onChange={this.handleChange}>
                                <option value="none">...</option>
                                <option value="buyer">buyer</option>
                                <option value="seller">seller</option>
                            </FormControl>
                        </Row>
                        <Row>
                            &nbsp;
                            <Checkbox
                                defaultChecked={this.state.worksheet[0].survey_ord}
                                inline
                                disabled={!this.state.isWorksheetEditable}
                                onChange={this.handleChange}
                                name="survey_ord">
                                Ordered
                            </Checkbox>
                            <AddDate
                                displayModal={this.state.survey_ord_date}
                                title='Survey Ordered Date'
                                modalName='survey_ord_date'
                                value={this.state.worksheet[0].survey_ord_date}
                                handleDateChange={this.handleDatePickerChange}
                                close={this.closeNotes} />
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            &nbsp;&nbsp;
                            Due Date: {' '}
                            <label onClick={e => e.preventDefault()}>
                                <DatePicker
                                    className="form-control"
                                    disabled={!this.state.isWorksheetEditable}
                                    placeholderText="Please select a date."
                                    selected={(this.state.worksheet[0].survey_ord_due_date) ? moment(this.state.worksheet[0].survey_ord_due_date) : null}
                                    onChange={(e) => this.handleDatePickerChange('survey_ord_due_date', e)}
                                />
                            </label>
                        </Row>
                        <Row>
                            &nbsp;
                            <Checkbox
                                defaultChecked={this.state.worksheet[0].survey_rcvd}
                                inline
                                disabled={!this.state.isWorksheetEditable}
                                onChange={this.handleChange}
                                name="survey_rcvd">
                                Received
                            </Checkbox>
                        </Row>
                    </Col>
                    <Col lg={4}>
                        <h4 style={titles}>
                            <Button bsSize="xsmall"
                                    onClick={() => this.setState({ hazardInsurance:true})}>
                                <Glyphicon glyph="comment" />
                            </Button>
                            <DisplayNotes
                                loan_id={this.state.worksheet[0].loan_id}
                                displayModal={this.state.hazardInsurance}
                                comments={this.state.comments}
                                users={this.props.users}
                                refreshComments={this.refreshComments}
                                title='Hazard Insurance Notes'
                                fieldName='Hazard Insurance'
                                modalName='hazardInsurance'
                                tabKey={3}
                                close={this.closeNotes} />
                            &nbsp;
                            Hazard Insurance
                        </h4>
                        <Row>
                            &nbsp;
                            <ControlLabel>Quote:</ControlLabel>
                            <br />
                            &nbsp;
                            <Checkbox
                                defaultChecked={this.state.worksheet[0].haz_ins_quote_req}
                                inline
                                disabled={!this.state.isWorksheetEditable}
                                onChange={this.handleChange}
                                name="haz_ins_quote_req">
                                Requested
                            </Checkbox>
                            <AddDate
                                displayModal={this.state.haz_ins_quote_req_date}
                                title='Quote Requested Date'
                                modalName='haz_ins_quote_req_date'
                                value={this.state.worksheet[0].haz_ins_quote_req_date}
                                handleDateChange={this.handleDatePickerChange}
                                close={this.closeNotes} />
                            {' '}
                            <Checkbox
                                defaultChecked={this.state.worksheet[0].haz_ins_quote_rcvd}
                                inline
                                disabled={!this.state.isWorksheetEditable}
                                onChange={this.handleChange}
                                name="haz_ins_quote_rcvd">
                                Received
                            </Checkbox>
                            {' '}
                            <Checkbox
                                defaultChecked={this.state.worksheet[0].haz_ins_quote_sent}
                                inline
                                disabled={!this.state.isWorksheetEditable}
                                onChange={this.handleChange}
                                name="haz_ins_quote_sent">
                                Sent
                            </Checkbox>
                            <AddDate
                                displayModal={this.state.haz_ins_quote_sent_date}
                                title='Quote Sent Date'
                                modalName='haz_ins_quote_sent_date'
                                value={this.state.worksheet[0].haz_ins_quote_sent_date}
                                handleDateChange={this.handleDatePickerChange}
                                close={this.closeNotes} />
                            {' '}
                            <Checkbox
                                defaultChecked={this.state.worksheet[0].haz_ins_quote_na}
                                inline
                                disabled={!this.state.isWorksheetEditable}
                                onChange={this.handleChange}
                                name="haz_ins_quote_na">
                                N/A
                            </Checkbox>
                        </Row>
                        <br />
                        <Row>
                            &nbsp;
                            <ControlLabel>Binder:</ControlLabel>
                            <br />
                            &nbsp;
                            <Checkbox
                                defaultChecked={this.state.worksheet[0].haz_ins_binder_req}
                                inline
                                disabled={!this.state.isWorksheetEditable}
                                onChange={this.handleChange}
                                name="haz_ins_binder_req">
                                Requested
                            </Checkbox>
                            <AddDate
                                displayModal={this.state.haz_ins_binder_req_date}
                                title='Binder Requested Date'
                                modalName='haz_ins_binder_req_date'
                                value={this.state.worksheet[0].haz_ins_binder_req_date}
                                handleDateChange={this.handleDatePickerChange}
                                close={this.closeNotes} />
                            {' '}
                            <Checkbox
                                defaultChecked={this.state.worksheet[0].haz_ins_binder_rcvd}
                                inline
                                disabled={!this.state.isWorksheetEditable}
                                onChange={this.handleChange}
                                name="haz_ins_binder_rcvd">
                                Received
                            </Checkbox>
                        </Row>
                        <Row>
                            &nbsp;
                            Effective Date: {' '}
                            <label onClick={e => e.preventDefault()}>
                                <DatePicker
                                    className="form-control"
                                    disabled={!this.state.isWorksheetEditable}
                                    placeholderText="Please select a date."
                                    selected={(this.state.worksheet[0].haz_ins_binder_date) ? moment(this.state.worksheet[0].haz_ins_binder_date) : null}
                                    onChange={(e) => this.handleDatePickerChange('haz_ins_binder_date', e)}
                                />
                            </label>
                        </Row>
                    </Col>
                </Row>
                <Row><br /></Row>
                <Row>
                    <Col lg={6}>
                        <h4 style={titles}>
                            <Button bsSize="xsmall"
                                    onClick={() => this.setState({ appraisal:true})}>
                                <Glyphicon glyph="comment" />
                            </Button>
                            <DisplayNotes
                                loan_id={this.state.worksheet[0].loan_id}
                                displayModal={this.state.appraisal}
                                comments={this.state.comments}
                                users={this.props.users}
                                refreshComments={this.refreshComments}
                                title='Appraisal Notes'
                                fieldName='Appraisal'
                                modalName='appraisal'
                                tabKey={3}
                                close={this.closeNotes} />
                            &nbsp;
                            Appraisal
                        </h4>
                        <Row>
                            &nbsp;
                            <Checkbox
                                defaultChecked={this.state.worksheet[0].appraisal_ord}
                                inline
                                disabled={!this.state.isWorksheetEditable}
                                onChange={this.handleChange}
                                name="appraisal_ord">
                                Ordered
                            </Checkbox>
                            <AddDate
                                displayModal={this.state.appraisal_ord_date}
                                title='Appraisal Ordered Date'
                                modalName='appraisal_ord_date'
                                value={this.state.worksheet[0].appraisal_ord_date}
                                handleDateChange={this.handleDatePickerChange}
                                close={this.closeNotes} />
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            &nbsp;&nbsp;
                            Due Date: {' '}
                            <label onClick={e => e.preventDefault()}>
                                <DatePicker
                                    className="form-control"
                                    disabled={!this.state.isWorksheetEditable}
                                    placeholderText="Please select a date."
                                    selected={(this.state.worksheet[0].appraisal_due_date) ? moment(this.state.worksheet[0].appraisal_due_date) : null}
                                    onChange={(e) => this.handleDatePickerChange('appraisal_due_date', e)}
                                />
                            </label>
                        </Row>
                        <Row>
                            &nbsp;
                            <Checkbox
                                defaultChecked={this.state.worksheet[0].appraisal_paid}
                                inline
                                disabled={!this.state.isWorksheetEditable}
                                onChange={this.handleChange}
                                name="appraisal_paid">
                                Paid
                            </Checkbox>
                        </Row>
                        <Row>
                            &nbsp;
                            <Checkbox
                                defaultChecked={this.state.worksheet[0].appraisal_rcvd}
                                inline
                                disabled={!this.state.isWorksheetEditable}
                                onChange={this.handleChange}
                                name="appraisal_rcvd">
                                Received
                            </Checkbox>
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            Value: {' '}
                            <InputGroup>
                                <InputGroup.Addon>$</InputGroup.Addon>
                                    <FormControl
                                    type="text"
                                    style={{ width: "80px"}}
                                    value={this.state.worksheet[0].appraisal_value || ''}
                                    disabled={!this.state.isWorksheetEditable}
                                    onChange={this.handleChange}
                                    name="appraisal_value"/>
                            </InputGroup>
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            Status: {' '}
                            <FormControl
                                componentClass="select"
                                name="appraisal_status"
                                value={this.state.worksheet[0].appraisal_status || ''}
                                disabled={!this.state.isWorksheetEditable}
                                onChange={this.handleChange}>
                                <option value="none">...</option>
                                <option value="as is">as is</option>
                                <option value="sub to">sub to</option>
                            </FormControl>
                        </Row>
                        <Row>
                            &nbsp;
                            <Checkbox
                                defaultChecked={this.state.worksheet[0].appraisal_disclosed}
                                inline
                                disabled={!this.state.isWorksheetEditable}
                                onChange={this.handleChange}
                                name="appraisal_disclosed">
                                Disclosed
                            </Checkbox>
                        </Row>
                        {novRequest}
                    </Col>
                    <Col lg={6}>
                        <h4 style={titles}>
                            <Button bsSize="xsmall"
                                    onClick={() => this.setState({ final:true})}>
                                <Glyphicon glyph="comment" />
                            </Button>
                            <DisplayNotes
                                loan_id={this.state.worksheet[0].loan_id}
                                displayModal={this.state.final}
                                comments={this.state.comments}
                                users={this.props.users}
                                refreshComments={this.refreshComments}
                                title='Final Notes'
                                fieldName='Final'
                                modalName='final'
                                tabKey={3}
                                close={this.closeNotes} />
                            &nbsp;
                            Final
                            &nbsp;&nbsp;&nbsp;
                            <Checkbox
                                defaultChecked={this.state.worksheet[0].final_na}
                                inline
                                disabled={!this.state.isWorksheetEditable}
                                onChange={this.handleChange}
                                name="final_na">
                                N/A
                            </Checkbox>
                        </h4>
                        {final}
                    </Col>
                </Row>
                <Row><br /></Row>
                <Row>
                    <Col lg={4}>
                        <h4 style={titles}>
                            <Button bsSize="xsmall"
                                    onClick={() => this.setState({ currentVOE:true})}>
                                <Glyphicon glyph="comment" />
                            </Button>
                            <DisplayNotes
                                loan_id={this.state.worksheet[0].loan_id}
                                displayModal={this.state.currentVOE}
                                comments={this.state.comments}
                                users={this.props.users}
                                refreshComments={this.refreshComments}
                                title='Current VOE Notes'
                                fieldName='Current VOE'
                                modalName='currentVOE'
                                tabKey={3}
                                close={this.closeNotes} />
                            &nbsp;
                            Current VOE
                            &nbsp;&nbsp;&nbsp;
                            <Checkbox
                                defaultChecked={this.state.worksheet[0].voe_curr_emp_na}
                                inline
                                disabled={!this.state.isWorksheetEditable}
                                onChange={this.handleChange}
                                name="voe_curr_emp_na">
                                N/A
                            </Checkbox>
                        </h4>
                        <Row>
                            {currentVOE}
                        </Row>
                    </Col>
                    <Col lg={4}>
                        <h4 style={titles}>
                            <Button bsSize="xsmall"
                                    onClick={() => this.setState({ priorVOE:true})}>
                                <Glyphicon glyph="comment" />
                            </Button>
                            <DisplayNotes
                                loan_id={this.state.worksheet[0].loan_id}
                                displayModal={this.state.priorVOE}
                                comments={this.state.comments}
                                users={this.props.users}
                                refreshComments={this.refreshComments}
                                title='Prior VOE Notes'
                                fieldName='Prior VOE'
                                modalName='priorVOE'
                                tabKey={3}
                                close={this.closeNotes} />
                            &nbsp;
                            Prior VOE
                            &nbsp;&nbsp;&nbsp;
                            <Checkbox
                                defaultChecked={this.state.worksheet[0].voe_prev_emp_na}
                                inline
                                disabled={!this.state.isWorksheetEditable}
                                onChange={this.handleChange}
                                name="voe_prev_emp_na">
                                N/A
                            </Checkbox>
                        </h4>
                        <Row>
                            {priorVOE}
                        </Row>
                    </Col>
                    <Col lg={4}>
                        <h4 style={titles}>
                            <Button bsSize="xsmall"
                                    onClick={() => this.setState({ residualIncome:true})}>
                                <Glyphicon glyph="comment" />
                            </Button>
                            <DisplayNotes
                                loan_id={this.state.worksheet[0].loan_id}
                                displayModal={this.state.residualIncome}
                                comments={this.state.comments}
                                users={this.props.users}
                                refreshComments={this.refreshComments}
                                title='Residual Income Notes'
                                fieldName='Residual Income'
                                modalName='residualIncome'
                                tabKey={3}
                                close={this.closeNotes} />
                            &nbsp;
                            Residual Income
                            {' '}
                            <OverlayTrigger
                                trigger="click"
                                rootClose
                                placement="top"
                                overlay={resIncomePopOver}
                            >
                                <Button bsSize="xsmall">
                                    <Glyphicon glyph="list-alt" />
                                </Button>
                            </OverlayTrigger>
                        </h4>
                        &nbsp;&nbsp;
                        <InputGroup>
                            <InputGroup.Addon>$</InputGroup.Addon>
                            <FormControl
                                type="text"
                                style={{ width: "120px"}}
                                value={this.state.worksheet[0].res_income_comp || ''}
                                disabled={!this.state.isWorksheetEditable}
                                onChange={this.handleChange}
                                name="res_income_comp"/>
                        </InputGroup>
                        &nbsp;&nbsp;&nbsp;&nbsp;
                        <Checkbox
                            defaultChecked={this.state.worksheet[0].res_income_na}
                            inline
                            disabled={!this.state.isWorksheetEditable}
                            onChange={this.handleChange}
                            name="res_income_na">
                            N/A
                        </Checkbox>
                    </Col>
                </Row>
                <Row><br /></Row>
                <Row>
                    <Col lg={4}>
                        <h4 style={titles}>
                            <Button bsSize="xsmall"
                                    onClick={() => this.setState({ ssValidation:true})}>
                                <Glyphicon glyph="comment" />
                            </Button>
                            <DisplayNotes
                                loan_id={this.state.worksheet[0].loan_id}
                                displayModal={this.state.ssValidation}
                                comments={this.state.comments}
                                users={this.props.users}
                                refreshComments={this.refreshComments}
                                title='SS Validation Notes'
                                fieldName='SS Validation'
                                modalName='ssValidation'
                                tabKey={3}
                                close={this.closeNotes} />
                            &nbsp;
                            SS Validation
                        </h4>
                        <Row>
                            {ssValidation}
                        </Row>
                    </Col>
                    <Col lg={5}>
                        <h4 style={titles}>
                            <Button bsSize="xsmall"
                                    onClick={() => this.setState({ transcripts:true})}>
                                <Glyphicon glyph="comment" />
                            </Button>
                            <DisplayNotes
                                loan_id={this.state.worksheet[0].loan_id}
                                displayModal={this.state.transcripts}
                                comments={this.state.comments}
                                users={this.props.users}
                                refreshComments={this.refreshComments}
                                title='Transcripts Notes'
                                fieldName='Transcripts'
                                modalName='transcripts'
                                tabKey={3}
                                close={this.closeNotes} />
                            &nbsp;
                            Transcripts
                        </h4>
                        <Row>
                            {transcripts}
                        </Row>
                    </Col>
                    <Col lg={3}>
                        <h4 style={titles}>
                            <Button bsSize="xsmall"
                                    onClick={() => this.setState({ fraudguard:true})}>
                                <Glyphicon glyph="comment" />
                            </Button>
                            <DisplayNotes
                                loan_id={this.state.worksheet[0].loan_id}
                                displayModal={this.state.fraudguard}
                                comments={this.state.comments}
                                users={this.props.users}
                                refreshComments={this.refreshComments}
                                title='Fraudguard Notes'
                                fieldName='Fraudguard'
                                modalName='fraudguard'
                                tabKey={3}
                                close={this.closeNotes} />
                            &nbsp;
                            Fraudguard
                        </h4>
                        <Row>
                            &nbsp;
                            <Checkbox
                                defaultChecked={this.state.worksheet[0].fraudguard_run}
                                inline
                                disabled={!this.state.isWorksheetEditable}
                                onChange={this.handleChange}
                                name="fraudguard_run">
                                Run
                            </Checkbox>
                        </Row>
                        <Row>
                            &nbsp;
                            <Checkbox
                                defaultChecked={this.state.worksheet[0].fraudguard_cleared}
                                inline
                                disabled={!this.state.isWorksheetEditable}
                                onChange={this.handleChange}
                                name="fraudguard_cleared">
                                Cleared
                            </Checkbox>
                        </Row>
                    </Col>
                </Row>
                <Row><br /></Row>
                <Row>
                    <Col lg={3}>
                        <h4>
                            <Checkbox
                                defaultChecked={this.state.worksheet[0].usps}
                                inline
                                disabled={!this.state.isWorksheetEditable}
                                onChange={this.handleChange}
                                name="usps">
                                <div style={titles}>
                                    USPS
                                    &nbsp;
                                    <Button bsSize="xsmall"
                                            onClick={() => this.setState({ usps:true})}>
                                        <Glyphicon glyph="comment" />
                                    </Button>
                                    &nbsp;&nbsp;&nbsp;
                                    <DisplayNotes
                                        loan_id={this.state.worksheet[0].loan_id}
                                        displayModal={this.state.usps}
                                        comments={this.state.comments}
                                        users={this.props.users}
                                        refreshComments={this.refreshComments}
                                        title='USPS Notes'
                                        fieldName='USPS'
                                        modalName='usps'
                                        tabKey={3}
                                        close={this.closeNotes} />
                                </div>
                            </Checkbox>
                        </h4>
                    </Col>
                    <Col lg={3}>
                        <h4>
                            <Checkbox
                                defaultChecked={this.state.worksheet[0].nmls}
                                inline
                                disabled={!this.state.isWorksheetEditable}
                                onChange={this.handleChange}
                                name="nmls">
                                <div style={titles}>
                                    NMLS
                                    &nbsp;
                                    <Button bsSize="xsmall"
                                            onClick={() => this.setState({ nmls:true})}>
                                        <Glyphicon glyph="comment" />
                                    </Button>
                                    &nbsp;&nbsp;&nbsp;
                                    <DisplayNotes
                                        loan_id={this.state.worksheet[0].loan_id}
                                        displayModal={this.state.nmls}
                                        comments={this.state.comments}
                                        users={this.props.users}
                                        refreshComments={this.refreshComments}
                                        title='NMLS Notes'
                                        fieldName='NMLS'
                                        modalName='nmls'
                                        tabKey={3}
                                        close={this.closeNotes} />
                                </div>
                            </Checkbox>
                        </h4>
                    </Col>
                    <Col lg={3}>
                        <h4 style={titles}>
                            <Button bsSize="xsmall"
                                    onClick={() => this.setState({ floodCert:true})}>
                                <Glyphicon glyph="comment" />
                            </Button>
                            <DisplayNotes
                                loan_id={this.state.worksheet[0].loan_id}
                                displayModal={this.state.floodCert}
                                comments={this.state.comments}
                                users={this.props.users}
                                refreshComments={this.refreshComments}
                                title='Flood Cert Notes'
                                fieldName='Flood Cert'
                                modalName='floodCert'
                                tabKey={3}
                                close={this.closeNotes} />
                            &nbsp;
                            Flood Cert
                        </h4>
                        <Row>
                            &nbsp;
                            <Checkbox
                                defaultChecked={this.state.worksheet[0].flood_cert_in_zone}
                                inline
                                disabled={!this.state.isWorksheetEditable}
                                onChange={this.handleChange}
                                name="flood_cert_in_zone">
                                Floodzone
                            </Checkbox>
                        </Row>
                        <Row>
                            &nbsp;
                            <Checkbox
                                defaultChecked={this.state.worksheet[0].flood_cert_out_zone}
                                inline
                                disabled={!this.state.isWorksheetEditable}
                                onChange={this.handleChange}
                                name="flood_cert_out_zone">
                                Not Floodzone
                            </Checkbox>
                        </Row>
                    </Col>
                    <Col lg={3}>
                        {fhaCaseAssign}
                        {coe}
                    </Col>
                </Row>
                <Row><br /></Row>
                <Row>
                    <Col lg={3}>
                        {mortPayoffs}
                    </Col>
                    <Col lg={3}>
                        {txCashOut}
                    </Col>
                </Row>
                <Row><br /></Row>
                <Row>
                    <Col lg={12}>
                        <h4 style={titles}>
                            <Button bsSize="xsmall"
                                    onClick={() => this.setState({ reo:true})}>
                                <Glyphicon glyph="comment" />
                            </Button>
                            <DisplayNotes
                                loan_id={this.state.worksheet[0].loan_id}
                                displayModal={this.state.reo}
                                comments={this.state.comments}
                                users={this.props.users}
                                refreshComments={this.refreshComments}
                                title='REO Notes'
                                fieldName='REO'
                                modalName='reo'
                                tabKey={3}
                                close={this.closeNotes} />
                            &nbsp;
                            REO
                            &nbsp;
                            <Button
                                bsSize="small"
                                onClick={() => this.setState({ showModalProperties:true})}>
                                <strong>Properties</strong>
                            </Button>
                        </h4>
                        <Modal show={this.state.showModalProperties}
                               onHide={() => this.setState({ showModalProperties:false})}>
                            <Modal.Header closeButton>
                                <Modal.Title>Manage Properties</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <Properties
                                    loanID={this.state.worksheet[0].loan_id}
                                    reos={this.state.reos}
                                    refresh={this.refreshReos}/>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button onClick={() => this.setState({ showModalProperties:false})}>Close</Button>
                            </Modal.Footer>
                        </Modal>
                        {reoItem}
                    </Col>
                </Row>
            </Form>

        );
    }
}