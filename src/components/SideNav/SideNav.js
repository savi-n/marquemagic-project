/* This file defines the side menu that is seen in loan application creation journey */
import {
	Fragment,
	useState,
	// useEffect
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faChevronLeft,
	faChevronRight,
} from '@fortawesome/free-solid-svg-icons';

import Button from 'components/Button';

import { setSelectedSectionId } from 'store/appSlice';
import imgBackArrowCircle from 'assets/icons/Left_nav_bar_back_icon.png';
import imgArrorRight from 'assets/icons/Left_nav_bar-right-arrow_BG.png';
import imgCheckCircle from 'assets/icons/white_tick_icon.png';
import { getCompletedSections } from 'utils/formatData';
import * as CONST_SECTIONS from 'components/Sections/const';
import * as UI from './ui';

const SideNav = props => {
	const { app, applicantCoApplicants, application } = useSelector(
		state => state
	);
	const {
		selectedProduct,
		selectedSectionId,
		applicantCoApplicantSectionIds,
		editLoanData,
		isEditOrViewLoan,
		// nextSectionId,
	} = app;
	const {
		applicant,
		coApplicants,
		selectedApplicantCoApplicantId,
		isApplicant,
	} = applicantCoApplicants;
	const dispatch = useDispatch();
	const history = useHistory();
	const [hide, setShowHideSidebar] = useState(true);
	const isApplicationSubmitted =
		selectedSectionId === CONST_SECTIONS.APPLICATION_SUBMITTED_SECTION_ID;

	const completedSections = getCompletedSections({
		selectedProduct,
		isApplicant,
		applicant,
		coApplicants,
		selectedApplicantCoApplicantId,
		application,
		isEditOrViewLoan,
	});
	// selectedProduct?.product_details?.sections?.map(section => {
	// 	if (isApplicant && Object.keys(applicant?.[section?.id] || {}).length > 0) {
	// 		completedSections.push(section.id);
	// 	} else {
	// 		if (
	// 			Object.keys(
	// 				coApplicants?.[selectedApplicantCoApplicantId]?.[section?.id] || {}
	// 			).length > 0
	// 		)
	// 			completedSections.push(section.id);
	// 	}
	// 	if (Object.keys(application?.sections?.[section.id] || {}).length > 0) {
	// 		completedSections.push(section.id);
	// 	}
	// 	return null;
	// });

	// console.log('SideNav-allStates-', {
	// 	app,
	// 	selectedProduct,
	// 	completedSections,
	// });

	// useEffect(() => {
	// 	if (completedSections?.length > 0) {
	// 		dispatch(setSelectedSectionId(nextSectionId));
	// 	}
	// 	// eslint-disable-next-line
	// }, []);

	return (
		<Fragment>
			<UI.Wrapper
				hide={hide}
				onClick={e => {
					if (isApplicationSubmitted) {
						e.preventDefault();
						e.stopPropagation();
					}
				}}
			>
				<UI.ScrollBox>
					<UI.HeadingBox onClick={e => {}}>
						{editLoanData ? null : (
							<UI.BackButton
								src={imgBackArrowCircle}
								alt='goback'
								onClick={() => history.push('/nconboarding/applyloan')}
							/>
						)}
						<UI.ProductName hide={hide}>
							<span>{selectedProduct?.name}</span>
							<UI.ApplicationNo>
								Application No:{' '}
								{editLoanData?.loan_ref_id || application?.loanRefId}
							</UI.ApplicationNo>
						</UI.ProductName>
					</UI.HeadingBox>
					{selectedProduct?.product_details?.sections?.map(
						(section, sectionIndex) => {
							const isActive = selectedSectionId === section.id;
							const isCompleted = completedSections.includes(section.id);
							const customStyle = { cursor: 'not-allowed', color: 'lightgrey' };
							if (!isApplicationSubmitted && (isCompleted || isActive)) {
								customStyle.cursor = 'pointer';
								customStyle.color = 'white';
							}
							return (
								<Fragment key={section.id}>
									<UI.Link
										style={customStyle}
										onClick={e => {
											if (isApplicationSubmitted) return;
											if (isCompleted || isActive) {
												dispatch(setSelectedSectionId(section.id));
											}
										}}
									>
										<UI.Menu active={isActive} hide={hide}>
											<div k={sectionIndex}>{section.name}</div>
											{isCompleted && (
												// <CheckBox bg='white' checked round fg={'blue'} />
												<UI.ImgCheckCircle
													src={imgCheckCircle}
													alt='check'
													active={isActive}
												/>
											)}
											{isActive && (
												<UI.ImgArrorRight src={imgArrorRight} alt='arrow' />
											)}
										</UI.Menu>
									</UI.Link>
									{applicantCoApplicantSectionIds?.length ===
										sectionIndex + 1 && <UI.SectionDevider />}
								</Fragment>
							);
						}
					)}
				</UI.ScrollBox>
			</UI.Wrapper>
			<UI.SectionSidebarArrow>
				<UI.ArrowShow hide={hide}>
					<Button
						fill
						onClick={() => setShowHideSidebar(prevHide => !prevHide)}
						width={10}
						heigth={10}
						borderRadious={'0 5px 5px 0'}
					>
						<FontAwesomeIcon
							icon={hide ? faChevronRight : faChevronLeft}
							size='1x'
						/>
					</Button>
				</UI.ArrowShow>
			</UI.SectionSidebarArrow>
		</Fragment>
	);
};

export default SideNav;
