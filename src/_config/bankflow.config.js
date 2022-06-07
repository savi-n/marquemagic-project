/* This component is used to define the flow while fetching bank statements
All the APIs, captcha, fields required in BankStatementModal as per
bank selection are defined in this js file */

import { ENDPOINT_BANK } from '../_config/app.config';
const BANK_FLOW = {
	sbi: [
		{
			captchaGet: `${ENDPOINT_BANK}/spGetCaptcha`,
			fields: [
				{
					name: 'userId',
					placeholder: 'User ID',
					rules: {
						required: true,
					},
				},
				{
					name: 'password',
					type: 'password',
					placeholder: 'Password',
					rules: {
						required: true,
					},
				},
				{
					type: 'captcha',
					name: 'captcha',
					placeholder: 'Captcha',
					rules: {
						required: true,
					},
				},
			],
			status: {
				NC500: 'error',
				NC201: 'accounts',
				NC202: 'next',
				NC302: 'updateCaptcha',
				NC200: 'done',
			},
			api: `${ENDPOINT_BANK}/spSubmitCaptcha`,
		},
		{
			fields: [
				{
					name: 'otp',
					placeholder: 'OTP',
					rules: {
						required: true,
					},
				},
			],
			api: `${ENDPOINT_BANK}/spSubmitOtp`,
			status: {
				NC500: 'error',
				NC201: 'accounts',
				NC302: 'invalidOtp',
				NC200: 'next',
			},
		},
		{
			type: 'accountslist',
			fields: [
				{
					name: 'selectedAccount',
					rules: {
						required: true,
					},
				},
			],
			api: `${ENDPOINT_BANK}/spSelectAccount`,
			status: {
				NC500: 'error',
				NC200: 'done',
			},
		},
	],
	axis: [
		{
			fields: [
				{
					name: 'userId',
					placeholder: 'User ID',
					rules: {
						required: true,
					},
				},
				{
					name: 'password',
					type: 'password',
					placeholder: 'Password',
					rules: {
						required: true,
					},
				},
			],
			status: {
				NC500: 'error',
				NC302: 'error',
				NC202: 'skip',
				NC203: 'next',
				NC200: 'next',
			},
			api: `${ENDPOINT_BANK}/apSubmitDetails`,
		},
		{
			fields: [
				{
					name: 'otp',
					placeholder: 'Security Question',
					rules: {
						required: true,
					},
				},
			],
			api: `${ENDPOINT_BANK}/apSubmitSecurityAnswer`,
			status: {
				NC500: 'error',
				NC302: 'error',
				NC202: 'next',
				NC200: 'next',
			},
		},
		{
			fields: [
				{
					name: 'otp',
					placeholder: 'OTP',
					rules: {
						required: true,
					},
				},
			],
			api: `${ENDPOINT_BANK}/apSubmitOtp`,
			status: {
				NC500: 'error',
				NC302: 'error',
				// NC203: "next",
				NC200: 'done',
			},
		},
	],
	axisCorp: [
		{
			fields: [
				{
					name: 'corporateId',
					placeholder: 'Corporate ID',
					rules: {
						required: true,
					},
				},
				{
					name: 'userId',
					placeholder: 'User ID',
					rules: {
						required: true,
					},
				},
				{
					name: 'password',
					type: 'password',
					placeholder: 'Password',
					rules: {
						required: true,
					},
				},
			],
			api: `${ENDPOINT_BANK}/acSubmitDetails`,
		},
		{
			fields: [
				{
					name: 'otp',
					placeholder: 'OTP',
					rules: {
						required: true,
					},
				},
			],
			api: `${ENDPOINT_BANK}/acSubmitOtp`,
		},
		{
			fields: [
				{
					name: 'accountslist',
					placeholder: 'Account Select',
					rules: {
						required: true,
					},
				},
			],
			api: `${ENDPOINT_BANK}/acSubmitAccount`,
		},
	],

	hdfc: [
		{
			fields: [
				{
					name: 'userId',
					placeholder: 'User ID',
					rules: {
						required: true,
					},
				},
				{
					name: 'password',
					type: 'password',
					placeholder: 'Password',
					rules: {
						required: true,
					},
				},
				{
					name: 'otpMode',
					type: 'select',
					placeholder: 'OTP Mode',
					options: [
						{ name: 'Email', value: 'Email' },
						{ name: 'Mobile', value: 'Mobile' },
					],
					rules: {
						required: true,
					},
				},
			],
			status: {
				NC500: 'error',
				NC202: 'next',
				NC302: 'error',
				NC200: 'next',
			},
			api: `${ENDPOINT_BANK}/hsSubmitdetails`,
		},
		{
			type: 'otp',
			fields: [
				{
					name: 'otp',
					placeholder: 'OTP',
					rules: {
						required: true,
					},
				},
			],
			api: `${ENDPOINT_BANK}/hsSubmitOtp`,
			status: {
				NC500: 'error',
				NC302: 'error',
				NC200: 'accounts',
			},
		},
		{
			type: 'accountslist',
			fields: [
				{
					name: 'selectedAccount',
					rules: {
						required: true,
					},
				},
			],
			status: {
				NC500: 'error',
				NC200: 'captcha',
			},
			api: `${ENDPOINT_BANK}/hsSelectAccount`,
		},
		{
			fields: [
				{
					type: 'captcha',
					name: 'captcha',
					placeholder: 'Captcha',
					rules: {
						required: true,
					},
				},
			],
			status: {
				NC302: 'error',
				NC500: 'error',
				NC200: 'done',
			},
			api: `${ENDPOINT_BANK}/hsSubmitCaptcha`,
		},
	],
	icici: [
		{
			fields: [
				{
					name: 'userId',
					placeholder: 'User ID',
					rules: {
						required: true,
					},
				},
				{
					name: 'password',
					type: 'password',
					placeholder: 'Password',
					rules: {
						required: true,
					},
				},
			],
			status: {
				NC500: 'error',
				NC302: 'error',
				NC200: 'next',
			},
			api: `${ENDPOINT_BANK}/isSubmitDetails`,
		},
	],
	kotak: [
		{
			type: 'form',
			fields: [
				{
					name: 'userId',
					placeholder: 'User ID',
					rules: {
						required: true,
					},
				},
				{
					name: 'password',
					type: 'password',
					placeholder: 'Password',
					rules: {
						required: true,
					},
				},
			],
			api: `${ENDPOINT_BANK}/kcSubmitDetails`,
		},
		{
			type: 'otp',
			fields: [
				{
					name: 'otp',
					rules: {
						required: true,
					},
				},
			],
			api: `${ENDPOINT_BANK}/kcSubmitOtp`,
		},
	],
};

export default BANK_FLOW;
