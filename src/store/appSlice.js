import { createSlice } from '@reduxjs/toolkit';
import _ from 'lodash';
import { encryptBase64 } from 'utils/encrypt';

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
		productId: when product get selected in home page uniq id will be assign here for future refrance
		idBase64: same product id will be converted in to base64 and will be stored here for future use
	selectedSectionId: current selected section id
	completedSections: once section form is successfully submited that section id will be added to this array before moving to next section
	formData: store final submited value of each section
*/

const initialState = {
	whiteLabelName: window.location.hostname.includes('localhost')
		? process.env.REACT_APP_QA_WHITELABEL_NAME
		: window.location.hostname,
	permission: {},
	userDetails: {},
	userToken: '',
	bankToken: '',
	productList: [],

	selectedProduct: {
		idBase64: '',
		applicationNo: '',
	},
	selectedApplicant: '',
	selectedSectionId: '',
	firstSectionId: '',
	prevSectionId: '',
	nextSectionId: '',
	applicantCoApplicantSectionIds: [],
	completedSections: [],
	formData: {},
	editLoanData: null,
	isEditOrViewLoan: false,
	isViewLoan: false,
	isEditLoan: false,
};

export const appSlice = createSlice({
	name: 'app',
	initialState,
	reducers: {
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
			state.prevSectionId =
				state?.selectedProduct?.product_details?.sections?.[selectedIndex - 1]
					?.id || '';
			state.nextSectionId =
				state?.selectedProduct?.product_details?.sections?.[selectedIndex + 1]
					?.id || '';
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
			state.editLoanData = action.payload;
			state.isEditOrViewLoan = !!action.payload;
			state.isViewLoan = !action.payload ? false : !action.payload?.isEditLoan;
			state.isEditLoan = !action.payload ? false : action.payload?.isEditLoan;
		},
	},
});

// Action creators are generated for each case reducer function
export const {
	setPermission,
	setUserDetails,
	setUserToken,
	setBankToken,
	setProductList,

	setSelectedProduct,
	setSelectedSectionId,
	setCompletedSections,
	addCompletedSection,
	setFormData,
	addFormData,

	setEditLoanData,
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
