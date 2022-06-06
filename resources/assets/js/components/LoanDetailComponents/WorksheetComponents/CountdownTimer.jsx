import React, { Component } from 'react';
import { Label } from 'react-bootstrap';
import Countdown from 'react-countdown-now';

export default class CountdownTimer extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {

    }

    componentWillUnmount() {

    }

    render() {
        //count down timer options
        const Completionist = () => <span>Editing time has expired!</span>;
        const renderer = ({ minutes, seconds, completed }) => {
            if (completed) {
                // Render a completed state
                return <Completionist />;
            } else {
                // Render a countdown
                return <span>{minutes}:{seconds}</span>;
            }
        };

        return (
            <h3 style={{display: 'inline'}}>
                <Label bsStyle="warning">
                    <Countdown
                        date={this.props.startTime + 1800000}
                        renderer={renderer}
                    />
                </Label>
            </h3>
        );
    }
}