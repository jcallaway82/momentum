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
            properties: this.props.reos
        };
        this.addReo = this.addReo.bind(this);
        this.deleteReo = this.deleteReo.bind(this);
    }

    addReo() {
        let self = this;
        axios.post('/addREO', {
            data: {
                loan: self.props.loanID,
            }
        })
            .then(function(response) {
                if(response.status == 403) {
                    alert('You do not have permissions to edit this loan.')
                }
                self.setState({ properties: response.data });
                this.props.refresh(self.state.properties);
            }.bind(this))
            .catch(function(error){
                console.log(error);
                alert(error.response.data.messages);
            });
    }

    deleteReo(reoID) {
        let self = this;
        axios.post('/deleteREO', {
             data: {
                 loan: self.props.loanID,
                 reo: reoID
             }
        })
             .then(function(response) {
                if(response.status == 403) {
                    alert('You do not have permissions to edit this loan.')
                }
                self.setState({ properties: response.data });
                this.props.refresh(self.state.properties);
             }.bind(this))
             .catch(function(error){
                console.log(error);
                alert(error.response.data.messages);
             });
    }

    render() {
        let ssValidation;

        if(!this.state.properties.length) {
            ssValidation =
                <Row>
                    <Alert bsStyle="warning">No properties have been added for this loan.</Alert>
                </Row>
        } else {
            ssValidation = this.state.properties.map((reos, i) =>
                <Row style={borders} key={i}>
                    &nbsp;
                    <ControlLabel>Property #{i+1}: {reos.property}</ControlLabel>
                    &nbsp;
                    <Button
                        className="pull-right"
                        bsStyle="danger"
                        bsSize="small"
                        onClick={() => {this.deleteReo(reos.id)}}>
                        Delete
                    </Button>
                    <br />
                </Row>);
        }

        return (
            <Form>
                <Row>
                    <Button
                        className="pull-right"
                        bsStyle="primary"
                        bsSize="small"
                        onClick={this.addReo}>
                        Add Property
                    </Button>
                </Row>
                <br />
                {ssValidation}
            </Form>
        );
    }
}