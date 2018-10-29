import React, {Component} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'

class CubeSettingsPanel extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return <div className="cube-modal-overlay cube-settings-modal">
            <div className="cube-modal">
                test

                <FontAwesomeIcon  className="cube-fa cube-modal-close" icon={'times'} title={"Close"}/>
                <FontAwesomeIcon  className="cube-fa cube-modal-help" icon={'question'} title={"Help"}/>
            </div>
        </div>
    }
}

export default CubeSettingsPanel;