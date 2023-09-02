import React, { useEffect, useState, Fragment } from 'react';
import axios from 'axios';
import moment from 'moment';
import { useSelector, useDispatch } from 'react-redux';

import Button from 'components/Button';
import Hint from 'components/Hint';
import NavigateCTA from 'components/Sections/NavigateCTA';
import Loading from 'components/Loading';
import * as UI_SECTIONS from 'components/Sections/ui';
import * as UI from './ui';
import { setSelectedSectionId } from 'store/appSlice';
import useForm from 'hooks/useFormIndividual';
import { useToasts } from 'components/Toast/ToastProvider';
import * as CONST from './const';
import * as CONST_SECTIONS from 'components/Sections/const';
// import * as CONST_BASIC_DETAILS from 'components/Sections/BasicDetails/const';
import * as CONST_ADDRESS_DETAILS from 'components/Sections/AddressDetails/const';
import {
	formatSectionReqBody,
	getApiErrorMessage,
	isFieldValid,
	getSelectedField,
	getSelectedSubField,
	getAllCompletedSections,
	formatAddressType,
	isDirectorApplicant,
} from 'utils/formatData';
import {
	getDirectors,
	setCompletedDirectorSection,
} from 'store/directorsSlice';
import { API_END_POINT } from '~/_config/app.config';
import * as API from '_config/app.config';
import { scrollToTopRootElement } from '~/utils/helper';
const AddressEdi = props => {
	const { app, application } = useSelector(state => state);
	const { selectedDirectorId, directors } = useSelector(
		state => state.directors
	);
	const selectedDirector = directors?.[selectedDirectorId] || {};
	const isApplicant = isDirectorApplicant(selectedDirector);
	const {
		loanProductId,
		loanId,
		businessUserId,
		createdByUserId,
		loanRefId,
	} = application;
	const {
		isDraftLoan,
		selectedSectionId,
		nextSectionId,
		isTestMode,
		clientToken,
		selectedSection,
		permission,
		selectedProduct,
	} = app;
	const { isCountryIndia } = permission;
	let { isViewLoan, isEditLoan, isEditOrViewLoan } = app;
	const { directorId } = selectedDirector;
	if (isDraftLoan && !selectedDirector?.permanent_address1) {
		isViewLoan = false;
		isEditLoan = false;
		isEditOrViewLoan = false;
	}

	const dispatch = useDispatch();
	const {
		handleSubmit,
		register,
		formState,
		onChangeFormStateField,
	} = useForm();
	const [loading, setLoading] = useState(false);
	const [verifyingWithOtp, setVerifyingWithOtp] = useState(false);

	const [fetchingSectionData, setFetchingSectionData] = useState(false);
	const [sectionData, setSectionData] = useState({});

	const [editSectionIds, setEditSectionIds] = useState({
		businessAddressIdAid1: '',
		businessAddressIdAid2: '',
	});

	const [
		isSameAsAboveAddressChecked,
		setIsSameAsAboveAddressChecked,
	] = useState(false);
	const [
		setIsPermanentAddressIsPresentAddress,
		setIsPermanentAddressIsPresentAddresssetIsPermanentAddressIsPresentAddress,
	] = useState(false);

	const { addToast } = useToasts();
	const completedSections = getAllCompletedSections({
		application,
		selectedDirector,
		isApplicant,
	});
	const isSectionCompleted = completedSections.includes(selectedSectionId);
	const sectionRequired = selectedSection?.is_section_mandatory !== false;

	const onSaveAndProceed = async () => {
		try {
			const { businessAddressIdAid1, businessAddressIdAid2 } = editSectionIds;
			if (
				sectionRequired &&
				(!formState?.values?.present_city ||
					!formState?.values?.present_state ||
					!formState?.values?.permanent_city ||
					!formState?.values?.permanent_state)
			) {
				return addToast({
					message: 'Please enter valid pincode to get city and state',
					type: 'error',
				});
			}
			setLoading(true);
			const newLoanAddressDetails = [
				{
					business_address_id: businessAddressIdAid1,
					aid: 1,
					line1: formState?.values?.present_address1 || '',
					line2: formState?.values?.present_address2 || '',
					locality: formState?.values?.present_address3 || '',
					pincode: formState?.values?.present_pin_code || '',
					city: formState?.values?.present_city || '',
					state: formState?.values?.present_state || '',
					residential_type: formState?.values?.present_property_type || '',
					residential_stability:
						formState?.values?.present_property_tenure || '',
				},
				{
					business_address_id: businessAddressIdAid2,
					aid: 2,
					line1: formState?.values?.permanent_address1 || '',
					line2: formState?.values?.permanent_address2 || '',
					locality: formState?.values?.permanent_address3 || '',
					pincode: formState?.values?.permanent_pin_code || '',
					city: formState?.values?.permanent_city || '',
					state: formState?.values?.permanent_state || '',
					residential_type: formState?.values?.permanent_property_type || '',
					residential_stability:
						formState?.values?.permanent_property_tenure || '',
				},
			];
			const addressEdiReqBody = formatSectionReqBody({
				app,
				selectedDirector,
				application,
				values: formState.values,
			});
			addressEdiReqBody.data.loan_address_details = newLoanAddressDetails;
			console.log(addressEdiReqBody);

			// addressEdiReqBody?.data?.verify_kyc_data=
			const addressEdiRes = await axios.post(
				`${API.API_END_POINT}/basic_details`,
				addressEdiReqBody
			);
			setEditSectionIds({
				businessAddressIdAid1: addressEdiRes?.data?.data?.business_address_data?.filter(
					address => address.aid === 1
				)?.[0]?.id,
				businessAddressIdAid2: addressEdiRes?.data?.data?.business_address_data?.filter(
					address => address.aid === 2
				)?.[0]?.id,
			});
			dispatch(setCompletedDirectorSection(selectedSectionId));
			dispatch(setSelectedSectionId(nextSectionId));
			dispatch(
				getDirectors({
					loanRefId: loanRefId,
					isSelectedProductTypeBusiness:
						selectedProduct?.isSelectedProductTypeBusiness,
				})
			);
		} catch (error) {
			console.error('error-AddressDetails-onProceed-', {
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
			if (isSameAsAboveAddressChecked) {
				return formState?.values?.[
					field?.name?.replace(CONST.PREFIX_PRESENT, CONST.PREFIX_PERMANENT)
				];
			}
			const isFormStateUpdated = formState?.values?.[field.name] !== undefined;
			if (isFormStateUpdated) {
				return formState?.values?.[field.name];
			}
			// TEST MODE
			if (isTestMode && CONST.initialFormState?.[field?.name]) {
				return CONST.initialFormState?.[field?.name];
			}
			const ekycArrayPermanentAddress = sectionData?.director_details?.ekyc_data?.filter(
				item => {
					return `${item?.aid}` === '2';
				}
			);
			const ekycArrayPresentAddress = sectionData?.director_details?.ekyc_data?.filter(
				item => {
					return `${item?.aid}` === '1';
				}
			);
			const preData = {
				permanent_address_type:
					sectionData?.director_details?.permanent_address_type,
				permanent_address1: sectionData?.director_details?.permanent_address1,
				permanent_address2: sectionData?.director_details?.permanent_address2,
				permanent_address3: sectionData?.director_details?.permanent_locality,
				permanent_pin_code: sectionData?.director_details?.permanent_pincode,
				permanent_city: sectionData?.director_details?.permanent_city,
				permanent_state: sectionData?.director_details?.permanent_state,
				permanent_property_type:
					sectionData?.director_details?.permanent_residential_type,
				permanent_property_tenure: sectionData?.director_details
					?.permanent_residential_stability
					? moment(
							sectionData?.director_details?.permanent_residential_stability
					  ).format('YYYY-MM')
					: '',
				permanent_address_proof_valid_till:
					ekycArrayPermanentAddress?.length > 0
						? moment(
								sectionData?.director_details?.ekyc_data?.filter(item => {
									return `${item?.aid}` === '2';
								})?.[0]?.valid_till
						  ).format('YYYY-MM-DD')
						: '',
				present_address_type: sectionData?.director_details?.address_type,
				present_address1: sectionData?.director_details?.address1,
				present_address2: sectionData?.director_details?.address2,
				present_address3: sectionData?.director_details?.locality,
				present_pin_code: sectionData?.director_details?.pincode,
				present_city: sectionData?.director_details?.city,
				present_state: sectionData?.director_details?.state,
				present_property_type: sectionData?.director_details?.residential_type,
				present_property_tenure: sectionData?.director_details
					?.residential_stability
					? moment(sectionData?.director_details?.residential_stability).format(
							'YYYY-MM'
					  )
					: '',
				present_address_proof_issued_on:
					ekycArrayPresentAddress?.length > 0
						? moment(
								sectionData?.director_details?.ekyc_data?.filter(item => {
									return `${item?.aid}` === '1';
								})?.[0]?.issued_on
						  ).format('YYYY-MM-DD')
						: '',
				present_address_proof_valid_till:
					ekycArrayPresentAddress?.length > 0
						? moment(
								sectionData?.director_details?.ekyc_data?.filter(item => {
									return `${item?.aid}` === '1';
								})?.[0]?.valid_till
						  ).format('YYYY-MM-DD')
						: '',
			};
			return preData?.[field?.name] || field?.value || '';
		} catch (error) {
			console.error('error-fetchSectionDetails-', error);
		}
	};
	const fetchSectionDetails = async () => {
		try {
			setFetchingSectionData(true);
			const fetchRes = await axios.get(`${API_END_POINT}/basic_details`, {
				params: {
					loan_ref_id: loanRefId,
					director_id: selectedDirectorId,
				},
			});
			setSectionData(fetchRes?.data?.data);
			setEditSectionIds({
				businessAddressIdAid1: fetchRes?.data?.data?.business_address_data?.filter(
					address => address.aid === 1
				)?.[0]?.id,
				businessAddressIdAid2: fetchRes?.data?.data?.business_address_data?.filter(
					address => address.aid === 2
				)?.[0]?.id,
			});
		} catch (error) {
			console.error(`error-fetchSectionDetails-`, error);
		} finally {
			setFetchingSectionData(false);
		}
	};
	useEffect(() => {
		scrollToTopRootElement();
		if (!!loanRefId && !!selectedDirectorId) fetchSectionDetails();
	}, []);
	if (!selectedDirectorId) return null;
	return (
		<UI_SECTIONS.Wrapper>
			{fetchingSectionData ? (
				<Loading />
			) : (
				<>
					{selectedSection?.sub_sections?.map((subSection, subSectionIndex) => {
						let isInActiveAddressProofUpload = false;
						if (isSectionCompleted) {
							isInActiveAddressProofUpload = true;
						}

						if (isViewLoan) {
							isInActiveAddressProofUpload = true;
						}
						return (
							<Fragment key={`section-${subSectionIndex}-${subSection?.id}`}>
								{subSection?.name ? (
									<>
										<UI_SECTIONS.SubSectionHeader>
											{subSection.name}
										</UI_SECTIONS.SubSectionHeader>
									</>
								) : null}
								{subSection?.name ? null : (
									<>
										<UI.CheckboxSameAs
											type='checkbox'
											id={CONST.CHECKBOX_SAME_AS_ID}
											checked={!!isSameAsAboveAddressChecked}
											disabled={
												isSectionCompleted ||
												isViewLoan ||
												!formState?.values?.[
													CONST_ADDRESS_DETAILS.PERMANENT_ADDRESS1_FIELD_NAME
												]
											}
											onChange={() => {
												setIsSameAsAboveAddressChecked(
													!isSameAsAboveAddressChecked
												);
											}}
										/>
										<label htmlFor={CONST.CHECKBOX_SAME_AS_ID}>
											Same as Permanent Address
										</label>
									</>
								)}
								<UI_SECTIONS.FormWrapGrid>
									{subSection?.fields?.map((field, fieldIndex) => {
										if (
											!isFieldValid({
												field,
												formState,
												isApplicant,
											})
										) {
											return null;
										}
										const newValue = prefilledValues(field);
										const customFieldProps = {};
										if (isViewLoan) {
											customFieldProps.disabled = true;
										}
										const customStyle = {};
										if (
											subSection?.id ===
											CONST.PERMANENT_ADDRESS_DETAILS_SECTION_ID
										) {
											customFieldProps.disabled = false;
										}
										if (isSectionCompleted) {
											customFieldProps.disabled = true;
										}
										if (
											isSameAsAboveAddressChecked &&
											field.name.includes(CONST.PREFIX_PRESENT)
										) {
											customFieldProps.disabled = true;
										}
										if (
											!formState?.values?.[CONST.PERMANENT_ADDRESS1_FIELD_NAME]
										) {
											customFieldProps.disabled = true;
										}
										if (isSectionCompleted) {
											if (subSection?.id?.includes('address_details')) {
												customFieldProps.disabled = false;
											} else {
												customFieldProps.disabled = true;
											}
										}

										const isPermanent = subSection?.aid === CONST.AID_PERMANENT;
										const prefix = isPermanent
											? CONST.PREFIX_PERMANENT
											: CONST.PREFIX_PRESENT;
										return (
											<UI_SECTIONS.FieldWrapGrid
												key={`field-${prefix}-${fieldIndex}-${field.name}`}
												style={customStyle}
											>
												{register({
													...field,
													value: newValue,
													visibility: 'visible',
													...customFieldProps,
												})}
												{(formState?.submit?.isSubmited ||
													formState?.touched?.[field.name]) &&
													formState?.error?.[field.name] && (
														<UI_SECTIONS.ErrorMessage>
															{formState?.error?.[field.name]}
														</UI_SECTIONS.ErrorMessage>
													)}
											</UI_SECTIONS.FieldWrapGrid>
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
								name='Save and Proceed'
								isLoader={loading}
								disabled={loading}
								onClick={
									sectionRequired
										? handleSubmit(onSaveAndProceed)
										: onSaveAndProceed
								}
							/>
						)}
						<NavigateCTA directorSelected={selectedDirector} />
					</UI_SECTIONS.Footer>
				</>
			)}
		</UI_SECTIONS.Wrapper>
	);
};

export default AddressEdi