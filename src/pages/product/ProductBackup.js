// This file is Deprecated. All the changes are made in src/pages/product/Product/Product.js file with the new flow.

/* This file defines the side menu that is seen in loan application creation journey */

import { useContext, useEffect, Fragment, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import _ from 'lodash';

import { setSelectedProduct, setSelectedSectionId } from 'store/appSlice';
import { string } from 'prop-types';
import styled from 'styled-components';
import { useHistory } from 'react-router';
import { PRODUCT_DETAILS_URL } from '_config/app.config';
import useFetch from 'hooks/useFetch';
import { AppContext } from 'reducer/appReducer';
import { FlowContext } from 'reducer/flowReducer';
import { FormContext } from 'reducer/formReducer';
import { LoanFormContext } from 'reducer/loanFormDataReducer';
import ContinueModal from 'components/modals/ContinueModal';
import ProductIndividual from 'pages/product/ProductIndividual';

import Router from './Router';
import { UserContext } from 'reducer/userReducer';
import { useToasts } from 'components/Toast/ToastProvider';
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
import Button from 'components/Button';

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
		z-index: 9999;
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
		border-radius: 6px;
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
	font-size: 18px;
	font-weight: bold;
	padding-left: 10px;
	line-height: 30px;
	margin: 0;
	display: flex;
	flex-direction: column;

	@media (max-width: 700px) {
		display: ${({ hide }) => hide && 'none'};
	}
`;

export const ApplicationNo = styled.span`
	color: lightgray;
	font-size: 14px;
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

const editLoanRestrictedSections = [
	'pan-verification',
	'identity-verification',
	'application-submitted',
];
export default function Product(props) {
	const { product } = props;
	const dispatch = useDispatch();
	const history = useHistory();
	const productIdPage = atob(product);
	const { addToast } = useToasts();
	const { app } = useSelector(state => state);
	const { userDetails } = app;
	const {
		state: { whiteLabelId },
	} = useContext(AppContext);
	const [hide, setShowHideSidebar] = useState(true);
	const {
		state: {
			completed: completedMenu,
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

	const {
		actions: { removeAllLoanDocuments },
	} = useContext(LoanFormContext);

	const { response } = useFetch({
		url: `${PRODUCT_DETAILS_URL({ whiteLabelId, productId: atob(product) })}`,
		options: { method: 'GET' },
	});
	const [showContinueModal, setShowContinueModal] = useState(false);
	const [index, setIndex] = useState(2);
	const [disableBackCTA, setDisableBackCTA] = useState(false);
	const editLoanData = JSON.parse(sessionStorage.getItem('editLoan'));
	const isViewLoan = !editLoanData ? false : !editLoanData?.isEditLoan;
	const isEditLoan = !editLoanData ? false : editLoanData?.isEditLoan;

	const currentFlowDetect = () => {
		if (completedMenu.length && productId === productIdPage) {
			return showContinueModal ? currentFlow : basePageUrl;
		}

		return currentFlow || basePageUrl;
	};

	let flow = currentFlowDetect();

	useEffect(() => {
		if (response) {
			if (response?.data?.loan_request_type === 2) {
				const selectedProductRes = _.cloneDeep(response.data);
				// New Individual loan changes for displaying sections based on the config - starts
				if (isViewLoan) {
					const tempSections = _.cloneDeep(
						selectedProductRes?.product_details?.sections
					);

					const flowData = tempSections?.filter(section => {
						if (section?.hide_section_usertype) {
							return (
								!section?.hide_section_usertype?.includes(
									userDetails?.usertype
									// 'Sales' - for reference
								) &&
								!section?.hide_section_usertype?.includes(
									userDetails?.user_sub_type
									// 'RCU' - for reference
								)
							);
						} else {
							return tempSections;
						}
					});
					selectedProductRes.product_details.sections = flowData;
				}
				// New Individual loan changes for displaying sections based on the config - ends

				dispatch(setSelectedProduct(selectedProductRes));
				dispatch(
					setSelectedSectionId(
						selectedProductRes?.product_details?.sections[0]?.id
					)
				);
				return;
			}
			if (response?.data?.loan_request_type) {
				response.data.product_details.loan_request_type =
					response?.data?.loan_request_type;
			}
			// displaying the sections based on the config data starts
			if (isViewLoan) {
				const sessionUserDetails = JSON.parse(
					sessionStorage.getItem('userDetails')
				);
				const flowData = response?.data?.product_details?.flow.filter(
					section => {
						if (section?.hide_section_usertype) {
							return (
								!section?.hide_section_usertype?.includes(
									sessionUserDetails?.usertype
								) &&
								!section?.hide_section_usertype?.includes(
									sessionUserDetails?.user_sub_type
								)
							);
						} else {
							return response?.data?.product_details?.flow;
						}
					}
				);
				if (flowData.length > 0) {
					response.data.product_details.flow = flowData;
				}
			}
			configure(response?.data?.product_details?.flow);
			sessionStorage.setItem('productId', atob(product));
			if (response?.data?.otp_configuration?.otp_duration_in_seconds) {
				sessionStorage.setItem(
					'otp_duration',
					response?.data?.otp_configuration?.otp_duration_in_seconds
				);
			}
			// displaying the sections based on the config data ends
		}
		// eslint-disable-next-line
	}, [response]);

	useEffect(() => {
		if (response && flowMap && editLoanData) {
			const steps = Object.keys(flowMap);
			steps.map(ele => {
				setCompleted(ele);
				return null;
			});
			onFlowChange(
				response?.data?.loan_request_type === 1
					? 'business-details'
					: 'personal-details'
			);
			setIndex(2);
		}
		// eslint-disable-next-line
	}, [response, flowMap]);

	useEffect(() => {
		try {
			if (productId !== productIdPage || timestamp < Date.now()) {
				clearFlowDetails();
				clearFormData();
			}
			completedMenu?.length > 0 && setIndex(completedMenu.length);

			const sessionUserDetails = sessionStorage.getItem('userDetails');
			const editLoan = sessionStorage.getItem('editLoan');
			if (sessionUserDetails || editLoan) setDisableBackCTA(true);
		} catch (error) {
			console.error('error-Header-useEffect-', error);
		}
		// eslint-disable-next-line
	}, []);

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
		const product_id = sessionStorage.getItem('productId');
		sessionStorage.clear();
		sessionStorage.setItem('wt_lbl', wt_lbl);
		sessionStorage.setItem('productId', product_id);
		clearFlowDetails(basePageUrl);
		clearFormData();
		resetUserDetails();
		removeAllLoanDocuments();
	};

	const onFlowChange = (flow, i) => {
		if (!i && flow !== 'identity-verification' && flow !== 'pan-verification') {
			setIndex(index + 1);
		}
		setCurrentFlow(flow, atob(product));
		setShowContinueModal(true);
	};

	// console.log('Product-allStates-', {
	// 	completedMenu,
	// 	index,
	// 	response,
	// 	flowMap,
	// 	currentFlow,
	// 	basePageUrl,
	// 	flow,
	// 	subFlowMenu,
	// });

	if (response && response.data && response.data.loan_request_type === 2) {
		return <ProductIndividual />;
	}

	return (
		response &&
		response.data && (
			<Wrapper>
				<Colom1 hide={hide}>
					<ScrollBox>
						<HeadingBox onClick={e => {}}>
							{!disableBackCTA && (
								<BackButton
									src={imgBackArrowCircle}
									alt='goback'
									onClick={() => history.push('/nconboarding/applyloan')}
								/>
							)}
							<ProductName hide={hide} active={flow === 'product-details'}>
								<span>{response.data.name}</span>
								{editLoanData && (
									<ApplicationNo>
										Application No: {editLoanData?.loan_ref_id}
									</ApplicationNo>
								)}
							</ProductName>
						</HeadingBox>
						{response.data?.product_details?.flow?.map((m, idx) => {
							if (isViewLoan && editLoanRestrictedSections.includes(m.id))
								return null;
							return (!m.hidden || m.id === flow) &&
								m.id !== 'product-details' ? (
								<Fragment key={m.id}>
									<Link onClick={e => {}}>
										<Menu active={flow === m.id} hide={hide}>
											<div
												style={
													isEditLoan &&
													editLoanRestrictedSections.includes(m.id)
														? { cursor: 'not-allowed', color: 'lightgrey' }
														: {
																cursor:
																	completedMenu.includes(m.id) &&
																	m.id !== 'pan-verification' &&
																	'pointer',
														  }
												}
												onClick={e => {
													if (isViewLoan) {
														flow = e.target.id;
														setIndex(idx);
														onFlowChange(flow, 'o');
														return;
													}
													if (
														!(
															completedMenu.includes('business-details') ||
															completedMenu.includes('personal-details')
														)
													) {
														return null;
													}

													if (index > idx) {
														// if (idx > completedMenu.length + 1) return;
														if (
															flow !== 'product-details' &&
															flow !== 'personal-details' &&
															flow !== 'application-submitted' &&
															flow !== 'identity-verification' &&
															flow !== 'pan-verification'
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
												k={idx}
											>
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
								</Fragment>
							) : null;
						})}
					</ScrollBox>
				</Colom1>
				<SectionSidebarArrow>
					<ArrowShow hide={hide}>
						<Button
							fill
							onClick={() => hideAndShowMenu()}
							width={10}
							heigth={10}
							borderRadious={'0 5px 5px 0'}
						>
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
