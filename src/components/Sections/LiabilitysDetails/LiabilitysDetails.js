import React, { useLayoutEffect } from 'react';
import { useState } from 'react';
import axios from 'axios';
import _ from 'lodash';

import Button from 'components/Button';
import NavigateCTA from 'components/Sections/NavigateCTA';
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedSectionId } from 'store/appSlice';
import { setCompletedApplicationSection } from 'store/applicationSlice';
import { formatGetSectionReqBody } from 'utils/formatData';
import Loading from 'components/Loading';
import * as UI_SECTIONS from 'components/Sections/ui';
import { API_END_POINT } from '_config/app.config';
import MultipleForm from './MultipleForm';
import useForm from 'hooks/useFormIndividual';

const LiabilitysDetails = props => {
	const { app, application } = useSelector(state => state);
	const { selectedDirectorOptions } = useSelector(state => state.directors);
	const {
		isViewLoan,
		selectedSectionId,
		nextSectionId,
		selectedSection,
		selectedProduct,
	} = app;
	const { businessName } = application;
	const dispatch = useDispatch();
	const [fetchingSectionData, setFetchingSectionData] = useState(false);
	const [sectionData, setSectionData] = useState([]);
	const [loanPreFetchdata, setLoanPreFetchData] = useState([]);

	const { register, formState } = useForm();

	const business = {
		name: businessName || 'Company/Business',
		value: '0',
	}; // get the business/applicant details here
	let newselectedDirectorOptions;
	if (businessName && selectedProduct?.isSelectedProductTypeBusiness)
		newselectedDirectorOptions = [business, ...selectedDirectorOptions];
	else newselectedDirectorOptions = selectedDirectorOptions;

	const fetchSectionDetails = async () => {
		try {
			setFetchingSectionData(true);
			const fetchRes = await axios.get(
				`${API_END_POINT}/liability_details?${formatGetSectionReqBody({
					application,
				})}`
			);
			if (fetchRes?.data?.data?.loanfinancials_records?.length > 0) {
				setSectionData(fetchRes?.data?.data?.loanfinancials_records);
				const loanFetchDataResult = JSON.parse(
					fetchRes?.data?.data?.loan_pre_fetch_data[0]?.initial_json || '{}'
				)?.loan_financial_data;
				setLoanPreFetchData(loanFetchDataResult);
			} else {
				setSectionData([]);
			}
		} catch (error) {
			console.error('error-fetchSectionDetails-', error);
			setSectionData([]);
		} finally {
			setFetchingSectionData(false);
		}
	};

	const onSaveAndProceed = () => {
		dispatch(setCompletedApplicationSection(selectedSectionId));
		dispatch(setSelectedSectionId(nextSectionId));
	};

	useLayoutEffect(() => {
		fetchSectionDetails();
		// eslint-disable-next-line
	}, []);

	const prefilledValues = field => {
		const isFormStateUpdated = formState?.values?.[field.name] !== undefined;
		if (isFormStateUpdated) {
			return formState?.values?.[field?.name];
		}

		const liabilitiesDetails = sectionData?.liabilities_details || {};

		const preData = {
			...liabilitiesDetails,
			credit_limit_consent1: 'false',
			credit_limit_consent2: 'false',
		};
		return field?.value || preData?.[field?.name] || '';
	};

	return (
		<UI_SECTIONS.Wrapper style={{ marginTop: 50 }}>
			{fetchingSectionData ? (
				<Loading />
			) : (
				<>
					{selectedSection.sub_sections?.map((sub_section, sectionIndex) => (
						<div key={`${sectionIndex}-${sub_section?.id}`}>
							{sub_section?.name ? (
								<UI_SECTIONS.SubSectionHeader>
									{sub_section.name}
								</UI_SECTIONS.SubSectionHeader>
							) : null}
							{sub_section?.is_dynamic ? (
								<MultipleForm
									sectionData={sectionData}
									sub_section={sub_section}
									loanPreFetchdata={loanPreFetchdata}
									fetchSectionDetails={fetchSectionDetails}
									directorOptions={newselectedDirectorOptions}
								/>
							) : (
								<UI_SECTIONS.FormWrapGrid>
									{sub_section?.fields?.map((field, fieldIndex) => {
										const newField = _.cloneDeep(field);
										const customFieldProps = {};
										const newFieldPrefilledValue = prefilledValues(newField);

										if (!newField.visibility) return null;
										if (newField?.for_type_name) {
											if (
												!newField?.for_type.includes(
													formState?.values?.[newField?.for_type_name]
												)
											)
												return null;
										}

										if (isViewLoan) {
											customFieldProps.disabled = true;
										}

										return (
											<UI_SECTIONS.FieldWrapGrid
												key={`field-${fieldIndex}-${newField.name}`}
											>
												{register({
													...newField,
													value: newFieldPrefilledValue,
													...customFieldProps,
													visibility: 'visible',
												})}
												{(formState?.submit?.isSubmited ||
													formState?.touched?.[newField.name]) &&
													formState?.error?.[newField.name] && (
														<UI_SECTIONS.ErrorMessage>
															{formState?.error?.[newField.name]}
														</UI_SECTIONS.ErrorMessage>
													)}
											</UI_SECTIONS.FieldWrapGrid>
										);
									})}
								</UI_SECTIONS.FormWrapGrid>
							)}
						</div>
					))}
					<UI_SECTIONS.Footer>
						{!isViewLoan && (
							<Button
								fill
								name='Save and Proceed'
								disabled={!sectionData?.length}
								onClick={onSaveAndProceed}
							/>
						)}

						<NavigateCTA />
					</UI_SECTIONS.Footer>
				</>
			)}
		</UI_SECTIONS.Wrapper>
	);
};

export default LiabilitysDetails;
