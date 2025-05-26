import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from 'redux';
import clientReducer from './slices/clientSlice';
import streamingReducer from './slices/streamingSlice';
import contentReducer from './slices/contentSlice';
import categoriesReducer from './slices/categoriesSlice';
import notificationsReducer from './slices/notificationsSlice';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
};

const rootReducer = combineReducers({
  client: clientReducer,
  streaming: streamingReducer,
  content: contentReducer,
  categories: categoriesReducer,
  notifications: notificationsReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
      /*serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/PAUSE',
          'persist/FLUSH',
          'persist/REGISTER',
          'persist/PURGE',
        ],
      },*/
    }),
});

export const persistor = persistStore(store);
