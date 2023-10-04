import React, { Fragment, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import queryString from 'query-string';
import _ from 'lodash';
import moment from 'moment';
import useForm from 'hooks/useFormIndividual';
import Button from 'components/Button';
import ProfileUpload from './ProfileUpload';
import PanUpload from './PanUpload';
import Hint from 'components/Hint';
import ConfirmModal from 'components/modals/ConfirmModal';
import AddressDetailsCard from 'components/AddressDetailsCard/AddressDetailsCard';
import NavigateCTA from 'components/Sections/NavigateCTA';
import { encryptReq } from 'utils/encrypt';
import { isInvalidPan } from 'utils/validation';
import imgClose from 'assets/icons/close_icon_grey-06.svg';
import { decryptRes } from 'utils/encrypt';
import { verifyUiUxToken } from 'utils/request';
import {
	setIsDraftLoan,
	setLoginCreateUserRes,
	setSelectedSectionId,
} from 'store/appSlice';
import {
	DIRECTOR_TYPES,
	setProfileGeoLocation,
	setSelectedDirectorId,
} from 'store/directorsSlice';
import {
	setLoanIds,
	setGeoLocation,
	setNewCompletedSections,
	setDedupePrefilledValues,
} from 'store/applicationSlice';
import {
	getDirectors,
	setAddNewDirectorKey,
	setNewCompletedDirectorSections,
} from 'store/directorsSlice';
import {
	formatSectionReqBody,
	getAllCompletedSections,
	getApiErrorMessage,
	// getEditLoanDocuments,
	getSelectedField,
	isDirectorApplicant,
	isFieldValid,
	parseJSON,
	// checkInitialDirectorsUpdated,
} from 'utils/formatData';
import SessionExpired from 'components/modals/SessionExpired';
import { useToasts } from 'components/Toast/ToastProvider';
import * as UI_SECTIONS from 'components/Sections/ui';
import * as CONST_SECTIONS from 'components/Sections/const';
import * as API from '_config/app.config';
import * as UI from './ui';
import * as CONST from './const';
import Loading from 'components/Loading';
import { API_END_POINT } from '_config/app.config';
import {
	scrollToTopRootElement,
	isNullFunction,
	getGeoLocation,
	getTotalYearsCompleted,
} from 'utils/helper';
import Modal from 'components/Modal';
import DedupeAccordian from '../BusinessDetails/DedupeComponents/DedupeAccordian';

const BasicDetails = props => {
	const { app, application } = useSelector(state => state);
	const { directors, selectedDirectorId, addNewDirectorKey } = useSelector(
		state => state.directors
	);

	// const { smeType } = directors;
	// console.log({ smeType });
	const selectedDirector = directors?.[selectedDirectorId] || {};

	const isApplicant = addNewDirectorKey
		? addNewDirectorKey === DIRECTOR_TYPES.applicant
		: isDirectorApplicant(selectedDirector);

	const {
		selectedProduct,
		selectedSectionId,
		nextSectionId,
		isTestMode,
		selectedSection,
		whiteLabelId,
		clientToken,
		userToken,
		isViewLoan,
		isEditLoan,
		isEditOrViewLoan,
		// editLoanData,
		userDetails,
		isGeoTaggingEnabled,
		permission,
	} = app;
	const { isCountryIndia } = permission;
	const {
		// cacheDocuments,
		borrowerUserId,
		businessUserId,
		geoLocation,
		loanRefId,
		businessType,
		loanId,
		businessId,
		dedupePrefilledValues,
	} = application;

	const dispatch = useDispatch();
	const { addToast } = useToasts();
	const [loading, setLoading] = useState(false);
	const [fetchingAddress, setFetchingAddress] = useState(false);
	const [
		isIncomeTypeConfirmModalOpen,
		setIsIncomeTypeConfirmModalOpen,
	] = useState(false);
	const [cacheDocumentsTemp, setCacheDocumentsTemp] = useState([]);
	const [profilePicGeolocation, setProfilePicGeolocation] = useState({});
	const [geoLocationData, setGeoLocationData] = useState(geoLocation);
	const [mandatoryGeoTag, setMandatoryGeoTag] = useState([]);
	const {
		handleSubmit,
		register,
		formState,
		onChangeFormStateField,
		clearErrorFormState,
		setErrorFormStateField,
		// resetForm,
	} = useForm();

	// ------------------------------------------------sample json -----------------------------------------------------------------------------------------
	const response = [
		{
			headerName: 'Identification',
			id: 'Identification',
			matchLevel: [
				{
					name: 'Application Match',
					data: [
						{
							loan_ref_id: 'LKKR00019297',
							pan_no: 'fwqy12324',
							name: 'savisavi n',
							date_of_birth: '12/3/1994',
							mobile_number: '6564654665',
							email_id: 'savi@sdfsdf.com',
							product: 'Unsecured Business/Self-Employed',
							branch: '',
							stage: 'Application',
							match: '100%',
						},
						{
							loan_ref_id: 'RUGA00019298',
							pan_no: 'fwqy12324',
							name: 'savisavi n',
							date_of_birth: '12/3/1994',
							mobile_number: '6564654665',
							email_id: 'savi@sdfsdf.com',
							product: 'Unsecured Business/Self-Employed',
							branch: '',
							stage: 'Application',
							match: '100%',
						},
						{
							loan_ref_id: 'CPRM00019299',
							pan_no: 'fwqy12324',
							name: 'savisavi n',
							date_of_birth: '12/3/1994',
							mobile_number: '6564654665',
							email_id: 'savi@sdfsdf.com',
							product: 'Unsecured Business/Self-Employed',
							branch: {
								id: 179622,
								bank: 'Muthoot Fincorp Ltd',
								ifsc: 'S0031-SULB',
								branch: 'S0031-SULB-BANGALORE-SUNKADAKATTE',
							},
							stage: 'Application',
							match: '100%',
						},
						{
							loan_ref_id: 'GUMG00019313',
							pan_no: 'fwqy12324',
							name: 'savisavi n',
							date_of_birth: '12/3/1994',
							mobile_number: '6564654665',
							email_id: 'gjdgs@sdfsdf.com',
							product: 'Unsecured Business/Self-Employed',
							branch: '',
							stage: 'Application',
							match: '75%',
						},
					],
				},
			],
		},
	];

	//--------------------------------------------------------------------------------------------------------------

	const [isTokenValid, setIsTokenValid] = useState(true);
	const [fetchingSectionData, setFetchingSectionData] = useState(false);
	const [fetchingGeoLocation, setFetchingGeoLocation] = useState(false);

	const [sectionData, setSectionData] = useState({});

	const [isDedupeCheckModalOpen, setIsDedupeCheckModalOpen] = useState(false);
	const [isDedupeCheckModalLoading, setIsDedupeCheckModalLoading] = useState(
		false
	);
	const [dedupeModalData, setDedupeModalData] = useState([]);

	// console.log(
	// 	'🚀 ~ file: BasicDetails.js:67 ~ BasicDetails ~ selectedProduct:',
	// 	selectedProduct
	// );
	const documentMapping = JSON.parse(permission?.document_mapping) || [];
	const dedupeApiData = documentMapping?.dedupe_api_details || [];
	const selectedDedupeData =
		dedupeApiData && Array.isArray(dedupeApiData)
			? dedupeApiData?.filter(item => {
					return item?.product_id?.includes(selectedProduct?.id);
			  })?.[0] || {}
			: {};
	const passportData =
		!!sectionData &&
		Object.keys(sectionData)?.length > 0 &&
		sectionData?.hasOwnProperty('ekyc_respons_data') &&
		sectionData?.ekyc_respons_data?.length > 0
			? parseJSON(sectionData?.ekyc_respons_data?.[0]?.kyc_details)
			: {};
	const [fetchedProfilePic, setFetchedProfilePic] = useState();
	// TODO: Varun SME Flow move this selected income type inside redux and expose selected income type
	const selectedIncomeType = formState?.values?.[CONST.INCOME_TYPE_FIELD_NAME];
	const profileUploadedFile =
		cacheDocumentsTemp?.filter(
			doc => doc?.field?.name === CONST.PROFILE_UPLOAD_FIELD_NAME
		)?.[0] ||
		fetchedProfilePic ||
		null;

	const completedSections = getAllCompletedSections({
		application,
		selectedDirector,
		isApplicant,
	});

	// console.log({ selectedDirector, selectedProduct, isEditOrViewLoan });
	const selectedPanUploadField = getSelectedField({
		fieldName: CONST.PAN_UPLOAD_FIELD_NAME,
		selectedSection,
		isApplicant,
	});
	const isPanUploadMandatory = !!selectedPanUploadField?.rules?.required;

	const panUploadedFile =
		cacheDocumentsTemp?.filter(
			doc => doc?.field?.name === CONST.PAN_UPLOAD_FIELD_NAME
		)?.[0] || null;
	const isPanNumberExist = !!formState.values.pan_number;

	const tempPanUploadedFile = !!sectionData?.loan_document_details
		? sectionData?.loan_document_details?.filter(
				doc =>
					doc?.document_details?.classification_type === 'pan' &&
					`${doc?.directorId}` === `${selectedDirectorId}`
		  )?.[0]
		: null;
	const selectedProfileField = getSelectedField({
		fieldName: CONST.PROFILE_UPLOAD_FIELD_NAME,
		selectedSection,
		isApplicant,
	});
	// console.log(selectedProfileField);

	const isProfileMandatory = !!selectedProfileField?.rules?.required;
	let prefilledProfileUploadValue = '';
	const onAddDirectorSme = async key => {
		try {
			setLoading(true);
			const isTokenValid = await validateToken();
			if (isTokenValid === false) return;
			// call login api only once
			// TODO: varun do not call this api when RM is creating loan
			let newBorrowerUserId = '';

			if (!isEditOrViewLoan && !borrowerUserId) {
				const loginCreateUserReqBody = {
					email: formState?.values?.email || '',
					white_label_id: whiteLabelId,
					source: API.APP_CLIENT,
					name: formState?.values?.first_name,
					mobileNo: formState?.values?.mobile_no,
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

			// loan product is is only applicable for applicant
			// it should not be overritten when coapplicant is income type is different then applicant
			let selectedLoanProductId = '';
			// if (isApplicant) {
			selectedLoanProductId = selectedProduct?.product_id?.[selectedIncomeType];
			// }

			const profileField = selectedSection?.sub_sections?.[0]?.fields?.filter(
				field => field?.name === CONST.PROFILE_UPLOAD_FIELD_NAME
			)?.[0];
			const isNewProfileUploaded = !!profileUploadedFile?.file;
			let url = profileUploadedFile?.preview;
			if (profileField?.geo_tagging === true) {
				url = profileUploadedFile?.presignedUrl;
			}
			const profileUrl = url || selectedDirector?.customer_picture || '';
			const profileFieldValue = isNewProfileUploaded
				? {
						...profileUploadedFile?.file,
						doc_type_id: profileField?.doc_type?.[selectedIncomeType],
						is_delete_not_allowed:
							profileField?.is_delete_not_allowed === true ? true : false,
				  }
				: profileUrl;
			const crimeCheck = selectedProduct?.product_details?.crime_check || 'No';
			const basicDetailsReqBody = formatSectionReqBody({
				section: selectedSection,
				// crime_check: isCrimeCheckPresent,
				values: {
					...formState.values,
					app_coordinates:
						// selectedProfileField?.geo_tagging === true
						{
							lat: geoLocationData?.lat,
							long: geoLocationData?.long,
							timestamp: geoLocationData?.timestamp,
						},
					// : {},
					[CONST.PROFILE_UPLOAD_FIELD_NAME]: profileFieldValue,
				},
				app,
				selectedDirector,
				application,
				selectedLoanProductId,
			});

			// always pass borrower user id from login api for create case / from edit loan data
			basicDetailsReqBody.borrower_user_id =
				newBorrowerUserId || businessUserId;
			if (crimeCheck) {
				basicDetailsReqBody.data.basic_details.crime_check = crimeCheck;
			}
			if (addNewDirectorKey) {
				basicDetailsReqBody.data.basic_details.type_name = addNewDirectorKey;
			} else if (selectedDirector) {
				basicDetailsReqBody.data.basic_details.type_name =
					selectedDirector?.type_name;
			}
			const basicDetailsRes = await axios.post(
				`${API.API_END_POINT}/basic_details`,
				basicDetailsReqBody
			);
			const newLoanRefId = basicDetailsRes?.data?.data?.loan_data?.loan_ref_id;
			const newLoanId = basicDetailsRes?.data?.data?.loan_data?.id;
			const newBusinessId = basicDetailsRes?.data?.data?.business_data?.id;
			const newDirectorId = basicDetailsRes?.data?.data?.director_details?.id;
			const newBusinessUserId =
				basicDetailsRes?.data?.data?.business_data?.userid;
			const newCreatedByUserId =
				basicDetailsRes?.data?.data?.loan_data?.createdUserId;

			if (!newLoanRefId || !newLoanId || !newBusinessId) {
				throw new Error('Unable to create loan, Try after sometime');
			}

			if (isNewProfileUploaded) {
				const uploadedProfileRes =
					basicDetailsRes?.data?.data?.loan_document_data || null;
				const newProfileData = {
					...(uploadedProfileRes || {}),
					...profileUploadedFile,
					...(typeof profileFieldValue !== 'string' ? profileFieldValue : {}),
					directorId: newDirectorId,
					preview: profileUrl,
					file: null,
					isDocRemoveAllowed: false,
					category: CONST_SECTIONS.DOC_CATEGORY_KYC,
				};
				if (uploadedProfileRes?.id) {
					newProfileData.document_id = uploadedProfileRes?.id;
				}
				newProfileData.name =
					newProfileData?.filename ||
					newProfileData?.uploaded_doc_name ||
					newProfileData?.original_doc_name;
			}
			if (cacheDocumentsTemp?.length > 0) {
				try {
					const uploadCacheDocumentsTemp = [];
					cacheDocumentsTemp?.map(doc => {
						if (!doc?.requestId) return null;
						uploadCacheDocumentsTemp.push({
							...doc,
							request_id: doc?.requestId,
							classification_type:
								doc?.field?.name === CONST.PAN_UPLOAD_FIELD_NAME ? 'pan' : null,
							doc_type_id: doc?.field?.doc_type?.[selectedIncomeType],
							is_delete_not_allowed: true,
							director_id: newDirectorId,
							directorId: newDirectorId,
							preview: null,
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
			const newBasicDetails = {
				sectionId: selectedSectionId,
				sectionValues: {
					...formState.values,
					[CONST.PROFILE_UPLOAD_FIELD_DB_KEY]: profileUrl,
					[CONST.PROFILE_UPLOAD_FIELD_NAME]: profileUrl,
				},
			};
			newBasicDetails.directorId = newDirectorId;
			// TODO: shreyas work with director object and pass cin
			// newBasicDetails.cin = selectedDirector?.companyRocData?.CIN || '';
			newBasicDetails.profileGeoLocation = (Object.keys(profilePicGeolocation)
				.length > 0 &&
				profilePicGeolocation) || {
				address:
					selectedDirector?.address ||
					selectedDirector?.profileGeoLocation?.address,
				lat: selectedDirector?.lat,
				long: selectedDirector?.long,
				timestamp: selectedDirector?.timestamp,
			};
			newBasicDetails.geotaggingMandatory = mandatoryGeoTag;
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
			// if (addNewDirectorKey) {
			dispatch(
				getDirectors({
					loanRefId: newLoanRefId,
					isSelectedProductTypeBusiness:
						selectedProduct?.isSelectedProductTypeBusiness,
				})
			);
			dispatch(setAddNewDirectorKey(''));
			// }
			setTimeout(() => {
				// to update after directors are fetched
				// dispatch(setSelectedSectionId(CONST_SECTIONS.BASIC_DETAILS_SECTION_ID));
				// dispatch(setSelectedDirectorId(newDirectorId));
			}, 500);
			if (isGeoTaggingEnabled) {
				if (
					mandatoryGeoTag.length > 0 &&
					mandatoryGeoTag.includes('profileGeoLocation')
				) {
					// ITERATING OVER THE MANDATORY FIELDS AND
					// IF IN REDUX STORE DATA DOESNT PERSIST THROW ERROR
					// BUT ALLOW USER TO MOVE TO NEXT SECTION
					if (
						!selectedDirector.profileGeoLocation?.address &&
						!profilePicGeolocation?.address
					) {
						addToast({
							message: 'Mandatory Profile GeoLocation not captured',
							type: 'error',
						});
					}
				}

				// IF GEOTAGGING IS MANDATORY
				if (!geoLocation?.address) {
					addToast({
						message: 'Mandatory GeoLocation not captured',
						type: 'error',
					});
				}
			}
			dispatch(setSelectedDirectorId(''));
			dispatch(setSelectedSectionId(CONST_SECTIONS.ADDRESS_DETAILS_SECTION_ID));
			dispatch(setSelectedSectionId(CONST_SECTIONS.BASIC_DETAILS_SECTION_ID));
			dispatch(setAddNewDirectorKey(key));
			// resetForm();
			// setCacheDocumentsTemp([]);
		} catch (err) {
			console.error(err?.message);
		} finally {
			setLoading(false);
		}
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
				let name = panExtractionMsg?.upstreamName;
				let firstName = '';
				let lastName = '';
				if (name) {
					const nameSplit = name.split(' ');
					if (nameSplit.length > 1) {
						lastName = nameSplit[nameSplit.length - 1];
						nameSplit.pop();
					}
					firstName = nameSplit.join(' ');
				}

				onChangeFormStateField({
					name: CONST.FIRST_NAME_FIELD_NAME,
					value: firstName || '',
				});
				onChangeFormStateField({
					name: CONST.LAST_NAME_FIELD_NAME,
					value: lastName || '',
				});
				// 	//END IF PAN NAME
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

	const onSaveAndProceed = async () => {
		dispatch(setDedupePrefilledValues({}));
		try {
			setLoading(true);
			const isTokenValid = await validateToken();
			if (isTokenValid === false) return;
			// call login api only once
			// TODO: varun do not call this api when RM is creating loan
			let newBorrowerUserId = '';

			if (!isEditOrViewLoan && !borrowerUserId) {
				const loginCreateUserReqBody = {
					email: formState?.values?.email || '',
					white_label_id: whiteLabelId,
					source: API.APP_CLIENT,
					name: formState?.values?.first_name,
					mobileNo: formState?.values?.mobile_no,
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

			// loan product is is only applicable for applicant
			// it should not be overritten when coapplicant is income type is different then applicant
			let selectedLoanProductId = '';
			// if (isApplicant) {
			selectedLoanProductId = selectedProduct?.product_id?.[selectedIncomeType];
			// }

			const profileField = selectedSection?.sub_sections?.[0]?.fields?.filter(
				field => field?.name === CONST.PROFILE_UPLOAD_FIELD_NAME
			)?.[0];
			const isNewProfileUploaded = !!profileUploadedFile?.file;
			let url = profileUploadedFile?.preview;
			if (profileField?.geo_tagging === true) {
				url = profileUploadedFile?.presignedUrl;
			}
			const profileUrl = url || selectedDirector?.customer_picture || '';
			const profileFieldValue = isNewProfileUploaded
				? {
						...profileUploadedFile?.file,
						doc_type_id: profileField?.doc_type?.[selectedIncomeType],
						is_delete_not_allowed:
							profileField?.is_delete_not_allowed === true ? true : false,
				  }
				: profileUrl;
			const crimeCheck = selectedProduct?.product_details?.crime_check || 'No';
			const basicDetailsReqBody = formatSectionReqBody({
				section: selectedSection,
				// crime_check: isCrimeCheckPresent,
				values: {
					...formState.values,
					app_coordinates:
						// selectedProfileField?.geo_tagging === true
						{
							lat: geoLocationData?.lat,
							long: geoLocationData?.long,
							timestamp: geoLocationData?.timestamp,
						},
					// : {},
					[CONST.PROFILE_UPLOAD_FIELD_NAME]: profileFieldValue,
				},
				app,
				selectedDirector,
				application,
				selectedLoanProductId,
			});

			// always pass borrower user id from login api for create case / from edit loan data
			basicDetailsReqBody.borrower_user_id =
				newBorrowerUserId || businessUserId;
			if (crimeCheck) {
				basicDetailsReqBody.data.basic_details.crime_check = crimeCheck;
			}
			if (addNewDirectorKey) {
				basicDetailsReqBody.data.basic_details.type_name = addNewDirectorKey;
			} else if (selectedDirector) {
				basicDetailsReqBody.data.basic_details.type_name =
					selectedDirector?.type_name;
			}
			const basicDetailsRes = await axios.post(
				`${API.API_END_POINT}/basic_details`,
				basicDetailsReqBody
			);
			const newLoanRefId = basicDetailsRes?.data?.data?.loan_data?.loan_ref_id;
			const newLoanId = basicDetailsRes?.data?.data?.loan_data?.id;
			const newBusinessId = basicDetailsRes?.data?.data?.business_data?.id;
			const newDirectorId = basicDetailsRes?.data?.data?.director_details?.id;
			const newBusinessUserId =
				basicDetailsRes?.data?.data?.business_data?.userid;
			const newCreatedByUserId =
				basicDetailsRes?.data?.data?.loan_data?.createdUserId;

			if (!newLoanRefId || !newLoanId || !newBusinessId) {
				throw new Error('Unable to create loan, Try after sometime');
			}

			if (isNewProfileUploaded) {
				const uploadedProfileRes =
					basicDetailsRes?.data?.data?.loan_document_data || null;
				const newProfileData = {
					...(uploadedProfileRes || {}),
					...profileUploadedFile,
					...(typeof profileFieldValue !== 'string' ? profileFieldValue : {}),
					directorId: newDirectorId,
					preview: profileUrl,
					file: null,
					isDocRemoveAllowed: false,
					category: CONST_SECTIONS.DOC_CATEGORY_KYC,
				};
				if (uploadedProfileRes?.id) {
					newProfileData.document_id = uploadedProfileRes?.id;
				}
				newProfileData.name =
					newProfileData?.filename ||
					newProfileData?.uploaded_doc_name ||
					newProfileData?.original_doc_name;
			}
			if (cacheDocumentsTemp.length > 0) {
				try {
					const uploadCacheDocumentsTemp = [];
					cacheDocumentsTemp.map(doc => {
						if (!doc?.requestId) return null;
						uploadCacheDocumentsTemp.push({
							...doc,
							request_id: doc?.requestId,
							classification_type:
								doc?.field?.name === CONST.PAN_UPLOAD_FIELD_NAME ? 'pan' : null,
							doc_type_id: doc?.field?.doc_type?.[selectedIncomeType],
							is_delete_not_allowed: true,
							director_id: newDirectorId,
							directorId: newDirectorId,
							preview: null,
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
			const newBasicDetails = {
				sectionId: selectedSectionId,
				sectionValues: {
					...formState.values,
					[CONST.PROFILE_UPLOAD_FIELD_DB_KEY]: profileUrl,
					[CONST.PROFILE_UPLOAD_FIELD_NAME]: profileUrl,
				},
			};
			newBasicDetails.directorId = newDirectorId;
			// TODO: shreyas work with director object and pass cin
			// newBasicDetails.cin = selectedDirector?.companyRocData?.CIN || '';
			newBasicDetails.profileGeoLocation = (Object.keys(profilePicGeolocation)
				.length > 0 &&
				profilePicGeolocation) || {
				address:
					selectedDirector?.address ||
					selectedDirector?.profileGeoLocation?.address,
				lat: selectedDirector?.lat,
				long: selectedDirector?.long,
				timestamp: selectedDirector?.timestamp,
			};
			newBasicDetails.geotaggingMandatory = mandatoryGeoTag;
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
			// if (addNewDirectorKey) {
			dispatch(
				getDirectors({
					loanRefId: newLoanRefId,
					isSelectedProductTypeBusiness:
						selectedProduct?.isSelectedProductTypeBusiness,
				})
			);
			dispatch(setAddNewDirectorKey(''));
			// }
			setTimeout(() => {
				// to update after directors are fetched
				dispatch(setSelectedSectionId(nextSectionId));
				dispatch(setSelectedDirectorId(newDirectorId));
			}, 500);
			if (isGeoTaggingEnabled) {
				if (
					mandatoryGeoTag.length > 0 &&
					mandatoryGeoTag.includes('profileGeoLocation')
				) {
					// ITERATING OVER THE MANDATORY FIELDS AND
					// IF IN REDUX STORE DATA DOESNT PERSIST THROW ERROR
					// BUT ALLOW USER TO MOVE TO NEXT SECTION
					if (
						!selectedDirector.profileGeoLocation?.address &&
						!profilePicGeolocation?.address
					) {
						addToast({
							message: 'Mandatory Profile GeoLocation not captured',
							type: 'error',
						});
					}
				}

				// IF GEOTAGGING IS MANDATORY
				if (!geoLocation?.address) {
					addToast({
						message: 'Mandatory GeoLocation not captured',
						type: 'error',
					});
				}
			}
		} catch (error) {
			console.error('error-BasicDetails-onProceed-', {
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
	//
	// const basicDetailsFunc = () => {
	// 	console.log('hello');
	// };
	// const custmerIdFetch=()=>async e=>{

	// }

	// const performDedupeCheck = async data => {
	// 	setIsDedupeCheckModalOpen(true);
	// 	console.log('Hello Modal');
	// };

	const addCacheDocumentTemp = async file => {
		const newCacheDocumentTemp = _.cloneDeep(cacheDocumentsTemp);
		newCacheDocumentTemp.push(file);

		if (isGeoTaggingEnabled && file?.type === 'profilePic') {
			if (file?.file?.lat === 'null' || !file?.file.hasOwnProperty('lat')) {
				const geoLocationTag = {
					err: 'Geo Location Not Captured',
					hint: CONST.PROFILE_PIC_GEO_ERROR_HINT,
				};
				setProfilePicGeolocation(geoLocationTag);
			} else {
				const geoLocationTag = {
					lat: file?.file?.lat,
					long: file?.file?.long,
					address: file?.file?.address,
					timestamp: file?.file?.timestamp,
				};
				setProfilePicGeolocation(geoLocationTag);
			}
		}
		setCacheDocumentsTemp(newCacheDocumentTemp);
	};
	// console.log({ isApplicant });
	const onFetchFromCustomerId = async () => {
		// console.log('on-fetch-customer-id');
		if (formState?.values?.['income_type']?.length === 0) {
			addToast({
				type: 'error',
				message: 'Please select Income Type',
			});
			return;
		}
		try {
			setLoading(true);
			const reqBody = {
				customer_id: formState?.values?.['customer_id'],
				white_label_id: whiteLabelId,
				businesstype: formState?.values?.['income_type'],
				loan_product_id:
					selectedProduct?.product_id?.[formState?.values?.['income_type']],
				loan_product_details_id: selectedProduct?.id || undefined,
				parent_product_id: selectedProduct?.parent_id || undefined,
				loan_id: loanId,
				business_id: businessId,
				isApplicant,
				type_name: addNewDirectorKey || selectedDirector?.type_name,
				origin: API.ORIGIN,
			};
			const fetchDataRes = await axios.post(
				selectedDedupeData?.verify,
				reqBody,
				{
					headers: {
						Authorization: `Bearer ${userToken}`,
					},
				}
			);

			if (fetchDataRes?.data?.status === 'nok') {
				addToast({
					message:
						fetchDataRes?.data?.message ||
						'No Customer Data Found Against The Provided Customer ID',
					type: 'error',
				});
			}
			if (fetchDataRes?.data?.status === 'ok') {
				addToast({
					message: fetchDataRes?.data?.message || 'Data fetched successfull!',
					type: 'success',
				});
				redirectToProductPageInEditMode(fetchDataRes?.data);
			}
			// console.log({ fetchDataRes });
		} catch (err) {
			console.error(err.message);
			addToast({
				message:
					err?.response?.data?.message ||
					err?.response?.data?.Message ||
					err.message ||
					'Something went wrong. Please try again later!',
				type: 'error',
			});
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

	const removeCacheDocumentTemp = fieldName => {
		// console.log('removeCacheDocumentTemp-', { fieldName, cacheDocumentsTemp });
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

	const fetchDedupeCheckData = async () => {
		try {
			setIsDedupeCheckModalLoading(true);
			const dedupeReqBody = {
				isSelectedProductTypeBusiness:
					`${selectedProduct?.loan_request_type}` === '1',
				isSelectedProductTypeSalaried: false,
				object: {
					pan_no: formState?.values?.[CONST.PAN_NUMBER_FIELD_NAME] || '',
					date_of_birth: formState?.values?.[CONST.DOB_FIELD_NAME] || '',
					email_id: formState?.values?.[CONST.EMAIL_ID_FIELD_NAME] || '',
					mobile_number:
						formState?.values?.[CONST.MOBILE_NUMBER_FIELD_NAME] || '',
				},
				white_label_id: whiteLabelId,
			};

			const fetchDedupeRes = await axios.post(
				`${API.API_END_POINT}/dedupe_check`,
				dedupeReqBody
			);
			console.log(fetchDedupeRes, 'fetch dedupe res');
			if (fetchDedupeRes?.data?.status === 'ok') {
				// console.log('ok data');
				setDedupeModalData(fetchDedupeRes?.data?.data);
				// setDedupeModalData(prev => (prev = [{ ...fetchDedupeRes?.data }]));
			}
		} catch (error) {
			console.error('Error fetching Dedupe Data', error);
			addToast({
				message: 'Dedupe Data Fetch Failed',
				type: 'error',
			});
		} finally {
			setIsDedupeCheckModalLoading(false);
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

	const prefilledValues = field => {
		try {
			const isFormStateUpdated = formState?.values?.[field.name] !== undefined;
			if (isFormStateUpdated) {
				return formState?.values?.[field?.name];
			}
			const dedupeData =
				!completedSections?.includes(selectedSectionId) &&
				!!dedupePrefilledValues
					? dedupePrefilledValues
					: null;
			// console.log(sectionData);
			// console.log({
			// 	sectionData,
			// });
			const preData = {
				...sectionData?.director_details,
				...sectionData?.loan_request_Data,
				...passportData,
				passport_expiry_date:
					passportData?.valid_till || passportData?.passport_expiry_date || '',
				title:
					sectionData?.director_details?.title ||
					sectionData?.business_data?.title,
				first_name: sectionData?.director_details?.dfirstname,
				last_name: sectionData?.director_details?.dlastname,
				business_email: sectionData?.director_details?.demail,
				customer_id:
					sectionData?.director_details?.additional_cust_id ||
					sectionData?.director_details?.customer_id ||
					'',
				contactno:
					sectionData?.director_details?.dcontact || dedupeData?.mobile_no,
				businesspancardnumber:
					sectionData?.business_data?.businesspancardnumber ||
					sectionData?.business_details?.businesspancardnumber ||
					dedupeData?.pan_number,
				// martial_status:
				marital_status: isNullFunction(
					sectionData?.director_details?.marital_status
				),
				residence_status: isNullFunction(
					sectionData?.director_details?.residence_status
				),
				// businesstype:
				// 	sectionData?.director_details?.income_type === 0
				// 		? '0'
				// 		: `${sectionData?.director_details?.income_type || ''}` ||
				// 		  dedupeData?.businesstype === 0
				// 		? '0'
				// 		: `${dedupeApiData?.businesstype}`, //to be removed if madhuri changes in the configuration
				businesstype:
					sectionData?.director_details?.income_type === 0
						? '0'
						: sectionData?.director_details?.income_type
						? `${sectionData?.director_details?.income_type}`
						: dedupeData?.businesstype === 0
						? '0'
						: dedupeData?.businesstype
						? `${dedupeData?.businesstype}`
						: '',

				// customer_id:sectionData?director_details?.customer_id||dedupeData?.customer_id,
			};

			// TEST MODE
			if (isTestMode && CONST.initialFormState?.[field?.name]) {
				return CONST.initialFormState?.[field?.name];
			}
			// -- TEST MODE

			if (field?.name === CONST.PROFILE_UPLOAD_FIELD_NAME) return;

			if (preData?.[field?.db_key]) return preData?.[field?.db_key];

			return field?.value || '';
		} catch (err) {
			console.error('error-BusinessDetials', {
				error: err,
				res: err?.response?.data || '',
			});
		}
	};

	const fetchProfilePicGeoLocationData = async fetchRes => {
		// to fetch the geoLocation of the profile pic
		try {
			setFetchingAddress(true);
			const fetchedProfilePicData =
				fetchRes?.data?.data?.director_details?.customer_picture;
			if (
				fetchedProfilePicData &&
				Object.keys(fetchedProfilePicData)?.length > 0
			) {
				if (!!fetchedProfilePicData?.lat && !!fetchedProfilePicData?.long) {
					const reqBody = {
						lat: fetchedProfilePicData?.lat,
						long: fetchedProfilePicData?.long,
						director_id: selectedDirectorId,
					};
					const profileGeoLocationRes = await axios.post(
						API.GEO_LOCATION,
						reqBody,
						{
							headers: {
								Authorization: `Bearer ${userToken}`,
							},
						}
					);
					if (profileGeoLocationRes?.data?.data?.timestamp) {
						profileGeoLocationRes.data.data.timestamp =
							fetchedProfilePicData?.lat_long_timestamp;
					}
					setProfilePicGeolocation(profileGeoLocationRes?.data?.data);
					dispatch(setProfileGeoLocation(profileGeoLocationRes?.data?.data));
				} else {
					setProfilePicGeolocation({
						err: 'Geo Location Not Captured',
						hint: CONST.PROFILE_PIC_GEO_ERROR_HINT,
					});
					dispatch(
						setProfileGeoLocation({
							err: 'Geo Location Not Captured',
							hint: CONST.PROFILE_PIC_GEO_ERROR_HINT,
						})
					);
				}
			}
		} catch (err) {
			console.error({
				error: err.message,
				location: 'geo-location-profile-pic-basic-details',
			});
		} finally {
			setFetchingAddress(false);
		}
	};
	// working one
	const onAddDirector = async key => {
		// console.log({ key });
		try {
			setLoading(true);
			const isTokenValid = await validateToken();
			if (isTokenValid === false) return;
			// call login api only once
			// TODO: varun do not call this api when RM is creating loan
			let newBorrowerUserId = '';

			if (!isEditOrViewLoan && !borrowerUserId) {
				const loginCreateUserReqBody = {
					email: formState?.values?.email || '',
					white_label_id: whiteLabelId,
					source: API.APP_CLIENT,
					name: formState?.values?.first_name,
					mobileNo: formState?.values?.mobile_no,
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

			// loan product is is only applicable for applicant
			// it should not be overritten when coapplicant is income type is different then applicant
			let selectedLoanProductId = '';
			// if (isApplicant) {
			selectedLoanProductId = selectedProduct?.product_id?.[selectedIncomeType];
			// }

			const profileField = selectedSection?.sub_sections?.[0]?.fields?.filter(
				field => field?.name === CONST.PROFILE_UPLOAD_FIELD_NAME
			)?.[0];
			const isNewProfileUploaded = !!profileUploadedFile?.file;
			let url = profileUploadedFile?.preview;
			if (profileField?.geo_tagging === true) {
				url = profileUploadedFile?.presignedUrl;
			}
			const profileUrl = url || selectedDirector?.customer_picture || '';
			const profileFieldValue = isNewProfileUploaded
				? {
						...profileUploadedFile?.file,
						doc_type_id: profileField?.doc_type?.[selectedIncomeType],
						is_delete_not_allowed:
							profileField?.is_delete_not_allowed === true ? true : false,
				  }
				: profileUrl;
			const crimeCheck = selectedProduct?.product_details?.crime_check || 'No';
			const basicDetailsReqBody = formatSectionReqBody({
				section: selectedSection,
				// crime_check: isCrimeCheckPresent,
				values: {
					...formState.values,
					app_coordinates:
						// selectedProfileField?.geo_tagging === true
						{
							lat: geoLocationData?.lat,
							long: geoLocationData?.long,
							timestamp: geoLocationData?.timestamp,
						},
					// : {},
					[CONST.PROFILE_UPLOAD_FIELD_NAME]: profileFieldValue,
				},
				app,
				selectedDirector,
				application,
				selectedLoanProductId,
			});

			// always pass borrower user id from login api for create case / from edit loan data
			basicDetailsReqBody.borrower_user_id =
				newBorrowerUserId || businessUserId;
			if (crimeCheck) {
				basicDetailsReqBody.data.basic_details.crime_check = crimeCheck;
			}
			if (addNewDirectorKey) {
				basicDetailsReqBody.data.basic_details.type_name = addNewDirectorKey;
			} else if (selectedDirector) {
				basicDetailsReqBody.data.basic_details.type_name =
					selectedDirector?.type_name;
			}
			const basicDetailsRes = await axios.post(
				`${API.API_END_POINT}/basic_details`,
				basicDetailsReqBody
			);
			const newLoanRefId = basicDetailsRes?.data?.data?.loan_data?.loan_ref_id;
			const newLoanId = basicDetailsRes?.data?.data?.loan_data?.id;
			const newBusinessId = basicDetailsRes?.data?.data?.business_data?.id;
			const newDirectorId = basicDetailsRes?.data?.data?.director_details?.id;
			const newBusinessUserId =
				basicDetailsRes?.data?.data?.business_data?.userid;
			const newCreatedByUserId =
				basicDetailsRes?.data?.data?.loan_data?.createdUserId;

			if (!newLoanRefId || !newLoanId || !newBusinessId) {
				throw new Error('Unable to create loan, Try after sometime');
			}

			if (isNewProfileUploaded) {
				const uploadedProfileRes =
					basicDetailsRes?.data?.data?.loan_document_data || null;
				const newProfileData = {
					...(uploadedProfileRes || {}),
					...profileUploadedFile,
					...(typeof profileFieldValue !== 'string' ? profileFieldValue : {}),
					directorId: newDirectorId,
					preview: profileUrl,
					file: null,
					isDocRemoveAllowed: false,
					category: CONST_SECTIONS.DOC_CATEGORY_KYC,
				};
				if (uploadedProfileRes?.id) {
					newProfileData.document_id = uploadedProfileRes?.id;
				}
				newProfileData.name =
					newProfileData?.filename ||
					newProfileData?.uploaded_doc_name ||
					newProfileData?.original_doc_name;
			}
			if (cacheDocumentsTemp?.length > 0) {
				try {
					const uploadCacheDocumentsTemp = [];
					cacheDocumentsTemp?.map(doc => {
						if (!doc?.requestId) return null;
						uploadCacheDocumentsTemp.push({
							...doc,
							request_id: doc?.requestId,
							classification_type:
								doc?.field?.name === CONST.PAN_UPLOAD_FIELD_NAME ? 'pan' : null,
							doc_type_id: doc?.field?.doc_type?.[selectedIncomeType],
							is_delete_not_allowed: true,
							director_id: newDirectorId,
							directorId: newDirectorId,
							preview: null,
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
			const newBasicDetails = {
				sectionId: selectedSectionId,
				sectionValues: {
					...formState.values,
					[CONST.PROFILE_UPLOAD_FIELD_DB_KEY]: profileUrl,
					[CONST.PROFILE_UPLOAD_FIELD_NAME]: profileUrl,
				},
			};
			newBasicDetails.directorId = newDirectorId;
			// TODO: shreyas work with director object and pass cin
			// newBasicDetails.cin = selectedDirector?.companyRocData?.CIN || '';
			newBasicDetails.profileGeoLocation = (Object.keys(profilePicGeolocation)
				.length > 0 &&
				profilePicGeolocation) || {
				address:
					selectedDirector?.address ||
					selectedDirector?.profileGeoLocation?.address,
				lat: selectedDirector?.lat,
				long: selectedDirector?.long,
				timestamp: selectedDirector?.timestamp,
			};
			newBasicDetails.geotaggingMandatory = mandatoryGeoTag;
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
			// if (addNewDirectorKey) {
			dispatch(
				getDirectors({
					loanRefId: newLoanRefId,
					isSelectedProductTypeBusiness:
						selectedProduct?.isSelectedProductTypeBusiness,
				})
			);
			dispatch(setAddNewDirectorKey(''));
			// }
			setTimeout(() => {
				// to update after directors are fetched
				// dispatch(setSelectedSectionId(nextSectionId));
				// dispatch(setSelectedDirectorId(newDirectorId));
			}, 500);
			if (isGeoTaggingEnabled) {
				if (
					mandatoryGeoTag.length > 0 &&
					mandatoryGeoTag.includes('profileGeoLocation')
				) {
					// ITERATING OVER THE MANDATORY FIELDS AND
					// IF IN REDUX STORE DATA DOESNT PERSIST THROW ERROR
					// BUT ALLOW USER TO MOVE TO NEXT SECTION
					if (
						!selectedDirector.profileGeoLocation?.address &&
						!profilePicGeolocation?.address
					) {
						addToast({
							message: 'Mandatory Profile GeoLocation not captured',
							type: 'error',
						});
					}
				}

				// IF GEOTAGGING IS MANDATORY
				if (!geoLocation?.address) {
					addToast({
						message: 'Mandatory GeoLocation not captured',
						type: 'error',
					});
				}
			}
			dispatch(setSelectedDirectorId(''));
			dispatch(setSelectedSectionId(CONST_SECTIONS.ADDRESS_DETAILS_SECTION_ID));
			dispatch(setSelectedSectionId(CONST_SECTIONS.BASIC_DETAILS_SECTION_ID));
			dispatch(setAddNewDirectorKey(key));
		} catch (error) {
			console.error('error-BasicDetails-onProceed-', {
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

	const fetchGeoLocationData = async fetchRes => {
		try {
			const appCoordinates =
				fetchRes?.data?.data?.director_details?.app_coordinates || {};

			if (
				// (!geoLocation || geoLocation?.err) &&
				appCoordinates &&
				Object.keys(appCoordinates)?.length > 0
			) {
				const reqBody = {
					lat: appCoordinates?.lat,
					long: appCoordinates?.long,
					director_id: selectedDirectorId,
				};
				const geoLocationRes = await axios.post(API.GEO_LOCATION, reqBody, {
					headers: {
						Authorization: `Bearer ${userToken}`,
					},
				});
				if (geoLocationRes?.data?.data?.timestamp) {
					geoLocationRes.data.data.timestamp =
						appCoordinates?.lat_long_timestamp;
				}
				dispatch(setGeoLocation(geoLocationRes?.data?.data));
				setGeoLocationData(geoLocationRes?.data?.data);
			}
		} catch (err) {
			console.error({
				error: err.message,
				location: 'geo-location-basic-details',
			});
		} finally {
			setFetchingAddress(false);
		}
	};

	// fetch section data starts
	const fetchSectionDetails = async () => {
		try {
			setFetchingSectionData(true);
			const fetchRes = await axios.get(`${API_END_POINT}/basic_details`, {
				params: {
					loan_ref_id: loanRefId,
					director_id: selectedDirectorId,
				},
			});
			if (fetchRes?.data?.status === 'ok') {
				setSectionData(isNullFunction(fetchRes?.data?.data));

				// step1 - P0 - setting values for edit loan
				dispatch(
					setLoanIds({
						businessId: fetchRes?.data?.data?.business_data?.id,
						loanId: fetchRes?.data?.data?.loan_request_Data?.id,
						businessUserId: fetchRes?.data?.data?.business_data?.userid,
						loanProductId:
							fetchRes?.data?.data?.loan_request_Data?.loan_product_id,
						createdByUserId:
							fetchRes?.data?.data?.loan_request_Data?.createdUserId,
					})
				);

				// step2 - P1 - update completed sections
				if (
					isEditOrViewLoan &&
					`${selectedProduct?.loan_request_type}` === '2'
				) {
					const tempCompletedSections = parseJSON(
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
				}

				const fetchedProfilePicData =
					fetchRes?.data?.data?.director_details?.customer_picture;

				// in case of profile uploaded with geo-location disabled mode, since no lat-long will be there, in response we will get customer_picture inside director_details without doc_id
				// and since we need doc_id to call deleteDocument API to delete Profile Image, we can take that doc_id from loan_request_Data > loan_document > profileImage doc
				const profileId = fetchRes?.data?.data?.loan_request_Data?.loan_document?.filter(
					loanDoc =>
						`${selectedDirectorId}` === `${loanDoc?.directorId}` &&
						selectedProfileField?.doc_type[selectedDirector?.income_type] ===
							loanDoc?.doctype
				)?.[0]?.id;

				if (fetchedProfilePicData)
					fetchedProfilePicData.doc_id =
						fetchedProfilePicData?.doc_id || profileId;

				if (
					fetchedProfilePicData &&
					Object.keys(fetchedProfilePicData)?.length > 0
				) {
					setFetchedProfilePic(fetchedProfilePicData);
				}
				if (isGeoTaggingEnabled && selectedProfileField?.geo_tagging) {
					// to fetch profile pic geo location
					fetchProfilePicGeoLocationData(fetchRes);
				}

				// to fetch the geoLocation
				if (
					!!geoLocationData &&
					Object.keys(geoLocationData)?.length <= 0 &&
					!geoLocation?.address
				) {
					fetchGeoLocationData(fetchRes);
				}
				const latLongTimestamp =
					fetchRes?.data?.data?.director_details?.app_coordinates || {};
				if (selectedProduct?.isSelectedProductTypeBusiness) {
					// console.log('sme-edit-mode');
					fetchGeoLocationForSme(latLongTimestamp);
				}
				if (!!geoLocationData && Object.keys(geoLocationData).length === 0) {
					dispatch(
						setGeoLocation({
							err: 'Geo Location Not Captured',
							hint: CONST.APPLICATION_GEO_ERROR_HINT,
						})
					);
					setGeoLocationData({
						err: 'Geo Location Not Captured',
						hint: CONST.APPLICATION_GEO_ERROR_HINT,
					});
				}
			}
		} catch (error) {
			console.error('error-fetchSectionDetails-', error);
		} finally {
			setFetchingSectionData(false);
		}
	};

	// fetch section data ends
	// useLayoutEffect(() => {
	// 	setCacheDocumentsTemp([]);
	// 	resetForm();
	// 	// eslint-disable-next-line react-hooks/exhaustive-deps
	// }, []);
	const fetchGeoLocationForSme = async appCoordinates => {
		// Special case for SME FLow - Fetch geolocation if not saved - starts
		try {
			setFetchingGeoLocation(true);
			if (
				isGeoTaggingEnabled &&
				typeof appCoordinates === 'object' &&
				Object.values(appCoordinates)?.length === 0 &&
				typeof geoLocation === 'object' &&
				Object.values(geoLocation)?.length === 0
			) {
				// console.log('in', {
				// 	isGeoTaggingEnabled,
				// 	appCoordinates,
				// 	isbusiness: selectedProduct?.isSelectedProductTypeBusiness,
				// });
				const coordinates = await getGeoLocation();
				const reqBody = {
					lat: coordinates?.latitude,
					long: coordinates?.longitude,
				};

				const geoLocationRes = await axios.post(API.GEO_LOCATION, reqBody, {
					headers: {
						Authorization: `Bearer ${userToken}`,
					},
				});
				// console.log({ geoLocationRes });
				dispatch(setGeoLocation(geoLocationRes?.data?.data));
			}
		} catch (err) {
			console.error({
				error: err.message,
				location: 'geo-location-fetch-failed-SME',
			});
		} finally {
			setFetchingGeoLocation(false);
		}
		// Special case for SME FLow - Fetch geolocation if not saved - ends
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

		// new fetch section data starts
		if (
			!!loanRefId &&
			// !!selectedDirector &&
			// !!selectedDirector?.sections?.includes(CONST.BASIC_DETAILS_SECTION_ID) &&
			selectedDirectorId
		)
			fetchSectionDetails();
		// new fetch section data ends

		// sme flow - special case
		if (
			selectedProduct?.isSelectedProductTypeBusiness &&
			!completedSections?.includes(selectedSectionId)
		) {
			// console.log('create-mode');
			fetchGeoLocationForSme(geoLocation);
		}

		if (
			isGeoTaggingEnabled &&
			selectedDirector?.profileGeoLocation &&
			Object.keys(selectedDirector?.profileGeoLocation).length > 0
		) {
			setProfilePicGeolocation(selectedDirector?.profileGeoLocation);
		}

		// async function fetchGeoLocationData() {
		// 	try {
		// 		// FROM APP_COORDINATES IN GET_DETAILS_WITH_LOAN_REF_ID API, LAT, LONG IS RECEIVED
		// 		setFetchingAddress(true);
		// 		if (!geoLocation.lat && !geoLocation.long) return;
		// 		const reqBody = {
		// 			lat: geoLocation.lat,
		// 			long: geoLocation.long,
		// 		};

		// 		const geoLocationRes = await axios.post(API.GEO_LOCATION, reqBody, {
		// 			headers: {
		// 				Authorization: `Bearer ${userToken}`,
		// 			},
		// 		});

		// 		dispatch(
		// 			setGeoLocation({
		// 				lat: geoLocation.lat,
		// 				long: geoLocation.long,
		// 				timestamp: geoLocation?.lat_long_timestamp,
		// 				address: geoLocationRes?.data?.data?.address,
		// 			})
		// 		);
		// 		setGeoLocationData({
		// 			lat: geoLocation.lat,
		// 			long: geoLocation.long,
		// 			timestamp: geoLocation?.lat_long_timestamp,
		// 			address: geoLocationRes?.data?.data?.address,
		// 		});
		// 	} catch (error) {
		// 		console.error('fetchGeoLocationData ~ error:', error);
		// 		dispatch(setGeoLocation({ err: 'Geo Location Not Captured' }));
		// 		setGeoLocationData({
		// 			err: 'Geo Location Not Captured',
		// 		});
		// 		addToast({
		// 			message:
		// 				error?.response?.data?.message ||
		// 				error?.message ||
		// 				'Geo Location Not Captured',
		// 			type: 'error',
		// 		});
		// 	} finally {
		// 		setFetchingAddress(false);
		// 	}
		// }

		// async function fetchProfilePicGeoLocationData() {
		// 	try {
		// 		// SELECTED_APPLICANT (FROM DIRECTOR DETAILS)
		// 		// WE GET LAT LONG WHICH CORRESPONDS TO PROFILE UPLOAD
		// 		setFetchingAddress(true);
		// 		console.log(
		// 			'🚀 ~ file: BasicDetails.js:757 ~ fetchProfilePicGeoLocationData ~ selectedDirector:',
		// 			selectedDirector
		// 		);
		// 		if (!selectedDirector?.lat && !selectedDirector?.lat) {
		// 			dispatch(
		// 				setProfileGeoLocation({
		// 					err: 'Geo Location Not Captured',
		// 				})
		// 			);
		// 			setProfilePicGeolocation({
		// 				err: 'Geo Location Not Captured',
		// 			});
		// 			return;
		// 		}

		// 		const reqBody = {
		// 			lat: selectedDirector?.lat,
		// 			long: selectedDirector?.long,
		// 		};

		// 		const geoPicLocationRes = await axios.post(API.GEO_LOCATION, reqBody, {
		// 			headers: {
		// 				Authorization: `Bearer ${userToken}`,
		// 			},
		// 		});
		// 		dispatch(
		// 			setProfileGeoLocation({
		// 				lat: selectedDirector?.lat,
		// 				long: selectedDirector?.long,
		// 				timestamp: selectedDirector?.timestamp,
		// 				address: geoPicLocationRes?.data?.data?.address,
		// 			})
		// 		);
		// 		setProfilePicGeolocation({
		// 			lat: selectedDirector?.lat,
		// 			long: selectedDirector?.long,
		// 			timestamp: selectedDirector?.timestamp,
		// 			address: geoPicLocationRes?.data?.data?.address,
		// 		});
		// 	} catch (error) {
		// 		console.error('fetchProfilePicGeoLocationData ~ error:', error);
		// 	} finally {
		// 		setFetchingAddress(false);
		// 	}
		// }

		// BASED ON PERMISSION SET GEOTAGGING FOR APPLICATION AND PROFILE PIC
		// if (isGeoTaggingEnabled && Object.keys(selectedDirector).length > 0) {
		// 	if (
		// 		!!geoLocationData &&
		// 		Object.keys(geoLocationData)?.length > 0 &&
		// 		!geoLocation?.address
		// 	) {
		// 		fetchGeoLocationData();
		// 	}
		// 	if (!!geoLocationData && Object.keys(geoLocationData).length === 0) {
		// 		dispatch(setGeoLocation({ err: 'Geo Location Not Captured' }));
		// 		setGeoLocationData({ err: 'Geo Location Not Captured' });
		// 	}
		// 	if (
		// 		selectedDirector?.customer_picture &&
		// 		Object.keys(selectedDirector?.profileGeoLocation).length <= 0
		// 	) {
		// 		// fetchProfilePicGeoLocationData();
		// 		console.log('true...........');
		// 	}
		// }

		// RUN THROUGH SECTION AND FETCH WHERE GEO_TAGGING IS MANDATORY AND
		// CORRESPONDING REDUX STATE KEY IS STORED IN MANDATORY ARRAY

		function saveMandatoryGeoLocation() {
			let arr = [];
			selectedSection?.sub_sections?.map((sub_section, sectionIndex) => {
				sub_section?.fields?.map((field, fieldIndex) => {
					if (field?.geo_tagging) {
						let reduxStoreKey = '';
						if (field?.db_key === 'customer_picture') {
							reduxStoreKey = 'profileGeoLocation';
						}
						arr.push(reduxStoreKey);
					}
					return null;
				});
				return null;
			});
			// console.log(arr, 'arr');
			setMandatoryGeoTag(oldArray => [...oldArray, ...arr]);
		}

		saveMandatoryGeoLocation();
		// eslint-disable-next-line
	}, []);

	// trial starts
	let displayAddCoApplicantCTA = false;
	// console.log({ selectedSection });
	if (selectedSection?.add_co_applicant_visibility === true) {
		displayAddCoApplicantCTA = true;
	}
	// trial ends

	const incomeTypeField =
		selectedSection?.sub_sections
			?.filter(item => item?.id === CONST.BASIC_DETAILS_SECTION_ID)?.[0]
			?.fields?.filter(
				field => field?.name === CONST.INCOME_TYPE_FIELD_NAME
			)?.[0] || {};

	// console.log('BasicDetails-allstates', {
	// 	isPanNumberExist,
	// 	selectedProfileField,
	// 	isProfileMandatory,
	// 	selectedPanUploadField,
	// 	isPanUploadMandatory,
	// 	panUploadedFile,
	// 	profileUploadedFile,
	// 	app,
	// 	application,
	// 	selectedDirector,
	// 	cacheDocumentsTemp,
	// 	addNewDirectorKey,
	// 	formState,
	// 	isApplicant,
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

	// console.log(formState.values, 'form state');
	// const [isSelfieAlertModalOpen, setIsSelfieAlertModalOpen] = useState(false);
	return (
		<UI_SECTIONS.Wrapper>
			{fetchingSectionData || fetchingGeoLocation ? (
				<Loading />
			) : (
				<>
					<ConfirmModal
						// type='Income'
						type={
							incomeTypeField?.placeholder
								? incomeTypeField?.placeholder
								: 'Income'
						}
						show={isIncomeTypeConfirmModalOpen}
						onClose={setIsIncomeTypeConfirmModalOpen}
						ButtonProceed={ButtonProceed}
					/>
					<Modal
						show={isDedupeCheckModalOpen}
						onClose={() => {
							setIsDedupeCheckModalOpen(false);
						}}
						customStyle={{
							width: '85%',
							minWidth: '65%',
							minHeight: 'auto',
						}}
					>
						{console.log(dedupeModalData)}
						<section>
							<UI.ImgClose
								onClick={() => {
									setIsDedupeCheckModalOpen(false);
								}}
								src={imgClose}
								alt='close'
							/>
							{isDedupeCheckModalLoading ? (
								<Loading />
							) : (
								<DedupeAccordian
									dedupedata={dedupeModalData}
									data={response}
									fetchDedupeCheckData={fetchDedupeCheckData}
								/>
							)}
						</section>
					</Modal>
					{!isTokenValid && <SessionExpired show={!isTokenValid} />}
					{selectedSection?.sub_sections?.map((sub_section, sectionIndex) => {
						return (
							<Fragment key={`section-${sectionIndex}-${sub_section?.id}`}>
								{sub_section?.name ? (
									<UI_SECTIONS.SubSectionHeader>
										{sub_section.name}
									</UI_SECTIONS.SubSectionHeader>
								) : null}
								{isCountryIndia && sub_section?.id !== 'family_details' ? (
									<Hint
										hint='Please upload the document with KYC image in Portrait Mode'
										hintIconName='Portrait Mode'
									/>
								) : null}
								<UI_SECTIONS.FormWrapGrid>
									{sub_section?.fields?.map((eachField, fieldIndex) => {
										const field = _.cloneDeep(eachField);
										if (
											!isFieldValid({
												field,
												formState,
												isApplicant,
											})
										) {
											return null;
										}
										// disable fields based on config ends
										if (
											field.type === 'file' &&
											field.name === CONST.PROFILE_UPLOAD_FIELD_NAME
										) {
											prefilledProfileUploadValue = prefilledValues(field);

											return (
												<UI_SECTIONS.FieldWrapGrid
													style={{
														gridRow: 'span 3',
														height: '100%',
													}}
													key={`field-${fieldIndex}-${field.name}`}
												>
													<UI.ProfilePicWrapper>
														<ProfileUpload
															field={field}
															value={prefilledProfileUploadValue}
															isPanNumberExist={isPanNumberExist}
															isPanMandatory={isPanUploadMandatory}
															isFormSubmited={formState?.submit?.isSubmited}
															isProfileMandatory={isProfileMandatory}
															uploadedFile={profileUploadedFile}
															cacheDocumentsTemp={cacheDocumentsTemp}
															addCacheDocumentTemp={addCacheDocumentTemp}
															selectedApplicant={selectedDirector}
															removeCacheDocumentTemp={removeCacheDocumentTemp}
															onChangeFormStateField={onChangeFormStateField}
															isDisabled={isViewLoan}
															isTag={true}
															geoLocationAddress={
																profilePicGeolocation || {
																	address:
																		selectedDirector?.profileGeoLocation
																			?.address,
																	lat: selectedDirector?.lat,
																	long: selectedDirector?.long,
																	timestamp: selectedDirector?.timestamp,
																}
															}
															setImageLoading={setLoading}
															setFetchedProfilePic={setFetchedProfilePic}
														/>
													</UI.ProfilePicWrapper>
												</UI_SECTIONS.FieldWrapGrid>
											);
										}

										if (
											field.type === 'file' &&
											field.name === CONST.PAN_UPLOAD_FIELD_NAME
										) {
											let panErrorMessage =
												((formState?.submit?.isSubmited ||
													formState?.touched?.[field.name]) &&
													formState?.error?.[field.name]) ||
												'';
											// console.log('pancard-error-msg-', {
											// 	panErrorMessage,
											// });
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
											// console.log('pancard-error-msg-', {
											// 	panErrorColorCode,
											// 	panErrorMessage,
											// });
											return (
												<UI_SECTIONS.FieldWrapGrid
													key={`field-${fieldIndex}-${field.name}`}
												>
													<UI.ProfilePicWrapper>
														<PanUpload
															field={field}
															value={prefilledValues(field)}
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
															isDisabled={isViewLoan}
															selectedDirector={selectedDirector}
															selectedSectionId={selectedSectionId}
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

										if (!field.visibility || !field.name || !field.type)
											return null;
										const newValue = prefilledValues(field);
										// console.log(field);
										// if (!!field.sub_fields) {
										// 	console.log(
										// 		prefilledValues(field.sub_fields[0]),
										// 		'sub-fields'
										// 	);
										// 	console.log(prefilledValues(field, 'fields'));
										// }
										let newValueSelectField;
										if (!!field?.sub_fields) {
											newValueSelectField = prefilledValues(
												field?.sub_fields?.[0]
											);
										}

										const customFieldProps = {};
										const customFieldPropsSubfields = {};

										// customFieldProps.onClick = basicDetailsFunc;
										if (field?.name === CONST.MOBILE_NUMBER_FIELD_NAME) {
											customFieldProps.rules = {
												...field.rules,
												is_zero_not_allowed_for_first_digit: true,
											};
										}

										if (
											isPanUploadMandatory &&
											!isPanNumberExist &&
											field?.name !== CONST.EXISTING_CUSTOMER_FIELD_NAME
										) {
											customFieldProps.disabled = true;
										}
										if (
											isPanUploadMandatory &&
											isPanNumberExist &&
											field.name === CONST.PAN_NUMBER_FIELD_NAME
										) {
											customFieldProps.disabled = true;
										}
										if (
											selectedDirector?.directorId &&
											selectedDirector?.sections?.includes(
												CONST_SECTIONS.BASIC_DETAILS_SECTION_ID
											) &&
											field.name === CONST.INCOME_TYPE_FIELD_NAME
										) {
											customFieldProps.disabled = true;
										}
										if (isViewLoan) {
											customFieldProps.disabled = true;
										}

										if (field?.name === CONST.PAN_NUMBER_FIELD_NAME) {
											customFieldPropsSubfields.loading = loading;
											customFieldProps.disabled =
												loading ||
												!!completedSections?.includes(selectedSectionId);
											customFieldPropsSubfields.onClick = event => {
												onPanEnter(formState.values?.['pan_number']);
											};
											customFieldPropsSubfields.disabled =
												loading ||
												!!completedSections?.includes(selectedSectionId);
										}

										if (field?.name === CONST.CUSTOMER_ID_FIELD_NAME) {
											customFieldPropsSubfields.onClick = onFetchFromCustomerId;
											customFieldPropsSubfields.loading = loading;
											customFieldPropsSubfields.disabled =
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
												'Select the income type to fetch the data from Customer ID.';
										}
										if (field?.name === CONST.DOB_FIELD_NAME) {
											customFieldPropsSubfields.value =
												getTotalYearsCompleted(
													moment(
														formState?.values?.[CONST.DOB_FIELD_NAME]
													).format('YYYY-MM-DD')
												) || '';
										}

										// console.log({
										// 	formState,
										// 	selectedProduct,
										// 	selectedDedupeData,
										// });
										// To be verified once the config changes are done
										if (`${formState?.values?.['income_type']}`?.length === 0) {
											if (field?.name === CONST.CUSTOMER_ID_FIELD_NAME) {
												field.disabled = true;
											}
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
															// ...customFieldProps,
															...customFieldPropsSubfields,
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
															// ...customFieldProps,
															...customFieldPropsSubfields,
														})}
												</div>
												{(formState?.submit?.isSubmited ||
													formState?.touched?.[field.name]) &&
													formState?.error?.[field.name] && (
														<UI_SECTIONS.ErrorMessage>
															{formState?.error?.[field.name]}
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
										);
									})}
								</UI_SECTIONS.FormWrapGrid>
							</Fragment>
						);
					})}
					{isGeoTaggingEnabled && (
						<AddressDetailsCard
							address={geoLocationData?.address || geoLocation?.address}
							latitude={geoLocationData?.lat || geoLocation?.lat}
							longitude={geoLocationData?.long || geoLocation?.long}
							timestamp={geoLocationData?.timestamp || geoLocation?.timestamp}
							err={geoLocationData?.err || geoLocation?.err}
							hint={geoLocationData?.hint || geoLocation?.hint}
							showCloseIcon={false}
							customStyle={{
								marginBottom: '30px',
							}}
							embedInImageUpload={false}
						/>
					)}

					<UI_SECTIONS.Footer>
						{!isViewLoan && (
							<Button
								fill
								name={
									fetchingAddress ? 'Fetching Address...' : 'Save and Proceed'
								}
								isLoader={loading}
								disabled={loading || fetchingAddress}
								onClick={handleSubmit(() => {
									let isProfileError = false;
									if (isProfileMandatory && profileUploadedFile === null) {
										isProfileError = true;
									}
									if (
										isEditOrViewLoan &&
										prefilledProfileUploadValue &&
										typeof prefilledProfileUploadValue === 'string'
									) {
										isProfileError = false;
									}
									if (isProfileError) {
										// console.log('profile-error-', {
										// 	isProfileError,
										// 	profileUploadedFile,
										// 	isEditOrViewLoan,
										// 	value:
										// 		formState?.values?.[
										// 			CONST.PAN_UPLOAD_FIELD_NAME
										// 		],
										// });
										addToast({
											message: 'Profile is mandatory',
											type: 'error',
										});
										return;
									}
									const presentPanFile = tempPanUploadedFile || panUploadedFile;
									if (!isTestMode && isPanUploadMandatory && !presentPanFile) {
										addToast({
											message: 'Pan upload is mandatory',
											type: 'error',
										});
										return;
									}
									if (!isPanNumberExist && isPanUploadMandatory) {
										addToast({
											message: 'Pan Number is mandatory',
											type: 'error',
										});
										return;
									}
									// director id will be present in case of aplicant / coapplicant if they move out of basic details page
									// so avoid opening income type popup at below condition
									if (isEditOrViewLoan || !!selectedDirector?.directorId) {
										// if in edit loan, adding a coapplicant since the selected director will be empty, this popup will trigger
										if (
											!selectedDirector?.directorId ||
											!selectedDirector?.sections?.includes(selectedSectionId)
										) {
											setIsIncomeTypeConfirmModalOpen(true);
											return;
										}
										onSaveAndProceed();
										return;
									}
									setIsIncomeTypeConfirmModalOpen(true);
								})}
							/>
						)}
						{selectedSection?.show_dedupe_button && (
							<>
								<Button
									name='Open Dedupe'
									onClick={() => {
										setIsDedupeCheckModalOpen(true);
										fetchDedupeCheckData();
									}}
									fill
								/>
							</>
						)}
						<NavigateCTA previous={false} directorSelected={selectedDirector} />
						{displayAddCoApplicantCTA && (
							<Button
								fill
								name='Add Co-Applicant'
								isLoader={loading}
								disabled={loading}
								onClick={handleSubmit(() => {
									// dispatch(setAddNewDirectorKey('Co-applicant'));
									let isProfileError = false;
									if (isProfileMandatory && profileUploadedFile === null) {
										isProfileError = true;
									}
									if (
										isEditOrViewLoan &&
										prefilledProfileUploadValue &&
										typeof prefilledProfileUploadValue === 'string'
									) {
										isProfileError = false;
									}
									if (isProfileError) {
										// console.log('profile-error-', {
										// 	isProfileError,
										// 	profileUploadedFile,
										// 	isEditOrViewLoan,
										// 	value:
										// 		formState?.values?.[
										// 			CONST.PAN_UPLOAD_FIELD_NAME
										// 		],
										// });
										addToast({
											message: 'Profile is mandatory',
											type: 'error',
										});
										return;
									}
									const presentPanFile = tempPanUploadedFile || panUploadedFile;
									if (!isTestMode && isPanUploadMandatory && !presentPanFile) {
										addToast({
											message: 'Pan upload is mandatory',
											type: 'error',
										});
										return;
									}
									if (!isPanNumberExist && isPanUploadMandatory) {
										addToast({
											message: 'Pan Number is mandatory',
											type: 'error',
										});
										return;
									}
									// director id will be present in case of aplicant / coapplicant if they move out of basic details page
									// so avoid opening income type popup at below condition
									// if (isEditOrViewLoan || !!selectedDirector?.directorId) {
									// 	// if in edit loan, adding a coapplicant since the selected director will be empty, this popup will trigger
									// 	if (!selectedDirector?.directorId) {
									// 		setIsIncomeTypeConfirmModalOpen(true);
									// 		return;
									// 	}
									// 	// onSaveAndProceed();
									// 	onAddDirector('Co-applicant');

									// 	return;
									// }
									onAddDirector('Co-applicant');

									// setIsIncomeTypeConfirmModalOpen(true);
								})}
							/>
						)}

						{selectedProduct?.isSelectedProductTypeBusiness &&
							!isViewLoan &&
							// !initialDirectorsUpdated &&
							selectedSection?.footer?.fields?.map((field, fieldIndex) => {
								if (!field?.business_income_type_id?.includes(+businessType))
									return null;
								return (
									<Button
										key={`field${fieldIndex}`}
										fill
										name={field?.name}
										isLoader={loading}
										disabled={loading}
										onClick={handleSubmit(() => {
											let isProfileError = false;
											if (isProfileMandatory && profileUploadedFile === null) {
												isProfileError = true;
											}
											if (
												isEditOrViewLoan &&
												prefilledProfileUploadValue &&
												typeof prefilledProfileUploadValue === 'string'
											) {
												isProfileError = false;
											}
											if (isProfileError) {
												// console.log('profile-error-', {
												// 	isProfileError,
												// 	profileUploadedFile,
												// 	isEditOrViewLoan,
												// 	value:
												// 		formState?.values?.[
												// 			CONST.PAN_UPLOAD_FIELD_NAME
												// 		],
												// });
												addToast({
													message: 'Profile is mandatory',
													type: 'error',
												});
												return;
											}
											const presentPanFile =
												tempPanUploadedFile || panUploadedFile;
											if (
												!isTestMode &&
												isPanUploadMandatory &&
												!presentPanFile
											) {
												addToast({
													message: 'Pan upload is mandatory',
													type: 'error',
												});
												return;
											}
											if (!isPanNumberExist && isPanUploadMandatory) {
												addToast({
													message: 'Pan Number is mandatory',
													type: 'error',
												});
												return;
											}
											// director id will be present in case of aplicant / coapplicant if they move out of basic details page
											// so avoid opening income type popup at below condition
											// if (isEditOrViewLoan || !!selectedDirector?.directorId) {
											// 	// if in edit loan, adding a coapplicant since the selected director will be empty, this popup will trigger
											// 	if (!selectedDirector?.directorId) {
											// 		setIsIncomeTypeConfirmModalOpen(true);
											// 		return;
											// 	}
											// 	// onSaveAndProceed();
											// 	onAddDirectorSme(field?.key);

											// 	return;
											// }
											onAddDirectorSme(field?.key);

											// setIsIncomeTypeConfirmModalOpen(true);
										})}
									/>
								);
							})}
						{/* New footer buttons for crisil flow ends
						 */}
					</UI_SECTIONS.Footer>
				</>
			)}
		</UI_SECTIONS.Wrapper>
	);
};

export default BasicDetails;
