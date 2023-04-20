import React, { Fragment, useState, useLayoutEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';

import Button from 'components/Button';
import Loading from 'components/Loading';

import { setSelectedSectionId, toggleTestMode } from 'store/appSlice';
import { updateApplicationSection } from 'store/applicationSlice';

import { formatGetSectionReqBody } from 'utils/formatData';
import { API_END_POINT } from '_config/app.config';
import editIcon from 'assets/icons/edit-icon.png';
import expandIcon from 'assets/icons/right_arrow_active.png';
import plusRoundIcon from 'assets/icons/plus_icon_round.png';
import DynamicForm from './DynamicForm';
import * as UI_SECTIONS from 'components/Sections/ui';

const BankDetails = () => {
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
		// isEditLoan,
	} = app;
	const dispatch = useDispatch();
	const [openAccordianId, setOpenAccordianId] = useState('');
	const [editSectionId, setEditSectionId] = useState('');
	const [fetchingSectionData, setFetchingSectionData] = useState(false);
	const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
	const [sectionData, setSectionData] = useState([]);
	const MAX_ADD_COUNT = selectedSection?.max || 10;

	const openCreateForm = () => {
		setEditSectionId('');
		setOpenAccordianId('');
		setIsCreateFormOpen(true);
	};

	const fetchSectionDetails = async () => {
		try {
			setFetchingSectionData(true);
			const fetchRes = await axios.get(
				`${API_END_POINT}/bank_details?${formatGetSectionReqBody({
					application,
					applicantCoApplicants,
				})}`
			);
			// console.log('fetchRes-', fetchRes);
			if (fetchRes?.data?.data?.length > 0) {
				setSectionData(fetchRes?.data?.data);
				setEditSectionId('');
				setOpenAccordianId('');
				setIsCreateFormOpen(false);
			} else {
				setSectionData([]);
				openCreateForm();
			}
		} catch (error) {
			console.error('error-fetchSectionDetails-', error);
			setSectionData([]);
			openCreateForm();
		} finally {
			setFetchingSectionData(false);
		}
	};

	const naviagteToNextSection = () => {
		dispatch(setSelectedSectionId(nextSectionId));
	};

	const naviagteToPreviousSection = () => {
		dispatch(setSelectedSectionId(prevSectionId));
	};

	const onSkip = () => {
		const skipSectionData = {
			sectionId: selectedSectionId,
			sectionValues: {
				isSkip: true,
			},
		};
		dispatch(updateApplicationSection(skipSectionData));
		dispatch(setSelectedSectionId(nextSectionId));
	};

	const toggleAccordian = (id, openOrClose) => {
		if (openOrClose === 'open') return setOpenAccordianId(id);
		if (openOrClose === 'close') return setOpenAccordianId('');
		return openAccordianId === id
			? setOpenAccordianId('')
			: setOpenAccordianId(id);
	};

	const onSaveOrUpdateSuccessCallback = () => {
		fetchSectionDetails();
	};

	const onCancelCallback = deleteEditSectionId => {
		if (deleteEditSectionId) {
			setEditSectionId('');
		} else {
			setIsCreateFormOpen(false);
		}
		setOpenAccordianId('');
	};

	useLayoutEffect(() => {
		fetchSectionDetails();
		// eslint-disable-next-line
	}, []);

	// const prefilledEditOrViewLoanValues = field => {
	// 	const bankData =
	// 		editLoanData?.bank_details?.filter(
	// 			data => data.fin_type === CONST.FIN_TYPE_BANK_ACCOUNT
	// 		)?.[0] || {};
	// 	const preData = {
	// 		bank_name: bankData?.bank_id,
	// 		account_number: bankData?.account_number,
	// 		ifsc_code: bankData?.IFSC,
	// 		account_type: bankData?.account_type,
	// 		account_holder_name: bankData?.account_holder_name,
	// 		start_date: bankData?.outstanding_start_date,
	// 		end_date: bankData?.outstanding_end_date,
	// 	};
	// 	// console.log('predata-', { bankData });
	// 	return preData?.[field?.name];
	// };

	// const prefilledValues = field => {
	// 	try {
	// 		if (isViewLoan) {
	// 			return prefilledEditOrViewLoanValues(field) || '';
	// 		}

	// 		const isFormStateUpdated = formState?.values?.[field.name] !== undefined;
	// 		if (isFormStateUpdated) {
	// 			return formState?.values?.[field.name];
	// 		}

	// 		// TEST MODE
	// 		if (isTestMode && CONST.initialFormState?.[field?.name]) {
	// 			return CONST.initialFormState?.[field?.name];
	// 		}
	// 		// -- TEST MODE

	// 		if (
	// 			Object.keys(application?.sections?.[selectedSectionId] || {}).length > 0
	// 			// &&
	// 			// !application?.sections?.[selectedSectionId]?.hasOwnProperty('isSkip')
	// 		) {
	// 			return application?.sections?.[selectedSectionId]?.[field?.name];
	// 		}

	// 		let editViewLoanValue = '';

	// 		if (isEditLoan) {
	// 			editViewLoanValue = prefilledEditOrViewLoanValues(field);
	// 		}

	// 		if (editViewLoanValue) return editViewLoanValue;

	// 		return field?.value || '';
	// 	} catch (error) {
	// 		return {};
	// 	}
	// };

	// console.log('bank-details-', { app, application });

	return (
		<UI_SECTIONS.Wrapper style={{ marginTop: 50 }}>
			{fetchingSectionData ? (
				<Loading />
			) : (
				<>
					{selectedSection.sub_sections?.map((sub_section, sectionIndex) => {
						return (
							<Fragment key={`section-${sectionIndex}-${sub_section?.id}`}>
								{sub_section?.name ? (
									<UI_SECTIONS.SubSectionHeader>
										{sub_section.name}
									</UI_SECTIONS.SubSectionHeader>
								) : null}
								{/* combine local + db array */}
								{sectionData.map((section, sectionIndex) => {
									const sectionId = section?.id;
									const isAccordianOpen = sectionId === openAccordianId;
									const isEditLoan = editSectionId === sectionId;
									const prefillData = {
										...(section || {}),
										bank_name: `${section?.bank_id || ''}`,
										ifsc_code: section?.IFSC || '',
										start_date: section?.outstanding_start_date,
										end_date: section?.outstanding_end_date,
									};
									return (
										<UI_SECTIONS.AccordianWrapper>
											<UI_SECTIONS.AccordianHeader
												key={`accordian-${sectionIndex}`}
											>
												{isAccordianOpen ? null : (
													<>
														<UI_SECTIONS.AccordianHeaderData>
															<span>Name:</span>
															<strong>
																{prefillData?.account_holder_name}
															</strong>
														</UI_SECTIONS.AccordianHeaderData>
														<UI_SECTIONS.AccordianHeaderData>
															{/* <span>Type of Assets:</span>
															<strong>{prefillData?.loan_asset_type_id}</strong> */}
														</UI_SECTIONS.AccordianHeaderData>
														<UI_SECTIONS.AccordianHeaderData>
															<span>AC#:</span>
															<strong>{prefillData?.account_number}</strong>
														</UI_SECTIONS.AccordianHeaderData>
													</>
												)}
												<UI_SECTIONS.AccordianHeaderData
													style={
														isAccordianOpen
															? { marginLeft: 'auto', flex: 'none' }
															: { flex: 'none' }
													}
												>
													{isViewLoan ? null : (
														<UI_SECTIONS.AccordianIcon
															src={editIcon}
															alt='edit'
															onClick={() => {
																if (isCreateFormOpen || isEditLoan) return;
																toggleAccordian(sectionId, 'open');
																setTimeout(() => {
																	setEditSectionId(sectionId);
																}, 200);
															}}
															style={
																isCreateFormOpen || isEditLoan
																	? {
																			cursor: 'not-allowed',
																			visibility: 'hidden',
																	  }
																	: {}
															}
														/>
													)}
													<UI_SECTIONS.AccordianIcon
														src={expandIcon}
														alt='toggle'
														onClick={() => {
															if (isCreateFormOpen || isEditLoan) return;
															toggleAccordian(sectionId);
														}}
														style={{
															transform: 'rotate(90deg)',
															...(isCreateFormOpen || isEditLoan
																? {
																		cursor: 'not-allowed',
																		visibility: 'hidden',
																  }
																: {}),
														}}
													/>
												</UI_SECTIONS.AccordianHeaderData>
											</UI_SECTIONS.AccordianHeader>
											<UI_SECTIONS.AccordianBody isOpen={isAccordianOpen}>
												{isAccordianOpen && !isCreateFormOpen && (
													<DynamicForm
														fields={sub_section?.fields || []}
														prefillData={prefillData}
														onSaveOrUpdateSuccessCallback={
															onSaveOrUpdateSuccessCallback
														}
														onCancelCallback={onCancelCallback}
														isEditLoan={isEditLoan}
														editSectionId={editSectionId}
														isCreateFormOpen={isCreateFormOpen}
													/>
												)}
												{/* {isResetFormComplete ? (
											<DynamicForm fields={sub_section?.fields || []} />
										) : null} */}
											</UI_SECTIONS.AccordianBody>
										</UI_SECTIONS.AccordianWrapper>
									);
								})}
								<div style={{ marginTop: 30 }} />
								{isCreateFormOpen && (
									<UI_SECTIONS.AccordianWrapper>
										<UI_SECTIONS.AccordianBody
											isOpen={true}
											style={{ padding: 30 }}
										>
											<UI_SECTIONS.DynamicFormWrapper>
												<DynamicForm
													fields={sub_section?.fields || []}
													onSaveOrUpdateSuccessCallback={
														onSaveOrUpdateSuccessCallback
													}
													onCancelCallback={onCancelCallback}
													submitCTAName='Save'
													hideCancelCTA={!(sectionData?.length > 0)}
													isEditLoan={true}
												/>
											</UI_SECTIONS.DynamicFormWrapper>
										</UI_SECTIONS.AccordianBody>
									</UI_SECTIONS.AccordianWrapper>
								)}
							</Fragment>
						);
					})}
					<UI_SECTIONS.AddDynamicSectionWrapper>
						{isCreateFormOpen ||
						isViewLoan ||
						sectionData?.length >= MAX_ADD_COUNT ||
						!!editSectionId ? null : (
							<>
								<UI_SECTIONS.PlusRoundButton
									src={plusRoundIcon}
									onClick={openCreateForm}
								/>
								<span>Click to add additional assets</span>
							</>
						)}
					</UI_SECTIONS.AddDynamicSectionWrapper>
					<UI_SECTIONS.Footer>
						{!isViewLoan && (
							<Button fill name='Save and Proceed' onClick={onSkip} />
						)}

						{isViewLoan && (
							<>
								<Button
									name='Previous'
									onClick={naviagteToPreviousSection}
									fill
								/>
								<Button name='Next' onClick={naviagteToNextSection} fill />
							</>
						)}

						{/* buttons for easy development starts */}
						{!isViewLoan && (!!selectedSection?.is_skip || !!isTestMode) ? (
							<Button name='Skip' onClick={onSkip} />
						) : null}
						{isLocalhost && !isViewLoan && (
							<Button
								fill={!!isTestMode}
								name='Auto Fill'
								onClick={() => dispatch(toggleTestMode())}
							/>
						)}
						{/* buttons for easy development ends */}
					</UI_SECTIONS.Footer>
				</>
			)}
		</UI_SECTIONS.Wrapper>
	);
};

export default BankDetails;
