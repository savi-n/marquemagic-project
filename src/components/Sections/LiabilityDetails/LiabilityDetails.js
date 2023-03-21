import React, { useEffect } from 'react';
import { Fragment, useState } from 'react';

import Button from 'components/Button';

import { useSelector, useDispatch } from 'react-redux';
import { setSelectedSectionId, toggleTestMode } from 'store/appSlice';
import { updateApplicationSection } from 'store/applicationSlice';
import { formatINR } from 'utils/formatData';
import * as UI_SECTIONS from 'components/Sections/ui';
import * as UI from './ui';
// import * as CONST from './const';
import selectedSection from './sample.json'; // TODO: remove after testing
import editIcon from 'assets/icons/edit-icon.png';
import expandIcon from 'assets/icons/right_arrow_active.png';
import DynamicForm from './DynamicForm';

const LiabilityDetails = props => {
	const { app, application } = useSelector(state => state);
	const {
		isViewLoan,
		selectedSectionId,
		nextSectionId,
		prevSectionId,
		isLocalhost,
		isTestMode,
		isEditLoan,
		// selectedSection,
	} = app;
	const dispatch = useDispatch();
	const selectedLiabilityDetailsSubSection =
		selectedSection?.sub_sections?.[0] || {};
	const [count, setCount] = useState(
		selectedLiabilityDetailsSubSection?.min || 3
	);
	const [openAccordianIndex, setOpenAccordianIndex] = useState(-1);
	const MAX_COUNT = selectedLiabilityDetailsSubSection?.max || 10;
	// const { handleSubmit, register, formState, resetForm } = useForm();
	// const [isResetFormComplete, setIsResetFormComplete] = useState(false);

	const naviagteToNextSection = () => {
		dispatch(setSelectedSectionId(nextSectionId));
	};

	const naviagteToPreviousSection = () => {
		dispatch(setSelectedSectionId(prevSectionId));
	};

	const onProceed = async () => {};

	const onSkip = () => {
		const skipSectionData = {
			sectionId: selectedSectionId,
			sectionValues: {
				...(application?.sections?.[selectedSectionId] || {}),
				isSkip: true,
			},
		};
		if (
			isEditLoan &&
			!application?.sections?.hasOwnProperty(selectedSectionId)
		) {
			skipSectionData.sectionValues = {};
		}
		dispatch(updateApplicationSection(skipSectionData));
		dispatch(setSelectedSectionId(nextSectionId));
	};

	const onAdd = () => {
		if (isViewLoan) return;
		if (count >= MAX_COUNT) return;
		setCount(count + 1);
	};

	const toggleAccordian = id => {
		return openAccordianIndex === id
			? setOpenAccordianIndex(-1)
			: setOpenAccordianIndex(id);
	};

	useEffect(() => {
		if (openAccordianIndex >= 0) {
			// setIsResetFormComplete(false);
			// resetForm();
			// setTimeout(() => {
			// setIsResetFormComplete(true);
			// }, 200);
		}
	}, [openAccordianIndex]);

	// console.log('LiabilityDetails-allstates-', {
	// 	app,
	// 	selectedSection,
	// 	selectedLiabilityDetailsSubSection,
	// });

	const liabilityList = [{ id: 111 }, { id: 222 }];

	return (
		<UI_SECTIONS.Wrapper style={{ marginTop: 50 }}>
			{selectedSection.sub_sections?.map((sub_section, sectionIndex) => {
				return (
					<Fragment key={`section-${sectionIndex}-${sub_section?.id}`}>
						{sub_section?.name ? (
							<UI_SECTIONS.SubSectionHeader>
								{sub_section.name}
							</UI_SECTIONS.SubSectionHeader>
						) : null}
						{/* combine local + db array */}
						{liabilityList.map((liability, liabilityIndex) => {
							const isAccordianOpen = liabilityIndex === openAccordianIndex;
							return (
								<UI_SECTIONS.AccordianWrapper>
									<UI_SECTIONS.AccordianHeader
										key={`accordian-${liabilityIndex}`}
									>
										{isAccordianOpen ? null : (
											<>
												<UI_SECTIONS.AccordianHeaderData>
													<span>Liability For:</span>
													<strong>Shubham Gaurav</strong>
												</UI_SECTIONS.AccordianHeaderData>
												<UI_SECTIONS.AccordianHeaderData>
													<span>Type of Liability:</span>
													<strong>Loans</strong>
												</UI_SECTIONS.AccordianHeaderData>
												<UI_SECTIONS.AccordianHeaderData>
													<span>Amount:</span>
													<strong>{formatINR('80000')}</strong>
												</UI_SECTIONS.AccordianHeaderData>
											</>
										)}
										<UI_SECTIONS.AccordianHeaderData
											style={isAccordianOpen ? { marginLeft: 'auto' } : {}}
											Load
										>
											<UI.AccordianIcon src={editIcon} alt='edit' />
											<UI.AccordianIcon
												src={expandIcon}
												alt='toggle'
												onClick={() => toggleAccordian(liabilityIndex)}
											/>
										</UI_SECTIONS.AccordianHeaderData>
									</UI_SECTIONS.AccordianHeader>
									<UI_SECTIONS.AccordianBody isOpen={isAccordianOpen}>
										<DynamicForm fields={sub_section?.fields || []} />
										{/* {isResetFormComplete ? (
											<DynamicForm fields={sub_section?.fields || []} />
										) : null} */}
									</UI_SECTIONS.AccordianBody>
								</UI_SECTIONS.AccordianWrapper>
							);
						})}
					</Fragment>
				);
			})}
			<UI_SECTIONS.AddMoreWrapper>
				<UI_SECTIONS.RoundButton
					onClick={onAdd}
					disabled={isViewLoan || count >= MAX_COUNT}
				>
					+
				</UI_SECTIONS.RoundButton>{' '}
				click to add additional deductions/repayment obligations
			</UI_SECTIONS.AddMoreWrapper>
			<UI_SECTIONS.Footer>
				{!isViewLoan && (
					<Button
						fill
						name='Save and Proceed'
						// isLoader={loading}
						// disabled={loading}
						onClick={onProceed}
					/>
				)}

				{isViewLoan && (
					<>
						<Button name='Previous' onClick={naviagteToPreviousSection} fill />
						<Button name='Next' onClick={naviagteToNextSection} fill />
					</>
				)}

				{/* buttons for easy development starts */}

				{!isViewLoan && (!!selectedSection?.is_skip || !!isTestMode) ? (
					<Button
						name='Skip'
						// disabled={loading}
						onClick={onSkip}
					/>
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
		</UI_SECTIONS.Wrapper>
	);
};

export default LiabilityDetails;
