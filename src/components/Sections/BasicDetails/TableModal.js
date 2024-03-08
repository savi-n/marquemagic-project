import styled from 'styled-components';
import Modal from 'components/Modal';
import * as UI from './ui';
import imgClose from 'assets/icons/close_icon_grey-06.svg';

const Div1 = styled.div`
	padding: 10px;
	@media (max-width: 700px) {
		padding: 20px 0px;
	}
	margin-bottom: 20px;
	max-height: 800px;
	overflow-y: hidden;
`;

const Div2 = styled.div`
	height: 400px;
	overflow-y: scroll;
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
	padding: 0px 10px 10px;
	text-align: center;
`;

const Col1 = styled.div`
	flex: 1;
	font-size: 15px;
	font-weight: 500;
	padding-left: 20px;
	text-transform: capitalize;
	font-weight: bold;
	display: flex;
	align-items: center;
`;

const Col2 = styled.div`
	flex: 1;
	font-size: 15px;
	font-weight: 500;
	white-space: pre-wrap;
	word-spacing: 2px;
`;
const Title = styled.div`
	margin: 10px 10px;
	font-size: 18px;
	padding: 20px 10px;
	text-align: center;
`;

export default function TableModal({
	show,
	onClose,
	details,
	heading,
	errorMessage,
}) {
	return (
		<Modal
			show={show}
			onClose={onClose}
			customStyle={{
				width: '40%',
				minHeight: 'auto',
				paddingBottom: '10px',
			}}
		>
			<>
				<UI.ImgClose onClick={onClose} src={imgClose} alt='close' />
				{Object.entries(details)?.length > 0 ? (
					<>
						<Div1>
							<Header>{heading}</Header>
							<Div2>
								{Object.entries(details)?.map(([key, value]) => (
									<Row key={key}>
										<Col1>{key}</Col1>
										<Col2>{value}</Col2>
									</Row>
								))}
							</Div2>
						</Div1>
					</>
				) : (
					<>
						<Div1>
							<Title>{errorMessage}</Title>
						</Div1>
					</>
				)}
			</>
		</Modal>
	);
}
