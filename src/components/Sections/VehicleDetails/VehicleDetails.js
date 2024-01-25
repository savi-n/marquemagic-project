import React, { useLayoutEffect } from 'react';
import { Fragment, useState } from 'react';
import axios from 'axios';

import Button from 'components/Button';
import Loading from 'components/Loading';
import NavigateCTA from 'components/Sections/NavigateCTA';

import * as CONST from './const';
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

const VehicleDetails = props => {
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
	const MAX_ADD_COUNT = selectedSection?.sub_sections?.[0]?.max || 10;
	const vehicleFields =
		selectedSection?.sub_sections?.find(
			section => section?.id === CONST.SUB_SECTION_NAME_VEHICLE_DETAILS
		)?.fields || [];
	const vehicleTypeOptions =
		vehicleFields?.find(field => field?.name === CONST.FIELD_NAME_VEHICLE_TYPE)
			?.options || [];
	const equipmentTypeOptions =
		vehicleFields?.find(
			field => field?.name === CONST.FIELD_NAME_EQUIPMENT_TYPE
		)?.options || [];
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
			const leadData=fetchRes?.data?.data.leads_data?.[0]			;
			const otherData = leadData?.other_data || '';
			const tempSectionData = otherData ? JSON.parse(otherData) : {};

			if (fetchRes?.data?.data?.vehicle_details?.length > 0 || tempSectionData?.assets?.length >0 ) {
				setSectionData([...fetchRes?.data?.data?.vehicle_details,...tempSectionData?.assets]);
				setEditSectionId('');
				setOpenAccordianId('');
				setIsCreateFormOpen(false);
			} else {
				setSectionData([]);
				if(tempSectionData?.assets?.length===0){

					openCreateForm();
					// setIsCreateFormOpen(true);
				}

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
					<Fragment>
						<UI_SECTIONS.SubSectionHeader>
							{selectedSection?.name || 'Vehicle Details'}
						</UI_SECTIONS.SubSectionHeader>
						{/* combine local + db array */}
						{sectionData.map((section, sectionIndex) => {
							const sectionId = section?.id || sectionIndex;
							// const leadDataSectionId=sectionIndex;
							const isAccordianOpen = sectionId === openAccordianId;
							const isEditLoan = editSectionId === sectionId;
							const prefillData = section
								? {
										...section?.loan_json?.rc_verification,
										...section?.loan_json?.auto_inspect,
										...section,
										asset_type:
										section?.loan_json?.rc_verification?.asset_type || section?.asset_type,
										equipment_type:
										section?.loan_json?.rc_verification?.equipment_type || section?.equipment_type_asset,
										vehicle_type:
										section?.loan_json?.rc_verification?.vehicle_type || section?.vehicle_type_asset,
										manufacturer_name:section?.loan_json?.rc_verification?.manufacturer_name || section?.manufacturer,
										equipment_model:
										section?.loan_json?.rc_verification?.equipment_model || section?.model
										,
										vehicle_model:
										section?.loan_json?.rc_verification?.vehicle_model || section?.model
										,
										director_id:
											section?.director_id === 0
												? '0'
												: `${section?.director_id}`,
										...(section || {}),
								  }
								: {};
							const isEquipment = prefillData?.loan_asset_type_id?.typename?.includes(
								'EQ'
							);
							const typeOfAsset = isEquipment
								? equipmentTypeOptions?.find(
										option => option?.value === prefillData?.equipment_type
								  )
								: vehicleTypeOptions?.find(
										option => option?.value === prefillData?.vehicle_type
								  ) || '';

							return (
								<UI_SECTIONS.AccordianWrapper>
									<UI_SECTIONS.AccordianHeader
										key={`accordian-${sectionIndex}`}
									>
										{isAccordianOpen  ? null : (
											<>
												<UI_SECTIONS.AccordianHeaderData>
													<span>
														{isEquipment ? 'Equipment' : 'Vehicle'} For:
													</span>
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
													<span>
														Type of {isEquipment ? 'Equipment' : 'Vehicle'}:
													</span>
													<strong>{typeOfAsset?.name}</strong>
												</UI_SECTIONS.AccordianHeaderData>
												<UI_SECTIONS.AccordianHeaderData>
													<span>Amount:</span>
													<strong>
														{formatINR(
															prefillData?.value || prefillData?.total_amount
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
												subSections={selectedSection?.sub_sections || []}
												// fields={sub_section?.fields || []}
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
											// fields={sub_section?.fields || []}
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
								<span>Click to add additional Vehicles</span>
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

export default VehicleDetails;
