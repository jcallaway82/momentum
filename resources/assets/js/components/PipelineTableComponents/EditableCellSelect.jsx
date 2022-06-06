import React, { Component } from 'react';
import { Select, Icon, message } from 'antd';
const Option = Select.Option;

export default class EditableCellSelect extends Component {
    constructor(props) {
        super(props);

        this.state = {
            editable: false
        };
    }

    handleChange = (value) => {
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

    cancelEdit = () => {
        this.setState({ editable: false });
    };

    edit = () => {
        this.setState({ editable: true });
    };

    render() {
        let options;
        const editable = this.state.editable;
        const value = this.props.value;

        options = this.props.options.map ((option, index) =>
            <Option key={index} value={option}>
                {option}
            </Option>
        );

        return (
            <div className="editable-cell">
                {
                    editable ?
                        <div className="editable-cell-input-wrapper">
                            <Select
                                value={value}
                                size='small'
                                style={{width: this.props.width}}
                                onChange={this.handleChange}
                                onBlur={this.cancelEdit}
                                autoFocus={true}
                            >
                                {options}
                            </Select>
                        </div>
                        :
                        <div onClick={this.edit}>
                            {value || ' '}
                        </div>
                }
            </div>
        );
    }
}
