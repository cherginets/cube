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

        let init_list_measures_head = ['regions'],
            init_list_measures_side = ['years', 'products', 'scenarios'],
            measures_side = init_list_measures_side.map(measure_code => copy(this.init_trees[this.init_trees_map[measure_code]])),
            measures_side_map = create_map(measures_side, 'code'),
            measures_side_tree = this.fullTree_get(init_list_measures_side);

        measures_side_tree = this.fullTree_setpaths(measures_side_tree);

        this.state = {
            trees: this.init_trees,
            trees_map: this.init_trees_map,
            list_measures_head: init_list_measures_head,
            list_measures_side: init_list_measures_side,

            trs_side: [],

            measures_side: measures_side,
            measures_side_map: measures_side_map,
            measures_side_tree: measures_side_tree,
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
                let get_childs_trs = (childs) => {
                    let trs = [];


                    return trs;

                };
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

        // let get_visible_trs = (tree) => {
        //     let tmp_trs = [];
        //     this.getTreeIterator(tree, (subtree) => {
        //         if(!subtree.hidden) {
        //             tmp_trs.push({tds: [subtree]});
        //         }
        //     });
        //     return tmp_trs;
        // };

        // trs = [];
        // for( let i = this.state.measures_side.length - 1; i >= 0; i--) {
        //     // let cur_trs = get_visible_trs(this.state.measures_side_tree[i]);
        //     let cur_trs = get_visible_trs(this.state.measures_side[i]);
        //     if(trs.length === 0) {
        //         trs = cur_trs;
        //     } else {
        //         let new_trs = [];
        //         cur_trs.forEach(tr => {
        //             let tmp_trs = copy(trs);
        //             tmp_trs[0].tds.unshift({...tr.tds[0], rowSpan: tmp_trs.length});
        //             new_trs = new_trs.concat(tmp_trs)
        //         });
        //         trs = new_trs;
        //     }
        // }
        //
        // return trs;
    };
    render() {
        let heads_measure = 'regions',
            heads = this.getTreeIterator(this.state.trees[this.state.trees_map[heads_measure]]).filter(measure => !measure.hidden),
            headers_rows_count = this.state.list_measures_head.length,
            sidebar_cols_count = this.state.list_measures_side.length;

        let trs_side = this.getTrsSide();

        console.log('trs_side', trs_side);
        console.log('measures_side_tree', this.state.measures_side_tree);

        return (
            <div className="pivot-table" id="demo">
                <header className="pivot-table-header" style={{
                    marginLeft: (110 * sidebar_cols_count + 2) + "px",
                    height: (30 * headers_rows_count + 2) + "px",
                }}>
                    <table cellSpacing={0}>
                        <thead>
                        <tr>
                            {heads.map((cell, j) => {
                                let caret = false;

                                if (cell.has_childs) {
                                    if (!cell.hidden_childs) {
                                        caret = <FontAwesomeIcon icon={"caret-right"}/>
                                    } else {
                                        caret = <FontAwesomeIcon icon={"caret-left"}/>
                                    }
                                }

                                return <th
                                    key={j}
                                    onClick={this.handleClickToggleChilds.bind(this, cell)}
                                >
                                    {cell.name}
                                    <span style={{marginLeft: "7px"}}>{caret}</span>
                                </th>
                            })}
                        </tr>
                        </thead>
                    </table>
                </header>
                <aside className="pivot-table-sidebar" style={{width: (110 * sidebar_cols_count + 3) + 'px'}}>
                    <table cellSpacing={0}>
                        <tbody>
                        {trs_side.map((tr, i) => {
                            return <tr key={i}>
                                {tr.tds.map((td,j) => {
                                    return <th rowSpan={td.rowSpan} key={j} onClick={this.handleClickToggleChilds.bind(this, td)}>
                                        {td.name}
                                        <span style={{marginLeft: "7px"}}>
                                        {td.has_childs ? (!td.hidden_childs ?
                                            <FontAwesomeIcon icon={"caret-down"}/> :
                                            <FontAwesomeIcon icon={"caret-up"}/>) :
                                            false}
                                        </span>
                                    </th>
                                })}
                                {/*<th>*/}
                                    {/*{side.name}*/}

                                {/*</th>*/}
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
                                {heads.map((head, j) => {
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


    handleClickToggleChilds = (tree) => {
        console.log('handleClickToggleChilds', tree)

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
        // console.log('toggleChilds', tree)
        // console.info('click - toggleChilds', measure_code, element_code)
        //
        // let tree_index = this.state.trees_map[measure_code],
        //     tree = this.state.trees[tree_index];
        //
        // this.getTreeIterator(tree, (item => {
        //     if (item.code === element_code) {
        //         let hidden = !item.hidden_childs;
        //         item.hidden_childs = hidden;
        //
        //         // Прежде чем проставлять видимость прямым детям - уберём видимость на всех что есть
        //         let rec_set_hidden_true = (childs) => {
        //             childs.forEach(child => {
        //                 this.tree_set_element(tree, child.path, {...child, hidden: true, hidden_childs: true});
        //                 rec_set_hidden_true(child.childs)
        //             });
        //         };
        //
        //         rec_set_hidden_true(item.childs);
        //         item.childs.forEach(child => {
        //             tree = this.tree_set_element(tree, child.path, {...child, hidden: hidden});
        //         });
        //     }
        // }));
        //
        //
        // let new_trees = this.state.trees;
        // new_trees.splice(tree_index, 1, tree);
        //
        // this.setState({trees: new_trees})
        //
        // console.info('click - toggleChilds - result ', new_trees)
    }

    tree_iterator_with_childs(tree, callback, path = []) {
        tree = callback(tree, path);
        tree.childs = tree.childs.map((child, i) => this.tree_iterator_with_childs(child, callback, path.concat(['childs', i])));
        return tree;
    }
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
    // for only not hidden
    tree_get_deep_length(tree, filter = () => true) {
        let length = 0;

        this.tree_iterator_with_childs(tree, (child) => {
            if(filter(child)) {
                if(child._subtree) {
                    let subtree_length = this.tree_get_deep_length(child._subtree, filter);
                    length += subtree_length;
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
        // console.log('tree_set_element', tree, path, element);
        // console.log('eval_str', eval_str);

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
}

PivotTable.defaultProps = {

};

PivotTable.propTypes = {

};

export default PivotTable;
