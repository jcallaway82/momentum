import React, { Component } from 'react';
import { Comment } from 'semantic-ui-react';
import { message, Avatar, Icon } from 'antd';
var moment = require('moment');

export default class DisplayReply extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let text;
        if(this.props.comment.tagged_user) {
            text =
                <div>
                    <strong>
                        {'@' + this.props.comment.tagged_user}
                    </strong>
                    &nbsp; {this.props.comment.text}
                </div>
        } else {
            text = <div>{this.props.comment.text}</div>
        }

        return (
            <Comment>
                <Comment.Avatar as='a' src={<Avatar size="large" icon="user" />} />
                <Comment.Content>
                    <Comment.Author as='a'>{this.props.comment.user}</Comment.Author>
                    <Comment.Metadata>
                        <span>{moment(this.props.comment.created_at).calendar()}</span>
                    </Comment.Metadata>
                    <Comment.Text>{text}</Comment.Text>
                    <Comment.Actions>
                        <Comment.Action
                            onClick={() => this.props.delete(this.props.comment)}
                        >
                            <Icon type="delete" />
                            Delete
                        </Comment.Action>
                    </Comment.Actions>
                </Comment.Content>
            </Comment>
        );
    }
};