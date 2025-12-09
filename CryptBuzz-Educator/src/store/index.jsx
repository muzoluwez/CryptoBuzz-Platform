import { configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage"; // localStorage

// Reducers
import authReducer from "./reducer/authSlice";
import courseReducer from "./reducer/courseSlice";
import sectionReducer from "./reducer/sectionSlice";
import lectureReducer from "./reducer/lectureSlice";
import educatorPostReducer from "./reducer/postSlice";
import studentLanagugeSlice from "./reducer/studentLanagugeSlice";

// Educator API Slices
import { educatorAcademyCategoryApiSlice } from "./api/educator/educatorAcademyCategoryApiSlice";
import { educatorLiveStreamApiSlice } from "./api/educator/educatorLiveStreamApiSlice";
import { educatorStreamScheduleApiSlice } from "./api/educator/educatorStreamScheduleApiSlice";
import { educatorRecordingApiSlice } from "./api/educator/educatorRecordingApiSlice";
import { educatorProfileApiSlice } from "./api/educator/educatorProfileApiSlice";
import { educatorTradeIdeasApiSlice } from "./api/educator/educatorTradeIdeasApiSlice";
import { educatorTradeAnalysisApiSlice } from "./api/educator/educatorTradeAnalysisApiSlice";
import { educatorRatingApiSlice } from "./api/educator/educatorRatingApiSlice";
import { educatorCoursesApiSlice } from "./api/educator/educatorCoursesApiSlice";

/**
 * Language persistence configuration
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

/**
 * Redux Store Configuration
 * Educator-only store with RTK Query API slices for data fetching
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

    // Educator API slices
    [educatorAcademyCategoryApiSlice.reducerPath]:
      educatorAcademyCategoryApiSlice.reducer,
    [educatorLiveStreamApiSlice.reducerPath]:
      educatorLiveStreamApiSlice.reducer,
    [educatorStreamScheduleApiSlice.reducerPath]:
      educatorStreamScheduleApiSlice.reducer,
    [educatorRecordingApiSlice.reducerPath]: educatorRecordingApiSlice.reducer,
    [educatorProfileApiSlice.reducerPath]: educatorProfileApiSlice.reducer,
    [educatorTradeIdeasApiSlice.reducerPath]:
      educatorTradeIdeasApiSlice.reducer,
    [educatorTradeAnalysisApiSlice.reducerPath]:
      educatorTradeAnalysisApiSlice.reducer,
    [educatorRatingApiSlice.reducerPath]: educatorRatingApiSlice.reducer,
    [educatorCoursesApiSlice.reducerPath]: educatorCoursesApiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore redux-persist actions
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }).concat(
      // Educator API middlewares
      educatorAcademyCategoryApiSlice.middleware,
      educatorLiveStreamApiSlice.middleware,
      educatorStreamScheduleApiSlice.middleware,
      educatorRecordingApiSlice.middleware,
      educatorProfileApiSlice.middleware,
      educatorTradeIdeasApiSlice.middleware,
      educatorTradeAnalysisApiSlice.middleware,
      educatorRatingApiSlice.middleware,
      educatorCoursesApiSlice.middleware
    ),
});

export const persistor = persistStore(store);
