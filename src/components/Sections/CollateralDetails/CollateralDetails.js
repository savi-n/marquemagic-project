import React, { Fragment, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';

import useForm from 'hooks/useFormIndividual';
import Button from 'components/Button';

import { setSelectedSectionId, toggleTestMode } from 'store/appSlice';
import { useToasts } from 'components/Toast/ToastProvider';
import { formatSectionReqBody, getApiErrorMessage } from 'utils/formatData';
import { API_END_POINT } from '_config/app.config';
import { updateApplicationSection } from 'store/applicationSlice';
import * as SectionUI from 'components/Sections/ui';
import * as CONST from './const';

const CollateralDetails = () => {
	const { app, application, applicantCoApplicants } = useSelector(
		state => state
	);
	const {
		isViewLoan,
		selectedSectionId,
		nextSectionId,
		prevSectionId,
		selectedSection,
		isLocalhost,
		isTestMode,
		isEditLoan,
		editLoanData,
	} = app;
	const { loanAssetsId, assetsAdditionalId } = application;
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
			const collateralDetailsReqBody = formatSectionReqBody({
				section: selectedSection,
				values: formState.values,
				app,
				applicantCoApplicants,
				application,
			});
			if (loanAssetsId) collateralDetailsReqBody.loan_assets_id = loanAssetsId;
			if (assetsAdditionalId)
				collateralDetailsReqBody.assets_additional_id = assetsAdditionalId;

			const collateralDetailsRes = await axios.post(
				`${API_END_POINT}/collateralData`,
				collateralDetailsReqBody
			);
			// console.log('-collateralDetailsRes-', {
			// 	collateralDetailsReqBody,
			// 	collateralDetailsRes,
			// });
			const newLoanAssetsId = collateralDetailsRes?.data?.data?.loan_assets_id;
			const newAssetsAdditionalId =
				collateralDetailsRes?.data?.data?.assets_additional_id;
			const newCollateralDetails = {
				sectionId: selectedSectionId,
				sectionValues: formState.values,
				loanAssetsId: newLoanAssetsId,
				assetsAdditionalId: newAssetsAdditionalId,
			};
			dispatch(updateApplicationSection(newCollateralDetails));
			dispatch(setSelectedSectionId(nextSectionId));
		} catch (error) {
			console.error('error-CollateralDetails-onProceed-', {
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
		const collateralData = editLoanData?.loan_assets?.[0] || {};
		const collateralDetailsSection = collateralData?.loan_json || {};
		const preData = {
			...collateralData,
			collateral_type: collateralDetailsSection?.Collateraltype,
			current_market_value: collateralDetailsSection?.CurrentMarketValue,
			pin_code: collateralData.pincode,
			nature_of_ownership: collateralData?.owned_type,
			property_occupant: collateralData?.current_occupant,
			address3: collateralData?.name_landmark,
			vehicle: collateralData?.brand_name,
			loan_type: collateralData?.loan_type,
			vehicle_value: collateralData?.value_Vehicle,
		};
		// console.log('predata-', { preData });
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
		<SectionUI.Wrapper style={{ paddingTop: 50 }}>
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
									<SectionUI.FieldWrapGrid
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
												<SectionUI.ErrorMessageSubFields>
													{formState?.error?.[field.name]}
												</SectionUI.ErrorMessageSubFields>
											) : (
												<SectionUI.ErrorMessage>
													{formState?.error?.[field.name]}
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

				{/* buttons for easy development starts */}
				{!!selectedSection?.is_skip || !!isTestMode ? (
					<Button name='Skip' disabled={loading} onClick={onSkip} />
				) : null}
				{isLocalhost && !isViewLoan && (
					<Button
						fill={!!isTestMode}
						name='Auto Fill'
						onClick={() => dispatch(toggleTestMode())}
					/>
				)}
				{/* buttons for easy development ends */}
			</SectionUI.Footer>
		</SectionUI.Wrapper>
	);
};

export default CollateralDetails;
