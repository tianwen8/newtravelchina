import { configureStore } from '@reduxjs/toolkit';
import languageReducer from './slices/languageSlice';
import visaReducer from './slices/visaSlice';

export const store = configureStore({
  reducer: {
    language: languageReducer,
    visa: visaReducer
  }
});

// 从 store 本身推断 `RootState` 和 `AppDispatch` 类型
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 