import React, { Component } from 'react';
import {
    Form, Checkbox, FormControl, Popover,
    Button, Row, Col, HelpBlock, OverlayTrigger,
    ControlLabel, Alert, Modal, Glyphicon
    } from 'react-bootstrap';
import axios from 'axios';
import CountdownTimer from './WorksheetComponents/CountdownTimer';
import Borrowers from './WorksheetComponents/Borrowers';
import DisplayNotes from './CommentComponents/DisplayNotes';
var moment = require('moment');

var titles = {
    fontWeight: 'bold',
};

var modalSize = {
    width: '200px'
};

var rowTopBorder = {
    borderTopStyle: 'solid'
};

const layeredRiskPopOver = (
    <Popover id="res_income">
        <div style={{ width: 'auto', height: 'auto' }}>
            <embed type="image/png"
                   src="/images/layered_risk.png"
                   width="800"
                   height="256"/>
        </div>
    </Popover>
);

function check_holiday (dt_date) {
    // check simple dates (month/date - no leading zeroes)
    var n_date = dt_date.getDate();
    var n_month = dt_date.getMonth() + 1;
    var s_date1 = n_month + '/' + n_date;
    var s_year = dt_date.getFullYear();
    var s_day = dt_date.getDay(); // day of the week 0-6

    switch(s_date1){
        case '1/1':
            return true; //"New Year's";
        case '7/4':
            return true; //"Independence Day";
        case '11/11':
            return true; //"Veterans Day";
        case '12/25':
            return true; //"Christmas";

    }
    if (s_day == 1){  // Monday after
        switch(s_date1){
            case '1/2':
                return true; //"New Year's";
            case '7/5':
                return true; //"Independence Day";
            case '12/26':
                return true; //"Christmas";
        }
    }

    // weekday from beginning of the month (month/num/day)
    var n_wday = dt_date.getDay();
    var n_wnum = Math.floor((n_date - 1) / 7) + 1;
    var s_date2 = n_month + '/' + n_wnum + '/' + n_wday;
    switch(s_date2){
        case '1/3/1':
            return true; //"ML King Birthday";
        case '2/3/1':
            return true; //"President's Day";
        case '9/1/1':
            return true; //"Labor Day";
        case '10/2/1':
            return true; //"Columbus Day";
        case '11/4/4':
            return true; //"Thanksgiving";
    }

    // weekday number from end of the month (month/num/day)
    var dt_temp = new Date (dt_date);
    dt_temp.setDate(1);
    dt_temp.setMonth(dt_temp.getMonth() + 1);
    dt_temp.setDate(dt_temp.getDate() - 1);
    n_wnum = Math.floor((dt_temp.getDate() - n_date - 1) / 7) + 1;
    var s_date3 = n_month + '/' + n_wnum + '/' + n_wday;
    if (   s_date3 == '5/1/1'  // Memorial Day, last Monday in May
    ) return true; //'Memorial Day';

    return false;
}

function subtractWeekdays(date, days) {
    date = moment(date); // use a clone
    while (days > 0) {
        date = date.subtract(1, 'days');
        // decrease "days" only if it's a weekday.
        if(check_holiday(date.toDate())) {
            continue;
        }
        if (date.isoWeekday() !== 7) {
            days -= 1;
        }
    }
    return date;
}

export default class OfficerWorksheet extends Component {
    constructor(props) {
        super(props);
        this.state = {
            worksheet: this.props.worksheet,
            inputChanged: this.props.inputChanged,
            borrowers: this.props.borrowers,
            loanInfo: this.props.loanInfo,
            comments: this.props.comments,
            notesField: this.props.notesField,
            userEditingWorksheet: null,
            isWorksheetEditable: false,
            editStartTime: null,
            closingDiscDate: null
        };
        this.onUnload = this.onUnload.bind(this);
        this.getTaskLockedUser = this.getTaskLockedUser.bind(this);
        this.allowTaskListEdit = this.allowTaskListEdit.bind(this);
        this.updateTaskList = this.updateTaskList.bind(this);
        this.cancelUpdate = this.cancelUpdate.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleChangeBorrower = this.handleChangeBorrower.bind(this);
        this.refreshBorrowers = this.refreshBorrowers.bind(this);
        this.getClosingDiscDate = this.getClosingDiscDate.bind(this);
        this.refreshComments = this.refreshComments.bind(this);
        this.closeNotes = this.closeNotes.bind(this);
    }

    componentDidMount() {
        let self = this;
        self.getTaskLockedUser();
        self.getClosingDiscDate();
        window.addEventListener("beforeunload", this.onUnload)

        if(this.props.notesField !== 'convoLog') {
            this.setState({[this.props.notesField]: true})
        }
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
     * Get user from DB that has locked the officerWorksheet
     */
    getTaskLockedUser() {
        let self = this;
        axios.post('/checkIfTaskLocked', {
            data: {
                loan_id: self.state.worksheet[0].loan_id,
                table: 'officerWorksheets'
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
                    table: 'officerWorksheets'
                }
            })
                .then(function(response) {
                    self.setState({ isWorksheetEditable: true, inputChanged: true , editStartTime: Date.now()});
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
                tableName: 'officerWorksheets',
                worksheet: self.state.worksheet[0],
                borrower: self.state.borrowers,
            }
        })
            .then(function(response) {
                if(response.status == 403) {
                    alert('You do not have this record locked for editing. Please click edit and re-save' +
                        ' your changes.')
                }
                self.setState({ isWorksheetEditable: false, userEditingWorksheet: null, inputChanged: null });
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
                tableName: 'officerWorksheets',
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

    getClosingDiscDate() {
        let self = this;
        let closingDiscDate =
            subtractWeekdays(moment(this.state.loanInfo.closing_date), 3);
        self.setState({closingDiscDate: closingDiscDate.format('MM-DD-YYYY')});
    }

    /**
     * Refreshes state from Borrowers that have been added or deleted
     * @param newBorrowers   array of current REO's
     */
    refreshBorrowers(newBorrowers) {
        let self = this;
        self.setState({borrowers: newBorrowers});
    }

    refreshComments(comments) {
        let self = this;
        self.setState({comments: comments});
    }

    closeNotes(fieldName) {
        this.setState({ [fieldName]: false})
    }

    render() {
        let cancelButton, saveButton, countdownTimer, userEditing,
            creditInfo, driversLicense, payStubs, taxReturns,
            awardLetter, c2cGift, c2cDPA, c2cLien, closingDiscDate,
            c2cCheck, dd214, nps;

        if(this.state.isWorksheetEditable) {
            cancelButton =
                <Button
                    bsStyle="danger"
                    bsSize="small"
                    disabled={!this.state.isWorksheetEditable}
                    onClick={this.cancelUpdate}>
                    Cancel
                </Button>;
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

        creditInfo = this.state.borrowers.map((borrower, i) =>
            <Row key={i}>
                <ControlLabel>Borrower #{i+1}:</ControlLabel>
                <br />
                &nbsp;&nbsp;
                Credit Score:
                &nbsp;
                <FormControl
                    type="text"
                    style={{ width: "70px"}}
                    value={borrower.cred_report_score || ''}
                    disabled={!this.state.isWorksheetEditable}
                    onChange={(e) => this.handleChangeBorrower(i, e)}
                    name="cred_report_score"/>
                &nbsp;
                CR#:
                &nbsp;
                <FormControl
                    type="text"
                    style={{ width: "100px"}}
                    value={borrower.cred_report_number || ''}
                    disabled={!this.state.isWorksheetEditable}
                    onChange={(e) => this.handleChangeBorrower(i, e)}
                    name="cred_report_number"/>
                &nbsp;
                Plan Re-Score:
                &nbsp;
                <FormControl
                    componentClass="select"
                    name="cred_report_plan_res"
                    value={borrower.cred_report_plan_res}
                    disabled={!this.state.isWorksheetEditable}
                    onChange={(e) => this.handleChangeBorrower(i, e)}>
                    <option value="0">No</option>
                    <option value="1">Yes</option>
                </FormControl>
            </Row>);

        driversLicense = this.state.borrowers.map((borrower, i) =>
            <Row key={i}>
                <ControlLabel>Borrower #{i+1}:</ControlLabel>
                &nbsp;
                <Checkbox
                    defaultChecked={borrower.driv_license_req}
                    inline
                    disabled={!this.state.isWorksheetEditable}
                    onChange={(e) => this.handleChangeBorrower(i, e)}
                    name="driv_license_req">
                    Requested
                </Checkbox>
                {' '}
                <Checkbox
                    defaultChecked={borrower.driv_license_rcvd}
                    inline
                    disabled={!this.state.isWorksheetEditable}
                    onChange={(e) => this.handleChangeBorrower(i, e)}
                    name="driv_license_rcvd">
                    Received
                </Checkbox>
                {' '}
                <Checkbox
                    defaultChecked={borrower.driv_license_rna}
                    inline
                    disabled={!this.state.isWorksheetEditable}
                    onChange={(e) => this.handleChangeBorrower(i, e)}
                    name="driv_license_rna">
                    N/A
                </Checkbox>
            </Row>);

        payStubs = this.state.borrowers.map((borrower, i) =>
            <Row key={i}>
                <ControlLabel>Borrower #{i+1}:</ControlLabel>
                <br />
                &nbsp;
                <Checkbox
                    defaultChecked={borrower.pay_stub_req}
                    inline
                    disabled={!this.state.isWorksheetEditable}
                    onChange={(e) => this.handleChangeBorrower(i, e)}
                    name="pay_stub_req">
                    Requested
                </Checkbox>
                {' '}
                <Checkbox
                    defaultChecked={borrower.pay_stub_rcvd}
                    inline
                    disabled={!this.state.isWorksheetEditable}
                    onChange={(e) => this.handleChangeBorrower(i, e)}
                    name="pay_stub_rcvd">
                    Received
                </Checkbox>
                {' '}
                <Checkbox
                    defaultChecked={borrower.pay_stub_na}
                    inline
                    disabled={!this.state.isWorksheetEditable}
                    onChange={(e) => this.handleChangeBorrower(i, e)}
                    name="pay_stub_na">
                    N/A
                </Checkbox>
            </Row>);

        taxReturns = this.state.borrowers.map((borrower, i) =>
            <Row key={i}>
                <ControlLabel>Borrower #{i+1}:</ControlLabel>
                <br />
                &nbsp;
                <Checkbox
                    defaultChecked={borrower.tax_return_req}
                    inline
                    disabled={!this.state.isWorksheetEditable}
                    onChange={(e) => this.handleChangeBorrower(i, e)}
                    name="tax_return_req">
                    Requested
                </Checkbox>
                {' '}
                <Checkbox
                    defaultChecked={borrower.tax_return_rcvd}
                    inline
                    disabled={!this.state.isWorksheetEditable}
                    onChange={(e) => this.handleChangeBorrower(i, e)}
                    name="tax_return_rcvd">
                    Received
                </Checkbox>
                {' '}
                <Checkbox
                    defaultChecked={borrower.tax_return_na}
                    inline
                    disabled={!this.state.isWorksheetEditable}
                    onChange={(e) => this.handleChangeBorrower(i, e)}
                    name="tax_return_na">
                    N/A
                </Checkbox>
            </Row>);

        awardLetter = this.state.borrowers.map((borrower, i) =>
            <Row key={i}>
                <ControlLabel>Borrower #{i+1}:</ControlLabel>
                <br />
                &nbsp;
                <Checkbox
                    defaultChecked={borrower.award_letter_req}
                    inline
                    disabled={!this.state.isWorksheetEditable}
                    onChange={(e) => this.handleChangeBorrower(i, e)}
                    name="award_letter_req">
                    Requested
                </Checkbox>
                {' '}
                <Checkbox
                    defaultChecked={borrower.award_letter_rcvd}
                    inline
                    disabled={!this.state.isWorksheetEditable}
                    onChange={(e) => this.handleChangeBorrower(i, e)}
                    name="award_letter_rcvd">
                    Received
                </Checkbox>
                {' '}
                <Checkbox
                    defaultChecked={borrower.award_letter_na}
                    inline
                    disabled={!this.state.isWorksheetEditable}
                    onChange={(e) => this.handleChangeBorrower(i, e)}
                    name="award_letter_na">
                    N/A
                </Checkbox>
            </Row>);

        if(this.state.worksheet[0].c2c_check) {
            c2cCheck =
                <Row>
                    <Row>
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        <ControlLabel>Bank Statements:</ControlLabel>
                        <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        &nbsp;&nbsp;&nbsp;&nbsp;
                        <Checkbox
                            defaultChecked={this.state.worksheet[0].c2c_check_stmnt_req}
                            inline
                            disabled={!this.state.isWorksheetEditable}
                            onChange={this.handleChange}
                            name="c2c_check_stmnt_req">
                            Requested
                        </Checkbox>
                        &nbsp;
                        <Checkbox
                            defaultChecked={this.state.worksheet[0].c2c_check_stmnt_rcvd}
                            inline
                            disabled={!this.state.isWorksheetEditable}
                            onChange={this.handleChange}
                            name="c2c_check_stmnt_rcvd">
                            Received
                        </Checkbox>
                        &nbsp;
                        <Checkbox
                            defaultChecked={this.state.worksheet[0].c2c_check_stmnt_na}
                            inline
                            disabled={!this.state.isWorksheetEditable}
                            onChange={this.handleChange}
                            name="c2c_check_stmnt_na">
                            N/A
                        </Checkbox>
                    </Row>
                </Row>
        }

        if(this.state.worksheet[0].c2c_gift) {
            c2cGift =
                <Row>
                    <Row>
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        <ControlLabel>Gift of Equity?</ControlLabel>
                        &nbsp;
                        <FormControl
                            componentClass="select"
                            name="c2c_gift_equity"
                            value={this.state.worksheet[0].c2c_gift_equity}
                            disabled={!this.state.isWorksheetEditable}
                            onChange={(e) => this.handleChangeBorrower(i, e)}>
                            <option value="0">No</option>
                            <option value="1">Yes</option>
                        </FormControl>
                    </Row>
                    <Row>
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        <ControlLabel>Gift Letter:</ControlLabel>
                        <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        &nbsp;&nbsp;&nbsp;&nbsp;
                        <Checkbox
                            defaultChecked={this.state.worksheet[0].c2c_gift_letter_req}
                            inline
                            disabled={!this.state.isWorksheetEditable}
                            onChange={this.handleChange}
                            name="c2c_gift_letter_req">
                            Requested
                        </Checkbox>
                        &nbsp;
                        <Checkbox
                            defaultChecked={this.state.worksheet[0].c2c_gift_letter_rcvd}
                            inline
                            disabled={!this.state.isWorksheetEditable}
                            onChange={this.handleChange}
                            name="c2c_gift_letter_rcvd">
                            Received
                        </Checkbox>
                        &nbsp;
                        <Checkbox
                            defaultChecked={this.state.worksheet[0].c2c_gift_letter_na}
                            inline
                            disabled={!this.state.isWorksheetEditable}
                            onChange={this.handleChange}
                            name="c2c_gift_letter_na">
                            N/A
                        </Checkbox>
                    </Row>
                    <Row>
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        <ControlLabel>Copy of Gift Check:</ControlLabel>
                        <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        &nbsp;&nbsp;&nbsp;&nbsp;
                        <Checkbox
                            defaultChecked={this.state.worksheet[0].c2c_gift_check_req}
                            inline
                            disabled={!this.state.isWorksheetEditable}
                            onChange={this.handleChange}
                            name="c2c_gift_check_req">
                            Requested
                        </Checkbox>
                        &nbsp;
                        <Checkbox
                            defaultChecked={this.state.worksheet[0].c2c_gift_check_rcvd}
                            inline
                            disabled={!this.state.isWorksheetEditable}
                            onChange={this.handleChange}
                            name="c2c_gift_check_rcvd">
                            Received
                        </Checkbox>
                        &nbsp;
                        <Checkbox
                            defaultChecked={this.state.worksheet[0].c2c_gift_check_na}
                            inline
                            disabled={!this.state.isWorksheetEditable}
                            onChange={this.handleChange}
                            name="c2c_gift_check_na">
                            N/A
                        </Checkbox>
                    </Row>
                    <Row>
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        <ControlLabel>Donor Statement:</ControlLabel>
                        <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        &nbsp;&nbsp;&nbsp;&nbsp;
                        <Checkbox
                            defaultChecked={this.state.worksheet[0].c2c_gift_donor_req}
                            inline
                            disabled={!this.state.isWorksheetEditable}
                            onChange={this.handleChange}
                            name="c2c_gift_donor_req">
                            Requested
                        </Checkbox>
                        &nbsp;
                        <Checkbox
                            defaultChecked={this.state.worksheet[0].c2c_gift_donor_rcvd}
                            inline
                            disabled={!this.state.isWorksheetEditable}
                            onChange={this.handleChange}
                            name="c2c_gift_donor_rcvd">
                            Received
                        </Checkbox>
                        &nbsp;
                        <Checkbox
                            defaultChecked={this.state.worksheet[0].c2c_gift_donor_na}
                            inline
                            disabled={!this.state.isWorksheetEditable}
                            onChange={this.handleChange}
                            name="c2c_gift_donor_na">
                            N/A
                        </Checkbox>
                    </Row>
                    <Row>
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        <ControlLabel>Borrower Bank Statement Showing Funds Deposited:</ControlLabel>
                        <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        &nbsp;&nbsp;&nbsp;&nbsp;
                        <Checkbox
                            defaultChecked={this.state.worksheet[0].c2c_gift_donor_req}
                            inline
                            disabled={!this.state.isWorksheetEditable}
                            onChange={this.handleChange}
                            name="c2c_gift_donor_req">
                            Requested
                        </Checkbox>
                        &nbsp;
                        <Checkbox
                            defaultChecked={this.state.worksheet[0].c2c_gift_donor_rcvd}
                            inline
                            disabled={!this.state.isWorksheetEditable}
                            onChange={this.handleChange}
                            name="c2c_gift_donor_rcvd">
                            Received
                        </Checkbox>
                        &nbsp;
                        <Checkbox
                            defaultChecked={this.state.worksheet[0].c2c_gift_donor_na}
                            inline
                            disabled={!this.state.isWorksheetEditable}
                            onChange={this.handleChange}
                            name="c2c_gift_donor_na">
                            N/A - Funds Depostied @ Title
                        </Checkbox>
                    </Row>
                </Row>
        }

        if(this.state.worksheet[0].c2c_dpa) {
            c2cDPA =
                <Row>
                    <Row>
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        Program
                        &nbsp;
                        <FormControl
                            componentClass="select"
                            name="c2c_dpa_program"
                            value={this.state.worksheet[0].c2c_dpa_program || ''}
                            disabled={!this.state.isWorksheetEditable}
                            onChange={this.handleChange}>
                            <option value="none">...</option>
                            <option value="HIP">HIP</option>
                            <option value="NHS">NHS</option>
                        </FormControl>
                    </Row>
                    <Row>
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        <Checkbox
                            defaultChecked={this.state.worksheet[0].c2c_dpa_pack_sent}
                            inline
                            disabled={!this.state.isWorksheetEditable}
                            onChange={this.handleChange}
                            name="c2c_dpa_pack_sent">
                            Package sent for program review?
                        </Checkbox>
                    </Row>
                </Row>
        }

        if(this.state.worksheet[0].c2c_2nd_lien) {
            c2cLien =
                <Row>
                    <Row>
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        Details:
                        &nbsp;
                        <FormControl
                            type="text"
                            style={{ width: "350px"}}
                            value={this.state.worksheet[0].c2c_2nd_lien_details || ''}
                            disabled={!this.state.isWorksheetEditable}
                            onChange={this.handleChange}
                            name="c2c_2nd_lien_details"/>
                    </Row>
                </Row>
        }

        if(this.state.loanInfo['type'] === 'VA') {
            dd214 =
                <Row>
                    <h4 style={titles}>
                        <Button bsSize="xsmall"
                                onClick={() => this.setState({ dd214:true})}>
                            <Glyphicon glyph="comment" />
                        </Button>
                        <DisplayNotes
                            loan_id={this.state.worksheet[0].loan_id}
                            displayModal={this.state.dd214}
                            comments={this.state.comments}
                            users={this.props.users}
                            refreshComments={this.refreshComments}
                            title='DD214 Notes'
                            fieldName='DD214'
                            modalName='dd214'
                            tabKey={2}
                            close={this.closeNotes} />
                        &nbsp;
                        DD214
                    </h4>
                    <Row>
                        &nbsp;
                        <Checkbox
                            defaultChecked={this.state.worksheet[0].dd214_req}
                            inline
                            disabled={!this.state.isWorksheetEditable}
                            onChange={this.handleChange}
                            name="dd214_req">
                            Requested
                        </Checkbox>
                    </Row>
                    <Row>
                        &nbsp;
                        <Checkbox
                            defaultChecked={this.state.worksheet[0].dd214_rcvd}
                            inline
                            disabled={!this.state.isWorksheetEditable}
                            onChange={this.handleChange}
                            name="dd214_rcvd">
                            Received
                        </Checkbox>
                    </Row>
                </Row>;
            nps =
                <Row>
                    <h4 style={titles}>
                        <Button bsSize="xsmall"
                                onClick={() => this.setState({ nps:true})}>
                            <Glyphicon glyph="comment" />
                        </Button>
                        <DisplayNotes
                            loan_id={this.state.worksheet[0].loan_id}
                            displayModal={this.state.nps}
                            comments={this.state.comments}
                            users={this.props.users}
                            refreshComments={this.refreshComments}
                            title='NPS Notes'
                            fieldName='NPS'
                            modalName = 'nps'
                            tabKey={2}
                            close={this.closeNotes} />
                        &nbsp;
                        NPS
                    </h4>
                    <Row>
                        <Checkbox
                            defaultChecked={this.state.worksheet[0].nps_req}
                            inline
                            disabled={!this.state.isWorksheetEditable}
                            onChange={this.handleChange}
                            name="nps_req">
                            Requested
                        </Checkbox>
                        &nbsp;
                        <Checkbox
                            defaultChecked={this.state.worksheet[0].nps_rcvd}
                            inline
                            disabled={!this.state.isWorksheetEditable}
                            onChange={this.handleChange}
                            name="nps_rcvd">
                            Received
                        </Checkbox>
                        &nbsp;
                        <Checkbox
                            defaultChecked={this.state.worksheet[0].nps_na}
                            inline
                            disabled={!this.state.isWorksheetEditable}
                            onChange={this.handleChange}
                            name="nps_na">
                            N/A
                        </Checkbox>
                    </Row>
                </Row>
        }

        if(this.state.loanInfo['type'] === 'FHA' || this.state.loanInfo['type'] === 'USDA-RHS') {
            nps =
                <Row>
                    <h4 style={titles}>
                        <Button bsSize="xsmall"
                                onClick={() => this.setState({ nps:true})}>
                            <Glyphicon glyph="comment" />
                        </Button>
                        <DisplayNotes
                            loan_id={this.state.worksheet[0].loan_id}
                            displayModal={this.state.nps}
                            comments={this.state.comments}
                            users={this.props.users}
                            refreshComments={this.refreshComments}
                            title='NPS Notes'
                            fieldName='NPS'
                            modalName = 'nps'
                            tabKey={2}
                            close={this.closeNotes} />
                        &nbsp;
                        NPS
                    </h4>
                    <Row>
                        <Checkbox
                            defaultChecked={this.state.worksheet[0].nps_req}
                            inline
                            disabled={!this.state.isWorksheetEditable}
                            onChange={this.handleChange}
                            name="nps_req">
                            Requested
                        </Checkbox>
                        &nbsp;
                        <Checkbox
                            defaultChecked={this.state.worksheet[0].nps_rcvd}
                            inline
                            disabled={!this.state.isWorksheetEditable}
                            onChange={this.handleChange}
                            name="nps_rcvd">
                            Received
                        </Checkbox>
                        &nbsp;
                        <Checkbox
                            defaultChecked={this.state.worksheet[0].nps_na}
                            inline
                            disabled={!this.state.isWorksheetEditable}
                            onChange={this.handleChange}
                            name="nps_na">
                            N/A
                        </Checkbox>
                    </Row>
                </Row>
        }

        return (
            <Form inline> {/* onSubmit={this.updateTaskList}>*/}
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
                <br /><br />
                <Row>
                    <Col lg={8}>
                        <Row>
                            <h4 style={titles}>
                                <Button bsSize="xsmall"
                                        onClick={() => this.setState({ propertyType:true})}>
                                    <Glyphicon glyph="comment" />
                                </Button>
                                <DisplayNotes
                                    loan_id={this.state.worksheet[0].loan_id}
                                    displayModal={this.state.propertyType}
                                    comments={this.state.comments}
                                    users={this.props.users}
                                    refreshComments={this.refreshComments}
                                    title='Property Type Notes'
                                    fieldName='Property Type'
                                    modalName='propertyType'
                                    tabKey={2}
                                    close={this.closeNotes} />
                                &nbsp;
                                Property Type
                            </h4>
                        </Row>
                        <Col lg={3}>
                            <HelpBlock>Check all that apply</HelpBlock>
                        </Col>
                        <Col lg={3}>
                            <Row>
                                <Checkbox
                                    defaultChecked={this.state.worksheet[0].prop_type_prim_res}
                                    inline
                                    disabled={!this.state.isWorksheetEditable}
                                    onChange={this.handleChange}
                                    name="prop_type_prim_res">
                                    Primary Residence
                                </Checkbox>
                            </Row>
                            <Row>
                                <Checkbox
                                    defaultChecked={this.state.worksheet[0].prop_type_invest_res}
                                    inline
                                    disabled={!this.state.isWorksheetEditable}
                                    onChange={this.handleChange}
                                    name="prop_type_invest_res">
                                    Investment Property
                                </Checkbox>
                            </Row>
                            <Row>
                                <Checkbox
                                    defaultChecked={this.state.worksheet[0].prop_type_sec_home}
                                    inline
                                    disabled={!this.state.isWorksheetEditable}
                                    onChange={this.handleChange}
                                    name="prop_type_sec_home">
                                    2nd Home
                                </Checkbox>
                            </Row>
                        </Col>
                        <Col lg={3}>
                            <Row>
                                <Checkbox
                                    defaultChecked={this.state.worksheet[0].prop_type_detached}
                                    inline
                                    disabled={!this.state.isWorksheetEditable}
                                    onChange={this.handleChange}
                                    name="prop_type_detached">
                                    Detached
                                </Checkbox>
                            </Row>
                            <Row>
                                <Checkbox
                                    defaultChecked={this.state.worksheet[0].prop_type_manufactured}
                                    inline
                                    disabled={!this.state.isWorksheetEditable}
                                    onChange={this.handleChange}
                                    name="prop_type_manufactured">
                                    Manufactured
                                </Checkbox>
                            </Row>
                            <Row>
                                <Checkbox
                                    defaultChecked={this.state.worksheet[0].prop_type_condo}
                                    inline
                                    disabled={!this.state.isWorksheetEditable}
                                    onChange={this.handleChange}
                                    name="prop_type_condo">
                                    Condo
                                </Checkbox>
                            </Row>
                        </Col>
                        <Col lg={2}>
                            <Row>
                                <Checkbox
                                    defaultChecked={this.state.worksheet[0].prop_type_townhome}
                                    inline
                                    disabled={!this.state.isWorksheetEditable}
                                    onChange={this.handleChange}
                                    name="prop_type_townhome">
                                    Townhome
                                </Checkbox>
                            </Row>
                        </Col>
                    </Col>
                    <Col lg={4}>
                        <h4 style={titles}>
                            <Button bsSize="xsmall" //bsStyle="danger"
                                    onClick={() => this.setState({ salesContract:true})}>
                                <Glyphicon glyph="comment" />
                            </Button>
                            <DisplayNotes
                                loan_id={this.state.worksheet[0].loan_id}
                                displayModal={this.state.salesContract}
                                comments={this.state.comments}
                                users={this.props.users}
                                refreshComments={this.refreshComments}
                                title='Sales Contract Notes'
                                fieldName='Sales Contract'
                                modalName='salesContract'
                                tabKey={2}
                                close={this.closeNotes} />
                            &nbsp;
                            Sales Contract
                        </h4>
                        <Row>
                            &nbsp;
                            <Checkbox
                                defaultChecked={this.state.worksheet[0].sales_contract_req}
                                inline
                                disabled={!this.state.isWorksheetEditable}
                                onChange={this.handleChange}
                                name="sales_contract_req">
                                Requested
                            </Checkbox>
                        </Row>
                        <Row>
                            &nbsp;
                            <Checkbox
                                defaultChecked={this.state.worksheet[0].sales_contract_rcvd}
                                inline
                                disabled={!this.state.isWorksheetEditable}
                                onChange={this.handleChange}
                                name="sales_contract_rcvd">
                                Received
                            </Checkbox>
                        </Row>
                        <Row>
                            &nbsp;
                            <Checkbox
                                defaultChecked={this.state.worksheet[0].sales_contract_na}
                                inline
                                disabled={!this.state.isWorksheetEditable}
                                onChange={this.handleChange}
                                name="sales_contract_na">
                                N/A
                            </Checkbox>
                        </Row>
                    </Col>
                </Row>
                <Row><br /></Row>
                <Row>
                    <Col lg={3}>
                        <h4 style={titles}>
                            <Button bsSize="xsmall"
                                    onClick={() => this.setState({ wetSigs:true})}>
                                <Glyphicon glyph="comment" />
                            </Button>
                            <DisplayNotes
                                loan_id={this.state.worksheet[0].loan_id}
                                displayModal={this.state.wetSigs}
                                comments={this.state.comments}
                                users={this.props.users}
                                refreshComments={this.refreshComments}
                                title='Wet Sigs Notes'
                                fieldName='Wet Sigs'
                                modalName='wetSigs'
                                tabKey={2}
                                close={this.closeNotes} />
                            &nbsp;
                            Wet Sigs
                        </h4>
                        <Row>
                            &nbsp;
                            <Checkbox
                                defaultChecked={this.state.worksheet[0].wet_sig_req}
                                inline
                                disabled={!this.state.isWorksheetEditable}
                                onChange={this.handleChange}
                                name="wet_sig_req">
                                Requested
                            </Checkbox>
                        </Row>
                        <Row>
                            &nbsp;
                            <Checkbox
                                defaultChecked={this.state.worksheet[0].wet_sig_rcvd}
                                inline
                                disabled={!this.state.isWorksheetEditable}
                                onChange={this.handleChange}
                                name="wet_sig_rcvd">
                                Received
                            </Checkbox>
                        </Row>
                        <Row>
                            &nbsp;
                            <Checkbox
                                defaultChecked={this.state.worksheet[0].wet_sig_na}
                                inline
                                disabled={!this.state.isWorksheetEditable}
                                onChange={this.handleChange}
                                name="wet_sig_na">
                                N/A
                            </Checkbox>
                        </Row>
                    </Col>
                    <Col lg={3}>
                        <h4 style={titles}>
                            <Button bsSize="xsmall"
                                    onClick={() => this.setState({ initDisclosures:true})}>
                                <Glyphicon glyph="comment" />
                            </Button>
                            <DisplayNotes
                                loan_id={this.state.worksheet[0].loan_id}
                                displayModal={this.state.initDisclosures}
                                comments={this.state.comments}
                                users={this.props.users}
                                refreshComments={this.refreshComments}
                                title='Initial Disclosure Notes'
                                fieldName='Initial Disclosure'
                                modalName='initDisclosures'
                                tabKey={2}
                                close={this.closeNotes} />
                            &nbsp;
                            Initial Disclosures
                        </h4>
                        <Row>
                            &nbsp;
                            <Checkbox
                                defaultChecked={this.state.worksheet[0].init_disc_req}
                                inline
                                disabled={!this.state.isWorksheetEditable}
                                onChange={this.handleChange}
                                name="init_disc_req">
                                Requested
                            </Checkbox>
                        </Row>
                        <Row>
                            &nbsp;
                            <Checkbox
                                defaultChecked={this.state.worksheet[0].init_disc_rcvd}
                                inline
                                disabled={!this.state.isWorksheetEditable}
                                onChange={this.handleChange}
                                name="init_disc_rcvd">
                                Received
                            </Checkbox>
                        </Row>
                        <Row>
                            &nbsp;
                            <Checkbox
                                defaultChecked={this.state.worksheet[0].init_disc_na}
                                inline
                                disabled={!this.state.isWorksheetEditable}
                                onChange={this.handleChange}
                                name="init_disc_na">
                                N/A
                            </Checkbox>
                        </Row>
                    </Col>
                    <Col lg={2}>
                        <h4 style={titles}>
                            <Button bsSize="xsmall"
                                    onClick={() => this.setState({ lockedLE:true})}>
                                <Glyphicon glyph="comment" />
                            </Button>
                            <DisplayNotes
                                loan_id={this.state.worksheet[0].loan_id}
                                displayModal={this.state.lockedLE}
                                comments={this.state.comments}
                                users={this.props.users}
                                refreshComments={this.refreshComments}
                                title='Locked LE Notes'
                                fieldName='Locked LE'
                                modalName='lockedLE'
                                tabKey={2}
                                close={this.closeNotes} />
                            &nbsp;
                            Locked LE
                        </h4>
                        <Row>
                            &nbsp;
                            <Checkbox
                                defaultChecked={this.state.worksheet[0].locked_le_req}
                                inline
                                disabled={!this.state.isWorksheetEditable}
                                onChange={this.handleChange}
                                name="locked_le_req">
                                Requested
                            </Checkbox>
                        </Row>
                        <Row>
                            &nbsp;
                            <Checkbox
                                defaultChecked={this.state.worksheet[0].locked_le_rcvd}
                                inline
                                disabled={!this.state.isWorksheetEditable}
                                onChange={this.handleChange}
                                name="locked_le_rcvd">
                                Received
                            </Checkbox>
                        </Row>
                        <Row>
                            &nbsp;
                            <Checkbox
                                defaultChecked={this.state.worksheet[0].locked_le_na}
                                inline
                                disabled={!this.state.isWorksheetEditable}
                                onChange={this.handleChange}
                                name="locked_le_na">
                                N/A
                            </Checkbox>
                        </Row>
                    </Col>
                    <Col lg={4}>
                        <h4 style={titles}>
                            <Button bsSize="xsmall"
                                    onClick={() => this.setState({ closingDisclosures:true})}>
                                <Glyphicon glyph="comment" />
                            </Button>
                            <DisplayNotes
                                loan_id={this.state.worksheet[0].loan_id}
                                displayModal={this.state.closingDisclosures}
                                comments={this.state.comments}
                                users={this.props.users}
                                refreshComments={this.refreshComments}
                                title='Closing Disclosure Notes'
                                fieldName='Closing Disclosure'
                                modalName='closingDisclosures'
                                tabKey={2}
                                close={this.closeNotes} />
                            &nbsp;
                            Closing Disclosure
                        </h4>
                        <Col lg={12}>
                            <Checkbox
                                defaultChecked={this.state.worksheet[0].closing_disc_req}
                                inline
                                disabled={!this.state.isWorksheetEditable}
                                onChange={this.handleChange}
                                name="closing_disc_req">
                                Requested
                            </Checkbox>
                            {' '}
                            <Checkbox
                                defaultChecked={this.state.worksheet[0].closing_disc_sent}
                                inline
                                disabled={!this.state.isWorksheetEditable}
                                onChange={this.handleChange}
                                name="closing_disc_sent">
                                Sent
                            </Checkbox>
                            {' '}
                            <Checkbox
                                defaultChecked={this.state.worksheet[0].closing_disc_signed}
                                inline
                                disabled={!this.state.isWorksheetEditable}
                                onChange={this.handleChange}
                                name="closing_disc_signed">
                                Signed
                            </Checkbox>
                            <HelpBlock>
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                Must be signed by <strong>{this.state.closingDiscDate}</strong>
                            </HelpBlock>
                        </Col>
                    </Col>
                </Row>
                <Row><br /></Row>
                <Row style={rowTopBorder}>
                    <br />
                    <Col lg={12}>
                        <Row>
                            <h4 style={titles}>
                                Credit Report
                                &nbsp;
                                <OverlayTrigger
                                    trigger="click"
                                    rootClose
                                    placement="top"
                                    overlay={layeredRiskPopOver}
                                >
                                    <Button bsSize="xsmall">
                                        <Glyphicon glyph="list-alt" />
                                    </Button>
                                </OverlayTrigger>
                                &nbsp;
                                <Button bsSize="xsmall"
                                        onClick={() => this.setState({ creditReport:true})}>
                                    <Glyphicon glyph="comment" />
                                </Button>
                                <DisplayNotes
                                    loan_id={this.state.worksheet[0].loan_id}
                                    displayModal={this.state.creditReport}
                                    comments={this.state.comments}
                                    users={this.props.users}
                                    refreshComments={this.refreshComments}
                                    title='Credit Report Notes'
                                    fieldName='Credit Report'
                                    modalName='creditReport'
                                    tabKey={2}
                                    close={this.closeNotes} />
                            </h4>
                            <Row>
                                &nbsp;&nbsp;&nbsp;
                                <Button
                                    bsSize="small"
                                    onClick={() => this.setState({ showModalBorrowers:true})}>
                                    <strong>Manage Borrowers</strong>
                                </Button>
                                <Modal
                                    dialogClassName="modalSize"
                                    show={this.state.showModalBorrowers}
                                    onHide={() => this.setState({ showModalBorrowers:false})}>
                                    <Modal.Header closeButton>
                                        <Modal.Title>Manage Borrowers</Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body>
                                        <Borrowers
                                            loanID={this.state.worksheet[0].loan_id}
                                            borrowers={this.state.borrowers}
                                            refresh={this.refreshBorrowers}/>
                                    </Modal.Body>
                                    <Modal.Footer>
                                        <Button onClick={() => this.setState({ showModalBorrowers:false})}>Close</Button>
                                    </Modal.Footer>
                                </Modal>
                            </Row>
                            <Col lg={7}>
                                {creditInfo}
                            </Col>
                            <Col lg={5}>
                                <h4 style={titles}>
                                    <Button bsSize="xsmall"
                                            onClick={() => this.setState({ bankruptcyHist:true})}>
                                        <Glyphicon glyph="comment" />
                                    </Button>
                                    <DisplayNotes
                                        loan_id={this.state.worksheet[0].loan_id}
                                        displayModal={this.state.bankruptcyHist}
                                        comments={this.state.comments}
                                        users={this.props.users}
                                        refreshComments={this.refreshComments}
                                        title='Bankruptcy History Notes'
                                        fieldName='Bankruptcy History'
                                        modalName='bankruptcyHist'
                                        tabKey={2}
                                        close={this.closeNotes} />
                                    &nbsp;
                                    Bankruptcy History?
                                    &nbsp;
                                    <FormControl
                                        componentClass="select"
                                        name="bankruptcy_hist"
                                        value={this.state.worksheet[0].bankruptcy_hist}
                                        disabled={!this.state.isWorksheetEditable}
                                        onChange={this.handleChange}>
                                        <option value="0">No</option>
                                        <option value="1">Yes</option>
                                    </FormControl>
                                </h4>
                            </Col>
                        </Row>
                        <br />
                        <Row>
                            <Col lg={7}>
                                <h4 style={titles}>
                                    <Button bsSize="xsmall"
                                            onClick={() => this.setState({ verbalCredAuth:true})}>
                                        <Glyphicon glyph="comment" />
                                    </Button>
                                    <DisplayNotes
                                        loan_id={this.state.worksheet[0].loan_id}
                                        displayModal={this.state.verbalCredAuth}
                                        comments={this.state.comments}
                                        users={this.props.users}
                                        refreshComments={this.refreshComments}
                                        title='Verbal Credit Auth Notes'
                                        fieldName='Verbal Credit Auth'
                                        modalName='verbalCredAuth'
                                        tabKey={2}
                                        close={this.closeNotes} />
                                    &nbsp;
                                    Verbal Credit Auth
                                    &nbsp;
                                    <Checkbox
                                        defaultChecked={this.state.worksheet[0].verb_cred_auth}
                                        inline
                                        disabled={!this.state.isWorksheetEditable}
                                        onChange={this.handleChange}
                                        name="verb_cred_auth">
                                        &nbsp;
                                    </Checkbox>
                                </h4>
                            </Col>
                            <Col lg={5}>
                                <h4 style={titles}>
                                    <Button bsSize="xsmall"
                                            onClick={() => this.setState({ foreclosureHist:true})}>
                                        <Glyphicon glyph="comment" />
                                    </Button>
                                    <DisplayNotes
                                        loan_id={this.state.worksheet[0].loan_id}
                                        displayModal={this.state.foreclosureHist}
                                        comments={this.state.comments}
                                        users={this.props.users}
                                        refreshComments={this.refreshComments}
                                        title='Foreclosure History Notes'
                                        fieldName='Foreclosure History'
                                        modalName='foreclosureHist'
                                        tabKey={2}
                                        close={this.closeNotes} />
                                    &nbsp;
                                    Foreclosure History?
                                    &nbsp;
                                    <FormControl
                                        componentClass="select"
                                        name="foreclosure_hist"
                                        value={this.state.worksheet[0].foreclosure_hist}
                                        disabled={!this.state.isWorksheetEditable}
                                        onChange={this.handleChange}>
                                        <option value="0">No</option>
                                        <option value="1">Yes</option>
                                    </FormControl>
                                </h4>
                            </Col>
                        </Row>
                        <br />
                        <Row>
                            <Col lg={7}>
                                <h4 style={titles}>
                                    <Button bsSize="xsmall"
                                            onClick={() => this.setState({ creditLOE:true})}>
                                        <Glyphicon glyph="comment" />
                                    </Button>
                                    <DisplayNotes
                                        loan_id={this.state.worksheet[0].loan_id}
                                        displayModal={this.state.creditLOE}
                                        comments={this.state.comments}
                                        users={this.props.users}
                                        refreshComments={this.refreshComments}
                                        title='Credit LOE Notes'
                                        fieldName='Credit LOE'
                                        modalName='creditLOE'
                                        tabKey={2}
                                        close={this.closeNotes} />
                                    &nbsp;
                                    Credit LOE
                                </h4>
                                <Checkbox
                                    defaultChecked={this.state.worksheet[0].cred_loe_req}
                                    inline
                                    disabled={!this.state.isWorksheetEditable}
                                    onChange={this.handleChange}
                                    name="cred_loe_req">
                                    Requested
                                </Checkbox>
                                {' '}
                                <Checkbox
                                    defaultChecked={this.state.worksheet[0].cred_loe_rcvd}
                                    inline
                                    disabled={!this.state.isWorksheetEditable}
                                    onChange={this.handleChange}
                                    name="cred_loe_rcvd">
                                    Received
                                </Checkbox>
                                {' '}
                                <Checkbox
                                    defaultChecked={this.state.worksheet[0].cred_loe_na}
                                    inline
                                    disabled={!this.state.isWorksheetEditable}
                                    onChange={this.handleChange}
                                    name="cred_loe_na">
                                    N/A
                                </Checkbox>
                            </Col>
                            <Col lg={5}>
                                <h4 style={titles}>
                                    <Button bsSize="xsmall"
                                            onClick={() => this.setState({ childSupport:true})}>
                                        <Glyphicon glyph="comment" />
                                    </Button>
                                    <DisplayNotes
                                        loan_id={this.state.worksheet[0].loan_id}
                                        displayModal={this.state.childSupport}
                                        comments={this.state.comments}
                                        users={this.props.users}
                                        refreshComments={this.refreshComments}
                                        title='Child Support & Agreement Notes'
                                        fieldName='Child Support & Agreement'
                                        modalName='childSupport'
                                        tabKey={2}
                                        close={this.closeNotes} />
                                    &nbsp;
                                    Child Support & Agreement
                                </h4>
                                <Checkbox
                                    defaultChecked={this.state.worksheet[0].child_sup_req}
                                    inline
                                    disabled={!this.state.isWorksheetEditable}
                                    onChange={this.handleChange}
                                    name="child_sup_req">
                                    Requested
                                </Checkbox>
                                {' '}
                                <Checkbox
                                    defaultChecked={this.state.worksheet[0].child_sup_rcvd}
                                    inline
                                    disabled={!this.state.isWorksheetEditable}
                                    onChange={this.handleChange}
                                    name="child_sup_rcvd">
                                    Received
                                </Checkbox>
                                {' '}
                                <Checkbox
                                    defaultChecked={this.state.worksheet[0].child_sup_na}
                                    inline
                                    disabled={!this.state.isWorksheetEditable}
                                    onChange={this.handleChange}
                                    name="child_sup_na">
                                    N/A
                                </Checkbox>
                            </Col>
                        </Row>
                        <br />
                        <Row>
                            <Col lg={7}>
                                <h4 style={titles}>
                                    <Button bsSize="xsmall"
                                            onClick={() => this.setState({ driversLicense:true})}>
                                        <Glyphicon glyph="comment" />
                                    </Button>
                                    <DisplayNotes
                                        loan_id={this.state.worksheet[0].loan_id}
                                        displayModal={this.state.driversLicense}
                                        comments={this.state.comments}
                                        users={this.props.users}
                                        refreshComments={this.refreshComments}
                                        title='Drivers License Notes'
                                        fieldName='Drivers License'
                                        modalName='driversLicense'
                                        tabKey={2}
                                        close={this.closeNotes} />
                                    &nbsp;
                                    Drivers License
                                </h4>
                                {driversLicense}
                            </Col>
                            <Col lg={5}>
                                <h4 style={titles}>
                                    <Button bsSize="xsmall"
                                            onClick={() => this.setState({ divorceDecree:true})}>
                                        <Glyphicon glyph="comment" />
                                    </Button>
                                    <DisplayNotes
                                        loan_id={this.state.worksheet[0].loan_id}
                                        displayModal={this.state.divorceDecree}
                                        comments={this.state.comments}
                                        users={this.props.users}
                                        refreshComments={this.refreshComments}
                                        title='Divorce Decree Notes'
                                        fieldName='Divorce Decree'
                                        modalName='divorceDecree'
                                        tabKey={2}
                                        close={this.closeNotes} />
                                    &nbsp;
                                    Divorce Decree
                                </h4>
                                <Checkbox
                                    defaultChecked={this.state.worksheet[0].divorce_decree_req}
                                    inline
                                    disabled={!this.state.isWorksheetEditable}
                                    onChange={this.handleChange}
                                    name="divorce_decree_req">
                                    Requested
                                </Checkbox>
                                {' '}
                                <Checkbox
                                    defaultChecked={this.state.worksheet[0].divorce_decree_rcvd}
                                    inline
                                    disabled={!this.state.isWorksheetEditable}
                                    onChange={this.handleChange}
                                    name="divorce_decree_rcvd">
                                    Received
                                </Checkbox>
                                {' '}
                                <Checkbox
                                    defaultChecked={this.state.worksheet[0].divorce_decree_na}
                                    inline
                                    disabled={!this.state.isWorksheetEditable}
                                    onChange={this.handleChange}
                                    name="divorce_decree_na">
                                    N/A
                                </Checkbox>
                            </Col>
                        </Row>
                        <br />
                        <Row>
                            <Col lg={7}>
                                <h4 style={titles}>
                                    <Button bsSize="xsmall"
                                            onClick={() => this.setState({ otherProperties:true})}>
                                        <Glyphicon glyph="comment" />
                                    </Button>
                                    <DisplayNotes
                                        loan_id={this.state.worksheet[0].loan_id}
                                        displayModal={this.state.otherProperties}
                                        comments={this.state.comments}
                                        users={this.props.users}
                                        refreshComments={this.refreshComments}
                                        title='Other Properties Notes'
                                        fieldName='Other Properties'
                                        modalName='otherProperties'
                                        tabKey={2}
                                        close={this.closeNotes} />
                                    &nbsp;
                                    Does this borrower(s) own any other properties?
                                    &nbsp;&nbsp;
                                    <FormControl
                                        componentClass="select"
                                        name="other_props"
                                        value={this.state.worksheet[0].other_props}
                                        disabled={!this.state.isWorksheetEditable}
                                        onChange={this.handleChange}>
                                        <option value="0">No</option>
                                        <option value="1">Yes</option>
                                    </FormControl>
                                </h4>
                            </Col>
                            <Col lg={5}>
                                <h4 style={titles}>
                                    <Button bsSize="xsmall"
                                            onClick={() => this.setState({ otherDebts:true})}>
                                        <Glyphicon glyph="comment" />
                                    </Button>
                                    <DisplayNotes
                                        loan_id={this.state.worksheet[0].loan_id}
                                        displayModal={this.state.otherDebts}
                                        comments={this.state.comments}
                                        users={this.props.users}
                                        refreshComments={this.refreshComments}
                                        title='Debts Notes'
                                        fieldName='Other Debts'
                                        modalName='otherDebts'
                                        tabKey={2}
                                        close={this.closeNotes} />
                                    &nbsp;
                                    Are any debts excluded/paid off?
                                    &nbsp;&nbsp;
                                    <FormControl
                                        componentClass="select"
                                        name="debts"
                                        value={this.state.worksheet[0].debts}
                                        disabled={!this.state.isWorksheetEditable}
                                        onChange={this.handleChange}>
                                        <option value="0">No</option>
                                        <option value="1">Yes</option>
                                    </FormControl>
                                </h4>
                            </Col>
                        </Row>
                        <Row>
                            <Col lg={7}>
                                <h4 style={titles}>
                                    If yes, what are their intentions with these?
                                </h4>
                                <Row>
                                    <FormControl
                                        componentClass="textarea"
                                        style={{ height: 100, width: 350 }}
                                        name="other_props_intent"
                                        value={this.state.worksheet[0].other_props_intent || ''}
                                        disabled={!this.state.isWorksheetEditable}
                                        onChange={this.handleChange} />
                                </Row>
                            </Col>
                            <Col lg={5}>
                                <br />
                                {nps}
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <Row><br /></Row>
                <Row style={rowTopBorder}>
                    <br />
                    <Col lg={12}>
                        <Row>
                            <h4 style={titles}>
                                <Button bsSize="xsmall"
                                        onClick={() => this.setState({ twoYrEmpHist:true})}>
                                    <Glyphicon glyph="comment" />
                                </Button>
                                <DisplayNotes
                                    loan_id={this.state.worksheet[0].loan_id}
                                    displayModal={this.state.twoYrEmpHist}
                                    comments={this.state.comments}
                                    users={this.props.users}
                                    refreshComments={this.refreshComments}
                                    title='2 Year Employement History Notes'
                                    fieldName='2 Year Employment History'
                                    modalName='twoYrEmpHist'
                                    tabKey={2}
                                    close={this.closeNotes} />
                                &nbsp;
                                Do you have 2yr Employment History on the 1003?
                            </h4>
                            <Row>
                                &nbsp;&nbsp;&nbsp;&nbsp;
                                <Checkbox
                                    defaultChecked={this.state.worksheet[0].two_yr_emp_hist_req}
                                    inline
                                    disabled={!this.state.isWorksheetEditable}
                                    onChange={this.handleChange}
                                    name="two_yr_emp_hist_req">
                                    Requested
                                </Checkbox>
                                {' '}
                                <Checkbox
                                    defaultChecked={this.state.worksheet[0].two_yr_emp_hist_rcvd}
                                    inline
                                    disabled={!this.state.isWorksheetEditable}
                                    onChange={this.handleChange}
                                    name="two_yr_emp_hist_rcvd">
                                    Received
                                </Checkbox>
                                {' '}
                                <Checkbox
                                    defaultChecked={this.state.worksheet[0].two_yr_emp_hist_na}
                                    inline
                                    disabled={!this.state.isWorksheetEditable}
                                    onChange={this.handleChange}
                                    name="two_yr_emp_hist_na">
                                    N/A
                                </Checkbox>
                            </Row>
                        </Row>
                        <br />
                        <Row>
                            <h4 style={titles}>
                                <Button bsSize="xsmall"
                                        onClick={() => this.setState({ income:true})}>
                                    <Glyphicon glyph="comment" />
                                </Button>
                                <DisplayNotes
                                    loan_id={this.state.worksheet[0].loan_id}
                                    displayModal={this.state.income}
                                    comments={this.state.comments}
                                    users={this.props.users}
                                    refreshComments={this.refreshComments}
                                    title='Income Notes'
                                    fieldName='Income'
                                    modalName='income'
                                    tabKey={2}
                                    close={this.closeNotes} />
                                &nbsp;
                                How did you come up with your income?
                            </h4>
                            <HelpBlock>Example: Hourly rate x 40hrs; YTD average over 12 months</HelpBlock>
                            <Row>
                                <FormControl
                                    componentClass="textarea"
                                    style={{ height: 100, width: 350 }}
                                    name="income"
                                    value={this.state.worksheet[0].income || ''}
                                    disabled={!this.state.isWorksheetEditable}
                                    onChange={this.handleChange} />
                            </Row>
                        </Row>
                        <br />
                        <Row>
                            <Col lg={4}>
                                <h4 style={titles}>
                                    <Button bsSize="xsmall"
                                            onClick={() => this.setState({ paystubs:true})}>
                                        <Glyphicon glyph="comment" />
                                    </Button>
                                    <DisplayNotes
                                        loan_id={this.state.worksheet[0].loan_id}
                                        displayModal={this.state.paystubs}
                                        comments={this.state.comments}
                                        users={this.props.users}
                                        refreshComments={this.refreshComments}
                                        title='Income Notes'
                                        fieldName='Paystubs'
                                        modalName='paystubs'
                                        tabKey={2}
                                        close={this.closeNotes} />
                                    &nbsp;
                                    Paystubs
                                </h4>
                                {payStubs}
                            </Col>
                            <Col lg={4}>
                                <h4 style={titles}>
                                    <Button bsSize="xsmall"
                                            onClick={() => this.setState({ taxReturns:true})}>
                                        <Glyphicon glyph="comment" />
                                    </Button>
                                    <DisplayNotes
                                        loan_id={this.state.worksheet[0].loan_id}
                                        displayModal={this.state.taxReturns}
                                        comments={this.state.comments}
                                        users={this.props.users}
                                        refreshComments={this.refreshComments}
                                        title='Tax Return Notes'
                                        fieldName='Tax Returns'
                                        modalName='taxReturns'
                                        tabKey={2}
                                        close={this.closeNotes} />
                                    &nbsp;
                                    Tax Returns
                                </h4>
                                {taxReturns}
                            </Col>
                            <Col lg={4}>
                                <h4 style={titles}>
                                    <Button bsSize="xsmall"
                                            onClick={() => this.setState({ pensionSSAward:true})}>
                                        <Glyphicon glyph="comment" />
                                    </Button>
                                    <DisplayNotes
                                        loan_id={this.state.worksheet[0].loan_id}
                                        displayModal={this.state.pensionSSAward}
                                        comments={this.state.comments}
                                        users={this.props.users}
                                        refreshComments={this.refreshComments}
                                        title='Pension/SS Award Letter Notes'
                                        fieldName='Pension/SS Award Letter'
                                        modalName='pensionSSAward'
                                        tabKey={2}
                                        close={this.closeNotes} />
                                    &nbsp;
                                    Pension/SS Award Letter
                                </h4>
                                {awardLetter}
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <Row><br /></Row>
                <Row style={rowTopBorder}>
                    <Col lg={12}>
                        <br />
                        <Row>
                            <h4 style={titles}>
                                <Button bsSize="xsmall"
                                        onClick={() => this.setState({ c2c:true})}>
                                    <Glyphicon glyph="comment" />
                                </Button>
                                <DisplayNotes
                                    loan_id={this.state.worksheet[0].loan_id}
                                    displayModal={this.state.c2c}
                                    comments={this.state.comments}
                                    users={this.props.users}
                                    refreshComments={this.refreshComments}
                                    title='Cash to Close Notes'
                                    fieldName='Cash to Close'
                                    modalName='c2c'
                                    tabKey={2}
                                    close={this.closeNotes} />
                                &nbsp;
                                Where is cash to close coming from?
                            </h4>
                            <Col lg={6}>
                                <Row>
                                    <h4>
                                        <Checkbox
                                            defaultChecked={this.state.worksheet[0].c2c_check}
                                            inline
                                            disabled={!this.state.isWorksheetEditable}
                                            onChange={this.handleChange}
                                            name="c2c_check">
                                            <strong>Checking/Savings</strong>
                                            &nbsp;
                                            <Button bsSize="xsmall"
                                                    onClick={() => this.setState({ c2c_checking:true})}>
                                                <Glyphicon glyph="comment" />
                                            </Button>
                                            <DisplayNotes
                                                loan_id={this.state.worksheet[0].loan_id}
                                                displayModal={this.state.c2c_checking}
                                                comments={this.state.comments}
                                                users={this.props.users}
                                                refreshComments={this.refreshComments}
                                                title='Cash to Close - Checking/Savings Notes'
                                                fieldName='Cash to Close - Checking'
                                                modalName='c2c_checking'
                                                tabKey={2}
                                                close={this.closeNotes} />
                                        </Checkbox>
                                    </h4>
                                </Row>
                                {c2cCheck}
                                <Row>
                                    <h4>
                                        <Checkbox
                                            defaultChecked={this.state.worksheet[0].c2c_gift}
                                            inline
                                            disabled={!this.state.isWorksheetEditable}
                                            onChange={this.handleChange}
                                            name="c2c_gift">
                                            <strong>Gift</strong>
                                            &nbsp;
                                            <Button bsSize="xsmall"
                                                    onClick={() => this.setState({ c2c_gift:true})}>
                                                <Glyphicon glyph="comment" />
                                            </Button>
                                            <DisplayNotes
                                                loan_id={this.state.worksheet[0].loan_id}
                                                displayModal={this.state.c2c_gift}
                                                comments={this.state.comments}
                                                users={this.props.users}
                                                refreshComments={this.refreshComments}
                                                title='Cash to Close - Gift Notes'
                                                fieldName='Cash to Close - Gift'
                                                modalName='c2c_gift'
                                                tabKey={2}
                                                close={this.closeNotes} />
                                        </Checkbox>
                                    </h4>
                                </Row>
                                {c2cGift}
                            </Col>
                            <Col lg={6}>
                                <Row>
                                    <h4>
                                        <Checkbox
                                            defaultChecked={this.state.worksheet[0].c2c_dpa}
                                            inline
                                            disabled={!this.state.isWorksheetEditable}
                                            onChange={this.handleChange}
                                            name="c2c_dpa">
                                            <strong>DPA</strong>
                                            &nbsp;
                                            <Button bsSize="xsmall"
                                                    onClick={() => this.setState({ c2c_dpa:true})}>
                                                <Glyphicon glyph="comment" />
                                            </Button>
                                            <DisplayNotes
                                                loan_id={this.state.worksheet[0].loan_id}
                                                displayModal={this.state.c2c_dpa}
                                                comments={this.state.comments}
                                                users={this.props.users}
                                                refreshComments={this.refreshComments}
                                                title='Cash to Close - DPA Notes'
                                                fieldName='Cash to Close - DPA'
                                                modalName='c2c_dpa'
                                                tabKey={2}
                                                close={this.closeNotes} />
                                        </Checkbox>
                                    </h4>
                                </Row>
                                {c2cDPA}
                                <Row>
                                    <h4>
                                        <Checkbox
                                            defaultChecked={this.state.worksheet[0].c2c_2nd_lien}
                                            inline
                                            disabled={!this.state.isWorksheetEditable}
                                            onChange={this.handleChange}
                                            name="c2c_2nd_lien">
                                            <strong>2nd Lien</strong>
                                            &nbsp;
                                            <Button bsSize="xsmall"
                                                    onClick={() => this.setState({ c2c_2ndLien:true})}>
                                                <Glyphicon glyph="comment" />
                                            </Button>
                                            <DisplayNotes
                                                loan_id={this.state.worksheet[0].loan_id}
                                                displayModal={this.state.c2c_2ndLien}
                                                comments={this.state.comments}
                                                users={this.props.users}
                                                refreshComments={this.refreshComments}
                                                title='Cash to Close - 2nd Lien Notes'
                                                fieldName='Cash to Close - 2nd Lien'
                                                modalName='c2c_2ndLien'
                                                tabKey={2}
                                                close={this.closeNotes} />
                                        </Checkbox>
                                    </h4>
                                </Row>
                                {c2cLien}
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <Row><br /></Row>
                <Row style={rowTopBorder}>
                    <br />
                    <Col lg={7}>
                        <Row>
                            <h4 style={titles}>
                                <Button bsSize="xsmall"
                                        onClick={() => this.setState({ runAUS:true})}>
                                    <Glyphicon glyph="comment" />
                                </Button>
                                <DisplayNotes
                                    loan_id={this.state.worksheet[0].loan_id}
                                    displayModal={this.state.runAUS}
                                    comments={this.state.comments}
                                    users={this.props.users}
                                    refreshComments={this.refreshComments}
                                    title='AUS Notes'
                                    fieldName='Run AUS'
                                    modalName='runAUS'
                                    tabKey={2}
                                    close={this.closeNotes} />
                                &nbsp;
                                Have you run AUS?
                                {' '}
                                <FormControl
                                    componentClass="select"
                                    name="run_aus_options"
                                    value={this.state.worksheet[0].run_aus_options || ''}
                                    disabled={!this.state.isWorksheetEditable}
                                    onChange={this.handleChange}>
                                    <option value="none">...</option>
                                    <option value="LP">LP</option>
                                    <option value="DU">DU</option>
                                    <option value="GUS">GUS</option>
                                    <option value="N/A">N/A</option>
                                </FormControl>
                            </h4>
                            <Col lg={12}>
                                Result:
                                {' '}
                                <FormControl
                                    type="text"
                                    style={{ width: "350px"}}
                                    value={this.state.worksheet[0].run_aus_findings || ''}
                                    disabled={!this.state.isWorksheetEditable}
                                    onChange={this.handleChange}
                                    name="run_aus_findings"/>
                            </Col>
                        </Row>
                    </Col>
                    <Col lg={5}>
                        {dd214}
                    </Col>
                </Row>
            </Form>

        );
    }
}