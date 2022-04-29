import { useContext, useEffect, Fragment, useState } from 'react';
import { string } from 'prop-types';
import styled from 'styled-components';
import { useHistory } from 'react-router';
import { PRODUCT_DETAILS_URL } from '../../_config/app.config';
import useFetch from '../../hooks/useFetch';
import { AppContext } from '../../reducer/appReducer';
import { FlowContext } from '../../reducer/flowReducer';
import { FormContext } from '../../reducer/formReducer';
import CheckBox from '../../shared/components/Checkbox/CheckBox';
import ContinueModal from '../../components/modals/ContinueModal';
import Router from './Router';
import { UserContext } from '../../reducer/userReducer';
import { useToasts } from '../../components/Toast/ToastProvider';
import imgSideNav from 'assets/images/bg/Left-Nav_BG.png';
import imgBackArrowCircle from 'assets/icons/Left_nav_bar_back_icon.png';
import imgArrorRight from 'assets/icons/Left_nav_bar-right-arrow_BG.png';
import imgCheckCircle from 'assets/icons/white_tick_icon.png';
import iconDottedRight from 'assets/images/bg/Landing_page_dot-element.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faChevronLeft,
	faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import Button from '../../components/Button';
const Wrapper = styled.div`
	width: 100%;
	min-height: 100%;
	display: flex;
`;

/* background: ${({ theme }) => theme.main_theme_color}; */
const Colom1 = styled.div`
	background-image: url(${imgSideNav});
	background-size: cover;
	background-position-y: -120px;
	min-height: 100% !important;
	width: 22%;
	color: #fff;
	padding: 50px 20px;
	position: relative;
	@media (max-width: 700px) {
		width: ${({ hide }) => (hide ? '0px' : '300px')};
		padding: ${({ hide }) => (hide ? '0px' : '50px 20px')};
		position: fixed;
		height: 100%;
		z-index: 14;
	}
`;

const Colom2 = styled.div`
	flex: 1;
	background: #fff;
	display: flex;
	overflow: scroll;
	&::-webkit-scrollbar {
		display: none;
	}
	@media (max-width: 700px) {
		/* z-index: 2; */
		padding: 0 50px;
	}
`;

const Head = styled.h4`
	border: ${({ active }) => (active ? '1px solid' : 'none')};
	border-radius: 10px;
	padding: 10px 20px;
	margin: 5px 0;
	font-size: 20px;
	font-weight: 500;

	span {
		font-size: 14px;
		font-weight: 400;
	}
`;

/* border: ${({ active }) => (active ? '1px solid' : 'none')}; */
const Menu = styled.h5`
	background: ${({ active }) =>
		active ? 'linear-gradient(to right, #2a2add , #00df8d)' : 'none'};
	box-shadow: ${({ active }) =>
		active ? 'rgba(0, 0, 0, 0.24) 0px 3px 8px' : 'none'};
	width: 112%;
	border-radius: 5px;
	padding: 10px 20px;
	margin: 5px 0;
	position: relative;
	display: flex;
	align-items: center;
	justify-content: space-between;
	font-size: 14px;
	@media (max-width: 700px) {
		padding: ${({ hide }) => (hide ? '0px 0px' : '5px 10px')};
		display: ${({ hide }) => hide && 'none'};
		width: 100%;
	}
`;

// background: ${({ active }) =>
// 	active ? 'linear-gradient(to right, #2a2add , #00df8d)' : 'transparent'};
const SubMenu = styled.h5`
	background: ${({ active }) =>
		active ? 'rgba(255,255,255,0.2)' : 'transparent'};
	width: 110%;
	border-radius: 10px;
	padding: 10px 20px;
	margin: 5px 0;
	margin-left: 20px;
	position: relative;
	display: flex;
	align-items: center;
	justify-content: space-between;
	font-size: 14px;
`;

const ImgArrorRight = styled.img`
	height: 15px;
	padding-right: 10px;
`;

const ImgCheckCircle = styled.img`
	height: 20px;
	padding-right: 20px;
`;

const Link = styled.div`
	/* cursor: pointer; */
`;
const HeadingBox = styled.div`
	cursor: pointer;
	display: flex;
	margin-bottom: 20px;
`;
const ScrollBox = styled.div`
	::-webkit-scrollbar {
		width: 0px;
	}
	::-webkit-scrollbar-track-piece {
		background-color: transparent;
		-webkit-border-radius: 6px;
	}
	@media (max-width: 700px) {
		height: 70vh;
		overflow-y: scroll;
		overflow-x: hidden;
	}
`;
const ProductName = styled.h5`
	border: ${({ active }) => (active ? '1px solid' : 'none')};
	font-size: 16px;
	font-weight: bold;
	padding-left: 10px;
	line-height: 30px;

	@media (max-width: 700px) {
		display: ${({ hide }) => hide && 'none'};
	}
`;
const BackButton = styled.img`
	height: 30px;
`;

const IconDottedRight = styled.img`
	position: absolute;
	height: 30px;
	right: 0;
	margin-top: 40px;
	margin-right: 30px;
`;

export default function Product({ product, url }) {
	const history = useHistory();
	const productIdPage = atob(product);
	const { addToast } = useToasts();
	const {
		state: { whiteLabelId },
	} = useContext(AppContext);
	const [hide, setShowHideSidebar] = useState(true);
	const {
		state: {
			completed: completedMenu,
			activeSubFlow: subFlowMenu,
			flowMap,
			basePageUrl,
			currentFlow,
			productId,
		},
		actions: { configure, setCurrentFlow, clearFlowDetails, setCompleted },
	} = useContext(FlowContext);
	const {
		actions: { clearFormData, setUsertypeAfterRefresh },
	} = useContext(FormContext);
	const hideAndShowMenu = () => {
		setShowHideSidebar(!hide);
	};

	const {
		state: { timestamp },
		actions: { resetUserDetails },
	} = useContext(UserContext);

	const { response } = useFetch({
		url: `${PRODUCT_DETAILS_URL({ whiteLabelId, productId: atob(product) })}`,
		options: { method: 'GET' },
	});

	const SectionSidebarArrow = styled.section`
		z-index: 100;
		display: none;
		@media (max-width: 700px) {
			display: block;
		}
	`;
	const ArrowShow = styled.div`
		width: min-content;
		margin-left: ${({ hide }) => (hide ? '0px' : '300px')};
		position: fixed;
	`;
	// useEffect(() => {
	// 	clearFlowDetails(basePageUrl);
	// 	clearFormData();
	// }, []);

	useEffect(() => {
		if (response) {
			configure(response.data?.product_details?.flow);
			sessionStorage.setItem('productId', atob(product));
		}
	}, [response]);

	useEffect(() => {
		const editLoanData = JSON.parse(sessionStorage.getItem('editLoan'));
		if (editLoanData && flowMap) {
			const steps = Object.keys(flowMap);
			onFlowChange(flowMap?.[flow]?.main);
			steps.map(ele => {
				setCompleted(ele);
			});
			// console.log('Product-useeffect-flowmap-', {
			// 	index,
			// 	editLoanData,
			// 	flowMap,
			// });
			setIndex(index);
		}
	}, [flowMap]);

	useEffect(() => {
		if (productId !== productIdPage || timestamp < Date.now()) {
			clearFlowDetails();
			clearFormData();
		}
		completedMenu?.length > 0 && setIndex(completedMenu.length);
	}, []);

	// useEffect(() => {
	//   if (basePageUrl) setCurrentFlow(basePageUrl);
	// }, [basePageUrl]);

	// const [
	//   continueExistingApplication,
	//   setContinueExistingApplication,
	// ] = useState(false);

	const [showContinueModal, setShowContinueModal] = useState(false);
	const [index, setIndex] = useState(2);

	const onYesClick = () => {
		// setContinueExistingApplication(true);
		if (!completedMenu.includes('document-upload')) {
			setShowContinueModal(true);
			setUsertypeAfterRefresh();
		} else {
			onNoClick();
			addToast({
				message: 'Application already created',
				type: 'error',
			});
		}
	};

	const onNoClick = () => {
		// setContinueExistingApplication(false);
		setShowContinueModal(true);
		const wt_lbl = sessionStorage.getItem('wt_lbl');
		sessionStorage.clear();
		sessionStorage.setItem('wt_lbl', wt_lbl);
		clearFlowDetails(basePageUrl);
		clearFormData();
		resetUserDetails();
	};

	const onFlowChange = (flow, i) => {
		if (!i && flow !== 'identity-verification' && flow !== 'pan-verification') {
			setIndex(index + 1);
		}
		setCurrentFlow(flow, atob(product));
		setShowContinueModal(true);
	};

	const currentFlowDetect = () => {
		if (completedMenu.length && productId === productIdPage) {
			return showContinueModal ? currentFlow : basePageUrl;
		}

		return currentFlow || basePageUrl;
	};

	let flow = currentFlowDetect();

	return (
		response &&
		response.data && (
			<Wrapper>
				<Colom1 hide={hide}>
					<ScrollBox>
						<HeadingBox onClick={e => {}}>
							<BackButton
								src={imgBackArrowCircle}
								alt='goback'
								onClick={() => history.push('/nconboarding/applyloan')}
							/>
							<ProductName hide={hide} active={flow === 'product-details'}>
								{response.data.name} <span>{response.data.description}</span>
							</ProductName>
						</HeadingBox>
						{response.data?.product_details?.flow?.map((m, idx) =>
							(!m.hidden || m.id === flow) && m.id !== 'product-details' ? (
								<Fragment key={m.id}>
									<Link onClick={e => {}}>
										<Menu active={flow === m.id} hide={hide}>
											<div
												style={{
													cursor:
														completedMenu.includes(m.id) &&
														m.id !== 'pan-verification' &&
														'pointer',
												}}
												onClick={e => {
													if (index > idx) {
														if (
															flow !== 'product-details' &&
															flow !== 'personal-details' &&
															flow !== 'application-submitted' &&
															flow !== 'identity-verification' &&
															flow !== 'pan-verification' &&
															!flow.includes('co-applicant')
														) {
															flow =
																e.target.id !== 'identity-verification' &&
																e.target.id !== 'pan-verification' &&
																e.target.id !== 'application-submitted'
																	? e.target.id
																	: flow;
															if (
																e.target.id !== 'identity-verification' &&
																e.target.id !== 'pan-verification' &&
																e.target.id !== 'application-submitted'
															) {
																setIndex(idx);
															}
															onFlowChange(flow, 'o');
														} else {
															onFlowChange(flow, 'o');
														}
													}
												}}
												id={m.id}
												k={idx}>
												{m.name}
											</div>
											{completedMenu.includes(m.id) && (
												// <CheckBox bg='white' checked round fg={'blue'} />
												<ImgCheckCircle src={imgCheckCircle} alt='check' />
											)}
											{flow === m.id && (
												<ImgArrorRight src={imgArrorRight} alt='arrow' />
											)}
										</Menu>
									</Link>
									{m.flow &&
										subFlowMenu.includes(m.id) &&
										m.flow.map((item, ind) => (
											<Link key={item.id} onClick={e => {}}>
												<SubMenu active={flow === item.id}>
													<div
														style={{
															cursor: completedMenu.includes(m.id) && 'pointer',
														}}
														onClick={e => {
															if (index >= ind) {
																if (
																	flow !== 'application-submitted' &&
																	flow !== 'identity-verification' &&
																	flow !== 'pan-verification' &&
																	flow !== 'co-applicant-details'
																) {
																	flow =
																		e.target.id !== 'identity-verification' &&
																		e.target.id !== 'pan-verification' &&
																		e.target.id !== 'application-submitted'
																			? e.target.id
																			: flow;
																	if (
																		e.target.id !== 'identity-verification' &&
																		e.target.id !== 'pan-verification' &&
																		e.target.id !== 'application-submitted'
																	) {
																		setIndex(ind);
																	}
																	if (
																		!// state?.coapplicant?.applicantData
																		// 	?.incomeType === 'noIncome' &&
																		(
																			e.target.id ===
																			'co-applicant-income-details'
																		)
																	) {
																		onFlowChange(flow, 'o');
																	}
																} else {
																	onFlowChange(flow, 'o');
																}
															}
														}}
														id={item.id}
														k={ind}>
														{item.name}
													</div>
													{completedMenu.includes(item.id) && (
														// <CheckBox bg='white' checked round fg={'blue'} />
														<ImgCheckCircle src={imgCheckCircle} alt='check' />
													)}
												</SubMenu>
											</Link>
										))}
								</Fragment>
							) : null
						)}
					</ScrollBox>
				</Colom1>
				<SectionSidebarArrow>
					<ArrowShow hide={hide}>
						<Button
							fill
							onClick={() => hideAndShowMenu()}
							width={10}
							heigth={10}
							borderRadious={'0 5px 5px 0'}>
							<FontAwesomeIcon
								icon={hide ? faChevronRight : faChevronLeft}
								size='1x'
							/>
						</Button>
					</ArrowShow>
				</SectionSidebarArrow>
				<Colom2>
					<IconDottedRight src={iconDottedRight} alt='dot' />
					{flowMap && (
						<Router
							currentFlow={flow || basePageUrl}
							map={flowMap?.[flow]}
							productDetails={response.data?.product_details}
							onFlowChange={onFlowChange}
							productId={response.data?.product_id}
						/>
					)}
				</Colom2>
				{!!completedMenu.length &&
					!showContinueModal &&
					productId === productIdPage && (
						<ContinueModal onYes={onYesClick} onNo={onNoClick} />
					)}
			</Wrapper>
		)
	);
}

Product.propTypes = {
	product: string.isRequired,
};
