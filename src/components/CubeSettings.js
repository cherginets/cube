import React, {Component} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import CubeSettingsModal from './CubeSettingsModal';

class CubeSettingsPanel extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return <div className="cube-settings">
            <FontAwesomeIcon  className="cube-fa cube-m_mla" icon={'print'} title={"Print"}/>
            <FontAwesomeIcon className="cube-fa cube-m_ml10" icon={'cog'} title={"Settings"}/>

            <CubeSettingsModal />
        </div>
    }
}

export default CubeSettingsPanel;