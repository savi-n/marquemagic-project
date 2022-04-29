import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import Modal from '../../shared/components/Modal';
import './style.scss';
import { Link } from 'react-router-dom/cjs/react-router-dom.min';
import Button from '../../shared/components/Button';
import { verifyOtp, generateOtp } from '../../utils/requests';
import { flower } from '../../utils/helper';
import Input from '../../shared/components/Input';
import Message from '../../shared/components/Message';

var arr;

function OTPInput(d) {
	const inputs = document.querySelectorAll('#otp > *[id]');

	if (d) {
		inputs.forEach(el => {
			el.value = '';
		});
		return;
	}

	for (let i = 0; i < inputs.length; i++) {
		inputs[i].addEventListener('keydown', function(event) {
			if (event.key === 'Backspace') {
				inputs[i].value = '';
				if (i !== 0) inputs[i - 1].focus();
			} else {
				if (i === inputs.length - 1 && inputs[i].value !== '') {
					return true;
				} else if (event.keyCode > 47 && event.keyCode < 58) {
					inputs[i].value = event.key;
					if (i !== inputs.length - 1) inputs[i + 1].focus();
					event.preventDefault();
				} else if (event.keyCode > 64 && event.keyCode < 91) {
					inputs[i].value = String.fromCharCode(event.keyCode);
					if (i !== inputs.length - 1) inputs[i + 1].focus();
					event.preventDefault();
				}
			}
		});
	}
	arr = inputs;
}

export default function OtpModal(props) {
	const {
		toggle,
		show,
		mobileNo,
		customerId,
		userId,
		setBankStatus,
		setUserId,
		setStatus,
		setSelectedAccount,
		selectedAccount,
	} = props;
	OTPInput();

	const otpResendTime = 60;
	const [seconds, setSeconds] = useState(otpResendTime);
	var [otp, setOtp] = useState('');
	const [disabled, setDisabled] = useState(true);
	const [invalid, setInvalid] = useState(false);
	const [multipleSelector, setMultipleSelector] = useState(false);
	const [accountsData, setAccountsData] = useState(null);
	const [message, setMessage] = useState(null);
	const history = useHistory();
	var response;
	const submitOtp = async () => {
		arr.forEach(el => {
			setOtp((otp += el.value));
		});
		otp = Number(otp);
		OTPInput(true);
		const bodyData = {
			otp,
			mobileNo,
			customerId,
			userId,
		};
		const data = await verifyOtp(bodyData);
		response = data.data;
		setStatus(response.statusCode);
		sessionStorage.setItem('userId', data.data.userDetails?.id);
		if (response.statusCode === 'NC200') {
			setSelectedAccount(response);
			setOtp('');
			sessionStorage.setItem('selectedAccount', JSON.stringify(response));
			const url = flower(history);
			history.push(url);
		} else if (
			response.statusCode === 'NC302' &&
			response.message.includes('Invalid')
		) {
			setInvalid(true);
			setMessage(response.message);
			setOtp('');
		} else if (
			response.statusCode === 'NC302' &&
			response.message.includes('Multiple')
		) {
			setMultipleSelector(true);
			setAccountsData(response.accountDetails);
		}
	};

	useEffect(() => {
		if (seconds > 0) {
			setTimeout(() => setSeconds(seconds - 1), 1000);
		} else {
			setSeconds(0);
			setDisabled(false);
		}
	}, [seconds]);

	const handleResend = async e => {
		e.preventDefault();
		setSeconds(otpResendTime);
		OTPInput(true);
		setDisabled(true);
		const data = await generateOtp(mobileNo, customerId);
		setBankStatus(data.statusCode);
		setUserId(data.userId);
	};

	const handleChange = async e => {
		sessionStorage.removeItem('selectedAccount');
		setInvalid(false);
		setMessage(null);
		const selectedAccountData = accountsData.filter(
			el => el.accNum === e.target.value
		);
		setSelectedAccount(selectedAccountData[0]);
		sessionStorage.setItem(
			'selectedAccount',
			JSON.stringify(selectedAccountData[0])
		);
	};

	const handleProceed = async () => {
		if (!selectedAccount) {
			setInvalid(true);
			setMessage('Please select an account to proceed');
			return;
		}
		const bodyData = {
			otp,
			mobileNo: selectedAccount.mobileNum,
			customerId: selectedAccount.customerId,
			userId,
		};
		const data = await verifyOtp(bodyData);
		response = data.data;
		setStatus(response.statusCode);
		sessionStorage.setItem('userId', data.data.userDetails?.id);
		if (response.statusCode === 'NC200') {
			setSelectedAccount(response);
			setOtp('');
			sessionStorage.setItem('selectedAccount', JSON.stringify(response));
			const url = flower(history);
			history.push(url);
		} else {
			setInvalid(true);
			setMessage(response && response.message);
		}
	};

	const hiddenData = mobileNo.split('');

	return (
		<Modal
			onClose={toggle}
			height='auto'
			title={multipleSelector ? 'Select Account' : 'OTP Verification'}
			margin='base'
			width='lg'
			show={show}>
			<Message message={message} invalid={invalid} />
			{!multipleSelector ? (
				<>
					<p>
						A six digit OTP has been sent to *******
						{hiddenData.splice(hiddenData.length - 3, 3)}. <br /> Kindly enter
						it below. &nbsp;
						<b className='cursor-pointer' onClick={toggle}>
							Wrong number?
						</b>
					</p>
					<div className='mb-6 text-center'>
						<div id='otp' className='flex justify-center'>
							{['first', 'second', 'third', 'fourth', 'fifth', 'sixth'].map(
								el => (
									<input
										className='m-2 text-center form-control form-control-solid rounded focus:border-blue-400 focus:shadow-outline'
										type='text'
										id={`${el}`}
										maxLength='1'
										onFocus={() => {
											setInvalid(false);
											setMessage(null);
										}}
									/>
								)
							)}
						</div>
					</div>
					<div className={`${seconds > 0 ? 'flex' : 'hidden'} opacity-50`}>
						Request a new OTP after: {seconds}
					</div>
					<Link
						to='#'
						onClick={e => (!disabled ? handleResend(e) : e.preventDefault())}
						className={`${disabled &&
							'text-pink-400 cursor-not-allowed'} ${!disabled &&
							'hover:text-pink-400 cursor-pointer text-pink-600 cursor-pointer'} py-4`}>
						Resend OTP
					</Link>
					<Button type='blue' onClick={() => submitOtp()}>
						Confirm OTP
					</Button>
				</>
			) : (
				accountsData && (
					<section className='flex flex-col items-center gap-y-6'>
						<p>
							Multiple accounts found. <br /> Please select the account you want
							to continue your application with
						</p>
						<Input
							onChange={e => handleChange(e)}
							label='Select account'
							type='dropdown'
							data={accountsData}
						/>
						<Button onClick={() => handleProceed()} type='blue'>
							Proceed
						</Button>
					</section>
				)
			)}
		</Modal>
	);
}
