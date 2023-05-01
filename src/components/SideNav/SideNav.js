/* This file defines the side menu that is seen in loan application creation journey */
import {
	Fragment,
	useState,
	// useEffect
} from 'react';
import queryString from 'query-string';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faChevronLeft,
	faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import Button from 'components/Button';
import { getAllCompletedSections } from 'utils/formatData';
import { setSelectedSectionId } from 'store/appSlice';
import imgBackArrowCircle from 'assets/icons/Left_nav_bar_back_icon.png';
import imgArrorRight from 'assets/icons/Left_nav_bar-right-arrow_BG.png';
import imgCheckCircle from 'assets/icons/white_tick_icon.png';
import * as CONST_SECTIONS from 'components/Sections/const';
import * as UI from './ui';
import * as CONST from './const';

const SideNav = props => {
	const { app, application } = useSelector(state => state);
	const { directors, selectedDirectorId, addNewDirectorKey } = useSelector(
		state => state.directors
	);
	const selectedDirector = directors?.[selectedDirectorId] || {};
	const {
		selectedProduct,
		selectedSectionId,
		directorSectionIds,
		isEditOrViewLoan,
		isViewLoan,
	} = app;
	const { loanRefId } = application;
	const dispatch = useDispatch();
	const [hide, setShowHideSidebar] = useState(true);
	const isApplicationSubmitted =
		selectedSectionId === CONST_SECTIONS.APPLICATION_SUBMITTED_SECTION_ID;

	const completedSections = getAllCompletedSections({
		application,
		selectedDirector,
		addNewDirectorKey,
		directorSectionIds,
	});

	// console.log('SideNav-allStates-', {
	// 	app,
	// 	selectedProduct,
	// 	completedSections,
	// 	selectedDirector,
	// 	application,
	// });

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
						{isEditOrViewLoan ? null : (
							<UI.BackButton
								src={imgBackArrowCircle}
								alt='goback'
								onClick={() => {
									const params = queryString.parse(window.location.search);
									let redirectURL = `/nconboarding/applyloan`;
									if (params?.token) {
										redirectURL += `?token=${params.token}`;
									}
									window.open(redirectURL, '_self');
								}}
							/>
						)}
						<UI.ProductName hide={hide}>
							<span>{selectedProduct?.name}</span>
							<UI.ApplicationNo>Application No: {loanRefId}</UI.ApplicationNo>
						</UI.ProductName>
					</UI.HeadingBox>
					{selectedProduct?.product_details?.sections?.map(
						(section, sectionIndex) => {
							const isActive = selectedSectionId === section.id;
							const isCompleted = completedSections.includes(section.id);
							const customStyle = { cursor: 'not-allowed', color: 'lightgrey' };
							if (
								!isApplicationSubmitted &&
								(isCompleted || isActive) &&
								section.id !== CONST_SECTIONS.APPLICATION_SUBMITTED_SECTION_ID
							) {
								customStyle.cursor = 'pointer';
								customStyle.color = 'white';
							}
							if (isViewLoan && section?.id === 'application_submitted') {
								return null;
							} else {
								return (
									<Fragment key={section.id}>
										<UI.Link
											style={customStyle}
											onClick={e => {
												if (
													isApplicationSubmitted ||
													section.id ===
														CONST_SECTIONS.APPLICATION_SUBMITTED_SECTION_ID
												)
													return;

												// TODO: varun applay new logic for validation
												// if (!isViewLoan && isCompleted) {
												// 	let isValid;
												// 	if (
												// 		!CONST_SECTIONS.INITIAL_SECTION_IDS.includes(
												// 			section?.id
												// 		)
												// 	) {
												// 		isValid = validateEmploymentDetails({
												// 			coApplicants,
												// 			isApplicant,
												// 		});
												// 	}
												// 	if (
												// 		isValid === false &&
												// 		!CONST_SECTIONS.INITIAL_SECTION_IDS.includes(
												// 			section?.id
												// 		)
												// 	) {
												// 		addToast({
												// 			message:
												// 				'Please fill all the details in Co-Applicant-' +
												// 				Object.keys(coApplicants)?.length,
												// 			type: 'error',
												// 		});
												// 		return;
												// 	}
												// }

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
										{selectedProduct?.loan_request_type === 1 &&
											sectionIndex + 1 ===
												CONST.lengthOfuniqueSectionsForSmeFlow && (
												<UI.SectionDevider />
											)}

										{selectedProduct?.loan_request_type === 1
											? directorSectionIds?.length +
													CONST.lengthOfuniqueSectionsForSmeFlow ===
													sectionIndex + 1 && <UI.SectionDevider />
											: directorSectionIds?.length === sectionIndex + 1 && (
													<UI.SectionDevider />
											  )}
									</Fragment>
								);
							}
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
