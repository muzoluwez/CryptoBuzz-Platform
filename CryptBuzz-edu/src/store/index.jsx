import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./reducer/authSlice";
import courseReducer from "./reducer/courseSlice";
import sectionReducer from "./reducer/sectionSlice";
import lectureReducer from "./reducer/lectureSlice";
import educatorPostReducer from "./reducer/postSlice";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage"; // localStorage
import studentLanagugeSlice from "./reducer/studentLanagugeSlice";

// ============================================================================
// ADMIN API SLICES - Only admin-related API endpoints
// ============================================================================
import { adminTradeIdeasApiSlice } from "./api/admin/adminTradeIdeasApiSlice";
import { adminLiveSessionApiSlice } from "./api/admin/adminLiveSessionApiSlice";
import { adminEducatorsApiSlice } from "./api/admin/adminEducatorsApiSlice";
import { adminProfileApiSlice } from "./api/admin/adminProfileApiSlice";
import { adminAcademyCategoryApiSlice } from "./api/admin/adminAcademyCategoryApiSlice";
import { adminStreamScheduleApiSlice } from "./api/admin/adminStreamScheduleApiSlice";
import { adminRecordingApiSlice } from "./api/admin/adminRecordingApiSlice";
import { adminTradeAnalysisApiSlice } from "./api/admin/adminTradeAnalysisApiSlice";
import { adminLanguagesApiSlice } from "./api/admin/adminLanguagesApiSlice";
import { adminCoursesTypesApiSlice } from "./api/admin/adminCoursesTypesApiSlice";
import { adminPackageApiSlice } from "./api/admin/adminPackageApiSlice";
import { superAdminApiSlice } from "./api/admin/superAdminApiSlice";
import { adminTaskManagementApiSlice } from "./api/admin/adminTaskManagementApiSlice";
import { ratingApiSlice } from "./api/admin/adminRatingApiSlice";
import { adminCryptoAnalysisApiSlice } from "./api/admin/adminCryptoAnalysisApiSlice";


// ============================================================================
// EDUCATOR API SLICES - Only educator-related API endpoints
// ============================================================================
import { educatorTradeIdeasApiSlice } from "./api/educator/educatorTradeIdeasApiSlice";
import { educatorAcademyCategoryApiSlice } from "./api/educator/educatorAcademyCategoryApiSlice";
import { educatorIqCryptoApiSlice } from "./api/educator/educatorIqCryptoApiSlice";
import { educatorTradeAnalysisApiSlice } from "./api/educator/educatorTradeAnalysisApiSlice";
import { educatorRatingApiSlice } from "./api/educator/educatorRatingApiSlice";
import { educatorLanguageApiSlice } from "./api/educator/educatorLanguageApiSlice";
import { educatorLiveStreamApiSlice } from "./api/educator/educatorLiveStreamApiSlice";
import { educatorStreamScheduleApiSlice } from "./api/educator/educatorStreamScheduleApiSlice";
import { educatorProfileApiSlice } from "./api/educator/educatorProfileApiSlice";
import { educatorClientApiSlice } from "./api/educator/educatorClientApiSlice";
import { educatorRecordingApiSlice } from "./api/educator/educatorRecordingApiSlice";


// ============================================================================
// REDUX PERSIST CONFIGURATION
// ============================================================================

/**
 * Language Persist Configuration
 * Persists selected language and available languages to localStorage
 */
const languagePersistConfig = {
  key: "language",
  storage,
  whitelist: ["selectedLanguage", "languages"],
};

const persistedLanguageReducer = persistReducer(
  languagePersistConfig,
  studentLanagugeSlice
);

// ============================================================================
// STORE CONFIGURATION
// ============================================================================

/**
 * Redux Store Configuration
 * 
 * Includes:
 * - Auth state management
 * - Course, section, and lecture management
 * - Educator posts management
 * - Language preferences (persisted)
 * - Admin API slices for all admin features
 */
export const store = configureStore({
  reducer: {
    // Core reducers
    auth: authReducer,
    courses: courseReducer,
    sections: sectionReducer,
    lectures: lectureReducer,
    educatorPosts: educatorPostReducer,
    language: persistedLanguageReducer,

    // Admin API reducers
    [adminCoursesTypesApiSlice.reducerPath]: adminCoursesTypesApiSlice.reducer,
    [adminLanguagesApiSlice.reducerPath]: adminLanguagesApiSlice.reducer,
    [adminRecordingApiSlice.reducerPath]: adminRecordingApiSlice.reducer,
    [adminStreamScheduleApiSlice.reducerPath]: adminStreamScheduleApiSlice.reducer,
    [adminEducatorsApiSlice.reducerPath]: adminEducatorsApiSlice.reducer,
    [adminAcademyCategoryApiSlice.reducerPath]: adminAcademyCategoryApiSlice.reducer,
    [adminProfileApiSlice.reducerPath]: adminProfileApiSlice.reducer,
    [adminTradeIdeasApiSlice.reducerPath]: adminTradeIdeasApiSlice.reducer,
    [adminLiveSessionApiSlice.reducerPath]: adminLiveSessionApiSlice.reducer,
    [adminTradeAnalysisApiSlice.reducerPath]: adminTradeAnalysisApiSlice.reducer,
    [adminPackageApiSlice.reducerPath]: adminPackageApiSlice.reducer,
    [superAdminApiSlice.reducerPath]: superAdminApiSlice.reducer,
    [adminTaskManagementApiSlice.reducerPath]: adminTaskManagementApiSlice.reducer,
    [ratingApiSlice.reducerPath]: ratingApiSlice.reducer,
    [adminCryptoAnalysisApiSlice.reducerPath]: adminCryptoAnalysisApiSlice.reducer,
    [educatorTradeIdeasApiSlice.reducerPath]: educatorTradeIdeasApiSlice.reducer,
    [educatorAcademyCategoryApiSlice.reducerPath]: educatorAcademyCategoryApiSlice.reducer,
    [educatorIqCryptoApiSlice.reducerPath]: educatorIqCryptoApiSlice.reducer,
    [educatorTradeAnalysisApiSlice.reducerPath]: educatorTradeAnalysisApiSlice.reducer,
    [educatorRecordingApiSlice.reducerPath]: educatorRecordingApiSlice.reducer,
    [educatorRatingApiSlice.reducerPath]: educatorRatingApiSlice.reducer,
    [educatorLanguageApiSlice.reducerPath]: educatorLanguageApiSlice.reducer,
    [educatorLiveStreamApiSlice.reducerPath]: educatorLiveStreamApiSlice.reducer,
    [educatorStreamScheduleApiSlice.reducerPath]: educatorStreamScheduleApiSlice.reducer,
    [educatorProfileApiSlice.reducerPath]: educatorProfileApiSlice.reducer,
    [educatorClientApiSlice.reducerPath]: educatorClientApiSlice.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore redux-persist actions
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(
      // Admin API middlewares
      adminCoursesTypesApiSlice.middleware,
      adminLanguagesApiSlice.middleware,
      adminRecordingApiSlice.middleware,
      adminStreamScheduleApiSlice.middleware,
      adminTradeIdeasApiSlice.middleware,
      adminLiveSessionApiSlice.middleware,
      adminEducatorsApiSlice.middleware,
      adminProfileApiSlice.middleware,
      adminAcademyCategoryApiSlice.middleware,
      adminTradeAnalysisApiSlice.middleware,
      adminPackageApiSlice.middleware,
      superAdminApiSlice.middleware,
      adminTaskManagementApiSlice.middleware,
      ratingApiSlice.middleware,
      adminCryptoAnalysisApiSlice.middleware,
      educatorTradeIdeasApiSlice.middleware,
      educatorAcademyCategoryApiSlice.middleware,
      educatorIqCryptoApiSlice.middleware,
      educatorTradeAnalysisApiSlice.middleware,
      educatorRecordingApiSlice.middleware,
      educatorRatingApiSlice.middleware,
      educatorLanguageApiSlice.middleware,
      educatorLiveStreamApiSlice.middleware,
      educatorStreamScheduleApiSlice.middleware,
      educatorProfileApiSlice.middleware,
      educatorClientApiSlice.middleware,
    ),
});

// ============================================================================
// PERSISTOR EXPORT
// ============================================================================

/**
 * Redux Persistor
 * Handles persistence of Redux state to localStorage
 */
export const persistor = persistStore(store);



