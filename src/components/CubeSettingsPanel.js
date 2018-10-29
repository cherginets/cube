import React, {Component} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'

class CubeSettingsPanel extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return <div className="cube-settings">
            <FontAwesomeIcon className="cube-settings-cog" icon={'cog'}/>
        </div>
    }
}

export default CubeSettingsPanel;