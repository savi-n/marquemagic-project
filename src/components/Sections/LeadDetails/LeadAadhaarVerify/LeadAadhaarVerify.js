import React from 'react';
import * as UI from './ui';
import * as UI_SECTIONS from 'components/Sections/ui';
import * as CONST from '../const';
import Button from 'components/Button';
import { useSelector } from 'react-redux';
import { isDirectorApplicant, isFieldValid } from 'utils/formatData';
import GreenTick from 'assets/icons/green_tick_icon.png';
const LeadAadhaarVerify = props => {
	const {
		field,
		disabled = false,
		register,
		formState,
		prefilledValues,
		addressProofUploadSection,
		onClickVerifyWithOtp,
		verifyingWithOtp,
		isSectionCompleted,
		directorDetails,
		selectedVerifyOtp,
		isViewLoan,
	} = props;
	const aadhaarProofOTPField = addressProofUploadSection?.fields?.[5] || {};
	const { directors, selectedDirectorId } = useSelector(
		state => state.directors
	);
	const selectedDirector = directors?.[selectedDirectorId] || {};

	const isApplicant = isDirectorApplicant(selectedDirector);
	const customFieldProps = {};
	if (selectedVerifyOtp?.res?.status === 'ok') {
		customFieldProps.disabled = true;
	}
	if (disabled) {
		customFieldProps.disabled = disabled;
	}
	if (isSectionCompleted) {
		customFieldProps.disabled = true;
	}

	if (isViewLoan) {
		customFieldProps.disabled = true;
	}

	return (
		<UI_SECTIONS.FieldWrapGrid>
			{field?.name === CONST.AADHAR_OTP_FIELD_NAME && (
				<UI.AadhaarFieldWrapper>
					{register({
						...aadhaarProofOTPField,
						value: prefilledValues(aadhaarProofOTPField),
						visibility: 'visible',
						...customFieldProps,
					})}
					{(selectedVerifyOtp?.res?.status === 'ok' ||
						selectedDirector?.is_aadhaar_otp_verified === true) && (
						<UI.GreenTickImage src={GreenTick} alt='green tick' />
					)}

					{aadhaarProofOTPField?.sub_fields
						?.filter(f => !f?.is_prefix)
						?.map(subField => {
							if (
								!isFieldValid({
									field: subField,
									isApplicant,
									formState: {},
								})
							) {
								return null;
							}
							if (subField?.type === 'button') {
								return (
									<Button
										key={subField?.placeholder}
										name={subField?.placeholder}
										isLoader={verifyingWithOtp}
										disabled={
											// isSectionCompleted ||
											directorDetails?.is_aadhaar_otp_verified ||
											selectedVerifyOtp?.res?.status === 'ok' ||
											!formState.values[aadhaarProofOTPField.name] ||
											isViewLoan ||
											verifyingWithOtp
											// (directors?.filter(
											// 	director =>
											// 		`${director?.id}` ===
											// 		`${selectedDirector?.directorId}`
											// ).length > 0 &&
											// 	isEditLoan)
										}
										type='button'
										customStyle={{
											whiteSpace: 'nowrap',
											width: '150px',
											minWidth: '150px',
											height: '45px',
										}}
										onClick={() => {
											onClickVerifyWithOtp(aadhaarProofOTPField);
										}}
									/>
								);
							}
							if (subField?.type === 'link') {
								return (
									<Button
										name={subField?.placeholder}
										type='button'
										customStyle={{
											whiteSpace: 'nowrap',
											width: '150px',
											minWidth: '150px',
											height: '45px',
										}}
										onClick={() => window.open(subField?.link, '_blank')}
									/>
								);
							}
							return null;
						})}
					{(formState?.submit?.isSubmited ||
						formState?.touched?.[aadhaarProofOTPField.name]) &&
						formState?.error?.[aadhaarProofOTPField.name] && (
							<UI_SECTIONS.ErrorMessageSubFields>
								{formState?.error?.[aadhaarProofOTPField.name]}
							</UI_SECTIONS.ErrorMessageSubFields>
						)}
				</UI.AadhaarFieldWrapper>
			)}
		</UI_SECTIONS.FieldWrapGrid>
	);
};

export default LeadAadhaarVerify;
