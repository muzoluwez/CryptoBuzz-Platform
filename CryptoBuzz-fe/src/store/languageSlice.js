import { createSlice } from '@reduxjs/toolkit';

// Default language (English)
const DEFAULT_LANGUAGE = {
    _id: 'default',
    name: 'English',
};

// Get saved language object from localStorage
const getSavedLanguage = () => {
    try {
        const saved = localStorage?.getItem?.('app_language');
        if (saved) {
            const parsed = JSON?.parse?.(saved);
            return parsed || null;
        }
        return null;
    } catch {
        return null;
    }
};

// Save language object to localStorage
const saveLanguageToStorage = (lang) => {
    try {
        if (lang) {
            const stringified = JSON?.stringify?.(lang);
            if (stringified) {
                localStorage?.setItem?.('app_language', stringified);
            }
        }
    } catch (e) {
        console?.error?.('Failed to save language to localStorage:', e);
    }
};

const initialState = {
    languages: [], // Languages from backend
    selectedLanguage: getSavedLanguage() || DEFAULT_LANGUAGE,
    isLoading: false,
    error: null,
};

const languageSlice = createSlice({
    name: 'language',
    initialState,
    reducers: {
        setLanguages: (state, action) => {
            const backendLanguages = action?.payload || []
            // Store languages as-is from backend
            state.languages = backendLanguages?.map((lang) => ({
                _id: lang?._id,
                name: lang?.name,
            })) || [];

            // If no languages from backend, use default
            if (state?.languages?.length === 0) {
                state.languages = [DEFAULT_LANGUAGE];
            }

            // Check if saved language exists in the fetched languages
            const savedLang = getSavedLanguage();
            if (savedLang) {
                const foundLang = state?.languages?.find(
                    (l) => l?._id === savedLang?._id
                );
                if (foundLang) {
                    state.selectedLanguage = foundLang;
                } else {
                    // Saved language not found in list, use first available
                    state.selectedLanguage = state?.languages?.[0] || DEFAULT_LANGUAGE;
                    saveLanguageToStorage(state.selectedLanguage);
                }
            } else {
                // No saved language, use first available
                state.selectedLanguage = state?.languages?.[0] || DEFAULT_LANGUAGE;
                saveLanguageToStorage(state.selectedLanguage);
            }
        },

        setSelectedLanguage: (state, action) => {
            const langId = action?.payload;
            const lang = state?.languages?.find(
                (l) => l?._id === langId || l?.name === langId
            );

            if (lang) {
                state.selectedLanguage = lang;
                // Save full language object to localStorage
                saveLanguageToStorage(lang);
            }
        },

        setLoading: (state, action) => {
            state.isLoading = action?.payload;
        },

        setError: (state, action) => {
            state.error = action?.payload;
        },
    },
});

export const { setLanguages, setSelectedLanguage, setLoading, setError } =
    languageSlice.actions;

// Selectors
export const selectLanguages = (state) => state?.language?.languages;
export const selectSelectedLanguage = (state) => state?.language?.selectedLanguage;
export const selectLanguageLoading = (state) => state?.language?.isLoading;
export const selectLanguageError = (state) => state?.language?.error;

export default languageSlice.reducer;
