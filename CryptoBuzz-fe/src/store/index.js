import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import {
    persistStore,
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';

// Import slices
import authReducer from './authSlice';
import { clientAcademyCategoryApiSlice } from './client/clientAcademyCategoryApiSlice';
import { clientCoursesApiSlice } from './client/clientCoursesApiSlice';
import { clientTradeIdeaApiSlice } from './client/clientTradeIdeaApiSlice';
import { clientTradeAnalysisApiSlice } from './client/clientTradeAnalysisApiSlice';
import { clientCryptoApiSlice } from './client/clientCryptoApiSlice';

// Persist configuration
const persistConfig = {
    key: 'root',
    version: 1,
    storage,
    whitelist: ['auth'], // Only persist auth slice
};

// Combine reducers
const rootReducer = combineReducers({
    auth: authReducer,
    [clientAcademyCategoryApiSlice.reducerPath]: clientAcademyCategoryApiSlice.reducer,
    [clientCoursesApiSlice.reducerPath]: clientCoursesApiSlice.reducer,
    [clientTradeIdeaApiSlice.reducerPath]: clientTradeIdeaApiSlice.reducer,
    [clientTradeAnalysisApiSlice.reducerPath]: clientTradeAnalysisApiSlice.reducer,
    [clientCryptoApiSlice.reducerPath]: clientCryptoApiSlice.reducer,
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }).concat(
            clientAcademyCategoryApiSlice.middleware,
            clientCoursesApiSlice.middleware,
            clientTradeIdeaApiSlice.middleware,
            clientTradeAnalysisApiSlice.middleware,
            clientCryptoApiSlice.middleware,
        ),
});

// Setup listeners for refetchOnFocus/refetchOnReconnect
setupListeners(store.dispatch);

// Create persistor
export const persistor = persistStore(store);

export default store;
