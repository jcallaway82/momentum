import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { Badge, Icon, Menu, Dropdown, message } from 'antd';
import PubNubReact from 'pubnub-react';

const noteFields = {
    'Conversation Log': 'convoLog',
    'Property Type': 'propertyType',
    'Sales Contract': 'salesContract',
    'Wet Sigs': 'wetSigs',
    'Initial Disclosure': 'initDisclosures',
    'Locked LE': 'lockedLE',
    'Closing Disclosure': 'closingDisclosures',
    'Credit Report': 'creditReport',
    'NPS': 'nps',
    'Bankruptcy History': 'bankruptcyHist',
    'Verbal Credit Auth': 'verbalCredAuth',
    'Foreclosure History': 'foreclosureHist',
    'Credit LOE': 'creditLOE',
    'Child Support & Agreement': 'childSupport',
    'Drivers License': 'driversLicense',
    'Divorce Decree': 'divorceDecree',
    'Other Properties': 'otherProperties',
    'Other Debts': 'otherDebts',
    '2 Year Employment History': 'twoYrEmpHist',
    'Income': 'income',
    'Paystubs': 'paystubs',
    'Tax Returns': 'taxReturns',
    'Pension/SS Award Letter': 'pensionSSAward',
    'Cash to Close': 'c2c',
    'Cash to Close - Checking': 'c2c_checking',
    'Cash to Close - Gift': 'c2c_gift',
    'Cash to Close - DPA': 'c2c_dpa',
    'Cash to Close - 2nd Lien': 'c2c_2ndLien',
    'Run AUS': 'runAUS',
    'DD214': 'dd214',
    'Title Work': 'titleWork',
    'Survey': 'survey',
    'Hazard Insurance': 'hazardInsurance',
    'Appraisal': 'appraisal',
    'Final': 'final',
    'Current VOE': 'currentVOE',
    'Prior VOE': 'priorVOE',
    'Residual Income': 'residualIncome',
    'SS Validation': 'ssValidation',
    'Transcripts': 'transcripts',
    'Fraudguard': 'fraudguard',
    'Flood Cert': 'floodCert',
    'REO': 'reo',
    'FHA Case Assign': 'fhaCaseAssign',
    'COE': 'coe',
    'USPS': 'usps',
    'NMLS': 'nmls'
};

export default class NewAlerts extends React.Component {

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
            count: 0,
            comments:  {
                borrowers: null
            },
            menuVisible: false
        };
        this.pubnub.init(this);
        this.getAlerts = this.getAlerts.bind(this);
        this.clearAllAlerts = this.clearAllAlerts.bind(this);
        this.clearAlert = this.clearAlert.bind(this);
        this.openLoanDetail = this.openLoanDetail.bind(this);
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
                this.getAlerts();
                console.log(message);
            }
        });

        this.pubnub.subscribe({
            channels: ['alerts']
        });
    }

    componentDidMount() {
        this.getAlerts();
    }

    componentWillUnmount() {
        this.pubnub.unsubscribe({
            channels: ['alerts']
        });
    }

    getAlerts() {
        let self = this;
        axios.get('/getAlerts')
            .then(function(response) {
                //message.error(response.data.numComments);
                self.setState({count: response.data.numComments, comments: response.data.groupedBy});
            }.bind(this))
            .catch(function(error){
                console.log(error);
                message.error(error);
            });
    }

    clearAllAlerts() {
        let self = this;
        axios.get('/clearAllAlerts')
            .then(function(response) {
                self.setState({count: response.data.numComments, comments: response.data.groupedBy});
                this.pubnub.publish(
                    {
                        message: 'all comments cleared',
                        channel: 'alerts'
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
                console.log(error.message);
                message.error(error.message);
            });
    }

    clearAlert(commentId) {
        let self = this;
        this.setState({menuVisible: true});
        axios.post('/clearAlert', {
            data: {
                comment_id: commentId
            }
        })
            .then(function(response) {
                message.success("Alert deleted");
                self.setState({count: response.data.numComments, comments: response.data.groupedBy});
                this.pubnub.publish(
                    {
                        message: 'comment cleared',
                        channel: 'alerts'
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
                console.log(error.message);
                message.error(error.message);
            });
    }

    openLoanDetail(loan_id, borrower_name, comment_id, tabKey, field_name) {
        this.clearAlert(comment_id);
        let $fieldName = noteFields[field_name];
        window.open('/loanDetail/' + loan_id + "/" + tabKey + "/" + $fieldName, borrower_name);
    }

    onMenuVisibleChange = (visible) => {
        this.setState({
            menuVisible: visible,
        });
    };

    render() {
        let menuList, menu;

        if(this.state.comments.borrowers !== null) {
            menuList = Object.keys(this.state.comments.borrowers).map((borrower, id) =>
                (
                    <Menu.SubMenu key={id}
                                  title={
                                      <span><Icon type="edit" />
                                         <span>
                                              &nbsp;{this.state.comments.borrowers[borrower].title}
                                          </span>
                                      </span>}
                    >
                        {this.state.comments.borrowers[borrower].entries.map((entry, i) =>
                            (
                                <Menu.ItemGroup
                                        key={i}
                                        title={"From: " + entry.user + " on " + entry.field_name}>
                                    <Menu.Item key={i}>
                                        <div>
                                            <span
                                                style={{ display: 'inline-block', maxWidth: 400, whiteSpace: 'normal' }}
                                                onClick={() => this.openLoanDetail(
                                                    entry.loan_id,
                                                    entry.borrower_name,
                                                    entry.comment_id,
                                                    entry.tabKey,
                                                    entry.field_name
                                                )}
                                            >
                                                {entry.text}
                                            </span>
                                            <span style={{float: 'right'}} onClick={() => this.clearAlert(entry.comment_id)}>
                                                &nbsp;&nbsp;&nbsp;|&nbsp;
                                                <a>Delete</a>
                                            </span>
                                        </div>
                                    </Menu.Item>
                                </Menu.ItemGroup>
                            ))}
                    </Menu.SubMenu>
                ))
        } else {
            menuList =
                <Menu.Item key="1">No New Alerts!</Menu.Item>
        }

        menu = (
            <Menu>
                {menuList}
                <Menu.Divider />
                <Menu.Item key="clear">
                    <span>
                        <Icon type="delete" />
                        &nbsp;
                        <span onClick={this.clearAllAlerts}>
                            Clear All Alerts
                        </span>
                    </span>
                </Menu.Item>
            </Menu>
        );

        return (
            <Dropdown
                overlay={menu}
                trigger={['click']}
                visible={this.state.menuVisible}
                onVisibleChange={this.onMenuVisibleChange}
            >
                <span className="ant-dropdown-link">
                    Alerts
                    &nbsp;
                    <Badge count={this.state.count} style={{ backgroundColor: '#52c41a' }}/>
                </span>
            </Dropdown>
        );
    }
}

if (document.getElementById('newAlerts')) {
    ReactDOM.render(<NewAlerts />, document.getElementById('newAlerts'));
}
