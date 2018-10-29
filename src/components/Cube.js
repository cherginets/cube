import React, {Component} from 'react';
import CubeTable from "./CubeTable";
import CubeSettingsPanel from "./CubeSettingsPanel";

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