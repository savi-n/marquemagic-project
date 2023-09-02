import React, { Fragment, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import _ from 'lodash';
import moment from 'moment';
import {

	formatSectionReqBody,
	getApiErrorMessage,
	isFieldValid,
	getAllCompletedSections,
	isDirectorApplicant,
} from 'utils/formatData';
import { setSelectedSectionId } from 'store/appSlice';
import { DIRECTOR_TYPES } from 'store/directorsSlice';
import {
	getDirectors,
	setCompletedDirectorSection,
} from 'store/directorsSlice';
import { useToasts } from 'components/Toast/ToastProvider';
import * as UI_SECTIONS from 'components/Sections/ui';
import * as CONST_SECTIONS from 'components/Sections/const';
import Hint from 'components/Hint';
import * as API from '_config/app.config';
import * as UI from './ui';
import * as CONST from './const';
import Loading from 'components/Loading';
import { API_END_POINT } from '_config/app.config';
import { scrollToTopRootElement, isNullFunction } from 'utils/helper';
import useForm from 'hooks/useFormIndividual';
import { encryptBase64 } from 'utils/encrypt';
import Button from 'components/Button';
import NavigateCTA from 'components/Sections/NavigateCTA';
import * as CONST_ADDRESS_DETAILS from 'components/Sections/AddressDetails/const';
import selectedSection from 'components/Sections/AddressDetailsEDI/selectedSection.json';
const AddressEdi = props => {
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
		isViewLoan,

	} = app;
	const {
		// cacheDocuments,
		loanRefId,
	} = application;
	const dispatch = useDispatch();
	const { addToast } = useToasts();
	const [loading, setLoading] = useState(false);
	const {
		handleSubmit,
		register,
		formState,
		onChangeFormStateField,
	} = useForm();
	const [editSectionIds, setEditSectionIds] = useState({
		businessAddressIdAid1: '',
		businessAddressIdAid2: '',
	});
	const [fetchingSectionData, setFetchingSectionData] = useState(false);
	const [sectionData, setSectionData] = useState({});
	const completedSections = getAllCompletedSections({
		application,
		selectedDirector,
		isApplicant,
	});
	const [preferredMAilingAddress, setPreferredMAilingAddress] = useState(null);
	const [
		isSameAsAboveAddressChecked,
		setIsSameAsAboveAddressChecked,
	] = useState(false);
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
			// if (!isEditOrViewLoan && isCountryIndia) {
			//   const isPermanentSelectedAddressProofTypeAadhaar = formState?.values?.[
			//     CONST.PERMANENT_ADDRESS_PROOF_TYPE_FIELD_NAME
			//   ]?.includes(CONST_SECTIONS.EXTRACTION_KEY_AADHAAR);
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

			const addressDetailsReqBody = formatSectionReqBody({
				app,
				selectedDirector,
				application,
				values: formState.values,
			});
			addressDetailsReqBody.data.loan_address_details = newLoanAddressDetails;
			const addressDetailsRes = await axios.post(
				`${API.API_END_POINT}/basic_details`,
				addressDetailsReqBody
			);

			// KYC VERIFICATION RELATED CHANGES CR
			// addressDetailsReqBody.data.verify_kyc_data = cacheDocumentsTemp;
			// permanent_address_proof_upload
			// present_address_proof_upload
			// addressDetailsReqBody.data.permanent_address_proof_upload.doc_ref_id = permanentCacheDocumentsTemp?.filter(
			//   doc => !!doc?.doc_ref_id
			// )?.[0]?.doc_ref_id;
			// addressDetailsReqBody.data.present_address_proof_upload.doc_ref_id = presentCacheDocumentsTemp?.filter(
			//   doc => !!doc?.doc_ref_id
			// )?.[0]?.doc_ref_id;
			// -- KYC VERIFICATION RELATED CHANGES CR

			setEditSectionIds({
				businessAddressIdAid1: addressDetailsRes?.data?.data?.business_address_data?.filter(
					address => address.aid === 1
				)?.[0]?.id,
				businessAddressIdAid2: addressDetailsRes?.data?.data?.business_address_data?.filter(
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
			// custom prefill only for this section
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


			// -- TEST MODE
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
			if (fetchRes?.data?.status === 'ok') {
				fetchRes?.data?.data?.loan_document_details?.map(doc => {
					doc.name = doc?.uploaded_doc_name;
					doc.doc_type_id = doc?.doctype;
					return null;
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

				// if (permanentCacheDocumentsTempRes.length === 2)
				//   setIsPermanentAddressIsPresentAddresssetIsPermanentAddressIsPresentAddress(
				//     true
				//   );
				// setPermanentCacheDocumentsTemp(permanentCacheDocumentsTempRes);
				// setPresentCacheDocumentsTemp(
				//   fetchRes?.data?.data?.loan_document_details?.filter(
				//     doc =>
				//       `${doc?.document_details?.aid}` === '1' &&
				//       `${doc?.directorId}` === `${selectedDirectorId}` &&
				//       doc?.document_details?.classification_type !== 'pan'
				//   )
				// );
			}
		} catch (error) {
			console.error('error-fetchSectionDetails-', error);
		} finally {
			setFetchingSectionData(false);
		}
	};

	useEffect(() => {
		scrollToTopRootElement();
		if (
			!!loanRefId &&
			!!selectedDirectorId
			// selectedDirector?.sections?.includes(selectedSectionId)
		)
			fetchSectionDetails();
		// eslint-disable-next-line
	}, []);
	useEffect(() => {
		if (!isSameAsAboveAddressChecked) {

		}
		// eslint-disable-next-line
	}, [isSameAsAboveAddressChecked]);
	if (!selectedDirectorId) return null;

	return (
		<UI_SECTIONS.Wrapper>
			{fetchingSectionData ? (
				<Loading />
			) : (
				<>
					{selectedSection?.sub_sections?.map(
						(subSection, subSectionIndex) => {
              console.log(subSection);
							const isPermanent = subSection?.aid === CONST.AID_PERMANENT;

							const prefix = isPermanent
								? CONST.PREFIX_PERMANENT
								: CONST.PREFIX_PRESENT;

							// remove after verifying above code

							// if (isFrontTagged && !isBackTagged && !isFrontBackTagged) {
							// 	isProceedDisabledAddressProof = false;
							// }
							// if (!isFrontTagged && isBackTagged && !isFrontBackTagged) {
							// 	isProceedDisabledAddressProof = false;
							// }

							return (
								<Fragment key={`section-${subSectionIndex}-${subSection?.id}`}>
									{subSection?.name ? (
										<>
											<UI_SECTIONS.SubSectionHeader>
												{subSection.name}
											</UI_SECTIONS.SubSectionHeader>
										</>
									) : null}
									{subSection?.name
										? null
										: prefix === CONST.PREFIX_PRESENT && (
												<>
													<UI.CheckboxSameAs
														type='checkbox'
														id={CONST.CHECKBOX_SAME_AS_ID}
														checked={!!isSameAsAboveAddressChecked}
														disabled={
															isSectionCompleted ||
															isViewLoan ||
															!formState?.values?.[
																CONST_ADDRESS_DETAILS
																	.PERMANENT_ADDRESS1_FIELD_NAME
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

											if (
												subSection.aid === CONST.AID_PRESENT &&
												isSameAsAboveAddressChecked
											) {
												if (
													CONST.HIDE_PRESENT_ADDRESS_FIELDS.includes(field.name)
												)
													return null;
											}
											const newValue = prefilledValues(field);
											const customFieldProps = {};
											if (isViewLoan) {
												customFieldProps.disabled = true;
											}
											const customStyle = {};
											//setOtherPresentCacheDocTemp

											if (isSectionCompleted) {
												customFieldProps.disabled = true;
											}

											if (
												isSameAsAboveAddressChecked &&
												field.name.includes(CONST.PREFIX_PRESENT)
											) {
												customFieldProps.disabled = true;
											}

											// Untill permanent address1 is not filled disable present address proof
											if (
												!formState?.values?.[
													CONST.PERMANENT_ADDRESS1_FIELD_NAME
												]
											) {
												customFieldProps.disabled = true;
											}

											// EDIT / VIEW MODE Enable all address fields and disable all doc related fields
											if (isSectionCompleted) {
												if (subSection?.id?.includes('address_details')) {
													customFieldProps.disabled = false;
												}
											}

											// TO overwrite all above condition and disable everything
											if (isViewLoan) {
												customFieldProps.disabled = true;
											}

											// in all the scenario this fields will be always disabled
											if (
												field.name.includes('city') ||
												field.name.includes('state')
											) {
												customFieldProps.disabled = true;
											}
											//here
											// console.log(subSection);
                      if(field.name.includes("checkbox")){
                        return(
                          <UI_SECTIONS.FieldWrapGrid
                          key={`field-${prefix}-${fieldIndex}-${field.name}`}
													style={customStyle}
                          >
                            <UI.CheckboxSameAs
                            type="checkbox"
                            id={CONST.CHECKBOX_SAME_AS_ID}
                            checked={field.name===preferredMAilingAddress}
                            onChange={()=>{
                             field.name!==preferredMAilingAddress?setPreferredMAilingAddress(field.name):setPreferredMAilingAddress(null)
                            }}
                            />
                            <label htmlFor={CONST.CHECKBOX_SAME_AS_ID}>
													Preffered mailing address
													</label>
                          </UI_SECTIONS.FieldWrapGrid>
                        )
                      }
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
						}
					)}
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
export default AddressEdi;
