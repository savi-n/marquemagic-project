import styled from 'styled-components';

export const Wrapper = styled.div``;

export const CheckboxWrapper = styled.div`
	display: flex;
	justify-content: center;
	flex-direction: column;
	margin: 20px 0;
	gap: 10px;
`;

export const SubmitWrapper = styled.div`
	display: flex;
	align-items: center;
	margin: 10px 0;
	gap: 10px;
`;
export const Asterisk = styled.span`
	color: red;
`;
export const CollapseHeader = styled.div`
	display: flex;
	align-items: center;
	cursor: pointer;
	border-bottom: 1px solid #ddd;
	/* border: 1px solid #ddd; */
	height: 60px;
	@media (max-width: 700px) {
		flex-direction: column;
		align-items: flex-start;
		height: 100px;
	}
`;

export const CollapseIcon = styled.img`
	height: 18px;
	width: 18px;
	margin-right: 20px;
	object-fit: contain;

	cursor: pointer;
`;

export const CollapseBody = styled.div`
	max-height: ${props => (props.open ? '100%' : '0%')};
	transition: all 0.3s ease-out;
	@media (max-width: 700px) {
		max-width: 51%;
		padding: 0px;
	}
`;

export const StyledButton = styled.button`
	/* height: 25px; */
	margin: 5px;
	color: ${({ fillColor }) => (fillColor ? 'white' : '#0068FF')};
	border: 2px solid
		${({ fillColor }) =>
			fillColor && (typeof fillColor === 'string' ? fillColor : '#0068FF')};
	border-radius: 40px;
	padding: 0 20px;
	background: ${({ fillColor }) =>
		fillColor && (typeof fillColor === 'string' ? fillColor : '#0068FF')};
	display: flex;
	align-items: center;
	min-width: ${({ width }) => (width ? width : '200px')};
	justify-content: space-between;
	font-size: 1rem;
	font-weight: 500;
	text-align: center;
	transition: 0.2s;
	display: flex;
	justify-content: center;
	@media (max-width: 700px) {
		width: 7rem;
		padding: 0 10px;
	}
`;
export const NameHeaderWrapper = styled.h1`
	font-size: 1.3em;
	font-weight: 600;
	margin-bottom: 20px;
`;

export const ApplicantCoApplicantName = styled.span`
	color: black !important;
	font-weight: 500;
	margin-left: 10px;
	font-size: 12px;
	background-color: #eee;
	padding: 5px 20px;
	border-radius: 12px;
	letter-spacing: 0.5px;
`;

export const CategoryNameHeader = styled.h1`
	font-size: 1em;
	font-weight: 600;
	margin-right: 20px;
	@media (max-width: 700px) {
		margin-left: 10px;
		margin-top: 10px;
	}
`;

export const UploadWrapper = styled.div`
	margin: 30px 0;
	position: relative;
	max-width: 100%;
	max-height: ${props => (props.open ? '100%' : '0%')};
	display: ${props => (props.open ? 'block' : 'none')};
`;

export const Footer = styled.div`
	margin: 50px 0;
`;
export const LoaderWrapper = styled.div`
	width: 100%;
	max-height: 500px;
	display: flex;
	justify-content: center;
	text-align: center;
`;

export const CommentsForOfficeUse = styled.textarea``;

export const Divider = styled.div`
	border: 1px solid #eee;
	margin: 40px 0;
`;

export const CommentsForOfficeUserWrapper = styled.div``;

export const CommentsForOfficeUseFieldName = styled.div`
	color: #0068ff;
	font-size: 18px;
	font-weight: bold;
	margin-bottom: 5px;
`;
