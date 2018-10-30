import React, {Component} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import CubeSettingsModal from './CubeSettingsModal';
import {connect} from 'react-redux';
import { bindActionCreators } from 'redux'
import {settings_open_modal} from "../actions/SettingsActions";

class CubeTopPanel extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return <div className="cube-settings">
            <FontAwesomeIcon  className="cube-fa cube-m_mla" icon={'print'} title={"Print"}/>
            <FontAwesomeIcon className="cube-fa cube-m_ml10" icon={'cog'} title={"Settings"}
                onClick={this.props.settings_open_modal}
            />
            <CubeSettingsModal />
        </div>
    }
}

const mapStateToProps = (state, ownProps) => ({
    // modal_show: state.settings.modal_show,
});

const mapDispatchToProps = dispatch => bindActionCreators({
    settings_open_modal
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(CubeTopPanel);
