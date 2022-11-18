/* This file defines the side menu that is seen in loan application creation journey */
import { Fragment, useState } from 'react';
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
import * as UI from './ui';
// import * as CONST from './const';
import * as CONST_APP_CO_APP_HEADER from 'components/AppCoAppHeader/const';

const SideNav = props => {
	const { app, applicantCoApplicants, application } = useSelector(
		state => state
	);
	const {
		selectedProduct,
		selectedSectionId,
		applicantCoApplicantSectionIds,
		editLoanData,
	} = app;
	const {
		applicant,
		coApplicants,
		selectedApplicantCoApplicantId,
	} = applicantCoApplicants;
	const dispatch = useDispatch();
	const history = useHistory();
	const [hide, setShowHideSidebar] = useState(true);

	const completedMenu = [];
	selectedProduct?.product_details?.sections?.map(section => {
		if (
			selectedApplicantCoApplicantId === CONST_APP_CO_APP_HEADER.APPLICANT &&
			Object.keys(applicant?.[section?.id] || {}).length > 0
		) {
			completedMenu.push(section.id);
		} else {
			if (
				Object.keys(
					coApplicants?.[selectedApplicantCoApplicantId]?.[section?.id] || {}
				).length > 0
			)
				completedMenu.push(section.id);
		}
		return null;
	});

	// console.log('SideNav-allStates-', {
	// 	app,
	// 	selectedProduct,
	// 	completedMenu,
	// });

	return (
		<Fragment>
			<UI.Colom1 hide={hide}>
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
							const isCompleted = completedMenu.includes(section.id);
							return (
								<Fragment key={section.id}>
									<UI.Link
										style={
											isCompleted || isActive
												? {
														cursor: 'pointer',
														color: 'white',
												  }
												: { cursor: 'not-allowed', color: 'lightgrey' }
										}
										onClick={e => {
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
			</UI.Colom1>
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
