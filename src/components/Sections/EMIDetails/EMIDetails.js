import React, { useEffect } from 'react';
import { Fragment, useState } from 'react';
import axios from 'axios';
import _ from 'lodash';

import Button from 'components/Button';
import NavigateCTA from 'components/Sections/NavigateCTA';

import useForm from 'hooks/useFormIndividual';
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedSectionId } from 'store/appSlice';
import { setCompletedApplicationSection } from 'store/applicationSlice';
import {
	createIndexKeyObjectFromArrayOfObject,
	formatSectionReqBody,
	parseJSON,
	formatGetSectionReqBody,
} from 'utils/formatData';
import { scrollToTopRootElement } from 'utils/helper';
import { API_END_POINT } from '_config/app.config';
import * as UI_SECTIONS from 'components/Sections/ui';
import * as UI from './ui';
import * as CONST from './const';
import Loading from 'components/Loading';

const EMIDetails = props => {
	const { app, application } = useSelector(state => state);
	const { directors, selectedDirectorId } = useSelector(
		state => state.directors
	);
	const selectedDirector = directors?.[selectedDirectorId] || {};
	const {
		isViewLoan,
		selectedSectionId,
		nextSectionId,
		selectedSection,
		isTestMode,
		// editLoanData,
		// isEditLoan,
		isEditOrViewLoan,
		bankList,
	} = app;
	const { businessId, loanRefId } = application;
	const dispatch = useDispatch();
	const [loading, setLoading] = useState(false);
	const selectedEmiDetailsSubSection = selectedSection?.sub_sections?.[0] || {};
	const [count, setCount] = useState(selectedEmiDetailsSubSection?.min || 3);
	const MAX_COUNT = selectedEmiDetailsSubSection?.max || 10;
	const { handleSubmit, register, formState } = useForm();
	const [sectionData, setSectionData] = useState([]);
	const [emiDetailsFinId, setEmiDetailsFinId] = useState('');
	const [emiDetailsIndex, setEmiDetailsIndex] = useState({});
	const [fetchingSectionData, setFetchingSectionData] = useState(false);

	const onSaveAndProceed = async () => {
		try {
			setLoading(true);

			let finalData = [];

			for (const key in formState.values) {
				const i = Number(key.substring(key.length - 1));
				const newKeyName = key.substring(0, key.length - 2);
				finalData[i] = {
					...(finalData[i] || {}),
					[newKeyName]: formState.values[key],
				};
			}
			const newValues = [];
			finalData.map(data => {
				if (data.emi_amount && data.bank_name) {
					let selectedBank = data?.bank_name;
					if (typeof selectedBank === 'string') {
						selectedBank = bankList.filter(
							bank => `${bank?.value}` === selectedBank
						)?.[0];
					}
					newValues.push({
						emi_amount: data?.emi_amount,
						bank_name: selectedBank?.name,
						bank_id: selectedBank?.value,
					});
				}
				return null;
			});
			const emiDetailsReqBody = formatSectionReqBody({
				section: selectedSection,
				values: newValues,
				app,
				selectedDirector,
				application,
			});

			emiDetailsReqBody.data.emi_details = newValues;
			if (emiDetailsFinId) emiDetailsReqBody.data.id = emiDetailsFinId;

			// console.log('-emiDetailsRes-', {
			// 	emiDetailsReqBody,
			// });
			// return;
			if (emiDetailsReqBody?.data?.emi_details?.length > 0) {
				// await axios.post(
				// 	`${API_END_POINT}/addBankDetailsNew`,
				// 	emiDetailsReqBody
				// );
				await axios.post(
					`${API_END_POINT}/liability_details`,
					emiDetailsReqBody
				);
			}
			// console.log('-emiDetailsRes-', {
			// 	emiDetailsRes,
			// });
			dispatch(setCompletedApplicationSection(selectedSectionId));
			dispatch(setSelectedSectionId(nextSectionId));
		} catch (error) {
			console.error('error-LoanDetails-onProceed-', error);
		} finally {
			setLoading(false);
		}
	};

	// const prefilledEditOrViewLoanValues = field => {
	// 	// console.log('emi details', editLoanData);
	// 	const emiDetails = parseJSON(
	// 		editLoanData?.bank_details?.filter(
	// 			bank => `${bank.id}` === `${emiDetailsFinId}`
	// 		)?.[0]?.emi_details || '{}'
	// 	);
	// 	const emiDetailsIndex = createIndexKeyObjectFromArrayOfObject({
	// 		arrayOfObject: emiDetails,
	// 		isEmiDetails: true,
	// 		isEditOrViewLoan,
	// 	});
	// 	const preData = {
	// 		...emiDetailsIndex,
	// 	};
	// 	return preData?.[field?.name];
	// };

	const prefilledValues = (field, index) => {
		try {
			// p1
			const isFormStateUpdated = formState?.values?.[field.name] !== undefined;
			if (isFormStateUpdated) {
				return formState?.values?.[field?.name];
			}
			// TEST MODE p2
			if (isTestMode && CONST.initialFormState?.[field?.name]) {
				return CONST.initialFormState?.[field?.name];
			}
			if (field?.name?.includes('emi_amount')) {
				return emiDetailsIndex?.[field?.name];
			}
			if (field?.name?.includes('bank_name')) {
				return emiDetailsIndex?.[`bank_id_${index}`];
			}
			// -- TEST MODE
		} catch (error) {
			return {};
		}
	};

	const onAdd = () => {
		if (isViewLoan) return;
		if (count >= MAX_COUNT) return;
		setCount(count + 1);
	};

	const createForm = subSection => {
		let sections = [];
		const filledCount =
			Object.keys(sectionData)?.length > count
				? Object.keys(sectionData)?.length
				: count;
		// old starts
		// let filledCount =
		// 	Object.keys(application?.sections?.[selectedSectionId] || {}).length === 0
		// 		? 0
		// 		: Object.keys(application?.sections?.[selectedSectionId] || {}).length /
		// 		  2;
		// console.log({ filledCount });
		// if (!isNaN(filledCount) && filledCount > count) setCount(filledCount);
		// else filledCount = count;
		// old ends

		for (let x = 0; x < filledCount; x++) {
			sections?.push(subSection);
		}
		// console.log({ sections, appsec: application, filledCount, subSection });
		return sections;
	};

	const renderSubSection = (sub_section, index) =>
		sub_section.fields?.map((field, fieldIndex) => {
			const newField = _.cloneDeep(field);
			if (!newField.visibility) return null;
			if (newField?.for_type_name) {
				if (
					!newField?.for_type.includes(
						index
							? formState?.values?.[newField?.for_type_name]
							: formState?.values?.[newField?.for_type_name]
					)
				)
					return null;
			}
			const customFieldProps = {};
			if (isViewLoan) {
				customFieldProps.disabled = true;
			}
			newField.db_key = newField.db_key + '_' + index;
			newField.name = newField.name + '_' + index;
			return (
				<UI_SECTIONS.FieldWrapGrid
					id={`field-${index}-${fieldIndex}-${newField.name}`}
					key={`field-${index}-${fieldIndex}-${newField.name}`}
				>
					{register({
						...newField,
						value: prefilledValues(newField, index),
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
		});

	const fetchSectionDetails = async () => {
		try {
			setFetchingSectionData(true);

			const fetchRes = await axios.get(
				`${API_END_POINT}/liability_details?${formatGetSectionReqBody({
					application,
				})}`
			);
			if (fetchRes?.data?.status === 'ok') {
				const records = fetchRes?.data?.data?.loanfinancials_records?.[0] || {};
				const emiData = parseJSON(records?.emi_details);
				// console.log({ emiData });
				const indexedValues = createIndexKeyObjectFromArrayOfObject({
					arrayOfObject: emiData,
					isEmiDetails: true,
					isEditOrViewLoan,
				});
				const tempCount = emiData?.length > count ? emiData?.length : count;
				setSectionData(emiData);
				setCount(tempCount);
				setEmiDetailsIndex(indexedValues);
				setEmiDetailsFinId(records?.id || '');
			}
		} catch (err) {
			console.error({
				errorMessage: err.message,
				location: 'get-method-emi-details',
			});
		} finally {
			setFetchingSectionData(false);
		}
	};

	useEffect(() => {
		if (businessId && loanRefId) fetchSectionDetails();
		scrollToTopRootElement();
		// if (isEditOrViewLoan) {
		// 	const emiDetails = parseJSON(
		// 		editLoanData?.bank_details?.filter(
		// 			bank => `${bank?.id}` === `${emiDetailsFinId}`
		// 		)?.[0]?.emi_details || '{}'
		// 	);
		// 	if (emiDetails.length > 3) {
		// 		setCount(emiDetails.length);
		// 	}
		// }
		// eslint-disable-next-line
	}, []);

	// console.log('EMIDetails-allstates-', {
	// 	app,
	// 	selectedSection,
	// 	selectedEmiDetailsSubSection,
	// });

	return (
		<>
			{fetchingSectionData ? (
				<Loading />
			) : (
				<UI_SECTIONS.Wrapper style={{ marginTop: 50 }}>
					{selectedSection.sub_sections?.map((sub_section, sectionIndex) => {
						return (
							<Fragment key={`section-${sectionIndex}-${sub_section?.id}`}>
								{sub_section?.name ? (
									<UI_SECTIONS.SubSectionHeader>
										{sub_section.name}
									</UI_SECTIONS.SubSectionHeader>
								) : null}
								<UI_SECTIONS.FormWrapGrid>
									{sub_section?.is_dynamic === true
										? createForm(sub_section, count).map(
												(sub_section_array, index) => {
													return renderSubSection(sub_section_array, index);
												}
										  )
										: renderSubSection(sub_section)}
								</UI_SECTIONS.FormWrapGrid>
							</Fragment>
						);
					})}
					<UI.AddMoreWrapper>
						<UI.RoundButton
							onClick={onAdd}
							disabled={isViewLoan || count >= MAX_COUNT}
						>
							+
						</UI.RoundButton>{' '}
						click to add additional deductions/repayment obligations
					</UI.AddMoreWrapper>
					<UI_SECTIONS.Footer>
						{!isViewLoan && (
							<Button
								fill
								name='Save and Proceed'
								isLoader={loading}
								disabled={loading}
								onClick={handleSubmit(onSaveAndProceed)}
							/>
						)}

						<NavigateCTA />
					</UI_SECTIONS.Footer>
				</UI_SECTIONS.Wrapper>
			)}
		</>
	);
};

export default EMIDetails;
