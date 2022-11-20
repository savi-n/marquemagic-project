import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import _ from 'lodash';

import {
	updateApplicantSection,
	updateCoApplicantSection,
} from 'store/applicantCoApplicantsSlice';
import useForm from 'hooks/useFormIndividual';
import Button from 'components/Button';

import * as SectionUI from 'components/Sections/ui';
import * as UI from './ui';
import * as CONST_APP_CO_APP_HEADER from 'components/AppCoAppHeader/const';
import * as CONST_ADDRESS_PROOF_UPLOAD from 'components/AddressProofUpload/const';
import * as CONST from './const';
import { sleep } from 'utils/helper';
import { setSelectedSectionId } from 'store/appSlice';
import AddressProofUpload from 'components/AddressProofUpload';
import {
	removeLoanDocument,
	updateSelectedDocumentTypeId,
} from 'store/applicationSlice';
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
				coApplicants[selectedApplicantCoApplicantId].selectedAddressProofId;
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
		removeLoanDocument();
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
		updateSelectedDocumentTypeId(fileId, type);
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

	if (!selectedAddressProofId) {
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

	const addressProofUploadSection = selectedSection?.sub_sections?.[0] || {};
	const selectAddressProofRadioField =
		addressProofUploadSection?.fields?.[0] || {};
	const aadhaarProofOTPField = addressProofUploadSection?.fields?.[2] || {};
	const addressFields = selectedSection?.sub_sections?.[1]?.fields || [];

	// console.log('AddressDetails-allProps-', { selectedDocTypeList });
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
				{selectAddressProofRadioField?.options?.map((option, optionIndex) => {
					return (
						<UI.CardRadioButton key={`option${optionIndex}${option.req_type}`}>
							<input
								name={selectAddressProofRadioField?.name}
								id={option.req_type}
								type='radio'
								// value={option.req_type}
								onChange={e => {
									// TODO: remove document only belongs to app/coapp
									// removeAllAddressProofDocs()
									setSelectedAddressProofId(option.req_type);
								}}
								checked={selectedAddressProofId === option.req_type}
								visibility='visible'
							/>
							<label htmlFor={option.req_type} style={{ marginLeft: '10px' }}>
								{option.label}
							</label>
						</UI.CardRadioButton>
					);
				})}
			</UI.RadioButtonWrapper>
			<AddressProofUpload
				isInActive={isInActiveAddressProofUpload}
				// startingTaggedDocs={addressProofDocs}
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
					addressProofDocsRef?.current?.map(d => newAddressProofDocs.push(d));
					newDocs.map(d => newAddressProofDocs.push(d));
					setAddressProofDocs(newAddressProofDocs);
					addressProofDocsRef.current = newAddressProofDocs;
				}}
				documentTypeChangeCallback={handleDocumentTypeChangeAddressProof}
				aadharVoterDl={true}
				errorMessage={addressProofError}
				errorType={addressProofError && (isWarning ? 'warning' : 'error')}
				aadhaarProofOTPField={aadhaarProofOTPField}
			/>
			<SectionUI.FormWrapGrid>
				{addressFields?.map((field, fieldIndex) => {
					const customField = _.cloneDeep(field);
					customField.name = `${CONST.AID1_PREFIX_PERMANENT}${
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
								formState?.error?.[customField.name] && (
									<SectionUI.ErrorMessage>
										{formState?.error?.[customField.name]}
									</SectionUI.ErrorMessage>
								)}
						</SectionUI.FieldWrapGrid>
					);
				})}
			</SectionUI.FormWrapGrid>
			<div style={{ marginTop: 100 }} />
			{/* AID2_PREFIX_PRESENT */}
			{/* <UI.SubSectionCustomHeader>
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
			<SectionUI.FormWrapGrid>
				{addressFields?.map((field, fieldIndex) => {
					const customField = _.cloneDeep(field);
					customField.name = `${CONST.AID2_PREFIX_PRESENT}${customField.name}`;
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
			</SectionUI.FormWrapGrid> */}
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
