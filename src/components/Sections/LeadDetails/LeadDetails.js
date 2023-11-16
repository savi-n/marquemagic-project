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
import {
	// setIsDraftLoan,
	// setLoginCreateUserRes,
	setSelectedSectionId,
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
	const naviagteToNextSection = () => {
		dispatch(setSelectedSectionId(nextSectionId));
	};

	const dispatch = useDispatch();
	const [sectionData, setSectionData] = useState({});
	const { addToast } = useToasts();

	const [loading, setLoading] = useState(false);

	const [isTokenValid, setIsTokenValid] = useState(true);
	const [fetchingSectionData, setFetchingSectionData] = useState(false);
	const [isAadhaarOtpModalOpen, setIsAadhaarOtpModalOpen] = useState(false);
	const [verifyingWithOtp, setVerifyingWithOtp] = useState(false);
	const [aadharOtpResponse, setAadharOtpResponse] = useState({});

	const [verifyOtpResponseTemp, setVerifyOtpResponseTemp] = useState(null);
	const documentMapping = JSON.parse(permission?.document_mapping) || [];
	const dedupeApiData = documentMapping?.dedupe_api_details || [];

	const selectedDedupeData =
		dedupeApiData && Array.isArray(dedupeApiData)
			? dedupeApiData?.filter(item => {
					return item?.product_id?.includes(selectedProduct?.id);
			  })?.[0] || {}
			: {};
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
	// console.log({ userDetails });
	// console.log('selectedSection=>', selectedSection);
	const {
		handleSubmit,
		register,
		formState,
		onChangeFormStateField,
	} = useForm();
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
					const sessionIdRes = await axios.post(
						API.GENERATE_SESSION_ID_AADHAAR_REDIRECT
					);
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
				// console.log(aadhaarOtpReqBody, '555', clientToken);
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

	const handleBankRedirection = async url => {
		try {
			const resp = await axios.post(API.GENERATE_SESSION_ID_AADHAAR_REDIRECT);
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
			// console.log('====================================');
			console.error(err);
			// console.log('====================================');
		}
	};
	// console.log({ borrowerUserId, isEditOrViewLoan });
	const onSaveAndProceed = async () => {
		try {
			setLoading(true);
			const isTokenValid = await validateToken();
			if (isTokenValid === false) return;

			const leadsDetailsReqBody = {
				...formState.values,
				white_label_id: whiteLabelId,
				product_id: selectedProduct?.id,
				parent_id: selectedProduct?.parent_id || '',
				id: leadId,
			};
			// console.log('leadsDetailsReqBody=>', leadsDetailsReqBody);
			const leadsDetailsRes = await axios.post(
				`${API.LEADS_DETIALS}`,
				leadsDetailsReqBody
			);
			// console.log('leadsDetailsRes=>', { leadsDetailsRes });
			// return;
			if (leadsDetailsRes?.data?.status === 'ok') {
				// TODO: Manoranjan - discuss with madhuri regarding user and add the below check (already added the condition - just reverify)
				// 1 condition to check whether this user is allowed to proceed further
				// 2 condition to check whether dedupe is present. if not present move to next section
				// 3 if dedupe is present, redirect to dedupe screen

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
				} else {
					if (Object.keys(selectedDedupeData)?.length > 0 || isEditLoan) {
						dispatch(setCompletedApplicationSection(selectedSectionId));
						dispatch(setSelectedSectionId(nextSectionId));
					} else {
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
						} catch (error) {
							console.error('header-getAppylyloanUrl-error  ', error);
						}
					}
				}
			}

			dispatch(setCompletedApplicationSection(selectedSectionId));
			dispatch(setSelectedSectionId(nextSectionId));
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
		// console.log('prePopulateAddressDetailsFromVerifyOtpRes-aadhaarOtpRes-', {
		// 	aadhaarOtpRes,
		// });
		const formatedData = formatAadhaarOtpResponse(aadhaarOtpRes);
		Object.keys(formatedData || {}).map(key => {
			onChangeFormStateField({
				name: `${CONST_ADDRESS_DETAILS.PREFIX_PERMANENT}${key}`,
				value: formatedData?.[key] || '',
			});
			return null;
		});
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

			const preData = {
				...sectionData,
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
	// console.log(formState);

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
			// console.log('=>', fetchRes);
			if (fetchRes?.data?.status === 'ok') {
				setSectionData(fetchRes?.data?.data);
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
		if (leadId) fetchSectionDetails();
		// log is required to monitor the modes
		console.log({ isViewLoan, isEditLoan });
		//eslint-disable-next-line
	}, []);

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

				onChangeFormStateField({
					name: CONST.FIRST_NAME_FIELD_NAME,
					value: firstName || '',
				});
				onChangeFormStateField({
					name: CONST.LAST_NAME_FIELD_NAME,
					value: lastName || '',
				});
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

	// TODO : Bikash will suggest to call the api for branch, connectors etc.

	return (
		<UI_SECTIONS.Wrapper>
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
					{/* {console.log(formState.values.email)}; */}
					{selectedSection?.sub_sections?.map((sub_section, sectionIndex) => {
						// if (sub_section?.id === CONST.FIELD_NAME_ASSETS_DETAILS) {
						// 	return (
						// 		<Fragment key={`section-${sectionIndex}-${sub_section?.id}`}>
						// 			<LeadAssetsDetails
						// 				sectionIndex={sectionIndex}
						// 				sub_section={sub_section}
						// 				formState={formState}
						// 				prefilledValues={prefilledValues}
						// 				registerField={register}
						// 			/>
						// 		</Fragment>
						// 	);
						// }
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
						{!isViewLoan && (
							<Button
								fill
								name={'Save and Proceed'}
								isLoader={loading}
								disabled={loading}
								onClick={handleSubmit(() => {
									onSaveAndProceed();
									return;
								})}
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
export default LeadDetails;
