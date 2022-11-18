import React, { Fragment, useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import _ from 'lodash';

import {
	updateApplicantSection,
	updateCoApplicantSection,
} from 'store/applicantCoApplicantsSlice';
import useForm from 'hooks/useFormIndividual';
import Button from 'components/Button';

import * as SectionUI from '../ui';
import * as UI from './ui';
import * as CONST_APP_CO_APP_HEADER from 'components/AppCoAppHeader/const';
import * as CONST_ADDRESS_PROOF_UPLOAD from 'components/AddressProofUpload/const';
import * as CONST from './const';
import { sleep } from 'utils/helper';
import { setSelectedSectionId } from 'store/appSlice';
import AddressProofUpload from 'components/AddressProofUpload';
// import { formatSectionReqBody } from 'utils/formatData';

const AddressDetails = props => {
	const { app, applicantCoApplicants } = useSelector(state => state);
	const {
		isViewLoan,
		selectedSectionId,
		selectedSection,
		nextSectionId,
		isTestMode,
	} = app;
	const {
		selectedApplicantCoApplicantId,
		applicant,
		coApplicants,
	} = applicantCoApplicants;
	const dispatch = useDispatch();
	const { handleSubmit, register, formState } = useForm();
	const [loading, setLoading] = useState(false);
	const [addressProofDocs, setAddressProofDocs] = useState([]);
	const [isError, setIsError] = useState(false);
	const [isWarning, setIsWarning] = useState(false);
	const addressProofDocsRef = useRef([]);
	const [selectedAddressProofId, setSelectedAddressProofId] = useState('');
	const [addressProofError, setAddressProofError] = useState('');

	useEffect(() => {
		let newSelectedAddressProofId = '';

		if (selectedApplicantCoApplicantId === CONST_APP_CO_APP_HEADER.APPLICANT) {
			newSelectedAddressProofId = applicant.selectedAddressProofId;
		} else {
			newSelectedAddressProofId =
				coApplicants[selectedApplicantCoApplicantId].selectAddressProofField;
		}
		setSelectedAddressProofId(newSelectedAddressProofId);
	}, [
		applicant,
		coApplicants,
		selectedApplicantCoApplicantId,
		setSelectedAddressProofId,
	]);
	const resetAllErrors = () => {
		setAddressProofError('');
		setIsError(false);
		setIsWarning(false);
	};

	const handleFileUploadAddressProof = files => {
		let newAddressProofDocs = _.cloneDeep(addressProofDocsRef.current);
		files.map(f => newAddressProofDocs.push(_.cloneDeep(f)));
		newAddressProofDocs = _.uniqBy(newAddressProofDocs, function(e) {
			return e.id;
		});
		// console.log('pan-verification-handleFileUploadAddressProof-', {
		//  files,
		//  newAddressProofDocs,
		//  addressProofDocs,
		//  selectedAddressProof,
		// });

		if (selectedAddressProofId) {
			setAddressProofDocs(newAddressProofDocs);
			addressProofDocsRef.current = newAddressProofDocs;
		}
		// setDisableSubmit(false);
		resetAllErrors();
		setIsError(false);
	};

	const handleFileRemoveAddressProof = docId => {
		// console.log('handleFileRemoveAddressProof docId-', docId);

		// TODO: Remove from redux
		// removeAllAddressProofLoanDocuments();

		resetAllErrors();
		// const newAddressProofDocs = _.cloneDeep(
		// 	// eslint-disable-next-line
		// 	fileRef.current.filter(f => f.id != docId)
		// );
		// fileRef.current = newAddressProofDocs;
		const newAddressProofDocs = _.cloneDeep(
			addressProofDocsRef.current.filter(f => f.id !== docId)
		);
		setAddressProofDocs(newAddressProofDocs);
		addressProofDocsRef.current = newAddressProofDocs;
	};

	const handleDocumentTypeChangeAddressProof = async (fileId, type) => {
		// TODO: handle redux
		// setLoanDocumentType(fileId, type);

		// const newAddressProofDocs = fileRef.current || [];
		// const newAddressProofDocs = _.cloneDeep(addressProofDocs);
		const newAddressProofDocs = [];
		addressProofDocsRef?.current?.map(f => {
			const newFile = _.cloneDeep(f);
			if (f.id === fileId) {
				newFile.isTagged = type;
				newFile.doc_type_id = type.id;
			}
			newAddressProofDocs.push(newFile);
			return null;
		});

		// console.log('handleDocumentTypeChangeAddressProof-', {
		// 	addressProofDocs,
		// 	newAddressProofDocs,
		// });
		// // fileRef.current = newAddressProofDocs;
		setAddressProofDocs(newAddressProofDocs);
		addressProofDocsRef.current = newAddressProofDocs;
	};

	const onProceed = async () => {
		try {
			if (Object.keys(formState.values).length === 0) return onSkip();
			setLoading(true);
			await sleep(100);
			// const addressDetailsReqBody = formatSectionReqBody({
			// 	section: selectedSection,
			// 	values: formState.values,
			// 	app,
			// 	applicantCoApplicants,
			// 	application,
			// });
			// const basicDetailsRes = await axios.post(
			// 	`/basic_details`,
			// 	addressDetailsReqBody
			// );
			// console.log('onProceed-addressDetailsReqBody-', {
			// 	addressDetailsReqBody,
			// });
			const newAddressDetails = {
				id: selectedSectionId,
				values: formState.values,
			};
			if (
				selectedApplicantCoApplicantId === CONST_APP_CO_APP_HEADER.APPLICANT
			) {
				dispatch(updateApplicantSection(newAddressDetails));
			} else {
				newAddressDetails.directorId = selectedApplicantCoApplicantId;
				dispatch(updateCoApplicantSection(newAddressDetails));
			}
			dispatch(setSelectedSectionId(nextSectionId));
		} catch (error) {
			console.error('error-AddressDetails-onProceed-', error);
		} finally {
			setLoading(false);
		}
	};

	const onSkip = () => {
		dispatch(
			updateApplicantSection({
				id: selectedSectionId,
				values: { isSkip: true },
			})
		);
		dispatch(setSelectedSectionId(nextSectionId));
	};

	const prefilledValues = field => {
		try {
			if (formState?.values?.[field.name] !== undefined) {
				return formState?.values?.[field.name];
			}

			// TEST MODE
			if (isTestMode && CONST.initialFormState?.[field?.name]) {
				return CONST.initialFormState?.[field?.name];
			}
			// -- TEST MODE

			if (
				selectedApplicantCoApplicantId === CONST_APP_CO_APP_HEADER.APPLICANT
			) {
				return (
					applicant?.[selectedSectionId]?.[field?.name] || field.value || ''
				);
			}
			if (
				selectedApplicantCoApplicantId === CONST_APP_CO_APP_HEADER.CO_APPLICANT
			) {
				return formState?.values?.[field.name] || field.value || '';
			}
			if (selectedApplicantCoApplicantId) {
				return (
					coApplicants?.[selectedApplicantCoApplicantId]?.[selectedSectionId]?.[
						field?.name
					] ||
					field.value ||
					''
				);
			}
			return '';
		} catch (error) {
			return {};
		}
	};

	let isInActiveAddressProofUpload = false;
	let isProceedDisabledAddressProof = true;

	if (selectedAddressProofId) {
		isInActiveAddressProofUpload = true;
		isProceedDisabledAddressProof = true;
	}

	const selectedDocTypeList =
		CONST_ADDRESS_PROOF_UPLOAD.ADDRESS_PROOF_DOC_TYPE_LIST[
			selectedAddressProofId
		];

	if (selectedAddressProofId) {
		const isFrontTagged =
			addressProofDocs.filter(
				f => f?.isTagged?.id === selectedDocTypeList[0].id
			).length > 0;
		const isBackTagged =
			addressProofDocs.filter(
				f => f?.isTagged?.id === selectedDocTypeList[1].id
			).length > 0;
		const isFrontBackTagged =
			addressProofDocs.filter(
				f => f?.isTagged?.id === selectedDocTypeList[2].id
			).length > 0;
		if (isFrontTagged && !isBackTagged && !isFrontBackTagged) {
			isProceedDisabledAddressProof = false;
		}
		if (!isFrontTagged && isBackTagged && !isFrontBackTagged) {
			isProceedDisabledAddressProof = false;
		}
		if (isFrontTagged && isBackTagged && !isFrontBackTagged) {
			isInActiveAddressProofUpload = true;
			isProceedDisabledAddressProof = false;
		}
		if (isFrontBackTagged && !isFrontTagged && !isBackTagged) {
			isInActiveAddressProofUpload = true;
			isProceedDisabledAddressProof = false;
		}
		if (isError) {
			isInActiveAddressProofUpload = true;
			isProceedDisabledAddressProof = true;
		}
		if (addressProofDocs.filter(f => !f?.isTagged?.id).length > 0) {
			isInActiveAddressProofUpload = true;
			isProceedDisabledAddressProof = true;
		}
	}
	if (loading) {
		isProceedDisabledAddressProof = true;
	}

	const selectAddressProofField =
		selectedSection?.sub_sections?.[0]?.fields?.[0] || {};
	return (
		<SectionUI.Wrapper>
			{/*  AID1_PREFIX_PERMANENT */}

			<UI.SubSectionCustomHeader>
				<h4>
					Select any one of the documents mentioned below for{' '}
					<strong>Permanent Address</strong>
				</h4>
				<span />
			</UI.SubSectionCustomHeader>
			<UI.RadioButtonWrapper>
				{selectAddressProofField?.options?.map((option, optionIndex) => {
					return (
						<UI.CardRadioButton key={`option${optionIndex}${option.req_type}`}>
							<input
								name={selectAddressProofField?.name}
								id={option.req_type}
								type='radio'
								value={option.req_type}
								// onChange={e => onSelectedAddressProofChange(e, option)}
								// checked={selectedAddressProof === option.req_type}
							/>
							<label htmlFor={option.req_type} style={{ marginLeft: '10px' }}>
								{option.label}
							</label>
						</UI.CardRadioButton>
					);
				})}
			</UI.RadioButtonWrapper>
			{selectedSection?.sub_sections?.map((sub_section, sectionIndex) => {
				return (
					<Fragment key={`section-${sectionIndex}-${sub_section?.id}`}>
						{sub_section?.name ? (
							<SectionUI.SubSectionHeader>
								{sub_section.name}
							</SectionUI.SubSectionHeader>
						) : null}
						<SectionUI.FormWrapGrid>
							{sub_section?.fields?.map((field, fieldIndex) => {
								const customField = _.cloneDeep(field);
								customField.name = `${CONST.AID1_PREFIX_PERMANENT}${
									customField.name
								}`;
								if (
									customField.type === 'file' &&
									customField.name.includes('id_upload')
								) {
									return (
										<SectionUI.FieldWrapGrid>
											<AddressProofUpload
												isInActive={isInActiveAddressProofUpload}
												startingTaggedDocs={addressProofDocs}
												section={CONST.ADDRESSPROOF}
												accept=''
												upload={true}
												pan={true}
												docTypeOptions={selectedDocTypeList}
												sectionType={selectedAddressProofId}
												// onDrop={files =>
												// 	handleFileUploadAddressProof(files, addressProofDocs)
												// }
												onDrop={handleFileUploadAddressProof}
												onRemoveFile={handleFileRemoveAddressProof}
												docs={addressProofDocs}
												// setDocs={setAddressProofDocs}
												setDocs={newDocs => {
													const newAddressProofDocs = [];
													addressProofDocsRef?.current?.map(d =>
														newAddressProofDocs.push(d)
													);
													newDocs.map(d => newAddressProofDocs.push(d));
													setAddressProofDocs(newAddressProofDocs);
													addressProofDocsRef.current = newAddressProofDocs;
												}}
												documentTypeChangeCallback={
													handleDocumentTypeChangeAddressProof
												}
												aadharVoterDl={true}
												errorMessage={addressProofError}
												errorType={
													addressProofError && (isWarning ? 'warning' : 'error')
												}
											/>
										</SectionUI.FieldWrapGrid>
									);
								}
								if (!customField.visibility) return null;
								const customFieldProps = {};
								return (
									<SectionUI.FieldWrapGrid
										key={`field-${fieldIndex}-${customField.name}`}
										isSubFields={!!customField?.sub_fields}
									>
										{register({
											...customField,
											value: prefilledValues(customField),
											...customFieldProps,
											visibility: 'visible',
										})}
										{customField?.sub_fields?.map((subF, subFIndex) => {
											if (subF.type === 'button') {
												return (
													<Button
														key={`subF-${subFIndex}-${subF.placeholder}`}
														name={subF.placeholder}
														// disabled={isVerifyWithOtpDisabled || editLoanData}
														type='submit'
														customStyle={{
															whiteSpace: 'nowrap',
															width: '150px',
															height: '50px',
														}}
														// onClick={onSubFieldButtonClick}
													/>
												);
											} else return null;
											// Different types of field should come as seperate requriement
											// during that time we'll handle these scenarion
											// now only button is handled
										})}
										{(formState?.submit?.isSubmited ||
											formState?.touched?.[customField.name]) &&
											formState?.error?.[customField.name] &&
											(customField.sub_fields ? (
												<SectionUI.ErrorMessageSubFields>
													{formState?.error?.[customField.name]}
												</SectionUI.ErrorMessageSubFields>
											) : (
												<SectionUI.ErrorMessage>
													{formState?.error?.[customField.name]}
												</SectionUI.ErrorMessage>
											))}
									</SectionUI.FieldWrapGrid>
								);
							})}
						</SectionUI.FormWrapGrid>
					</Fragment>
				);
			})}

			<div style={{ marginTop: 100 }} />

			{/* AID2_PREFIX_PRESENT */}
			<UI.SubSectionCustomHeader>
				<h4>
					Select any one of the documents mentioned below for{' '}
					<strong>Present Address</strong>
				</h4>
				<h4>
					<UI.CheckboxSameAs type='checkbox' id={CONST.CHECKBOX_SAME_AS_ID} />
					<label htmlFor={CONST.CHECKBOX_SAME_AS_ID}>
						Same as Permanent Address
					</label>
				</h4>
			</UI.SubSectionCustomHeader>
			{selectedSection?.sub_sections?.map((sub_section, sectionIndex) => {
				return (
					<Fragment key={`section-${sectionIndex}-${sub_section?.id}`}>
						{sub_section?.name ? (
							<SectionUI.SubSectionHeader>
								{sub_section.name}
							</SectionUI.SubSectionHeader>
						) : null}
						<SectionUI.FormWrapGrid>
							{sub_section?.fields?.map((field, fieldIndex) => {
								const customField = _.cloneDeep(field);
								customField.name = `${CONST.AID2_PREFIX_PRESENT}${
									customField.name
								}`;
								if (!customField.visibility) return null;
								const customFieldProps = {};
								return (
									<SectionUI.FieldWrapGrid
										key={`field-${fieldIndex}-${customField.name}`}
									>
										{register({
											...customField,
											value: prefilledValues(customField),
											...customFieldProps,
											visibility: 'visible',
										})}
										{(formState?.submit?.isSubmited ||
											formState?.touched?.[customField.name]) &&
											formState?.error?.[customField.name] &&
											(customField.sub_fields ? (
												<SectionUI.ErrorMessageSubFields>
													{formState?.error?.[customField.name]}
												</SectionUI.ErrorMessageSubFields>
											) : (
												<SectionUI.ErrorMessage>
													{formState?.error?.[customField.name]}
												</SectionUI.ErrorMessage>
											))}
									</SectionUI.FieldWrapGrid>
								);
							})}
						</SectionUI.FormWrapGrid>
					</Fragment>
				);
			})}
			<SectionUI.Footer>
				<Button
					fill
					name={`${isViewLoan ? 'Next' : 'Proceed'}`}
					isLoader={loading}
					disabled={isProceedDisabledAddressProof}
					onClick={handleSubmit(onProceed)}
					// onClick={onProceed}
				/>
			</SectionUI.Footer>
		</SectionUI.Wrapper>
	);
};

export default AddressDetails;
