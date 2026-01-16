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
import languageReducer from './languageSlice';
import { clientAcademyCategoryApiSlice } from './client/clientAcademyCategoryApiSlice';
import { clientAuthApiSlice } from './client/clientAuthApiSlice';
import { clientCoursesApiSlice } from './client/clientCoursesApiSlice';
import { clientCryptoApiSlice } from './client/clientCryptoApiSlice';
import { clientEducatorApiSlice } from './client/clientEducatorApiSlice';
import { clientIdeaApiSlice } from './client/clientIdeaApiSlice';
import { clientLanguageApiSlice } from './client/clientLanguageApiSlice';
import { clientRatingApiSlice } from './client/clientRatingApiSlice';
import { clientScheduleApiSlice } from './client/clientScheduleApiSlice';
import { clientSocialApiSlice } from './client/clientSocialApiSlice';
import { clientTradeAnalysisApiSlice } from './client/clientTradeAnalysisApiSlice';
import { clientPaymentApiSlice } from './client/clientPaymentApiSlice';

const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  whitelist: ['auth', 'language'],
};

const rootReducer = combineReducers({
  auth: authReducer,
  language: languageReducer,
  [clientAuthApiSlice.reducerPath]: clientAuthApiSlice.reducer,
  [clientAcademyCategoryApiSlice.reducerPath]:
    clientAcademyCategoryApiSlice.reducer,
  [clientCoursesApiSlice.reducerPath]: clientCoursesApiSlice.reducer,
  [clientPaymentApiSlice.reducerPath]: clientPaymentApiSlice.reducer,
  [clientTradeAnalysisApiSlice.reducerPath]:
    clientTradeAnalysisApiSlice.reducer,
  [clientCryptoApiSlice.reducerPath]: clientCryptoApiSlice.reducer,
  [clientEducatorApiSlice.reducerPath]: clientEducatorApiSlice.reducer,
  [clientIdeaApiSlice.reducerPath]: clientIdeaApiSlice.reducer,
  [clientLanguageApiSlice.reducerPath]: clientLanguageApiSlice.reducer,
  [clientRatingApiSlice.reducerPath]: clientRatingApiSlice.reducer,
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
      clientPaymentApiSlice.middleware,
      clientTradeAnalysisApiSlice.middleware,
      clientCryptoApiSlice.middleware,
      clientEducatorApiSlice.middleware,
      clientIdeaApiSlice.middleware,
      clientLanguageApiSlice.middleware,
      clientRatingApiSlice.middleware,
      clientSocialApiSlice.middleware,
      clientScheduleApiSlice.middleware,
    ),
});

setupListeners(store.dispatch);

export const persistor = persistStore(store);

export default store;

