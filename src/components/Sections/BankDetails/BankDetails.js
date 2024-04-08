import React, { Fragment, useState, useLayoutEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';

import Button from 'components/Button';
import Loading from 'components/Loading';
import NavigateCTA from 'components/Sections/NavigateCTA';

import { setSelectedSectionId } from 'store/appSlice';
import { setCompletedApplicationSection } from 'store/applicationSlice';

import { formatGetSectionReqBody } from 'utils/formatData';
import { API_END_POINT, DELETE_LOAN_FIN } from '_config/app.config';
import { scrollToTopRootElement } from 'utils/helper';
import editIcon from 'assets/icons/edit-icon.png';
import expandIcon from 'assets/icons/right_arrow_active.png';
import plusRoundIcon from 'assets/icons/plus_icon_round.png';
import iconDelete from 'assets/icons/grey_delete_icon.png';
import iconSuccess from 'assets/icons/success_icon.png';
import iconWarning from 'assets/icons/amber_warning_icon.png';
import DynamicForm from './DynamicForm';
import * as UI_SECTIONS from 'components/Sections/ui';
import { useToasts } from 'components/Toast/ToastProvider';
import DeletionWarningModal from 'components/modals/DeleteWarningModal';

const BankDetails = () => {
	const { app, application } = useSelector(state => state);
	const {
		isViewLoan,
		selectedSectionId,
		nextSectionId,
		selectedSection,
		userToken,
		selectedProduct,
		userDetails,
	} = app;
	const { addToast } = useToasts();
	const { loanId } = application;
	const dispatch = useDispatch();
	const [openAccordianId, setOpenAccordianId] = useState('');
	const [editSectionId, setEditSectionId] = useState('');
	const [fetchingSectionData, setFetchingSectionData] = useState(false);
	const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
	const [sectionData, setSectionData] = useState([]);
	const [isDeleteWarningModalOpen, setIsDeleteWarningModalOpen] = useState(
		false
	);

	const MAX_ADD_COUNT = selectedSection?.max || 10;
	const showPennyDropButtons =
		selectedProduct?.product_details?.show_penny_drop_button || false;

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
	const deleteSectionDetails = async deleteSectionId => {
		try {
			setIsDeleteWarningModalOpen(false);
			setFetchingSectionData(true);
			const deleteReqBody = { id: deleteSectionId, loan_id: loanId };
			const fetchRes = await axios.post(DELETE_LOAN_FIN, deleteReqBody, {
				headers: {
					Authorization: `Bearer ${userToken}`,
				},
			});
			if (fetchRes.status === 200) {
				onSaveOrUpdateSuccessCallback();
			}
		} catch (error) {
			console.error('error-fetchSectionDetails-', error);
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

	const onDeleteSuccessCallback = id => {
		deleteSectionDetails(id);
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

	const showDeleteButton = () => {
		return (
			selectedProduct?.product_details?.allow_users_to_delete_bank?.includes(
				userDetails?.usertype
			) ||
			selectedProduct?.product_details?.allow_users_to_delete_bank?.includes(
				userDetails?.user_sub_type
			)
		);
	};

	// console.log('bank-details-', { app, application });

	return (
		<>
			<DeletionWarningModal
				warningMessage={`You are trying to delete a bank detail. Deleted bank details can not be restored. Please confirm if you want to delete it`}
				show={isDeleteWarningModalOpen}
				onClose={setIsDeleteWarningModalOpen}
				onProceed={() => {
					onDeleteSuccessCallback(isDeleteWarningModalOpen?.id);
				}}
			/>
			<UI_SECTIONS.Wrapper style={{ marginTop: 50 }}>
				{fetchingSectionData ? (
					<Loading />
				) : (
					<>
						{selectedSection?.sub_sections?.map((sub_section, sectionIndex) => {
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
											ifsc_code_search: section?.IFSC || '',
										};
										return (
											<UI_SECTIONS.AccordianWrapper>
												<UI_SECTIONS.AccordianHeader
													key={`accordian-${sectionIndex}`}
												>
													{isAccordianOpen ? null : (
														<>
															{!!showPennyDropButtons && (
																<UI_SECTIONS.AccordianIcon
																	style={{ marginRight: '10px' }}
																	src={
																		`${prefillData.bank_verification_flag}` ===
																		'verified'
																			? iconSuccess
																			: iconWarning
																	}
																	alt={
																		`${prefillData.bank_verification_flag}` ===
																		'verified'
																			? 'verified'
																			: 'not verified'
																	}
																	title={
																		`${prefillData.bank_verification_flag}` ===
																		'verified'
																			? 'Bank is Penny Drop verified.'
																			: 'Bank is not Penny Drop verified.'
																	}
																/>
															)}
															<UI_SECTIONS.AccordianHeaderData>
																<span>Name:</span>
																<strong>
																	{prefillData?.account_holder_name}
																</strong>
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
														{isViewLoan ||
														(prefillData.enach_status &&
															!(
																prefillData.enach_status === `failed`
															)) ? null : (
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
														{isViewLoan ||
														!showDeleteButton() ||
														(prefillData.enach_status &&
															!(
																prefillData.enach_status === `failed`
															)) ? null : (
															<UI_SECTIONS.AccordianIcon
																src={iconDelete}
																onClick={() => {
																	if (sectionData.length === 1) {
																		addToast({
																			message: `Please Add More Than One Bank To Delete The Current Bank.`,
																			type: 'error',
																		});
																		return;
																	}
																	// onDeleteSuccessCallback(prefillData?.id);
																	setIsDeleteWarningModalOpen(prefillData);
																}}
																alt='delete'
															/>
														)}

														<UI_SECTIONS.AccordianIcon
															src={expandIcon}
															alt='toggle'
															onClick={() => {
																if (isCreateFormOpen || isEditLoan) return;
																toggleAccordian(sectionId);
																setTimeout(() => {
																	setEditSectionId('');
																}, 100);
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
									<span>Click to add additional Bank Details</span>
								</>
							)}
						</UI_SECTIONS.AddDynamicSectionWrapper>
						<UI_SECTIONS.Footer>
							{!isViewLoan && (
								<Button
									fill
									name='Save and Proceed'
									disabled={isCreateFormOpen || !!editSectionId}
									onClick={onSaveAndProceed}
								/>
							)}

							<NavigateCTA />
						</UI_SECTIONS.Footer>
					</>
				)}
			</UI_SECTIONS.Wrapper>
		</>
	);
};

export default BankDetails;
