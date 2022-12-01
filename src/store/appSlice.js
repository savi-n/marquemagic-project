import { createSlice } from '@reduxjs/toolkit';
import { encryptBase64 } from 'utils/encrypt';
import _ from 'lodash';

/*
	whiteLabelName: whitelabelname is used to get permissions and site configuration
	permission: based on [whitelabelname] what configuration is recived that will be stored here
	userDetails: in case of edit journey when RM/CM/User/Corporate user directly gets redirected to product page we'll fetch user details and we'll store here
	userToken: during application creation / update journey we create user/update and generate token to identify user, this token will be sotre here
	bankToken: for sails experiment api's we generate bank token that will be stored here
	productList: all product configure for [whiteLabelName] will be stored here
*/

/*
	selectedProduct: once use select one product / click on Apply Now CTA we'll store selected product object here
		id: when product get selected in home page uniq id will be assign here for future refrance
		idBase64: same product id will be converted in to base64 and will be stored here for future use
	selectedSectionId: current selected section id
	completedSections: once section form is successfully submited that section id will be added to this array before moving to next section
	formData: store final submited value of each section
*/

const initialState = {
	whiteLabelName: window.location.hostname.includes('localhost')
		? process.env.REACT_APP_QA_WHITELABEL_NAME
		: window.location.hostname,
	isLocalhost: window.location.hostname.includes('localhost'),
	loginCreateUserRes: null,
	whiteLabelId: '',
	permission: {},
	userDetails: {},
	isCorporate: false, // TODO: dynamically update flag based on corporate user
	userToken: '',
	clientToken: '',
	bankToken: '',
	productList: [],

	selectedProduct: {
		idBase64: '',
		applicationNo: '',
		isSelectedProductTypeBusiness: '',
		isSelectedProductTypeSalaried: '',
	},
	selectedApplicant: '',
	selectedSectionId: '',
	selectedSection: {},
	firstSectionId: '',
	prevSectionId: '',
	nextSectionId: '',
	applicantCoApplicantSectionIds: [],
	completedSections: [],
	formData: {},
	editLoanData: null,
	isCreateLoan: true,
	isUpdateMode: false,
	isEditOrViewLoan: false,
	isViewLoan: false,
	isEditLoan: false,
	// isTestMode: true,
	isTestMode: false,
};

export const appSlice = createSlice({
	name: 'app',
	initialState,
	reducers: {
		reInitializeAppSlice: () => _.cloneDeep(initialState),
		setLoginCreateUserRes: (state, action) => {
			state.loginCreateUserRes = action.payload;
			state.userToken = action.payload.token;
		},
		setWhiteLabelId: (state, action) => {
			state.whiteLabelId = action.payload;
		},
		setPermission: (state, action) => {
			// Redux Toolkit allows us to write "mutating" logic in reducers. It
			// doesn't actually mutate the state because it uses the Immer library,
			// which detects changes to a "draft state" and produces a brand new
			// immutable state based off those changes
			state.permission = action.payload;
		},
		setUserDetails: (state, action) => {
			state.userDetails = action.payload;
		},
		setUserToken: (state, action) => {
			state.userToken = action.payload;
		},
		setClientToken: (state, action) => {
			state.clientToken = action.payload;
		},
		setBankToken: (state, action) => {
			state.bankToken = action.payload;
		},
		setProductList: (state, action) => {
			state.productList = action.payload;
		},
		setSelectedProduct: (state, action) => {
			state.selectedProduct = {
				...action.payload,
				idBase64: encryptBase64(action.payload.id),
				isSelectedProductTypeBusiness: action.payload.loan_req_type === 1,
				isSelectedProductTypeSalaried: action.payload.loan_req_type === 2,
			};
			const newApplicantCoApplicantSectionIds = [];
			let newFirstSectionId = '';
			action.payload.product_details.sections.map((section, sectionIndex) => {
				if (sectionIndex === 0) newFirstSectionId = section.id;
				if (section.is_applicant)
					newApplicantCoApplicantSectionIds.push(section.id);
				return null;
			});
			state.firstSectionId = newFirstSectionId;
			state.applicantCoApplicantSectionIds = newApplicantCoApplicantSectionIds;
		},
		setSelectedSectionId: (state, action) => {
			state.selectedSectionId = action.payload;
			const selectedIndex = state?.selectedProduct?.product_details?.sections?.findIndex(
				section => section?.id === action.payload
			);
			const newSelectedSection =
				state?.selectedProduct?.product_details?.sections[selectedIndex] || {};
			const newPrevSectionId =
				state?.selectedProduct?.product_details?.sections?.[selectedIndex - 1]
					?.id || '';
			const newNextSectionId =
				state?.selectedProduct?.product_details?.sections?.[selectedIndex + 1]
					?.id || '';
			state.selectedSection = newSelectedSection;
			state.prevSectionId = newPrevSectionId;
			state.nextSectionId = newNextSectionId;
			// Test Mode
			// state.prevSectionId = newPrevSectionId;
			// state.nextSectionId =
			// 	action.payload === 'basic_details'
			// 		? 'document_upload'
			// 		: 'application_submitted';
			// -- Test Mode
		},
		setCompletedSections: (state, action) => {
			state.completedSections = action.payload;
		},
		addCompletedSection: (state, action) => {
			state.completedSections = [...state.completedSections, action.payload];
		},
		setFormData: (state, action) => {
			state.formData = action.payload;
		},
		addFormData: (state, action) => {
			// console.log('productSlice-addFormData-', { state, action });
			const newFormData = _.cloneDeep(state.formData);
			state.formData = {
				...newFormData,
				[action.payload.key]: [action.payload.value], // pass section id and form value for submission
			};
		},
		setEditLoanData: (state, action) => {
			const { isUpdateMode, editLoanData } = action.payload;
			state.editLoanData = editLoanData;
			if (isUpdateMode) {
				state.isUpdateMode = true;
			} else {
				state.isEditOrViewLoan = !!editLoanData;
				state.isViewLoan = !editLoanData ? false : !editLoanData?.isEditLoan;
				state.isEditLoan = !editLoanData ? false : editLoanData?.isEditLoan;
				state.isCreateLoan = false;
			}
		},

		toggleTestMode: (state, action) => {
			state.isTestMode = !state.isTestMode;
		},
		setIsTestMode: (state, action) => {
			state.isTestMode = action.payload;
		},
	},
});

// Action creators are generated for each case reducer function
export const {
	reInitializeAppSlice,

	setLoginCreateUserRes,
	setWhiteLabelId,
	setPermission,
	setUserDetails,
	setUserToken,
	setClientToken,
	setBankToken,
	setProductList,

	setSelectedProduct,
	setSelectedSectionId,
	setCompletedSections,
	addCompletedSection,
	setFormData,
	addFormData,

	setEditLoanData,

	toggleTestMode,
	setIsTestMode,
} = appSlice.actions;

export default appSlice.reducer;

// The function below is called a thunk and allows us to perform async logic. It
// can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
// will call the thunk with the `dispatch` function as the first argument. Async
// code can then be executed and other actions can be dispatched

// export const incrementAsync = amount => dispatch => {
// 	setTimeout(() => {
// 		dispatch(incrementByAmount(amount));
// 	}, 1000);
// };

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state) => state.counter.value)`
export const selectCount = state => state.counter.value;
