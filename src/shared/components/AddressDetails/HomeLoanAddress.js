/* Home Loan Address details section */

import styled from 'styled-components';
import { func, object, oneOfType, string, array } from 'prop-types';
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
	margin: 20px 0;
	width: 60%;
	@media (max-width: 700px) {
		width: 100%;
	}
`;

const Colom = styled.div`
	display: flex;
	flex-basis: ${({ size }) => (size ? size : '45%')};
	align-items: center;
	flex-wrap: wrap;
`;

const ErrorMessage = styled.div`
	color: red;
	text-align: center;
	font-size: 14px;
	font-weight: 500;
`;

HomeLoanAddressDetails.propTypes = {
	jsonData: oneOfType([array, object]),
	register: func,
	formState: object,
	size: string,
};

export default function HomeLoanAddressDetails({
	jsonData,
	register,
	formState,
	size,
	preData,
	isViewLoan,
}) {
	const populateValue = field => {
		if (formState?.values?.[field.name] !== undefined) {
			return formState?.values?.[field.name];
		}
		return (
			(preData && preData[field.name]) || formState?.values?.[field.name] || ''
		);
	};

	return (
		<>
			<H>Address of the Property(with locality)</H>
			<FormWrap>
				<Colom size={size}>
					{jsonData &&
						jsonData.map(
							field =>
								field.visibility && (
									<FieldWrap key={field.name}>
										{register({
											...field,
											name: field.name,
											// value: formState?.values?.[field.name]
											value: populateValue(field),
											visibility: 'visible',
											disabled: isViewLoan ? true : false,
											readonly: isViewLoan ? true : false,
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
				</Colom>
			</FormWrap>
		</>
	);
}
