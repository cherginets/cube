import React, {Component} from 'react';
import CubeTable from "./CubeTable";
import CubeSettingsPanel from "./CubeSettingsPanel";

import { library } from '@fortawesome/fontawesome-svg-core'
import { faCaretUp, faCaretDown, faCaretLeft, faCaretRight, faCog, faPrint } from '@fortawesome/free-solid-svg-icons'
library.add(faCaretUp, faCaretDown, faCaretLeft, faCaretRight, faCog, faPrint);

class Cube extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return <div className="cube">
            <CubeSettingsPanel />
            <CubeTable />
        </div>
    }
}

export default Cube;