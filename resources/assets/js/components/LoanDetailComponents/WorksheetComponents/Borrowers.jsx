import React, { Component } from 'react';
import {
    Form, Row, Alert, ControlLabel, Button
    } from 'react-bootstrap';

var borders = {
    borderTopStyle: 'solid',
    padding: 10
    /*borderRightStyle: 'solid',
     borderRightColor: 'black',
     borderTopColor: 'black',
     borderLeftColor: 'black',
     borderBottomColor: 'black',*/
};

export default class Properties extends Component {
    constructor(props) {
        super(props);
        this.state = {
            borrowers: this.props.borrowers
        };
        this.addBorrower = this.addBorrower.bind(this);
        this.deleteBorrower = this.deleteBorrower.bind(this);
    }

    addBorrower() {
        let self = this;
        if(self.state.borrowers.length === 4) {
            alert('You can only have 4 borrowers.')
        } else {
            axios.post('/addBorrower', {
                data: {
                    loan: self.props.loanID,
                }
            })
                .then(function(response) {
                    if(response.status == 403) {
                        alert('You do not have permissions to edit this loan.')
                    }
                    self.setState({ borrowers: response.data });
                    this.props.refresh(self.state.borrowers);
                }.bind(this))
                .catch(function(error){
                    console.log(error);
                    alert(error.response.data.messages);
                });
        }
    }

    deleteBorrower(borrowerID, borrowerNum) {
        let self = this;
        if(borrowerNum === 0) {
            alert('You can not delete Borrower #1');
        } else {
            axios.post('/deleteBorrower', {
                data: {
                    loan: self.props.loanID,
                    borrower: borrowerID
                }
            })
                .then(function(response) {
                    if(response.status == 403) {
                        alert('You do not have permissions to edit this loan.')
                    }
                    self.setState({ borrowers: response.data });
                    this.props.refresh(self.state.borrowers);
                }.bind(this))
                .catch(function(error){
                    console.log(error);
                    alert(error.response.data.messages);
                });
        }
    }

    render() {
        let borrowers;

        borrowers = this.state.borrowers.map((borrowers, i) =>
            <Row style={borders} key={i}>
                &nbsp;
                <ControlLabel>Borrower #{i+1}</ControlLabel>
                &nbsp;
                <Button
                    className="pull-right"
                    bsStyle="danger"
                    bsSize="small"
                    onClick={() => {this.deleteBorrower(borrowers.id, i)}}>
                    Delete
                </Button>
                <br />
            </Row>);

        return (
            <Form>
                <Row>
                    <Button
                        className="pull-right"
                        bsStyle="primary"
                        bsSize="small"
                        onClick={this.addBorrower}>
                        Add Borrower
                    </Button>
                </Row>
                <br />
                {borrowers}
            </Form>
        );
    }
}