import React, {Component} from 'react';
import $ from 'jquery';
import PropTypes from 'prop-types';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'

window.$ = $;

let get_range = (end, start = 1) => {
    let result = [];
    for (let i = start; i <= end; i++) {
        result.push(i)
    }
    return result;
};
let create_map = (array, key) => {
    let result = {};
    array.forEach((item, i) => result[item[key]] = i)
    return result;
};
let copy = (obj) => {
    return JSON.parse(JSON.stringify(obj));
};

class CubeTable extends Component {
    constructor(props) {
        super(props);

        let measures = [
            {
                name: "Measure 1 (Regions)",
                tree: {
                    name: "All regions",
                    code: "regions",
                    hidden: false,
                    childs: [
                        {
                            name: "Russia",
                            hidden: false,
                            childs: [
                                {
                                    name: "Moscow",
                                },
                                {
                                    name: "Lipetsk",
                                },
                                {
                                    name: "Voronesh",
                                },
                            ]
                        },
                        {
                            name: "USA",
                            hidden: false,
                            childs: [
                                {
                                    name: "California",
                                },
                                {
                                    name: "Washington",
                                },
                            ]
                        },
                        {
                            name: "Georgia",
                            hidden: false,
                        }
                    ]
                },
            },
            {
                name: "Measure 2 (Products)",
                tree: {
                    name: "All products",
                    code: "products",
                    childs: [
                        {name: "Paper"},
                        {name: "Tables"},
                        {name: "Pencils"},
                    ]
                }
            },
            {
                name: "Measure 3 (Years)",
                tree: {
                    name: "All years",
                    code: "years",
                    childs: [
                        {name: "2018", childs: [{name: "Q 1"}, {name: "Q 2"}, {name: "Q 3"}, {name: "Q 4"}]},
                        {name: "2017", childs: [{name: "Q 1"}, {name: "Q 2"}, {name: "Q 3"}, {name: "Q 4"}]},
                        {name: "2016", childs: [{name: "Q 1"}, {name: "Q 2"}, {name: "Q 3"}, {name: "Q 4"}]},
                    ]
                }
            },
            {
                name: "Measure 4 (Scenarios)",

                tree: {
                    name: "All scenarios",
                    code: "scenarios",
                    childs: [
                        {name: "Actual"},
                        {name: "Budget"},
                    ]
                }
            },
        ];

        this.init_trees = measures.map(measure => this.prepareTree(measure.tree));
        this.init_trees_map = create_map(this.init_trees, 'code');

        let init_list_measures_head = ['regions', 'products'],
            init_list_measures_side = ['years', 'scenarios'];

        this.state = {
            trees: this.init_trees,
            trees_map: this.init_trees_map,
            list_measures_head: init_list_measures_head,
            list_measures_side: init_list_measures_side,
        };

        this.state = {
            ...this.state,
            ...this.get_init_trees()
        }
    }

    get_init_trees = () => {
        let measures_head = this.state.list_measures_head.map(measure_code => copy(this.init_trees[this.init_trees_map[measure_code]])),
            measures_head_tree = this.fullTree_get(this.state.list_measures_head),

            measures_side = this.state.list_measures_side.map(measure_code => copy(this.init_trees[this.init_trees_map[measure_code]])),
            measures_side_tree = this.fullTree_get(this.state.list_measures_side);

        measures_head_tree = this.fullTree_setpaths(measures_head_tree);
        measures_side_tree = this.fullTree_setpaths(measures_side_tree);

        return {
            measures_side: measures_side,
            measures_side_tree: measures_side_tree,

            measures_head: measures_head,
            measures_head_tree: measures_head_tree,
        }
    };

    prepareTree = (tree, lvl = 0, path = []) => {
        tree._measure_path = path;
        if (tree.childs && tree.childs.length > 0) {
            tree.childs = tree.childs.map((child, i) => this.prepareTree(child, lvl + 1, path.concat(['childs', i])))
        } else {
            tree.childs = [];
        }
        tree.hidden = lvl !== 0;
        tree.hidden_childs = typeof tree.hidden_childs !== 'undefined' ? tree.hidden_childs : true;

        tree.lvl = lvl;
        tree.code = tree.code ? tree.code : tree.name;
        tree.has_childs = tree.childs.length > 0;

        return tree;
    };

    getTreeIterator(tree, callback = () => {}) {
        callback(tree);
        let result = [tree];
        tree.childs.forEach(child => result = result.concat(this.getTreeIterator(child, callback)));
        return result;
    }

    componentDidMount() {
        //region fixedTable jquery
        let fixedTable;
        fixedTable = function (el) {
            let $body, $header, $sidebar;
            $body = $(el).find('.cube-table-body');
            $sidebar = $(el).find('.cube-table-sidebar table');
            $header = $(el).find('.cube-table-header table');
            return $($body).scroll(function () {
                $($sidebar).css('margin-top', -$($body).scrollTop());
                return $($header).css('margin-left', -$($body).scrollLeft());
            });
        };
        new fixedTable($('#demo'));
        //endregion

    }

    getTrs = (tree, param_length = 1) => {
        let trs = [];
        if (tree.hidden) {
            return trs;
        }
        if (tree._subtree) {
            trs = this.getTrs(tree._subtree, param_length);
            trs = copy(trs);

            let length = this.tree_get_deep_length(tree._subtree, (tree) => !tree.hidden);
            length = length * param_length;
            trs[0].tds.unshift({...tree, rowSpan: length});
            tree.childs
                .filter((child) => !child.hidden)
                .forEach(child => {
                    trs = trs.concat(this.getTrs(child));
                });
        } else {
            trs.push({tds: [tree]});
            tree.childs.forEach(child => {
                this.getTreeIterator(child, (child) => {
                    if (!child.hidden) {
                        trs.push({tds: [child]});
                    }
                })
            })
        }
        return trs;
    };
    getTrsSide = () => {
        return this.getTrs(this.state.measures_side_tree)
    };
    getTrsHead = () => {
        let trs = this.getTrs(this.state.measures_head_tree);

        let convert_trs_for_head = (trs) => {
            let result_trs = [], added_td;

            for (let i = trs.length - 1; i >= 0; i--) {
                // Костылииии. Максимум в шапке может быть 4 уровня (строк заголовков)
                if (trs[i].tds.length === 1) {
                    if (!result_trs[result_trs.length - 1]) result_trs.unshift({tds: []});

                    result_trs[result_trs.length - 1].tds.unshift(trs[i].tds[0]);
                }
                else if (trs[i].tds.length === 2) {
                    if (!result_trs[result_trs.length - 1]) result_trs.unshift({tds: []});
                    if (!result_trs[result_trs.length - 2]) result_trs.unshift({tds: []});

                    added_td = trs[i].tds[trs[i].tds.length - 1];
                    result_trs[result_trs.length - 1].tds.unshift(added_td);

                    added_td = trs[i].tds[trs[i].tds.length - 2];
                    result_trs[result_trs.length - 2].tds.unshift({
                        ...added_td, colSpan: added_td.rowSpan
                    });
                }
                else if (trs[i].tds.length === 3) {
                    if (!result_trs[result_trs.length - 1]) result_trs.unshift({tds: []});
                    if (!result_trs[result_trs.length - 2]) result_trs.unshift({tds: []});
                    if (!result_trs[result_trs.length - 3]) result_trs.unshift({tds: []});

                    added_td = trs[i].tds[trs[i].tds.length - 1];
                    result_trs[result_trs.length - 1].tds.unshift(added_td);

                    added_td = trs[i].tds[trs[i].tds.length - 2];
                    result_trs[result_trs.length - 2].tds.unshift({
                        ...added_td, colSpan: added_td.rowSpan
                    });

                    added_td = trs[i].tds[trs[i].tds.length - 3];
                    result_trs[result_trs.length - 3].tds.unshift({
                        ...added_td, colSpan: added_td.rowSpan
                    });
                }
                else if (trs[i].tds.length === 4) {
                    if (!result_trs[result_trs.length - 4]) {
                        result_trs.unshift({tds: []});
                    }
                    added_td = trs[i].tds[trs[i].tds.length - 1];
                    result_trs[result_trs.length - 1].tds.unshift(added_td);

                    added_td = trs[i].tds[trs[i].tds.length - 2];
                    result_trs[result_trs.length - 2].tds.unshift({
                        ...added_td, colSpan: added_td.rowSpan
                    });

                    added_td = trs[i].tds[trs[i].tds.length - 3];
                    result_trs[result_trs.length - 3].tds.unshift({
                        ...added_td, colSpan: added_td.rowSpan
                    });

                    added_td = trs[i].tds[trs[i].tds.length - 4];
                    result_trs[result_trs.length - 4].tds.unshift({
                        ...added_td, colSpan: added_td.rowSpan
                    });
                }
            }

            return result_trs;
        };

        return convert_trs_for_head(trs);
    };

    render() {
        let headers_rows_count = this.state.list_measures_head.length,
            sidebar_cols_count = this.state.list_measures_side.length;

        let trs_head = this.getTrsHead(),
            trs_side = this.getTrsSide();

        console.groupCollapsed('render()');
        console.info('trs_head', trs_head);
        console.info('trs_side', trs_side);
        console.info('measures_head_tree', this.state.measures_head_tree);
        console.info('measures_side_tree', this.state.measures_side_tree);
        console.groupEnd();

        return (
            <div className={"cube"}>
                <div className={"cube-settings"}>
                    <label>side
                        <select id={"settings_side_measures"} multiple={true}>
                            {this.state.list_measures_side.map((name, key) => {
                                return <option value={name} key={key}>{name}</option>
                            })}
                        </select>
                    </label>
                    <label>
                        <div className="cube-settings-button" onClick={this.settings_up} style={{marginBottom: "5px"}}><FontAwesomeIcon icon={"caret-up"}/></div>
                        <div className="cube-settings-button" onClick={this.settings_left} style={{marginBottom: "5px"}}><FontAwesomeIcon icon={"caret-left"}/></div>
                        <div className="cube-settings-button" onClick={this.settings_right}>                              <FontAwesomeIcon icon={"caret-right"}/></div>
                    </label>
                    <label>head
                        <select id={"settings_head_measures"} multiple={true}>
                            {this.state.list_measures_head.map((name, key) => {
                                return <option value={name} key={key}>{name}</option>
                            })}
                        </select>
                    </label>
                </div>
                <div className="cube-table" id="demo">
                    <header className="cube-table-header" style={{
                        marginLeft: (110 * sidebar_cols_count + 2) + "px",
                        height: (30 * headers_rows_count + 2) + "px",
                    }}>
                        <table cellSpacing={0}>
                            <thead>
                            {trs_head.map((tr, i) => {
                                return <tr key={i}>
                                    {tr.tds.map((td, j) => {
                                        return <th colSpan={td.colSpan} key={j}
                                                   onClick={this.handleClickToggleHeadChilds.bind(this, td)}>
                                            {td.name}
                                            <span style={{marginLeft: "7px"}}>
                                        {td.has_childs ? (!td.hidden_childs ?
                                            <FontAwesomeIcon icon={"caret-right"}/> :
                                            <FontAwesomeIcon icon={"caret-left"}/>) :
                                            false}
                                        </span>
                                        </th>
                                    })}
                                </tr>;
                            })}
                            </thead>
                        </table>
                    </header>
                    <aside className="cube-table-sidebar" style={{width: (110 * sidebar_cols_count + 3) + 'px'}}>
                        <table cellSpacing={0}>
                            <tbody>
                            {trs_side.map((tr, i) => {
                                return <tr key={i}>
                                    {tr.tds.map((td, j) => {
                                        return <th rowSpan={td.rowSpan} key={j}
                                                   onClick={this.handleClickToggleSideChilds.bind(this, td)}>
                                            {td.name}
                                            <span style={{marginLeft: "7px"}}>
                                        {td.has_childs ? (!td.hidden_childs ?
                                            <FontAwesomeIcon icon={"caret-down"}/> :
                                            <FontAwesomeIcon icon={"caret-up"}/>) :
                                            false}
                                        </span>
                                        </th>
                                    })}
                                </tr>;
                            })}
                            <tr>
                                <td></td>
                            </tr>
                            <tr>
                                <td></td>
                            </tr>
                            </tbody>
                        </table>
                    </aside>
                    <div className="cube-table-body">
                        <table cellSpacing={0}>
                            <tbody>
                            {trs_side.map((side, i) => {
                                return <tr key={i}>
                                    {trs_head[trs_head.length - 1].tds.map((head, j) => {
                                        return <td key={j}>
                                            cell{i}-{j}
                                        </td>
                                    })}
                                </tr>
                            })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    // todo: Переписать блок настроек по нормальному
    swapArray = (arr, oldPlace, newPlace) => {
        // Проверим выход за пределы массива
        if((Math.min(oldPlace, newPlace) < 0) || (Math.max(oldPlace, newPlace) >= arr.length)) {
            console.error('Out of range')
            return null;
        }
        const item = arr.splice(oldPlace, 1);
        arr.splice((newPlace > 0)? newPlace-1: 0, 0, item[0])
        return arr;
    };
    settings_get_values = () => {
        let $settings_side_measures = $('#settings_side_measures');
        let $settings_head_measures = $('#settings_head_measures');
        return {
            side: $settings_side_measures.val(),
            head: $settings_head_measures.val(),
            side_options_count: $settings_side_measures[0].options.length,
            head_options_count: $settings_head_measures[0].options.length,
        }
    };
    settings_check = () => {
        console.log('this.state', this.state);
        let values = this.settings_get_values();
        if(values.side.length > 0 && values.head.length > 0) {
            alert('Для перемещения надо выбрать только ОДНО значение! (убрать значение можно с нажатым CTRL)');
            return false;
        }
        return true;
    };
    settings_up = () => {
        if(!this.settings_check()) return false;

        let values = this.settings_get_values();
        if(values.side[0]) {
            let list_measures_side = this.state.list_measures_side,
                index = list_measures_side.indexOf(values.side[0]);

            if(index === 0) {
                return false;
            }
            list_measures_side = this.swapArray(list_measures_side, index, index - 1);
            this.setState({
                list_measures_side: list_measures_side,
            }, () => this.setState({...this.get_init_trees()}));
        } else if(values.head[0]) {
            let list_measures_head = this.state.list_measures_head,
                index = list_measures_head.indexOf(values.head[0]);

            if(index === 0) {
                return false;
            }
            list_measures_head = this.swapArray(list_measures_head, index, index - 1);
            this.setState({
                list_measures_head: list_measures_head,
            }, () => this.setState({...this.get_init_trees()}));
        }
    };
    settings_left = () => {
        if(!this.settings_check()) return false;
        let values = this.settings_get_values();


        if(values.head[0]) {
            if(values.head_options_count === 1) {
                alert('В верхней части должна остаться хотя бы одна строка!');
                return false;
            }
            let list_measures_side = this.state.list_measures_side,
                list_measures_head = this.state.list_measures_head;

            list_measures_head.splice(list_measures_head.indexOf(values.head[0]), 1);
            list_measures_side.push(values.head[0]);

            this.setState({
                list_measures_side: list_measures_side,
                list_measures_head: list_measures_head,
            }, () => this.setState({...this.get_init_trees()}))
        }
        console.info('settings_left', values)
    };
    settings_right = () => {
        if(!this.settings_check()) return false;

        let values = this.settings_get_values();
        if(values.side[0]) {
            if (values.side_options_count === 1) {
                alert('В левой части должна остаться хотя бы одна колонка!');
                return false;
            }
            let list_measures_side = this.state.list_measures_side,
                list_measures_head = this.state.list_measures_head;

            list_measures_side.splice(list_measures_side.indexOf(values.side[0]), 1);
            list_measures_head.push(values.side[0]);

            this.setState({
                list_measures_side: list_measures_side,
                list_measures_head: list_measures_head,
            }, () => this.setState({...this.get_init_trees()}))
        }
    };

    handleClickToggleSideChilds = (tree) => {
        let new_hidden = !tree.hidden_childs,
            new_childs = tree.childs.map(child => ({...child, hidden: new_hidden}));

        let full_tree = this.tree_set_element(this.state.measures_side_tree, tree._path, {
            ...tree,
            childs: new_childs,
            hidden_childs: new_hidden,
        });
        this.setState({
            measures_side_tree: full_tree,
        })
    };
    handleClickToggleHeadChilds = (tree) => {
        let new_hidden = !tree.hidden_childs,
            new_childs = tree.childs.map(child => ({...child, hidden: new_hidden}));

        let full_tree = this.tree_set_element(this.state.measures_head_tree, tree._path, {
            ...tree,
            childs: new_childs,
            hidden_childs: new_hidden,
        });
        this.setState({
            measures_head_tree: full_tree,
        })
    };

    tree_iterator_with_childs(tree, callback) {
        tree = callback(tree);
        tree.childs = tree.childs.map((child, i) => this.tree_iterator_with_childs(child, callback));
        return tree;
    }
    tree_get_deep_length(tree, filter = () => true) {
        let length = 0;

        this.tree_iterator_with_childs(tree, (child) => {
            if(filter(child)) {
                if(child._subtree) {
                    length += this.tree_get_deep_length(child._subtree, filter);
                } else {
                    length++;
                }
            }
            return child;
        });

        return length;
    }
    tree_set_element = (tree, path, element) => {
        let eval_str = `tree${path.map(key => `['${key}']`).join('')} = element`;
        element = copy(element);// Что бы не было варнинга

        eval(eval_str);
        return tree;
    };

    fullTree_get = (measures) => {
        let result_tree = copy(this.init_trees[this.init_trees_map[measures[0]]]);

        if(measures[1]) {
            result_tree = this.tree_iterator_with_childs(result_tree, (tree) => {
                return {
                    ...tree,
                    _subtree: this.fullTree_get(measures.slice(1,measures.length)),
                }
            });
        }

        return {
            ...result_tree,
        };
    };
    fullTree_setpaths(tree, path = []) {
        tree.childs = tree.childs.map((child, i) => this.fullTree_setpaths(child, path.concat(['childs', i])));
        if(tree._subtree) {
            tree._subtree = this.fullTree_setpaths(tree._subtree, path.concat(['_subtree']))
        }
        return {
            ...tree,
            _path: path,
        };
    }

    // Не используется но может пригодится
    tree_get_length(tree, filter = () => true) {
        let length = 0;
        this.tree_iterator_with_childs(tree, (child) => {
            if(filter(child)) {
                length++;
            }
            return child;
        });
        return length;
    }
}

CubeTable.defaultProps = {

};

CubeTable.propTypes = {

};

export default CubeTable;
