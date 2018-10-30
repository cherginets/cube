import React, {Component} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {connect} from 'react-redux';
import { bindActionCreators } from 'redux'
import {settings_close_modal} from "../actions/SettingsActions";

class CubeSettingsModal extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        if (!this.props.modal_show) return false;

        return <div className="cube-modal-overlay cube-settings-modal" onClick={this.props.settings_close_modal}>
            <div className="cube-modal" onClick={e => e.stopPropagation()}>
                <table className={"cube-settings-table"}>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Side</th>
                            <th>Position</th>
                        </tr>
                    </thead>
                </table>

                <FontAwesomeIcon className="cube-fa cube-modal-close" icon={'times'} title={"Close"}
                    onClick={this.props.settings_close_modal}
                />
                <FontAwesomeIcon className="cube-fa cube-modal-help" icon={'question'} title={"Help"}/>
            </div>
        </div>
    }
}

const mapStateToProps = (state, ownProps) => ({
    modal_show: state.settings.modal_show,
});

const mapDispatchToProps = dispatch => bindActionCreators({
    settings_close_modal: settings_close_modal,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(CubeSettingsModal);
