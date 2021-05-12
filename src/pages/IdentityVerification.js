import styled from 'styled-components';
import Input from '../shared/components/Input/index';

const Colom1 = styled.div`
	flex: 1;
	background: ${({ theme }) => theme.themeColor1};
	padding: 50px;
`;

const Colom2 = styled.div`
	width: 40%;
	background: ${({ theme }) => theme.themeColor1};
`;

const Img = styled.img`
	width: 100%;
	height: 100%;
	object-fit: cover;
	object-position: center;
`;

const Heading = styled.h1`
	font-size: 1.5rem;
	color: black;
	padding-bottom: 5rem;
`;

export default function IdentityVerification({ loanDetails, pageName }) {
	return (
		loanDetails && (
			<>
				<Colom1>
					<Heading>
						Help us with your <span style={{ color: 'blue' }}>{pageName}</span>
					</Heading>
					<section style={{ display: 'flex', flexDirection: 'column', width: '50%', textAlign: 'center' }}>
						<Input placeholder='Enter Mobile Number' />
						<span style={{ margin: '1rem' }}>OR</span>
						<Input placeholder='Enter Customer ID' />
					</section>
				</Colom1>
				<Colom2>
					<Img src={loanDetails.imageUrl} alt={'Loan Caption'} />
				</Colom2>
			</>
		)
	);
}
