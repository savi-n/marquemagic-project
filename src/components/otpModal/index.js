import { useState } from 'react';
import Modal from '../../shared/components/Modal';
import './style.scss';
import { Link } from 'react-router-dom/cjs/react-router-dom.min';
import Button from '../../shared/components/Button';

var arr;

function OTPInput() {
	const inputs = document.querySelectorAll('#otp > *[id]');
	inputs.forEach(el => {
		el.value = '';
	});
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
	const { toggle, show } = props;
	var [otp, setOtp] = useState('');
	OTPInput();
	const submitOtp = () => {
		arr.forEach(el => {
			setOtp((otp += el.value));
		});
		otp = Number(otp);
		console.log(otp);
	};

	return (
		<Modal onClose={toggle} height='auto' title='OTP Verification' margin='base' width='lg' show={show}>
			<p>
				A six digit OTP has been sent to *******208. <br /> Kindly enter it below. &nbsp;
				<b className='cursor-pointer' onClick={toggle}>
					Wrong number?
				</b>
			</p>
			<div className='mb-6 text-center'>
				<div id='otp' className='flex justify-center'>
					<input
						className='m-2 text-center form-control form-control-solid rounded focus:border-blue-400 focus:shadow-outline'
						type='text'
						id='first'
						maxLength='1'
					/>
					<input
						className='m-2 text-center form-control form-control-solid rounded focus:border-blue-400 focus:shadow-outline'
						type='text'
						id='second'
						maxLength='1'
					/>
					<input
						className='m-2 text-center form-control form-control-solid rounded focus:border-blue-400 focus:shadow-outline'
						type='text'
						id='third'
						maxLength='1'
					/>
					<input
						className='m-2 text-center form-control form-control-solid rounded focus:border-blue-400 focus:shadow-outline'
						type='text'
						id='fourth'
						maxLength='1'
					/>
					<input
						className='m-2 text-center form-control form-control-solid rounded focus:border-blue-400 focus:shadow-outline'
						type='text'
						id='fifth'
						maxLength='1'
					/>
					<input
						className='m-2 text-center form-control form-control-solid rounded focus:border-blue-400 focus:shadow-outline'
						type='text'
						id='sixth'
						maxLength='1'
					/>
				</div>
			</div>
			<Link to='#' onClick={e => e.preventDefault()} className='text-pink-600 hover:text-pink-400 py-4'>
				Resend OTP
			</Link>
			<Button type='blue' onClick={() => submitOtp()}>
				Confirm OTP
			</Button>
		</Modal>
	);
}
