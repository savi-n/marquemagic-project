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
	defaultLoader: '',
	loginCreateUserRes: null,
	whiteLabelId: '',
	isGeoTaggingEnabled: false,
	permission: {},
	userDetails: {},
	isCorporate: false, // TODO: dynamically update flag based on corporate user
	userToken: '',
	clientToken: '',
	bankToken: '',
	productList: [],
	bankList: [],
	ifscList: [],

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
	businessSectionIds: ['one', 'two'],
	completedSections: [],
	formData: {},
	editLoanData: null,
	isCreateLoan: true,
	isUpdateMode: false,
	isEditOrViewLoan: false,
	isViewLoan: false,
	isEditLoan: false,
	isDraftLoan: false,
	editLoanDirectors: [],
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
			// if ui-ux token doesnt exist set it to borrower token
			if (!state.userToken) {
				state.userToken = action.payload.token;
			}
		},
		setWhiteLabelId: (state, action) => {
			state.whiteLabelId = action.payload;
		},
		setGeoTagging: (state, action) => {
			state.isGeoTaggingEnabled = action.payload;
		},
		setPermission: (state, action) => {
			// Redux Toolkit allows us to write "mutating" logic in reducers. It
			// doesn't actually mutate the state because it uses the Immer library,
			// which detects changes to a "draft state" and produces a brand new
			// immutable state based off those changes
			state.permission = action.payload;
			state.isGeoTaggingEnabled = action.payload?.geo_tagging?.geo_tagging;
			// state.isGeoTaggingEnabled = false;
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
			const sectionObj = {
				id: 'new-test',
				is_applicant: true,
				name: 'Business Details',
				sub_sections: [
					{
						id: 'basic_details',
						name: 'Help us with Basic Details',
						fields: [
							{
								name: 'existing_customer',
								placeholder: 'Existing Customer',
								db_key: 'existing_customer',
								rules: {
									required: true,
								},
								type: 'select',
								visibility: true,
								options: [
									{
										value: 'Yes',
										name: 'Yes',
									},
									{
										value: 'No',
										name: 'No',
									},
								],
							},
							{
								name: 'custID_num',
								placeholder: 'Customer ID Number',
								is_co_applicant: false,
								db_key: 'custID_num',
								pre_data_disable: false,
								rules: {
									required: true,
									length: 10,
								},
								is_masked: false,
								user_types_allowed: "['Technical','RCU']",

								type: 'text',
								protected: true,
								visibility: true,
							},
							{
								name: 'pan_number',
								placeholder: 'PAN Number',
								is_co_applicant: false,
								db_key: 'businesspancardnumber',
								pre_data_disable: false,
								rules: {
									required: true,
									length: 10,
									pan_number: true,
								},
								is_masked: true,
								user_types_allowed: "['Technical','RCU']",
								mask: {
									mask_values: {
										mask_pattern: '*',
										characters_not_to_be_masked: {
											from_starting: 1,
											from_ending: 1,
										},
									},
									character_limit: 10,
									alpha_numeric_only: true,
								},
								type: 'text',
								protected: true,
								visibility: true,
							},
							{
								name: 'pan_upload',
								is_applicant: false,
								label: 'Upload your PAN Card',
								type: 'file',
								db_key: 'loan_document',
								req_type: 'pan',
								value: 'pan',
								process_type: 'extraction',
								min: 1,
								max: 1,
								rules: {
									supported_formats: ['*'],
								},
								doc_type: {
									'0': 31,
									'1': 8,
									'7': 31,
								},
							},
							{
								name: 'pan_number',
								placeholder: 'PAN Number',
								is_applicant: false,
								db_key: 'dpancard',
								pre_data_disable: false,
								rules: {
									length: 10,
									pan_number: true,
									required: false,
								},
								is_masked: true,
								user_types_allowed: "['Technical','RCU']",
								mask: {
									mask_values: {
										mask_pattern: '*',
										characters_not_to_be_masked: {
											from_starting: 1,
											from_ending: 1,
										},
									},
									character_limit: 10,
									alpha_numeric_only: true,
								},
								protected: false,
								type: 'text',
								visibility: true,
							},
							{
								name: 'income_type',
								is_co_applicant: false,
								placeholder: 'Income/Customer Type',
								db_key: 'businesstype',
								rules: {
									required: true,
								},
								type: 'select',
								visibility: true,
								options: [
									{
										value: '7',
										name: 'Salaried',
									},
									{
										value: '1',
										name: 'Business',
									},
								],
								value: '7',
							},
							{
								name: 'income_type',
								is_applicant: false,
								placeholder: 'Income/Customer Type',
								db_key: 'businesstype',
								rules: {
									required: true,
								},
								type: 'select',
								visibility: true,
								options: [
									{
										value: '7',
										name: 'Salaried',
									},
									{
										value: '1',
										name: 'Business',
									},
									{
										value: '0',
										name: 'No Income',
									},
								],
							},
							{
								name: 'first_name',
								placeholder: 'First Name',
								db_key: 'first_name',
								rules: {
									required: true,
								},
								mask: {
									alpha_char_only: true,
								},
								type: 'text',
								pre_data_disable: false,
								protected: false,
								visibility: true,
								default_value: '',
							},
							{
								name: 'last_name',
								placeholder: 'Last Name',
								db_key: 'last_name',
								rules: {},
								mask: {
									alpha_char_only: true,
								},
								pre_data_disable: false,
								type: 'text',
								protected: false,
								visibility: true,
								default_value: '',
							},
							{
								name: 'dob',
								placeholder: 'Date of Birth (dd-mm-yyyy)',
								db_key: 'ddob',
								rules: {
									required: true,
									past_dates: true,
								},
								type: 'date',
								pre_data_disable: false,
								protected: false,
								visibility: true,
							},
							{
								name: 'gender',
								placeholder: 'Gender',
								type: 'select',
								rules: {
									required: true,
								},
								db_key: 'gender',
								visibility: true,
								options: [
									{
										value: 'Male',
										name: 'Male',
									},
									{
										value: 'Female',
										name: 'Female',
									},
									{
										value: 'Third Gender',
										name: 'Third Gender',
									},
								],
							},
							{
								name: 'email',
								placeholder: 'Email ID',
								rules: {
									empty_or_email: true,
								},
								db_key: 'business_email',
								type: 'text',
								is_masked: true,
								user_types_allowed: "['Legal','Technical','RCU']",
								mask: {
									mask_values: {
										mask_pattern: '*',
										characters_not_to_be_masked: {
											from_starting: 1,
											from_ending: 1,
										},
									},
								},
								visibility: true,
							},
							{
								name: 'mobile_no',
								is_co_applicant: false,
								placeholder: 'Enter a Valid Mobile Number to Recieve OTP',
								db_key: 'contactno',
								rules: {
									required: true,
									length: 10,
								},
								is_masked: true,
								user_types_allowed: "['Legal','Technical','RCU']",
								mask: {
									mask_values: {
										mask_pattern: '*',
										characters_not_to_be_masked: {
											from_starting: 1,
											from_ending: 1,
										},
									},
									number_only: true,
									character_limit: 10,
								},
								type: 'text',
								visibility: true,
							},
							{
								name: 'mobile_no',
								is_applicant: false,
								placeholder: 'Enter a Valid Mobile Number',
								db_key: 'contactno',
								rules: {
									required: true,
									length: 10,
								},
								is_masked: true,
								user_types_allowed: "['Legal','Technical','RCU']",
								mask: {
									mask_values: {
										mask_pattern: '*',
										characters_not_to_be_masked: {
											from_starting: 1,
											from_ending: 1,
										},
									},
									number_only: true,
									character_limit: 10,
								},
								type: 'text',
								visibility: true,
							},
							{
								name: 'marital_status',
								placeholder: 'Marital Status',
								db_key: 'marital_status',
								rules: {},
								type: 'select',
								visibility: true,
								options: [
									{
										value: 'Married',
										name: 'Married',
									},
									{
										value: 'Single',
										name: 'Single',
									},
									{
										value: 'Divorced',
										name: 'Divorced',
									},
								],
							},
							{
								name: 'spouse_name',
								placeholder: 'Spouse Name',
								db_key: 'spouse_name',
								rules: {},
								mask: {
									alpha_char_only: true,
								},
								type: 'text',
								pre_data_disable: false,
								protected: false,
								visibility: true,
								default_value: '',
							},
							{
								name: 'residence_status',
								placeholder: 'Residence Status',
								db_key: 'residence_status',
								type: 'select',
								visibility: true,
								options: [
									{
										name: 'Resident',
										value: 'Resident',
									},
									{
										name: 'Resident and Ordinarily Resident',
										value: 'Resident and Ordinarily Resident',
									},
									{
										name: 'Resident but Not Ordinarily Resident',
										value: 'Resident but Not Ordinarily Resident',
									},
									{
										name: 'Non-Resident',
										value: 'Non-Resident',
									},
								],
							},
							{
								name: 'country_residence',
								placeholder: 'Country of Residence',
								db_key: 'country_residence',
								type: 'select',
								visibility: true,
								options: [
									{
										name: 'India',
										value: 'India',
									},
									{
										name: 'Other',
										value: 'Other',
									},
								],
							},
							{
								name: 'father_name',
								placeholder: "Father's Name",
								db_key: 'father_name',
								rules: {
									required: true,
								},
								mask: {
									alpha_char_only: true,
								},
								type: 'text',
								pre_data_disable: false,
								protected: false,
								visibility: true,
								default_value: '',
							},
							{
								name: 'mother_name',
								placeholder: "Mother's Name",
								db_key: 'mother_name',
								rules: {
									required: true,
								},
								mask: {
									alpha_char_only: true,
								},
								type: 'text',
								pre_data_disable: false,
								protected: false,
								visibility: true,
								default_value: '',
							},
							{
								name: 'relationship_with_applicant',
								is_applicant: false,
								placeholder: 'Relationship with Applicant',
								db_key: 'applicant_relationship',
								rules: {
									required: true,
								},
								type: 'select',
								visibility: true,
								options: [
									{
										value: 'Spouse',
										name: 'Spouse',
									},
									{
										value: 'Father',
										name: 'Father',
									},
									{
										value: 'Mother',
										name: 'Mother',
									},
									{
										value: 'Son',
										name: 'Son',
									},
									{
										value: 'Daughter',
										name: 'Daughter',
									},
									{
										value: 'Brother',
										name: 'Brother',
									},
									{
										value: 'Sister',
										name: 'Sister',
									},
									{
										value: 'Business Partner',
										name: 'Business Partner',
									},
								],
							},
							{
								name: 'upi_id',
								placeholder: 'UPI ID',
								db_key: 'upi_id',
								type: 'text',
								rules: {
									required: true,
								},
								is_masked: true,
								user_types_allowed: "['Legal','Technical','RCU']",
								mask: {
									alpha_numberic_only: true,
									character_limit: 30,
								},
								visibility: true,
							},
						],
					},
				],
			};
			const sectionObj2 = {
				id: 'business_address_details',
				name: 'Business Address Details',
				is_applicant: true,
				sub_sections: [
					{
						id: 'permanent_address_details',
						name: 'Business Address Details',
						aid: '2',
						prefix: 'permanent_',
						fields: [
							{
								name: 'gst_num_selected',
								placeholder: 'Select GST Number',
								db_key: 'gst_num_selected',
								rules: {
									required: true,
								},
								type: 'select',
								visibility: true,
								options: [
									{
										value: 'GST00012A',
										name: 'GST00012A',
									},
									{
										value: 'GST00012B',
										name: 'GST00012B',
									},
									{
										value: 'GST00012C',
										name: 'GST00012AC',
									},
									{
										value: 'GST00012D',
										name: 'GST00012BD',
									},
								],
							},
							{
								name: 'permanent_address1',
								placeholder: 'Address Line 1',
								db_key: 'line1',
								rules: {
									required: true,
								},
								type: 'text',
								visibility: true,
							},

							{
								name: 'permanent_address2',
								placeholder: 'Address Line 2',
								db_key: 'line2',
								type: 'text',
								visibility: true,
							},
							{
								name: 'permanent_address3',
								placeholder: 'Address Line 3',
								db_key: 'line3',
								type: 'text',
								visibility: true,
							},
							// {
							// 	name: 'permanent_address3',
							// 	placeholder: 'Landmark',
							// 	db_key: 'locality',
							// 	rules: {
							// 		required: true,
							// 	},
							// 	type: 'text',
							// 	visibility: true,
							// },
							{
								name: 'permanent_pin_code',
								placeholder: 'Pin Code',
								db_key: 'pincode',
								rules: {
									required: true,
									length: 6,
								},
								mask: {
									number_only: true,
									character_limit: 6,
								},
								make_api_call: 6,
								type: 'pincode',
								value_for_fields: [['city', 'district'], ['state', 'state']],
								visibility: true,
							},
							{
								name: 'permanent_city',
								placeholder: 'City',
								db_key: 'city',
								rules: {
									required: true,
								},
								mask: {
									alpha_char_only: true,
								},
								type: 'text',
								visibility: true,
							},
							{
								name: 'permanent_state',
								placeholder: 'State',
								db_key: 'state',
								rules: {
									required: true,
								},
								mask: {
									alpha_char_only: true,
								},
								type: 'text',
								visibility: true,
							},
						],
					},
				],
			};
			state?.selectedProduct?.product_details?.sections?.unshift(sectionObj2);
			state?.selectedProduct?.product_details?.sections?.unshift(sectionObj);
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
				const newEditLoanDirectorIds = [];
				editLoanData?.director_details?.map(d =>
					newEditLoanDirectorIds.push(`${d?.id}`)
				);
				state.isEditOrViewLoan = !!editLoanData;
				state.isViewLoan = !editLoanData ? false : !editLoanData?.isEditLoan;
				state.isEditLoan = !editLoanData ? false : editLoanData?.isEditLoan;
				if (!!editLoanData) {
					// isEditOrViewLoan
					state.isDraftLoan =
						editLoanData?.loan_status_id === 1 &&
						editLoanData?.loan_sub_status_id === 1;
				}
				state.isCreateLoan = false;
				state.editLoanDirectors = newEditLoanDirectorIds;
			}
		},

		toggleTestMode: (state, action) => {
			state.isTestMode = !state.isTestMode;
		},
		setIsTestMode: (state, action) => {
			state.isTestMode = action.payload;
		},

		setBankList: (state, action) => {
			state.bankList = action.payload;
		},
		setIfscList: (state, action) => {
			state.ifscList = action.payload;
		},
		setDefaultLoader: (state, action) => {
			state.defaultLoader = action.payload;
		},
		setBusinessSectionIds: (state, action) => {
			state.businessSectionIds = action.payload;
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
	setGeoTagging,

	setSelectedProduct,
	setSelectedSectionId,
	setCompletedSections,
	addCompletedSection,
	setFormData,
	addFormData,

	setEditLoanData,
	setBusinessSectionIds,
	toggleTestMode,
	setIsTestMode,
	setBankList,
	setIfscList,

	setDefaultLoader,
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
