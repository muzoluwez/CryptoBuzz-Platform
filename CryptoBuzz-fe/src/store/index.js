import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './authSlice';
import { clientAcademyCategoryApiSlice } from './client/clientAcademyCategoryApiSlice';
import { clientAuthApiSlice } from './client/clientAuthApiSlice';
import { clientCoursesApiSlice } from './client/clientCoursesApiSlice';
import { clientCryptoApiSlice } from './client/clientCryptoApiSlice';
import { clientIdeaApiSlice } from './client/clientIdeaApiSlice';
import { clientScheduleApiSlice } from './client/clientScheduleApiSlice';
import { clientSocialApiSlice } from './client/clientSocialApiSlice';
import { clientTradeAnalysisApiSlice } from './client/clientTradeAnalysisApiSlice';

const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  whitelist: ['auth'],
};

const rootReducer = combineReducers({
  auth: authReducer,
  [clientAuthApiSlice.reducerPath]: clientAuthApiSlice.reducer,
  [clientAcademyCategoryApiSlice.reducerPath]:
    clientAcademyCategoryApiSlice.reducer,
  [clientCoursesApiSlice.reducerPath]: clientCoursesApiSlice.reducer,
  [clientTradeAnalysisApiSlice.reducerPath]:
    clientTradeAnalysisApiSlice.reducer,
  [clientCryptoApiSlice.reducerPath]: clientCryptoApiSlice.reducer,
  [clientIdeaApiSlice.reducerPath]: clientIdeaApiSlice.reducer,
  [clientSocialApiSlice.reducerPath]: clientSocialApiSlice.reducer,
  [clientScheduleApiSlice.reducerPath]: clientScheduleApiSlice.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(
      clientAuthApiSlice.middleware,
      clientAcademyCategoryApiSlice.middleware,
      clientCoursesApiSlice.middleware,
      clientTradeAnalysisApiSlice.middleware,
      clientCryptoApiSlice.middleware,
      clientIdeaApiSlice.middleware,
      clientSocialApiSlice.middleware,
      clientScheduleApiSlice.middleware,
    ),
});

setupListeners(store.dispatch);

export const persistor = persistStore(store);

export default store;
