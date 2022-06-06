var strtotime = require('strtotime');
var moment = require('moment');
import React, { Component } from 'react';
import { Card, Col, Row, Popover, Icon } from 'antd';

export default class FileContacts extends Component {
    constructor(props) {
        super(props);

        this.state = {
            visible: false,
        };
    }

    hide = () => {
        this.setState({
            visible: false,
        });
    };

    handleVisibleChange = () => {
        this.setState({
            visible: true,
        });
    };

    render() {
        const fileContacts = this.props.fileContacts;

        const TitleCompany =
            <div>
                Title Company
                <div style={{ float: 'right' }}>
                    <Popover
                        placement="topRight"
                        title="Add Email"
                        content={<a onClick={this.hide}>Close</a>}
                        trigger="click"
                        onBlur={this.hide}
                        visible={this.state.visible}
                        onVisibleChange={this.handleVisibleChange}
                    >
                        <Icon type="plus-circle-o" style={{ fontSize: 14 }} />
                        &nbsp;
                    </Popover>
                </div>
            </div>;

        return (
            <div style={{ background: '#f5f5f5', padding: '30px' }}>
                <Row gutter={16}>
                    <Col span={4} />
                    <Col span={8}>
                        <Card title="Borrower" bordered={false}>
                            <Row>
                                <Col span={8}>
                                    <strong>Name:</strong>
                                </Col>
                                <Col span={12}>
                                    {fileContacts['borr_first_name'] + ' ' + fileContacts['borr_last_name']}
                                </Col>
                            </Row>
                            <Row>
                                <Col span={8}>
                                    <strong>Email:</strong>
                                </Col>
                                <Col span={12}>
                                    {fileContacts['borr_email']}
                                </Col>
                            </Row>
                            <Row>
                                <Col span={8}>
                                    <strong>Home Phone:</strong>
                                </Col>
                                <Col span={12}>
                                    {fileContacts['borr_home_phone']}
                                </Col>
                            </Row>
                            <Row>
                                <Col span={8}>
                                    <strong>Cell Phone:</strong>
                                </Col>
                                <Col span={12}>
                                    {fileContacts['borr_cell']}
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card title="Co-Borrower" bordered={false}>
                            <Row>
                                <Col span={8}>
                                    <strong>Name:</strong>
                                </Col>
                                <Col span={12}>
                                    {fileContacts['coBorr_first_name'] + ' ' + fileContacts['coBorr_last_name']}
                                </Col>
                            </Row>
                            <Row>
                                <Col span={8}>
                                    <strong>Email:</strong>
                                </Col>
                                <Col span={12}>
                                    {fileContacts['coBorr_email']}
                                </Col>
                            </Row>
                            <Row>
                                <Col span={8}>
                                    <strong>Home Phone:</strong>
                                </Col>
                                <Col span={12}>
                                    {fileContacts['coBorr_home_phone']}
                                </Col>
                            </Row>
                            <Row>
                                <Col span={8}>
                                    <strong>Cell Phone:</strong>
                                </Col>
                                <Col span={12}>
                                    {fileContacts['coBorr_cell']}
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                    <Col span={4} />
                </Row>
                <br />
                <Row gutter={16}>
                    <Col span={8}>
                        <Card title="Buyer's Agent" bordered={false}>
                            <Row>
                                <Col span={6}>
                                    <strong>Name:</strong>
                                </Col>
                                <Col span={16}>
                                    {fileContacts['buyers_agent_name']}
                                </Col>
                            </Row>
                            <Row>
                                <Col span={6}>
                                    <strong>Contact:</strong>
                                </Col>
                                <Col span={16}>
                                    {fileContacts['buyers_agent_contact_name']}
                                </Col>
                            </Row>
                            <Row>
                                <Col span={6}>
                                    <strong>Email:</strong>
                                </Col>
                                <Col span={16}>
                                    {fileContacts['buyers_agent_email']}
                                </Col>
                            </Row>
                            <Row>
                                <Col span={6}>
                                    <strong>Phone:</strong>
                                </Col>
                                <Col span={16}>
                                    {fileContacts['buyers_agent_phone']}
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card title="Seller's Agent" bordered={false}>
                            <Row>
                                <Col span={6}>
                                    <strong>Name:</strong>
                                </Col>
                                <Col span={16}>
                                    {fileContacts['sellers_agent_name']}
                                </Col>
                            </Row>
                            <Row>
                                <Col span={6}>
                                    <strong>Contact:</strong>
                                </Col>
                                <Col span={16}>
                                    {fileContacts['sellers_agent_contact_name']}
                                </Col>
                            </Row>
                            <Row>
                                <Col span={6}>
                                    <strong>Email:</strong>
                                </Col>
                                <Col span={16}>
                                    {fileContacts['sellers_agent_email']}
                                </Col>
                            </Row>
                            <Row>
                                <Col span={6}>
                                    <strong>Phone:</strong>
                                </Col>
                                <Col span={16}>
                                    {fileContacts['sellers_agent_phone']}
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card title='Title Company' bordered={false}>
                            <Row>
                                <Col span={6}>
                                    <strong>Name:</strong>
                                </Col>
                                <Col span={16}>
                                    {fileContacts['title_co_name']}
                                </Col>
                            </Row>
                            <Row>
                                <Col span={6}>
                                    <strong>Contact:</strong>
                                </Col>
                                <Col span={16}>
                                    {fileContacts['title_co_contact']}
                                </Col>
                            </Row>
                            <Row>
                                <Col span={6}>
                                    <strong>Email:</strong>
                                </Col>
                                <Col span={16}>

                                </Col>
                            </Row>
                            <Row>
                                <Col span={6}>
                                    <strong>Phone:</strong>
                                </Col>
                                <Col span={16}>
                                    {fileContacts['title_co_phone']}
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    }
}
