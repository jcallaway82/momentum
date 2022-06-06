import React, { Component } from 'react';
import { Modal, Button, DatePicker, message } from 'antd';
var moment = require('moment');

export default class DisplayTooltip extends Component {
    constructor(props) {
        super(props);
        this.state = {
            field: null,
        }
    }

    handleHide = () => {
        if (this.state.field === null) {
            message.error('Please enter a date.')
        } else {
            this.props.close(this.props.modalName)
        }
    };

    handleDateChange = (event) => {
        this.setState({ field: event });
        this.props.handleDateChange(this.props.modalName, event);
    };

    render() {

        return (
            <Modal
                visible={this.props.displayModal}
                title={this.props.title}
                onCancel={this.handleHide}
                onHide={this.handleHide}
                footer={[
                    <Button key="back" onClick={this.handleHide}>Finished</Button>,
                ]}
            >
                Please enter the {this.props.title}:&nbsp;
                <DatePicker
                    defaultValue={this.props.value}
                    format='MM/DD/YYYY'
                    onChange={(e) => this.handleDateChange(e)}
                />
            </Modal>
        );
    }
}
