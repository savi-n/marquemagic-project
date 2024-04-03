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
	const [openAccordianIndex, setOpenAccordianIndex] = useState('');
	const [editSectionIndex, setEditSectionIndex] = useState('');
	const [isCreateFormOpen, setIsCreateFormOpen] = useState(
		!subSectionData?.length
	);

	const MAX_ADD_COUNT = sub_section?.max || 10;

	const openCreateForm = () => {
		setEditSectionIndex('');
		setOpenAccordianIndex('');
		setIsCreateFormOpen(true);
	};

	const toggleAccordian = (id, openOrClose) => {
		if (openOrClose === 'open') return setOpenAccordianIndex(id);
		if (openOrClose === 'close') return setOpenAccordianIndex('');
		return openAccordianIndex === id
			? setOpenAccordianIndex('')
			: setOpenAccordianIndex(id);
	};

	const onCancelCallback = deleteEditSectionId => {
		if (deleteEditSectionId !== undefined) {
			setEditSectionIndex('');
		} else {
			setIsCreateFormOpen(false);
		}
		setOpenAccordianIndex('');
	};

	return (
		<>
			{subSectionData?.map((section, sectionIndex) => {
				const isAccordianOpen = sectionIndex === openAccordianIndex;
				const isEditLoan = editSectionIndex === sectionIndex;

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
											toggleAccordian(sectionIndex, 'open');
											setTimeout(() => {
												setEditSectionIndex(sectionIndex);
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
										openAccordianIndex !== sectionIndex &&
											onCancelCallback(openAccordianIndex);

										if (isCreateFormOpen || isEditLoan) return;
										toggleAccordian(sectionIndex);
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
										onSaveOrUpdateSuccessCallback(values, sectionIndex);
										onCancelCallback(sectionIndex);
									}}
									onCancelCallback={() => onCancelCallback(sectionIndex)}
									isEditLoan={isEditLoan}
									editSectionIndex={editSectionIndex}
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
				!!editSectionIndex ? null : (
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
