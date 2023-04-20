import { configureStore, combineReducers } from '@reduxjs/toolkit';
// import storageSession from 'redux-persist/lib/storage/session';
// import storageSession from 'reduxjs-toolkit-persist/lib/storage/session';
import appReducer from './appSlice';
import applicationReducer from './applicationSlice';
import applicantCoApplicantsReducer from './applicantCoApplicantsSlice';
import directorsReducer from './directorsSlice';
import storageSession from 'redux-persist/lib/storage/session';
// import { appSlice } from './appSlice';
// import { applicantSlice } from './applicationSlice';
// import { applicantCoApplicantsSlice } from './applicantCoApplicantsSlice';
import {
	persistReducer,
	persistStore,
	FLUSH,
	REHYDRATE,
	PAUSE,
	PERSIST,
	PURGE,
	REGISTER,
} from 'redux-persist';
// import storage from 'redux-persist/lib/storage';

const persistConfig = {
	key: 'root',
	// storage, // do not use localStorage
	storage: storageSession,
};

export const rootReducers = combineReducers({
	app: appReducer,
	application: applicationReducer,
	applicantCoApplicants: applicantCoApplicantsReducer,
	directors: directorsReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducers);

export const store = configureStore({
	reducer: persistedReducer,
	middleware: getDefaultMiddleware =>
		getDefaultMiddleware({
			serializableCheck: {
				ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
			},
		}),
});

export const persistor = persistStore(store);

export default store;
