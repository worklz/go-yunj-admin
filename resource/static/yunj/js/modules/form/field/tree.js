/**
 * FormFieldTree
 * zTree API官网：https://treejs.cn/v3/api.php
 */
layui.define(['FormField', 'FormFieldActions', 'yunj', 'jquery'], function (exports) {

    let FormField = layui.FormField;
    let FormFieldActions = layui.FormFieldActions;
    let win = window;
    let doc = document;
    let $ = layui.jquery;

    class FormFieldTree extends FormField {

        constructor(options = {}) {
            super(options);
            this.mode = null;                  // 模式
            this.retractLevel = null;
            this.nodes = null;
            this.ztreeEl = null;
            this.ztree = null;
            // check相关的属性
            this.allOptional = null;           // 是否所有可选
            this.nodeIdxMap = null;            // 节点id与对应下标的映射关系
            this.showBoxEl = null;
            this.itemsBoxEl = null;
            this.selectPopupContentEl = null;
            // edit相关属性
            this.actionRequireArgs = {
                event: "",
                type: "",
                title: '',
                icon: '',
                url: '',
                confirmText: '',
                auth: ''
            };
        }

        defineExtraArgs() {
            let that = this;
            return {
                mode: "checkbox",
                nodes: [],
                nodeIdKey: 'id',
                nodePidKey: 'pid',
                nodeNameKey: 'name',
                retractLevel: -1,
                allOptional: false,
                dragSort: false,
                options: []
            };
        }

        handleArgs(args) {
            let that = this;
            // nodes
            that.handleArgsByNodes(args);
            switch (args.mode) {
                case "checkbox":
                    if (args.verify.indexOf("arrayIn") === -1)
                        args.verify += (args.verify ? "|" : "") + `arrayIn:${that.getArgsAllowNodeIds(args).join(",")}`;
                    break;
                case "radio":
                    if (args.verify.indexOf("in") === -1)
                        args.verify += (args.verify ? "|" : "") + `in:${that.getArgsAllowNodeIds(args).join(",")}`;
                    break;
            }
            // dragSort
            if (!yunj.isBool(args.dragSort) && args.dragSort !== 'level') {
                throw new Error('类型[tree]配置[dragSort]错误');
            }
            // options
            that.handleArgsByOptions(args);
            return args;
        }

        // 处理节点
        handleArgsByNodes(args) {
            let that = this;
            let nodes = args.nodes;
            if (nodes.length <= 0) {
                return;
            }
            let nodeIdKey = args.nodeIdKey;
            let nodePidKey = args.nodePidKey;
            if (args.mode === 'checkbox' || args.mode === 'radio') {
                // hasSub 是否有子节点
                if (!nodes[0].hasOwnProperty('hasSub')) {
                    for (let i = 0; i < nodes.length; i++) {
                        let node = nodes[i];
                        let hasSub = false;
                        for (let j = 0; j < nodes.length; j++) {
                            let otherNode = nodes[j];
                            if (otherNode[nodePidKey].toString() === node[nodeIdKey].toString()) {
                                hasSub = true;
                                break;
                            }
                        }
                        node.hasSub = hasSub;
                        nodes[i] = node;
                    }
                }
                // nocheck 是否不可选
                for (let i = 0; i < nodes.length; i++) {
                    let node = nodes[i];
                    if (node.hasOwnProperty('nocheck')) {
                        continue;
                    }
                    // 最后一级可选，则有子级则不可选
                    node.nocheck = !args.allOptional && !!node.hasSub;
                }
            }
            args.nodes = nodes;
        }

        // 处理操作项参数
        handleArgsByOptions(args) {
            let that = this;
            let options = args.options;
            for (let i = 0; i < options.length; i++) {
                let option = options[i];
                if (yunj.isString(option)) {
                    option = {event: option};
                }
                if (option.event === "rename") {
                    option = Object.assign({}, option, {
                        event: "rename",
                        title: "重命名",
                        icon: "yunj-icon-rename",
                    });
                } else if (option.event === "remove") {
                    option = Object.assign({}, option, {
                        event: "remove",
                        title: "删除",
                        icon: "yunj-icon-remove",
                    });
                }
                option = yunj.objSupp(option, that.actionRequireArgs);
                if (option.event.length <= 0) {
                    throw new Error('类型[tree]配置[options][event]不能为空');
                }
                // 判断是否配置url
                if (option.type === 'openTab' || option.type === 'openPopup') {
                    if (!option.url) {
                        throw new Error('类型[tree]配置[options][type]=openTab或openPopup时，对应url不能为空');
                    }
                }
                options[i] = option;
            }
            args.options = options;
        }

        // 获取允许的节点ids
        getArgsAllowNodeIds(args) {
            let that = this;
            let nodes = args.nodes;
            let nodeIdKey = args.nodeIdKey;
            let allowNodeIds = [];
            for (let i = 0; i < nodes.length; i++) {
                let node = nodes[i];
                if (!(node.nocheck ?? false) && !(node.readonly ?? false)) {
                    allowNodeIds.push(node[nodeIdKey]);
                }
            }
            return allowNodeIds;
        }

        defineBoxHtml() {
            let that = this;
            return `<div class="layui-form-item yunj-form-item yunj-form-tree" id="${that.id}">__layout__</div>`;
        }

        ztreeHtml() {
            let that = this;
            let args = that.args;
            return `<ul id="${that.id}_ztree" class="ztree"></ul>`;
        }

        layoutControl() {
            let that = this;
            let controlHtml = that.ztreeHtml();
            if (that.isCheckMode()) {
                controlHtml = `<div class="show-box">
                                    <div class="items-box"></div>
                                </div>`;
            }
            return `<div class="layui-input-inline yunj-form-item-control">${controlHtml}</div>`;
        }

        async renderBefore() {
            let that = this;
            that.mode = that.args.mode;
            that.retractLevel = that.args.retractLevel;
            if (that.isCheckMode()) {
                that.allOptional = that.args.allOptional;
                that.setCheckNodes();
            }
            if (!win.hasOwnProperty('jQuery')) {
                win.jQuery = $;
            }
            await yunj.includeCss('/static/yunj/libs/zTree_v3/css/metroStyle/metroStyle.css');
            await yunj.includeJs('/static/yunj/libs/zTree_v3/js/jquery.ztree.core.js');
            await yunj.includeJs('/static/yunj/libs/zTree_v3/js/jquery.ztree.excheck.js');
            await yunj.includeJs('/static/yunj/libs/zTree_v3/js/jquery.ztree.exedit.js');
            return 'done';
        }

        // 获取节点等级
        getNodeLevel(nodeId, nodes) {
            let that = this;
            let nodeIdxMap = that.nodeIdxMap;
            if (!nodeIdxMap.has(nodeId)) return 0;
            let nodePidKey = that.args.nodePidKey;
            let idx = nodeIdxMap.get(nodeId);
            let node = nodes[idx];
            if (node.hasOwnProperty("level")) return node.level;
            if (!node[nodePidKey] || node[nodePidKey] === "0")
                node.level = 0;
            else
                node.level = that.getNodeLevel(node[nodePidKey], nodes) + 1;
            return node.level;
        }

        // 设置可选节点
        setCheckNodes() {
            let that = this;
            let nodes = that.args.nodes;
            let nodeIdKey = that.args.nodeIdKey;
            let nodePidKey = that.args.nodePidKey;
            let nodeMap = new Map();
            let l = nodes.length;
            for (let i = 0; i < l; i++) {
                // id string
                nodes[i][nodeIdKey] = nodes[i][nodeIdKey].toString();
                let node = nodes[i];
                let id = node[nodeIdKey];
                nodeMap.set(id, i);
                // 是否只读
                if (node.hasOwnProperty('readonly') && node.readonly) {
                    nodes[i].chkDisabled = true;
                }
                // 展开
                nodes[i].open = true;
                // 设置可选节点的子节点ids
                that.setCheckNodeChildIdsAttr(nodes, node);
            }
            that.nodeIdxMap = nodeMap;
            // 判断是否收起 retractLevel
            if (that.retractLevel >= 0) {
                nodes.forEach(node => {
                    let nodeLevel = that.getNodeLevel(node[nodeIdKey], nodes);
                    node.open = nodeLevel < that.retractLevel;
                });
            }
            that.nodes = nodes;
        }

        // 获取节点的子节点id集合属性名
        getNodeChildIdsAttr() {
            let that = this;
            return 'child' + yunj.ucfirst(that.args.nodeIdKey) + 's';
        }

        // 设置可选节点的子节点ids
        setCheckNodeChildIdsAttr(nodes, node) {
            let that = this;
            let nodeIdKey = that.args.nodeIdKey;
            let nodePidKey = that.args.nodePidKey;
            let childIdsAttr = that.getNodeChildIdsAttr();
            if (!node.hasOwnProperty(childIdsAttr)) {
                let childIdsValue = [];
                for (let i = 0; i < nodes.length; i++) {
                    if (node[nodeIdKey].toString() === nodes[i][nodePidKey].toString()) {
                        childIdsValue.push(nodes[i][nodeIdKey].toString());
                        if (!nodes[i].hasOwnProperty(childIdsAttr)) {
                            that.setCheckNodeChildIdsAttr(nodes, nodes[i]);
                        }
                        childIdsValue = childIdsValue.concat(nodes[i][childIdsAttr]);
                    }
                }
                node[childIdsAttr] = childIdsValue;
            }
        }

        renderDone() {
            let that = this;
            if (that.isCheckMode()) {
                that.showBoxEl = that.boxEl.find('.show-box');
                that.itemsBoxEl = that.boxEl.find('.show-box .items-box');
                // 设置字段操作项：内容清理、选择弹窗
                that.fieldActions = new FormFieldActions({
                    fieldObj: that,
                    fieldValueElSelector: `.show-box>.items-box`,
                    actions: {
                        contentClear: null,
                        selectPopup: {
                            contentHtml: that.getCheckModeSelectPopupContentHtml,
                            showAfter: that.renderCheckModeSelectTree,
                        },
                    }
                });
                that.selectPopupContentEl = that.fieldActions.getActionObj('selectPopup').selectContentEl;
                return;
            }
            that.ztreeEl = that.boxEl.find(`#${that.id}_ztree`);
        }

        // 获取可选择模式的选择弹窗内容html
        getCheckModeSelectPopupContentHtml = (data) => {
            let that = this;
            return new Promise((resolve, reject) => {
                let contentHtml = null;
                if (!that.ztreeEl) {
                    contentHtml = that.ztreeHtml();
                }
                resolve(contentHtml);
            });
        }

        setValue(val = '') {
            let that = this;
            if (that.isCheckMode()) {
                that.setCheckValue(val);
            } else {
                that.setEditValue(val);
            }
        }

        // 设置可选的值
        setCheckValue(val = '') {
            let that = this;
            if (yunj.isScalar(val) && val)
                val = that.mode === "radio" ? [val]
                    : (yunj.isJson(val) ? JSON.parse(val) : (yunj.isString(val) && val.indexOf(",") !== -1 ? val.split(",") : [val]));
            val = yunj.isArray(val) ? val : [];
            let ids = JSON.parse(JSON.stringify(val));

            let itemsContent = '';
            for (let i = 0, l = ids.length; i < l; i++) {
                let id = ids[i].toString();
                if (!that.nodeIdxMap.has(id)) continue;
                let idx = that.nodeIdxMap.get(id);
                let node = that.nodes[idx];
                if (node.nocheck ?? false) continue;
                let name = node.name;
                let remove = that.args.readonly ? '' : '<i class="layui-icon layui-icon-close-fill item-remove" title="删除"></i>';
                itemsContent += `<div class="item" data-value="${id}">
                                    <span class="txt" title="${name}">${name}</span>
                                    ${remove}
                                </div>`;
            }
            that.itemsBoxEl.html(itemsContent);
            // 设置节点选中状态
            that.setCheckModeSelectTreeNodesChecked();
        }

        // 设置可编辑的值
        setEditValue(val = '') {
            let that = this;
            let nodes = [];
            if (yunj.isArray(val)) {
                nodes = val
            } else if (yunj.isJson(val)) {
                nodes = JSON.parse(val);
            }
            if (nodes.length <= 0) {
                nodes = that.args.nodes;
            }
            let nodeIdKey = that.args.nodeIdKey;
            nodes.forEach(node => {
                // id string
                node[nodeIdKey] = node[nodeIdKey].toString();
                if (that.retractLevel >= 0) {
                    let nodeLevel = that.getNodeLevel(node[nodeIdKey], nodes);
                    node.open = nodeLevel < that.retractLevel;
                } else {
                    node.open = true;
                }
            });
            that.nodes = nodes;
            // 渲染树
            that.initEditZtree();
        }

        // 初始化可编辑的ztree
        initEditZtree() {
            let that = this;
            if (that.ztree) return that.ztree;
            let setting = {
                view: {
                    showIcon: false
                },
                data: {
                    key: {
                        name: that.args.nodeNameKey,
                    },
                    simpleData: {
                        enable: true,
                        idKey: that.args.nodeIdKey,
                        pIdKey: that.args.nodePidKey,
                    }
                },
                edit: {
                    enable: true,
                    showRemoveBtn: false,
                    showRenameBtn: false,
                    drag: {
                        isCopy: false,
                        isMove: false,
                        prev: false,
                        inner: false,
                        next: false
                    }
                },
                callback: {
                    // 名称编辑结束
                    onRename: function (event, treeId, treeNode, isCancel) {
                        // 取消元素事件绑定并删除
                        $(`#${that.id}_ztree .yunj-tree-node-option`).unbind().remove();
                        // 设置当前最新的nodes
                        that.setCurrEditNodes();
                    }
                }
            };
            if (!that.args.readonly) {
                // dragSort
                that.handleEditZtreeSettingByDragSort(setting);
                // options
                that.handleEditZtreeSettingByOptions(setting);
            }
            that.ztree = $.fn.zTree.init(that.ztreeEl, setting, that.nodes);
        }

        // 处理可编辑的ztree的setting值
        handleEditZtreeSettingByDragSort(setting) {
            let that = this;
            let dragSort = that.args.dragSort;
            let nodeIdKey = that.args.nodeIdKey;
            let nodePidKey = that.args.nodePidKey;
            if (dragSort) {
                // 节点数据配置
                that.nodes.forEach((node) => {
                    // 默认都是可以拖拽排序的
                    if (!node.hasOwnProperty('drag')) {
                        node.drag = true;
                    }
                })

                // setting配置
                setting.edit.drag.isMove = true;
                setting.edit.drag.prev = true;
                setting.edit.drag.next = true;
                setting.edit.drag.inner = dragSort === true;
                // 拖拽开始前
                setting.callback.beforeDrag = function (treeId, treeNodes) {
                    // treeNodes 被拖拽的节点 JSON 数据集合
                    // 设置了drag = false的节点不允许拖拽
                    for (let i = 0, l = treeNodes.length; i < l; i++) {
                        if (treeNodes[i].drag === false) {
                            yunj.msg(`[${treeNodes[i].name}]节点禁止拖拽`);
                            return false;
                        }
                    }
                    return true;
                };
                // 拖拽结束
                setting.callback.onDrop = function (event, treeId, treeNodes, targetNode, moveType) {
                    // 设置当前最新的nodes
                    that.setCurrEditNodes();
                };
                // 是否仅支持同级拖拽
                if (dragSort === 'level') {
                    // 拖拽结束前
                    setting.callback.beforeDrop = function (treeId, treeNodes, targetNode, moveType) {
                        // treeNodes 被拖拽的节点 JSON 数据集合
                        // targetNode 被拖拽放开的目标节点 JSON 数据对象

                        // 获取原始的node pid值
                        let nodeId = treeNodes[0][nodeIdKey];
                        let nodePids = yunj.arrayColumn(that.nodes, nodePidKey, nodeIdKey);
                        let nodePid = nodePids[nodeId] ? nodePids[nodeId].toString() : null;
                        // 获取目标的node pid值
                        let targetNodePid = targetNode && targetNode[nodePidKey] ? targetNode[nodePidKey].toString() : null;
                        // 不是同级则弹出提示
                        if (nodePid !== targetNodePid) {
                            yunj.msg('当前仅允许同级排序');
                            return false;
                        }
                        return true;
                    }
                }
            }
        }

        // 处理可编辑的ztree的setting值
        handleEditZtreeSettingByOptions(setting) {
            let that = this;
            let options = that.args.options;
            if (options.length <= 0) {
                return;
            }
            // 鼠标移动到节点上时，显示用户自定义控件
            setting.view.addHoverDom = function (treeId, treeNode) {
                if (treeNode.hasOwnProperty("readonly") && treeNode.readonly) {
                    return;
                }
                let nodeEl = $("#" + treeNode.tId + "_a");
                if (nodeEl.find('.yunj-tree-node-option').length > 0) {
                    return;
                }
                let nodeOptions;
                let events = treeNode.events;
                if (events) {
                    if (yunj.isJson(events)) {
                        events = JSON.parse(events);
                    } else if (yunj.isString(events) && events.indexOf(',') !== -1) {
                        events = events.split(',');
                    }
                    events = yunj.isArray(events) ? events : [events];
                }
                events = yunj.isArray(events) ? events : [];
                if (events.length > 0) {
                    let optionObjs = yunj.arrayColumn(options, null, 'event');
                    treeNode.events.forEach(event => {
                        if (optionObjs.hasOwnProperty(event)) {
                            nodeOptions.push(optionObjs[event]);
                        }
                    });
                } else {
                    nodeOptions = options;
                }
                let optionsHtml = '';
                nodeOptions.forEach(option => {
                    optionsHtml += `<span class="yunj-tree-node-option" id="${that.id}_${option.event}" title="${option.title}" data-args="${encodeURIComponent(JSON.stringify(option))}">
                                        ${option.icon ? `<i class="${yunj.iconClass(option.icon)}"></i>` : option.title}
                                    </span>`;
                });
                nodeEl.append(optionsHtml);
                // 事件绑定
                $(`#${that.id}_ztree .yunj-tree-node-option`).bind('click', function (e) {
                    let btnEl = $(this);
                    let args = JSON.parse(decodeURIComponent(btnEl.data('args')));
                    if (args.confirmText)
                        yunj.confirm(args.confirmText, function () {
                            that.handleEditEvent(treeNode, args);
                        });
                    else
                        that.handleEditEvent(treeNode, args);
                    e.stopPropagation();
                });
            };
            // 鼠标移出节点时，隐藏用户自定义控件
            setting.view.removeHoverDom = function (treeId, treeNode) {
                // 取消元素事件绑定并删除
                let optionEl = $(`#${that.id}_ztree .yunj-tree-node-option`);
                optionEl.length > 0 && optionEl.unbind().remove();
            };
        }

        /**
         * 处理可编辑的事件
         * @param {object} treeNode 事件节点
         * @param {object} args     事件参数
         */
        handleEditEvent(treeNode, args) {
            let that = this;
            let event = args.event;
            let nodeIdKey = that.args.nodeIdKey;
            let nodePidKey = that.args.nodePidKey;
            switch (args.type) {
                case 'openPopup':
                    let popupParam = {[nodeIdKey]: treeNode[nodeIdKey]};
                    let popupTitle = args.title + ':' + treeNode.name;
                    yunj.openPopup(yunj.handlePageUrl(yunj.urlPushParam(args.url, popupParam)), popupTitle);
                    break;
                case 'openTab':
                    let tabParam = {[nodeIdKey]: treeNode[nodeIdKey]};
                    let tabTitle = args.title + ':' + treeNode.name;
                    yunj.openTab(yunj.handlePageUrl(yunj.urlPushParam(args.url, tabParam)), tabTitle);
                    break;
                case 'asyncEvent':
                    let requestData = {
                        event: event,
                        [nodeIdKey]: treeNode[nodeIdKey],
                        name: treeNode.name,
                        [nodePidKey]: treeNode[nodePidKey]
                    };
                    yunj.request({
                        url: args.url ? args.url : that.url,
                        data: requestData,
                        type: 'post',
                        loading: true
                    }).then(res => {
                        $(doc).trigger(`yunj_tree_${that.id}_async_event_done`, [event, treeNode, requestData, res]);
                    }).catch(e => {
                        yunj.error(e);
                    });
                    break;
                default:
                    // 触发前端事件
                    switch (event) {
                        // 重命名
                        case 'rename':
                            that.ztree.editName(treeNode);
                            break;
                        // 删除
                        case 'remove':
                            that.ztree.removeNode(treeNode);
                            // 设置当前最新的nodes
                            that.setCurrEditNodes();
                            break;
                    }
                    $(doc).trigger(`yunj_tree_${that.id}_${event}`, [treeNode]);
            }
        }

        // 设置当前可编辑的所有节点数据
        setCurrEditNodes(nodes = []) {
            let that = this;
            let currNodes = [];
            let rawNodesLen = nodes.length;
            if (rawNodesLen <= 0) {
                nodes = that.ztree.getNodes();
            }
            nodes.forEach((node) => {
                currNodes.push(that.handleEditNode(node));
                if (node.hasOwnProperty('children') && node.children.length > 0) {
                    currNodes.push(...that.setCurrEditNodes(node.children));
                }
            });
            if (rawNodesLen <= 0 && currNodes.length >= 0) {
                that.nodes = currNodes;
            }
            return currNodes;
        }

        // 处理单个可编辑的节点数据
        handleEditNode(node) {
            let that = this;
            let nodeIdKey = that.args.nodeIdKey;
            let nodePidKey = that.args.nodePidKey;
            return {
                [nodeIdKey]: node[nodeIdKey],
                [nodePidKey]: node[nodePidKey],
                name: node.name,
                drag: node.drag
            };
        }

        getValue() {
            let that = this;
            return that.isCheckMode() ? that.getCheckValue() : that.getEditValue();
        }

        // 获取可选的值
        getCheckValue() {
            let that = this;

            let itemsEl = that.itemsBoxEl.find('.item');
            if (itemsEl.length <= 0) return "";

            let val = [];
            itemsEl.each(function () {
                val.push($(this).data('value').toString());
            });
            if (val.length <= 0) return "";
            return that.mode === 'radio' ? val[0] : val;
        }

        getEditValue() {
            let that = this;
            let nodeIdKey = that.args.nodeIdKey;
            let nodePidKey = that.args.nodePidKey;
            let val = [];
            if (that.nodes && that.nodes.length > 0) {
                that.nodes.forEach(node => {
                    val.push({
                        [nodeIdKey]: node[nodeIdKey],
                        name: node.name,
                        [nodePidKey]: node[nodePidKey]
                    });
                });
            }
            return val;
        }

        // 渲染可选模式的选择树
        renderCheckModeSelectTree = () => {
            let that = this;
            that.initCheckZtree();
            // 设置节点选中状态
            that.setCheckModeSelectTreeNodesChecked();
        }

        // 设置可选模式的选择树节点选中状态
        setCheckModeSelectTreeNodesChecked() {
            let that = this;
            let ztree = that.ztree;
            if (!ztree) return;
            let nodeIdKey = that.args.nodeIdKey;
            // 取消之前选中的
            let checkNodes = that.ztree.getCheckedNodes(true);
            checkNodes.forEach((checkNode) => {
                // 只修改此节点勾选状态，无父子节点联动操作，不触发事件回调函数
                ztree.checkNode(checkNode, false, false, false);
            });
            // 设置当前需要选中的
            let ids = that.getCheckValue();
            if (ids.length <= 0) {
                return;
            }
            if (!yunj.isArray(ids)) {
                ids = [ids];
            }
            ids.forEach((id) => {
                let node = ztree.getNodeByParam(nodeIdKey, id);
                if (!node) return;
                // 只修改此节点勾选状态，无父子节点联动操作，不触发事件回调函数
                ztree.checkNode(node, true, false, false);
            });
        }

        // 初始化可选模式的树ztree
        initCheckZtree() {
            let that = this;
            if (that.ztree) return that.ztree;
            if (!that.ztreeEl) {
                that.ztreeEl = that.boxEl.find(`#${that.id}_ztree`);
            }
            let nodeIdKey = that.args.nodeIdKey;
            let setting = {
                view: {
                    showIcon: false,
                },
                check: {
                    enable: true,
                },
                data: {
                    key: {
                        name: that.args.nodeNameKey,
                    },
                    simpleData: {
                        enable: true,
                        idKey: that.args.nodeIdKey,
                        pIdKey: that.args.nodePidKey,
                    }
                },
                edit: {
                    enable: true,
                    showRemoveBtn: false,
                    showRenameBtn: false
                },
                callback: {
                    onClick: function (e, treeId, tree_node, clickFlag) {
                        that.ztree.checkNode(tree_node, !tree_node.checked, true);
                        let nodes = that.ztree.getCheckedNodes(true);
                        let val = [];
                        for (let i = 0; i < nodes.length; i++) {
                            val.push(nodes[i][nodeIdKey]);
                        }
                        that.setValue(val);
                    },
                    onCheck: function (e, treeId, tree_node) {
                        let nodes = that.ztree.getCheckedNodes(true);
                        let val = [];
                        for (let i = 0; i < nodes.length; i++) {
                            val.push(nodes[i][nodeIdKey]);
                        }
                        that.setValue(val);
                    },
                }
            };
            switch (that.mode) {
                case "radio":
                    setting.check.chkStyle = "radio";
                    setting.check.radioType = "all";
                    break;
            }
            that.ztree = $.fn.zTree.init(that.ztreeEl, setting, that.nodes);
            return that.ztree;
        }

        defineExtraEventBind() {
            let that = this;

            // 可选的事件绑定
            if (that.isCheckMode()) {

                that.boxEl.on('click', '.item-remove', function (e) {
                    if (that.args.readonly) return false;
                    let itemEl = $(this).parent(".item");
                    let id = itemEl.data("value").toString();
                    let nodeIdx = that.nodeIdxMap.get(id);
                    let node = that.nodes[nodeIdx];
                    let delIds = [id].concat(node[that.getNodeChildIdsAttr()]);
                    let isSelectPopupShow = that.selectPopupContentEl.is(':visible');
                    delIds.forEach((delId) => {
                        // 删除节点
                        let delItemEl = that.itemsBoxEl.find(`[data-value="${delId}"]`);
                        if (delItemEl.length > 0) {
                            delItemEl.remove();
                        }
                        if (isSelectPopupShow) {
                            let ztreeNode = that.ztree.getNodeByParam(that.args.nodeIdKey, id);
                            if (!ztreeNode) return;
                            // 只修改此节点勾选状态，无父子节点联动操作，不触发事件回调函数
                            that.ztree.checkNode(ztreeNode, false, false, false);
                        }
                    });
                    e.stopPropagation();
                });

            }

        }

        // 是否为可选择的模式
        isCheckMode() {
            return this.args.mode === 'checkbox' || this.args.mode === 'radio';
        }

    }

    exports('FormFieldTree', FormFieldTree);
});