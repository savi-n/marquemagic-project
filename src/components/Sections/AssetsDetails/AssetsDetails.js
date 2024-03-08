import React, { useLayoutEffect } from 'react';
import { Fragment, useState } from 'react';
import axios from 'axios';

import Button from 'components/Button';
import Loading from 'components/Loading';
import NavigateCTA from 'components/Sections/NavigateCTA';

import { useSelector, useDispatch } from 'react-redux';
import { setSelectedSectionId } from 'store/appSlice';
import { setCompletedApplicationSection } from 'store/applicationSlice';
import { formatGetSectionReqBody, formatINR } from 'utils/formatData';
import * as UI_SECTIONS from 'components/Sections/ui';
import editIcon from 'assets/icons/edit-icon.png';
import expandIcon from 'assets/icons/right_arrow_active.png';
import plusRoundIcon from 'assets/icons/plus_icon_round.png';
import DynamicForm from './DynamicForm';
import { API_END_POINT } from '_config/app.config';
import { scrollToTopRootElement } from 'utils/helper';
// import selectedSection from './sample.json';

const AssetsDetails = props => {
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
	const [openAccordianId, setOpenAccordianId] = useState('');
	const [editSectionId, setEditSectionId] = useState('');
	const [fetchingSectionData, setFetchingSectionData] = useState(false);
	const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
	const [sectionData, setSectionData] = useState([]);
	const [loanPreFetchdata, setLoanPreFetchData] = useState([]);

	const MAX_ADD_COUNT = selectedSection?.sub_sections?.[0]?.max || 10;
	const business = {
		name: businessName || 'Company/Business',
		value: '0',
	}; // TODO: need to optimize business/applicant details here
	let newselectedDirectorOptions;
	if (selectedProduct?.isSelectedProductTypeBusiness)
		newselectedDirectorOptions = [business, ...selectedDirectorOptions];
	else newselectedDirectorOptions = selectedDirectorOptions;
	const openCreateForm = () => {
		setEditSectionId('');
		setOpenAccordianId('');
		setIsCreateFormOpen(true);
	};

	const fetchSectionDetails = async () => {
		try {
			setFetchingSectionData(true);
			const fetchRes = await axios.get(
				`${API_END_POINT}/assets_details?${formatGetSectionReqBody({
					application,
				})}`
			);
			if (fetchRes?.data?.data?.loanassets_records?.length > 0) {
				setSectionData(fetchRes?.data?.data?.loanassets_records);
				const loanFetchDataResult = JSON.parse(
					fetchRes?.data?.data?.loan_pre_fetch_data[0]?.initial_json || '{}'
				)?.asset_details;
				// const loanFetchDataResult = demoData?.business_data;
				setLoanPreFetchData(loanFetchDataResult);
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

	const onSaveAndProceed = () => {
		dispatch(setCompletedApplicationSection(selectedSectionId));
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
		scrollToTopRootElement();
		fetchSectionDetails();
		// eslint-disable-next-line
	}, []);

	return (
		<UI_SECTIONS.Wrapper style={{ marginTop: 50 }}>
			{fetchingSectionData ? (
				<Loading />
			) : (
				<>
					{selectedSection.sub_sections?.map((sub_section, sectionIndex) => {
						if (!sub_section?.is_dynamic) return null;
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

									const newAssestData =
										typeof section?.loan_json === 'string'
											? JSON.parse(section.loan_json || '{}')
											: section?.loan_json || '';

									const assetDataLowerCase = Object.entries(
										newAssestData
									).reduce((acc, [key, value]) => {
										acc[key.toLowerCase()] = value;
										return acc;
									}, {});

									const prefillData = section
										? {
												...section,
												...assetDataLowerCase,
												director_id:
													section?.director_id === 0
														? '0'
														: `${section?.director_id}`,
												...(section?.loan_json || {}),
										  }
										: {};
									return (
										<UI_SECTIONS.AccordianWrapper>
											<UI_SECTIONS.AccordianHeader
												key={`accordian-${sectionIndex}`}
											>
												{isAccordianOpen ? null : (
													<>
														<UI_SECTIONS.AccordianHeaderData>
															<span>Assets For:</span>
															<strong>
																{
																	newselectedDirectorOptions?.filter(
																		director =>
																			`${director?.value}` ===
																			`${prefillData?.director_id}`
																	)?.[0]?.name
																}
															</strong>
														</UI_SECTIONS.AccordianHeaderData>
														<UI_SECTIONS.AccordianHeaderData>
															<span>Type of Assets:</span>
															<strong>
																{prefillData?.loan_asset_type_id?.typename}
															</strong>
														</UI_SECTIONS.AccordianHeaderData>
														<UI_SECTIONS.AccordianHeaderData>
															<span>Amount:</span>
															<strong>
																{formatINR(
																	prefillData?.value ||
																		prefillData?.total_amount
																)}
															</strong>
														</UI_SECTIONS.AccordianHeaderData>
													</>
												)}
												<UI_SECTIONS.AccordianHeaderData
													style={
														isAccordianOpen
															? {
																	marginLeft: 'auto',
																	flex: 'none',
															  }
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
															openAccordianId !== sectionId &&
																onCancelCallback(openAccordianId);
															if (isCreateFormOpen || isEditLoan) return;
															toggleAccordian(sectionId);
														}}
														style={{
															transform: isAccordianOpen
																? 'rotate(270deg)'
																: 'rotate(90deg)',
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
														loanPreFetchdata={loanPreFetchdata}
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
													loanPreFetchdata={loanPreFetchdata}
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
						selectedProduct?.product_details?.is_individual_dedupe_required ||
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
							<Button
								fill
								name='Save and Proceed'
								// isLoader={!!editSectionId}
								disabled={isCreateFormOpen || !!editSectionId}
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

export default AssetsDetails;
