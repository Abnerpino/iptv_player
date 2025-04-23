import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    id: '',
    deviceId: '',
    clientName: '',
    username: '',
    user: '',
    password: '',
    host: '',
    isRegistered: false,
    isActive: false,
    expirationDate: '',
    purchasedPackage: '',
    deviceModel: '',
    android: '',
};

const clientSlice = createSlice({
    name: 'client',
    initialState,
    reducers: {
        setID: (state, action) => {
            state.id = action.payload;
        },
        setDeviceID: (state, action) => {
            state.deviceId = action.payload;
        },
        setClientName: (state, action) => {
            state.clientName = action.payload;
        },
        setUsername: (state, action) => {
            state.username = action.payload;
        },
        setUser: (state, action) => {
            state.user = action.payload;
        },
        setPassword: (state, action) => {
            state.password = action.payload;
        },
        setHost: (state, action) => {
            state.host = action.payload;
        },
        setIsRegistered: (state, action) => {
            state.isRegistered = action.payload;
        },
        setIsActive: (state, action) => {
            state.isActive = action.payload;
        },
        setExpirationDate: (state, action) => {
            state.expirationDate = action.payload;
        },
        setPurchasedPackage: (state, action) => {
            state.purchasedPackage = action.payload;
        },
        setDeviceModel: (state, action) => {
            state.deviceModel = action.payload;
        },
        setAndroid: (state, action) => {
            state.android = action.payload;
        },
    },
});

export const { setID, setDeviceID, setClientName, setUsername, setUser, setPassword, setHost, setIsRegistered, setIsActive, setExpirationDate, setPurchasedPackage, setDeviceModel, setAndroid,   } = clientSlice.actions;

export default clientSlice.reducer;