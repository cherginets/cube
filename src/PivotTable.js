import React, {Component} from 'react';
import $ from 'jquery';
import './pivot_table.css';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'

// let get_range = (end, start = 1) => {
//     let result = [];
//     for (let i = start; i <= end; i++) {
//         result.push(i)
//     }
//     return result;
// };
let create_map = (array, key) => {
    let result = {};
    array.forEach((item, i) => result[item[key]] = i)
    return result;
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
        tree.lvl = lvl;
        tree.code = tree.code ? tree.code : tree.name;
        tree.has_childs = tree.childs.length > 0;
        tree.hidden_childs = true;

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

    render() {
        console.info('this.state', this.state);

        let heads_measure = 'regions',
            sides_measure = 'years',
            heads = this.getTreeIterator(this.state.trees[this.state.trees_map[heads_measure]]).filter(measure => !measure.hidden),
            sides = this.getTreeIterator(this.state.trees[this.state.trees_map[sides_measure]]).filter(measure => !measure.hidden);

        console.log('heads', heads);
        console.log('sides', sides);
        return (
            <div className="pivot-table" id="demo">
                <header className="pivot-table-header">
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
                <aside className="pivot-table-sidebar">
                    <table cellSpacing={0}>
                        <tbody>
                        {sides.map((cell, i) => {
                            let caret = false;

                            if (cell.has_childs) {
                                if (!cell.hidden_childs) {
                                    caret = <FontAwesomeIcon icon={"caret-down"}/>
                                } else {
                                    caret = <FontAwesomeIcon icon={"caret-up"}/>
                                }
                            }
                            return <tr key={i}>
                                <th onClick={this.toggleChilds.bind(this, sides_measure, cell.code)}>
                                    {cell.name}
                                    <span style={{marginLeft: "7px"}}>{caret}</span>
                                </th>
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
                        {sides.map((side, i) => {
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
}

export default PivotTable;
