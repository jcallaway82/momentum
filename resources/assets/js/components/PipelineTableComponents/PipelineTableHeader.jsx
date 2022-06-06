import React, { Component } from 'react';
import { message } from 'antd';
import PipelineTableFilter from './PipelineTableFilter';

export default class PipelineTableHeader extends Component {
    constructor(props) {
        super(props);
    }

    render() {

        return (
            <div>
                <PipelineTableFilter
                    loanOfficers={this.props.loanOfficers}
                    loanProcessors={this.props.loanProcessors}
                    filters={this.props.filters}
                    refreshTable={this.props.refreshTable}
                />
            </div>
        );
    }
}
