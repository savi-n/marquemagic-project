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
			console.log('fetchRes-', fetchRes);
			if (fetchRes?.data?.data?.loanAssetRecord?.length > 0) {
				setSectionData(fetchRes?.data?.data?.loanAssetRecord);
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
							const collateralData = section || {};
							const collateralDetailsSection = Array.isArray(section?.loan_json)
								? section?.loan_json?.[0]
								: section?.loan_json || {};
							const prefillData = {
								...collateralData,
								...collateralDetailsSection,

								// TODO: shreyas - remove individual mapping for fields which works properly from the above spread operator
								collateral_sub_type:
									collateralDetailsSection?.collateral_sub_type,
								current_market_value:
									collateralDetailsSection?.CurrentMarketValue,

								collateral_type: collateralDetailsSection?.Collateraltype,
								property_type: collateralDetailsSection?.property_type,

								total_area: collateralDetailsSection?.total_area,
								construction_area: collateralDetailsSection?.construction_area,

								age: collateralDetailsSection?.age,
								property_purpose: collateralDetailsSection?.property_purpose,

								property_amount: collateralDetailsSection?.value,

								property_ownership:
									collateralDetailsSection?.property_ownership,
								percent_share: collateralDetailsSection?.percent_share,

								owner_name: collateralDetailsSection?.owner_name,
								owner_type: collateralDetailsSection?.owner_type,

								ownership_from: collateralDetailsSection?.ownership_from,
								ownership_status: collateralDetailsSection?.ownership_status,
								pin_code: collateralData.pincode,
								nature_of_ownership: collateralData?.owned_type,
								property_occupant: collateralData?.current_occupant,
								address3: collateralData?.name_landmark,
								vehicle: collateralData?.brand_name,
								loan_type: collateralData?.loan_type,
								vehicle_value: collateralData?.value_Vehicle,
							};
							return (
								<UI_SECTIONS.AccordianWrapper>
									<UI_SECTIONS.AccordianHeader
										key={`accordian-${sectionIndex}`}
									>
										{isAccordianOpen ? null : (
											<>
												<UI_SECTIONS.AccordianHeaderData>
													<span>Assets For:</span>
													<strong>name</strong>
												</UI_SECTIONS.AccordianHeaderData>
												<UI_SECTIONS.AccordianHeaderData>
													<span>Type of Assets:</span>
													<strong>{prefillData?.loan_asset_type_id}</strong>
												</UI_SECTIONS.AccordianHeaderData>
												<UI_SECTIONS.AccordianHeaderData>
													<span>Amount:</span>
													<strong>{formatINR(prefillData?.value)}</strong>
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
