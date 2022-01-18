// Active Help us with your PAGE
import { useEffect, useContext } from 'react';
import styled from 'styled-components';
import { array, func, object, oneOfType, string } from 'prop-types';
import useFetch from 'hooks/useFetch';
import { NC_STATUS_CODE, SEARCH_BANK_BRANCH_LIST } from '_config/app.config';
import { UserContext } from 'reducer/userReducer';
import moment from 'moment';

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
	const {
		state: { bankId, userToken },
	} = useContext(UserContext);
	const { newRequest } = useFetch();
	const populateValue = field => {
		if (!userType && field.disabled) {
			return preData?.[field.name] || '';
		}

		if (formState?.values?.[field.name] !== undefined) {
			return formState?.values?.[field.name];
		}
		return preData?.[field.name] || field.value || '';
		// companyDetail
		// 	? companyDetail?.[field.name]
		// 	:
	};
	const getHomeBranchOption = async () => {
		const opitionalDataReq = await newRequest(
			SEARCH_BANK_BRANCH_LIST({ bankId }),
			{},
			{
				Authorization: `Bearer ${userToken}`,
			}
		);

		const opitionalDataRes = opitionalDataReq.data;
		if (opitionalDataRes.statusCode === NC_STATUS_CODE.NC200) {
			return opitionalDataRes.branchList
				.map(branch => ({
					name: branch.branch,
					value: String(branch.id),
				}))
				.sort((a, b) => a.name.localeCompare(b.name));
		}
	};
	useEffect(() => {
		jsonData.map(field => {
			if (field.name === 'dob') {
				field.placeholder = 'Date of Birth';
			}
			return null;
		});

		if (id === 'business-details') {
			let isMobilePresent,
				isEmailPresent = false;
			jsonData.map(ele => {
				if (ele.name === 'mobileNo') {
					isMobilePresent = true;
				}
				if (ele.name === 'Email') {
					isEmailPresent = true;
				}
				return null;
			});
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
			!isMobilePresent && jsonData.push(mo);
			!isEmailPresent && jsonData.push(email);
		}
	}, []);

	useEffect(() => {
		if (pageName === 'Business Details') {
			let isMobilePresent,
				isEmailPresent = false;
			jsonData.map(ele => {
				if (ele.name === 'mobileNo') {
					isMobilePresent = true;
				}
				if (ele.name === 'Email') {
					isEmailPresent = true;
				}
				return null;
			});
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
			!isMobilePresent && jsonData.push(mo);
			!isEmailPresent && jsonData.push(email);
		}
	}, [pageName]);
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
					  jsonData.map(field => {
							// console.log('field-', field);
							const value = populateValue(field);
							const customFields = {};
							if (pageName === 'Bank Details') {
								const startDateValue = populateValue(
									jsonData.filter(f => f.name === 'StartDate')[0]
								);
								// console.log('startDateValue-', startDateValue);
								if (field.name === 'EndDate' && startDateValue) {
									customFields.min = moment(startDateValue).format(
										'YYYY-MM-DD'
									);
								}
								if (field.name === 'StartDate' || field.name === 'EndDate') {
									customFields.max = moment().format('YYYY-MM-DD');
								}
							}
							return (
								field.visibility && (
									<FieldWrap key={field.name}>
										{register({
											...field,
											value,
											...(preData?.[field.name] &&
												field?.preDataDisable && { disabled: true }),
											...(userType ? { disabled: false } : {}),
											max: field.type === 'date' && '9999-12-31',
											placeholder:
												field.type === 'banklist'
													? preData?.[`${field.name}`]?.name ||
													  field.placeholder
													: field.type === 'search'
													? preData?.branchIdName || field.placeholder
													: field.placeholder,
											...(field.type === 'search'
												? {
														searchable: true,
														...(field.fetchOnInit && {
															fetchOptionsFunc: getHomeBranchOption,
														}),
												  }
												: {}),
											...customFields,
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
							);
					  })}
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
