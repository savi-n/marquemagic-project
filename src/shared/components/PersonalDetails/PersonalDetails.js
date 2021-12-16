import { useEffect } from 'react';
import styled from 'styled-components';
import { array, func, object, oneOfType, string } from 'prop-types';

const H = styled.h1`
	font-size: 1.5em;
	font-weight: 500;
	span {
		color: ${({ theme }) => theme.main_theme_color};
	}
`;

const FieldWrap = styled.div`
	width: 45%;
	margin: 10px 0;
`;

const FormWrap = styled.div`
	display: flex;
	/* align-items: center; */
	flex-wrap: wrap;
	gap: 10%;
	margin: 20px 0;
	justify-content: space-between;
	/* flex-flow: wrap column; */
	/* max-height: 400px; */
`;

const ErrorMessage = styled.div`
	color: red;
	text-align: center;
	font-size: 14px;
	font-weight: 500;
`;

export default function PersonalDetails({
	preData = {},
	id,
	pageName,
	userType,
	jsonData,
	register,
	formState,
	companyDetail,
}) {
	const populateValue = field => {
		if (!userType && field.disabled) {
			return preData?.[field.name] || '';
		}

		if (formState?.values?.[field.name] !== undefined) {
			return formState?.values?.[field.name];
		}
		return companyDetail
			? companyDetail?.[field.name]
			: preData?.[field.name] || field.value || '';
	};
	useEffect(() => {
		jsonData.map(field => {
			if (field.name === 'dob') {
				field.placeholder = 'Date of Birth';
			}
		});
		if (id === 'business-details') {
			const mo = {
				name: 'mobileNo',
				options: [],
				rules: { required: true, length: 10 },
				placeholder: 'Mobile Number',
				mask: { NumberOnly: true, CharacterLimit: 10 },
				type: 'text',
				visibility: true,
			};
			const email = {
				name: 'Email',
				options: [],
				rules: { required: true, email: true },
				placeholder: 'Email',
				type: 'text',
				visibility: true,
			};
			jsonData.push(mo);
			jsonData.push(email);
		}
	}, []);

	return (
		<>
			<H>
				{userType || 'Help us with your'}{' '}
				<span>{pageName || 'Personal Details'}</span>
			</H>
			<FormWrap>
				{jsonData && id === 'business-details'
					? jsonData.map(
							field =>
								field.visibility && (
									<FieldWrap key={field.name}>
										{register({
											...field,
											value: populateValue(field),
											...(preData?.[field.name] &&
												field?.preDataDisable && { disabled: true }),
											...(userType ? { disabled: false } : {}),
											max: field.type === 'date' && '9999-12-31',
										})}
										{(formState?.submit?.isSubmited ||
											formState?.touched?.[field.name]) &&
											formState?.error?.[field.name] && (
												<ErrorMessage>
													{formState?.error?.[field.name]}
												</ErrorMessage>
											)}
									</FieldWrap>
								)
					  )
					: id !== 'business-details' &&
					  jsonData.map(
							field =>
								field.visibility && (
									<FieldWrap key={field.name}>
										{register({
											...field,
											value: populateValue(field),
											...(preData?.[field.name] &&
												field?.preDataDisable && { disabled: true }),
											...(userType ? { disabled: false } : {}),
											max: field.type === 'date' && '9999-12-31',
										})}
										{(formState?.submit?.isSubmited ||
											formState?.touched?.[field.name]) &&
											formState?.error?.[field.name] && (
												<ErrorMessage>
													{formState?.error?.[field.name]}
												</ErrorMessage>
											)}
									</FieldWrap>
								)
					  )}
			</FormWrap>
		</>
	);
}

PersonalDetails.propTypes = {
	preData: object,
	register: func.isRequired,
	jsonData: oneOfType([array, object]),
	userType: string,
	formState: object,
};
