import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import Layout from '../Layout';

const Colom1 = styled.div`
	flex: 1;
	background: ${({ theme }) => theme.themeColor1};
`;

const Colom2 = styled.div`
	width: 100%;
	background: ${({ theme }) => theme.themeColor1};
`;

const Img = styled.img`
	width: 100%;
	height: calc(100vh - 80px);
	object-fit: cover;
	object-position: center;
`;

const Li = styled.li`
	margin: 20px 0;
	font-size: 13px;
	color: rgba(0, 0, 0, 0.8);
	position: relative;

	&::before {
		content: '';
		position: absolute;
		background: red;
		font-weight: bold;
		width: 5px;
		height: 5px;
		border-radius: 5px;
		left: -20px;
		top: 5px;
	}

	a {
		color: blue;
	}
`;

const H = styled.h3`
	span {
		color: blue;
	}
`;

export default function LoanDetails({ loanDetails }) {
	return (
		loanDetails && (
			<>
				<Layout>
					<section className='w-8/12'>
						<H dangerouslySetInnerHTML={{ __html: loanDetails.head }}></H>
						<div>
							<ul>
								{loanDetails.li.map(l => (
									<Li dangerouslySetInnerHTML={{ __html: l }} key={uuidv4()}></Li>
								))}
							</ul>
						</div>
					</section>
				</Layout>
				<section className='w-1/4 absolute right-0'>
					<img
						style={{ height: 'calc(100vh - 80px)' }}
						className='w-full'
						src={loanDetails.imageUrl}
						alt={'Loan Caption'}
					/>
				</section>
			</>
		)
	);
}
