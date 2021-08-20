import styled from 'styled-components';

import Modal from './Modal';

const Wrapper = styled.div`
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
`;

const Company = styled.div`
	margin: 10px;
	width: 44%;
	border: 1px solid black;
	padding: 10px;
	cursor: pointer;
	border-radius: 10px;
`;

export default function CompanySelectModal({ companyList, show, onClose, onCompanySelect }) {
	{
		console.log(companyList);
	}
	return (
		<Modal show={show} onClose={onClose} width='50%'>
			<Wrapper>
				{companyList.length ? (
					companyList.map(company => (
						<Company
							key={company.id}
							onClick={() => onCompanySelect(company.CORPORATE_IDENTIFICATION_NUMBER)}
						>
							<div>{company.COMPANY_NAME}</div>
							<div>CIN : {company.CORPORATE_IDENTIFICATION_NUMBER}</div>
						</Company>
					))
				) : (
					<section className='py-10'>No data found for the given company</section>
				)}
			</Wrapper>
		</Modal>
	);
}
