import React, { Component } from 'react';
import { Comment } from 'semantic-ui-react';
import { Form, AutoComplete, Button, Icon, Input, message, Avatar } from 'antd';
var moment = require('moment');
import PubNubReact from 'pubnub-react';

const FormItem = Form.Item;

export default class DisplayComment extends Component {
    constructor(props) {
        super(props);

        this.pubnub = new PubNubReact({
            /*//test
            publishKey: 'pub-c-da0761ac-b7dc-405f-8ad3-2b5770592dde',
            subscribeKey: 'sub-c-79291c04-20c4-11e8-8bcf-5e8597732562'*/

            //production
             publishKey: 'pub-c-3e92d54c-a7b3-411a-bd49-ab865d1db21f',
             subscribeKey: 'sub-c-a80b5efe-23af-11e8-be22-c2fd0b475b93'
        });

        this.state = {
            reply: false,
            text: '',
            tagged_user: null,
            comments: null
        };
        this.pubnub.init(this);
        this.addReply = this.addReply.bind(this);
    }

    handleChange = (e) => this.setState({ text: e.target.value });

    taggedUserHandleChange = (e) => this.setState({ tagged_user: e });

    addReply() {
        let self = this;
        if(self.state.text === '') {
            message.error('You must enter a message before submitting.');
        } else {
            axios.post('/addReply', {
                data: {
                    comment_id: self.props.comment.id,
                    text: self.state.text,
                    tagged_user: self.state.tagged_user,
                }
            })
                .then(function(response) {
                    if(response.status == 403) {
                        alert('You do not have permissions to edit this loan.')
                    }
                    self.setState({ comments: response.data, reply: false, text: '', tagged_user: null });
                    this.props.refresh(self.state.comments);
                    this.pubnub.publish(
                        {
                            message: 'new reply added',
                            channel: 'alerts'
                        },
                        function (status, response) {
                            if (status.error) {
                                console.log(status)
                            } else {
                                console.log("message Published w/ timetoken", response.timetoken)
                            }
                        }
                    );
                }.bind(this))
                .catch(function(error){
                    console.log(error);
                    message.error(error.response.data.messages);
                });
        }
    };

    render() {
        let replies, addReply, text;
        if(this.props.replies && this.props.replies.length) {
            replies =
                <Comment.Group>
                    {this.props.replies}
                </Comment.Group>
        }

        if(this.state.reply) {
            addReply =
                <Form layout="inline">
                    <FormItem>
                        <AutoComplete
                            dataSource={this.props.dataSource}
                            style={{ width: 200 }}
                            filterOption={(inputValue, option) => option.props.children.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1}
                            placeholder="Tag user"
                            value={this.state.tagged_user}
                            onChange={this.taggedUserHandleChange}
                        >
                            <Input suffix={<Icon type="search" className="certain-category-icon" />} />
                        </AutoComplete>
                    </FormItem>
                    <FormItem>
                        <Input
                            placeholder="Please enter a reply..."
                            style={(this.props.fieldName === 'generalConvoLog') ? {width: 600} : {width: 400} }
                            value={this.state.text}
                            onChange={this.handleChange}
                            onPressEnter={this.addReply}
                        />
                    </FormItem>
                    <FormItem>
                        <Button onClick={this.addReply}
                                icon='edit'
                                type='primary'
                        >
                            Add Reply
                        </Button>
                        &nbsp;
                        <Button onClick={() => this.setState({ reply:false, text: '', tagged_user: null})}>
                            Cancel
                        </Button>
                    </FormItem>
                </Form>
        }

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
                <Comment.Avatar as='a' src={<Avatar size="large" icon="user" />} />{/*'/images/john1.jpg' />*/}
                <Comment.Content>
                    <Comment.Author as='a'>{this.props.comment.user}</Comment.Author>
                    <Comment.Metadata>
                        <span>{moment(this.props.comment.created_at).calendar()}</span>
                    </Comment.Metadata>
                    <Comment.Text>{text}</Comment.Text>
                    <Comment.Actions>
                        <Comment.Action
                            onClick={() => this.setState({ reply: true})}
                        >
                            Reply
                        </Comment.Action>
                        <Comment.Action
                            onClick={() => this.props.delete(this.props.comment)}
                        >
                            <Icon name='trash' />
                            Delete
                        </Comment.Action>
                    </Comment.Actions>
                </Comment.Content>
                {replies}
                {addReply}
            </Comment>
        );

    }
};