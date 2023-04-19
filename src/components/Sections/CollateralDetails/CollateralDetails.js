import React, { Fragment, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';

import Button from 'components/Button';

import { setSelectedSectionId, toggleTestMode } from 'store/appSlice';
import { formatGetSectionReqBody, formatINR } from 'utils/formatData';
import { API_END_POINT } from '_config/app.config';
import { updateApplicationSection } from 'store/applicationSlice';
import Loading from 'components/Loading';
import DynamicForm from './DynamicForm';
import editIcon from 'assets/icons/edit-icon.png';
import expandIcon from 'assets/icons/right_arrow_active.png';
import plusRoundIcon from 'assets/icons/plus_icon_round.png';
import * as UI_SECTIONS from 'components/Sections/ui';

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
		// isEditLoan,
		// editLoanData,
	} = app;
	const dispatch = useDispatch();
	const [fetchingSectionData, setFetchingSectionData] = useState(false);
	const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
	const [openAccordianId, setOpenAccordianId] = useState('');
	const [editSectionId, setEditSectionId] = useState('');
	const [sectionData, setSectionData] = useState([]);
	// const { handleSubmit, register, formState } = useForm();
	const MAX_ADD_COUNT = selectedSection?.max || 10;

	const naviagteToNextSection = () => {
		dispatch(setSelectedSectionId(nextSectionId));
	};
	const naviagteToPreviousSection = () => {
		dispatch(setSelectedSectionId(prevSectionId));
	};

	const openCreateForm = () => {
		setEditSectionId('');
		setOpenAccordianId('');
		setIsCreateFormOpen(true);
	};
	const toggleAccordian = (id, openOrClose) => {
		if (openOrClose === 'open') return setOpenAccordianId(id);
		if (openOrClose === 'close') return setOpenAccordianId('');
		return openAccordianId === id
			? setOpenAccordianId('')
			: setOpenAccordianId(id);
	};

	const fetchSectionDetails = async () => {
		try {
			setFetchingSectionData(true);
			const fetchRes = await axios.get(
				`${API_END_POINT}/collateralData?${formatGetSectionReqBody({
					application,
					applicantCoApplicants,
				})}`
			);
			// console.log('fetchRes-', fetchRes);
			if (fetchRes?.data?.data?.assetsAdditionalRecord?.length > 0) {
				setSectionData(fetchRes?.data?.data?.assetsAdditionalRecord);
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

	// console.log('employment-details-', { coApplicants, app });

	useEffect(() => {
		fetchSectionDetails();
		// eslint-disable-next-line
	}, []);

	return (
		<UI_SECTIONS.Wrapper style={{ paddingTop: 50 }}>
			{fetchingSectionData ? (
				<Loading />
			) : (
				<>
					<Fragment>
						<UI_SECTIONS.SubSectionHeader>
							Help Us With Your Colalteral Details
						</UI_SECTIONS.SubSectionHeader>
						{/* combine local + db array */}
						{sectionData.map((section, sectionIndex) => {
							const sectionId = section?.id;
							const isAccordianOpen = sectionId === openAccordianId;
							const isEditLoan = editSectionId === sectionId;
							const collateralData =
								section?.initial_collateral?.collateral_details || {};
							const addressData =
								section?.initial_collateral?.property_address_details || {};
							const prefillData = {
								...section,
								...collateralData,
								...addressData,
								property_amount: collateralData?.value || '',
								collateral_type: collateralData?.loan_type || '',
								current_market_value: collateralData?.loan_json || '',
								landmark: addressData?.name_landmark || '',
								address3: addressData?.name_landmark || '',
								pin_code: addressData?.pincode || '',
								nature_of_ownership: addressData?.owned_type || '',
								property_occupant: addressData?.current_occupant || '',
							};
							return (
								<UI_SECTIONS.AccordianWrapper>
									<UI_SECTIONS.AccordianHeader
										key={`accordian-${sectionIndex}`}
									>
										{isAccordianOpen ? null : (
											<>
												<UI_SECTIONS.AccordianHeaderData>
													<span>Collateral Type:</span>
													<strong>{prefillData?.nature_of_property}</strong>
												</UI_SECTIONS.AccordianHeaderData>
												<UI_SECTIONS.AccordianHeaderData>
													{/* <span>Type of Assets:</span>
													<strong>{prefillData?.loan_asset_type_id}</strong> */}
												</UI_SECTIONS.AccordianHeaderData>
												<UI_SECTIONS.AccordianHeaderData>
													<span>Amount:</span>
													<strong>
														{formatINR(prefillData?.property_amount)}
													</strong>
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
												subSections={selectedSection?.sub_sections || []}
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
											subSections={selectedSection?.sub_sections || []}
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
								<span>Click to add additional collateral</span>
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
						{!!selectedSection?.is_skip || !!isTestMode ? (
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

export default CollateralDetails;
