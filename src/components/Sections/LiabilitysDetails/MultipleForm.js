import React from 'react';

import * as UI_SECTIONS from 'components/Sections/ui';
import editIcon from 'assets/icons/edit-icon.png';
import expandIcon from 'assets/icons/right_arrow_active.png';
import plusRoundIcon from 'assets/icons/plus_icon_round.png';
import DynamicForm from './DynamicForm';
import { formatINR, parseJSON } from 'utils/formatData';
import { useState } from 'react';
import { useSelector } from 'react-redux';

const MultipleForm = ({
	sectionData,
	sub_section,
	loanPreFetchdata,
	fetchSectionDetails,
	directorOptions,
}) => {
	const { app } = useSelector(state => state);
	const { isViewLoan, selectedProduct } = app;
	const [openAccordianId, setOpenAccordianId] = useState('');
	const [editSectionId, setEditSectionId] = useState('');
	const [isCreateFormOpen, setIsCreateFormOpen] = useState(
		!sectionData?.length
	);

	const MAX_ADD_COUNT = sub_section?.max || 10;

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

	const onSaveOrUpdateSuccessCallback = () => {
		fetchSectionDetails();
		setEditSectionId('');
		setOpenAccordianId('');
		setIsCreateFormOpen(false);
		openCreateForm();
	};

	const onCancelCallback = deleteEditSectionId => {
		if (deleteEditSectionId) {
			setEditSectionId('');
		} else {
			setIsCreateFormOpen(false);
		}
		setOpenAccordianId('');
	};

	return (
		<>
			{sectionData.map((section, sectionIndex) => {
				const sectionId = section?.id;
				const isAccordianOpen = sectionId === openAccordianId;
				const isEditLoan = editSectionId === sectionId;
				const newLiabilityData = JSON.parse(section?.emi_details) || '';

				const LiabilitylDataLowerCase = Object.entries(newLiabilityData).reduce(
					(acc, [key, value]) => {
						acc[key.toLowerCase()] = value;
						return acc;
					},
					{}
				);

				const prefillData = section
					? {
							...section,
							...LiabilitylDataLowerCase,
							...parseJSON(section?.emi_details || '{}'),
					  }
					: {};
				return (
					<UI_SECTIONS.AccordianWrapper
						key={`accordian-${sectionIndex}-${section?.id}`}
					>
						<UI_SECTIONS.AccordianHeader>
							{isAccordianOpen ? null : (
								<>
									<UI_SECTIONS.AccordianHeaderData>
										{/* // NOTE auto Prefill not work for name since director id is hardcoded */}
										<span>Liability For:</span>
										<strong>
											{
												directorOptions?.filter(
													director =>
														`${director?.value}` ===
														`${prefillData?.director_id}`
												)?.[0]?.name
											}
										</strong>
									</UI_SECTIONS.AccordianHeaderData>
									<UI_SECTIONS.AccordianHeaderData>
										<span>Type of Liability:</span>
										<strong>{prefillData?.fin_type}</strong>
									</UI_SECTIONS.AccordianHeaderData>
									<UI_SECTIONS.AccordianHeaderData>
										<span>Amount:</span>
										<strong>
											{!prefillData?.liability_amount &&
											!prefillData?.outstanding_balance &&
											!prefillData?.emi_amount
												? '---'
												: formatINR(
														prefillData?.liability_amount ||
															prefillData?.outstanding_balance ||
															prefillData?.emi_amount
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
									onSaveOrUpdateSuccessCallback={onSaveOrUpdateSuccessCallback}
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
					<UI_SECTIONS.AccordianBody isOpen={true} style={{ padding: 30 }}>
						<UI_SECTIONS.DynamicFormWrapper>
							<DynamicForm
								fields={sub_section?.fields || []}
								onSaveOrUpdateSuccessCallback={onSaveOrUpdateSuccessCallback}
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
						<span>Click to add additional liabilities</span>
					</>
				)}
			</UI_SECTIONS.AddDynamicSectionWrapper>
		</>
	);
};

export default MultipleForm;
