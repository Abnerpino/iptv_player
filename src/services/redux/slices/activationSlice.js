import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    id: null,
    isActive: false,
    error: null
};

const activationSlice = createSlice({
    name: 'activation',
    initialState,
    reducers: {
        setID: (state, action) => {
            state.id = action.payload;
        },
        activationSuccess: (state, action) => {
            state.id = action.payload;
            state.isActive = true;
            state.error = null;
        },
        activationFailure: (state, action) => {
            state.error= action.payload;
        },
    },
});

export const { setID, activationSuccess, activationFailure } = activationSlice.actions;

export default activationSlice.reducer;