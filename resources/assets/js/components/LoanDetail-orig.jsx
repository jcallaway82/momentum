import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import {
    PanelGroup, Panel, Form, FormGroup,
    Checkbox, ControlLabel, FormControl, Button,
    Grid, Row, Col, HelpBlock, Modal, Alert
    } from 'react-bootstrap';
import CountdownTimer from './LoanDetailComponents/CountdownTimer';
import FileServerBrowser from './LoanDetailComponents/FileServerBrowser';
import { FilePicker } from 'react-file-picker';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';

const procStatus = {
    'Added': 'Added',
    'Requested': 'Requested',
    'Received': 'Received',
    'Cleared': 'Cleared'
};

const procStatusTypes = [
    'Added',
    'Requested',
    'Received',
    'Cleared'
];

const uwStatus = {
    'Added': 'Added',
    'Rejected': 'Rejected',
    'Requested': 'Requested',
    'Received': 'Received',
    'Fulfilled': 'Fulfilled',
    'Cleared': 'Cleared',
    'Waived': 'Waived'
};

const uwStatusTypes = [
    'Added',
    'Rejected',
    'Requested',
    'Received',
    'Fulfilled',
    'Cleared',
    'Waived'
];

const uwPriorTo = {
    'Approval': 'Approval',
    'Closing': 'Closing',
    'Docs': 'Docs',
    'Funding': 'Funding'
};

const uwPriorToTypes = [
    'Approval',
    'Closing',
    'Docs',
    'Funding'
];

function enumFormatter(cell, row, enumObject) {
    return enumObject[cell];
}

export default class LoanDetail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tasks: taskList,
            isTaskEditable: false,
            editStartTime: null,
            userEditingTask: null,
            inputChanged: null,
            needsList: null,
            condList: null
        };
        this.allowTaskListEdit = this.allowTaskListEdit.bind(this);
        this.updateTaskList = this.updateTaskList.bind(this);
        this.getTaskLockedUser = this.getTaskLockedUser.bind(this);
        this.cancelUpdate = this.cancelUpdate.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.onUnload = this.onUnload.bind(this);
        this.procNeedsImport = this.procNeedsImport.bind(this);
        this.getNeedsList = this.getNeedsList.bind(this);
        this.uwCondImport = this.uwCondImport.bind(this);
        this.getCondList = this.getCondList.bind(this);
    }

    componentDidMount() {
        let self = this;
        self.getTaskLockedUser();
        self.getNeedsList();
        self.getCondList();
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
        axios.get('/checkIfTaskLocked/' + this.state.tasks[0].loan_id)
            .then(function(response) {
                self.setState({userEditingTask: response.data});
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
        if(self.state.userEditingTask) {
            alert(self.state.userEditingTask + ' is already editing this loan. Please try again later')
        } else {
            axios.post('/lockTaskForEdit', {
                    data: {
                        loan_id: self.state.tasks[0].loan_id
                    }
                })
                .then(function(response) {
                    self.setState({ isTaskEditable: true, inputChanged: true , editStartTime: Date.now()});
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
                tableName: 'taskLists',
                tasks: self.state.tasks[0],
            }
        })
            .then(function(response) {
                if(response.status == 403) {
                    alert('You do not have this record locked for editing. Please click edit and re-save' +
                        ' your changes.')
                }
                self.setState({ isTaskEditable: false, userEditingTask: null, inputChanged: null });
            }.bind(this))
            .catch(function(error){
                console.log(error);
                alert(error.response.data.messages);
            });
    }

    /**
     * Cancel changes to task list and refresh page
     */
    cancelUpdate() {
        let self = this;
        axios.post('/cancelUpdate', {
            data: {
                tableName: 'taskLists',
                loan_id: self.state.tasks[0].loan_id,
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

        // still need to setup appraisal due date validation
        /*if(name === "appraisal_due_date") {
            var t = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
            if (t === null) {
                alert('You entered an invalid date format. Please try again');
                return;
            }
        }*/

        let tempTasks = this.state.tasks.slice(); //creates the clone of the state
        tempTasks[0][name] = value;
        this.setState({tasks: tempTasks});
    }

    /**
     * Import processor need list to DB
     * @param FileObject - the file to be imported
     **/
    procNeedsImport(FileObject) {
        var formData = new FormData();
        formData.append("loan_id", this.state.tasks[0].loan_id);
        formData.append("procNeedsList", FileObject);

        let self = this;
        axios.post('/importProcNeedsList', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
            .then(function(response) {
                if(response.status == 200) {
                    console.log('Needs list imported!')
                }
                self.getNeedsList();
            }.bind(this))
            .catch(function(error){
                console.log(JSON.stringify(error));
                alert(error.response.data.messages);
            });
    }

    /**
     * Gets processor needs list from DB
     **/
    getNeedsList() {
        let self = this;
        axios.post('/getNeedsList', {
            loan_id: self.state.tasks[0].loan_id
        })
            .then(function(response) {
                self.setState({needsList: response.data});
            }.bind(this))
            .catch(function(error){
                console.log(error);
                alert('We were unable to retrieve all loans, please reload the page or contact your System' +
                    ' Administrator');
            });
    }

    /**
     * Import underwriter condition list to DB
     * @param FileObject - the file to be imported
     **/
    uwCondImport(FileObject) {
        var formData = new FormData();
        formData.append("loan_id", this.state.tasks[0].loan_id);
        formData.append("uwCondList", FileObject);

        let self = this;
        axios.post('/importUwCondList', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
            .then(function(response) {
                if(response.status == 200) {
                    console.log('Conditions list imported!')
                }
                self.getCondList();
            }.bind(this))
            .catch(function(error){
                console.log(JSON.stringify(error));
                alert(error.response.data.messages);
            });
    }

    /**
     * Gets underwriter condition list from DB
     **/
    getCondList() {
        let self = this;
        axios.post('/getCondList', {
            loan_id: self.state.tasks[0].loan_id
        })
            .then(function(response) {
                self.setState({condList: response.data});
            }.bind(this))
            .catch(function(error){
                console.log(error);
                alert('We were unable to retrieve all items, please reload the page or contact your System' +
                    ' Administrator');
            });
    }

    /**
     * Save cell for processor needs list
     * @param row       - the row being updated
     * @param cellName  - the name of the column
     * @param cellValue - the value to be updated
     **/
    afterSaveCell(row, cellName, cellValue) {
        let self = this;

        axios.post('/updateProcNeeds', {
            data: {
                need_list_id: row.id,
                column: cellName,
                value: cellValue
            }
        })
            .then(function(response){
                if(response.status == 200){
                    //console.log('success');
                    self.getNeedsList();
                }
            })
            .catch(function(error){
                if(error.response.status == 403){
                    let errors = error.response.data.messages;
                    alert(errors);
                    self.getNeedsList();
                }
                console.log(error);
            });
    }

    /**
     * Save cell for underwriter conditions list
     * @param row       - the row being updated
     * @param cellName  - the name of the column
     * @param cellValue - the value to be updated
     **/
    afterSaveCellUW(row, cellName, cellValue) {
        let self = this;

        axios.post('/updateCondList', {
            data: {
                cond_list_id: row.id,
                column: cellName,
                value: cellValue
            }
        })
            .then(function(response){
                if(response.status == 200){
                    //console.log('success');
                    self.getNeedsList();
                }
            })
            .catch(function(error){
                if(error.response.status == 403){
                    let errors = error.response.data.messages;
                    alert(errors);
                    self.getNeedsList();
                }
                console.log(error);
            });
    }

    render() {
        let cancelButton, saveButton, countdownTimer, userEditing;

        /**
         * Cell edit for processor needs list
         **/
        const cellEditProp = {
            mode: 'click',
            blurToSave: 'true',
            afterSaveCell: this.afterSaveCell.bind(this)
        };

        /**
         * Cell edit for underwriter conditions list
         **/
        const cellEditPropUW = {
            mode: 'click',
            blurToSave: 'true',
            afterSaveCell: this.afterSaveCellUW.bind(this)
        };

        if(this.state.isTaskEditable) {
            cancelButton =
                <Button
                    bsStyle="danger"
                    bsSize="small"
                    disabled={!this.state.isTaskEditable}
                    onClick={this.cancelUpdate}>
                    Cancel
                </Button>;
            saveButton =
                <Button
                    bsStyle="success"
                    bsSize="small"
                    disabled={!this.state.isTaskEditable}
                    onClick={this.updateTaskList}>
                    Save
                </Button>;
            countdownTimer = <CountdownTimer startTime={this.state.editStartTime}/>;
        }

        if(this.state.userEditingTask) {
            userEditing =
                <Alert bsStyle="warning">
                    <strong>{this.state.userEditingTask}</strong> is currently editing this task list.
                </Alert>
        }

        return (
            <PanelGroup>
                <Panel collapsible header="Task List" eventKey="1">
                    <Form inline onSubmit={this.updateTaskList}>
                        <Button
                            bsStyle="primary"
                            bsSize="small"
                            disabled={this.state.isTaskEditable}
                            onClick={this.allowTaskListEdit}>
                            Edit
                        </Button>{' '}
                        {saveButton}{' '}
                        {cancelButton}{' '}
                        {countdownTimer}
                        <br /><br />
                        {userEditing}
                        <Grid>
                            <Row className="show-grid">
{/********** 1st column start ***********/}
                                <Col lg={4}>
                                    <FormGroup>
                                        <Button
                                            bsSize="small"
                                            onClick={() => this.setState({ showModalSalesContract:true})}>
                                            <strong>Sales Contract</strong>
                                        </Button>
                                        <Modal show={this.state.showModalSalesContract}
                                               onHide={() => this.setState({ showModalSalesContract:false})}>
                                            <Modal.Header closeButton>
                                                <Modal.Title>Sales Contract Notes</Modal.Title>
                                            </Modal.Header>
                                            <Modal.Body>
                                                <FormControl
                                                    style={{ height: "150px", width: "100%"}}
                                                    componentClass="textarea"
                                                    value={this.state.tasks[0].sales_contract_notes || ''}
                                                    disabled={!this.state.isTaskEditable}
                                                    onChange={this.handleChange}
                                                    name="sales_contract_notes"/>
                                            </Modal.Body>
                                            <Modal.Footer>
                                                <Button onClick={() => this.setState({ showModalSalesContract:false})}>Close</Button>
                                            </Modal.Footer>
                                        </Modal>
                                        <br />
                                        <Checkbox
                                            defaultChecked={this.state.tasks[0].sales_contract_req}
                                            inline
                                            disabled={!this.state.isTaskEditable}
                                            onChange={this.handleChange}
                                            name="sales_contract_req">
                                            Requested
                                        </Checkbox>
                                        <br />
                                        <Checkbox
                                            defaultChecked={this.state.tasks[0].sales_contract_rcvd}
                                            inline
                                            disabled={!this.state.isTaskEditable}
                                            onChange={this.handleChange}
                                            name="sales_contract_rcvd">
                                            Received
                                        </Checkbox>
                                    </FormGroup>
                                    <br /><br />
                                    <FormGroup>
                                        <Button
                                            bsSize="small"
                                            onClick={() => this.setState({ showModalInitDisc:true})}>
                                            <strong>Initial Disclosures</strong>
                                        </Button>
                                        <Modal show={this.state.showModalInitDisc}
                                               onHide={() => this.setState({ showModalInitDisc:false})}>
                                            <Modal.Header closeButton>
                                                <Modal.Title>Initial Disclosures Notes</Modal.Title>
                                            </Modal.Header>
                                            <Modal.Body>
                                                <FormControl
                                                    style={{ height: "150px", width: "100%"}}
                                                    componentClass="textarea"
                                                    value={this.state.tasks[0].init_disc_notes || ''}
                                                    disabled={!this.state.isTaskEditable}
                                                    onChange={this.handleChange}
                                                    name="init_disc_notes"/>
                                            </Modal.Body>
                                            <Modal.Footer>
                                                <Button onClick={() => this.setState({ showModalInitDisc:false})}>Close</Button>
                                            </Modal.Footer>
                                        </Modal>
                                        <br />
                                        <Checkbox
                                            defaultChecked={this.state.tasks[0].init_disc_req}
                                            inline
                                            disabled={!this.state.isTaskEditable}
                                            onChange={this.handleChange}
                                            name="init_disc_req">
                                            Requested
                                        </Checkbox>
                                        <br />
                                        <Checkbox
                                            defaultChecked={this.state.tasks[0].init_disc_rcvd}
                                            inline
                                            disabled={!this.state.isTaskEditable}
                                            onChange={this.handleChange}
                                            name="init_disc_rcvd">
                                            Received
                                        </Checkbox>
                                    </FormGroup>
                                    <br /><br />
                                    <FormGroup>
                                        <Button
                                            bsSize="small"
                                            onClick={() => this.setState({ showModalWetSig:true})}>
                                            <strong>Wet Signatures</strong>
                                        </Button>
                                        <Modal show={this.state.showModalWetSig}
                                               onHide={() => this.setState({ showModalWetSig:false})}>
                                            <Modal.Header closeButton>
                                                <Modal.Title>Wet Signatures Notes</Modal.Title>
                                            </Modal.Header>
                                            <Modal.Body>
                                                <FormControl
                                                    style={{ height: "150px", width: "100%"}}
                                                    componentClass="textarea"
                                                    value={this.state.tasks[0].wet_sig_notes || ''}
                                                    disabled={!this.state.isTaskEditable}
                                                    onChange={this.handleChange}
                                                    name="wet_sig_notes"/>
                                            </Modal.Body>
                                            <Modal.Footer>
                                                <Button onClick={() => this.setState({ showModalWetSig:false})}>Close</Button>
                                            </Modal.Footer>
                                        </Modal>
                                        <br />
                                        <Checkbox
                                            defaultChecked={this.state.tasks[0].wet_sig_req}
                                            inline
                                            disabled={!this.state.isTaskEditable}
                                            onChange={this.handleChange}
                                            name="wet_sig_req">
                                            Requested
                                        </Checkbox>
                                        <br />
                                        <Checkbox
                                            defaultChecked={this.state.tasks[0].wet_sig_rcvd}
                                            inline
                                            disabled={!this.state.isTaskEditable}
                                            onChange={this.handleChange}
                                            name="wet_sig_rcvd">
                                            Received
                                        </Checkbox>
                                    </FormGroup>
                                    <br /><br />
                                    <FormGroup>
                                        <Button
                                            bsSize="small"
                                            onClick={() => this.setState({ showModalEmpHist:true})}>
                                            <strong>2 Year Employment History</strong>
                                        </Button>
                                        <Modal show={this.state.showModalEmpHist}
                                               onHide={() => this.setState({ showModalEmpHist:false})}>
                                            <Modal.Header closeButton>
                                                <Modal.Title>2 Year Employment History Notes</Modal.Title>
                                            </Modal.Header>
                                            <Modal.Body>
                                                <FormControl
                                                    style={{ height: "150px", width: "100%"}}
                                                    componentClass="textarea"
                                                    value={this.state.tasks[0].two_yr_emp_hist_notes || ''}
                                                    disabled={!this.state.isTaskEditable}
                                                    onChange={this.handleChange}
                                                    name="two_yr_emp_hist_notes"/>
                                            </Modal.Body>
                                            <Modal.Footer>
                                                <Button onClick={() => this.setState({ showModalEmpHist:false})}>Close</Button>
                                            </Modal.Footer>
                                        </Modal>
                                        <br />
                                        <Checkbox
                                            defaultChecked={this.state.tasks[0].two_yr_emp_hist_req}
                                            inline
                                            disabled={!this.state.isTaskEditable}
                                            onChange={this.handleChange}
                                            name="two_yr_emp_hist_req">
                                            Requested
                                        </Checkbox>
                                        <br />
                                        <Checkbox
                                            defaultChecked={this.state.tasks[0].two_yr_emp_hist_rcvd}
                                            inline
                                            disabled={!this.state.isTaskEditable}
                                            onChange={this.handleChange}
                                            name="two_yr_emp_hist_rcvd">
                                            Received
                                        </Checkbox>
                                        <br />
                                        <Checkbox
                                            defaultChecked={this.state.tasks[0].two_yr_emp_hist_na}
                                            inline
                                            disabled={!this.state.isTaskEditable}
                                            onChange={this.handleChange}
                                            name="two_yr_emp_hist_na">
                                            N/A
                                        </Checkbox>
                                    </FormGroup>
                                    <br /><br />
                                    <FormGroup>
                                        <Button
                                            bsSize="small"
                                            onClick={() => this.setState({ showModalAwardLetter:true})}>
                                            <strong>Award Letter Pension/SS/Disability</strong>
                                        </Button>
                                        <Modal show={this.state.showModalAwardLetter}
                                               onHide={() => this.setState({ showModalAwardLetter:false})}>
                                            <Modal.Header closeButton>
                                                <Modal.Title>Award Letter Pension/SS/Disability Notes</Modal.Title>
                                            </Modal.Header>
                                            <Modal.Body>
                                                <FormControl
                                                    style={{ height: "150px", width: "100%"}}
                                                    componentClass="textarea"
                                                    value={this.state.tasks[0].award_letter_notes || ''}
                                                    disabled={!this.state.isTaskEditable}
                                                    onChange={this.handleChange}
                                                    name="award_letter_notes"/>
                                            </Modal.Body>
                                            <Modal.Footer>
                                                <Button onClick={() => this.setState({ showModalAwardLetter:false})}>Close</Button>
                                            </Modal.Footer>
                                        </Modal>
                                        <br />
                                        <Checkbox
                                            defaultChecked={this.state.tasks[0].award_letter_req}
                                            inline
                                            disabled={!this.state.isTaskEditable}
                                            onChange={this.handleChange}
                                            name="award_letter_req">
                                            Requested
                                        </Checkbox>
                                        <br />
                                        <Checkbox
                                            defaultChecked={this.state.tasks[0].award_letter_rcvd}
                                            inline
                                            disabled={!this.state.isTaskEditable}
                                            onChange={this.handleChange}
                                            name="award_letter_rcvd">
                                            Received
                                        </Checkbox>
                                        <br />
                                        <Checkbox
                                            defaultChecked={this.state.tasks[0].award_letter_na}
                                            inline
                                            disabled={!this.state.isTaskEditable}
                                            onChange={this.handleChange}
                                            name="award_letter_na">
                                            N/A
                                        </Checkbox>
                                    </FormGroup>
                                    <br /><br />
                                    <FormGroup>
                                        <Button
                                            bsSize="small"
                                            onClick={() => this.setState({ showModalCredRep:true})}>
                                            <strong>Credit Report</strong>
                                        </Button>
                                        <Modal show={this.state.showModalCredRep}
                                               onHide={() => this.setState({ showModalCredRep:false})}>
                                            <Modal.Header closeButton>
                                                <Modal.Title>Credit Report Notes</Modal.Title>
                                            </Modal.Header>
                                            <Modal.Body>
                                                <FormControl
                                                    style={{ height: "150px", width: "100%"}}
                                                    componentClass="textarea"
                                                    value={this.state.tasks[0].cred_report_notes || ''}
                                                    disabled={!this.state.isTaskEditable}
                                                    onChange={this.handleChange}
                                                    name="cred_report_notes"/>
                                            </Modal.Body>
                                            <Modal.Footer>
                                                <Button onClick={() => this.setState({ showModalCredRep:false})}>Close</Button>
                                            </Modal.Footer>
                                        </Modal>
                                        <br />
                                        Score: {' '}
                                        <FormControl
                                            type="text"
                                            style={{ width: "75px"}}
                                            value={this.state.tasks[0].cred_report_score || ''}
                                            disabled={!this.state.isTaskEditable}
                                            onChange={this.handleChange}
                                            name="cred_report_score"/>
                                        {' '}
                                        Plan Re-Score: {' '}
                                        <FormControl
                                            componentClass="select"
                                            name="cred_report_plan_rescore"
                                            value={this.state.tasks[0].cred_report_plan_rescore}
                                            disabled={!this.state.isTaskEditable}
                                            onChange={this.handleChange}>
                                            <option value="1">Yes</option>
                                            <option value="0">No</option>
                                        </FormControl>
                                    </FormGroup>
                                    <br /><br />
                                    <FormGroup>
                                        <Button
                                            bsSize="small"
                                            onClick={() => this.setState({ showModalVerbCred:true})}>
                                            <strong>Verbal Credit Authorization</strong>
                                        </Button>
                                        <Modal show={this.state.showModalVerbCred}
                                               onHide={() => this.setState({ showModalVerbCred:false})}>
                                            <Modal.Header closeButton>
                                                <Modal.Title>Verbal Credit Authorization Notes</Modal.Title>
                                            </Modal.Header>
                                            <Modal.Body>
                                                <FormControl
                                                    style={{ height: "150px", width: "100%"}}
                                                    componentClass="textarea"
                                                    value={this.state.tasks[0].verb_cred_auth_notes || ''}
                                                    disabled={!this.state.isTaskEditable}
                                                    onChange={this.handleChange}
                                                    name="verb_cred_auth_notes"/>
                                            </Modal.Body>
                                            <Modal.Footer>
                                                <Button onClick={() => this.setState({ showModalVerbCred:false})}>Close</Button>
                                            </Modal.Footer>
                                        </Modal>
                                        <br />
                                        <Checkbox
                                            defaultChecked={this.state.tasks[0].verb_cred_auth_rcvd}
                                            inline
                                            disabled={!this.state.isTaskEditable}
                                            onChange={this.handleChange}
                                            name="verb_cred_auth_rcvd">
                                            Received
                                        </Checkbox>
                                    </FormGroup>
                                    <br /><br />
                                    <FormGroup>
                                        <Button
                                            bsSize="small"
                                            onClick={() => this.setState({ showModalCredLOE:true})}>
                                            <strong>Credit LOE</strong>
                                        </Button>
                                        <Modal show={this.state.showModalCredLOE}
                                               onHide={() => this.setState({ showModalCredLOE:false})}>
                                            <Modal.Header closeButton>
                                                <Modal.Title>Credit LOE Notes</Modal.Title>
                                            </Modal.Header>
                                            <Modal.Body>
                                                <FormControl
                                                    style={{ height: "150px", width: "100%"}}
                                                    componentClass="textarea"
                                                    value={this.state.tasks[0].cred_loe_notes || ''}
                                                    disabled={!this.state.isTaskEditable}
                                                    onChange={this.handleChange}
                                                    name="cred_loe_notes"/>
                                            </Modal.Body>
                                            <Modal.Footer>
                                                <Button onClick={() => this.setState({ showModalCredLOE:false})}>Close</Button>
                                            </Modal.Footer>
                                        </Modal>
                                        <br />
                                        <Checkbox
                                            defaultChecked={this.state.tasks[0].cred_loe_req}
                                            inline
                                            disabled={!this.state.isTaskEditable}
                                            onChange={this.handleChange}
                                            name="cred_loe_req">
                                            Requested
                                        </Checkbox>
                                        <br />
                                        <Checkbox
                                            defaultChecked={this.state.tasks[0].cred_loe_rcvd}
                                            inline
                                            disabled={!this.state.isTaskEditable}
                                            onChange={this.handleChange}
                                            name="cred_loe_rcvd">
                                            Received
                                        </Checkbox>
                                    </FormGroup>
                                    <br /><br />
                                    <FormGroup>
                                        <Button
                                            bsSize="small"
                                            onClick={() => this.setState({ showModalDrivLic:true})}>
                                            <strong>Drivers License(s)</strong>
                                        </Button>
                                        <Modal show={this.state.showModalDrivLic}
                                               onHide={() => this.setState({ showModalDrivLic:false})}>
                                            <Modal.Header closeButton>
                                                <Modal.Title>Drivers License(s) Notes</Modal.Title>
                                            </Modal.Header>
                                            <Modal.Body>
                                                <FormControl
                                                    style={{ height: "150px", width: "100%"}}
                                                    componentClass="textarea"
                                                    value={this.state.tasks[0].driv_lic_notes || ''}
                                                    disabled={!this.state.isTaskEditable}
                                                    onChange={this.handleChange}
                                                    name="driv_lic_notes"/>
                                            </Modal.Body>
                                            <Modal.Footer>
                                                <Button onClick={() => this.setState({ showModalDrivLic:false})}>Close</Button>
                                            </Modal.Footer>
                                        </Modal>
                                        <br />
                                        <Checkbox
                                            defaultChecked={this.state.tasks[0].driv_lic_req}
                                            inline
                                            disabled={!this.state.isTaskEditable}
                                            onChange={this.handleChange}
                                            name="driv_lic_req">
                                            Requested
                                        </Checkbox>
                                        <br />
                                        <Checkbox
                                            defaultChecked={this.state.tasks[0].driv_lic_rcvd}
                                            inline
                                            disabled={!this.state.isTaskEditable}
                                            onChange={this.handleChange}
                                            name="driv_lic_rcvd">
                                            Received
                                        </Checkbox>
                                    </FormGroup>
                                    <br /><br />
                                    <FormGroup>
                                        <Button
                                            bsSize="small"
                                            onClick={() => this.setState({ showModalPayStub:true})}>
                                            <strong>Paystubs</strong>
                                        </Button>
                                        <Modal show={this.state.showModalPayStub}
                                               onHide={() => this.setState({ showModalPayStub:false})}>
                                            <Modal.Header closeButton>
                                                <Modal.Title>Paystubs Notes</Modal.Title>
                                            </Modal.Header>
                                            <Modal.Body>
                                                <FormControl
                                                    style={{ height: "150px", width: "100%"}}
                                                    componentClass="textarea"
                                                    value={this.state.tasks[0].pay_stub_notes || ''}
                                                    disabled={!this.state.isTaskEditable}
                                                    onChange={this.handleChange}
                                                    name="pay_stub_notes"/>
                                            </Modal.Body>
                                            <Modal.Footer>
                                                <Button onClick={() => this.setState({ showModalPayStub:false})}>Close</Button>
                                            </Modal.Footer>
                                        </Modal>
                                        <br />
                                        <Checkbox
                                            defaultChecked={this.state.tasks[0].pay_stub_req}
                                            inline
                                            disabled={!this.state.isTaskEditable}
                                            onChange={this.handleChange}
                                            name="pay_stub_req">
                                            Requested
                                        </Checkbox>
                                        <br />
                                        <Checkbox
                                            defaultChecked={this.state.tasks[0].pay_stub_rcvd}
                                            inline
                                            disabled={!this.state.isTaskEditable}
                                            onChange={this.handleChange}
                                            name="pay_stub_rcvd">
                                            Received
                                        </Checkbox>
                                    </FormGroup>
                                    <br /><br />
                                    <FormGroup>
                                        <Button
                                            bsSize="small"
                                            onClick={() => this.setState({ showModalBankState:true})}>
                                            <strong>Bank Statements</strong>
                                        </Button>
                                        <Modal show={this.state.showModalBankState}
                                               onHide={() => this.setState({ showModalBankState:false})}>
                                            <Modal.Header closeButton>
                                                <Modal.Title>Bank Statements Notes</Modal.Title>
                                            </Modal.Header>
                                            <Modal.Body>
                                                <FormControl
                                                    style={{ height: "150px", width: "100%"}}
                                                    componentClass="textarea"
                                                    value={this.state.tasks[0].bank_stmnt_notes || ''}
                                                    disabled={!this.state.isTaskEditable}
                                                    onChange={this.handleChange}
                                                    name="bank_stmnt_notes"/>
                                            </Modal.Body>
                                            <Modal.Footer>
                                                <Button onClick={() => this.setState({ showModalBankState:false})}>Close</Button>
                                            </Modal.Footer>
                                        </Modal>
                                        <br />
                                        <Checkbox
                                            defaultChecked={this.state.tasks[0].bank_stmnt_req}
                                            inline
                                            disabled={!this.state.isTaskEditable}
                                            onChange={this.handleChange}
                                            name="bank_stmnt_req">
                                            Requested
                                        </Checkbox>
                                        <br />
                                        <Checkbox
                                            defaultChecked={this.state.tasks[0].bank_stmnt_rcvd}
                                            inline
                                            disabled={!this.state.isTaskEditable}
                                            onChange={this.handleChange}
                                            name="bank_stmnt_rcvd">
                                            Received
                                        </Checkbox>
                                    </FormGroup>
                                    <br /><br />
                                    <FormGroup>
                                        <Button
                                            bsSize="small"
                                            onClick={() => this.setState({ showModalTaxRtrn:true})}>
                                            <strong>Tax Returns</strong>
                                        </Button>
                                        <Modal show={this.state.showModalTaxRtrn}
                                               onHide={() => this.setState({ showModalTaxRtrn:false})}>
                                            <Modal.Header closeButton>
                                                <Modal.Title>Tax Returns Notes</Modal.Title>
                                            </Modal.Header>
                                            <Modal.Body>
                                                <FormControl
                                                    style={{ height: "150px", width: "100%"}}
                                                    componentClass="textarea"
                                                    value={this.state.tasks[0].tax_rtrn_notes || ''}
                                                    disabled={!this.state.isTaskEditable}
                                                    onChange={this.handleChange}
                                                    name="tax_rtrn_notes"/>
                                            </Modal.Body>
                                            <Modal.Footer>
                                                <Button onClick={() => this.setState({ showModalTaxRtrn:false})}>Close</Button>
                                            </Modal.Footer>
                                        </Modal>
                                        <br />
                                        <Checkbox
                                            defaultChecked={this.state.tasks[0].tax_rtrn_req}
                                            inline
                                            disabled={!this.state.isTaskEditable}
                                            onChange={this.handleChange}
                                            name="tax_rtrn_req">
                                            Requested
                                        </Checkbox>
                                        <br />
                                        <Checkbox
                                            defaultChecked={this.state.tasks[0].tax_rtrn_rcvd}
                                            inline
                                            disabled={!this.state.isTaskEditable}
                                            onChange={this.handleChange}
                                            name="tax_rtrn_rcvd">
                                            Received
                                        </Checkbox>
                                    </FormGroup>
                                    <br /><br />
                                    <FormGroup>
                                        <Button
                                            bsSize="small"
                                            onClick={() => this.setState({ showModalREODocs:true})}>
                                            <strong>REO Docs</strong>
                                        </Button>
                                        <Modal show={this.state.showModalREODocs}
                                               onHide={() => this.setState({ showModalREODocs:false})}>
                                            <Modal.Header closeButton>
                                                <Modal.Title>REO Docs Notes</Modal.Title>
                                            </Modal.Header>
                                            <Modal.Body>
                                                <FormControl
                                                    style={{ height: "150px", width: "100%"}}
                                                    componentClass="textarea"
                                                    value={this.state.tasks[0].reo_docs_notes || ''}
                                                    disabled={!this.state.isTaskEditable}
                                                    onChange={this.handleChange}
                                                    name="reo_docs_notes"/>
                                            </Modal.Body>
                                            <Modal.Footer>
                                                <Button onClick={() => this.setState({ showModalREODocs:false})}>Close</Button>
                                            </Modal.Footer>
                                        </Modal>
                                        <br />
                                        <Checkbox
                                            defaultChecked={this.state.tasks[0].reo_docs_req}
                                            inline
                                            disabled={!this.state.isTaskEditable}
                                            onChange={this.handleChange}
                                            name="reo_docs_req">
                                            Requested
                                        </Checkbox>
                                        <br />
                                        <Checkbox
                                            defaultChecked={this.state.tasks[0].reo_docs_rcvd}
                                            inline
                                            disabled={!this.state.isTaskEditable}
                                            onChange={this.handleChange}
                                            name="reo_docs_rcvd">
                                            Received
                                        </Checkbox>
                                        <br />
                                        <Checkbox
                                            defaultChecked={this.state.tasks[0].reo_docs_na}
                                            inline
                                            disabled={!this.state.isTaskEditable}
                                            onChange={this.handleChange}
                                            name="reo_docs_na">
                                            N/A
                                        </Checkbox>
                                    </FormGroup>
                                    <br /><br />
                                    <FormGroup>
                                        <Button
                                            bsSize="small"
                                            onClick={() => this.setState({ showModalDD214:true})}>
                                            <strong>DD214</strong>
                                        </Button>
                                        <Modal show={this.state.showModalDD214}
                                               onHide={() => this.setState({ showModalDD214:false})}>
                                            <Modal.Header closeButton>
                                                <Modal.Title>DD214 Notes</Modal.Title>
                                            </Modal.Header>
                                            <Modal.Body>
                                                <FormControl
                                                    style={{ height: "150px", width: "100%"}}
                                                    componentClass="textarea"
                                                    value={this.state.tasks[0].dd214_notes || ''}
                                                    disabled={!this.state.isTaskEditable}
                                                    onChange={this.handleChange}
                                                    name="dd214_notes"/>
                                            </Modal.Body>
                                            <Modal.Footer>
                                                <Button onClick={() => this.setState({ showModalDD214:false})}>Close</Button>
                                            </Modal.Footer>
                                        </Modal>
                                        <br />
                                        <Checkbox
                                            defaultChecked={this.state.tasks[0].dd214_req}
                                            inline
                                            disabled={!this.state.isTaskEditable}
                                            onChange={this.handleChange}
                                            name="dd214_req">
                                            Requested
                                        </Checkbox>
                                        <br />
                                        <Checkbox
                                            defaultChecked={this.state.tasks[0].dd214_rcvd}
                                            inline
                                            disabled={!this.state.isTaskEditable}
                                            onChange={this.handleChange}
                                            name="dd214_rcvd">
                                            Received
                                        </Checkbox>
                                        <br />
                                        <Checkbox
                                            defaultChecked={this.state.tasks[0].dd214_na}
                                            inline
                                            disabled={!this.state.isTaskEditable}
                                            onChange={this.handleChange}
                                            name="dd214_na">
                                            N/A
                                        </Checkbox>
                                    </FormGroup>
                                </Col>
{/********** 2nd column start ***********/}
                                <Col lg={4}>
                                    <FormGroup>
                                        <Button
                                            bsSize="small"
                                            onClick={() => this.setState({ showModalAppraisal:true})}>
                                            <strong>Appraisal</strong>
                                        </Button>
                                        <Modal show={this.state.showModalAppraisal}
                                               onHide={() => this.setState({ showModalAppraisal:false})}>
                                            <Modal.Header closeButton>
                                                <Modal.Title>Appraisal Notes</Modal.Title>
                                            </Modal.Header>
                                            <Modal.Body>
                                                <FormControl
                                                    style={{ height: "150px", width: "100%"}}
                                                    componentClass="textarea"
                                                    value={this.state.tasks[0].appraisal_notes || ''}
                                                    disabled={!this.state.isTaskEditable}
                                                    onChange={this.handleChange}
                                                    name="appraisal_notes"/>
                                            </Modal.Body>
                                            <Modal.Footer>
                                                <Button onClick={() => this.setState({ showModalAppraisal:false})}>Close</Button>
                                            </Modal.Footer>
                                        </Modal>
                                        <br />
                                        <Checkbox
                                            defaultChecked={this.state.tasks[0].appraisal_ord}
                                            inline
                                            disabled={!this.state.isTaskEditable}
                                            onChange={this.handleChange}
                                            name="appraisal_ord">
                                            Ordered
                                        </Checkbox>
                                        <br />
                                        <Checkbox
                                            defaultChecked={this.state.tasks[0].appraisal_rcvd}
                                            inline
                                            disabled={!this.state.isTaskEditable}
                                            onChange={this.handleChange}
                                            name="appraisal_rcvd">
                                            Received
                                        </Checkbox>
                                        <br />
                                        <Checkbox
                                            defaultChecked={this.state.tasks[0].appraisal_disclosed}
                                            inline
                                            disabled={!this.state.isTaskEditable}
                                            onChange={this.handleChange}
                                            name="appraisal_disclosed">
                                            Disclosed
                                        </Checkbox>
                                        <br />
                                        Due Date: {' '}
                                        <FormControl
                                            type="text"
                                            style={{ width: "80px"}}
                                            value={this.state.tasks[0].appraisal_due_date || ''}
                                            disabled={!this.state.isTaskEditable}
                                            onChange={this.handleChange}
                                            name="appraisal_due_date"/>
                                        <HelpBlock>(Must be in YYYY-MM-DD format)</HelpBlock>
                                        Value: {' '}
                                        <FormControl
                                            type="text"
                                            style={{ width: "80px"}}
                                            value={this.state.tasks[0].appraisal_value || ''}
                                            disabled={!this.state.isTaskEditable}
                                            onChange={this.handleChange}
                                            name="appraisal_value"/>
                                        {' '}
                                        Status: {' '}
                                        <FormControl
                                            type="text"
                                            style={{ width: "130px"}}
                                            value={this.state.tasks[0].appraisal_status || ''}
                                            disabled={!this.state.isTaskEditable}
                                            onChange={this.handleChange}
                                            name="appraisal_status"/>
                                    </FormGroup>
                                    <br /><br />
                                    <FormGroup>
                                        <Button
                                            bsSize="small"
                                            onClick={() => this.setState({ showModalTitleWork:true})}>
                                            <strong>Title Work</strong>
                                        </Button>
                                        <Modal show={this.state.showModalTitleWork}
                                               onHide={() => this.setState({ showModalTitleWork:false})}>
                                            <Modal.Header closeButton>
                                                <Modal.Title>Title Work Notes</Modal.Title>
                                            </Modal.Header>
                                            <Modal.Body>
                                                <FormControl
                                                    style={{ height: "150px", width: "100%"}}
                                                    componentClass="textarea"
                                                    value={this.state.tasks[0].title_work_notes || ''}
                                                    disabled={!this.state.isTaskEditable}
                                                    onChange={this.handleChange}
                                                    name="title_work_notes"/>
                                            </Modal.Body>
                                            <Modal.Footer>
                                                <Button onClick={() => this.setState({ showModalTitleWork:false})}>Close</Button>
                                            </Modal.Footer>
                                        </Modal>
                                        <br />
                                        <Checkbox
                                            defaultChecked={this.state.tasks[0].title_work_req}
                                            inline
                                            disabled={!this.state.isTaskEditable}
                                            onChange={this.handleChange}
                                            name="title_work_req">
                                            Requested
                                        </Checkbox>
                                        <br />
                                        <Checkbox
                                            defaultChecked={this.state.tasks[0].title_work_rcvd}
                                            inline
                                            disabled={!this.state.isTaskEditable}
                                            onChange={this.handleChange}
                                            name="title_work_rcvd">
                                            Received
                                        </Checkbox>
                                    </FormGroup>
                                    <br /><br />
                                    <FormGroup>
                                        <Button
                                            bsSize="small"
                                            onClick={() => this.setState({ showModalSurvey:true})}>
                                            <strong>Survey</strong>
                                        </Button>
                                        <Modal show={this.state.showModalSurvey}
                                               onHide={() => this.setState({ showModalSurvey:false})}>
                                            <Modal.Header closeButton>
                                                <Modal.Title>Survey Notes</Modal.Title>
                                            </Modal.Header>
                                            <Modal.Body>
                                                <FormControl
                                                    style={{ height: "150px", width: "100%"}}
                                                    componentClass="textarea"
                                                    value={this.state.tasks[0].survey_notes || ''}
                                                    disabled={!this.state.isTaskEditable}
                                                    onChange={this.handleChange}
                                                    name="survey_notes"/>
                                            </Modal.Body>
                                            <Modal.Footer>
                                                <Button onClick={() => this.setState({ showModalSurvey:false})}>Close</Button>
                                            </Modal.Footer>
                                        </Modal>
                                        <br />
                                        <Checkbox
                                            defaultChecked={this.state.tasks[0].appraisal_ord}
                                            inline
                                            disabled={!this.state.isTaskEditable}
                                            onChange={this.handleChange}
                                            name="survey_req_status">
                                            Request Status
                                        </Checkbox>
                                        <br />
                                        <Checkbox
                                            defaultChecked={this.state.tasks[0].survey_ord}
                                            inline
                                            disabled={!this.state.isTaskEditable}
                                            onChange={this.handleChange}
                                            name="survey_ord">
                                            Ordered
                                        </Checkbox>
                                        <br />
                                        <Checkbox
                                            defaultChecked={this.state.tasks[0].survey_rcvd}
                                            inline
                                            disabled={!this.state.isTaskEditable}
                                            onChange={this.handleChange}
                                            name="survey_rcvd">
                                            Received
                                        </Checkbox>
                                        <br />
                                        Order Due Date: {' '}
                                        <FormControl
                                            type="text"
                                            style={{ width: "80px"}}
                                            value={this.state.tasks[0].survey_ord_due_date || ''}
                                            disabled={!this.state.isTaskEditable}
                                            onChange={this.handleChange}
                                            name="survey_ord_due_date"/>
                                        <HelpBlock>(Must be in YYYY-MM-DD format)</HelpBlock>
                                    </FormGroup>
                                    <br /><br />
                                    <FormGroup>
                                        <Button
                                            bsSize="small"
                                            onClick={() => this.setState({ showModalHazIns:true})}>
                                            <strong>Hazard Insurance</strong>
                                        </Button>
                                        <Modal show={this.state.showModalHazIns}
                                               onHide={() => this.setState({ showModalHazIns:false})}>
                                            <Modal.Header closeButton>
                                                <Modal.Title>Hazard Insurance Notes</Modal.Title>
                                            </Modal.Header>
                                            <Modal.Body>
                                                <FormControl
                                                    style={{ height: "150px", width: "100%"}}
                                                    componentClass="textarea"
                                                    value={this.state.tasks[0].hazard_ins_notes || ''}
                                                    disabled={!this.state.isTaskEditable}
                                                    onChange={this.handleChange}
                                                    name="hazard_ins_notes"/>
                                            </Modal.Body>
                                            <Modal.Footer>
                                                <Button onClick={() => this.setState({ showModalHazIns:false})}>Close</Button>
                                            </Modal.Footer>
                                        </Modal>
                                        <br />
                                        <Checkbox
                                            defaultChecked={this.state.tasks[0].hazard_ins_quote}
                                            inline
                                            disabled={!this.state.isTaskEditable}
                                            onChange={this.handleChange}
                                            name="hazard_ins_quote">
                                            Quote
                                        </Checkbox>
                                        <br />
                                        <Checkbox
                                            defaultChecked={this.state.tasks[0].hazard_ins_bind_req}
                                            inline
                                            disabled={!this.state.isTaskEditable}
                                            onChange={this.handleChange}
                                            name="hazard_ins_bind_req">
                                            Binder Requested
                                        </Checkbox>
                                        <br />
                                        <Checkbox
                                            defaultChecked={this.state.tasks[0].hazard_ins_bind_rcvd}
                                            inline
                                            disabled={!this.state.isTaskEditable}
                                            onChange={this.handleChange}
                                            name="hazard_ins_bind_rcvd">
                                            Binder Received
                                        </Checkbox>
                                    </FormGroup>
                                    <br /><br />
                                    <FormGroup>
                                        <Button
                                            bsSize="small"
                                            onClick={() => this.setState({ showModalFloodCert:true})}>
                                            <strong>Flood Certification</strong>
                                        </Button>
                                        <Modal show={this.state.showModalFloodCert}
                                               onHide={() => this.setState({ showModalFloodCert:false})}>
                                            <Modal.Header closeButton>
                                                <Modal.Title>Flood Certification Notes</Modal.Title>
                                            </Modal.Header>
                                            <Modal.Body>
                                                <FormControl
                                                    style={{ height: "150px", width: "100%"}}
                                                    componentClass="textarea"
                                                    value={this.state.tasks[0].flood_cert_notes || ''}
                                                    disabled={!this.state.isTaskEditable}
                                                    onChange={this.handleChange}
                                                    name="flood_cert_notes"/>
                                            </Modal.Body>
                                            <Modal.Footer>
                                                <Button onClick={() => this.setState({ showModalFloodCert:false})}>Close</Button>
                                            </Modal.Footer>
                                        </Modal>
                                        <br />
                                        <Checkbox
                                            defaultChecked={this.state.tasks[0].flood_cert_ord}
                                            inline
                                            disabled={!this.state.isTaskEditable}
                                            onChange={this.handleChange}
                                            name="flood_cert_ord">
                                            Ordered
                                        </Checkbox>
                                        <br />
                                        <Checkbox
                                            defaultChecked={this.state.tasks[0].flood_cert_in_zone}
                                            inline
                                            disabled={!this.state.isTaskEditable}
                                            onChange={this.handleChange}
                                            name="flood_cert_in_zone">
                                            Flood Zone
                                        </Checkbox>
                                        <br />
                                        <Checkbox
                                            defaultChecked={this.state.tasks[0].flood_cert_out_zone}
                                            inline
                                            disabled={!this.state.isTaskEditable}
                                            onChange={this.handleChange}
                                            name="flood_cert_out_zone">
                                            Not Flood Zone
                                        </Checkbox>
                                    </FormGroup>
                                    <br /><br />
                                    <FormGroup>
                                        <Button
                                            bsSize="small"
                                            onClick={() => this.setState({ showModalUSPS:true})}>
                                            <strong>USPS</strong>
                                        </Button>
                                        <Modal show={this.state.showModalUSPS}
                                               onHide={() => this.setState({ showModalUSPS:false})}>
                                            <Modal.Header closeButton>
                                                <Modal.Title>USPS Notes</Modal.Title>
                                            </Modal.Header>
                                            <Modal.Body>
                                                <FormControl
                                                    style={{ height: "150px", width: "100%"}}
                                                    componentClass="textarea"
                                                    value={this.state.tasks[0].usps_notes || ''}
                                                    disabled={!this.state.isTaskEditable}
                                                    onChange={this.handleChange}
                                                    name="usps_notes"/>
                                            </Modal.Body>
                                            <Modal.Footer>
                                                <Button onClick={() => this.setState({ showModalUSPS:false})}>Close</Button>
                                            </Modal.Footer>
                                        </Modal>
                                        <br />
                                        <Checkbox
                                            defaultChecked={this.state.tasks[0].usps_req}
                                            inline
                                            disabled={!this.state.isTaskEditable}
                                            onChange={this.handleChange}
                                            name="usps_req">
                                            Requested
                                        </Checkbox>
                                        <br />
                                        <Checkbox
                                            defaultChecked={this.state.tasks[0].usps_rcvd}
                                            inline
                                            disabled={!this.state.isTaskEditable}
                                            onChange={this.handleChange}
                                            name="usps_rcvd">
                                            Received
                                        </Checkbox>
                                    </FormGroup>
                                    <br /><br />
                                    <FormGroup>
                                        <Button
                                            bsSize="small"
                                            onClick={() => this.setState({ showModalFHA:true})}>
                                            <strong>FHA Case Number</strong>
                                        </Button>
                                        <Modal show={this.state.showModalFHA}
                                               onHide={() => this.setState({ showModalFHA:false})}>
                                            <Modal.Header closeButton>
                                                <Modal.Title>FHA Case Number Notes</Modal.Title>
                                            </Modal.Header>
                                            <Modal.Body>
                                                <FormControl
                                                    style={{ height: "150px", width: "100%"}}
                                                    componentClass="textarea"
                                                    value={this.state.tasks[0].fha_case_num_notes || ''}
                                                    disabled={!this.state.isTaskEditable}
                                                    onChange={this.handleChange}
                                                    name="fha_case_num_notes"/>
                                            </Modal.Body>
                                            <Modal.Footer>
                                                <Button onClick={() => this.setState({ showModalFHA:false})}>Close</Button>
                                            </Modal.Footer>
                                        </Modal>
                                        <br />
                                        <Checkbox
                                            defaultChecked={this.state.tasks[0].fha_case_num_req}
                                            inline
                                            disabled={!this.state.isTaskEditable}
                                            onChange={this.handleChange}
                                            name="fha_case_num_req">
                                            Requested
                                        </Checkbox>
                                        <br />
                                        <Checkbox
                                            defaultChecked={this.state.tasks[0].fha_case_num_rcvd}
                                            inline
                                            disabled={!this.state.isTaskEditable}
                                            onChange={this.handleChange}
                                            name="fha_case_num_rcvd">
                                            Received
                                        </Checkbox>
                                        <br />
                                        <Checkbox
                                            defaultChecked={this.state.tasks[0].fha_case_num_na}
                                            inline
                                            disabled={!this.state.isTaskEditable}
                                            onChange={this.handleChange}
                                            name="fha_case_num_na">
                                            N/A
                                        </Checkbox>
                                    </FormGroup>
                                    <br /><br />
                                    <FormGroup>
                                        <Button
                                            bsSize="small"
                                            onClick={() => this.setState({ showModalVOECurr:true})}>
                                            <strong>VOE Current Employer</strong>
                                        </Button>
                                        <Modal show={this.state.showModalVOECurr}
                                               onHide={() => this.setState({ showModalVOECurr:false})}>
                                            <Modal.Header closeButton>
                                                <Modal.Title>VOE Current Employer Notes</Modal.Title>
                                            </Modal.Header>
                                            <Modal.Body>
                                                <FormControl
                                                    style={{ height: "150px", width: "100%"}}
                                                    componentClass="textarea"
                                                    value={this.state.tasks[0].voe_curr_emp_notes || ''}
                                                    disabled={!this.state.isTaskEditable}
                                                    onChange={this.handleChange}
                                                    name="voe_curr_emp_notes"/>
                                            </Modal.Body>
                                            <Modal.Footer>
                                                <Button onClick={() => this.setState({ showModalVOECurr:false})}>Close</Button>
                                            </Modal.Footer>
                                        </Modal>
                                        <br />
                                        <Checkbox
                                            defaultChecked={this.state.tasks[0].voe_curr_emp_req}
                                            inline
                                            disabled={!this.state.isTaskEditable}
                                            onChange={this.handleChange}
                                            name="voe_curr_emp_req">
                                            Requested
                                        </Checkbox>
                                        <br />
                                        <Checkbox
                                            defaultChecked={this.state.tasks[0].voe_curr_emp_rcvd}
                                            inline
                                            disabled={!this.state.isTaskEditable}
                                            onChange={this.handleChange}
                                            name="voe_curr_emp_rcvd">
                                            Received
                                        </Checkbox>
                                        <br />
                                        <Checkbox
                                            defaultChecked={this.state.tasks[0].voe_curr_emp_na}
                                            inline
                                            disabled={!this.state.isTaskEditable}
                                            onChange={this.handleChange}
                                            name="voe_curr_emp_na">
                                            N/A
                                        </Checkbox>
                                    </FormGroup>
                                    <br /><br />
                                    <FormGroup>
                                        <Button
                                            bsSize="small"
                                            onClick={() => this.setState({ showModalVOEPrev:true})}>
                                            <strong>VOE Previous Employer</strong>
                                        </Button>
                                        <Modal show={this.state.showModalVOEPrev}
                                               onHide={() => this.setState({ showModalVOEPrev:false})}>
                                            <Modal.Header closeButton>
                                                <Modal.Title>VOE Previous Employer Notes</Modal.Title>
                                            </Modal.Header>
                                            <Modal.Body>
                                                <FormControl
                                                    style={{ height: "150px", width: "100%"}}
                                                    componentClass="textarea"
                                                    value={this.state.tasks[0].voe_prev_emp_notes || ''}
                                                    disabled={!this.state.isTaskEditable}
                                                    onChange={this.handleChange}
                                                    name="voe_prev_emp_notes"/>
                                            </Modal.Body>
                                            <Modal.Footer>
                                                <Button onClick={() => this.setState({ showModalVOEPrev:false})}>Close</Button>
                                            </Modal.Footer>
                                        </Modal>
                                        <br />
                                        <Checkbox
                                            defaultChecked={this.state.tasks[0].voe_prev_emp_req}
                                            inline
                                            disabled={!this.state.isTaskEditable}
                                            onChange={this.handleChange}
                                            name="voe_prev_emp_req">
                                            Requested
                                        </Checkbox>
                                        <br />
                                        <Checkbox
                                            defaultChecked={this.state.tasks[0].voe_prev_emp_rcvd}
                                            inline
                                            disabled={!this.state.isTaskEditable}
                                            onChange={this.handleChange}
                                            name="voe_prev_emp_rcvd">
                                            Received
                                        </Checkbox>
                                        <br />
                                        <Checkbox
                                            defaultChecked={this.state.tasks[0].voe_prev_emp_na}
                                            inline
                                            disabled={!this.state.isTaskEditable}
                                            onChange={this.handleChange}
                                            name="voe_prev_emp_na">
                                            N/A
                                        </Checkbox>
                                    </FormGroup>
                                    <br /><br />
                                    <FormGroup>
                                        <Button
                                            bsSize="small"
                                            onClick={() => this.setState({ showModalNMLS:true})}>
                                            <strong>NMLS</strong>
                                        </Button>
                                        <Modal show={this.state.showModalNMLS}
                                               onHide={() => this.setState({ showModalNMLS:false})}>
                                            <Modal.Header closeButton>
                                                <Modal.Title>NMLS Notes</Modal.Title>
                                            </Modal.Header>
                                            <Modal.Body>
                                                <FormControl
                                                    style={{ height: "150px", width: "100%"}}
                                                    componentClass="textarea"
                                                    value={this.state.tasks[0].nmls_notes || ''}
                                                    disabled={!this.state.isTaskEditable}
                                                    onChange={this.handleChange}
                                                    name="nmls_notes"/>
                                            </Modal.Body>
                                            <Modal.Footer>
                                                <Button onClick={() => this.setState({ showModalNMLS:false})}>Close</Button>
                                            </Modal.Footer>
                                        </Modal>
                                        <br />
                                        <Checkbox
                                            defaultChecked={this.state.tasks[0].nmls_rcvd}
                                            inline
                                            disabled={!this.state.isTaskEditable}
                                            onChange={this.handleChange}
                                            name="nmls_rcvd">
                                            Received
                                        </Checkbox>
                                    </FormGroup>
                                    <br /><br />
                                    <FormGroup>
                                        <Button
                                            bsSize="small"
                                            onClick={() => this.setState({ showModalSSVal:true})}>
                                            <strong>Social Security Validation</strong>
                                        </Button>
                                        <Modal show={this.state.showModalSSVal}
                                               onHide={() => this.setState({ showModalSSVal:false})}>
                                            <Modal.Header closeButton>
                                                <Modal.Title>Social Security Validation Notes</Modal.Title>
                                            </Modal.Header>
                                            <Modal.Body>
                                                <FormControl
                                                    style={{ height: "150px", width: "100%"}}
                                                    componentClass="textarea"
                                                    value={this.state.tasks[0].ss_val_notes || ''}
                                                    disabled={!this.state.isTaskEditable}
                                                    onChange={this.handleChange}
                                                    name="ss_val_notes"/>
                                            </Modal.Body>
                                            <Modal.Footer>
                                                <Button onClick={() => this.setState({ showModalSSVal:false})}>Close</Button>
                                            </Modal.Footer>
                                        </Modal>
                                        <br />
                                        <Checkbox
                                            defaultChecked={this.state.tasks[0].ss_val_req}
                                            inline
                                            disabled={!this.state.isTaskEditable}
                                            onChange={this.handleChange}
                                            name="ss_val_req">
                                            Requested
                                        </Checkbox>
                                        <br />
                                        <Checkbox
                                            defaultChecked={this.state.tasks[0].ss_val_rcvd}
                                            inline
                                            disabled={!this.state.isTaskEditable}
                                            onChange={this.handleChange}
                                            name="ss_val_rcvd">
                                            Received
                                        </Checkbox>
                                    </FormGroup>
                                    <br /><br />
                                    <FormGroup>
                                        <Button
                                            bsSize="small"
                                            onClick={() => this.setState({ showModalTaxTrans:true})}>
                                            <strong>Tax Transcripts - 1040</strong>
                                        </Button>
                                        <Modal show={this.state.showModalTaxTrans}
                                               onHide={() => this.setState({ showModalTaxTrans:false})}>
                                            <Modal.Header closeButton>
                                                <Modal.Title>Tax Transcripts - 1040 Notes</Modal.Title>
                                            </Modal.Header>
                                            <Modal.Body>
                                                <FormControl
                                                    style={{ height: "150px", width: "100%"}}
                                                    componentClass="textarea"
                                                    value={this.state.tasks[0].tax_trans_notes || ''}
                                                    disabled={!this.state.isTaskEditable}
                                                    onChange={this.handleChange}
                                                    name="tax_trans_notes"/>
                                            </Modal.Body>
                                            <Modal.Footer>
                                                <Button onClick={() => this.setState({ showModalTaxTrans:false})}>Close</Button>
                                            </Modal.Footer>
                                        </Modal>
                                        <br />
                                        <Checkbox
                                            defaultChecked={this.state.tasks[0].tax_trans_req}
                                            inline
                                            disabled={!this.state.isTaskEditable}
                                            onChange={this.handleChange}
                                            name="tax_trans_req">
                                            Requested
                                        </Checkbox>
                                        <br />
                                        <Checkbox
                                            defaultChecked={this.state.tasks[0].tax_trans_rcvd}
                                            inline
                                            disabled={!this.state.isTaskEditable}
                                            onChange={this.handleChange}
                                            name="tax_trans_rcvd">
                                            Received
                                        </Checkbox>
                                    </FormGroup>
                                    <br /><br />
                                    <FormGroup>
                                        <Button
                                            bsSize="small"
                                            onClick={() => this.setState({ showModalW2Trans:true})}>
                                            <strong>W2 Transcripts</strong>
                                        </Button>
                                        <Modal show={this.state.showModalW2Trans}
                                               onHide={() => this.setState({ showModalW2Trans:false})}>
                                            <Modal.Header closeButton>
                                                <Modal.Title>W2 Transcripts Notes</Modal.Title>
                                            </Modal.Header>
                                            <Modal.Body>
                                                <FormControl
                                                    style={{ height: "150px", width: "100%"}}
                                                    componentClass="textarea"
                                                    value={this.state.tasks[0].w2_trans_notes || ''}
                                                    disabled={!this.state.isTaskEditable}
                                                    onChange={this.handleChange}
                                                    name="w2_trans_notes"/>
                                            </Modal.Body>
                                            <Modal.Footer>
                                                <Button onClick={() => this.setState({ showModalW2Trans:false})}>Close</Button>
                                            </Modal.Footer>
                                        </Modal>
                                        <br />
                                        <Checkbox
                                            defaultChecked={this.state.tasks[0].w2_trans_req}
                                            inline
                                            disabled={!this.state.isTaskEditable}
                                            onChange={this.handleChange}
                                            name="w2_trans_req">
                                            Requested
                                        </Checkbox>
                                        <br />
                                        <Checkbox
                                            defaultChecked={this.state.tasks[0].w2_trans_rcvd}
                                            inline
                                            disabled={!this.state.isTaskEditable}
                                            onChange={this.handleChange}
                                            name="w2_trans_rcvd">
                                            Received
                                        </Checkbox>
                                    </FormGroup>
                                    <br /><br />
                                    <FormGroup>
                                        <Button
                                            bsSize="small"
                                            onClick={() => this.setState({ showModalCOE:true})}>
                                            <strong>COE</strong>
                                        </Button>
                                        <Modal show={this.state.showModalCOE}
                                               onHide={() => this.setState({ showModalCOE:false})}>
                                            <Modal.Header closeButton>
                                                <Modal.Title>COE Notes</Modal.Title>
                                            </Modal.Header>
                                            <Modal.Body>
                                                <FormControl
                                                    style={{ height: "150px", width: "100%"}}
                                                    componentClass="textarea"
                                                    value={this.state.tasks[0].coe_trans_notes || ''}
                                                    disabled={!this.state.isTaskEditable}
                                                    onChange={this.handleChange}
                                                    name="coe_trans_notes"/>
                                            </Modal.Body>
                                            <Modal.Footer>
                                                <Button onClick={() => this.setState({ showModalCOE:false})}>Close</Button>
                                            </Modal.Footer>
                                        </Modal>
                                        <br />
                                        <Checkbox
                                            defaultChecked={this.state.tasks[0].coe_trans_ord}
                                            inline
                                            disabled={!this.state.isTaskEditable}
                                            onChange={this.handleChange}
                                            name="coe_trans_ord">
                                            Ordered
                                        </Checkbox>
                                        <br />
                                        <Checkbox
                                            defaultChecked={this.state.tasks[0].coe_trans_rcvd}
                                            inline
                                            disabled={!this.state.isTaskEditable}
                                            onChange={this.handleChange}
                                            name="coe_trans_rcvd">
                                            Received
                                        </Checkbox>
                                        <br />
                                        <Checkbox
                                            defaultChecked={this.state.tasks[0].coe_trans_na}
                                            inline
                                            disabled={!this.state.isTaskEditable}
                                            onChange={this.handleChange}
                                            name="coe_trans_na">
                                            N/A
                                        </Checkbox>
                                    </FormGroup>
                                </Col>
{/********** 3rd column start ***********/}
                                <Col lg={4}>
                                    <FormGroup>
                                        <Button
                                            bsSize="small"
                                            onClick={() => this.setState({ showModalRunAUS:true})}>
                                            <strong>Run AUS</strong>
                                        </Button>
                                        <Modal show={this.state.showModalRunAUS}
                                               onHide={() => this.setState({ showModalRunAUS:false})}>
                                            <Modal.Header closeButton>
                                                <Modal.Title>Run AUS Notes</Modal.Title>
                                            </Modal.Header>
                                            <Modal.Body>
                                                <FormControl
                                                    style={{ height: "150px", width: "100%"}}
                                                    componentClass="textarea"
                                                    value={this.state.tasks[0].run_aus_notes || ''}
                                                    disabled={!this.state.isTaskEditable}
                                                    onChange={this.handleChange}
                                                    name="run_aus_notes"/>
                                            </Modal.Body>
                                            <Modal.Footer>
                                                <Button onClick={() => this.setState({ showModalRunAUS:false})}>Close</Button>
                                            </Modal.Footer>
                                        </Modal>
                                        <br />
                                        Options:&nbsp; {' '}
                                        <FormControl
                                            componentClass="select"
                                            name="run_aus_options"
                                            value={this.state.tasks[0].run_aus_options}
                                            disabled={!this.state.isTaskEditable}
                                            onChange={this.handleChange}>
                                            <option value="none">...</option>
                                            <option value="LP">LP</option>
                                            <option value="DU">DU</option>
                                            <option value="GUS">GUS</option>
                                        </FormControl>
                                        <br />
                                        Findings: {' '}
                                        <FormControl
                                            type="text"
                                            style={{ width: "150px"}}
                                            value={this.state.tasks[0].run_aus_findings || ''}
                                            disabled={!this.state.isTaskEditable}
                                            onChange={this.handleChange}
                                            name="run_aus_findings"/>
                                    </FormGroup>
                                </Col>
                            </Row>
                        </Grid>
                    </Form>
                </Panel>
                <Panel collapsible header="Processing Needs List" eventKey="2">
                    <FilePicker
                        extensions={['xlsx']}
                        onChange={FileObject => this.procNeedsImport(FileObject)}
                        onError={errMsg => console.log(errMsg)}
                        >
                        <button>
                            Click to upload needs list
                        </button>
                    </FilePicker>
                    <br />
                    <BootstrapTable data={ this.state.needsList }
                                    cellEdit={ cellEditProp }
                                    striped hover condensed
                                    scrollTop={ 'Bottom' }>
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
                            thStyle={ { whiteSpace: 'normal' } }
                            tdStyle={ { whiteSpace: 'normal' } }
                            dataField='name'
                            editable={ false }>
                            Name
                        </TableHeaderColumn>
                        <TableHeaderColumn
                            width='300'
                            headerAlign='center'
                            thStyle={ { whiteSpace: 'normal' } }
                            tdStyle={ { whiteSpace: 'normal' } }
                            dataField='description'
                            editable={ false }>
                            Description
                        </TableHeaderColumn>
                        <TableHeaderColumn
                            width='50'
                            headerAlign='center'
                            thStyle={ { whiteSpace: 'normal' } }
                            tdStyle={ { whiteSpace: 'normal' } }
                            filterFormatted dataFormat={ enumFormatter }
                            formatExtraData={ procStatus }
                            filter={ { type: 'SelectFilter', options: procStatus } }
                            editable={ { type: 'select', options: { values: procStatusTypes } } }
                            dataField='status'
                            dataAlign='center'>
                            Status
                        </TableHeaderColumn>
                        <TableHeaderColumn
                            width='110'
                            headerAlign='center'
                            thStyle={ { whiteSpace: 'normal' } }
                            tdStyle={ { whiteSpace: 'normal' } }
                            dataField='notes'
                            editable={ { type: 'textarea' } }>
                            Notes
                        </TableHeaderColumn>
                    </BootstrapTable>
                </Panel>
                <Panel collapsible header="Underwriter Conditions List" eventKey="3">
                    <FilePicker
                        extensions={['xlsx']}
                        onChange={FileObject => this.uwCondImport(FileObject)}
                        onError={errMsg => console.log(errMsg)}
                    >
                        <button>
                            Click to upload conditions list
                        </button>
                    </FilePicker>
                    <br />
                    <BootstrapTable data={ this.state.condList }
                                    cellEdit={ cellEditPropUW }
                                    striped hover condensed
                                    scrollTop={ 'Bottom' }>
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
                            thStyle={ { whiteSpace: 'normal' } }
                            tdStyle={ { whiteSpace: 'normal' } }
                            dataField='name'
                            editable={ false }>
                            Name
                        </TableHeaderColumn>
                        <TableHeaderColumn
                            width='300'
                            headerAlign='center'
                            thStyle={ { whiteSpace: 'normal' } }
                            tdStyle={ { whiteSpace: 'normal' } }
                            dataField='description'
                            editable={ false }>
                            Description
                        </TableHeaderColumn>
                        <TableHeaderColumn
                            width='50'
                            headerAlign='center'
                            thStyle={ { whiteSpace: 'normal' } }
                            tdStyle={ { whiteSpace: 'normal' } }
                            filterFormatted dataFormat={ enumFormatter }
                            formatExtraData={ uwPriorTo }
                            filter={ { type: 'SelectFilter', options: uwPriorTo } }
                            editable={ { type: 'select', options: { values: uwPriorToTypes } } }
                            dataField='prior_to'
                            dataAlign='center'>
                            Prior To
                        </TableHeaderColumn>
                        <TableHeaderColumn
                            width='50'
                            headerAlign='center'
                            thStyle={ { whiteSpace: 'normal' } }
                            tdStyle={ { whiteSpace: 'normal' } }
                            filterFormatted dataFormat={ enumFormatter }
                            formatExtraData={ uwStatus }
                            filter={ { type: 'SelectFilter', options: uwStatus } }
                            editable={ { type: 'select', options: { values: uwStatusTypes } } }
                            dataField='status'
                            dataAlign='center'>
                            Status
                        </TableHeaderColumn>
                        <TableHeaderColumn
                            width='110'
                            headerAlign='center'
                            thStyle={ { whiteSpace: 'normal' } }
                            tdStyle={ { whiteSpace: 'normal' } }
                            dataField='notes'
                            editable={ { type: 'textarea' } }>
                            Notes
                        </TableHeaderColumn>
                    </BootstrapTable>
                </Panel>
                <Panel collapsible header="Document Upload" eventKey="4">
                    <Grid>
                        <Row className="show-grid">
                            <Col lg={4}>
                                <Form>
                                    <FormGroup controlId="formControlsFile">
                                        <ControlLabel>Upload Documents</ControlLabel>
                                        <FormControl
                                            type="file"
                                            //onChange={this.procNeedsImport}
                                            //ref={ele => this.fileInput = ele}
                                        />
                                    </FormGroup>
                                    <Button
                                        bsStyle="primary"
                                        bsSize="small"
                                        //onClick={this.procNeedsImport}
                                    >
                                        Upload
                                    </Button>
                                </Form>
                            </Col>
                            <Col lg={8}>
                                
                            </Col>
                        </Row>
                    </Grid>
                </Panel>
            </PanelGroup>
        );
    }
}

if (document.getElementById('loanDetail')) {
    ReactDOM.render(<LoanDetail taskList={window.taskList}/>, document.getElementById('loanDetail'));
}
