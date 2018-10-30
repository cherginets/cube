export const settings_open_modal = () => dispatch => {
    dispatch({
        type: 'SETTINGS_SET_SHOW_MODAL',
        show: true,
    })
};
export const settings_close_modal = () => dispatch => {
    dispatch({
        type: 'SETTINGS_SET_SHOW_MODAL',
        show: false,
    })
};