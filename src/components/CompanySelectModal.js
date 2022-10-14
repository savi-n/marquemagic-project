/* A file contains modal that displays information of the company/companies against the uploaded PAN.
  User can select the company and proceed to next page*/

import { useState } from 'react';
import styled from 'styled-components';
import Modal from './Modal';
import Button from './Button';
import { useToasts } from 'components/Toast/ToastProvider';
import imgClose from 'assets/icons/close_icon_grey-06.svg';
const Wrapper = styled.div`
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
`;
const ImgClose = styled.img`
	height: 25px;
	cursor: pointer;
	margin-left: auto;
	margin-right: ${({ isPreTag }) => (isPreTag ? '60px' : '10px')};
`;
const PanConfirm = styled.div`
	margin-top: 100px;
	margin-bottom: 10px;
	text-align: center;
	font-size: 24px;
	font-weight: 600px;
	@media (max-width: 700px) {
		font-size: 22px;
		font-weight: 500;
		margin-top: 50px;
	}
`;

const Company = styled.div`
	margin: 10px;
	width: 84%;
	height: 100px;
	text-align: center;
	box-shadow: rgb(11 92 255 / 16%) 5px 2px 5px 1px;
	padding: 28px;
	cursor: pointer;
	border-radius: 10px;
	@media (max-width: 700px) {
		width: 80%;
		height: auto;
	}
`;

// const FieldWrapper = styled.div`
// 	width: 80%;
// `;

export default function CompanySelectModal({
	companyList,
	show,
	onClose,
	onCompanySelect,
	companyNameSearch,
	companyName,
	formState,
	panExtractionData = {},
	searchingCompanyName = false,
	proceedToNextSection,
}) {
	//const { register } = useForm();
	const { addToast } = useToasts();
	const [company, setCompany] = useState(panExtractionData?.companyName);
	const [isCompanyApi, setIsCompanyApi] = useState(false);
	// console.log('company information', companyList);
	return (
		<Modal show={show} onClose={onClose} width='50%'>
			<ImgClose onClick={onClose} src={imgClose} alt='close' />
			<PanConfirm>
				Confirm the Entity for {panExtractionData?.panNumber}{' '}
			</PanConfirm>
			<Wrapper>
				{companyList.length ? (
					companyList.map(company => (
						<Company
							key={company.id}
							onClick={() =>
								onCompanySelect(company.CORPORATE_IDENTIFICATION_NUMBER)
							}
						>
							<div>{company.COMPANY_NAME}</div>
							<div>CIN : {company.CORPORATE_IDENTIFICATION_NUMBER}</div>
						</Company>
					))
				) : (
					<section
						className='w-full flex flex-col items-center'
						style={{ width: '84%' }}
					>
						<section className='py-10'>
							No data found for the given company
						</section>
						<input
							className='p-2 border w-full rounded-lg'
							placeholder='Company Name'
							defaultValue={panExtractionData?.companyName}
							onChange={e => setCompany(e.target.value)}
						/>
						<section
							className={`flex ${
								isCompanyApi ? '' : 'flex-col'
							} py-8 items-center`}
						>
							<Button
								onClick={() => {
									companyNameSearch(company);
									setIsCompanyApi(true);
									addToast({
										message:
											'If Company data is not fetched, Click on Proceed to complete the application',
										type: 'warning',
									});
								}}
								isLoader={searchingCompanyName}
								name={searchingCompanyName ? 'Please wait...' : 'Search'}
								disabled={
									searchingCompanyName ||
									!company ||
									!panExtractionData?.companyName
								}
								fill
							/>
							{isCompanyApi && (
								<Button
									customStyle={{ marginLeft: '2px' }}
									name='Proceed'
									fill
									onClick={proceedToNextSection}
								/>
							)}
						</section>
					</section>
				)}
			</Wrapper>
		</Modal>
	);
}
