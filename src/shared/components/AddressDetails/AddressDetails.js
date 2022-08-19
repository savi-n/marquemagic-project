/* active
Applicant Address and Guarantor Address Details section*/
import styled from 'styled-components';
import { array, bool, func, object, oneOfType, string } from 'prop-types';

import CheckBox from '../Checkbox/CheckBox';
import { useEffect } from 'react';

const H = styled.h1`
	font-size: 1.5em;
	font-weight: 500;
	span {
		color: ${({ theme }) => theme.main_theme_color};
	}
`;

const FieldWrap = styled.div`
	width: 100%;
	margin: 10px 0;
`;

const FormWrap = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 10%;
	justify-content: space-between;
	margin: 20px 0;
`;

const Colom = styled.div`
	display: flex;
	flex-basis: 45%;
	align-items: center;
	flex-wrap: wrap;
	@media (max-width: 700px) {
		flex-basis: 100%;
	}
`;

const Caption = styled.h3`
	width: 100%;
	font-weight: 500;
	display: flex;
	justify-content: space-between;
`;

const ErrorMessage = styled.div`
	color: red;
	text-align: center;
	font-size: 14px;
	font-weight: 500;
`;

AddressDetails.propTypes = {
	userType: string,
	jsonData: oneOfType([array, object]),
	register: func,
	formState: object,
	match: bool,
	setMatch: func.isRequired,
};

export default function AddressDetails({
	hideHeader,
	preData = {},
	userType,
	jsonData,
	register,
	formState,
	match,
	setMatch,
	disablePermenanet = false,
	isBusiness,
	preDataFilled,
	keyChange,
	presentAddressCheck,
}) {
	const presentAddress =
		(preDataFilled &&
			preDataFilled.filter(ele => ele.addressType === 'present')) ||
		[];
	const editLoanData = JSON.parse(sessionStorage.getItem('editLoan'));
	const isViewLoan = !editLoanData?.isEditLoan;

	const populateValue = field => {
		// if (!userType && field.disabled) {
		//   return preData[field.name] || "";
		// }

		if (formState?.values?.[`permanent_${field.name}`]) {
			return formState?.values?.[`permanent_${field.name}`];
		}

		return preData[field.name] || field.value || '';
	};

	const populatePresentValue = (field, match) => {
		if (formState?.values?.[`present_${field.name}`])
			return formState?.values?.[`present_${field.name}`];

		return (
			(presentAddress &&
				presentAddress.length &&
				presentAddress[0][field.name]) ||
			field.value ||
			''
		);
	};

	useEffect(() => {
		if (sessionStorage.getItem(`match${userType}`) === 'true') setMatch(true);
		if (sessionStorage.getItem(`match${userType}`) === 'false') setMatch(false);
		// eslint-disable-next-line
	}, []);

	// form.address;

	return (
		<>
			{hideHeader ? null : (
				<H>
					{userType || isViewLoan ? '' : 'Help us with your '}
					<span>Address Details</span>
				</H>
			)}
			<FormWrap>
				<Colom>
					{!isBusiness && <Caption>Permanent Address</Caption>}
					{jsonData &&
						jsonData.map(field => {
							const customFields = {};
							if (isViewLoan) {
								customFields.readonly = true;
								customFields.disabled = true;
							}
							return (
								field.visibility && (
									<FieldWrap key={`permanent_${field.name}`}>
										{register({
											...field,
											name: `permanent_${field.name}`,
											value: populateValue(field),
											disabled: false,
											...(field.valueForFields
												? {
														valueForFields: field.valueForFields.map(f => [
															`permanent_${f[0]}`,
															f[1],
														]),
												  }
												: {}),
											...customFields,
										})}
										{(formState?.submit?.isSubmited ||
											formState?.touched?.[`permanent_${field.name}`]) &&
											formState?.error?.[`permanent_${field.name}`] && (
												<ErrorMessage>
													{formState?.error?.[`permanent_${field.name}`]}
												</ErrorMessage>
											)}
									</FieldWrap>
								)
							);
						})}
				</Colom>
				{!isBusiness && (
					<Colom>
						<Caption>
							Present Address{' '}
							<CheckBox
								checked={match}
								onChange={() => {
									sessionStorage.setItem(
										`match${userType}`,
										!match === true ? 'true' : 'false'
									);
									setMatch(!match);
								}}
								disabled={isViewLoan}
								bg='blue'
								name='Same as Permanent Address'
							/>
						</Caption>
						{jsonData &&
							jsonData.map(field => {
								const customFields = {};
								if (isViewLoan) {
									customFields.readonly = true;
									customFields.disabled = true;
								}
								return (
									field.visibility && (
										<FieldWrap key={`present_${field.name}`}>
											{register({
												...field,
												name: `present_${field.name}`,
												value: match
													? formState?.values?.[`permanent_${field.name}`]
													: populatePresentValue(field, match),
												// value: match
												// 	? formState?.values?.[`permanent_${field.name}`]
												// 	: formState?.values?.[`present_${field.name}`],
												noActionTrigger: match,
												...(field.valueForFields
													? {
															valueForFields: field.valueForFields.map(f => [
																`present_${f[0]}`,
																f[1],
															]),
													  }
													: {}),
												...customFields,
											})}
											{(formState?.submit?.isSubmited ||
												formState?.touched?.[`present_${field.name}`]) &&
												formState?.error?.[`present_${field.name}`] && (
													<ErrorMessage>
														{formState?.error?.[`present_${field.name}`]}
													</ErrorMessage>
												)}
										</FieldWrap>
									)
								);
							})}
					</Colom>
				)}
			</FormWrap>
		</>
	);
}
