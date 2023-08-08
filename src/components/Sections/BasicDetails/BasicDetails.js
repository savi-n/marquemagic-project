import React, { Fragment, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import queryString from 'query-string';
import _ from 'lodash';

import useForm from 'hooks/useFormIndividual';
import Button from 'components/Button';
import ProfileUpload from './ProfileUpload';
import PanUpload from './PanUpload';
import Hint from 'components/Hint';
import ConfirmModal from 'components/modals/ConfirmModal';
import AddressDetailsCard from 'components/AddressDetailsCard/AddressDetailsCard';
import NavigateCTA from 'components/Sections/NavigateCTA';

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
import { scrollToTopRootElement, isNullFunction } from 'utils/helper';

const BasicDetails = props => {
	const { app, application } = useSelector(state => state);
	const { directors, selectedDirectorId, addNewDirectorKey } = useSelector(
		state => state.directors
	);
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
	} = useForm();

	const [isTokenValid, setIsTokenValid] = useState(true);
	const [fetchingSectionData, setFetchingSectionData] = useState(false);
	const [sectionData, setSectionData] = useState({});
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

	const onSaveAndProceed = async () => {
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

	const addCacheDocumentTemp = async file => {
		const newCacheDocumentTemp = _.cloneDeep(cacheDocumentsTemp);
		newCacheDocumentTemp.push(file);

		if (isGeoTaggingEnabled && file?.type === 'profilePic') {
			if (file?.file?.lat === 'null' || !file?.file.hasOwnProperty('lat')) {
				const geoLocationTag = {
					err: 'Geo Location Not Captured',
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
			// console.log(sectionData);
			// console.log({
			// 	sectionData,
			// });
			const preData = {
				...sectionData?.director_details,
				...sectionData?.loan_request_Data,
				...passportData,
				title: sectionData?.business_data?.title,
				first_name: sectionData?.director_details?.dfirstname,
				last_name: sectionData?.director_details?.dlastname,
				business_email: sectionData?.director_details?.demail,
				contactno: sectionData?.director_details?.dcontact,
				businesspancardnumber:
					sectionData?.business_data?.businesspancardnumber,
					// martial_status:
					marital_status:isNullFunction(sectionData?.director_details?.marital_status),
					residence_status: isNullFunction(sectionData?.director_details?.residence_status),
				businesstype:
					sectionData?.director_details?.income_type === 0
						? '0'
						: `${sectionData?.director_details?.income_type || ''}`, //to be removed if madhuri changes in the configuration
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
				if (!!fetchedProfilePicData?.lat) {
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
					setProfilePicGeolocation(profileGeoLocationRes?.data?.data);
					dispatch(setProfileGeoLocation(profileGeoLocationRes?.data?.data));
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

	const fetchGeoLocationData = async fetchRes => {
		try {
			const appCoordinates =
				fetchRes?.data?.data?.director_details?.app_coordinates;

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

				if (!!geoLocationData && Object.keys(geoLocationData).length === 0) {
					dispatch(setGeoLocation({ err: 'Geo Location Not Captured' }));
					setGeoLocationData({ err: 'Geo Location Not Captured' });
				}
			}
		} catch (error) {
			console.error('error-fetchSectionDetails-', error);
		} finally {
			setFetchingSectionData(false);
		}
	};

	// fetch section data ends

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
	// const [isSelfieAlertModalOpen, setIsSelfieAlertModalOpen] = useState(false);
	return (
		<UI_SECTIONS.Wrapper>
			{fetchingSectionData ? (
				<Loading />
			) : (
				<>
					<ConfirmModal
						type='Income'
						show={isIncomeTypeConfirmModalOpen}
						onClose={setIsIncomeTypeConfirmModalOpen}
						ButtonProceed={ButtonProceed}
					/>
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
									{sub_section?.fields?.map((field, fieldIndex) => {
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
										)
											customFieldProps.disabled = true;
										if (
											isPanUploadMandatory &&
											isPanNumberExist &&
											field.name === CONST.PAN_NUMBER_FIELD_NAME
										)
											customFieldProps.disabled = true;
										if (
											selectedDirector?.directorId &&
											selectedDirector?.sections?.includes(
												CONST_SECTIONS.BASIC_DETAILS_SECTION_ID
											) &&
											field.name === CONST.INCOME_TYPE_FIELD_NAME
										)
											customFieldProps.disabled = true;
										if (isViewLoan) {
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
										onSaveAndProceed();
										return;
									}
									setIsIncomeTypeConfirmModalOpen(true);
								})}
							/>
						)}
						<NavigateCTA previous={false} />
					</UI_SECTIONS.Footer>
				</>
			)}
		</UI_SECTIONS.Wrapper>
	);
};

export default BasicDetails;
