import React, { Component } from 'react';
import { Tree, message } from 'antd';
const TreeNode = Tree.TreeNode;

export default class TreeDropDown extends Component {
    constructor(props) {
        super(props);

        this.state = {
            expandedKeys: [],
            autoExpandParent: true,
            selectedKeys: [],
        };
    }

    onExpand = (expandedKeys) => {
        //console.log('onExpand', arguments);
        // if not set autoExpandParent to false, if children expanded, parent can not collapse.
        // or, you can remove all expanded children keys.
        this.setState({
            expandedKeys,
            autoExpandParent: false,
        });
    };

    onCheck = (checkedKeys) => {
        this.props.updateFilters(this.props.data[0].key, checkedKeys);
    };

    onSelect = (selectedKeys, info) => {
        this.setState({ selectedKeys });
    };

    renderTreeNodes = (data) => {
        return data.map((item) => {
            if (item.children) {
                return (
                    <TreeNode title={item.title} key={item.key} dataRef={item}>
                        {this.renderTreeNodes(item.children)}
                    </TreeNode>
                );
            }
            return <TreeNode {...item} />;
        });
    };

    render() {
        const checkedKeys = [];

        this.props.filters.map(filter => {
            if(filter) {
                checkedKeys.push(filter['value']);
            }
        });

        return (
            <Tree
                checkable
                onExpand={this.onExpand}
                expandedKeys={this.state.expandedKeys}
                autoExpandParent={this.state.autoExpandParent}
                onCheck={this.onCheck}
                checkedKeys={checkedKeys}
                onSelect={this.onSelect}
                selectedKeys={this.state.selectedKeys}
            >
                {this.renderTreeNodes(this.props.data)}
            </Tree>
        );
    }
}
