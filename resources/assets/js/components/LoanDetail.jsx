import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { Tabs, Button, Alert, message } from 'antd';
import OfficerWorksheet from './LoanDetailComponents/OfficerWorksheet';
import ProcessorWorksheet from './LoanDetailComponents/ProcessorWorksheet';
import ConversationLog from './LoanDetailComponents/ConversationLog';
import ProcessingNeedsTable from './LoanDetailComponents/ProcessingNeedsTable';
import UWConditionsTable from './LoanDetailComponents/UWConditionsTable';
import FileContacts from './LoanDetailComponents/FileContacts';
import { FilePicker } from 'react-file-picker';

const TabPane = Tabs.TabPane;

export default class LoanDetail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            officerWorksheet: data.officerWorksheet,
            processorWorksheet: data.processorWorksheet,
            borrowers: data.borrowers,
            reos: data.reos,
            loanInfo: data.loanInfo,
            fileContacts: data.fileContacts,
            comments: data.comments,
            users: data.users,
            key: data.key,
            notesField: data.notesField,
            procNeedsList: data.procNeedsList,
            procNeedsListComments: data.procNeedsListComments,
            uwCondList: data.uwCondList,
            uwCondListComments: data.uwCondListComments,
            isTaskEditable: false,
            inputChanged: null,
        };
        this.onUnload = this.onUnload.bind(this);
        this.procNeedsImport = this.procNeedsImport.bind(this);
        this.uwCondImport = this.uwCondImport.bind(this);
        this.refreshComments = this.refreshComments.bind(this);
        this.handleTabSelect = this.handleTabSelect.bind(this);
    }

    componentDidMount() {
        let self = this;
        window.addEventListener("beforeunload", this.onUnload)
    }

    componentWillUnmount() {
        window.removeEventListener("beforeunload", this.onUnload)
    }

    onUnload(event) { // the method that will be used for both add and remove event
        if(this.state.inputChanged) {
            event.returnValue = "Changes have not been saved." +
                " Are you sure you want to leave?";
        }
    }

    /**
     * Import processor need list to DB
     * @param FileObject - the file to be imported
     **/
    procNeedsImport(FileObject) {
        let self = this;
        var formData = new FormData();
        formData.append("loan_id", this.state.processorWorksheet[0].loan_id);
        formData.append("procNeedsList", FileObject);

        axios.post('/importProcNeedsList', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
            .then(function(response) {
                if(response.status == 200) {
                    self.setState({ procNeedsList: response.data['data'] });
                }
            }.bind(this))
            .catch(function(error){
                console.log(JSON.stringify(error));
                alert(error.response.data.messages);
            });
    }

    /**
     * Import underwriter condition list to DB
     * @param FileObject - the file to be imported
     **/
    uwCondImport(FileObject) {
        var formData = new FormData();
        formData.append("loan_id", this.state.processorWorksheet[0].loan_id);
        formData.append("uwCondList", FileObject);

        let self = this;
        axios.post('/importUwCondList', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
            .then(function(response) {
                if(response.status == 200) {
                    self.setState({ uwCondList: response.data['data'] });
                }
            }.bind(this))
            .catch(function(error){
                console.log(JSON.stringify(error));
                alert(error.response.data.messages);
            });
    }

    /**
     * Refreshes state from comments that have been added or deleted
     * @param comments   array of current generalConvoLog comments
     */
    refreshComments(comments) {
        let self = this;
        self.setState({comments: comments});
    }

    refreshProcNeedsList = (data) => {
        let self = this;
        self.setState({ procNeedsList: data })
    };

    refreshUwCondList = (data) => {
        let self = this;
        self.setState({ uwCondList: data })
    };

    handleTabSelect(key) {
        this.setState({ key: key });
    }

    render() {

        return (
            <Tabs
                activeKey={this.state.key}
                onChange={this.handleTabSelect}
                justified
                id="loanDetail">
                <TabPane key="1" tab="Conversation Log">
                    <ConversationLog loan_id={this.state.officerWorksheet[0].loan_id}
                                     users={this.state.users}
                                     fieldName='Conversation Log'
                                     tabKey={1}
                                     comments={this.state.comments}
                                     refreshComments={this.refreshComments}
                    />
                </TabPane>
                <TabPane key="2" tab="Loan Officer Worksheet">
                    <div style={{ height: 700, overflowY: 'scroll' }}>
                        <OfficerWorksheet
                            worksheet={this.state.officerWorksheet}
                            users={this.state.users}
                            inputChanged={this.state.inputChanged}
                            borrowers={this.state.borrowers}
                            loanInfo={this.state.loanInfo}
                            comments={this.state.comments}
                            notesField={this.state.notesField}
                        />
                    </div>
                </TabPane>
                <TabPane key="3" tab="Processor Worksheet">
                    <div style={{ height: 700, overflowY: 'scroll' }}>
                        <ProcessorWorksheet
                            worksheet={this.state.processorWorksheet}
                            users={this.state.users}
                            inputChanged={this.state.inputChanged}
                            borrowers={this.state.borrowers}
                            reos={this.state.reos}
                            loanInfo={this.state.loanInfo}
                            comments={this.state.comments}
                            notesField={this.state.notesField}
                        />
                    </div>
                </TabPane>
                <TabPane key="4" tab="Processing Needs List">
                    <br />
                    <FilePicker
                        extensions={['xlsx']}
                        onChange={FileObject => this.procNeedsImport(FileObject)}
                        onError={errMsg => console.log(errMsg)}
                        >
                        <Button>
                            Click to upload needs list
                        </Button>
                    </FilePicker>
                    <br />
                    <ProcessingNeedsTable
                        loan_id={this.state.officerWorksheet[0].loan_id}
                        procNeedsList={this.state.procNeedsList}
                        users={this.state.users}
                        comments={this.state.procNeedsListComments}
                        refreshComments={this.refreshComments}
                        refreshList={this.refreshProcNeedsList}
                    />
                </TabPane>
                <TabPane key="5" tab="UW Conditions List">
                    <br />
                    <FilePicker
                        extensions={['xlsx']}
                        onChange={FileObject => this.uwCondImport(FileObject)}
                        onError={errMsg => console.log(errMsg)}
                    >
                        <Button>
                            Click to upload conditions list
                        </Button>
                    </FilePicker>
                    <br />
                    <UWConditionsTable
                        loan_id={this.state.officerWorksheet[0].loan_id}
                        uwCondList={this.state.uwCondList}
                        users={this.state.users}
                        comments={this.state.uwCondListComments}
                        refreshComments={this.refreshComments}
                        refreshList={this.refreshUwCondList}
                    />
                </TabPane>
                {/*<TabPane key="6" tab="Document Upload">
                    <br />
                    <Alert
                        message="Pending Development"
                        description="This feature has not been implemented."
                        type="warning"
                        showIcon
                    />
                </TabPane>*/}
                <TabPane key="6" tab="File Contacts">
                    <br />
                    <FileContacts fileContacts={this.state.fileContacts}/>
                </TabPane>
            </Tabs>
        );
    }
}

if (document.getElementById('loanDetail')) {
    ReactDOM.render(<LoanDetail
                        data={window.data}
                    />, document.getElementById('loanDetail'));
}
