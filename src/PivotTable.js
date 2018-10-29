import React, {Component} from 'react';
import $ from 'jquery';
import PropTypes from 'prop-types';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import './pivot_table.css';


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

class PivotTable extends Component {
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

        let init_list_measures_head = ['regions', 'products', 'scenarios'],
            init_list_measures_side = ['years'],

            measures_head = init_list_measures_head.map(measure_code => copy(this.init_trees[this.init_trees_map[measure_code]])),
            measures_head_tree = this.fullTree_get(init_list_measures_head),

            measures_side = init_list_measures_side.map(measure_code => copy(this.init_trees[this.init_trees_map[measure_code]])),
            measures_side_tree = this.fullTree_get(init_list_measures_side);

        measures_head_tree = this.fullTree_setpaths(measures_head_tree);
        measures_side_tree = this.fullTree_setpaths(measures_side_tree);

        this.state = {
            trees: this.init_trees,
            trees_map: this.init_trees_map,
            list_measures_head: init_list_measures_head,
            list_measures_side: init_list_measures_side,

            trs_side: [],

            measures_side: measures_side,
            measures_side_tree: measures_side_tree,

            measures_head: measures_head,
            measures_head_tree: measures_head_tree,
        };
    }

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
            $body = $(el).find('.pivot-table-body');
            $sidebar = $(el).find('.pivot-table-sidebar table');
            $header = $(el).find('.pivot-table-header table');
            return $($body).scroll(function () {
                $($sidebar).css('margin-top', -$($body).scrollTop());
                return $($header).css('margin-left', -$($body).scrollLeft());
            });
        };
        new fixedTable($('#demo'));
        //endregion

    }

    getTrsSide = () => {
        let get_trs = (tree, param_length = 1) => {
            let trs = [];
            if(tree.hidden) {
                return trs;
            }
            if(tree._subtree) {
                trs = get_trs(tree._subtree, param_length);
                trs = copy(trs);

                let length = this.tree_get_deep_length(tree._subtree, (tree) => !tree.hidden);
                length = length * param_length;
                trs[0].tds.unshift({...tree, rowSpan: length});
                tree.childs
                    .filter((child) => !child.hidden)
                    .forEach(child => {
                        trs = trs.concat(get_trs(child));
                    });
            } else {
                trs.push({tds: [tree]});
                tree.childs.forEach(child => {
                    this.getTreeIterator(child, (child) => {
                        if(!child.hidden) {
                            trs.push({tds: [child]});
                        }
                    })
                })
            }
            return trs;
        };

        return get_trs(this.state.measures_side_tree)
    };
    getTrsHead = () => {
        let get_trs = (tree, param_length = 1) => {
            let trs = [];
            // if(tree.hidden) {
            //     return trs;
            // }
            if(tree._subtree) {
                trs = get_trs(tree._subtree, param_length);
                trs = copy(trs);

                // let length = this.tree_get_deep_length(tree._subtree, (tree) => !tree.hidden);
                let length = this.tree_get_deep_length(tree._subtree);
                length = length * param_length;
                trs[0].tds.unshift({...tree, rowSpan: length});
                tree.childs
                    // .filter((child) => !child.hidden)
                    .forEach(child => {
                        trs = trs.concat(get_trs(child));
                    });
            } else {
                trs.push({tds: [tree]});
                tree.childs.forEach(child => {
                    this.getTreeIterator(child, (child) => {
                        // if(!child.hidden) {
                            trs.push({tds: [child]});
                        // }
                    })
                })
            }
            return trs;
        };
        let convert_trs_for_head = (trs) => {
            console.group('func - convert_trs_for_head');
            console.log('trs', trs);
            let result_trs = [], added_td;
            // debugger;
            for (let i = trs.length - 1; i >= 0; i--) {
                // Костылииии. Максимум в шапке может быть 4 уровня (строк заголовков)
                if (trs[i].tds.length === 1) {
                    if (!result_trs[result_trs.length - 1]) {
                        result_trs[0] = {tds: []};
                    }
                    result_trs[result_trs.length - 1].tds.unshift(trs[i].tds[0]);
                }
                else if (trs[i].tds.length === 2) {
                    if (!result_trs[result_trs.length - 2]) {
                        result_trs.unshift({tds: []});
                    }
                    added_td = trs[i].tds[trs[i].tds.length - 1];
                    result_trs[result_trs.length - 1].tds.unshift(added_td);

                    added_td = trs[i].tds[trs[i].tds.length - 2];
                    result_trs[result_trs.length - 2].tds.unshift({
                        ...added_td, colSpan: added_td.rowSpan
                    });
                }
                else if (trs[i].tds.length === 3) {
                    if (!result_trs[result_trs.length - 3]) {
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

                console.log('trs[' + i + '];', trs[i])
            }
            console.log('result_trs', result_trs);
            console.groupEnd();
            // return trs;
            return result_trs;

            //
            // let rowspan = false, rowspan_j = 0;
            // trs.forEach((tr,i) => {
            //     console.log('trs', i, tr.tds)
            //     tr.tds.forEach((td, j) => {
            //         if(td.rowSpan > 1) {
            //             rowspan = td.rowSpan;
            //             rowspan_j = j+1;
            //         }
            //         if(rowspan === td.rowSpan || rowspan === false) {
            //             result_trs[j] = {
            //                 ...result_trs[j],
            //                 tds: (result_trs[j] && result_trs[j].tds ? result_trs[j].tds : []).concat([{
            //                     ...td,
            //                     colSpan: td.rowSpan,
            //                     rowSpan: 1,
            //                 }])
            //             };
            //             if(rowspan !== false) {
            //                 rowspan--
            //             }
            //         } else if(rowspan !== false) {
            //             rowspan--;
            //             result_trs[rowspan_j] = {
            //                 ...result_trs[rowspan_j],
            //                 tds: (result_trs[rowspan_j] && result_trs[rowspan_j].tds ? result_trs[rowspan_j].tds : []).concat([{
            //                     ...td,
            //                     rowSpan: 1,
            //                 }])
            //             }
            //         }
            //     })
            // });
            // result_trs.push({tds: tds});
        };
        let trs = get_trs(this.state.measures_head_tree);
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
            <div className="pivot-table" id="demo">
                <header className="pivot-table-header" style={{
                    marginLeft: (110 * sidebar_cols_count + 2) + "px",
                    height: (30 * headers_rows_count + 2) + "px",
                }}>
                    <table cellSpacing={0}>
                        <thead>
                        {trs_head.map((tr, i) => {
                            return <tr key={i}>
                                {tr.tds.map((td, j) => {
                                    // console.log('td', td);
                                    // console.log('td.colSpan', td.colSpan);
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
                <aside className="pivot-table-sidebar" style={{width: (110 * sidebar_cols_count + 3) + 'px'}}>
                    <table cellSpacing={0}>
                        <tbody>
                        {trs_side.map((tr, i) => {
                            return <tr key={i}>
                                {tr.tds.map((td,j) => {
                                    return <th rowSpan={td.rowSpan} key={j} onClick={this.handleClickToggleSideChilds.bind(this, td)}>
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
                <div className="pivot-table-body">
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
        );
    }

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
        console.info('tree_set_element', tree, path, element);
        console.info('eval_str', eval_str);

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

PivotTable.defaultProps = {

};

PivotTable.propTypes = {

};

export default PivotTable;
