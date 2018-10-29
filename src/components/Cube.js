import React, {Component} from 'react';
import CubeTable from "./CubeTable";
import CubeSettings from "./CubeSettings";

import { library } from '@fortawesome/fontawesome-svg-core'
import { faCaretUp, faCaretDown, faCaretLeft, faCaretRight, faCog, faPrint, faTimes, faQuestion } from '@fortawesome/free-solid-svg-icons'
library.add(faCaretUp, faCaretDown, faCaretLeft, faCaretRight, faCog, faPrint, faTimes, faQuestion);

class Cube extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return <div className="cube">
            <CubeSettings />
            <CubeTable />
        </div>
    }
}

export default Cube;