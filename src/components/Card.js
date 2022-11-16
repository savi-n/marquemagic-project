/* Landing page of nc-onboarding journey contains different loan cards.
This card is designed and defined here */

import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import imgSelectProduct from 'assets/images/bg/Landing_page_down-indication-element.png';
import { resetAllApplicationState } from 'utils/localStore';
import { FlowContext } from 'reducer/flowReducer';
import { FormContext } from 'reducer/formReducer';
import { useContext } from 'react';
import { UserContext } from 'reducer/userReducer';
import { LoanFormContext } from 'reducer/loanFormDataReducer';

const Wrapper = styled.div`

  width: 25%;

  border-radius: 10px;
  /* background: ${({ theme }) => theme.themeColor1}; */
  overflow: hidden;
  /* box-shadow: 0px 2px 5px 1px rgb(0 0 0 / 20%); */
	/* #0b5cff */
	/* rgb(11, 92, 255) */
	/* rgb(11, 92, 255, 0.15) */
	/* box-shadow: rgb(11, 92, 255, 0.15) 0px 10px 36px 0px, rgba(0, 0, 0, 0.06) 0px 0px 0px 1px; */
	/* box-shadow: rgb(11, 92, 255, 0.15) 0px 48px 100px 0px; */
	box-shadow: rgba(11, 92, 255, 0.2) 0px 7px 29px 0px;
  margin: 0 calc(12% / 6);
	@media (max-width: 700px) {
margin: 1rem 0;
width: 100%;
	}
`;

const ImgDiv = styled.div`
	width: 100%;
	height: 250px;
`;

const Img = styled.img`
	width: 100%;
	height: 100%;
	object-fit: cover;
`;

const ImgSelectProduct = styled.img`
	height: 35px;
	margin: 0 auto;
`;

const ButtonBox = styled.div`
  /* background: ${({ theme }) => theme.themeColor1}; */
  text-align: center;
  padding: 40px;
  padding: 20px;
`;

const Link = styled.a`
	text-decoration: none;
	color: #fff;
	background: ${({ theme }) => theme.main_theme_color};
	padding: 5px 40px;
	display: inline-block;
	border-radius: 20px;
	cursor: pointer;
`;

const Description = styled.div`
	color: ${({ theme }) => theme.themeColor2};
	padding: 10px 0;
`;

const ProductName = styled.div`
	text-align: center;
	padding-top: 50px;
	color: #4e4e4e;
	font-weight: bold;
`;

export default function Card({ product, add, setAddedProduct, setAddProduct }) {
	const {
		state: { basePageUrl },
		actions: { clearFlowDetails },
	} = useContext(FlowContext);
	const {
		actions: { clearFormData },
	} = useContext(FormContext);
	const {
		actions: { resetUserDetails },
	} = useContext(UserContext);

	const {
		actions: { removeAllLoanDocuments },
	} = useContext(LoanFormContext);

	const history = useHistory();

	// const { url } = useRouteMatch();

	const handleClick = (e, id) => {
		e.preventDefault();
		history.push({
			pathname: `/applyloan/product/${btoa(id)}`,
			data: id,
		});
	};

	return (
		<Wrapper>
			<ImgDiv>
				<Img src={product.url} alt={product.name} />
				<ImgSelectProduct src={imgSelectProduct} alt='product' />
			</ImgDiv>
			<ProductName>{product.name}</ProductName>
			<ButtonBox>
				<Link
					href={!add && `/applyloan/product/${btoa(product.id)}`}
					onClick={e => {
						resetAllApplicationState();
						clearFlowDetails(basePageUrl);
						clearFormData();
						resetUserDetails();
						removeAllLoanDocuments();
						!add ? handleClick(e, product.id) : setAddedProduct(product);
						setAddProduct && setAddProduct(false);
					}}
				>
					{add ? 'Add Loan' : 'Get Loan'}
				</Link>
				<Description>{product.description}</Description>
			</ButtonBox>
		</Wrapper>
	);
}
