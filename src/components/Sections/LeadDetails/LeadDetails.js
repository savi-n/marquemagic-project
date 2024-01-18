// TODO: Manoranjan - Please integrate all the required api's 1.Get method 2. Post method 3. Aadhar otp verification 4. dedupe flow
import React, { Fragment, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import queryString from 'query-string';
import _ from 'lodash';
import useForm from 'hooks/useFormIndividual';
import Button from 'components/Button';
import { decryptRes, encryptBase64, encryptReq } from 'utils/encrypt';
import { verifyUiUxToken } from 'utils/request';
import { API_END_POINT } from '_config/app.config';
import { getTotalYearsCompleted } from 'utils/helper';
import { DDUPE_CHECK } from '_config/app.config';
import plusRoundIcon from 'assets/icons/plus_icon_round.png';
import editIcon from 'assets/icons/edit-icon.png';
import expandIcon from 'assets/icons/right_arrow_active.png';
import moment from 'moment';

import {
	// setIsDraftLoan,
	// setLoginCreateUserRes,
	setSelectedSectionId,
	setLeadDetailData,

	// setUserToken,
} from 'store/appSlice';
// import {
// 	setNewCompletedDirectorSections,
// 	getDirectors,
// 	setSmeType,
// } from 'store/directorsSlice';
import {
	// setLoanIds,
	// setLeadId,
	setCompletedApplicationSection,
	setLeadId,
	// setBusinessType,
	// setNewCompletedSections,
	// setBusinessMobile,
	// setBusinessName,
} from 'store/applicationSlice';
import {
	// formatSectionReqBody,
	getApiErrorMessage,
	getAllCompletedSections,
	getSelectedSubField,
	getSelectedField,
	isDirectorApplicant,
	formatAadhaarOtpResponse,
} from 'utils/formatData';
import Loading from 'components/Loading';
import SessionExpired from 'components/modals/SessionExpired';
import { useToasts } from 'components/Toast/ToastProvider';
import { scrollToTopRootElement } from 'utils/helper';
import * as UI_SECTIONS from 'components/Sections/ui';
import * as CONST_SECTIONS from 'components/Sections/const';
import * as CONST_ADDRESS_DETAILS from 'components/Sections/AddressDetails/const';
import * as API from '_config/app.config';
import { isInvalidAadhaar, isInvalidPan } from 'utils/validation';

// import * as UI from './ui';
import * as CONST from './const';
import LeadAadhaarVerify from './LeadAadhaarVerify';
import LeadAadhaarOTPModal from './LeadAadhaarOTPModal';
import { useLayoutEffect } from 'react';
// import CustomerListModal from "./CustomerListModal"
import CustomerListModal from '../../../components/ProductCard/CustomerListModal';
import CustomerVerificationOTPModal from '../../../components/ProductCard/CustomerVerificationOTPModal';
import DynamicForm from './DynamicForm';
// import LeadAssetsDetails from './LeadAssetsDetails';
const LeadDetails = props => {
	const { app, application } = useSelector(state => state);
	const { selectedDirectorId, directors } = useSelector(
		state => state.directors
	);
	const selectedDirector = directors?.[selectedDirectorId] || {};
	const isApplicant = isDirectorApplicant(selectedDirector);

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
		// isEditOrViewLoan,
		permission,
		userDetails,
		isTestMode,
	} = app;
	const {
		// borrowerUserId,
		// businessUserId,
		// businessType,
		loanRefId,
		leadId,
		loanProductId,
	} = application;

	const dispatch = useDispatch();
	const {
		handleSubmit,
		register,
		formState,
		onChangeFormStateField,
	} = useForm();
	const [sectionData, setSectionData] = useState({});
	const { addToast } = useToasts();
	const assetsDetails = selectedSection?.sub_sections?.find(
		section => section.id === CONST.FIELD_NAME_ASSETS_DETAILS
	);
	const assetFields = assetsDetails?.fields;

	const [loading, setLoading] = useState(false);

	const [isTokenValid, setIsTokenValid] = useState(true);
	const [fetchingSectionData, setFetchingSectionData] = useState(false);
	const [isAadhaarOtpModalOpen, setIsAadhaarOtpModalOpen] = useState(false);
	const [verifyingWithOtp, setVerifyingWithOtp] = useState(false);
	const [aadharOtpResponse, setAadharOtpResponse] = useState({});
	const [assetManufacturerOptions, setAssetManufacturerOptions] = useState([]);
	const [assetModelOptions, setAssetModelOptions] = useState([]);
	const [assetTypeOptions, setAssetTypeOptions] = useState([]);
	const [sendingOTP, setSendingOTP] = useState(false);
	const [sendOtpRes, setSendOtpRes] = useState(null);

	const [
		isCustomerVerificationOTPModal,
		setIsCustomerVerificationOTPModal,
	] = useState(false);
	const [isAssetEditMode, setIsAssetEditMode] = useState(false);
	const [verifyOtpResponseTemp, setVerifyOtpResponseTemp] = useState(null);
	const [assetListFormState, setAssetListFormState] = useState([]);
	const [isAssetCreateFormOpen, setIsAssetCreateFormOpen] = useState(true);
	const [assetEditIndex, setAssetEditIndex] = useState(undefined);
	const [assetViewIndex, setAssetViewIndex] = useState(undefined);
	const [isAssetViewMode, setIsAssetViewMode] = useState(false);
	const documentMapping = JSON.parse(permission?.document_mapping) || [];
	const dedupeApiData = documentMapping?.dedupe_api_details || [];
	const [selectedCustomer, setSelectedCustomer] = useState(null);
	const MAX_ADD_COUNT = assetsDetails.max || 10;

	const selectedDedupeData =
		dedupeApiData && Array.isArray(dedupeApiData)
			? dedupeApiData?.filter(item => {
					return item?.product_id?.includes(selectedProduct?.id);
			  })?.[0] || {}
			: {};
	const [connectorOptions, setConnectorOptions] = useState([]);
	const [branchOptions, setBranchOptions] = useState([]);
	const [isCustomerListModalOpen, setIsCustomerListModalOpen] = useState(false);
	const [customerList, setCustomerList] = useState('');
	const [customerId, setCustomerId] = useState('');

	let selectedVerifyOtp = verifyOtpResponseTemp || null;
	if (
		sectionData?.director_details?.is_aadhaar_verified_with_otp &&
		!selectedVerifyOtp
	) {
		selectedVerifyOtp = {
			res: {
				status: 'ok',
			},
		};
	}

	const branchField =
		selectedSection?.sub_sections
			?.filter(item => {
				return item.id === CONST.SOURCE_DETAILS_SUBSECTION_ID;
			})?.[0]
			?.fields?.filter(field => {
				return field?.name === CONST.BRANCH_FIELD_NAME;
			})?.[0] || {};

	const completedSections = getAllCompletedSections({
		selectedProduct,
		application,
		selectedSectionId,
		selectedDirector,
		isApplicant,
	});
	const isSectionCompleted = completedSections.includes(selectedSectionId);

	const selectedPermanentAadhaarField = getSelectedField({
		fieldName: CONST.AADHAR_OTP_FIELD_NAME,
		selectedSection,
		isApplicant,
	});
	const selectedVerifyWithOtpSubField = getSelectedSubField({
		fields: selectedPermanentAadhaarField?.sub_fields || [],
		isApplicant,
	});
	// const sectionRequired = selectedSection?.is_section_mandatory !== false;
	const onClickVerifyWithOtp = async field => {
		if (field?.redirect_url) {
			handleBankRedirection(field.redirect_url);
			return;
		}
		try {
			const aadhaarErrorMessage = isInvalidAadhaar(
				formState.values[CONST.AADHAR_OTP_FIELD_NAME]
			);
			if (aadhaarErrorMessage) {
				return addToast({
					message: aadhaarErrorMessage,
					type: 'error',
				});
			}

			// Check for federal bank url redirect flag
			if (selectedVerifyWithOtpSubField?.redirect_url) {
				try {
					setVerifyingWithOtp(true);
					// const reqBody = {};
					const apiUrl =
						selectedSection?.aadhaar_redirect_api_url ||
						API.GENERATE_SESSION_ID_AADHAAR_REDIRECT;
					const sessionIdRes = await axios.post(apiUrl);
					const sessionId = await sessionIdRes?.data?.data?.SessionId;
					if (!sessionId || sessionIdRes.status === 'nok') {
						addToast({
							message: 'Error verifying aadhaar, Please try after some time.',
							type: 'error',
						});
						console.error(
							'error-generate session id-',
							sessionIdRes.message || sessionIdRes.data.message
						);
					}
				} catch (error) {
					console.error('error-addressdetails-aadhaarurlredirect-', error);
				} finally {
					setVerifyingWithOtp(false);
					return;
				}
			}
			// -- Check for federal bank url redirect flag

			setVerifyingWithOtp(true);
			try {
				const aadhaarOtpReqBody = {
					aadhaarNo: formState.values[CONST.AADHAR_OTP_FIELD_NAME],
					product_id: loanProductId,
				};
				// --------------------
				const aadharOtpReq = await axios.post(
					API.AADHAAR_GENERATE_OTP,
					aadhaarOtpReqBody,
					{
						headers: {
							Authorization: `${clientToken}`,
						},
					}
				);
				const aadhaarGenOtpResponse = aadharOtpReq.data;
				if (aadhaarGenOtpResponse.status === 'nok') {
					addToast({
						message:
							aadhaarGenOtpResponse?.data?.msg ||
							'Aadhaar cannot be validated due to technical failure. Please try again after sometime',
						type: 'error',
					});
				}
				if (aadhaarGenOtpResponse.status === 'ok') {
					aadhaarGenOtpResponse.aadhaarNo =
						formState?.values?.[CONST.AADHAR_OTP_FIELD_NAME];

					setAadharOtpResponse({
						req: aadhaarOtpReqBody,
						res: aadhaarGenOtpResponse,
					});

					addToast({
						message: 'OTP is sent to aadhaar link mobile number',
						type: 'success',
					});
					setIsAadhaarOtpModalOpen(true);
				}
			} catch (error) {
				console.error('error-generate-aadhaar-otp-', error);
				addToast({
					message:
						error?.response?.data?.message ||
						error?.response?.data?.data?.msg ||
						'Aadhaar cannot be validated due to technical failure. Please try again after sometime',
					type: 'error',
				});
			} finally {
				setVerifyingWithOtp(false);
			}
		} catch (error) {
			console.error('error-onClickVerifyWithOtp-', error);
		} finally {
			setVerifyingWithOtp(false);
		}
	};

	const getBranchOptions = async () => {
		try {
			if (Object.keys(branchField)?.length > 0) {
				setLoading(true);
				const bankRefId = permission?.ref_bank_id || 0;

				const branchRes = await axios.get(
					`${API.API_END_POINT}/getBranchList?bankId=${bankRefId}`
				);
				const newBranchOptions = [];
				branchRes?.data?.branchList?.map(branch => {
					newBranchOptions?.push({
						...branch,
						value: `${branch?.id}`,
						name: `${branch?.branch}`,
					});
					return null;
				});
				setBranchOptions(newBranchOptions);
			}
		} catch (error) {
			console.error('error-getBranchOptions-', error);
		} finally {
			setLoading(false);
		}
	};

	const getConnectors = async () => {
		try {
			setLoading(true);
			const connectorRes = await axios.get(`${API.API_END_POINT}/connectors`);
			const newConnectorOptions = [];
			connectorRes?.data?.data?.map(connector => {
				newConnectorOptions.push({
					...connector,
					value: `${connector?.user_reference_no}`,
				});
				return null;
			});
			setConnectorOptions(newConnectorOptions);
		} catch (error) {
			console.error('error-getConnectors-', error);
		} finally {
			setLoading(false);
		}
	};

	const handleBankRedirection = async url => {
		try {
			const apiUrl =
				selectedSection?.aadhaar_redirect_api_url ||
				API.GENERATE_SESSION_ID_AADHAAR_REDIRECT;
			const resp = await axios.post(apiUrl);
			const session_id = resp?.data?.data?.SessionId;
			if (session_id) {
				window.open(
					`${url}?session_id=${session_id}&redirect_url=${encryptBase64(
						window.location.href
					)}&option=biometric`,
					'_blank'
				);
			}
		} catch (err) {
			console.error(err);
		}
	};

	const onSaveAndProceed = async () => {
		try {
			setLoading(true);
			const isTokenValid = await validateToken();
			if (isTokenValid === false) return;

			let isLeadCategoryChanged = false;
			if (
				isEditLoan &&
				sectionData?.lead_category !== formState?.values?.['lead_category']
			) {
				isLeadCategoryChanged = true;
			}

			const formValuesForPayload = {};
			Object.keys(formState?.values).forEach(key => {
				if (assetFields?.some(field => field.name === key)) return;
				formValuesForPayload[key] = formState?.values[key];
			});

			const leadsDetailsReqBody = {
				...formValuesForPayload,
				assets: assetListFormState?.length ? assetListFormState : null,
				white_label_id: whiteLabelId,
				product_id: selectedProduct?.id,
				parent_id: selectedProduct?.parent_id || '',
			};

			if (leadId) leadsDetailsReqBody.id = leadId;
			const leadsDetailsRes = await axios.post(
				`${API.LEADS_DETIALS}`,
				leadsDetailsReqBody
			);
			// return;
			if (leadsDetailsRes?.data?.status === 'ok') {
				// TODO: Manoranjan - discuss with madhuri regarding user and add the below check (already added the condition - just reverify)
				// 1 condition to check whether this user is allowed to proceed further
				// 2 condition to check whether dedupe is present. if not present move to next section
				// 3 if dedupe is present, redirect to dedupe screen
				dispatch(setLeadId({ leadId: leadsDetailsRes?.data?.data?.id }));
				if (
					selectedSection?.restrict_user_loan_creation?.includes(
						userDetails?.usertype
					) ||
					selectedSection?.restrict_user_loan_creation?.includes(
						userDetails?.user_sub_type
					)
				) {
					sessionStorage.clear();
					if (loanRefId) {
						window.open(
							`${window.origin}/newui/main/loanlist?id=${loanRefId}`,
							'_self'
						);
					} else {
						window.open(`${window.origin}/newui/main/dashboard`, '_self');
					}
					return;
				} else {
					if (
						Object.keys(selectedDedupeData)?.length === 0 ||
						(isEditLoan && !isLeadCategoryChanged) ||
						(selectedSection?.validate_lead_status === true &&
							formState?.values?.['lead_category'] ===
								CONST.LEAD_STATUS_HOT_OPTION_VALUE)
					) {
						dispatch(setCompletedApplicationSection(selectedSectionId));
						dispatch(setSelectedSectionId(nextSectionId));
					} else if (
						selectedProduct?.product_details?.lead_to_dedupe_screen === true
					) {
						try {
							const token = {
								userId: userDetails?.id,
								token: userToken,
								create: true,
								selected_product_ids_from_lead: {
									parent_product_id: selectedProduct?.parent_id,
									selected_product_id: selectedProduct?.id,
								},
								lead_id: leadsDetailsRes?.data?.data?.id,
							};
							const encryptedToken = encryptReq(token);
							window.open(
								`${window.origin}/nconboarding/applyloan/?uid=${
									userDetails?.id
								}&token=${encryptedToken}`,
								'_self'
							);
							return;
						} catch (error) {
							console.error('header-getAppylyloanUrl-error  ', error);
						}
					} else {
						searchCustomerFromFetchApi();
					}
				}
			}

			// dispatch(setCompletedApplicationSection(selectedSectionId));
			// dispatch(setSelectedSectionId(nextSectionId));
		} catch (error) {
			console.error('error-LeadDetails-onProceed-', {
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
	const prePopulateAddressDetailsFromVerifyOtpRes = aadhaarOtpRes => {
		const formatedData = formatAadhaarOtpResponse(aadhaarOtpRes);
		Object.keys(formatedData || {}).map(key => {
			onChangeFormStateField({
				name: `${CONST_ADDRESS_DETAILS.PREFIX_PERMANENT}${key}`,
				value: formatedData?.[key] || '',
			});
			return null;
		});
	};
	const searchCustomerFromFetchApi = async () => {
		try {
			const url = selectedDedupeData?.search_api;
			const apiUrl = url || DDUPE_CHECK;
			const reqBody = {
				loan_product_id:
					selectedProduct?.product_id?.[formState?.values?.['income_type']] ||
					selectedProduct?.product_id?.[formState?.values?.['business_type']] ||
					'',
				customer_type: formState?.values['customer_type'] || '',
				white_label_id: whiteLabelId,
				id_no: formState?.values?.['pan_number'] || '',
				pan_number: formState?.values['pan_number']?.toUpperCase() || '',
				pan: formState?.values['pan_number']?.toUpperCase() || '',

				mobile_no: formState?.values['mobile_no'] || '',
				mobile_num: formState?.values['mobile_no'] || '',

				dob: formState?.values['business_vintage'] || '',
				businesstype: formState?.values['income_type'] || '',
				isApplicant: true, //implemented based on savitha's changes - bad practice
				customer_id: formState?.values['customer_id'] || '',
				loan_product_details_id: selectedProduct?.id || undefined,
				parent_product_id: selectedProduct?.parent_id || undefined,
			};

			if (apiUrl) {
				const ddupeRes = await axios.post(apiUrl, reqBody, {
					headers: {
						Authorization: `Bearer ${userToken}`,
					},
				});

				if (ddupeRes?.data?.status === 'nok') {
					addToast({
						message:
							ddupeRes?.data?.message ||
							ddupeRes?.data?.Message ||
							'No Customer data found, please press SKIP and proceed to enter details.',
							type: 'error',
						});
						
						return;
					}
					if (ddupeRes?.data?.status === 'ok') {
						ddupeRes && setCustomerList(ddupeRes?.data?.data || []);
					
					setIsCustomerListModalOpen(true);
							
						}
						else{
							dispatch(setCompletedApplicationSection(selectedSectionId));
							dispatch(setSelectedSectionId(nextSectionId));
						}
				
					

				
			}
		} catch (e) {
			console.error(e.message);
			addToast({
				message:
					e?.response?.data?.message ||
					e?.response?.data?.Message ||
					e.message ||
					'Error in fetching the customer details. Please verify the entered details.',
				type: 'error',
			});
		} finally {
			// setFetchingCustomerDetails(false);
			// setLoading(false)
		}
	};

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
			const otherData = sectionData?.other_data || '';
			const tempSectionData = otherData ? JSON.parse(otherData) : {};
			const preData = {
				// ...sectionData,
				...tempSectionData,
				branch: tempSectionData?.branch?.id,
				leadid: sectionData?.id,
			};

			if (preData?.[field?.name]) return preData?.[field?.name];

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

	const fetchSectionDetails = async () => {
		try {
			setFetchingSectionData(true);
			// get method of the sections is here. modify the api of this particular section
			const fetchRes = await axios.get(`${API_END_POINT}/leadsData`, {
				params: {
					id: leadId,
					white_label_id: whiteLabelId,
				},
			});
			if (fetchRes?.data?.status === 'ok') {
				const responseData = fetchRes?.data?.data;
				setSectionData(responseData);
				const otherData = responseData?.other_data || '';
				const tempSectionData = otherData ? JSON.parse(otherData) : {};
				setAssetListFormState(tempSectionData?.assets || []);
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
		getBranchOptions();
		getConnectors();
		//new get api
		if (leadId) fetchSectionDetails();
		//eslint-disable-next-line
	}, []);

	const assetTypeFormState = formState?.values?.['asset_type'];
	const getOptionsFromResponse = (data = [], value) => {
		return _.uniqBy(
			data?.map(item => ({
				value: item[value],
				name: item[value],
			})),
			'value'
		);
	};

	const fetchAssetOptions = async () => {
		try {
			setLoading(true);
			setAssetManufacturerOptions([]);
			setAssetModelOptions([]);

			const isVehicleType = assetTypeOptions
				?.filter(type =>
					selectedProduct?.product_details?.vehicle_type_api?.includes(
						type.name
					)
				)
				?.some(type => type?.value === assetTypeFormState);
			const isEquipmentType = assetTypeOptions
				?.filter(type =>
					selectedProduct?.product_details?.equipment_type_api?.includes(
						type.name
					)
				)
				?.some(type => type?.value === assetTypeFormState);

			const assetTypeName = assetTypeOptions.find(
				type => type?.value === assetTypeFormState
			)?.name;
			let response;

			if (isVehicleType)
				response = await axios.get(`${API_END_POINT}/getVehicleType`, {
					params: { assettype: assetTypeName, registrable: 'Registrable' },
				});
			if (isEquipmentType)
				response = await axios.get(`${API_END_POINT}/getEquipmentType`, {
					params: { equipmenttype: assetTypeName, registrable: 'Registrable' },
				});
			const result = response?.data?.data;
			setAssetManufacturerOptions(
				getOptionsFromResponse(
					result,
					isVehicleType ? 'Manufacturer' : 'manufacturer'
				)
			);
			setAssetModelOptions(
				getOptionsFromResponse(
					result,
					isVehicleType ? 'VehicleModel' : 'equipmentmodel'
				)
			);
		} catch (error) {
			console.log(error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (assetTypeFormState) fetchAssetOptions();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [assetTypeFormState]);

	const openAssetForm = () => {
		if (isAssetEditMode) {
			setIsAssetEditMode(false);
			setAssetEditIndex(undefined);
		}
		if (isAssetViewMode) {
			setIsAssetViewMode(false);
			setAssetViewIndex(undefined);
		}
		setIsAssetCreateFormOpen(true);
	};

	const saveAssetForm = () => {
		let savedAsset = {};
		assetsDetails?.fields?.forEach(field => {
			const fieldName = field?.name;
			savedAsset[fieldName] = formState?.values[fieldName];
			onChangeFormStateField({
				name: fieldName,
				value: '',
			});
		});

		setAssetListFormState(prev => {
			if (assetEditIndex !== undefined) {
				const updatedList = [...prev];
				updatedList[assetEditIndex] = savedAsset;
				setAssetEditIndex(undefined);
				return updatedList;
			}
			return [...prev, { ...savedAsset }];
		});
		if (isAssetCreateFormOpen) setIsAssetCreateFormOpen(false);
		else setIsAssetEditMode(false);
	};

	const connectorCode = sectionData?.loan_details?.connector_user_id;
	useEffect(() => {
		getConnectorsWithCode(connectorCode);
		// eslint-disable-next-line
	}, [connectorCode]);

	const getConnectorsWithCode = async code => {
		if (sectionData?.loan_details?.connector_user_id) {
			try {
				setLoading(true);
				const connectorRes = await axios.get(
					`${API.API_END_POINT}/connectors?user_reference_no=${code}`
				);

				const newConnectorOptions = [];
				connectorRes?.data?.data?.map(connector => {
					newConnectorOptions.push({
						...connector,
						value: `${connector?.user_reference_no}`,
					});
					return null;
				});
				const filteredConnector =
					connectorOptions?.filter(option => {
						return (
							`${option?.user_reference_no}` ===
							`${newConnectorOptions?.[0]?.user_reference_no}`
						);
					}) || [];
				if (filteredConnector?.length === 0) {
					setConnectorOptions(prev => [...prev, newConnectorOptions?.[0]]);
				}
			} catch (error) {
				console.error('Error', error);
			} finally {
				setLoading(false);
			}
		}
	};

	useLayoutEffect(() => {
		if (
			CONST.LOAN_CREATE_BRANCH_FOR.includes(
				formState?.values?.[CONST.LOAN_SOURCE]
			)
		) {
			onChangeFormStateField({
				name: CONST.BRANCH_FIELD_NAME,
				value:
					sectionData?.loan_details?.branch_id?.id ||
					userDetails.branch_id ||
					'',
			});
		}

		//eslint-disable-next-line
	}, [formState.values[CONST.LOAN_SOURCE]]);

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
			// 1.VERIFY PAN - name is mandatory for the api. In order to avoid breaking we are passing dummy data to the api
			const panExtractionApiRes = await axios.post(
				API.VERIFY_KYC,
				{ req_type: 'pan', number: pan, name: 'XXX' },
				{ headers: { Authorization: clientToken } }
			);
			const panExtractionMsg = panExtractionApiRes?.data?.message || '';
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

				if (`${selectedProduct?.loan_request_type}` === '2') {
					onChangeFormStateField({
						name: CONST.FIRST_NAME_FIELD_NAME,
						value: firstName || '',
					});
					onChangeFormStateField({
						name: CONST.LAST_NAME_FIELD_NAME,
						value: lastName || '',
					});
				} else {
					onChangeFormStateField({
						name: CONST.BUSINESS_NAME_FIELD_NAME,
						value: name || '',
					});
				}
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

	const redirectToProductPageInEditMode = (
		loanData
		// productForModal = product
	) => {
		if (!loanData?.data?.loan_data?.loan_ref_id) {
			addToast({
				message: 'Something went wrong, try after sometime',
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
			selectedProduct?.id || ''
		)}?token=${encryptReq(editLoanRedirectObject)}`;
		window.open(redirectURL, '_self');
	};

	const onProceedSelectCustomer = async () => {
		try {
			setSendingOTP(true);

			const customerId = selectedCustomer?.customer_id;
			setCustomerId(customerId);
			if (selectedDedupeData?.is_otp_required) {
				try {
					const sendOtpRes = await axios.post(
						selectedDedupeData?.generate_otp,
						{
							customer_id: customerId,
							loan_product_id:
								selectedProduct?.product_id?.[
									formState?.values?.['income_type']
								] ||
								selectedProduct?.product_id?.[
									formState?.values?.['business_type']
								] ||
								'',
						},
						{
							headers: {
								Authorization: `Bearer ${userToken}`,
							},
						}
					);

					setSendOtpRes(sendOtpRes?.data?.data || {});
					setIsCustomerListModalOpen(false);
					setIsCustomerVerificationOTPModal(true);
					addToast({
						message: sendOtpRes?.data?.message || 'OTP Sent Successfully',
						type: 'success',
					});
				} catch (err) {
					console.error(err.message);
					addToast({
						message: err.message || 'Otp generation failed!',
						type: 'error',
					});
				}
			} else {
				try {
					const reqBody = {
						customer_id: customerId,
						white_label_id: whiteLabelId,
						loan_product_id:
							selectedProduct?.product_id?.[
								formState?.values?.['income_type']
							] ||
							selectedProduct?.product_id?.[
								formState?.values?.['business_type']
							] ||
							'',
						loan_product_details_id:
							selectedProduct?.id || selectedProduct?.id || undefined,
						isApplicant: true, //implemented based on savitha's changes - bad practice
						origin: API.ORIGIN,
					};
					const verifyData = await axios.post(
						selectedDedupeData?.verify,
						reqBody,
						{
							headers: {
								Authorization: `Bearer ${userToken}`,
							},
						}
					);

					if (verifyData?.data?.status === 'ok') {
						dispatch(setLeadDetailData(verifyData?.data));
						dispatch(setSelectedSectionId(nextSectionId));
					}

					if (verifyData?.data?.status === 'nok') {
						addToast({
							message:
								verifyData?.data?.message ||
								verifyData?.data?.Message ||
								'Something Went Wrong, Please check the selected/entered details.',
							type: 'error',
						});
					}
				} catch (err) {
					console.error(err.message);
				}
			}
		} catch (e) {
			console.error('error-onSelectCustomer-', e);
		} finally {
			setSendingOTP(false);
		}
	};
	// TODO : Bikash will suggest to call the api for branch, connectors etc.

	return (
		<UI_SECTIONS.Wrapper>
			{isCustomerListModalOpen && (
				<CustomerListModal
					show={isCustomerListModalOpen}
					onClose={() => {
						setIsCustomerListModalOpen(false);
						setSelectedCustomer(null);
					}}
					customerList={customerList}
					selectedCustomer={selectedCustomer}
					setSelectedCustomer={setSelectedCustomer}
					onProceedSelectCustomer={onProceedSelectCustomer}
					sendingOTP={sendingOTP}
				/>
			)}

			{isCustomerVerificationOTPModal && (
				<CustomerVerificationOTPModal
					show={isCustomerVerificationOTPModal}
					customerId={customerId}
					onClose={() => {
						setIsCustomerVerificationOTPModal(false);
						setIsCustomerListModalOpen(false);
						// setIsCustomerDetailsFormModalOpen(false);
						// setIsCustomerDetailsFormModalOpenDuplicate(false);
					}}
					selectedCustomer={selectedCustomer}
					resendOtp={onProceedSelectCustomer}
					redirectToProductPageInEditMode={redirectToProductPageInEditMode}
					customerDetailsFormData={formState?.values}
					selectedDedupeData={selectedDedupeData}
					product={selectedProduct}
					isApplicant={true}
					sendOtpRes={sendOtpRes}
					// subProduct={subProduct}
				/>
			)}
			{fetchingSectionData ? (
				<Loading />
			) : (
				<>
					{isAadhaarOtpModalOpen && (
						<LeadAadhaarOTPModal
							formState={formState}
							isAadhaarOtpModalOpen={isAadhaarOtpModalOpen}
							setIsAadhaarOtpModalOpen={setIsAadhaarOtpModalOpen}
							aadhaarGenOtpResponse={aadharOtpResponse?.res}
							prePopulateAddressDetailsFromVerifyOtpRes={
								prePopulateAddressDetailsFromVerifyOtpRes
							}
							setVerifyOtpResponseTemp={setVerifyOtpResponseTemp}
						/>
					)}
					{!isTokenValid && <SessionExpired show={!isTokenValid} />}

					{selectedSection?.sub_sections?.map((sub_section, sectionIndex) => {
						if (
							sub_section.is_dynamic &&
							sub_section.id === CONST.FIELD_NAME_ASSETS_DETAILS
						) {
							return (
								<Fragment key={`section-${sectionIndex}-${sub_section?.id}`}>
									{sub_section?.name ? (
										<UI_SECTIONS.SubSectionHeader>
											{sub_section.name}
										</UI_SECTIONS.SubSectionHeader>
									) : null}

									{assetListFormState.map((assetItem, assetIndex) => {
										return (
											<div key={`accordian-${assetIndex}`}>
												{assetItem?.asset_type && (
													<UI_SECTIONS.AccordianWrapper>
														<UI_SECTIONS.AccordianHeader>
															<UI_SECTIONS.AccordianHeaderData>
																<span>Type of Asset:</span>
																<strong>
																	{
																		assetTypeOptions?.find(
																			option =>
																				option.value === assetItem?.asset_type
																		)?.name
																	}
																</strong>
															</UI_SECTIONS.AccordianHeaderData>
															<UI_SECTIONS.AccordianHeaderData>
																<span>Asset Price:</span>
																<strong>{assetItem?.asset_price}</strong>
															</UI_SECTIONS.AccordianHeaderData>
															<UI_SECTIONS.AccordianHeaderData
																style={{
																	marginLeft: 'auto',
																	flex: 'none',
																}}
															>
																{isViewLoan ? null : (
																	<UI_SECTIONS.AccordianIcon
																		src={editIcon}
																		alt='edit'
																		onClick={() => {
																			if (isAssetCreateFormOpen) {
																				setIsAssetCreateFormOpen(false);
																			}
																			if (isAssetViewMode) {
																				setIsAssetViewMode(false);
																				setAssetViewIndex(undefined);
																			}
																			setAssetEditIndex(assetIndex);
																			Object.keys(assetItem).forEach(item => {
																				onChangeFormStateField({
																					name: item,
																					value: assetItem?.[item],
																				});
																			});
																			setIsAssetEditMode(true);
																		}}
																	/>
																)}
																<UI_SECTIONS.AccordianIcon
																	src={expandIcon}
																	alt='toggle'
																	onClick={() => {
																		if (isAssetCreateFormOpen) {
																			setIsAssetCreateFormOpen(false);
																		}
																		if (isAssetEditMode) {
																			setIsAssetEditMode(false);
																			setAssetEditIndex(undefined);
																		}
																		if (
																			isAssetViewMode &&
																			assetViewIndex === assetIndex
																		) {
																			setAssetViewIndex(undefined);
																			Object.keys(assetItem).forEach(item => {
																				onChangeFormStateField({
																					name: item,
																					value: '',
																				});
																			});
																			setIsAssetViewMode(false);
																		} else {
																			setAssetViewIndex(assetIndex);
																			Object.keys(assetItem).forEach(item => {
																				onChangeFormStateField({
																					name: item,
																					value: assetItem?.[item],
																				});
																			});
																			setIsAssetViewMode(true);
																		}
																	}}
																	style={{
																		transform:
																			isAssetViewMode &&
																			assetViewIndex === assetIndex
																				? 'rotate(-90deg)'
																				: 'rotate(90deg)',
																		cursor: 'pointer',
																	}}
																/>
															</UI_SECTIONS.AccordianHeaderData>
														</UI_SECTIONS.AccordianHeader>
													</UI_SECTIONS.AccordianWrapper>
												)}

												{assetsDetails &&
												((isAssetEditMode && assetEditIndex === assetIndex) ||
													(isAssetViewMode &&
														assetViewIndex === assetIndex)) ? (
													<UI_SECTIONS.AccordianWrapper style={{ padding: 30 }}>
														<UI_SECTIONS.FormWrapGrid>
															{assetsDetails?.fields?.map(eachField => {
																const field = _.cloneDeep(eachField);
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
																	field?.name === CONST.ASSET_TYPE_FIELD_NAME
																) {
																	if (!assetTypeOptions.length)
																		setAssetTypeOptions(field?.options);
																}

																customFieldProps.disabled =
																	isAssetViewMode || isViewLoan;

																if (
																	field?.name ===
																	CONST.ASSET_MANUFACTURER_FIELD_NAME
																) {
																	customFieldProps.disabled =
																		!assetManufacturerOptions.length ||
																		isAssetViewMode;
																	customFieldProps.options = assetManufacturerOptions;
																}
																if (
																	field?.name === CONST.ASSET_MODEL_FIELD_NAME
																) {
																	customFieldProps.disabled =
																		!assetModelOptions.length ||
																		isAssetViewMode;
																	customFieldProps.options = assetModelOptions;
																}

																return (
																	<DynamicForm
																		key={`field-${field?.id}-${field.name}`}
																		field={field}
																		formState={formState}
																		register={register}
																		customFieldProps={customFieldProps}
																		customFieldPropsSubFields={
																			customFieldPropsSubFields
																		}
																		newValue={newValue}
																		newValueSelectField={newValueSelectField}
																	/>
																);
															})}
														</UI_SECTIONS.FormWrapGrid>

														{isAssetEditMode || !assetItem?.asset_type ? (
															<UI_SECTIONS.AddDynamicSectionWrapper
																style={{
																	display: 'flex',
																	gap: '20px',
																}}
															>
																<Button
																	onClick={saveAssetForm}
																	disabled={
																		loading || formState?.error?.asset_type
																	}
																	loading={loading}
																>
																	Save Asset
																</Button>
																{assetListFormState.length >= 1 &&
																isAssetEditMode ? (
																	<Button
																		onClick={() => {
																			setAssetEditIndex(undefined);
																			assetFields.forEach(item => {
																				onChangeFormStateField({
																					name: item,
																					value: '',
																				});
																			});
																			setIsAssetEditMode(false);
																		}}
																		disabled={loading}
																		loading={loading}
																	>
																		Cancel
																	</Button>
																) : null}
															</UI_SECTIONS.AddDynamicSectionWrapper>
														) : null}
													</UI_SECTIONS.AccordianWrapper>
												) : null}
											</div>
										);
									})}
									{isAssetCreateFormOpen && (
										<UI_SECTIONS.AccordianWrapper style={{ padding: 30 }}>
											<UI_SECTIONS.FormWrapGrid>
												{assetsDetails?.fields?.map(eachField => {
													const field = _.cloneDeep(eachField);
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

													if (field?.name === CONST.ASSET_TYPE_FIELD_NAME) {
														if (!assetTypeOptions.length)
															setAssetTypeOptions(field?.options);
													}

													customFieldProps.disabled =
														isAssetViewMode || isViewLoan;

													if (
														field?.name === CONST.ASSET_MANUFACTURER_FIELD_NAME
													) {
														customFieldProps.disabled =
															!assetManufacturerOptions.length ||
															isAssetViewMode;
														customFieldProps.options = assetManufacturerOptions;
													}
													if (field?.name === CONST.ASSET_MODEL_FIELD_NAME) {
														customFieldProps.disabled =
															!assetModelOptions.length || isAssetViewMode;
														customFieldProps.options = assetModelOptions;
													}

													return (
														<DynamicForm
															key={`field-${field?.id}-${field.name}`}
															field={field}
															formState={formState}
															register={register}
															customFieldProps={customFieldProps}
															customFieldPropsSubFields={
																customFieldPropsSubFields
															}
															newValue={newValue}
															newValueSelectField={newValueSelectField}
														/>
													);
												})}
											</UI_SECTIONS.FormWrapGrid>
											<UI_SECTIONS.AddDynamicSectionWrapper
												style={{
													display: 'flex',
													gap: '20px',
													marginBottom: 10,
												}}
											>
												<Button
													onClick={saveAssetForm}
													disabled={loading || formState?.error?.asset_type}
													loading={loading}
												>
													Save Asset
												</Button>
												{assetListFormState.length >= 1 &&
												isAssetCreateFormOpen ? (
													<Button
														onClick={() => {
															setIsAssetCreateFormOpen(false);
														}}
														disabled={loading}
														loading={loading}
													>
														Cancel
													</Button>
												) : null}
											</UI_SECTIONS.AddDynamicSectionWrapper>
										</UI_SECTIONS.AccordianWrapper>
									)}
									{isViewLoan ||
									assetListFormState?.length >= MAX_ADD_COUNT ||
									isAssetCreateFormOpen ? null : (
										<UI_SECTIONS.AddDynamicSectionWrapper>
											<UI_SECTIONS.PlusRoundButton
												src={plusRoundIcon}
												onClick={openAssetForm}
											/>
											<span>Click to Add Assets</span>
										</UI_SECTIONS.AddDynamicSectionWrapper>
									)}
								</Fragment>
							);
						}

						return (
							<Fragment key={`section-${sectionIndex}-${sub_section?.id}`}>
								{sub_section?.name ? (
									<UI_SECTIONS.SubSectionHeader>
										{sub_section.name}
									</UI_SECTIONS.SubSectionHeader>
								) : null}
								<UI_SECTIONS.FormWrapGrid>
									{sub_section?.fields?.map((eachField, fieldIndex) => {
										const field = _.cloneDeep(eachField);

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

										if (field?.name === CONST.PAN_NUMBER_FIELD_NAME) {
											customFieldPropsSubFields.loading = loading;
											customFieldProps.disabled =
												loading ||
												!!completedSections?.includes(selectedSectionId);
											customFieldPropsSubFields.disabled =
												loading ||
												!!completedSections?.includes(selectedSectionId);
											customFieldPropsSubFields.onClick = event => {
												onPanEnter(formState.values?.['pan_number']);
											};
										}

										if (field?.name === CONST.UDYAM_NUMBER_FIELD_NAME) {
											customFieldProps.infoMessage =
												'Example : UDYAM-XY-07-1234567';
										}

										if (field?.name === CONST.CONNECTOR_NAME_FIELD_NAME) {
											field.options = connectorOptions;
										}

										if (field?.name === CONST.BRANCH_FIELD_NAME) {
											field.options = branchOptions;
										}

										if (
											field?.name === CONST.BRANCH_FIELD_NAME &&
											!CONST.DISABLE_BRANCH_FIELD_FOR?.includes(
												formState?.values?.['loan_source']
											)
										) {
											customFieldProps.disabled = false;
										}

										if (
											field?.name === CONST.BRANCH_FIELD_NAME &&
											CONST.DISABLE_BRANCH_FIELD_FOR?.includes(
												formState?.values?.['loan_source']
											)
										) {
											customFieldProps.disabled = true;
										}

										if (field.name === CONST.CONNECTOR_CODE_FIELD_NAME) {
											customFieldProps.disabled = true;
										}

										if (field?.name === CONST.AADHAR_OTP_FIELD_NAME) {
											customFieldPropsSubFields.loading = loading;
											customFieldProps.disabled =
												loading ||
												!!completedSections?.includes(selectedSectionId);
											customFieldPropsSubFields.disabled =
												loading ||
												!!completedSections?.includes(selectedSectionId);
											customFieldPropsSubFields.onClick = event => {
												onClickVerifyWithOtp(formState.values?.['aadhaar']);
											};

											return (
												<LeadAadhaarVerify
													key={`field-${fieldIndex}-${field.name}`}
													field={field}
													register={register}
													formState={formState}
													prefilledValues={prefilledValues}
													addressProofUploadSection={sub_section}
													onClickVerifyWithOtp={onClickVerifyWithOtp}
													verifyingWithOtp={verifyingWithOtp}
													directorDetails={sectionData?.director_details}
													selectedVerifyOtp={selectedVerifyOtp}
													isViewLoan={isViewLoan}
													isSectionCompleted={isSectionCompleted}
												/>
											);
										}
										if (field?.name === CONST.BUSINESS_START_DATE) {
											customFieldPropsSubFields.value =
												getTotalYearsCompleted(
													moment(
														formState?.values?.[CONST.BUSINESS_START_DATE]
													).format('YYYY-MM-DD')
												) || '';
											customFieldPropsSubFields.disabled = true;
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

										if (isViewLoan) {
											customFieldProps.disabled = true;
											customFieldPropsSubFields.disabled = true;
										}

										return (
											<DynamicForm
												key={`field-${fieldIndex}-${field.name}`}
												field={field}
												formState={formState}
												register={register}
												customFieldProps={customFieldProps}
												customFieldPropsSubFields={customFieldPropsSubFields}
												newValue={newValue}
												newValueSelectField={newValueSelectField}
											/>
										);
									})}
								</UI_SECTIONS.FormWrapGrid>
							</Fragment>
						);
					})}
					<UI_SECTIONS.Footer style={{ marginTop: 20 }}>
						{!isViewLoan && (
							<Button
								fill
								name={'Save and Proceed'}
								isLoader={loading}
								disabled={loading || isAssetCreateFormOpen}
								onClick={handleSubmit(() => {
									onSaveAndProceed();
									return;
								})}
							/>
						)}
					</UI_SECTIONS.Footer>
				</>
			)}
		</UI_SECTIONS.Wrapper>
	);
};
export default LeadDetails;
