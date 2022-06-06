import React, { Component } from 'react';
import { Button } from 'antd'
import { Modal } from 'react-bootstrap';
import ConversationLog from '../ConversationLog';
var moment = require('moment');

export default class DisplayComment extends Component {
    constructor(props) {
        super(props);
    }

    render() {

        return (
            <Modal
                bsSize="large"
                show={this.props.displayModal}
                onHide={() => this.props.close(this.props.fieldName)}>
                <Modal.Header>
                    <Modal.Title>{this.props.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <ConversationLog loan_id={this.props.loan_id}
                                     users={this.props.users}
                                     tabKey={this.props.tabKey}
                                     fieldName={this.props.fieldName}
                                     comments={this.props.comments}
                                     refreshComments={this.props.refreshComments}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={() => this.props.close(this.props.modalName)}>Close</Button>
                </Modal.Footer>
            </Modal>
        );

    }
};