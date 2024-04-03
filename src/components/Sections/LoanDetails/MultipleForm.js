import React from 'react';

import * as UI_SECTIONS from 'components/Sections/ui';
import { useState } from 'react';
import DynamicForm from './DynamicForm';
import editIcon from 'assets/icons/edit-icon.png';
import expandIcon from 'assets/icons/right_arrow_active.png';
import plusRoundIcon from 'assets/icons/plus_icon_round.png';

const ACCORDIAN_LABEL_LIST = [
	{
		id: 'credit_limit_applied',
		labels: [
			{
				label: 'Scheme Type',
				valueKey: 'type_of_scheme',
			},
			{
				label: 'Limit Nature',
				valueKey: 'nature_of_limit',
			},
			{
				label: 'Limit Applied',
				valueKey: 'limit_applied',
			},
		],
	},
];

const MultipleForm = ({
	selectedProduct = {},
	sub_section = {},
	isViewLoan,
	subSectionData = [],
	onSaveOrUpdateSuccessCallback = () => {},
}) => {
	const [openAccordianId, setOpenAccordianId] = useState('');
	const [editSectionId, setEditSectionId] = useState('');
	const [isCreateFormOpen, setIsCreateFormOpen] = useState(
		!subSectionData?.length
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
			{subSectionData?.map((section, sectionIndex) => {
				const sectionId = section?.id;
				const isAccordianOpen = sectionId === openAccordianId;
				const isEditLoan = editSectionId === sectionId;

				const prefillData = section
					? {
							...section,
					  }
					: {};

				return (
					<UI_SECTIONS.AccordianWrapper
						key={`accordian-${sectionIndex}-${section?.id}`}
					>
						<UI_SECTIONS.AccordianHeader>
							{isAccordianOpen ? null : (
								<>
									{ACCORDIAN_LABEL_LIST.find(
										label => label?.id === sub_section?.id
									)?.labels?.map(label => (
										<UI_SECTIONS.AccordianHeaderData
											key={`${sub_section?.id}_${label?.label}`}
										>
											<span>{label?.label}:</span>
											<strong>{prefillData[(label?.valueKey)]}</strong>
										</UI_SECTIONS.AccordianHeaderData>
									))}
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
									onSaveOrUpdateSuccessCallback={values => {
										onSaveOrUpdateSuccessCallback(values);
										toggleAccordian(sectionId);
									}}
									onCancelCallback={onCancelCallback}
									isEditLoan={isEditLoan}
									editSectionId={editSectionId}
									isCreateFormOpen={isCreateFormOpen}
								/>
							)}
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
								submitCTAName='Save'
								hideCancelCTA={!(subSectionData?.length > 0)}
								isEditLoan={true}
								onSaveOrUpdateSuccessCallback={values => {
									onSaveOrUpdateSuccessCallback(values);
									setIsCreateFormOpen(false);
								}}
								onCancelCallback={onCancelCallback}
								isCreateFormOpen={isCreateFormOpen}
							/>
						</UI_SECTIONS.DynamicFormWrapper>
					</UI_SECTIONS.AccordianBody>
				</UI_SECTIONS.AccordianWrapper>
			)}
			<UI_SECTIONS.AddDynamicSectionWrapper>
				{isCreateFormOpen ||
				isViewLoan ||
				subSectionData?.length >= MAX_ADD_COUNT ||
				selectedProduct?.product_details?.is_individual_dedupe_required ||
				!!editSectionId ? null : (
					<>
						<UI_SECTIONS.PlusRoundButton
							src={plusRoundIcon}
							onClick={openCreateForm}
						/>
						<span>Click to add additional {sub_section?.name}</span>
					</>
				)}
			</UI_SECTIONS.AddDynamicSectionWrapper>
		</>
	);
};
export default MultipleForm;
