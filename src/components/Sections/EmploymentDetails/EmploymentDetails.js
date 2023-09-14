import React, { Fragment, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';

import useForm from 'hooks/useFormIndividual';
import { useToasts } from 'components/Toast/ToastProvider';
import Button from 'components/Button';
import NavigateCTA from 'components/Sections/NavigateCTA';

import * as UI_SECTIONS from 'components/Sections/ui';
// import * as CONST_SECTIONS from 'components/Sections/const';
import * as CONST from './const';
import * as CONST_SECTIONS from 'components/Sections/const';

import { setSelectedSectionId } from 'store/appSlice';
import {
	setAddNewDirectorKey,
	setCompletedDirectorSection,
	setSelectedDirectorId,
} from 'store/directorsSlice';
import {
	formatSectionReqBody,
	// getApplicantNavigationDetails,
	getApiErrorMessage,
	isDirectorApplicant,
	validateEmploymentDetails,
	// checkInitialDirectorsUpdated,
	validateDirectorForSme,
} from 'utils/formatData';
import { scrollToTopRootElement } from 'utils/helper';
import {
	API_END_POINT,
	INDUSTRY_LIST_FETCH,
	// SUB_INDUSTRY_FETCH,
} from '_config/app.config';
import Loading from 'components/Loading';

import { fetchOptions, clearDependentFields } from 'utils/helperFunctions';

const EmploymentDetails = () => {
	const { app, application } = useSelector(state => state);
	const { directors, selectedDirectorId } = useSelector(
		state => state.directors
	);
	const selectedDirector = directors?.[selectedDirectorId] || {};
	const isApplicant = isDirectorApplicant(selectedDirector);

	const {
		isViewLoan,
		selectedSectionId,
		nextSectionId,
		isTestMode,
		selectedSection,
		// isDraftLoan,
		selectedProduct,
	} = app;
	const { businessId, loanRefId, businessType } = application;
	const dispatch = useDispatch();
	const { addToast } = useToasts();
	const [loading, setLoading] = useState(false);
	const {
		handleSubmit,
		register,
		formState,
		onChangeFormStateField,
	} = useForm();
	const [fetchingSectionData, setFetchingSectionData] = useState(false);
	const [sectionData, setSectionData] = useState({});
	const [mainComponentOptions, setMainComponentOptions] = useState([]);
	const [subComponentOptions, setSubComponentOptions] = useState([]);
	const [allIndustriesOption, setAllIndustriesOption] = useState([]);
	const [isSubIndustryMandatory, setIsSubIndustryMandatory] = useState(true);

	const editSectionId = sectionData?.income_data?.employment_id || '';
	// const initialDirectorsUpdated = selectedProduct?.isSelectedProductTypeBusiness
	// 	? checkInitialDirectorsUpdated(directors)
	// 	: false;

	// console.log({
	// 	directors,
	// 	popValue: `${Object.keys(directors)?.pop()}` !== `${selectedDirectorId}`,
	// 	lengthOfDir: Object.keys.directors?.length > 1,
	// 	initialDirectorsUpdated,
	// 	isSelectedProductTypeBusiness:
	// 		selectedProduct?.isSelectedProductTypeBusiness,
	// });
	// const {
	// 	nextApplicantDirectorId,
	// 	lastDirectorId,
	// 	isLastApplicantIsSelected,
	// } = getApplicantNavigationDetails({
	// 	applicant,
	// 	coApplicants,
	// 	selectedDirector,
	// });

	const validateNavigation = () => {
		const validateDirector = validateEmploymentDetails({
			selectedDirector,
			directors,
		});
		// console.log({ validateDirector });

		if (validateDirector?.allowProceed === false) {
			addToast({
				message: `Please fill all the details in ${
					validateDirector?.directorName
				}`,
				type: 'error',
			});
			return false;
		}
		return true;
	};

	useEffect(() => {
		const fetchMainCompOptions = async () => {
			try {
				const allIndustriesOption = await fetchOptions({
					fetchOptionsURL: INDUSTRY_LIST_FETCH,
					sectionId: selectedSectionId,
					setOriginalOptions: setAllIndustriesOption,
				});

				setMainComponentOptions(allIndustriesOption);
			} catch (err) {
				console.error(err, 'Industry-Fetch-Error');
			}
		};
		fetchMainCompOptions();
	}, [selectedSectionId]);
	// console.log(mainComponentOptions, 'main component options');

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
		return newOptionsList;
	};

	const selectedIndustryFromGetResp = () => {
		const industryName =
			sectionData?.employment_details?.industry_typeid?.IndustryName;
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

	const submitEmploymentDetails = async () => {
		try {
			setLoading(true);
			// console.log('submitEmploymentDetails-', { formState });

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

			const employmentDetailsReqBody = formatSectionReqBody({
				app,
				selectedDirector,
				application,
				values: formState.values,
			});

			employmentDetailsReqBody.data.employment_details.industry_typeid =
				formState.values[CONST.SUB_INDUSTRY_TYPE_FIELD_NAME] ||
				formState.values[CONST.INDUSTRY_TYPE_FIELD_NAME];
			if (editSectionId) {
				employmentDetailsReqBody.employment_id = editSectionId;
			}
			if (sectionData?.income_data?.id) {
				employmentDetailsReqBody.income_data_id = sectionData?.income_data?.id;
			}

			// console.log('-employmentDetailsReq-', {
			// 	employmentDetailsReqBody,
			// 	app,
			// 	selectedDirector,
			// 	application,
			// });
			await axios.post(
				`${API_END_POINT}/employmentData`,
				employmentDetailsReqBody
			);
			// console.log('-employmentDetailsRes-', {
			// 	employmentDetailsRes,
			// });
			dispatch(setCompletedDirectorSection(selectedSectionId));
			return true;
		} catch (error) {
			console.error('error-submitEmploymentDetails-onSaveAndProceed-', {
				error: error,
				res: error?.response,
				resres: error?.response?.response,
				resData: error?.response?.data,
			});
			addToast({
				message: getApiErrorMessage(error),
				type: 'error',
			});
			// TODO: Handle error toast and error code
			return false;
		} finally {
			setLoading(false);
		}
	};

	const onAddDirector = async key => {
		if (!validateNavigation()) {
			return;
		}

		const isEmploymentDetailsSubmited = await submitEmploymentDetails();

		if (!isEmploymentDetailsSubmited) return;
		dispatch(setSelectedDirectorId(''));
		dispatch(setSelectedSectionId(CONST_SECTIONS.BASIC_DETAILS_SECTION_ID));
		dispatch(setAddNewDirectorKey(key));
	};

	const onAddDirectorSme = async key => {
		if (`${selectedDirectorId}` !== `${Object.keys(directors)?.[0]}`) {
			const validateDirector = validateDirectorForSme(directors);
			if (validateDirector?.allowProceed === false) {
				addToast({
					message: `Please fill all the details in ${validateDirector?.directorName ||
						'the First Director'}`,
					type: 'error',
				});
				return;
			}
		}

		const isEmploymentDetailsSubmited = await submitEmploymentDetails();

		if (!isEmploymentDetailsSubmited) return;
		dispatch(setSelectedDirectorId(''));
		dispatch(setSelectedSectionId(CONST_SECTIONS.BASIC_DETAILS_SECTION_ID));
		dispatch(setAddNewDirectorKey(key));
	};

	const onSaveAndProceed = async () => {
		try {
			if (!validateNavigation()) {
				return;
			}

			const isEmploymentDetailsSubmited = await submitEmploymentDetails();
			if (!isEmploymentDetailsSubmited) return;

			// TODO: udpate draft logics
			// draft stage next applicant exist
			// if (isDraftLoan && !isLastApplicantIsSelected) {
			// 	dispatch(setSelectedDirectorId(nextApplicantDirectorId));
			// 	dispatch(setSelectedSectionId(firstSectionId));
			// 	return;
			// }

			// draft stage last applicant
			// if (isDraftLoan && isLastApplicantIsSelected) {
			// 	dispatch(setselectedDirectorCoApplicantId(CONST_SECTIONS.APPLICANT));
			// 	dispatch(setSelectedSectionId(nextSectionId));
			// 	return;
			// }
			dispatch(setSelectedSectionId(nextSectionId));
		} catch (error) {
			console.error('error-EmploymentDetails-onSaveAndProceed-', error);
		}
	};

	const onSaveAndProceedSme = async () => {
		try {
			// if (selectedProduct?.product_details?.is_coapplicant_mandatory) {
			// 	let allowProceed = true;
			// 	const coApplicants = Object.values(directors)?.filter(dir => {
			// 		return dir?.type_name === CONST_SECTIONS.CO_APPLICANT_TYPE_NAME;
			// 	});

			// 	if (
			// 		selectedDirector?.type_name !==
			// 			CONST_SECTIONS.CO_APPLICANT_TYPE_NAME &&
			// 		coApplicants?.length === 0
			// 	) {
			// 		addToast({
			// 			message: 'Please fill all the detials in atleast one Co-Applicant',
			// 			type: 'error',
			// 		});
			// 		return;
			// 	}

			// 	coApplicants?.map(dir => {
			// 		if (
			// 			selectedDirector?.type_name !==
			// 				CONST_SECTIONS.CO_APPLICANT_TYPE_NAME &&
			// 			dir?.sections?.length < 3
			// 		) {
			// 			allowProceed = false;
			// 		}
			// 		return null;
			// 	});

			// 	if (allowProceed === false) {
			// 		addToast({
			// 			message: 'Please fill all the detials in atleast one Co-Applicant',
			// 			type: 'error',
			// 		});
			// 		return;
			// 	}
			// }

			if (`${selectedDirectorId}` !== `${Object.keys(directors)?.[0]}`) {
				const validateDirector = validateDirectorForSme(directors);
				if (validateDirector?.allowProceed === false) {
					addToast({
						message: `Please fill all the details in ${validateDirector?.directorName ||
							'the First Director'}`,
						type: 'error',
					});
					return;
				}
			}

			const isEmploymentDetailsSubmited = await submitEmploymentDetails();
			if (!isEmploymentDetailsSubmited) return;

			dispatch(setSelectedSectionId(nextSectionId));
		} catch (error) {
			console.error('error-EmploymentDetails-onSaveAndProceed-', error);
		}
	};

	const navigateToNextDirector = async () => {
		const isEmploymentDetailsSubmited = await submitEmploymentDetails();
		if (!isEmploymentDetailsSubmited) return;

		const indexOfCurrentDirector = Object.keys(directors)?.indexOf(
			`${selectedDirectorId}`
		);
		if (Object.keys(directors)?.length > +indexOfCurrentDirector + 1) {
			dispatch(
				setSelectedDirectorId(
					Object.keys(directors)?.[`${+indexOfCurrentDirector + 1}`]
				)
			);
			dispatch(setSelectedSectionId(CONST_SECTIONS.BASIC_DETAILS_SECTION_ID));
		} else {
			dispatch(setSelectedSectionId(nextSectionId));
		}
	};

	const prefilledValues = field => {
		try {
			// console.log({
			// 	empDetails: sectionData?.employment_details,
			// 	income_details: sectionData?.income_data,
			// 	dbkey: field?.db_key,
			// });
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
				...sectionData?.employment_details,
				...sectionData?.income_data,
				sub_industry_type:
					sectionData?.employment_details?.industry_typeid?.id || '',
				industry_type: selectedIndustryFromGetResp() || '',
			};
			return preData?.[field?.db_key];
		} catch (err) {
			console.error('error-BusinessDetials', {
				error: err,
				res: err?.response?.data || '',
			});
		}
	};

	// fetch section data starts
	const fetchSectionDetails = async () => {
		try {
			setFetchingSectionData(true);

			const fetchRes = await axios.get(`${API_END_POINT}/employmentData`, {
				params: {
					loan_ref_id: loanRefId,
					business_id: businessId,
					director_id: selectedDirectorId,
				},
			});
			if (fetchRes?.data?.status === 'ok') {
				setSectionData(fetchRes?.data?.data);
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
		if (
			!!selectedDirector?.sections?.includes(
				CONST.EMPLOYMENT_DETAILS_SECTION_ID
			)
		)
			fetchSectionDetails();
		// eslint-disable-next-line
	}, []);

	let displayProceedCTA = true;
	let displayAddCoApplicantCTA = true;
	let displayAddGuarantorCTA = true;
	if (selectedProduct?.product_details?.is_coapplicant_mandatory) {
		const coApplicants = Object.values(directors)?.filter(dir => {
			return dir?.type_name === CONST_SECTIONS.CO_APPLICANT_TYPE_NAME;
		});

		if (isViewLoan || coApplicants?.length <= 0) {
			displayProceedCTA = false;
		}
	}

	if (selectedProduct?.product_details?.is_guarantor_mandatory) {
		const guarantors = Object.values(directors)?.filter(dir => {
			return dir?.type_name === CONST_SECTIONS.CO_APPLICANT_TYPE_NAME;
		});

		if (isViewLoan || guarantors?.length <= 0) {
			displayProceedCTA = false;
		}
	}

	if (selectedSection?.add_co_applicant_visibility === false || isViewLoan) {
		displayAddCoApplicantCTA = false;
	}

	if (selectedSection?.add_guarantor_visibility === false || isViewLoan) {
		displayAddGuarantorCTA = false;
	}
	// TODO: update draft validation logic
	// if (isDraftLoan && !isLastApplicantIsSelected) {
	// 	displayAddCoApplicantCTA = false;
	// }
	// console.log({
	// 	allIndustriesOption,
	// 	mainComponentOptions,
	// 	subComponentOptions,
	// 	formValues: formState.values,
	// 	isSubIndustryMandatory,
	// 	random: selectedIndustryFromGetResp(),
	// });
	return (
		<UI_SECTIONS.Wrapper>
			{fetchingSectionData ? (
				<Loading />
			) : (
				<>
					{selectedSection?.sub_sections?.map((sub_section, sectionIndex) => {
						let displayAddressDetailsSubsection = true;
						if (sub_section?.id === CONST.ADDRESS_DETAILS_SUB_SECTION_ID) {
							const addressdetailsSubSection =
								selectedSection?.sub_sections?.filter(
									item => item?.id === CONST.ADDRESS_DETAILS_SUB_SECTION_ID
								)?.[0] || [];
							const formStateValues = Object.keys(formState?.values) || [];
							addressdetailsSubSection?.fields?.map(item => {
								if (formStateValues?.includes(item?.db_key)) {
									displayAddressDetailsSubsection = false;
								}
								return null;
							});
						}
						return (
							<Fragment key={`section-${sectionIndex}-${sub_section?.id}`}>
								{sub_section?.name ? (
									<UI_SECTIONS.SubSectionHeader>
										{sub_section?.id !== CONST.ADDRESS_DETAILS_SUB_SECTION_ID &&
											sub_section?.name}

										{sub_section?.id === CONST.ADDRESS_DETAILS_SUB_SECTION_ID &&
											!displayAddressDetailsSubsection &&
											sub_section?.name}
									</UI_SECTIONS.SubSectionHeader>
								) : null}
								<UI_SECTIONS.FormWrapGrid>
									{sub_section?.fields?.map((field, fieldIndex) => {
										// disable fields based on config starts
										if (field?.hasOwnProperty('is_applicant')) {
											if (field.is_applicant === false && isApplicant) {
												return null;
											}
										}
										if (field?.hasOwnProperty('is_co_applicant')) {
											if (field.is_co_applicant === false && !isApplicant) {
												return null;
											}
										}
										// disable fields based on config ends
										if (!field.visibility) return null;
										if (field?.for_type_name) {
											if (
												!field?.for_type.includes(
													formState?.values?.[field?.for_type_name]
												)
											)
												return null;
										}
										const customFieldProps = {};
										if (isViewLoan) {
											customFieldProps.disabled = true;
										}

										/* Starts : Here we will pass all the required props for the main and the sub-components */
										if (field?.name === CONST.INDUSTRY_TYPE_FIELD_NAME) {
											// customFieldProps.apiURL = SUB_INDUSTRY_FETCH;
											customFieldProps.mainComponentOptions = mainComponentOptions;
											// customFieldProps.setSubComponentOptions = setSubComponentOptions;
											customFieldProps.sectionId = selectedSectionId;
											customFieldProps.errMessage =
												'No Industry Name Matches Your Search.';
										}

										if (field?.name === CONST.SUB_INDUSTRY_TYPE_FIELD_NAME) {
											customFieldProps.type = 'subIndustryType';
											customFieldProps.subComponentOptions = subComponentOptions;
											customFieldProps.errMessage =
												'No Sub-industry Name Matches Your Search';
										}

										return (
											<UI_SECTIONS.FieldWrapGrid
												key={`field-${fieldIndex}-${field.name}`}
												style={
													field.type === 'address_proof_radio'
														? {
																gridColumn: 'span 2',
														  }
														: {}
												}
											>
												{register({
													...field,
													value: prefilledValues(field),
													...customFieldProps,
													visibility: 'visible',
												})}
												{(formState?.submit?.isSubmited ||
													formState?.touched?.[field.name]) &&
													formState?.error?.[field.name] &&
													(field.subFields ? (
														<UI_SECTIONS.ErrorMessageSubFields>
															{formState?.error?.[field.name]}
														</UI_SECTIONS.ErrorMessageSubFields>
													) : (
														<UI_SECTIONS.ErrorMessage>
															{formState?.error?.[field.name]}
														</UI_SECTIONS.ErrorMessage>
													))}
											</UI_SECTIONS.FieldWrapGrid>
										);
									})}
								</UI_SECTIONS.FormWrapGrid>
							</Fragment>
						);
					})}
					<UI_SECTIONS.Footer>
						{displayProceedCTA &&
							selectedProduct?.loan_request_type === 2 &&
							!isViewLoan && (
								<Button
									fill
									name='Save and Proceed'
									isLoader={loading}
									disabled={loading}
									onClick={handleSubmit(onSaveAndProceed)}
								/>
							)}
						{/* visibility of add co-applicant based on the config */}
						{displayAddCoApplicantCTA &&
							selectedProduct?.loan_request_type === 2 && (
								<Button
									fill
									name='Add Co-Applicant'
									isLoader={loading}
									disabled={loading}
									onClick={handleSubmit(() => {
										// dispatch(setAddNewDirectorKey('Co-applicant'));
										onAddDirector('Co-applicant');
									})}
								/>
							)}
						{/* displayAddGuarantorCTA */}
						{displayAddGuarantorCTA && (
							<Button
								fill
								name='Add Guarantor'
								isLoader={loading}
								disabled={loading}
								onClick={handleSubmit(() => {
									// dispatch(setAddNewDirectorKey('Co-applicant'));
									onAddDirector('Guarantor');
								})}
							/>
						)}
						{selectedProduct?.isSelectedProductTypeBusiness && !isViewLoan && (
							<Button
								fill
								name={'Save and Proceed'}
								isLoader={loading}
								disabled={loading}
								onClick={handleSubmit(onSaveAndProceedSme)}
							/>
						)}
						{selectedProduct?.isSelectedProductTypeBusiness &&
							`${Object.keys(directors)?.pop()}` !== `${selectedDirectorId}` &&
							Object.keys(directors)?.length > 1 &&
							!isViewLoan && (
								<Button
									fill
									name={'Next'}
									isLoader={loading}
									disabled={loading}
									onClick={handleSubmit(() => {
										navigateToNextDirector();
									})}
								/>
							)}

						{selectedProduct?.isSelectedProductTypeBusiness && !isViewLoan && (
							<Button
								fill
								name='Add Co-Applicant'
								isLoader={loading}
								disabled={loading}
								onClick={handleSubmit(() => {
									// dispatch(setAddNewDirectorKey('Co-applicant'));
									onAddDirectorSme('Co-applicant');
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
											onAddDirectorSme(field?.key);
										})}
									/>
								);
							})}
						<NavigateCTA directorSelected={selectedDirector} />
					</UI_SECTIONS.Footer>
				</>
			)}
		</UI_SECTIONS.Wrapper>
	);
};

export default EmploymentDetails;
