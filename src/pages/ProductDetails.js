import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';

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

export default function ProductDetails({ loanDetails }) {
	return (
		loanDetails && (
			<>
				<Colom1>
					<H dangerouslySetInnerHTML={{ __html: loanDetails.head }}></H>
					<div>
						<ul>
							{loanDetails.li.map(l => (
								<Li dangerouslySetInnerHTML={{ __html: l }} key={uuidv4()}></Li>
							))}
						</ul>
					</div>
				</Colom1>
				<Colom2>
					<Img src={loanDetails.imageUrl} alt={'Loan Caption'} />
				</Colom2>
			</>
		)
	);
}
