import { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import styled from 'styled-components';

import Card from '../../components/Card';
import useFetch from '../../hooks/useFetch';
import { AppContext } from '../../reducer/appReducer';
import {
	API_END_POINT,
	OTP_API_END_POINT,
	PRODUCT_LIST_URL,
} from '../../_config/app.config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import Modal from '../../components/Modal';
import Button from 'components/Button';
import imgDotElement from 'assets/images/bg/Landing_page_dot-element.png';
import imgEditIcon from 'assets/icons/edit-icon.png';
import Loader from 'Branch/components/Loader';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useToasts } from 'components/Toast/ToastProvider';
import Loading from 'components/Loading';

const Wrapper = styled.div`
	padding: 30px 80px 50px 80px;
	@media (max-width: 700px) {
		padding: 2rem;
	}
`;

const Head = styled.h3`
	text-align: center;
	font-size: 1.5em;
	margin-bottom: 30px;
	font-weight: 600;
	color: #4e4e4e;
`;

const ProductsBox = styled.div`
	display: flex;
	justify-content: center;
	/* gap: 50px; */
	/* gap: 20px; */
	/* align-items: center; */
	/* gap: calc(12% / 3); */
	@media (max-width: 700px) {
		flex-direction: column;
	}
`;

const StatusBox = styled.div`
	width: 80%;
	margin: 50px auto 50px auto;
	@media (max-width: 700px) {
		width: 80%;
		margin: 50px auto 50px auto;
	}
`;

const StatusInputBox = styled.div`
	margin-top: 20px;
	border-radius: 10px;
	padding: 30px;
	box-shadow: rgba(11, 92, 255, 0.2) 0px 7px 29px 0px;
	@media (max-width: 700px) {
		width: auto;
	}
`;

const SectionLoanStatus = styled.section`
	@media (max-width: 700px) {
		margin: 0;
		padding: 30px;
		width: 100%;
	}
`;

const DivAdd = styled.div`
	gap: 40px 0;
	padding: 20px 0 20px 0;
	display: flex;
	justify-content: center;
	flex-wrap: wrap;
	@media (max-width: 700px) {
		gap: 0;
	}
	/* gap: 50px; */
	/* align-items: center; */
	/* gap: calc(12% / 3); */
`;

const Add = styled.div`
	color: ${({ theme }) => theme.main_theme_color};
	border-radius: 50px;
	padding: 20px;
	width: calc(100% / 5);
	font-size: 30px;
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
	gap: 10px;
	cursor: pointer;
	font-weight: 100;
`;
const AddProductBox = styled.div`
	display: flex;
	justify-content: center;
	margin-top: 40px;
	button {
		padding: 6px 0px;
		svg {
			font-weight: 500;
		}
		span {
			font-size: 16px;
		}
	}
`;

const ImgDotElementRight = styled.img`
	position: fixed;
	right: 0;
	height: 40px;
	width: 100px;
	margin-right: 50px;
	@media (max-width: 700px) {
		z-index: -1;
		height: 20px;
		width: 50px;
	}
`;
const ImgDotElementLeft = styled.img`
	position: fixed;
	left: 0;
	margin-top: 300px;
	height: 40px;
	width: 100px;
	margin-left: 50px;
	@media (max-width: 700px) {
		z-index: -1;
		height: 20px;
		width: 50px;
	}
`;

const ProductName = styled.div`
	color: #4e4e4e;
	font-weight: bold;
`;

const AppList = styled.ul`
	list-style-type: none;
`;

const AppStatusList = styled.li`
	display: flex;
	flex-direction: column;
	text-align: left;
	line-height: 40px;
	padding: 20px 0;
	border-bottom: 1px solid #e8e8e8;
	position: relative;
	strong {
		color: #525252;
	}
`;

const AppEditIcon = styled.img`
	position: absolute;
	margin-top: 25px;
	height: 40px;
	/* margin-top: 20px; */
	cursor: pointer;
`;
const AppNumber = styled.div`
	padding-left: 65px;
`;
const AppStatus = styled.div`
	padding-left: 65px;
`;

const AppStatusLine1 = styled.div`
	/* border: 1px solid red; */
	/* margin-left: auto; */
	display: flex;
	text-align: center;
	align-items: center;
`;

const AppStatusLine2 = styled.div`
	/* border: 1px solid red; */
	/* margin-left: auto; */
	margin-top: 10px;
	padding: 0 50px;
	/* margin: 0 auto; */
	width: 100%;
	display: flex;
	justify-content: space-between;
	text-align: center;
	align-items: center;
`;

const AppStatusDotLine = styled.div`
	background: lightgrey;
	z-index: -1;
	height: 1px;
	/* border: 1px solid green; */
	width: 85%;
	margin-left: 20px;
	position: absolute;
	/* width: 500px; */
	/* position: absolute; */
`;

const AppStatusDots = styled.div`
	/* border: 1px solid yellow; */
	height: 10px;
	width: 10px;
	margin: 0 15px;
	/* background: green; */
	background: ${({ active }) => (active ? '#00D884' : 'lightgrey')};
	border-radius: 50%;
`;

const ModalOTPHeader = styled.h2`
	color: #525252;
	font-weight: bold;
`;

const ModalOTPBody = styled.div`
	text-align: center;
	input {
		border: 1px solid grey;
		text-align: center;
		height: 40px;
		line-height: 40px;
		border-radius: 5px;
	}
`;

const ButtonResendOTP = styled.button`
	color: blue;
	margin-top: 15px;
	font-size: 14px;
`;

const ErrorOTP = styled.p`
	margin-top: 20px;
	color: red;
`;

const ModalOTPFooter = styled.div`
	display: flex;
	flex-direction: column;
	text-align: center;
	justify-content: center;
	align-items: center;
	padding: 30px 0;
	button {
		padding: 6px 0px;
		min-width: 150px;
		max-width: 150px;
	}
`;

export default function Products() {
	const {
		state: { whiteLabelId },
	} = useContext(AppContext);

	const { response: products } = useFetch({
		url: PRODUCT_LIST_URL({ whiteLabelId }),
	});
	const history = useHistory();
	const [addedProduct, setAddedProduct] = useState(null);

	const [searching, setSearching] = useState(false);
	const [refstatus, setRefstatus] = useState('');
	const { addToast } = useToasts();
	const [status, setStatus] = useState(null);
	const [loanList, setLoanList] = useState([]);
	const [statusList, setStatusList] = useState([]);
	const [primaryStatusList, setPrimaryStatusList] = useState([]);
	const [modalOTP, setModalOTP] = useState(false);
	const [modalOTPData, setModalOTPData] = useState({});
	const [OTP, setOTP] = useState('');
	const [verifyingOTP, setVerifyingOTP] = useState(false);
	const [errOTP, setErrOTP] = useState('');
	const [addProduct, setAddProduct] = useState(false);
	const [loadingOTP, setLoadingOTP] = useState(false);

	const getStatusCustomer = async () => {
		try {
			setSearching(true);
			setLoanList([]);
			const white_label_id = localStorage.getItem('wt_lbl');
			const url = `${API_END_POINT}/getLoanDetails?id=${refstatus.trim()}&white_label_id=${white_label_id}`;
			// const res = await axios.post(url, { loanRefId: refstatus.trim() });
			const res = await axios.get(url);
			if (res?.data?.status === 'nok') {
				setLoanList([]);
				setSearching(false);
				return addToast({
					message: res?.data?.message || 'No loans found',
					type: 'error',
				});
			}
			if (res?.data?.data && res?.data?.data.length > 0) {
				setLoanList(res?.data?.data || []);
				// setStatusList(res?.data?.ncStatusManage || []);
				// setStatus(res?.data?.statusName || '');
				const statusList = res?.data?.ncStatusManage || [];
				// console.log('statusList-before-', statusList);
				// statusList.sort((a, b) => a.sort_by_id - b.sort_by_id);
				// console.log('statusList-after-', statusList);
				const primary = [];
				statusList.map(s => {
					if (s.parent_id === 0) primary.push(s);
					return null;
				});
				setPrimaryStatusList(primary);
			} else {
				addToast({
					message: 'No Loans Found',
					type: 'error',
				});
				setLoanList([]);
			}
			setSearching(false);
		} catch (error) {
			addToast({
				message:
					error?.response?.data?.message || 'Server down, Try after sometimes',
				type: 'error',
			});
			setLoanList([]);
			setSearching(false);
			// alert('Server down, Try after sometimes.!');
			console.log('error-getStatusCustomer-', error);
			// console.log('error-getStatusCustomer-response-', error.response);
			// alert(error.response.data.message);
		}
	};

	const verifyOTP = async () => {
		try {
			setVerifyingOTP(true);
			setErrOTP('');
			// console.log('verifyOTP-modalOTPData-', modalOTPData);
			const verifyOtpRes = await axios.post(
				`${OTP_API_END_POINT}/user/verifyotp`,
				{
					mobile: modalOTPData?.business_id?.contactno || '',
					os: 'web',
					device_id: 'nan',
					otp: OTP,
				}
			);
			// console.log('verifyOtpRes-', modalOTPData);
			if (verifyOtpRes?.data?.status === 'ok') {
				// alert('valid OTP');
				const loanDetailsRes = await axios.get(
					`${API_END_POINT}/getDetailsWithLoanRefId?loan_ref_id=${
						modalOTPData.loan_ref_id
					}`
				);
				const productID = loanDetailsRes?.data?.data?.product_details?.id;
				localStorage.setItem(
					'editLoan',
					JSON.stringify(loanDetailsRes?.data?.data || {})
				);
				// console.log('loanDetailsRes-', loanDetailsRes?.data);
				setVerifyingOTP(false);
				history.push({
					pathname: `/applyloan/product/${btoa(productID)}`,
					data: productID,
				});
			} else {
				setErrOTP('Invalid OTP');
			}
			setVerifyingOTP(false);
		} catch (err) {
			console.log('err-verifyOTP-', err);
			setErrOTP('Invalid OTP');
			setVerifyingOTP(false);
		}
	};

	const generateOTP = async loan => {
		try {
			setLoadingOTP(true);
			setErrOTP('');
			const otpRes = await axios.post(`${OTP_API_END_POINT}/user/sendotp`, {
				mobile: loan?.business_id?.contactno || '',
			});
			// console.log('generateOTP-otpRes-', otpRes);
			setModalOTPData(loan);
			setModalOTP(true);
			setLoadingOTP(false);
			if (otpRes.data.status === 'ok') {
				addToast({
					message: 'successfully send OTP',
					type: 'success',
				});
			} else {
				addToast({
					message: otpRes.data.message || 'Server down, Try after sometimes',
					type: 'error',
				});
			}
		} catch (err) {
			console.log('err-generateOTP-', err);
			setLoadingOTP(false);
			addToast({
				message: 'Server down, Try after sometimes',
				type: 'error',
			});
		}
	};

	useEffect(() => {
		const url = window.location.hostname;
		localStorage.removeItem('formstate');
		localStorage.removeItem('formstatepan');
		localStorage.removeItem('aadhar');
		localStorage.removeItem('encryptWhiteLabel');
		localStorage.removeItem('userToken');
		localStorage.removeItem(url);
		const wt_lbl = localStorage.getItem('wt_lbl');
		localStorage.clear();
		localStorage.setItem('wt_lbl', wt_lbl);
	}, []);

	useEffect(() => {}, [addedProduct]);

	return (
		<Wrapper>
			{' '}
			<Head>Choose a Loan Product</Head>
			<ImgDotElementRight src={imgDotElement} alt='dot' />
			<ImgDotElementLeft src={imgDotElement} alt='dot' />
			<ProductsBox>
				{products &&
					products.data.map(
						(product, idx) =>
							idx < 3 && (
								<Card product={product} key={`product__${product.id}`} />
							)
					)}
			</ProductsBox>
			<ProductsBox style={{ marginTop: 40 }}>
				{!addedProduct && products?.data?.length > 3 ? (
					<AddProductBox>
						<Button onClick={() => setAddProduct(true)} roundCorner>
							<FontAwesomeIcon size='sm' icon={faPlus} />
							&nbsp;&nbsp;
							<span className='text-blue'>Add Product</span>
						</Button>
					</AddProductBox>
				) : (
					<>
						{addedProduct && (
							<Card product={addedProduct} key={`product__${addProduct.id}`} />
						)}
					</>
				)}
			</ProductsBox>
			<Modal show={addProduct} width='80%' onClose={() => setAddProduct(false)}>
				{loadingOTP ? (
					<div
						style={{
							height: 200,
							width: 200,
							margin: '0 auto',
						}}>
						<Loading />
					</div>
				) : (
					<>
						<section className='text-center w-full py-6'>
							<span className='w-full text-xl'>Select a Loan Product</span>
						</section>
						<DivAdd>
							{products &&
								products.data.map((product, idx) => {
									return (
										<>
											{idx > 2 && (
												<Card
													add={true}
													setAddedProduct={setAddedProduct}
													product={product}
													key={`product__${product.id}`}
													setAddProduct={setAddProduct}
												/>
											)}
										</>
									);
								})}
						</DivAdd>
					</>
				)}
			</Modal>
			<Modal show={modalOTP} width='50%' onClose={() => setModalOTP(false)}>
				<ModalOTPHeader className='text-center w-full py-6'>
					Please enter OTP sent to your Phone Number +91 9825252552
				</ModalOTPHeader>
				<ModalOTPBody>
					<input
						placeholder='Enter OTP'
						onChange={e => setOTP(e.target.value)}
					/>
					<div>
						<ButtonResendOTP
							disabled={loadingOTP}
							onClick={() => {
								setOTP('');
								generateOTP(modalOTPData);
							}}>
							Resend OTP
						</ButtonResendOTP>
					</div>
				</ModalOTPBody>
				<ModalOTPFooter>
					<Button
						fill
						loading={verifyingOTP}
						disabled={verifyingOTP}
						onClick={verifyOTP}>
						OK
					</Button>
					{errOTP && <ErrorOTP>{errOTP}</ErrorOTP>}
				</ModalOTPFooter>
			</Modal>
			<StatusBox>
				<ProductName>
					Here, you can check your application status by entering the Loan
					Reference ID, Phone No or PAN No
				</ProductName>
				<StatusInputBox>
					<section
						className='flex font-medium my-2'
						style={{ marginRight: 15 }}>
						<input
							className='h-10 w-full bg-blue-100 px-4 py-6 focus:outline-none rounded-l-full my-2'
							placeholder='Enter Loan Reference ID, Phone No or PAN No'
							onChange={e => setRefstatus(e.target.value)}
						/>
						<FontAwesomeIcon
							className='h-12 rounded-r-full cursor-pointer bg-blue-100 text-indigo-700 text-5xl px-4 p-2 my-2'
							icon={faSearch}
							onClick={() => getStatusCustomer()}
						/>
					</section>
					{/* <section className='flex items-center font-semibold'>
					<span className='px-3 font-semibold'>Application status :</span>{' '}
					{searching ? <Loader /> : status && status}
				</section> */}
					<AppList>
						{searching && (
							<div
								style={{
									height: 200,
									width: 200,
									margin: '0 auto',
								}}>
								<Loading />
							</div>
						)}
						{loanList.map((d, appIndex) => {
							return (
								<AppStatusList
									key={d?.id}
									style={
										appIndex === loanList.length - 1 ? { border: 'none' } : {}
									}>
									<AppStatusLine1>
										<AppEditIcon
											src={imgEditIcon}
											alt='edit'
											onClick={() => {
												generateOTP(d);
											}}
										/>
										<AppNumber>
											Application Number: <strong>{d?.loan_ref_id}</strong>
										</AppNumber>
										<AppStatus>
											Status: <strong>{d?.currentLoanStatus?.name}</strong>
										</AppStatus>
									</AppStatusLine1>
									<AppStatusLine2>
										<AppStatusDotLine />
										{primaryStatusList.map((p, i) => {
											return (
												<AppStatusDots
													active={i + 1 <= d?.currentLoanStatus?.sort_by_id}
												/>
											);
										})}
									</AppStatusLine2>
								</AppStatusList>
							);
						})}
					</AppList>
				</StatusInputBox>
			</StatusBox>
		</Wrapper>
	);
}
