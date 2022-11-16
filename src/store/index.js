import { configureStore } from '@reduxjs/toolkit';
import applicantCoApplicantsReducer from './applicantCoApplicantsSlice';
import applicationReducer from './applicationSlice';
import appReducer from './appSlice';

const store = configureStore({
	reducer: {
		app: appReducer,
		applicantCoApplicants: applicantCoApplicantsReducer,
		application: applicationReducer,
	},
});

export default store;
