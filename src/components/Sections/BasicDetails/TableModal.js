import styled from 'styled-components';
import Modal from 'components/Modal';
import * as UI from './ui';
import imgClose from 'assets/icons/close_icon_grey-06.svg';
import { useEffect } from 'react';

const Div = styled.div`
	padding: 20px;
	@media (max-width: 700px) {
		padding: 20px 0px;
	}
	margin-bottom: 20px;
	max-height: 800px;
	overflow-y: auto;
`;

const Row = styled.div`
	display: flex;
	margin: 10px 0;
	background: #efefef;
	padding: 20px 10px;
	border-radius: 10px;
`;

const Header = styled.div`
	/* display: flex; */
	margin: 10px 0;
	font-size: 18px;
	font-weight: 600;
	padding: 20px 10px;
	text-align: center;
`;

const Col = styled.div`
	flex: 1;
	font-size: 15px;
	font-weight: 500;
`;

export default function TableModal({ show, onClose, details, heading }) {
	return (
		<Modal show={show} onClose={onClose} width='50%'>
			{Object.entries(details)?.length > 0 && (
				<>
					<UI.ImgClose onClick={onClose} src={imgClose} alt='close' />
					<Div>
						<Header>{heading}</Header>
						<>
							{Object.entries(details).map(([key, value]) => (
								<Row key={key}>
									<Col>{key}</Col>
									<Col>{value}</Col>
								</Row>
							))}
						</>
					</Div>
				</>
			)}
		</Modal>
	);
}
