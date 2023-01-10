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
import { setSelectedApplicantCoApplicantId } from 'store/applicantCoApplicantsSlice';
import { useToasts } from 'components/Toast/ToastProvider';
import Button from 'components/Button';
import { validateEmploymentDetails } from 'utils/formatData';
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
		isEditOrViewLoan,
		isViewLoan,
		isEditLoan,
		isDraftLoan,
		editLoanDirectors,
	} = app;
	const {
		applicant,
		coApplicants,
		selectedApplicantCoApplicantId,
		isApplicant,
	} = applicantCoApplicants;
	const selectedApplicant = isApplicant
		? applicant
		: coApplicants?.[selectedApplicantCoApplicantId] || {};
	const { addToast } = useToasts();
	const { loanRefId } = application;
	const dispatch = useDispatch();
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
		isEditLoan,
		isDraftLoan,
		applicantCoApplicantSectionIds,
		editLoanDirectors,
		selectedApplicant,
	});

	// console.log('SideNav-allStates-', {
	// 	app,
	// 	selectedProduct,
	// 	completedSections,
	// 	selectedApplicant,
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
												// console.log(
												// 	!CONST_SECTIONS.INITIAL_SECTION_IDS.includes(
												// 		section?.id
												// 	),
												// 	typeof selectedApplicant?.directorId !== 'number',
												// 	selectedApplicant
												// );
												if (
													!CONST_SECTIONS.INITIAL_SECTION_IDS.includes(
														section?.id
													) &&
													typeof selectedApplicant?.directorId !== 'number'
												) {
													dispatch(
														setSelectedApplicantCoApplicantId(
															CONST_SECTIONS.APPLICANT
														)
													);
												}

												if (!isViewLoan) {
													let isValid;
													if (
														!CONST_SECTIONS.INITIAL_SECTION_IDS.includes(
															section?.id
														)
													) {
														isValid = validateEmploymentDetails({
															coApplicants,
															isApplicant,
														});
													}
													if (
														isValid === false &&
														!CONST_SECTIONS.INITIAL_SECTION_IDS.includes(
															section?.id
														)
													) {
														addToast({
															message:
																'Please fill all the details in Co-Applicant-' +
																Object.keys(coApplicants)?.length,
															type: 'error',
														});
														return;
													}
												}

												if (
													isApplicationSubmitted ||
													section.id ===
														CONST_SECTIONS.APPLICATION_SUBMITTED_SECTION_ID
												)
													return;
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
