import React, { Component } from 'react';
import { Comment } from 'semantic-ui-react';
import { Form, AutoComplete, Button,
    Input, Icon, message, Popover } from 'antd';
import DisplayTableComment from './CommentComponents/DisplayTableComment';
import DisplayTableReply from './CommentComponents/DisplayTableReply';
import PubNubReact from 'pubnub-react';

const FormItem = Form.Item;
const { TextArea } = Input;

var titles = {
    fontWeight: 'bold',
};

export default class TableNotes extends Component {
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
            comments: this.props.comments,
            fieldName: this.props.fieldName,
            item_id: this.props.item_id,
            dataSource: this.props.users,
            newComment: {
                tabKey: this.props.tabKey,
                field_name: null,
                text: '',
                tagged_user: null,
            },
            visible: false,
        };
        this.pubnub.init(this);
        this.addComment = this.addComment.bind(this);
        this.refreshReplies = this.refreshReplies.bind(this);
        this.deleteComment = this.deleteComment.bind(this);
        this.deleteReply = this.deleteReply.bind(this);
    }

    componentDidMount() {
        window.addEventListener("beforeunload", this.onUnload)
    }

    componentWillUnmount() {
        window.removeEventListener("beforeunload", this.onUnload)
    }

    onUnload(event) { // the method that will be used for both add and remove event
        if(this.state.inputChanged) {
            event.returnValue = "Changes have not been saved." +
                " Are you sure you want to leave?";
            //event.returnValue = message;
            //return message;
        }
    }

    /**
     * Update DB with new state changes from task list
     */
    addComment(event) {
        event.preventDefault();

        let self = this;
        if(self.state.newComment.text === '') {
            message.error('You must enter a message before submitting.', 3);
        } else {
            axios.post('/addComment', {
                data: {
                    loan: self.props.loan_id,
                    newComment: self.state.newComment
                }
            })
                .then(function(response) {
                    if(response.status == 403) {
                        message.error('You do not have this record locked for editing. Please click edit and re-save' +
                            ' your changes.', 3);
                    }
                    self.setState({
                        comments: response.data,
                        newComment: {
                            field_name: null,
                            text: '',
                            tagged_user: null},
                        visible: false
                    });
                    this.props.refreshComments(self.state.comments);
                    this.pubnub.publish(
                        {
                            message: 'new comment added',
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
                    message.error(error.response.data.messages, 3);
                });
        }
    }

    deleteComment(comment) {
        let self = this;
        axios.post('/deleteComment', {
            data: {
                loan_id: self.props.loan_id,
                comment_id: comment.id,
                user: comment.user
            }
        })
            .then(function(response) {
                if(response.status == 403) {
                    message.error(response.data.messages, 3);
                }
                self.setState({ comments: response.data});
                this.props.refreshComments(self.state.comments);
                this.pubnub.publish(
                    {
                        message: 'comment deleted',
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
                message.error(error.response.data.messages, 3);
            });
    }

    deleteReply(reply) {
        let self = this;
        axios.post('/deleteReply', {
            data: {
                loan_id: self.props.loan_id,
                reply_id: reply.id,
                user: reply.user
            }
        })
            .then(function(response) {
                if(response.status == 403) {
                    message.error(response.data.messages, 3);
                }
                self.setState({ comments: response.data});
                this.props.refreshComments(self.state.comments);
                this.pubnub.publish(
                    {
                        message: 'comment deleted',
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
                message.error(error.response.data.messages, 3);
            });
    }

    /**
     * Updates state from changes in task list
     * @param event - item that is being changed
     */
    handleChange = (e) => {
        let tempComment = {
            tabKey: this.props.tabKey,
            field_name: (e.target.id === 'procNeedsList') ? 'Processor Needs List' : 'UW Condition List',
            procNeedList_id: (this.props.fieldName === 'procNeedsList') ? this.props.item_id : null,
            uwCondition_id: (this.props.fieldName === 'uwCondList') ? this.props.item_id : null,
            text: e.target.value,
            tagged_user: this.state.newComment.tagged_user,
        };

        this.setState({ newComment: tempComment });
    };

    taggedUserHandleChange = (e) => {
        let tempComment = {
            tabKey: this.props.tabKey,
            field_name: (this.state.field_name === 'procNeedsList') ? 'Processor Needs List' : 'UW Condition List',
            procNeedList_id: (this.props.field_name === 'procNeedsList') ? this.props.item_id : null,
            uwCondition_id: (this.props.field_name === 'uwCondList') ? this.props.item_id : null,
            text: this.state.newComment.text,
            tagged_user: e
        };
        this.setState({ newComment: tempComment });
    };

    /**
     * Refreshes state from comments that have been added or deleted
     * @param newReplies   array of current comments
     */
    refreshReplies(newReplies) {
        let self = this;
        self.setState({comments: newReplies});
    }

    hide = () => {
        this.setState({
            visible: false,
            newComment: {
                field_name: null,
                text: '',
                tagged_user: null,
            }
        });
    };

    handleVisibleChange = () => {
        this.setState({
            visible: true,
        });
    };

    render() {
        let convoLog, width, createComment;

        convoLog = this.state.comments.slice(0).map((comment, i) => {
            let replyLog;
            /*switch(this.state.fieldName) {
                case 'procNeedsList': {
                    itemId = 'comment.procNeedList_id'
                }
            }*/

            if(this.state.fieldName === 'procNeedsList') {
                if(comment.procNeedList_id === this.state.item_id) {
                    if(comment.reply && comment.reply.length) {
                        replyLog = comment.reply.map((reply, i) => {
                            return  <DisplayTableReply comment={reply} delete={this.deleteReply} key={i} />
                        });
                    }

                    return  <DisplayTableComment
                        comment={comment}
                        replies={replyLog}
                        key={i}
                        dataSource={this.state.dataSource}
                        delete={this.deleteComment}
                        refresh={this.refreshReplies}
                    />
                }
            } else if(this.state.fieldName === 'uwCondList') {
                if(comment.uwCondition_id === this.state.item_id) {
                    if(comment.reply && comment.reply.length) {
                        replyLog = comment.reply.map((reply, i) => {
                            return  <DisplayTableReply comment={reply} delete={this.deleteReply} key={i} />
                        });
                    }

                    return  <DisplayTableComment
                        comment={comment}
                        replies={replyLog}
                        key={i}
                        dataSource={this.state.dataSource}
                        delete={this.deleteComment}
                        refresh={this.refreshReplies}
                    />
                }
            }

        });

        createComment =
            <Form>
                <FormItem>
                    <AutoComplete
                        dataSource={this.state.dataSource}
                        style={{ width: 200 }}
                        filterOption={(inputValue, option) => option.props.children.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1}
                        placeholder="Tag user"
                        value={this.state.newComment.tagged_user}
                        onChange={this.taggedUserHandleChange}
                    >
                        <Input suffix={<Icon type="search" className="certain-category-icon" />} />
                    </AutoComplete>
                </FormItem>
                <FormItem>
                        <TextArea
                            placeholder="Please enter a new comment..."
                            id={this.state.fieldName}
                            style={{ width: 400 }}
                            value={this.state.newComment.text}
                            onChange={this.handleChange}
                            onPressEnter={this.addComment}
                            autosize
                        />
                </FormItem>
                <FormItem>
                    <Button onClick={this.addComment}
                            icon='edit'
                            type='primary'
                    >
                        Add Comment
                    </Button>
                    &nbsp;
                    <Button onClick={this.hide}>
                        Cancel
                    </Button>
                </FormItem>
            </Form>;

        return (
            <span>
            <div style={{ float: 'right' }}>
                <Popover
                    placement="leftTop"
                    title="Add Comment"
                    content={createComment}
                    trigger="click"
                    visible={this.state.visible}
                    onVisibleChange={this.handleVisibleChange}
                >
                    <Icon type="plus-circle-o" style={{ fontSize: 14 }} />
                </Popover>
            </div>
            <Comment.Group size='mini' minimal>
                {convoLog}
            </Comment.Group>
            </span>
        );
    }
}