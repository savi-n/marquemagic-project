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
} from 'utils/formatData';
import { API_END_POINT } from '_config/app.config';
import Loading from 'components/Loading';

const EmploymentDetails = () => {
	const { app, application } = useSelector(state => state);
	const { directors, applicantDirectorId, selectedDirectorId } = useSelector(
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
		isDraftLoan,
	} = app;
	const { businessId, loanRefId } = application;
	const dispatch = useDispatch();
	const { addToast } = useToasts();
	const [loading, setLoading] = useState(false);
	const { handleSubmit, register, formState } = useForm();
	const [fetchingSectionData, setFetchingSectionData] = useState(false);
	const [sectionData, setSectionData] = useState({});
	const editSectionId = sectionData?.income_data?.employment_id || '';

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

	const submitEmploymentDetails = async () => {
		try {
			setLoading(true);
			// console.log('submitEmploymentDetails-', { formState });
			const employmentDetailsReqBody = formatSectionReqBody({
				app,
				selectedDirector,
				application,
				values: formState.values,
			});

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
		if (!isDraftLoan && !validateNavigation()) {
			return;
		}
		dispatch(setAddNewDirectorKey(key));

		const isEmploymentDetailsSubmited = await submitEmploymentDetails();
		if (!isEmploymentDetailsSubmited) return;
		dispatch(setSelectedDirectorId(''));
		dispatch(setSelectedSectionId(CONST_SECTIONS.BASIC_DETAILS_SECTION_ID));
	};

	const onSaveAndProceed = async () => {
		try {
			if (!isDraftLoan && !validateNavigation()) {
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

			dispatch(setSelectedDirectorId(applicantDirectorId));
			dispatch(setSelectedSectionId(nextSectionId));
		} catch (error) {
			console.error('error-EmploymentDetails-onSaveAndProceed-', error);
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

			return (
				sectionData?.employment_details?.[field?.db_key] ||
				sectionData?.income_data?.[field?.db_key]
			);
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
		if (!!selectedDirector?.sections?.includes(CONST.EMPLOYMENT_DETAILS_SECTION_ID))
			fetchSectionDetails();
		// eslint-disable-next-line
	}, []);

	let displayProceedCTA = true;
	let displayAddCoApplicantCTA = true;

	// TODO: varun validate CTA based on coapplicant count
	// if (
	// 	isViewLoan ||
	// 	(selectedProduct?.product_details?.is_coapplicant_mandatory &&
	// 		Object.keys(coApplicants || {})?.length <= 0)
	// ) {
	// 	displayProceedCTA = false;
	// }

	if (selectedSection?.add_co_applicant_visibility === false || isViewLoan) {
		displayAddCoApplicantCTA = false;
	}

	// TODO: update draft validation logic
	// if (isDraftLoan && !isLastApplicantIsSelected) {
	// 	displayAddCoApplicantCTA = false;
	// }

	return (
		<UI_SECTIONS.Wrapper>
			{fetchingSectionData ? (
				<Loading />
			) : (
				<>
					{selectedSection?.sub_sections?.map((sub_section, sectionIndex) => {
						return (
							<Fragment key={`section-${sectionIndex}-${sub_section?.id}`}>
								{sub_section?.name ? (
									<UI_SECTIONS.SubSectionHeader>
										{sub_section.name}
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
						{displayProceedCTA && (
							<Button
								fill
								name='Save and Proceed'
								isLoader={loading}
								disabled={loading}
								onClick={handleSubmit(onSaveAndProceed)}
							/>
						)}
						{/* visibility of add co-applicant based on the config */}
						{displayAddCoApplicantCTA && (
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
						{selectedSection?.footer?.fields?.map((field, fieldIndex) => {
							return (
								<Button
									key={`field${fieldIndex}`}
									fill
									name={field?.name}
									isLoader={loading}
									disabled={loading}
									onClick={handleSubmit(() => {
										onAddDirector(field?.key);
									})}
								/>
							);
						})}
						<NavigateCTA />
					</UI_SECTIONS.Footer>
				</>
			)}
		</UI_SECTIONS.Wrapper>
	);
};

export default EmploymentDetails;
