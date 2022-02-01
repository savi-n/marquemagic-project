import { useState, useContext } from 'react';
import styled from 'styled-components';

import Modal from './Modal';
import Button from './Button';
import { BANK_LIST_API, BANK_TOKEN_API, NC_STATUS_CODE } from '../_config/app.config';
import BANK_FLOW from '../_config/bankflow.config';
import { AppContext } from '../reducer/appReducer';
import useFetch from '../hooks/useFetch';
import useForm from '../hooks/useForm';
import { useToasts } from './Toast/ToastProvider';
import Loading from '../components/Loading';

const Bank = styled.div`
	padding: 10px;
	border: 1px solid black;
	border-radius: 4px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	width: 40%;
	margin: 10px 0;
	cursor: pointer;
	border: 1px solid rgba(0, 0, 0, 0.1);
	border-radius: 6px;
`;

const BankWrapper = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	flex-wrap: wrap;
	gap: 10%;
	padding: 30px;
`;

const BankDetails = styled(BankWrapper)`
	flex-basis: 100%;
	justify-content: center;
`;

const BankName = styled.div`
	flex: 1;
	padding: 0 10px;
`;

const TitleWrapper = styled.div`
	flex-basis: 100%;
`;

const Title = styled.h4`
	font-size: 1.2em;
	font-weight: 500;
	/* width: 90%; */
	text-align: center;
	/* margin-bottom: 20px; */
	border-bottom: 1px solid rgba(0, 0, 0, 0.3);
	padding-bottom: 10px;
`;

const ContentWrapper = styled.div`
	justify-content: center;
	display: flex;
	flex-wrap: wrap;
`;

const BankLogo = styled.img`
	width: 30px;
	height: 30px;
`;

const Form = styled.form`
	display: flex;
	flex-direction: column;
	flex-basis: 100%;
	padding: 20px 50px;
	gap: 10px;
	align-items: center;
	justify-content: center;
	@media (max-width: 700px){
		padding: 20px 0px;
	}
`;

const Captcha = styled.img`
	height: 50px;
	width: 100px;
	object-fit: fill;
	display: block;
	margin: 10px auto;
`;

export default function BankStatementModal({ showModal, onClose }) {
	const {
		state: { bankToken, clientToken }
	} = useContext(AppContext);

	const { response: bankList, loading, newRequest } = useFetch({
		url: BANK_LIST_API,
		headers: { authorization: `${bankToken}` }
	});

	const { addToast } = useToasts();

	const { response: token } = useFetch({
		url: BANK_TOKEN_API,
		options: {
			method: 'POST',
			data: {
				type: 'EQFAX',
				linkRequired: false,
				isEncryption: false
			}
		},
		headers: {
			authorization: clientToken
		}
	});

	const [processing, setProcessing] = useState(false);

	const [bankChoosen, setBankChoosen] = useState({});
	const [flowStep, setFlowStep] = useState(0);
	const [captchaUrl, setCaptchaUrl] = useState(null);
	const [accountsList, setAccountsList] = useState([]);

	const postData = async (api, data, method = 'POST') => {
		return newRequest(
			api,
			{
				method,
				data,
				timeout: 180000
			},
			{ authorization: bankToken }
		);
	};

	const flowCompleted = () => {
		onClose();
	};

	const onBankSelect = bank => {
		setBankChoosen(bank);
	};

	const handleNext = async () => {
		if (!captchaUrl && BANK_FLOW[bankChoosen.name.toLowerCase()][flowStep]?.captchaGet) {
			setProcessing(true);
			const getCaptchaRes = await getCaptcha(BANK_FLOW[bankChoosen.name.toLowerCase()][flowStep]?.captchaGet);

			if (getCaptchaRes?.status) {
				setCaptchaUrl(getCaptchaRes?.imagePath);
			} else {
				addToast({
					message: getCaptchaRes.message || 'Something Went Wrong. Try Again Later!',
					type: 'error'
				});
			}
			setProcessing(false);

			if (!getCaptchaRes?.status) return;
		}

		BANK_FLOW[bankChoosen.name.toLowerCase()]?.length ? setFlowStep(flowStep + 1) : flowCompleted();
	};

	const getCaptcha = async url => {
		const response = await postData(url, {}, 'GET');
		const data = response.data;

		// NC200 and NC500
		//   {
		//     "statusCode": "NC500",
		//     "message": errorMessage,
		//     "imagePath": "null"
		//  }
		if (data?.imagePath && data?.statusCode === NC_STATUS_CODE.NC200) {
			return {
				status: true,
				imagePath: data?.imagePath
			};
		}
		return {
			status: false,
			message: data?.message
		};
	};

	const processApiResponse = async (statusCode, response) => {
		switch (statusCode) {
			case 'error': {
				addToast({
					message: response?.message || 'Something Went Wrong. Try Again Later!',
					type: 'error'
				});
				return;
			}
			case 'accounts': {
				setAccountsList(response.accounts);
				BANK_FLOW[bankChoosen.name.toLowerCase()]?.length > flowStep
					? setFlowStep(flowStep + 1)
					: flowCompleted();
				return;
			}

			case 'next': {
				BANK_FLOW[bankChoosen.name.toLowerCase()]?.length > flowStep
					? setFlowStep(flowStep + 1)
					: flowCompleted();
				return;
			}

			case 'skip': {
				BANK_FLOW[bankChoosen.name.toLowerCase()]?.length > flowStep
					? setFlowStep(flowStep + 2)
					: flowCompleted();
				return;
			}

			case 'captcha': {
				setCaptchaUrl(response?.imagePath);
				BANK_FLOW[bankChoosen.name.toLowerCase()]?.length > flowStep
					? setFlowStep(flowStep + 1)
					: flowCompleted();
				return;
			}

			case 'updateCaptcha': {
				addToast({
					message: response?.message || 'Something Went Wrong. Try Again Later!',
					type: 'error'
				});
				const getCaptchaRes = await getCaptcha(
					BANK_FLOW[bankChoosen.name.toLowerCase()][flowStep - 1]?.captchaGet
				);
				if (getCaptchaRes?.status) {
					setCaptchaUrl(getCaptchaRes?.imagePath);
				}
				return;
			}

			case 'invalidOtp': {
				addToast({
					message: response?.message || 'Invalid OTP. Try Again with valid OTP!',
					type: 'error'
				});
				return;
			}

			case 'done': {
				flowCompleted();
				return;
			}

			default: {
				return;
			}
		}

		// if (response.statusCode === NC_STATUS_CODE.NC201) {
		//   // response.noOfAccounts
		//   setAccountsList(response.accounts);
		// }

		// if (response.statusCode === NC_STATUS_CODE.NC302) {
		//   // response.noOfAccounts
		//   setAccountsList(response.accounts);
		// }
	};

	const handleSubmitForm = async formData => {
		setProcessing(true);

		const status = BANK_FLOW[bankChoosen.name.toLowerCase()]?.[flowStep - 1]?.status || {};

		try {
			const post = await postData(BANK_FLOW[bankChoosen.name.toLowerCase()]?.[flowStep - 1]?.api, formData);

			const response = post.data;

			const statusCode = status[response.statusCode] || '00';

			if (statusCode === '00') {
				addToast({
					message: response?.message || 'Something Went Wrong. Try Again Later!',
					type: 'error'
				});
				return;
			}

			processApiResponse(statusCode, response);

			// NC302 error message captcha api

			// NC202 account success --> OTP Field show

			// NC201 account list
			//   {
			//     "statusCode": "NC201",
			//     "noOfAccounts": 2,
			//     "accounts": [
			//         {
			//             "Account": "sese",
			//             "AccountType": "sese",
			//             "Branch": "sese",
			//         },
			//         {
			//             "Account": "sese",
			//             "AccountType": "sese",
			//             "Branch": "sese",
			//         }
			//     ],
			//     "message": "Success",
			//     "imagePath": "null"
			// }

			// NC302 update captcha image

			// NC500 error message

			// NC200 done

			// submit otp
			// nc201
			// nc200
			// nc302 invalid otp
			// nc500

			//account select
			// accountNumebr -> send in payload
			// nc200- done
			//nc500 error messae

			// if (response.statusCode === NC_STATUS_CODE.NC202) {
			//   if (response.imagePath) {
			//     setCaptchaUrl(response.imagePath);
			//   }
			//   if (response.noOfAccounts > 1) {
			//     setAccountsList(response.noOfAccounts.accounts);
			//   }

			// BANK_FLOW[bankChoosen.name.toLowerCase()]?.length > flowStep
			//   ? setFlowStep(flowStep + 1)
			//   : flowCompleted();
			// }
		} catch (error) {
			console.log(error);
		}
		setProcessing(false);
	};

	const { register, handleSubmit, formState } = useForm();
	const { banks = [] } = bankList || {};

	const buildTemplate = flow => {
		if (flow.type === 'captcha') {
			return (
				<div key={flow.name}>
					<Captcha src={captchaUrl} alt='Captcha' loading='lazy' />
					{register({ ...flow, value: formState?.values[flow.name] })}
				</div>
			);
		}
		return <div key={flow.name}>{register({ ...flow, value: formState?.values[flow.name] })}</div>;
	};

	return (
		<Modal show={showModal} onClose={onClose} width='50%'>
			{!loading ? (
				<ContentWrapper>
					{flowStep === 0 && (
						<>
							<TitleWrapper>
								<Title>Select Bank</Title>
							</TitleWrapper>
							<BankWrapper>
								{banks?.map(bank => (
									<Bank key={bank.id} onClick={() => onBankSelect(bank)}>
										<BankLogo src={bank.logo} alt={bank.name} loading='lazy' />
										<BankName>{bank.name}</BankName>
										<input type='radio' readOnly checked={bankChoosen.name === bank.name} />
									</Bank>
								))}
							</BankWrapper>
							<Button
								name={processing ? 'Please Wait... ' : 'Next'}
								fill
								style={{
									width: '200px',
									background: 'blue'
								}}
								disabled={!bankChoosen.name || processing}
								onClick={handleNext}
							/>
						</>
					)}

					{flowStep > 0 && (
						<BankDetails>
							<BankLogo src={bankChoosen.logo} alt={bankChoosen.name} loading='lazy' />
							<Form onSubmit={handleSubmit(handleSubmitForm)}>
								{BANK_FLOW[bankChoosen.name.toLowerCase()]?.[flowStep - 1]?.fields.map(flow =>
									buildTemplate(flow)
								)}
								<Button
									type='submit'
									name={processing ? 'Please Wait... ' : 'Next'}
									fill
									disabled={!!Object.keys(formState.error).length || processing}
									style={{
										width: '200px',
										background: 'blue'
									}}
								/>
							</Form>
						</BankDetails>
					)}
				</ContentWrapper>
			) : (
				<Loading />
			)}
		</Modal>
	);
}
