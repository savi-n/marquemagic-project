import React, { Fragment, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';

import useForm from 'hooks/useFormIndividual';
import Button from 'components/Button';

import { setSelectedSectionId } from 'store/appSlice';
import { formatSectionReqBody } from 'utils/formatData';
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
		selectedProduct,
		nextSectionId,
		isTestMode,
		selectedSection,
	} = app;
	const { loanAssetsId, assetsAdditionalId } = application;
	const dispatch = useDispatch();
	const [loading, setLoading] = useState(false);
	const { handleSubmit, register, formState } = useForm();

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
			console.error('error-CollateralDetails-onProceed-', error);
		} finally {
			setLoading(false);
		}
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

			return (
				application?.sections?.[selectedSectionId]?.[field?.name] ||
				field.value ||
				''
			);
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
				<Button
					fill
					name={`${isViewLoan ? 'Next' : 'Proceed'}`}
					isLoader={loading}
					disabled={loading}
					onClick={handleSubmit(onProceed)}
				/>
			</SectionUI.Footer>
		</SectionUI.Wrapper>
	);
};

export default CollateralDetails;
