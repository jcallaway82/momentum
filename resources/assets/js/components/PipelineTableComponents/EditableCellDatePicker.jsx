import React, { Component } from 'react';
import { DatePicker, Icon, message } from 'antd';
var moment = require('moment');

function dateFormatter(cell) {
    return cell ? moment(cell, "YYYY/MM/DD").format("MM/DD/YYYY") : "";
}

export default class EditableCellDatePicker extends Component {
    constructor(props) {
        super(props);

        this.state = {
            editable: false
        };
    }

    handleChange = (value) => {
        message.info(value);
        let data = {
            route: this.props.route,
            loan_id: this.props.item.loan_id,
            item_id: this.props.item.id,
            column: this.props.column,
            value: value
        };
        this.props.refresh(data);
        this.setState({ editable: false });
    };

    cancelEdit = (open) => {
        if(!open) {
            this.setState({ editable: false });
        }
        //
    };

    edit = () => {
        this.setState({ editable: true });
    };

    render() {
        const editable = this.state.editable;
        const value = ((this.props.value === null) ? null : moment(this.props.value));

        return (
            <div>
                {
                    editable ?
                        (
                            value ?
                                <DatePicker
                                        size='small'
                                        defaultValue={value}
                                        format='MM/DD/YYYY'
                                        onChange={(e) => this.handleChange(e)}
                                        onOpenChange={this.cancelEdit}
                                        open={true}
                                        allowClear={false}
                                        style={{ width: 120 }}
                                    />
                            :
                                <DatePicker
                                        size='small'
                                        format='MM/DD/YYYY'
                                        onChange={(e) => this.handleChange(e)}
                                        onOpenChange={this.cancelEdit}
                                        open={true}
                                        allowClear={false}
                                    />
                        )
                        :
                        <div onClick={this.edit}>
                            {dateFormatter(value) || 'Not Selected'}
                        </div>
                }
            </div>
        );
    }
}
