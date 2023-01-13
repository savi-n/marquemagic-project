import React, { Fragment, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';

import useForm from 'hooks/useFormIndividual';
import Button from 'components/Button';

import { useToasts } from 'components/Toast/ToastProvider';
import { setSelectedSectionId, toggleTestMode } from 'store/appSlice';
import { formatSectionReqBody, getApiErrorMessage } from 'utils/formatData';
import { API_END_POINT } from '_config/app.config';
import { updateApplicationSection } from 'store/applicationSlice';
import * as UI_SECTIONS from 'components/Sections/ui';
import * as UI from './ui';
import * as CONST from './const';

const ReferenceDetails = () => {
	const { app, application, applicantCoApplicants } = useSelector(
		state => state
	);
	const {
		isViewLoan,
		selectedSectionId,
		nextSectionId,
		prevSectionId,
		selectedSection,
		isTestMode,
		isLocalhost,
		editLoanData,
		isEditLoan,
	} = app;
	const { refId1, refId2 } = application;
	const dispatch = useDispatch();
	const { addToast } = useToasts();
	const [loading, setLoading] = useState(false);
	const { handleSubmit, register, formState } = useForm();
	const naviagteToNextSection = () => {
		dispatch(setSelectedSectionId(nextSectionId));
	};
	const naviagteToPreviousSection = () => {
		dispatch(setSelectedSectionId(prevSectionId));
	};
	const onProceed = async () => {
		try {
			setLoading(true);
			const reference_details = [
				{
					id: refId1,
					ref_name: formState?.values?.Name0 || '',
					ref_email: formState?.values?.reference_email0 || '',
					ref_contact: formState?.values?.contact_number0 || '',
					ref_type: formState?.values?.ref_type0 || '',
					address1: formState?.values?.address_line10 || '',
					address2: formState?.values?.address_line20 || '',
					landmark: formState?.values?.landmark0 || '',
					ref_pincode: formState?.values?.pincode0 || '',
					ref_city: formState?.values?.city0 || '',
					ref_state: formState?.values?.state0 || '',
				},
				{
					id: refId2,
					ref_name: formState?.values?.Name1 || '',
					ref_email: formState?.values?.reference_email1 || '',
					ref_contact: formState?.values?.contact_number1 || '',
					ref_type: formState?.values?.ref_type1 || '',
					address1: formState?.values?.address_line11 || '',
					address2: formState?.values?.address_line21 || '',
					landmark: formState?.values?.landmark1 || '',
					ref_pincode: formState?.values?.pincode1 || '',
					ref_city: formState?.values?.city1 || '',
					ref_state: formState?.values?.state1 || '',
				},
			];
			const referenceDetailsReqBody = formatSectionReqBody({
				section: selectedSection,
				values: formState.values,
				app,
				applicantCoApplicants,
				application,
			});
			referenceDetailsReqBody.data.reference_details = reference_details;
			// console.log('-referenceDetailsRes-', {
			// 	referenceDetailsReqBody,
			// });
			const referenceDetailsRes = await axios.post(
				`${API_END_POINT}/LoanReferences/create`,
				referenceDetailsReqBody
			);
			const newRefId1 = referenceDetailsRes?.data?.data?.[0]?.id;
			const newRefId2 = referenceDetailsRes?.data?.data?.[1]?.id;
			// console.log('-referenceDetailsRes-', {
			// 	referenceDetailsRes,
			// });
			const newReferenceDetails = {
				sectionId: selectedSectionId,
				sectionValues: formState.values,
				refId1: newRefId1,
				refId2: newRefId2,
			};
			dispatch(updateApplicationSection(newReferenceDetails));
			dispatch(setSelectedSectionId(nextSectionId));
		} catch (error) {
			console.error('error-ReferenceDetails-onProceed-', {
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

	const onSkip = () => {
		const skipSectionData = {
			sectionId: selectedSectionId,
			sectionValues: {
				...(application?.[selectedSectionId] || {}),
				isSkip: true,
			},
		};
		dispatch(updateApplicationSection(skipSectionData));
		dispatch(setSelectedSectionId(nextSectionId));
	};

	const prefilledEditOrViewLoanValues = field => {
		const ref1Data = editLoanData?.reference_details?.[0] || {};
		const ref2Data = editLoanData?.reference_details?.[1] || {};
		const preData = {
			Name0: ref1Data?.ref_name,
			reference_email0: ref1Data?.ref_email,
			contact_number0: ref1Data?.ref_contact,
			ref_type0: ref1Data?.ref_type,
			address_line10: ref1Data?.address1,
			address_line20: ref1Data?.address2,
			landmark0: ref1Data?.landmark,
			pincode0: ref1Data?.ref_pincode,
			city0: ref1Data?.ref_city,
			state0: ref1Data?.ref_state,

			Name1: ref2Data?.ref_name,
			reference_email1: ref2Data?.ref_email,
			contact_number1: ref2Data?.ref_contact,
			ref_type1: ref2Data?.ref_type,
			address_line11: ref2Data?.address1,
			address_line21: ref2Data?.address2,
			landmark1: ref2Data?.landmark,
			pincode1: ref2Data?.ref_pincode,
			city1: ref2Data?.ref_city,
			state1: ref2Data?.ref_state,
		};
		// console.log('predata-', { bankData });
		return preData?.[field?.name];
	};

	const prefilledValues = field => {
		try {
			if (isViewLoan) {
				return prefilledEditOrViewLoanValues(field) || '';
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

			if (
				Object.keys(application?.sections?.[selectedSectionId] || {}).length > 0
			) {
				return application?.sections?.[selectedSectionId]?.[field?.name];
			}

			let editViewLoanValue = '';

			if (isEditLoan) {
				editViewLoanValue = prefilledEditOrViewLoanValues(field);
			}

			if (editViewLoanValue) return editViewLoanValue;

			return field?.value || '';
		} catch (error) {
			return {};
		}
	};

	// console.log('employment-details-', { coApplicants, app });

	return (
		<UI_SECTIONS.Wrapper style={{ paddingTop: 50 }}>
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
								// handle following changes in json // remove below code after verify
								// if (field.name.includes('pincode')) {
								// 	customFieldProps.type = 'pincode';
								// 	customFieldProps.value_for_fields = [
								// 		['city0', 'district'],
								// 		['state0', 'state'],
								// 	];
								// 	customFieldProps.rules = {
								// 		required: false,
								// 		length: 6,
								// 	};
								// 	customFieldProps.make_api_call = 6;
								// 	customFieldProps.mask = {
								// 		number_only: true,
								// 		character_limit: 6,
								// 	};
								// }
								return (
									<>
										{field.name === 'Name1' ? <UI.Divider /> : null}
										<UI_SECTIONS.FieldWrapGrid
											key={`field-${fieldIndex}-${field.name}`}
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
									</>
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
						onClick={handleSubmit(onProceed)}
					/>
				)}
				{isViewLoan && (
					<>
						<Button name='Previous' onClick={naviagteToPreviousSection} fill />
						<Button name='Next' onClick={naviagteToNextSection} fill />
					</>
				)}

				{!!selectedSection?.is_skip || !!isTestMode ? (
					<Button name='Skip' disabled={loading} onClick={onSkip} />
				) : null}
				{isLocalhost && !!isTestMode && (
					<Button
						fill={!!isTestMode}
						name='Auto Fill'
						onClick={() => dispatch(toggleTestMode())}
					/>
				)}
			</UI_SECTIONS.Footer>
		</UI_SECTIONS.Wrapper>
	);
};

export default ReferenceDetails;
