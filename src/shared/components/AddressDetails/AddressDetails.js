/* active
Applicant Address and Guarantor Address Details section*/
import styled from 'styled-components';
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

const PREFIX_PERMANENT = 'permanent_';
const PREFIX_PRESENT = 'present_';

const AddressDetails = props => {
	const {
		hideHeader,
		preData = {},
		userType,
		jsonData,
		register,
		formState,
		match,
		setMatch,
		// disablePermenanet = false,
		isBusiness,
		// preDataFilled,
		preDataPresent,
		// keyChange,
		// presentAddressCheck,
		hidePresentAddress = false,
	} = props;
	// const presentAddress =
	// 	(preDataFilled &&
	// 		preDataFilled.filter(ele => ele.addressType === 'present')) ||
	// 	[];
	// const parmanentAddress =
	// 	(preDataFilled &&
	// 		preDataFilled.filter(ele => ele.addressType === 'permanent')) ||
	// 	[];
	const editLoanData = JSON.parse(sessionStorage.getItem('editLoan'));
	const isViewLoan = !editLoanData ? false : !editLoanData?.isEditLoan;

	const populateValue = field => {
		const fieldName = `${PREFIX_PERMANENT}${field.name}`;
		// if (!userType && field.disabled) {
		// 	return preData[field.name] || '';
		// }
		let value = '';
		if (formState?.values?.[fieldName] !== undefined) {
			value = formState?.values?.[fieldName];
		} else if (preData[field.name] || field.value) {
			value = preData[field.name] || field.value || '';
		}
		// console.log(`returning-${fieldName}-`, { value, formState, field });
		return value;
		// return (
		// 	(parmanentAddress &&
		// 		parmanentAddress.length &&
		// 		parmanentAddress[0][field.name]) ||
		// 	field.value ||
		// 	''
		// );
	};

	const populatePresentValue = (field, match) => {
		const fieldName = `${PREFIX_PRESENT}${field.name}`;
		let value = '';
		if (formState?.values?.[fieldName] !== undefined) {
			value = formState?.values?.[fieldName];
		} else if (preDataPresent[field.name] || field.value) {
			value = preDataPresent[field.name] || field.value || '';
		}
		// console.log(`returning-${fieldName}-`, value);
		return value;
		// return (
		// 	(presentAddress &&
		// 		presentAddress.length &&
		// 		presentAddress[0][field.name]) ||
		// 	field.value ||
		// 	''
		// );
	};

	useEffect(() => {
		if (sessionStorage.getItem(`match${userType}`) === 'true') setMatch(true);
		if (sessionStorage.getItem(`match${userType}`) === 'false') setMatch(false);
		// eslint-disable-next-line
	}, []);

	// useEffect(() => {
	// 	setRerender(!rerender);
	// 	// eslint-disable-next-line
	// }, [preData]);

	// console.log('AddressDetails-allstates-', {
	// 	formState,
	// 	preData,
	// 	preDataPresent,
	// });

	// form.address;

	let prefixLabel = 'Help us with your ';
	if (userType && userType !== 'applicant') {
		prefixLabel = userType;
	}
	if (isViewLoan) {
		prefixLabel = '';
	}

	return (
		<>
			{hideHeader ? null : (
				<H>
					{prefixLabel}
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
							const fieldName = `${PREFIX_PERMANENT}${field.name}`;
							return (
								field.visibility && (
									<FieldWrap key={fieldName}>
										{register({
											...field,
											name: fieldName,
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
											visibility: 'visible',
										})}
										{(formState?.submit?.isSubmited ||
											formState?.touched?.[fieldName]) &&
											formState?.error?.[fieldName] && (
												<ErrorMessage>
													{formState?.error?.[fieldName]}
												</ErrorMessage>
											)}
									</FieldWrap>
								)
							);
						})}
				</Colom>
				{!isBusiness && !hidePresentAddress && (
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
								if (match) {
									customFields.disabled = true;
								}
								const fieldName = `${PREFIX_PRESENT}${field.name}`;
								return (
									field.visibility && (
										<FieldWrap key={fieldName}>
											{register({
												...field,
												name: fieldName,
												value: match
													? formState?.values?.[`permanent_${field.name}`]
													: populatePresentValue(field, match),
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
												visibility: 'visible',
											})}
											{(formState?.submit?.isSubmited ||
												formState?.touched?.[fieldName]) &&
												formState?.error?.[fieldName] && (
													<ErrorMessage>
														{formState?.error?.[fieldName]}
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
};

export default AddressDetails;
