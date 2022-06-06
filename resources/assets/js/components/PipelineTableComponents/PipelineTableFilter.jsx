import React, { Component } from 'react';
import { Button, Popover, message } from 'antd';
import TreeDropDown from './TreeDropDown';
import axios from "axios/index";

export default class PipelineTableFilter extends Component {
    constructor(props) {
        super(props);

        this.state = {
            menuVisible: false,
            loanOfficers: null,
            loanProcessors: null,
            reviewStatusFilter: null,
            loanPurposeFilter: null,
            milestoneFilter: null,
            loanOfficerFilter: null,
            loanProcessorFilter: null,
        };
    }

    componentWillMount() {
        this.setFilters(this.props.filters);
        this.setState({
            loanOfficers: this.props.loanOfficers,
            loanProcessors: this.props.loanProcessors
        });
    }

    setFilters = (data) => {
        let reviewStatusArray = [], loanPurposeArray = [], milestoneArray = [],
            loanOfficerArray = [], loanProcessorArray = [];

        data.map((filter) => {
            let tempArray = {
                'name': filter['filter_name'],
                'value': filter['filter_value']
            };
            switch(filter['filter_name']) {
                case 'review_status':
                    return reviewStatusArray = reviewStatusArray.concat(tempArray);
                case 'loan_purpose':
                    return loanPurposeArray = loanPurposeArray.concat(tempArray);
                case 'milestone':
                    return milestoneArray = milestoneArray.concat(tempArray);
                case 'tm_loan_officer':
                    return loanOfficerArray = loanOfficerArray.concat(tempArray);
                case 'tm_loan_processor':
                    return loanProcessorArray = loanProcessorArray.concat(tempArray);
            }
        });

        this.setState({
            reviewStatusFilter: reviewStatusArray,
            loanPurposeFilter: loanPurposeArray,
            milestoneFilter: milestoneArray,
            loanOfficerFilter: loanOfficerArray,
            loanProcessorFilter: loanProcessorArray
        });
    };

    onMenuVisibleChange = (visible) => {
        this.setState({
            menuVisible: visible,
        });
    };

    saveFilter = () => {
        let self = this;
        axios.post('/updateFilters', {
            data: {
                reviewStatus: this.state.reviewStatusFilter,
                loanPurpose: this.state.loanPurposeFilter,
                milestone: this.state.milestoneFilter,
                loanOfficer: this.state.loanOfficerFilter,
                loanProcessor: this.state.loanProcessorFilter
            }
        })
            .then(function(response){
                if(response.status === 200){
                    self.setState({
                        menuVisible: false,
                    });
                    self.setFilters(response.data.filters);
                    self.props.refreshTable();
                }
            })
            .catch(function(error){
                if(error.response.status === 403){
                    message.error(error.response.data.messages);
                    self.setState({ menuVisible: false });
                }
                console.log(error);
            });
    };

    clearFilters = () => {
        let self = this;
        axios.get('/clearFilters')
            .then(function(response){
                if(response.status === 200){
                    self.setFilters(response.data.filters);
                    self.props.refreshTable();
                    self.setState({ menuVisible: false });
                }
            })
            .catch(function(error){
                if(error.response.status === 403){
                    message.error(error.response.data.messages);
                    self.setState({ menuVisible: false });
                }
                console.log(error);
            });
    };

    updateFilters = (incName, incValues) => {
        switch(incName) {
            case 'review_status':
                return this.setState({
                    reviewStatusFilter: incValues.map((incValue) => {
                        if(incValue !== incName) {
                            return {
                                name: incName,
                                value: incValue,
                            }
                        } else {
                            return null;
                        }
                    })
                });
            case 'loan_purpose':
                return this.setState({
                    loanPurposeFilter: incValues.map((incValue) => {
                        if(incValue !== incName) {
                            return {
                                name: incName,
                                value: incValue,
                            }
                        } else {
                            return null;
                        }
                    })
                });
            case 'milestone':
                return this.setState({
                    milestoneFilter: incValues.map((incValue) => {
                        if(incValue !== incName) {
                            return {
                                name: incName,
                                value: incValue,
                            }
                        } else {
                            return null;
                        }
                    })
                });
            case 'tm_loan_officer':
                return this.setState({
                    loanOfficerFilter: incValues.map((incValue) => {
                        if(incValue !== incName) {
                            return {
                                name: incName,
                                value: incValue,
                            }
                        } else {
                            return null;
                        }
                    })
                });
            case 'tm_loan_processor':
                return this.setState({
                    loanProcessorFilter: incValues.map((incValue) => {
                        if(incValue !== incName) {
                            return {
                                name: incName,
                                value: incValue,
                            }
                        } else {
                            return null;
                        }
                    })
                });
        }
    };

    render() {
        const reviewStatus = [{
            title: 'Review Status',
            key: 'review_status',
            children: [
                { title: 'Construction Pending Completion', key: 'Construction Pending Completion' },
                { title: 'Dead', key: 'Dead' },
                { title: 'Active', key: 'Active' },
            ],
        }];

        const loanPurpose = [{
            title: 'Loan Purpose',
            key: 'loan_purpose',
            children: [
                { title: '1. Home Purchase', key: '1. Home Purchase' },
                { title: '2. Home Improvement', key: '2. Home Improvement' },
                { title: '31. Refinancing', key: '31. Refinancing' },
                { title: '32. Cash-out refinancing', key: '32. Cash-out refinancing' },
                { title: '4. Other purpose', key: '4. Other purpose' },
                { title: '5. Not applicable', key: '5. Not applicable' }
            ],
        }];

        const currentMilestone = [{
            title: 'Current Milestone',
            key: 'milestone',
            children: [
                { title: 'Started', key: 'Started' },
                { title: 'Qualification', key: 'Qualification' },
                { title: 'Processing', key: 'Processing' },
                { title: 'Submittal', key: 'Submittal' },
                { title: 'Cond. Approval', key: 'Cond. Approval' },
                { title: 'Resubmittal', key: 'Resubmittal' },
                { title: 'Approval', key: 'Approval' },
                { title: 'Ready for Docs', key: 'Ready for Docs' },
                { title: 'Docs Out', key: 'Docs Out' },
                { title: 'Docs Signing', key: 'Docs Signing' },
                { title: 'Funding', key: 'Funding'},
                { title: 'Shipping', key: 'Shipping'},
                { title: 'Purchased', key: 'Purchased'},
                { title: 'Reconciled', key: 'Reconciled'},
                { title: 'Completion', key: 'Completion'},
                { title: 'Doc Preparation', key: 'Doc Preparation'},
                { title: 'Post Closing', key: 'Post Closing'}
            ],
        }];

        const loanOfficers =  [{
            title: 'Loan Officers',
            key: 'tm_loan_officer',
            children: this.state.loanOfficers
        }];

        const loanProcessors = [{
            title: 'Loan Processors',
            key: 'tm_loan_processor',
            children: this.state.loanProcessors
        }];

        const reviewStatusFilter = this.state.reviewStatusFilter;
        const loanPurposeFilter = this.state.loanPurposeFilter;
        const milestoneFilter = this.state.milestoneFilter;
        const loanOfficerFilter = this.state.loanOfficerFilter;
        const loanProcessorFilter = this.state.loanProcessorFilter;

        const menu = (
            <div>
                <Button onClick={this.saveFilter}>Apply Filters</Button>&nbsp;&nbsp;
                {
                    (
                        this.state.reviewStatusFilter.length !== 0 ||
                        this.state.loanPurposeFilter.length !== 0 ||
                        this.state.milestoneFilter.length !== 0 ||
                        this.state.loanOfficerFilter.length !== 0 ||
                        this.state.loanProcessorFilter.length !== 0
                    )
                        ?
                        <Button type='danger' onClick={this.clearFilters}>Clear All Filters</Button>
                        :
                        ''
                }
                <br />
                <TreeDropDown data={reviewStatus} updateFilters={this.updateFilters} filters={reviewStatusFilter} title={'review_status'} />
                <TreeDropDown data={loanPurpose} updateFilters={this.updateFilters} filters={loanPurposeFilter} title={'loan_purpose'} />
                <TreeDropDown data={currentMilestone} updateFilters={this.updateFilters} filters={milestoneFilter} title={'milestone'} />
                <TreeDropDown data={loanOfficers} updateFilters={this.updateFilters} filters={loanOfficerFilter} title={'tm_loan_officer'} />
                <TreeDropDown data={loanProcessors} updateFilters={this.updateFilters} filters={loanProcessorFilter} title={'tm_loan_processor'} />
            </div>
        );

        return (
            <Popover
                placement="bottomLeft"
                title="Please select your filtering options."
                content={menu}
                trigger="click"
                visible={this.state.menuVisible}
                onVisibleChange={this.onMenuVisibleChange}
            >
                <Button type={(
                    this.state.reviewStatusFilter.length !== 0 ||
                    this.state.loanPurposeFilter.length !== 0 ||
                    this.state.milestoneFilter.length !== 0 ||
                    this.state.loanOfficerFilter.length !== 0 ||
                    this.state.loanProcessorFilter.length !== 0) ? 'primary' : 'default'}
                >
                    Customize
                </Button>
            </Popover>
        );
    }
}
