import React, { Fragment, useState, useLayoutEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';

import Button from 'components/Button';
import NavigateCTA from 'components/Sections/NavigateCTA';

import { setSelectedSectionId } from 'store/appSlice';
import { formatGetSectionReqBody, formatINR } from 'utils/formatData';
import { API_END_POINT } from '_config/app.config';
import { setCompletedApplicationSection } from 'store/applicationSlice';
import { scrollToTopRootElement } from 'utils/helper';
import Loading from 'components/Loading';
import DynamicForm from './DynamicForm';
import editIcon from 'assets/icons/edit-icon.png';
import expandIcon from 'assets/icons/right_arrow_active.png';
import plusRoundIcon from 'assets/icons/plus_icon_round.png';
import * as UI_SECTIONS from 'components/Sections/ui';
import _ from 'lodash';

const CollateralDetails = () => {
	const { app, application } = useSelector(state => state);
	const { isViewLoan, selectedSectionId, nextSectionId, selectedSection } = app;
	const { businessName } = application;
	const { directors } = useSelector(state => state.directors);
	const dispatch = useDispatch();
	const [fetchingSectionData, setFetchingSectionData] = useState(false);
	const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
	const [openAccordianId, setOpenAccordianId] = useState('');
	const [editSectionId, setEditSectionId] = useState('');
	const [sectionData, setSectionData] = useState([]);
	// const [sectionData, setuudata] = useState([
	// 	{
	// 		id: 17410,
	// 		loan_id: 771274142,
	// 		user_id: 128359,
	// 		account_number: null,
	// 		collateral_number: null,
	// 		initial_collateral: {
	// 			age: '2011-07',
	// 			city: 'Erode',
	// 			state: 'TAMIL NADU',
	// 			value: '2400000',
	// 			pincode: '638313',
	// 			address1: 'Anthiyur main road,goundaputhur',
	// 			address2: '',
	// 			loan_json: '2400000',
	// 			loan_type: 'Row Houses',
	// 			owned_type: 'Purchased',
	// 			owner_name: 'VELAYUTHAM',
	// 			owner_type: 'Current/Future',
	// 			total_area: '1310',
	// 			name_landmark: '',
	// 			percent_share: '100',
	// 			property_type: 'Row Houses',
	// 			ownership_from: '2011-04-01',
	// 			current_occupant: 'Self-Occupied',
	// 			ownership_status: 'Single',
	// 			property_purpose: 'Self Occupied',
	// 			construction_area: '750',
	// 			nature_of_property: 'Residential',
	// 			property_ownership: 'Free Hold',
	// 			collateral_sub_type: 'Ready Property',
	// 		},
	// 		saved_collateral: null,
	// 		modified_collateral: null,
	// 		created_at: '2023-07-28T12:00:08.000Z',
	// 		updated_at: '2023-07-28T12:00:08.000Z',
	// 		status: 'active',
	// 	},
	// ]);
	const [assets, setAssets] = useState([]);
	// const { handleSubmit, register, formState } = useForm();
	const MAX_ADD_COUNT = selectedSection?.max || 10;

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
				})}`
			);
			// console.log('fetchRes-', fetchRes);
			if (fetchRes?.data?.data?.loanAssetRecord?.length > 0) {
				setAssets(fetchRes.data.data.loanAssetRecord);
			}
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

	const onSaveAndProceed = () => {
		dispatch(setCompletedApplicationSection(selectedSectionId));
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

	useLayoutEffect(() => {
		scrollToTopRootElement();
		fetchSectionDetails();
		// eslint-disable-next-line
	}, []);

	///TODO: COLLATERAL ADD ASSET
	const collats_from_asset =
		assets &&
		assets.filter(asset => {
			return asset.loan_asset_type_id && asset.loan_asset_type_id === 71;
		});
	const newOptions = [
		{
			name: 'Add New',
			value: 'new',
		},
	];
	//check if this collateral is in existion collateral

	//Assets already added in collaterals
	const exclude_ids = [];
	sectionData &&
		sectionData.map(section =>
			exclude_ids.push(
				(section?.modified_collateral || section?.initial_collateral)
					?.collateral_details?.select_collateral
			)
		);

	collats_from_asset &&
		collats_from_asset.map(collats =>
			isCreateFormOpen
				? !exclude_ids.includes(`${collats.id}`) &&
				  newOptions.push({
						value: `${collats.id}`,
						name: `${
							collats?.director_id === 0
								? businessName
								: directors?.[collats?.director_id]?.fullName
						} - Survey # ${collats.survey_no}`,
				  })
				: // !exclude_ids.includes(`${collats.id}`) &&
				  newOptions.push({
						value: `${collats.id}`,
						name: `${
							collats?.director_id === 0
								? businessName
								: directors?.[collats?.director_id]?.fullName
						} - Survey # ${collats.survey_no}`,
				  })
		);

	const newSectons = _.cloneDeep(selectedSection);
	newSectons?.sub_sections?.filter(section => {
		if (section.id === 'collateral_details') {
			section.fields?.map(
				sec =>
					sec.name === 'select_collateral' && sec.options.push(...newOptions)
			);
		}
		return null;
	});
	//END TODO: COLLATERAL

	// console.log('CollateralDetails-allstates-', { selectedSection });

	return (
		<UI_SECTIONS.Wrapper style={{ paddingTop: 50 }}>
			{fetchingSectionData ? (
				<Loading />
			) : (
				<>
					<Fragment>
						<UI_SECTIONS.SubSectionHeader>
							{selectedSection?.name || 'Collateral Details'}
						</UI_SECTIONS.SubSectionHeader>
						{/* combine local + db array */}
						{sectionData?.map((section, sectionIndex) => {
							const sectionId = section?.id;
							const isAccordianOpen = sectionId === openAccordianId;
							const isEditLoan = editSectionId === sectionId;
							const collateralData =
								section?.modified_collateral?.collateral_details ||
								section?.initial_collateral?.collateral_details ||
								{};
							const addressData =
								section?.modified_collateral?.property_address_details ||
								section?.initial_collateral?.property_address_details ||
								{};

							const newCollateralData =
								Object.keys(collateralData)?.length === 0
									? section?.modified_collateral || section?.initial_collateral
									: collateralData;

							const newAddressData =
								Object.keys(addressData)?.length === 0 ? {} : addressData;

							const prefillData = {
								...section,
								...newAddressData,
								...newCollateralData,
								property_amount:
									collateralData?.value || newCollateralData?.value || '',
								collateral_type:
									collateralData?.loan_type ||
									newCollateralData?.loan_type ||
									'',
								collateral_sub_type:
									collateralData?.collateral_sub_type ||
									newCollateralData?.collateral_sub_type ||
									'',
								current_market_value:
									collateralData?.loan_json ||
									newCollateralData?.loan_json ||
									'',
								landmark:
									addressData?.name_landmark ||
									newCollateralData?.name_landmark ||
									'',
								address3:
									addressData?.name_landmark ||
									newCollateralData?.name_landmark ||
									'',
								pin_code:
									addressData?.pincode || newCollateralData?.pincode || '',
								nature_of_ownership:
									addressData?.owned_type ||
									newCollateralData?.owned_type ||
									'',
								property_occupant:
									addressData?.current_occupant ||
									newCollateralData?.current_occupant ||
									'',
							};
							// console.log('prefilldata-', prefillData);
							return (
								<UI_SECTIONS.AccordianWrapper key={`accordian-${sectionIndex}`}>
									<UI_SECTIONS.AccordianHeader>
										{isAccordianOpen ? null : (
											<>
												<UI_SECTIONS.AccordianHeaderData>
													<span>Collateral Type:</span>
													<strong>{prefillData?.collateral_type}</strong>
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
												subSections={newSectons?.sub_sections || []}
												// subSections={selectedSection?.sub_sections || []}
												prefillData={prefillData}
												onSaveOrUpdateSuccessCallback={
													onSaveOrUpdateSuccessCallback
												}
												// assets={assets}
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
											subSections={newSectons?.sub_sections || []}
											onSaveOrUpdateSuccessCallback={
												onSaveOrUpdateSuccessCallback
											}
											assets={assets}
											onCancelCallback={onCancelCallback}
											submitCTAName='Save'
											hideCancelCTA={!(sectionData?.length > 0)}
											isEditLoan={true}
											isCreateFormOpen={isCreateFormOpen}
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

export default CollateralDetails;
