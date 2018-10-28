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
                    hidden: false,
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
                    hidden: false,
                    hidden_childs: false,
                    childs: [
                        {name: "2018", hidden: false, childs: [{name: "Q 1"}, {name: "Q 2"}, {name: "Q 3"}, {name: "Q 4"}]},
                        {name: "2017", hidden: false, childs: [{name: "Q 1"}, {name: "Q 2"}, {name: "Q 3"}, {name: "Q 4"}]},
                        {name: "2016", hidden: false, childs: [{name: "Q 1"}, {name: "Q 2"}, {name: "Q 3"}, {name: "Q 4"}]},
                    ]
                }
            },
            {
                name: "Measure 4 (Scenarios)",

                tree: {
                    name: "All scenarios",
                    code: "scenarios",
                    hidden: false,
                    childs: [
                        {name: "Actual"},
                        {name: "Budget"},
                    ]
                }
            },
        ];

        let trees = measures.map(measure => this.prepareTree(measure.tree));

        this.state = {
            trees: trees,
            trees_map: create_map(trees, 'code'),
            heads_measures: ['regions'],
            sides_measures: ['years', 'products', 'scenarios'],
        };
    }

    prepareTree = (tree, lvl = 0, path = []) => {
        tree.path = path;
        if (tree.childs && tree.childs.length > 0) {
            tree.childs = tree.childs.map((child, i) => this.prepareTree(child, lvl + 1, path.concat(['childs', i])))
        } else {
            tree.childs = [];
        }
        tree.hidden = typeof tree.hidden !== 'undefined' ? tree.hidden : true;
        tree.hidden_childs = typeof tree.hidden_childs !== 'undefined' ? tree.hidden_childs : true;

        tree.lvl = lvl;
        tree.code = tree.code ? tree.code : tree.name;
        tree.has_childs = tree.childs.length > 0;

        return tree;
    };

    getTreeIterator(tree, callback = () => {
    }) {
        callback(tree);
        let result = [tree];
        tree.childs.forEach(child => result = result.concat(this.getTreeIterator(child, callback)));
        return result;
    }

    componentDidMount() {
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
    }
    getFullStateTree = (measures) => {
        let result_tree = this.state.trees[this.state.trees_map[measures[0]]];

        if(measures[1]) {
            result_tree = this.tree_iterator_with_childs(result_tree, (tree) => {
                return {
                    ...tree,
                    _subtree: this.getFullStateTree(measures.slice(1,measures.length))
                }
            });
        }

        return result_tree;
    };
    getTrsSide = () => {
        let get_trs = (tree) => {
            let tmp_trs = [];
            this.getTreeIterator(tree, (subtree) => {
                tmp_trs.push({tds: [{text: subtree.name}]});
            });
            return tmp_trs;
        };
        let trs = [];
        for( let i = this.state.sides_measures.length - 1; i >= 0; i--) {
            let cur_trs = get_trs(this.state.trees[this.state.trees_map[this.state.sides_measures[i]]]);
            if(trs.length === 0) {
                trs = cur_trs;
            } else {
                let new_trs = [];
                cur_trs.forEach(tr => {
                    let tmp_trs = copy(trs);
                    tmp_trs[0].tds.unshift({...tr.tds[0], rowspan: tmp_trs.length});
                    new_trs = new_trs.concat(tmp_trs)
                });
                trs = new_trs;
            }
        }

        return trs;
    };
    render() {
        // console.info('this.state', this.state);

        let heads_measure = 'regions',
            sides_measure = 'years',
            heads = this.getTreeIterator(this.state.trees[this.state.trees_map[heads_measure]]).filter(measure => !measure.hidden),
            sides = this.getTreeIterator(this.state.trees[this.state.trees_map[sides_measure]]).filter(measure => !measure.hidden),
            headers_rows_count = this.state.heads_measures.length,
            sidebar_cols_count = this.state.sides_measures.length;

        let tree_side = this.getFullStateTree(this.state.sides_measures);
        let trs_side = this.getTrsSide();
        console.log('tree_side', tree_side);
        console.log('trs_side', trs_side);

        // console.log('heads', heads);
        // console.log('sides', sides);
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
                                    onClick={this.toggleChilds.bind(this, heads_measure, cell.code)}
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
                                    return <th rowSpan={td.rowspan} key={j}>
                                        {td.text}
                                        <span style={{marginLeft: "7px"}}>
                                        {td.has_childs ? (!td.hidden_childs ?
                                            <FontAwesomeIcon icon={"caret-down"}/> :
                                            <FontAwesomeIcon icon={"caret-up"}/>) :
                                            false}
                                        </span>
                                    </th>
                                })}
                                {/*<th onClick={this.toggleChilds.bind(this, sides_measure, side.code)}>*/}
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

    setTreeElement = (tree, path, element) => {
        let eval_str = `tree${path.map(key => `['${key}']`).join('')} = element`;
        console.log('setTreeElement', tree, path, element);
        console.log('eval_str', eval_str);

        eval(eval_str);
        return tree;
    };
    toggleChilds = (measure_code, element_code) => {
        console.info('click - toggleChilds', measure_code, element_code)

        let tree_index = this.state.trees_map[measure_code],
            tree = this.state.trees[tree_index];

        this.getTreeIterator(tree, (item => {
            if (item.code === element_code) {
                let hidden = !item.hidden_childs;
                item.hidden_childs = hidden;

                // Прежде чем проставлять видимость прямым детям - уберём видимость на всех что есть
                let rec_set_hidden_true = (childs) => {
                    childs.forEach(child => {
                        this.setTreeElement(tree, child.path, {...child, hidden: true, hidden_childs: true});
                        rec_set_hidden_true(child.childs)
                    });
                };

                rec_set_hidden_true(item.childs);
                item.childs.forEach(child => {
                    tree = this.setTreeElement(tree, child.path, {...child, hidden: hidden});
                });
            }
        }));


        let new_trees = this.state.trees;
        new_trees.splice(tree_index, 1, tree);

        this.setState({trees: new_trees})

        console.info('click - toggleChilds - result ', new_trees)
    }

    tree_iterator_with_childs(tree, callback) {
        tree = callback(tree);
        tree.childs = tree.childs.map(child => this.tree_iterator_with_childs(child, callback));
        return tree;
    }
    tree_get_length(tree) {
        let length = 0;
        this.tree_iterator_with_childs(tree, (child) => {
            length++;
        });
        return length;
    }
}

PivotTable.defaultProps = {

};

PivotTable.propTypes = {

};

export default PivotTable;
