// SETTINGS REDUCER

const initialState = {
    modal_show: false,
};

export default (state = initialState, action) => {
    switch (action.type) {
        case 'SETTINGS_SET_SHOW_MODAL':
            return {
                modal_show: action.show,
            };
        default:
            return state
    }
}