/* Loan details section */

import { Fragment, useContext } from 'react';
import styled from 'styled-components';
import { func, object, oneOfType, string, array } from 'prop-types';

import { UserContext } from '../../../reducer/userReducer';
import useFetch from '../../../hooks/useFetch';
import Button from '../../../components/Button';
import {
	NC_STATUS_CODE,
	SEARCH_BANK_BRANCH_LIST,
	SEARCH_LOAN_ASSET,
} from '../../../_config/app.config';

const H = styled.h1`
	min-height: 1.5em;
	font-size: 1.5em;
	font-weight: 500;
	span {
		color: blue;
	}
`;

const Field = styled.div`
	width: ${({ size }) => (size ? size : '45%')};
	margin: 10px 0;
	@media (max-width: 700px) {
		min-width: 86%;
	}
`;

const FieldWrapper = styled.div`
	width: 100%;
	display: flex;
	align-items: center;
	@media (max-width: 700px) {
		display: block;
	}
`;

const FormWrap = styled.div`
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: 10%;
	margin: 20px 0;
`;

const Colom = styled.div`
  display: flex;
  /* flex-basis: ${({ size }) => (size ? size : '45%')}; */
  flex-direction: column;
  /* align-items: center; */
  width: 100%;
  flex-wrap: wrap;
`;

const ErrorMessage = styled.div`
	color: red;
	text-align: center;
	font-size: 14px;
	font-weight: 500;
	width: ${({ size }) => (size ? size : '60%')};
`;

// const Currency = styled.div`
// 	width: auto;
// 	padding: 0 10px 0 10px;
// 	font-size: 13px;
// 	text-align: center;
// 	font-weight: 500;
// `;

const Or = styled.span`
	text-align: center;
	width: 60%;
`;
const UploadButtonSpace = styled.div`
	padding-left: 60px;
`;

LoanDetails.propTypes = {
	userType: string,
	jsonData: oneOfType([array, object]),
	label: string.isRequired,
	register: func,
	formState: object,
	loanType: string,
	size: string,
	buttonAction: func,
	uploadedDocs: object,
};

export default function LoanDetails({
	jsonData,
	register,
	formState,
	userType,
	loanType,
	label,
	size,
	buttonAction = () => {},
	uploadedDocs = {},
	preData,
}) {
	const {
		state: { bankId, userToken },
	} = useContext(UserContext);

	const { newRequest } = useFetch();

	const editLoanData = JSON.parse(sessionStorage.getItem('editLoan'));
	const isViewLoan = !editLoanData?.isEditLoan;

	const getBranchOptions = async () => {
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

	const getBrandsOnSearch = async data => {
		const opitionalDataReq = await newRequest(
			SEARCH_LOAN_ASSET,
			{ method: 'POST', data: { ...data, type: loanType } },
			{
				Authorization: `Bearer ${userToken}`,
			}
		);

		const opitionalDataRes = opitionalDataReq.data;
		if (opitionalDataRes.message) {
			return opitionalDataRes.data;
		}
		return [];
	};

	const onUploadAgreementAction = name => {
		buttonAction(name);
	};

	const populateValue = field => {
		if (formState?.values?.[field.name] !== undefined) {
			return formState?.values?.[field.name];
		}

		return (
			(preData && preData[field.name]) || formState?.values?.[field.name] || ''
		);
	};

	const fieldTemplate = field => {
		const customFields = {};
		if (isViewLoan) {
			customFields.readonly = true;
			customFields.disabled = true;
		}
		return (
			<Fragment key={field.name}>
				<FieldWrapper>
					<Field size={size}>
						{register({
							...field,
							// value: formState?.values?.[field.name],
							value: populateValue(field),
							rules: {
								...field.rules,
								...(field.uploadButton && {}),
							},
							placeholder:
								field.type === 'search'
									? preData?.branchIdName || field.placeholder
									: field.placeholder,
							...(field.type === 'search'
								? {
										searchable: true,
										...(field.fetchOnInit && {
											fetchOptionsFunc: getBranchOptions,
										}),
										...(field.fetchOnSearch && {
											searchOptionCallback: getBrandsOnSearch,
										}),
								  }
								: {}),
							...customFields,
						})}
						{/* rules:{subAction: !uploadedDocs[field.name]?.length}*/}
					</Field>
					{/* {<Currency>{field.inrupees ? '(In  ₹ )' : ''}</Currency>} */}
					<UploadButtonSpace>
						{field.uploadButton && (
							<Button
								name={field.uploadButton}
								roundCorner={true}
								width='150px'
								style={{ marginLeft: '300px' }}
								onClick={() => onUploadAgreementAction(field.name)}
								disabled={field.disabled}
							/>
						)}
					</UploadButtonSpace>
				</FieldWrapper>
				{(formState?.submit?.isSubmited || formState?.touched?.[field.name]) &&
					formState?.error?.[field.name] && (
						<ErrorMessage size={size}>
							{formState?.error?.[field.name]}
						</ErrorMessage>
					)}
				{field.forType &&
					field.forType[(formState?.values?.[field.name])] &&
					field.forType[(formState?.values?.[field.name])].map(f =>
						makeFields(f)
					)}
			</Fragment>
		);
	};

	const makeFields = fields => {
		if (Array.isArray(fields)) {
			let renderArray = [];

			const oneOfHasValue = fields.find(f => {
				if (formState?.values?.[f.name]) {
					return {
						name: f.name,
						value: formState?.values?.[f.name],
					};
				}
				return false;
			});
			for (let i = 0; i < fields.length; i++) {
				if (i) renderArray.push(<Or key={`or_key_${i}`}>Or</Or>);
				renderArray.push(
					fieldTemplate({
						...fields[i],
						rules: {
							...fields[i].rules,
							required: !oneOfHasValue,
						},
						disabled: oneOfHasValue && fields[i].name !== oneOfHasValue?.name,
					})
				);
			}
			return renderArray;
		}

		return fieldTemplate(fields);
	};

	return (
		<>
			<H>
				{label?.trim() || !isViewLoan ? 'Help us with ' : ''}{' '}
				<span>{label}</span>
			</H>
			<FormWrap>
				<Colom>
					{jsonData &&
						jsonData.map(
							field =>
								field.visibility && (
									<Fragment key={field.name}>{fieldTemplate(field)}</Fragment>
								)
						)}
				</Colom>
			</FormWrap>
		</>
	);
}
