/* Once the application is submitted, user receives application ref Id on screen .
This screen/page is defined here */

import { useState, useContext, useEffect } from 'react';
import styled from 'styled-components';
import { func, object, oneOfType, string } from 'prop-types';

// import Button from 'components/Button';
// import GuageMeter from 'components/GuageMeter';
// import { FlowContext } from 'reducer/flowReducer';
import img1 from 'assets/images/v3.png';
import img2 from 'assets/images/v4.png';
import { CaseContext } from 'reducer/caseReducer';

const Colom1 = styled.div`
	flex: 1;
	padding: 50px;
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1100;
	flex-direction: column;
	@media (max-width: 700px) {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 100%;
		text-align: center;
		transform: translate(-50%, -50%);
	}
`;

const Colom2 = styled.div`
	width: 30%;
`;

const Caption = styled.h2`
	text-align: center;
	font-size: 1em;
	font-weight: 500;
	margin: 20px 0;
`;

const CaptionImg = styled.div`
	background: ${({ bg }) => (bg ? `url(${bg})` : 'transparent')};
	height: 150px;
	width: 70%;
	background-position: center;
	background-size: contain;
	background-repeat: no-repeat;
`;

const data = [
	{
		caption: `Your application has been forwarded to the branch, decision shall be communicated within 2-3 working days.`,
		guarantor: true,
		img: img1,
	},
	{
		caption: `Congratulations you are eligible for a loan of Rs... and the same is in-princippaly approved. Final Saction will be communicated with in one or two working days`,
		guarantor: true,
		img: img2,
	},
	{
		caption: `Sorry! You are not eligible for the requested loan as your Credit score is not satisfactory`,
		guarantor: false,
	},
];

ApplicationSubmitted.propTypes = {
	productDetails: object,
	onFlowChange: func.isRequired,
	map: oneOfType([string, object]),
	id: string,
};

export default function ApplicationSubmitted({
	productDetails,
	id,
	map,
	onFlowChange,
}) {
	useEffect(() => {
		const wt_lbl = sessionStorage.getItem('wt_lbl');
		const userDetails = sessionStorage.getItem('userDetails');
		sessionStorage.clear();
		sessionStorage.setItem('wt_lbl', wt_lbl);
		if (userDetails) sessionStorage.setItem('userDetails', userDetails);
	}, []);

	// const {
	// 	actions: { activateSubFlow },
	// } = useContext(FlowContext);

	const {
		state: { loan_ref_id },
	} = useContext(CaseContext);

	const [count] = useState(0);

	// const subFlowActivate = () => {
	// 	activateSubFlow(id);
	// 	onFlowChange(map.sub);
	// };

	// const {
	//   state: { userToken },
	// } = useContext(UserContext);

	const d = data[count];
	// since d is always set to 0.. other data elements are nt gonna be
	// used hence deleted <GuageMeter>
	return (
		<>
			<Colom1>
				{/* {!d.guarantor ? <GuageMeter /> : <CaptionImg bg={d.img} />} */}
				<CaptionImg bg={d.img} />
				<Caption>{d.caption}</Caption>
				<section>
					Application Reference Number:{' '}
					<span className='font-bold'> {loan_ref_id}</span>
				</section>

				{/* {d.guarantor && map.sub && (
          <>
            <Caption>Any Guarantor?</Caption>
            <BtnWrap>
              <Button name="Yes" onClick={subFlowActivate} />
              <Button name="No" onClick={() => setData(count + 1)} />
            </BtnWrap>
          </>
        )} */}
			</Colom1>
			<Colom2>
				{/* <Img
					src={productDetails.applicationSubmittedImage}
					alt='Loan Caption'
				/> */}
			</Colom2>
		</>
	);
}
