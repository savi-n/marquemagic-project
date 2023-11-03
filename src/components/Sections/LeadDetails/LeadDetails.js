import React, { Fragment, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import queryString from 'query-string';
import _ from 'lodash';
import useForm from 'hooks/useFormIndividual';
import Button from 'components/Button';
import { decryptRes } from 'utils/encrypt';
import { verifyUiUxToken } from 'utils/request';
import { API_END_POINT } from '_config/app.config';
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
	getAllCompletedSections,
} from 'utils/formatData';
import Loading from 'components/Loading';
import SessionExpired from 'components/modals/SessionExpired';
import { useToasts } from 'components/Toast/ToastProvider';
import { scrollToTopRootElement } from 'utils/helper';
import * as UI_SECTIONS from 'components/Sections/ui';
import * as CONST_SECTIONS from 'components/Sections/const';
import * as API from '_config/app.config';
// import * as UI from './ui';
import * as CONST from './const';
const LeadDetails = props => {
	const { app, application } = useSelector(state => state);

	const {
		selectedProduct,
		selectedSectionId,
		nextSectionId,
		selectedSection,
		whiteLabelId,
		// clientToken,
		userToken,
		isViewLoan,
		isEditLoan,
		isEditOrViewLoan,

		userDetails,
		isTestMode,
	} = app;
	const {
		borrowerUserId,
		businessUserId,
		businessType,
		loanRefId,
		// dedupePrefilledValues,
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

	const { handleSubmit, register, formState } = useForm();
	const completedSections = getAllCompletedSections({
		selectedProduct,
		application,
		selectedSectionId,
	});

	// console.log({ borrowerUserId, isEditOrViewLoan });
	const onSaveAndProceed = async () => {
		try {
			setLoading(true);
			const isTokenValid = await validateToken();
			if (isTokenValid === false) return;
			// call login craete user api only once while creating the loan

			// modify the data according to the fields added
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

			const buissnessDetailsReqBody = formatSectionReqBody({
				section: selectedSection,
				values: {
					...formState.values,
				},
				app,
				// selectedDirector,
				application,
				// selectedLoanProductId,
			});

			buissnessDetailsReqBody.borrower_user_id =
				newBorrowerUserId || businessUserId || borrowerUserId;

			delete buissnessDetailsReqBody.data.business_details.loan_document;
			buissnessDetailsReqBody.data.business_details.crime_check = crimeCheck;

			if (completedSections?.includes(selectedSectionId)) {
				delete buissnessDetailsReqBody.data.business_details.gstin;
			}

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

			dispatch(setCompletedApplicationSection(selectedSectionId));
			dispatch(
				setLoanIds({
					loanRefId: newLoanRefId,
					loanId: newLoanId,
					businessId: newBusinessId,
					businessUserId: newBusinessUserId,
					// loanProductId: selectedLoanProductId,
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
			// const dedupeData =
			// 	!completedSections?.includes(selectedSectionId) &&
			// 	!!dedupePrefilledValues
			// 		? dedupePrefilledValues
			// 		: null;
			const preData = {
				...sectionData?.business_details,
				...sectionData?.loan_data,
				...sectionData?.user_data,
				business_email: sectionData?.user_data?.email,
				email: sectionData?.business_details?.business_email,
				name: sectionData?.business_details?.first_name,

				businesspancardnumber:
					sectionData?.business_details?.businesspancardnumber,

				contact: sectionData?.user_data?.contact,

				contactno: sectionData?.business_details?.contactno,
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
	// function handleBlurEmail(e) {
	// 	// console.log("input blurred",e);
	// 	setisPrefilEmail(false);
	// 	// console.log(e);
	// }
	// function handleBlurMobileNumber(e) {
	// 	setIsPrefilMobileNumber(false);
	// }
	const fetchSectionDetails = async () => {
		try {
			setFetchingSectionData(true);
			// get method of the sections is here. modify the api of this particular section
			const fetchRes = await axios.get(`${API_END_POINT}/business_details`, {
				params: {
					loan_ref_id: loanRefId,
				},
			});
			if (fetchRes?.data?.status === 'ok') {
				setSectionData(fetchRes?.data?.data);
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
					const tempTrackData = fetchRes?.data?.data?.trackData?.[0] || {};

					const tempCompletedSections =
						Object.keys(tempTrackData)?.length > 0 &&
						JSON.parse(tempTrackData?.onboarding_track);

					// const tempCompletedSections = JSON.parse(
					// 	fetchRes?.data?.data?.trackData?.[0]?.onboarding_track
					// );
					if (tempCompletedSections?.loan_details) {
						dispatch(
							setNewCompletedSections(tempCompletedSections?.loan_details)
						);
					}
					if (
						!tempCompletedSections?.loan_details?.includes(
							CONST_SECTIONS.APPLICATION_SUBMITTED_SECTION_ID
						)
					) {
						dispatch(setIsDraftLoan(true));
					}
					if (tempCompletedSections?.director_details) {
						dispatch(
							setNewCompletedDirectorSections(
								tempCompletedSections?.director_details
							)
						);
					}
					// console.log({ tempCompletedSections });
				}
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
	// TODO : Bikash will suggest to call the api for branch, connectors etc.

	// useEffect(() => {
	// 	const fetchMainCompOptions = async () => {
	// 		try {
	// 			const allIndustriesOption = await fetchOptions({
	// 				fetchOptionsURL: INDUSTRY_LIST_FETCH,
	// 				sectionId: selectedSectionId,
	// 				setOriginalOptions: setAllIndustriesOption,
	// 			});

	// 			const sortedOptions =
	// 				(allIndustriesOption &&
	// 					allIndustriesOption.length > 0 &&
	// 					allIndustriesOption.sort((a, b) => {
	// 						return a.name.localeCompare(b.name);
	// 					})) ||
	// 				[];

	// 			setMainComponentOptions(sortedOptions);
	// 		} catch (err) {
	// 			console.error(err, 'Industry-Fetch-Error');
	// 		}
	// 	};
	// 	fetchMainCompOptions();
	// }, [selectedSectionId]);

	// const extractAndFormatSubOption = () => {
	// 	const extractedSubOptn = allIndustriesOption?.filter(industry => {
	// 		return (
	// 			`${industry.id}` ===
	// 			`${formState?.values[CONST.INDUSTRY_TYPE_FIELD_NAME]}`
	// 		);
	// 	})?.[0]?.subindustry;

	// 	let newOptionsList = [];
	// 	extractedSubOptn?.length === 0
	// 		? (newOptionsList = [{ value: '', name: '' }])
	// 		: extractedSubOptn?.map(item => {
	// 				newOptionsList.push({
	// 					value: `${item.id}`,
	// 					name: `${item.subindustry}`,
	// 				});
	// 				return null;
	// 		  });

	// 	const sortedOptions =
	// 		(newOptionsList &&
	// 			newOptionsList.length > 0 &&
	// 			newOptionsList.sort((a, b) => {
	// 				return a.name.localeCompare(b.name);
	// 			})) ||
	// 		[];

	// 	return sortedOptions;
	// };

	// const selectedIndustryFromGetResp = () => {
	// 	const industryName =
	// 		sectionData?.business_details?.businessindustry.IndustryName;
	// 	// console.log(allIndustriesOption);
	// 	return allIndustriesOption.filter(
	// 		item => item?.IndustryName === industryName
	// 	)?.[0]?.id;
	// };

	// useEffect(() => {
	// 	const res = extractAndFormatSubOption();
	// 	setSubComponentOptions(res);
	// 	if ((res?.length === 1 && res?.[0]?.value === '') || res.length === 0) {
	// 		setIsSubIndustryMandatory(false);
	// 	} else {
	// 		setIsSubIndustryMandatory(true);
	// 	}
	// 	// eslint-disable-next-line react-hooks/exhaustive-deps
	// }, [formState?.values[CONST.INDUSTRY_TYPE_FIELD_NAME]]);

	// useEffect(
	// 	() => {
	// 		// console.log(subComponentOptions);
	// 		if (formState?.values[CONST.SUB_INDUSTRY_TYPE_FIELD_NAME]?.length > 0) {
	// 			clearDependentFields({
	// 				formState,
	// 				field_name: CONST.SUB_INDUSTRY_TYPE_FIELD_NAME,
	// 				subComponentOptions,
	// 				onChangeFormStateField,
	// 			});
	// 		}
	// 	},
	// 	//eslint-disable-next-line
	// 	[JSON.stringify(subComponentOptions)]
	// );
	// console.log({
	// 	allIndustriesOption,
	// 	mainComponentOptions,
	// 	subComponentOptions,
	// 	formValues: formState.values,
	// 	isSubIndustryMandatory,
	// 	random: selectedIndustryFromGetResp(),
	// });

	// const ButtonProceed = (
	// 	<Button
	// 		fill
	// 		name={`${isViewLoan ? 'Next' : 'Proceed'}`}
	// 		isLoader={loading}
	// 		disabled={loading}
	// 		onClick={handleSubmit(() => {
	// 			onSaveAndProceed();
	// 		})}
	// 	/>
	// );

	return (
		<UI_SECTIONS.Wrapper>
			{fetchingSectionData ? (
				<Loading />
			) : (
				<>
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

										/* Starts : Here we will pass all the required props for the main and the sub-components */
										// if (field?.name === 'industry_type') {
										// 	customFieldProps.type = 'industryType';
										// 	// customFieldProps.apiURL = SUB_INDUSTRY_FETCH;
										// 	customFieldProps.mainComponentOptions = mainComponentOptions;
										// 	// customFieldProps.setSubComponentOptions = setSubComponentOptions;
										// 	customFieldProps.sectionId = selectedSectionId;
										// 	customFieldProps.errMessage =
										// 		'Searched Option Not Found.';
										// }

										// if (field?.name === 'sub_industry_type') {
										// 	customFieldProps.type = 'subIndustryType';
										// 	customFieldProps.subComponentOptions = subComponentOptions;
										// 	// customFieldProps.errMessage = 'not found';
										// }

										// if (field?.name === CONST.PAN_NUMBER_FIELD_NAME) {
										// 	customFieldPropsSubFields.loading = loading;
										// 	customFieldProps.disabled =
										// 		loading ||
										// 		!!completedSections?.includes(selectedSectionId);
										// 	customFieldPropsSubFields.disabled =
										// 		loading ||
										// 		!!completedSections?.includes(selectedSectionId);
										// 	customFieldPropsSubFields.onClick = event => {
										// 		onPanEnter(formState.values?.['pan_number']);
										// 	};
										// }

										// if (field?.name === CONST.CUSTOMER_ID_FIELD_NAME) {
										// 	customFieldPropsSubFields.onClick = onFetchFromCustomerId;
										// 	customFieldPropsSubFields.loading = loading;
										// 	customFieldPropsSubFields.disabled =
										// 		loading ||
										// 		!!completedSections?.includes(selectedSectionId);
										// 	customFieldProps.disabled = !!completedSections?.includes(
										// 		selectedSectionId
										// 	);
										// }

										// if (field?.name === CONST.CUSTOMER_ID_FIELD_NAME) {
										// 	field.type = 'input_field_with_info';
										// 	customFieldProps.infoIcon = true;
										// 	customFieldProps.infoMessage =
										// 		'Select the Business Type to fetch the data from Customer ID.';
										// }
										// if (field.name === CONST.BUSINESS_START_DATE) {
										// 	customFieldPropsSubFields.value =
										// 		getTotalYearsCompleted(
										// 			moment(
										// 				formState?.values?.[CONST.BUSINESS_START_DATE]
										// 			).format('YYYY-MM-DD')
										// 		) || '';
										// 	customFieldPropsSubFields.disabled = true;
										// }
										// console.log({
										// 	formState,
										// 	selectedProduct,
										// 	selectedDedupeData,
										// });
										// To be verified once the config changes are done
										// if (
										// 	`${formState?.values?.['business_type']}`?.length === 0
										// ) {
										// 	if (field?.name === CONST.CUSTOMER_ID_FIELD_NAME) {
										// 		field.disabled = true;
										// 	}
										// }
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

										// if (field?.name === CONST.UDYAM_NUMBER_FIELD_NAME) {
										// 	if (
										// 		sectionData?.business_details?.udyam_number &&
										// 		sectionData?.business_details?.udyam_response
										// 	) {
										// 		customFieldProps.disabled = true;
										// 	}
										// }

										// if (
										// 	field?.name === CONST.BUSINESS_TYPE_FIELD_NAME &&
										// 	completedSections?.includes(selectedSectionId)
										// ) {
										// 	customFieldProps.disabled = true;
										// }
										// if (isViewLoan) {
										// 	customFieldProps.disabled = true;
										// 	customFieldPropsSubFields.disabled = true;
										// }
										// if (field.name === CONST.BUSINESS_EMAIL_FIELD) {
										// 	// console.log("Contact")
										// 	customFieldProps.onblur = handleBlurEmail;
										// }
										// if (field.name === CONST.CONTACT_EMAIL_FIELD) {
										// 	customFieldProps.onFocus = handleBlurEmail;

										// 	if (
										// 		isPrefilEmail &&
										// 		!isEditOrViewLoan &&
										// 		!completedSections?.includes(selectedSectionId)
										// 	) {
										// 		// console.log(formState?.values?.email);
										// 		customFieldProps.value = formState.values.email;
										// 	}
										// 	// customFieldProps.value=formState.values.email
										// }
										// if (
										// 	field.name === CONST.BUSINESS_MOBILE_NUMBER_FIELD_NAME
										// ) {
										// 	customFieldProps.onblur = handleBlurMobileNumber;
										// }
										// if (field.name === CONST.MOBILE_NUMBER_FIELD_NAME) {
										// 	customFieldProps.onFocus = handleBlurMobileNumber;
										// 	if (
										// 		isPrefilMobileNumber &&
										// 		!isEditOrViewLoan &&
										// 		!completedSections?.includes(selectedSectionId)
										// 	) {
										// 		customFieldProps.value =
										// 			formState.values.business_mobile_no;
										// 	}
										// }
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
						{/* {!!companyRocData && Object.values(companyRocData)?.length > 0 && (
							<Button
								name={'Business Details'}
								onClick={() => {
									setIsBusinessModalOpen(true);
								}}
							/>
						)} */}
						{!isViewLoan && (
							<Button
								fill
								name={'Save and Proceed'}
								isLoader={loading}
								disabled={loading}
								onClick={handleSubmit(() => {
									if (
										isEditOrViewLoan ||
										completedSections?.includes(selectedSectionId)
									) {
										onSaveAndProceed();
										return;
									}
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
