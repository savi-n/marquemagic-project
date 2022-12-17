/* Salary Details component which is a part of Personal Details page */

import styled from 'styled-components';
import { func, object, oneOfType, string, array } from 'prop-types';
/* eslint eqeqeq: 0 */
/* The above line is to suppress warning that pop up in terminal due to eslint configs */
const H = styled.h1`
	font-size: 1.5em;
	font-weight: 500;
	span {
		color: ${({ theme }) => theme.main_theme_color};
	}
`;

const FieldWrap = styled.div`
	width: ${({ size }) => (size ? size : '45%')};
	margin: 10px 0;
	@media (max-width: 700px) {
		width: 85%;
	}
`;

const FormWrap = styled.div`
	display: flex;
	justify-content: center;
	flex-direction: column;
	gap: 10%;
	margin: 20px 0;
`;

const ErrorMessage = styled.div`
	color: red;
	text-align: center;
	font-size: 14px;
	font-weight: 500;
`;

export default function SalaryDetails(props) {
	const {
		jsonData,
		jsonLable,
		register,
		userType,
		formState,
		size,
		incomeType,
		preData,
		headingNameStyle,
	} = props;
	const editLoanData = JSON.parse(sessionStorage.getItem('editLoan'));
	const isViewLoan = !editLoanData ? false : !editLoanData?.isEditLoan;

	const populateValue = field => {
		if (formState?.values?.[field.name] !== undefined) {
			return formState?.values?.[field.name];
		}

		return (
			(preData && preData[field.name]) || formState?.values?.[field.name] || ''
		);
	};

	// console.log('SalaryDetails-allstates-', { props });

	return (
		<>
			<H>
				{userType || isViewLoan ? '' : 'Help us with '}
				<span style={headingNameStyle}>{jsonLable || 'Income Details'}</span>
			</H>
			<FormWrap>
				{jsonData &&
					jsonData.map(field => {
						const customFieldProps = {};
						if (isViewLoan) {
							customFieldProps.readonly = true;
							customFieldProps.disabled = true;
						}
						return (
							field.visibility &&
							(incomeType == field.forType || !incomeType || !field.forType ? (
								<FieldWrap key={field.name} size={size}>
									{register({
										...field,
										// value: formState?.values?.[field.name],
										value: populateValue(field),
										...customFieldProps,
										visibility: 'visible',
									})}
									{(formState?.submit?.isSubmited ||
										formState?.touched?.[field.name]) &&
										formState?.error?.[field.name] && (
											<ErrorMessage>
												{formState?.error?.[field.name]}
											</ErrorMessage>
										)}
								</FieldWrap>
							) : null)
						);
					})}
			</FormWrap>
		</>
	);
}

SalaryDetails.propTypes = {
	preData: object,
	register: func.isRequired,
	jsonData: oneOfType([array, object]),
	userType: string,
	formState: object,
	size: string,
};
