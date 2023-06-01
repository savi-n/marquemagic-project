/* Once the application is submitted, user receives application ref Id on screen .
This screen/page is defined here */

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import img1 from 'assets/images/v3.png';
import img2 from 'assets/images/v4.png';
import { scrollToTopRootElement } from 'utils/helper';
import { APPLICATION_SUBMITTED_SECTION_ID } from '../const';
import { TO_APPLICATION_STAGE_URL } from '_config/app.config';
import axios from 'axios';

const Wrapper = styled.div`
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

const ApplicationSubmitted = props => {
	const { app, application } = useSelector(state => state);
	const { selectedProduct } = app;
	const { loanRefId, loanId } = application;
	const [count] = useState(0);
	const d = data[count];
	const isDocumentUploadMandatory = !!selectedProduct?.product_details
		?.document_mandatory;

	useEffect(() => {
		scrollToTopRootElement();
		const moveToApplicationStage = () => {
			try {
				const applicationStageReqBody = {
					loan_id: loanId,
					section_id: APPLICATION_SUBMITTED_SECTION_ID,
				};

				if (isDocumentUploadMandatory) {
					applicationStageReqBody.is_mandatory_documents_uploaded = true;
				}
				axios.post(`${TO_APPLICATION_STAGE_URL}`, applicationStageReqBody);
			} catch (e) {}
		};
		moveToApplicationStage();
		// eslint-disable-next-line
	}, []);

	return (
		<Wrapper>
			<CaptionImg bg={d.img} />
			<Caption>{d.caption}</Caption>
			<section>
				Application Reference Number:{' '}
				<span className='font-bold'> {loanRefId}</span>
			</section>
		</Wrapper>
	);
};

export default ApplicationSubmitted;
