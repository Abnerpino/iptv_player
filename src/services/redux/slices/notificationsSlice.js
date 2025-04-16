import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    list: []
};

const notificationsSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        markAsViewed: (state, action) => {
            const notificacion = state.list.find(item => item.id === action.payload);
            if (notificacion && !notificacion.visto) {
                notificacion.visto = true;
            }
        },
        setListNotifications: (state, action) => {
            state.list = action.payload;
        }
    }
});

export const { markAsViewed, setListNotifications } = notificationsSlice.actions;

export default notificationsSlice.reducer;
