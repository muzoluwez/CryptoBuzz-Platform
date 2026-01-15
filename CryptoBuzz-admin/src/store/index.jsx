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
import { adminHotmartApiSlice } from "./api/admin/adminHotmartApiSlice";
import { adminPlanApiSlice } from "./api/admin/adminPlanApiSlice";
import { adminPurchaseApiSlice } from "./api/admin/adminPurchaseApiSlice";

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
    [adminHotmartApiSlice.reducerPath]: adminHotmartApiSlice.reducer,
    [adminPlanApiSlice.reducerPath]: adminPlanApiSlice.reducer,
    [adminPurchaseApiSlice.reducerPath]: adminPurchaseApiSlice.reducer,
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
      adminHotmartApiSlice.middleware,
      adminPlanApiSlice.middleware,
      adminPurchaseApiSlice.middleware
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



