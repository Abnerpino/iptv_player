import { configureStore } from "@reduxjs/toolkit";
import activationReducer from './slices/activationSlice';

const store = configureStore({
    reducer: {
        activation: activationReducer,
    },
});

export default store;