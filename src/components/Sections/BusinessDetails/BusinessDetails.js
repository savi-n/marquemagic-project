import React, { Fragment, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import queryString from 'query-string';
import _ from 'lodash';
import PanUpload from './PanUpload';
import useForm from 'hooks/useFormIndividual';
import Button from 'components/Button';
import imgClose from 'assets/icons/close_icon_grey-06.svg';
import { encryptReq } from 'utils/encrypt';
import moment from 'moment';
import Hint from 'components/Hint';
import ConfirmModal from 'components/modals/ConfirmModal';
import { decryptRes } from 'utils/encrypt';
import { verifyUiUxToken } from 'utils/request';
import {
	API_END_POINT,
	// IFSC_LIST_FETCH,
	INDUSTRY_LIST_FETCH,
} from '_config/app.config';
import {
	setIsDraftLoan,
	setLoginCreateUserRes,
	setSelectedSectionId,
} from 'store/appSlice';
import {
	setNewCompletedDirectorSections,
	getDirectors,
	setSmeType,
} from 'store/directorsSlice';
import {
	setLoanIds,
	setCompletedApplicationSection,
	setBusinessType,
	setNewCompletedSections,
	setBusinessMobile,
	setBusinessName,
} from 'store/applicationSlice';
import {
	formatSectionReqBody,
	getApiErrorMessage,
	getSelectedField,
	getAllCompletedSections,
	formatCompanyRocData,
	// isDirectorApplicant
} from 'utils/formatData';
import Loading from 'components/Loading';
import SessionExpired from 'components/modals/SessionExpired';
import { useToasts } from 'components/Toast/ToastProvider';
import { scrollToTopRootElement, getTotalYearsCompleted } from 'utils/helper';
import * as UI_SECTIONS from 'components/Sections/ui';
import * as CONST_SECTIONS from 'components/Sections/const';
import * as API from '_config/app.config';
import * as UI from './ui';
import * as CONST from './const';
import * as CONST_BUSINESS_DETAILS from './const';
import { fetchOptions, clearDependentFields } from 'utils/helperFunctions';
import Modal from 'components/Modal';
import ROCBusinessDetailsModal from 'components/Sections/BusinessDetails/ROCBusinessDetailsModal/ROCBusinessDetailsModal';
import { isInvalidPan } from 'utils/validation';

const BusinessDetails = props => {
	const { app, application } = useSelector(state => state);
	// const { directors, selectedDirectorId } = useSelector(
	// 	state => state.directors
	// );
	// const selectedDirector = directors?.[selectedDirectorId] || {};
	const {
		selectedProduct,
		selectedSectionId,
		nextSectionId,
		selectedSection,
		whiteLabelId,
		clientToken,
		userToken,
		isViewLoan,
		isEditLoan,
		isEditOrViewLoan,
		// isDraftLoan,
		// editLoanDirectors,
		userDetails,
		isTestMode,
		permission,
	} = app;
	const {
		borrowerUserId,
		businessUserId,
		businessId,
		loanId,
		businessType,
		loanRefId,
		dedupePrefilledValues,
	} = application;
	// console.log(
	// 	'🚀 ~ file: BusinessDetails.js:95 ~ BusinessDetails ~ dedupePrefilledValues:',
	// 	dedupePrefilledValues
	// );
	const naviagteToNextSection = () => {
		dispatch(setSelectedSectionId(nextSectionId));
	};
	const dispatch = useDispatch();
	const [sectionData, setSectionData] = useState({});
	const { addToast } = useToasts();
	const [udyogAadhar, setUdyogAadhar] = useState('');
	// eslint-disable-next-line
	const [udyogAadharStatus, setUdyogAadharStatus] = useState('');
	// eslint-disable-next-line
	// const [disableUdyamNumberInput, setdisableUdyamNumberInput] = useState('');

	const [loading, setLoading] = useState(false);
	const [isGstModalOpen, setGstModalOpen] = useState(false);
	const [
		isIncomeTypeConfirmModalOpen,
		setIsIncomeTypeConfirmModalOpen,
	] = useState(false);
	const [gstin, setGstin] = useState([]);
	const gst = gstin?.data?.data || [];
	const [isTokenValid, setIsTokenValid] = useState(true);
	const [cacheDocumentsTemp, setCacheDocumentsTemp] = useState([]);
	const [fetchingSectionData, setFetchingSectionData] = useState(false);
	const [isBusinessModalOpen, setIsBusinessModalOpen] = useState(false);
	const [companyRocData, setCompanyRocData] = useState({});
	const [isPrefilEmail, setisPrefilEmail] = useState(true);
	const [isPrefilMobileNumber, setIsPrefilMobileNumber] = useState(true);
	const [mainComponentOptions, setMainComponentOptions] = useState(null);
	const [subComponentOptions, setSubComponentOptions] = useState([]);
	const [allIndustriesOption, setAllIndustriesOption] = useState([]);
	// const [selectedMainOptionId, setSelectedMainOptionId] = useState('');
	const [isSubIndustryMandatory, setIsSubIndustryMandatory] = useState(true);

	const documentMapping = JSON.parse(permission?.document_mapping) || [];
	const dedupeApiData = documentMapping?.dedupe_api_details || [];
	const selectedDedupeData =
		dedupeApiData && Array.isArray(dedupeApiData)
			? dedupeApiData?.filter(item => {
					return item?.product_id?.includes(selectedProduct?.id);
			  })?.[0] || {}
			: {};

	const {
		handleSubmit,
		register,
		formState,
		onChangeFormStateField,
		clearErrorFormState,
		setErrorFormStateField,
	} = useForm();
	// const isApplicant = isDirectorApplicant(selectedDirector);
	const completedSections = getAllCompletedSections({
		selectedProduct,
		application,
		selectedSectionId,
	});
	const selectedPanUploadField = getSelectedField({
		fieldName: CONST.PAN_UPLOAD_FIELD_NAME,
		selectedSection,
	});

	const businessTypeField = getSelectedField({
		fieldName: CONST.BUSINESS_TYPE_FIELD_NAME,
		selectedSection,
	});
	const selectedIncomeType =
		formState?.values?.[CONST.BUSINESS_TYPE_FIELD_NAME] || {};
	const isPanUploadMandatory = !!selectedPanUploadField?.rules?.required;
	const isPanNumberExist = !!formState?.values?.pan_number;
	const panUploadedFile =
		cacheDocumentsTemp?.filter(
			doc => doc?.field?.name === CONST.PAN_UPLOAD_FIELD_NAME
		)?.[0] || null;
	const tempPanUploadedFile = !!sectionData?.loan_document
		? sectionData?.loan_document?.[0]
		: null;

	// format object to match the desired key_type in payload
	const formatObject = payloadObj => {
		return payloadObj?.map(obj => ({
			name: obj.Name,
			'din/pan': obj.Din,
			income_type: 'business', // default value to be set as Business for all the added directors in the SME Flow (based on the requirement)
		}));
	};
	const onFetchFromCustomerId = async () => {
		// console.log('on-fetch-customer-id');
		try {
			setLoading(true);
			const reqBody = {
				customer_id: formState?.values?.['customer_id'],
				white_label_id: whiteLabelId,
				businesstype: formState?.values?.['business_type'],
				loan_product_id:
					selectedProduct?.product_id?.[formState?.values?.['business_type']],
				loan_product_details_id: selectedProduct?.id || undefined,
				loan_id: loanId,
				busienss_id: businessId,
				isApplicant: true, //implemented based on savitha's changes - bad practice
				loan_product_details_id: selectedProduct?.id,
			};
			const fetchDataRes = await axios.post(
				selectedDedupeData?.verify,
				reqBody
			);
			if (fetchDataRes?.data?.status === 'ok') {
				addToast({
					message: fetchDataRes?.data?.message || 'Data fetched successfull!',
					type: 'success',
				});
				redirectToProductPageInEditMode(fetchDataRes?.data);
			}

			if (fetchDataRes?.data?.status === 'nok') {
				addToast({
					message:
						fetchDataRes?.data?.message ||
						fetchDataRes?.data?.Message ||
						`No Customer Data Found Against The Provide ID.Please Proceed As New Customer.`,
					type: 'error',
				});
			}

			// console.log({ fetchDataRes });
		} catch (err) {
			if (`${err?.response?.status}` === `400`) {
				addToast({
					message:
						err?.response?.data?.message ||
						err?.response?.data?.Message ||
						err?.message ||
						'Bad Request, Request Failed With Status Code 400 ',
					type: 'error',
				});
			} else if (`${err?.response?.status}` === `500`) {
				addToast({
					message:
						err?.response?.data?.message ||
						err?.response?.data?.Message ||
						err?.message ||
						'Gateway Timeout, Request Failed With Status Code 500 ',
					type: 'error',
				});
			} else {
				addToast({
					message:
						err?.response?.data?.message ||
						err?.response?.data?.Message ||
						err?.message ||
						'Something went wrong. Please try again later!',
					type: 'error',
				});
			}
		} finally {
			setLoading(false);
		}
	};

	const redirectToProductPageInEditMode = loanData => {
		if (!loanData?.data?.loan_data?.loan_ref_id) {
			addToast({
				message: 'Something went wrong, try after sometimes',
				type: 'error',
			});
			return;
		}
		// sessionStorage.clear();
		const editLoanRedirectObject = {
			userId: userDetails?.id,
			loan_ref_id: loanData?.data?.loan_data?.loan_ref_id,
			token: userToken,
			edit: true,
			loan_product_details_id: selectedProduct?.id,
		};
		const redirectURL = `/nconboarding/applyloan/product/${btoa(
			selectedProduct?.id
		)}?token=${encryptReq(editLoanRedirectObject)}`;
		// console.log('redirectToProductPageInEditMode-obj-', {
		// 	editLoanRedirectObject,
		// 	redirectURL,
		// 	loanData,
		// 	product,
		// });
		window.open(redirectURL, '_self');
	};
	const onPanEnter = async pan => {
		try {
			const panErrorMessage = isInvalidPan(pan);
			if (panErrorMessage) {
				return addToast({
					message: 'Please enter valid PAN number',
					type: 'error',
				});
			}
			setLoading(true);
			// 1.VERIFY PAN
			const panExtractionApiRes = await axios.post(
				API.VERIFY_KYC,
				{ req_type: 'pan', number: pan, name: 'XXX' },
				{ headers: { Authorization: clientToken } }
			);
			const panExtractionMsg = panExtractionApiRes?.data?.message || '';

			// IF PAN NAME
			if (panExtractionMsg?.upstreamName) {
				// 2.PAN to GST
				onChangeFormStateField({
					name: CONST_BUSINESS_DETAILS.BUSINESS_NAME_FIELD_NAME,
					value: panExtractionMsg?.upstreamName || '',
				});
				onChangeFormStateField({
					name: CONST_BUSINESS_DETAILS.PAN_NUMBER_FIELD_NAME,
					value: pan || '',
				});

				try {
					const gstinResponse = await axios.post(
						API.PAN_TO_GST,
						{ pan: pan },
						{
							headers: {
								authorization: clientToken,
							},
						}
					);
					if (gstinResponse) {
						setGstin(gstinResponse);
					}
				} catch (err) {
					addToast({
						message: 'Error fetching GST data',
						type: 'error',
					});
				}

				// 3. COMPANY SEARCH
				const companyNameSearchRes = await axios.post(API.SEARCH_COMPANY_NAME, {
					search: panExtractionMsg?.upstreamName.trim(),
				});

				const newCompanyList = companyNameSearchRes?.data?.data?.[0] || [];
				if (newCompanyList?.CORPORATE_IDENTIFICATION_NUMBER) {
					try {
						// console.log({ newCompanyList });
						// 4.ROC
						const cinNumberResponse = await axios.post(
							API.ROC_DATA_FETCH,
							{ cin_number: newCompanyList?.CORPORATE_IDENTIFICATION_NUMBER },
							{
								headers: {
									Authorization: clientToken,
								},
							}
						);

						const companyData = cinNumberResponse?.data?.data;
						// companyData.gstin = gstinData;
						const formattedCompanyData = formatCompanyRocData(companyData, pan);
						cinNumberResponse && setCompanyRocData(formattedCompanyData);

						onChangeFormStateField({
							name: CONST_BUSINESS_DETAILS.BUSINESS_VINTAGE_FIELD_NAME,
							value: formattedCompanyData?.BusinessVintage || '',
						});
						onChangeFormStateField({
							name: CONST_BUSINESS_DETAILS.BUSINESS_EMAIL_FIELD,
							value: formattedCompanyData?.Email || '',
						});

						onChangeFormStateField({
							name: CONST_BUSINESS_DETAILS.BUSINESS_TYPE_FIELD_NAME,
							value: formattedCompanyData?.BusinessType || '1' || '',
						});
					} catch (err) {
						addToast({
							message:
								'Unable to fetch the data from ROC. Please continue to fill the details.',
							// || error?.message ||
							// 'ROC search failed, try again',
							type: 'error',
						});
					} finally {
						setLoading(false);
					}
				}

				//END IF PAN NAME
			}
		} catch (err) {
			console.error(err);
			addToast({
				message: 'Something went wrong, please try again with valid PAN number',
				type: 'error',
			});
		} finally {
			setLoading(false);
		}
	};

	// const selectedMainOptionId = allIndustriesOption?.filter(item => {
	// 	return (
	// 		item?.IndustryName === formState?.values?.[CONST.INDUSTRY_TYPE_FIELD_NAME]
	// 	);
	// })?.[0]?.id;
	// console.log(
	// 	'🚀 ~ file: BusinessDetails.js:823 ~ currentId ~ currentId:',
	// 	selectedMainOptionId
	// );

	// console.log({ borrowerUserId, isEditOrViewLoan });
	const onSaveAndProceed = async () => {
		try {
			setLoading(true);
			const isTokenValid = await validateToken();
			if (isTokenValid === false) return;
			// call login craete user api only once while creating the loan
			// TODO: varun do not call this api when RM is creating loan
			if (
				isSubIndustryMandatory &&
				formState.values[CONST.SUB_INDUSTRY_TYPE_FIELD_NAME] === ''
			) {
				addToast({
					message: 'Please Select Any Sub Industry Option And Proceed',
					type: 'error',
				});
				return;
			}

			let newBorrowerUserId = '';
			if (!isEditOrViewLoan && !borrowerUserId) {
				const loginCreateUserReqBody = {
					email: formState?.values?.email || '',
					white_label_id: whiteLabelId,
					source: API.APP_CLIENT,
					name:
						formState?.values?.first_name || formState?.values?.business_name,
					mobileNo: formState?.values?.business_mobile_no,
					addrr1: '',
					addrr2: '',
				};
				if (!!userDetails?.id) {
					loginCreateUserReqBody.user_id = userDetails?.id;
				}
				const newLoginCreateUserRes = await axios.post(
					`${API.LOGIN_CREATEUSER}`,
					loginCreateUserReqBody
				);
				dispatch(setLoginCreateUserRes(newLoginCreateUserRes?.data));
				newBorrowerUserId = newLoginCreateUserRes?.data?.userId;
				// first priority is to set existing user token which is comming from ui-ux
				// create user is for creating users bucket and generating borrower_user_id so that all the document can be stored inside users bucket
				axios.defaults.headers.Authorization = `Bearer ${userToken ||
					newLoginCreateUserRes?.data?.token}`;
			} else {
				axios.defaults.headers.Authorization = `Bearer ${userToken}`;
			}
			const crimeCheck = selectedProduct?.product_details?.crime_check || 'No';

			const selectedLoanProductId =
				selectedProduct?.product_id?.[selectedIncomeType] || '';

			const buissnessDetailsReqBody = formatSectionReqBody({
				section: selectedSection,
				values: {
					...formState.values,
				},
				app,
				// selectedDirector,
				application,
				selectedLoanProductId,
			});

			buissnessDetailsReqBody.borrower_user_id =
				newBorrowerUserId || businessUserId || borrowerUserId;

			delete buissnessDetailsReqBody.data.business_details.loan_document;
			buissnessDetailsReqBody.data.business_details.crime_check = crimeCheck;

			// changes for gst selection starts
			// TODO:Bikash - modify gst component such that it should have the all the gst's as value.
			if (!completedSections?.includes(selectedSectionId)) {
				const firstActiveGst = gstin?.data?.data?.filter(
					gstObj => gstObj?.status !== 'Inactive'
				)?.[0]?.gstin;

				buissnessDetailsReqBody.data.business_details.gstin = firstActiveGst;
			}

			if (completedSections?.includes(selectedSectionId)) {
				delete buissnessDetailsReqBody.data.business_details.gstin;
			}
			// changes for gst selection ends

			if (!!companyRocData && Object.values(companyRocData)?.length > 0)
				buissnessDetailsReqBody.data.business_details.corporateid =
					companyRocData?.CIN;

			// buissnessDetailsReqBody.data.business_details.industry_type = `${selectedMainOptionId}`;
			const buissnessDetailsRes = await axios.post(
				API.BUSINESS_DETIALS,
				buissnessDetailsReqBody
			);
			const newLoanRefId =
				buissnessDetailsRes?.data?.data?.loan_data?.loan_ref_id;
			const newLoanId = buissnessDetailsRes?.data?.data?.loan_data?.id;
			const newBusinessId =
				buissnessDetailsRes?.data?.data?.business_data?.id ||
				buissnessDetailsRes?.data?.data?.loan_data?.business_id;

			const newBusinessUserId =
				buissnessDetailsRes?.data?.data?.business_data?.userid;
			const newCreatedByUserId =
				buissnessDetailsRes?.data?.data?.loan_data?.createdUserId;
			const newBusinessType =
				buissnessDetailsRes?.data?.data?.business_data?.businesstype;
			const newBusinessMobile =
				buissnessDetailsRes?.data?.data?.business_data?.contactno;
			if (!!newBusinessType) {
				dispatch(setBusinessType(newBusinessType));
				dispatch(setSmeType(newBusinessType));
			}
			if (!!newBusinessMobile) dispatch(setBusinessMobile(newBusinessMobile));
			const newBusinessName =
				buissnessDetailsRes?.data?.data?.business_data?.businessname;
			if (!!newBusinessName) dispatch(setBusinessName(newBusinessName));

			// add director starts

			if (
				!!companyRocData &&
				Object.values(companyRocData)?.length > 0 &&
				!isEditLoan &&
				!isViewLoan &&
				!completedSections?.includes(selectedSectionId)
			) {
				try {
					const addDirectorsReqBody = formatSectionReqBody({
						section: selectedSection,
						values: {},
						app,
						// selectedDirector,
						application,
						selectedLoanProductId,
					});

					companyRocData?.data?.director?.map(dir => {
						dir.income_type = 'business'; // default value to be set as Business for all the added directors in the SME Flow (based on the requirement)
						return null;
					});
					addDirectorsReqBody.data =
						companyRocData?.data?.director ||
						formatObject(companyRocData?.directorsForShow);
					addDirectorsReqBody.business_id = newBusinessId;
					addDirectorsReqBody.loan_id = newLoanId;
					axios.post(API.ADD_MULTIPLE_DIRECTOR, addDirectorsReqBody);
				} catch (error) {
					console.error(error);
				}
			}
			// add director ends

			if (cacheDocumentsTemp.length > 0) {
				try {
					const uploadCacheDocumentsTemp = [];
					cacheDocumentsTemp.map(doc => {
						if (!doc?.requestId) return null;
						uploadCacheDocumentsTemp.push({
							...doc,
							request_id: doc?.requestId,
							doc_type_id:
								doc?.field?.doc_type?.[
									formState?.values?.[CONST.BUSINESS_TYPE_FIELD_NAME]
								],
							is_delete_not_allowed: true,
							document_id: doc?.requestId, // temp doc id as this doc is non deletable
						});
						return null;
					});
					if (uploadCacheDocumentsTemp.length) {
						const uploadCacheDocumentsTempReqBody = {
							loan_id: newLoanId,
							request_ids_obj: uploadCacheDocumentsTemp,
							user_id: newCreatedByUserId,
						};

						await axios.post(
							API.UPLOAD_CACHE_DOCS,
							uploadCacheDocumentsTempReqBody,
							{
								headers: {
									Authorization: clientToken,
								},
							}
						);
					}
				} catch (error) {
					console.error('error-', error);
				}
			}
			const newBuissnessDetails = {
				sectionId: selectedSectionId,
				sectionValues: {
					...formState.values,
				},
				businessType: formState?.values?.[CONST.BUSINESS_TYPE_FIELD_NAME],
			};
			newBuissnessDetails.cin = companyRocData?.CIN || '';
			dispatch(setCompletedApplicationSection(selectedSectionId));
			dispatch(
				setLoanIds({
					loanRefId: newLoanRefId,
					loanId: newLoanId,
					businessId: newBusinessId,
					businessUserId: newBusinessUserId,
					loanProductId: selectedLoanProductId,
					createdByUserId: newCreatedByUserId,
					borrowerUserId: newBorrowerUserId,
				})
			);
			dispatch(setSelectedSectionId(nextSectionId));
		} catch (error) {
			console.error('error-BusinessDetails-onProceed-', {
				error: error,
				res: error?.response,
				resres: error?.response?.response,
				resData: error?.response?.data,
			});
			addToast({
				message: getApiErrorMessage(error),
				type: 'error',
			});
		} finally {
			setLoading(false);
		}
	};
	const handleGstSubmit = () => {
		setGstModalOpen(true);
	};
	const addCacheDocumentTemp = async file => {
		const newCacheDocumentTemp = _.cloneDeep(cacheDocumentsTemp);
		newCacheDocumentTemp.push(file);
		setCacheDocumentsTemp(newCacheDocumentTemp);
	};
	const removeCacheDocumentTemp = fieldName => {
		const newCacheDocumentTemp = _.cloneDeep(cacheDocumentsTemp);
		if (
			cacheDocumentsTemp.filter(doc => doc?.field?.name === fieldName)?.length >
			0
		) {
			setCacheDocumentsTemp(
				newCacheDocumentTemp.filter(doc => doc?.field?.name !== fieldName)
			);
		}
	};

	// console.log(formState.values, 'form................');
	const prefilledValues = field => {
		try {
			// TEST MODE
			if (isTestMode && CONST.initialFormState?.[field?.db_key]) {
				return CONST.initialFormState?.[field?.db_key];
			}
			// -- TEST MODE
			const isFormStateUpdated = formState?.values?.[field.name] !== undefined;
			if (isFormStateUpdated) {
				return formState?.values?.[field?.name];
			}
			const dedupeData =
				!completedSections?.includes(selectedSectionId) &&
				!!dedupePrefilledValues
					? dedupePrefilledValues
					: null;
			const preData = {
				...sectionData?.business_details,
				...sectionData?.loan_data,
				...sectionData?.user_data,
				business_email: sectionData?.user_data?.email,
				email: sectionData?.business_details?.business_email,
				name: sectionData?.business_details?.first_name,
				// industry_type:
				// sectionData?.business_details?.businessindustry?.IndustryName || '',
				// 	sectionData?.business_details?.businessindustry || '',
				businesspancardnumber:
					sectionData?.business_details?.businesspancardnumber ||
					dedupeData?.pan_number,
				contact:
					sectionData?.business_details?.contactno || dedupeData?.mobile_no,
				businesstype:
					sectionData?.business_details?.businesstype ||
					dedupeData?.businesstype ||
					'',
				sub_industry_type:
					sectionData?.business_details?.businessindustry?.id || '',
				industry_type: selectedIndustryFromGetResp() || '',
				businessstartdate:
					companyRocData?.DateOfIncorporation ||
					sectionData?.business_details?.businessstartdate ||
					'',
			};

			if (preData?.[field?.db_key]) return preData?.[field?.db_key];

			return field?.value || '';
		} catch (err) {
			console.error('error-BusinessDetials', {
				error: err,
				res: err?.response?.data || '',
			});
		}
	};

	const validateToken = async () => {
		try {
			const params = queryString.parse(window.location.search);
			if (params?.token) {
				const decryptedToken = decryptRes(params?.token?.replaceAll(' ', '+'));

				if (decryptedToken?.token) {
					const isValidToken = await verifyUiUxToken(decryptedToken?.token);
					if (!isValidToken) {
						setIsTokenValid(false);
						return false;
					}
				} else {
					// if token coud not parse from url
					setIsTokenValid(false);
					return false;
				}
			}
		} catch (error) {
			console.error('error-validatetoken-', error);
			setIsTokenValid(false);
			return false;
		}
	};
	function handleBlurEmail(e) {
		// console.log("input blurred",e);
		setisPrefilEmail(false);
		// console.log(e);
	}
	function handleBlurMobileNumber(e) {
		setIsPrefilMobileNumber(false);
	}
	const fetchSectionDetails = async () => {
		try {
			setFetchingSectionData(true);

			const fetchRes = await axios.get(`${API_END_POINT}/business_details`, {
				params: {
					loan_ref_id: loanRefId,
				},
			});
			if (fetchRes?.data?.status === 'ok') {
				dispatch(
					setBusinessName(fetchRes?.data?.data?.business_details?.businessname)
				);
				setSectionData(fetchRes?.data?.data);
				if (fetchRes?.data?.data?.business_details?.udyam_number) {
					setUdyogAadhar(fetchRes?.data?.data?.business_details?.udyam_number);
				}
				// setUdyogAadhar('UDYAM-MH-19-0002476');
				if (fetchRes?.data?.data?.business_details?.udyam_response) {
					setUdyogAadharStatus(
						fetchRes?.data?.data?.business_details?.udyam_response
					);
				}

				if (
					!!fetchRes?.data?.data?.company_master_data
					// Object.values(fetchRes?.data?.data?.company_master_data)?.length > 0
				)
					setCompanyRocData(
						JSON.parse(fetchRes?.data?.data?.company_master_data?.OUTPUT_JSON)
					);
				if (!businessType) {
					dispatch(
						setBusinessType(
							fetchRes?.data?.data?.business_details?.businesstype
						)
					);
					dispatch(
						setSmeType(fetchRes?.data?.data?.business_details?.businesstype)
					);
				}
				if (isEditOrViewLoan) {
					dispatch(
						getDirectors({
							loanRefId,
							isSelectedProductTypeBusiness:
								selectedProduct?.isSelectedProductTypeBusiness,
							selectedSectionId,
						})
					);
					const responseData = fetchRes?.data?.data;
					dispatch(
						setLoanIds({
							loanId: responseData?.loan_data?.id,
							businessId:
								responseData?.business_details?.id ||
								responseData?.loan_data?.business_id?.id,
							businessUserId: fetchRes?.data?.data?.business_details?.userid,
							loanProductId: fetchRes?.data?.data?.loan_data?.loan_product_id,
							createdByUserId: fetchRes?.data?.data?.loan_data?.createdUserId,
						})
					);

					// update completed sections
					const tempCompletedSections = JSON.parse(
						fetchRes?.data?.data?.trackData?.[0]?.onboarding_track
					);
					dispatch(
						setNewCompletedSections(tempCompletedSections?.loan_details)
					);
					if (
						!tempCompletedSections?.loan_details?.includes(
							CONST_SECTIONS.APPLICATION_SUBMITTED_SECTION_ID
						)
					) {
						dispatch(setIsDraftLoan(true));
					}
					dispatch(
						setNewCompletedDirectorSections(
							tempCompletedSections?.director_details
						)
					);
					// console.log({ tempCompletedSections });
				}

				const panToGstRes = await axios.post(API.PAN_TO_GST, {
					pan: fetchRes?.data?.data?.business_details?.businesspancardnumber,
				});
				setGstin(panToGstRes);
			} else {
				setSectionData({});
			}
		} catch (error) {
			console.error('error-fetchSectionDetails-', error);
		} finally {
			setFetchingSectionData(false);
		}
	};
	useEffect(() => {
		scrollToTopRootElement();
		validateToken();
		if (
			!isEditLoan &&
			!isViewLoan &&
			completedSections?.includes(CONST_SECTIONS.DOCUMENT_UPLOAD_SECTION_ID)
		) {
			dispatch(
				setSelectedSectionId(CONST_SECTIONS.APPLICATION_SUBMITTED_SECTION_ID)
			);
		}
		//new get api
		if (loanRefId) fetchSectionDetails();
		//eslint-disable-next-line
	}, []);

	useEffect(() => {
		const fetchMainCompOptions = async () => {
			try {
				const allIndustriesOption = await fetchOptions({
					fetchOptionsURL: INDUSTRY_LIST_FETCH,
					sectionId: selectedSectionId,
					setOriginalOptions: setAllIndustriesOption,
				});

				const sortedOptions =
					(allIndustriesOption &&
						allIndustriesOption.length > 0 &&
						allIndustriesOption.sort((a, b) => {
							return a.name.localeCompare(b.name);
						})) ||
					[];

				setMainComponentOptions(sortedOptions);
			} catch (err) {
				console.error(err, 'Industry-Fetch-Error');
			}
		};
		fetchMainCompOptions();
	}, [selectedSectionId]);

	const extractAndFormatSubOption = () => {
		const extractedSubOptn = allIndustriesOption?.filter(industry => {
			return (
				`${industry.id}` ===
				`${formState?.values[CONST.INDUSTRY_TYPE_FIELD_NAME]}`
			);
		})?.[0]?.subindustry;

		let newOptionsList = [];
		extractedSubOptn?.length === 0
			? (newOptionsList = [{ value: '', name: '' }])
			: extractedSubOptn?.map(item => {
					newOptionsList.push({
						value: `${item.id}`,
						name: `${item.subindustry}`,
					});
					return null;
			  });

		const sortedOptions =
			(newOptionsList &&
				newOptionsList.length > 0 &&
				newOptionsList.sort((a, b) => {
					return a.name.localeCompare(b.name);
				})) ||
			[];

		return sortedOptions;
	};

	const selectedIndustryFromGetResp = () => {
		const industryName =
			sectionData?.business_details?.businessindustry.IndustryName;
		// console.log(allIndustriesOption);
		return allIndustriesOption.filter(
			item => item?.IndustryName === industryName
		)?.[0]?.id;
	};

	useEffect(() => {
		const res = extractAndFormatSubOption();
		setSubComponentOptions(res);
		if ((res?.length === 1 && res?.[0]?.value === '') || res.length === 0) {
			setIsSubIndustryMandatory(false);
		} else {
			setIsSubIndustryMandatory(true);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [formState?.values[CONST.INDUSTRY_TYPE_FIELD_NAME]]);

	useEffect(
		() => {
			// console.log(subComponentOptions);
			clearDependentFields({
				formState,
				field_name: CONST.SUB_INDUSTRY_TYPE_FIELD_NAME,
				subComponentOptions,
				onChangeFormStateField,
			});
		},
		//eslint-disable-next-line
		[JSON.stringify(subComponentOptions)]
	);

	// console.log({
	// 	allIndustriesOption,
	// 	mainComponentOptions,
	// 	subComponentOptions,
	// 	formValues: formState.values,
	// 	isSubIndustryMandatory,
	// 	random: selectedIndustryFromGetResp(),
	// });

	const ButtonProceed = (
		<Button
			fill
			name={`${isViewLoan ? 'Next' : 'Proceed'}`}
			isLoader={loading}
			disabled={loading}
			onClick={handleSubmit(() => {
				setIsIncomeTypeConfirmModalOpen(false);
				onSaveAndProceed();
			})}
		/>
	);

	return (
		<UI_SECTIONS.Wrapper>
			{fetchingSectionData ? (
				<Loading />
			) : (
				<>
					<ConfirmModal
						type={
							businessTypeField?.placeholder
								? businessTypeField?.placeholder
								: 'Business Type'
						}
						show={isIncomeTypeConfirmModalOpen}
						onClose={setIsIncomeTypeConfirmModalOpen}
						ButtonProceed={ButtonProceed}
					/>
					<Modal
						show={isGstModalOpen}
						onClose={() => {
							setGstModalOpen(false);
						}}
						// Width='40%'
						customStyle={{
							width: '45%',
							minWidth: 'fit-content',
							minHeight: 'auto',
						}}
					>
						<section>
							<UI.ImgClose
								onClick={() => {
									setGstModalOpen(false);
								}}
								src={imgClose}
								alt='close'
							/>
							<UI.TableHeader>
								<UI.TableColumn>Gstin</UI.TableColumn>
								<UI.TableColumn>State</UI.TableColumn>
								<UI.TableColumn>Status</UI.TableColumn>
							</UI.TableHeader>
							<UI.TableParentDiv>
								<UI.TableDataRowWrapper>
									{gst?.map((gstItem, idx) => {
										return (
											<UI.TableRow key={idx}>
												<UI.TableColumn>{gstItem.gstin}</UI.TableColumn>
												<UI.TableColumn>{gstItem.state_name}</UI.TableColumn>
												<UI.TableColumn>{gstItem.status}</UI.TableColumn>
											</UI.TableRow>
										);
									})}
								</UI.TableDataRowWrapper>
							</UI.TableParentDiv>
						</section>
					</Modal>

					<ROCBusinessDetailsModal
						show={isBusinessModalOpen}
						onClose={() => {
							setIsBusinessModalOpen(false);
						}}
						companyDetails={companyRocData}
						id={{
							udyogAadhar,
							pan: formState?.values?.[CONST.PAN_NUMBER_FIELD_NAME],
						}}
					/>
					{!isTokenValid && <SessionExpired show={!isTokenValid} />}
					{/* {console.log(formState.values.email)}; */}
					{selectedSection?.sub_sections?.map((sub_section, sectionIndex) => {
						return (
							<Fragment key={`section-${sectionIndex}-${sub_section?.id}`}>
								{sub_section?.name ? (
									<UI_SECTIONS.SubSectionHeader>
										{sub_section.name}
									</UI_SECTIONS.SubSectionHeader>
								) : null}
								{sub_section?.id === 'business_details' && (
									<Hint
										hint='Please upload the document with KYC image in Portrait Mode'
										hintIconName='Portrait Mode'
									/>
								)}
								<UI_SECTIONS.FormWrapGrid>
									{sub_section?.fields?.map((eachField, fieldIndex) => {
										const field = _.cloneDeep(eachField);
										if (
											field.type === 'file' &&
											field.name === CONST.PAN_UPLOAD_FIELD_NAME
										) {
											let panErrorMessage =
												((formState?.submit?.isSubmited ||
													formState?.touched?.[field.name]) &&
													formState?.error?.[field.name]) ||
												'';
											const panErrorColorCode = CONST_SECTIONS.getExtractionFlagColorCode(
												panErrorMessage
											);
											panErrorMessage = panErrorMessage.replace(
												CONST_SECTIONS.EXTRACTION_FLAG_ERROR,
												''
											);
											panErrorMessage = panErrorMessage.replace(
												CONST_SECTIONS.EXTRACTION_FLAG_WARNING,
												''
											);
											panErrorMessage = panErrorMessage.includes(
												CONST_SECTIONS.EXTRACTION_FLAG_SUCCESS
											)
												? ''
												: panErrorMessage;

											return (
												<UI_SECTIONS.FieldWrapGrid
													key={`field-${fieldIndex}-${field.name}`}
												>
													<UI.ProfilePicWrapper>
														<PanUpload
															field={field}
															value={prefilledValues(field)}
															setGstin={setGstin}
															udyogAadhar={udyogAadhar}
															setUdyogAadhar={setUdyogAadhar}
															formState={formState}
															uploadedFile={
																panUploadedFile || tempPanUploadedFile
															}
															addCacheDocumentTemp={addCacheDocumentTemp}
															removeCacheDocumentTemp={removeCacheDocumentTemp}
															isPanNumberExist={isPanNumberExist}
															panErrorMessage={panErrorMessage}
															panErrorColorCode={panErrorColorCode}
															setErrorFormStateField={setErrorFormStateField}
															onChangeFormStateField={onChangeFormStateField}
															clearErrorFormState={clearErrorFormState}
															isDisabled={
																isEditOrViewLoan ||
																completedSections?.includes(selectedSectionId)
															}
															setCompanyRocData={setCompanyRocData}
															completedSections={completedSections}
															// setdisableUdyamNumberInput={
															// 	setdisableUdyamNumberInput
															// }
														/>

														{panErrorMessage && (
															<UI_SECTIONS.ErrorMessage
																borderColorCode={panErrorColorCode}
															>
																{panErrorMessage}
															</UI_SECTIONS.ErrorMessage>
														)}
													</UI.ProfilePicWrapper>
												</UI_SECTIONS.FieldWrapGrid>
											);
										}
										if (
											field?.visibility === false ||
											!field?.name ||
											!field?.type
										)
											return null;
										const newValue = prefilledValues(field);
										let newValueSelectField;
										if (!!field.sub_fields) {
											newValueSelectField = prefilledValues(
												field?.sub_fields[0]
											);
										}
										const customFieldProps = {};
										const customFieldPropsSubFields = {};
										if (
											field?.name === CONST.BUSINESS_MOBILE_NUMBER_FIELD_NAME
										) {
											customFieldProps.rules = {
												...field.rules,
												is_zero_not_allowed_for_first_digit: true,
											};
										}

										/* Starts : Here we will pass all the required props for the main and the sub-components */
										if (field?.name === 'industry_type') {
											customFieldProps.type = 'industryType';
											// customFieldProps.apiURL = SUB_INDUSTRY_FETCH;
											customFieldProps.mainComponentOptions = mainComponentOptions;
											// customFieldProps.setSubComponentOptions = setSubComponentOptions;
											customFieldProps.sectionId = selectedSectionId;
											customFieldProps.errMessage =
												'Searched Option Not Found.';
										}

										if (field?.name === 'sub_industry_type') {
											customFieldProps.type = 'subIndustryType';
											customFieldProps.subComponentOptions = subComponentOptions;
											// customFieldProps.errMessage = 'not found';
										}
										if (
											(field?.name === CONST.BUSINESS_EMAIL_FIELD ||
												field?.name ===
													CONST.BUSINESS_MOBILE_NUMBER_FIELD_NAME) &&
											(isEditOrViewLoan ||
												completedSections?.includes(selectedSectionId))
										) {
											customFieldProps.disabled = true;
										}
										if (
											field?.name === CONST.GSTIN_FIELD_NAME &&
											gstin?.data?.data?.length > 0 &&
											!!gstin?.data?.data
										) {
											customFieldProps.type = 'disabledtextfieldmodal';
											customFieldProps.onClick = handleGstSubmit;
											customFieldProps.value = gst?.[0]?.gstin;
											customFieldProps.length = gst?.length;
										}
										if (
											isPanUploadMandatory &&
											!isPanNumberExist &&
											field?.name !== CONST.EXISTING_CUSTOMER_FIELD_NAME
										) {
											customFieldProps.disabled = true;
										}

										if (field?.name === 'ifsc_code') {
											customFieldProps.subComponentOptions = subComponentOptions;
											// customFieldProps.errMessage = 'not found';
										}
										if (
											isPanUploadMandatory &&
											isPanNumberExist &&
											field.name === CONST.PAN_NUMBER_FIELD_NAME
										) {
											customFieldProps.disabled = true;
										}
										// TODO: check for casedos
										if (!isPanUploadMandatory)
											customFieldProps.disabled = false;
										// if (field?.name === 'pan_number')
										// 	if (field?.sub_fields?.[0]?.name === 'Fetch') {
										// 		customFieldProps.loading = loading;
										// 		customFieldProps.disabled =
										// 			loading || isViewLoan || isEditLoan;
										// 		customFieldProps.onClick = event => {
										// 			onPanEnter(formState.values?.['pan_number']);
										// 		};
										// 	}
										if (field?.name === CONST.PAN_NUMBER_FIELD_NAME) {
											customFieldPropsSubFields.loading = loading;
											customFieldProps.disabled =
												loading ||
												isViewLoan ||
												isEditLoan ||
												!!completedSections?.includes(selectedSectionId);
											customFieldPropsSubFields.disabled =
												loading ||
												!!completedSections?.includes(selectedSectionId);
											customFieldPropsSubFields.onClick = event => {
												onPanEnter(formState.values?.['pan_number']);
											};
										}

										if (field?.name === CONST.CUSTOMER_ID_FIELD_NAME) {
											customFieldPropsSubFields.onClick = onFetchFromCustomerId;
											customFieldPropsSubFields.loading = loading;
											customFieldPropsSubFields.disabled =
												loading ||
												!!completedSections?.includes(selectedSectionId);
											customFieldProps.disabled = !!completedSections?.includes(
												selectedSectionId
											);
										}

										if (field?.name === CONST.CUSTOMER_ID_FIELD_NAME) {
											field.type = 'input_field_with_info';
											customFieldProps.infoIcon = true;
											customFieldProps.infoMessage =
												'Select the Business Type to fetch the data from Customer ID.';
										}
										if (field.name === CONST.BUSINESS_START_DATE) {
											customFieldPropsSubFields.value =
												getTotalYearsCompleted(
													moment(
														formState?.values?.[CONST.BUSINESS_START_DATE]
													).format('YYYY-MM-DD')
												) || '';
											customFieldPropsSubFields.disabled = true;
										}
										// console.log({
										// 	formState,
										// 	selectedProduct,
										// 	selectedDedupeData,
										// });
										// To be verified once the config changes are done
										if (
											`${formState?.values?.['business_type']}`?.length === 0
										) {
											if (field?.name === CONST.CUSTOMER_ID_FIELD_NAME) {
												field.disabled = true;
											}
										}
										// TODO: to be fix properly
										// no use of set state inside return statement
										// if (field?.name === CONST.UDYAM_NUMBER_FIELD_NAME) {
										// 	if (
										// 		disableUdyamNumberInput
										// 		// !formState?.values?.[CONST.UDYAM_NUMBER_FIELD_NAME] &&
										// 		//!udyogAadhar &&
										// 		//!udyogAadharStatus
										// 	) {
										// 		customFieldProps.disabled = disableUdyamNumberInput;
										// 		//console.log('udyamstatusnotnull');
										// 		setdisableUdyamNumberInput('');
										// 		return null;
										// 	}

										// 	if (!udyogAadhar && !udyogAadharStatus) {
										// 		customFieldProps.disabled = false;
										// 	} else customFieldProps.disabled = true;
										// }

										if (field?.name === CONST.UDYAM_NUMBER_FIELD_NAME) {
											if (
												sectionData?.business_details?.udyam_number &&
												sectionData?.business_details?.udyam_response
											) {
												customFieldProps.disabled = true;
											}
										}

										if (
											field?.name === CONST.BUSINESS_TYPE_FIELD_NAME &&
											(isEditOrViewLoan ||
												completedSections?.includes(selectedSectionId))
										) {
											customFieldProps.disabled = true;
										}
										if (isViewLoan) {
											customFieldProps.disabled = true;
										}
										if (field.name === CONST.BUSINESS_EMAIL_FIELD) {
											// console.log("Contact")
											customFieldProps.onblur = handleBlurEmail;
										}
										if (field.name === CONST.CONTACT_EMAIL_FIELD) {
											customFieldProps.onFocus = handleBlurEmail;

											if (
												isPrefilEmail &&
												!isEditOrViewLoan &&
												!completedSections?.includes(selectedSectionId)
											) {
												// console.log(formState?.values?.email);
												customFieldProps.value = formState.values.email;
											}
											// customFieldProps.value=formState.values.email
										}
										if (
											field.name === CONST.BUSINESS_MOBILE_NUMBER_FIELD_NAME
										) {
											customFieldProps.onblur = handleBlurMobileNumber;
										}
										if (field.name === CONST.MOBILE_NUMBER_FIELD_NAME) {
											customFieldProps.onFocus = handleBlurMobileNumber;
											if (
												isPrefilMobileNumber &&
												!isEditOrViewLoan &&
												!completedSections?.includes(selectedSectionId)
											) {
												customFieldProps.value =
													formState.values.business_mobile_no;
											}
										}
										if (field?.for_type_name) {
											if (
												!field?.for_type?.includes(
													formState?.values?.[field?.for_type_name]
												)
											)
												return null;
										}

										if (field?.disabled === true) {
											customFieldProps.disabled = true;
										}

										return (
											<UI_SECTIONS.FieldWrapGrid
												key={`field-${fieldIndex}-${field.name}`}
											>
												<div
													style={{
														display: 'flex',
														gap: '10px',
														alignItems: 'center',
													}}
												>
													{field?.sub_fields &&
														field?.sub_fields[0].is_prefix &&
														register({
															...field.sub_fields[0],
															value: newValueSelectField,
															visibility: 'visible',
															...customFieldProps,
															...customFieldPropsSubFields,
														})}
													<div
														style={{
															width: '100%',
														}}
													>
														{register({
															...field,
															value: newValue,
															visibility: 'visible',
															...customFieldProps,
														})}
													</div>
													{field?.sub_fields &&
														!field?.sub_fields[0].is_prefix &&
														register({
															...field.sub_fields[0],
															value: newValueSelectField,
															visibility: 'visible',
															...customFieldProps,
															...customFieldPropsSubFields,
														})}
												</div>
												{(formState?.submit?.isSubmited ||
													formState?.touched?.[field?.name]) &&
													formState?.error?.[field?.name] && (
														<UI_SECTIONS.ErrorMessage>
															{formState?.error?.[field?.name]}
														</UI_SECTIONS.ErrorMessage>
													)}
												{(formState?.submit?.isSubmited ||
													formState?.touched?.[field?.sub_fields?.[0]?.name]) &&
													formState?.error?.[field?.sub_fields?.[0]?.name] && (
														<UI_SECTIONS.ErrorMessage>
															{formState?.error?.[field?.sub_fields[0]?.name]}
														</UI_SECTIONS.ErrorMessage>
													)}
											</UI_SECTIONS.FieldWrapGrid>
											//end
										);
									})}
								</UI_SECTIONS.FormWrapGrid>
							</Fragment>
						);
					})}
					<UI_SECTIONS.Footer>
						{/* {console.log({
							companyRocData,
							sectionData,
							loanId,
							businessId,
							loanRefId,
						})} */}
						{!!companyRocData && Object.values(companyRocData)?.length > 0 && (
							<Button
								name={'Business Details'}
								onClick={() => {
									setIsBusinessModalOpen(true);
								}}
							/>
						)}
						{!isViewLoan && (
							<Button
								fill
								name={'Save and Proceed'}
								isLoader={loading}
								disabled={loading}
								onClick={
									// () => onPanEnter(formState.values?.['pan_number'])
									handleSubmit(() => {
										if (
											isEditOrViewLoan ||
											completedSections?.includes(selectedSectionId)
										) {
											onSaveAndProceed();
											return;
										}
										setIsIncomeTypeConfirmModalOpen(true);
									})
								}
							/>
						)}
						{isViewLoan && (
							<>
								<Button name='Next' onClick={naviagteToNextSection} fill />
							</>
						)}
					</UI_SECTIONS.Footer>
				</>
			)}
		</UI_SECTIONS.Wrapper>
	);
};
export default BusinessDetails;
