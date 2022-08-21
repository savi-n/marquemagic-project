import styled from 'styled-components';

export const Colom1 = styled.div`
	flex: 1;
	padding: 50px;
	@media (max-width: 700px) {
		padding: 50px 0px;
		max-width: 100%;
	}
`;

export const UploadWrapper = styled.div`
	margin: 30px 0;
	position: relative;
	max-width: 100%;
	max-height: ${props => (props.open ? '100%' : '0%')};
	display: ${props => (props.open ? 'block' : 'none')};
`;

export const Details = styled.div`
	max-height: ${props => (props.open ? '100%' : '0%')};
	transition: all 0.3s ease-out;
	@media (max-width: 700px) {
		max-width: 51%;
		padding: 0px;
	}
`;

// export const ButtonWrapper = styled.div`
//   display: flex;
//   align-items: center;
//   flex-wrap: wrap;
//   gap: 10px;
//   margin: 10px 0;
// `;

// export const CheckboxWrapper = styled.div`
//   display: flex;
//   justify-content: center;
//   flex-direction: column;
//   margin: 20px 0;
//   gap: 10px;
// `;

export const SubmitWrapper = styled.div`
	display: flex;
	align-items: center;
	margin: 10px 0;
	gap: 10px;
`;

export const H = styled.h1`
	font-size: 1.3em;
	font-weight: 600;
	margin-bottom: 20px;
	span {
		color: ${({ theme }) => theme.main_theme_color};
	}
`;

export const H1 = styled.h1`
	font-size: 1em;
	font-weight: 600;
	margin-right: 20px;
	span {
		color: ${({ theme }) => theme.main_theme_color};
	}
`;

export const CheckboxWrapper = styled.div`
	display: flex;
	justify-content: center;
	flex-direction: column;
	margin: 20px 0;
	gap: 10px;
`;

export const Section = styled.div`
	display: flex;
	align-items: center;
	cursor: pointer;
	border-bottom: 1px solid #ddd;
	/* border: 1px solid #ddd; */
	height: 60px;
`;

export const CollapseIcon = styled.img`
	height: 18px;
	width: 18px;
	margin-right: 20px;
	object-fit: contain;

	cursor: pointer;
`;

// export const Hr = styled.hr`
// 	display: none;
// 	padding: 0px;
// 	color: 'green';
// `;

export const StyledButton = styled.button`
	/* height: 25px; */
	margin: 5px;
	color: ${({ theme, fill }) => (fill ? 'white' : '#0068FF')};
	border: 2px solid
		${({ theme, fill }) =>
			fill && (typeof fill === 'string' ? fill : '#0068FF')};
	border-radius: 40px;
	padding: 0 20px;
	background: ${({ theme, fill }) =>
		fill && (typeof fill === 'string' ? fill : '#0068FF')};
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
export const LoaderWrapper = styled.div`
	width: 100%;
	max-height: 500px;
	display: flex;
	justify-content: center;
	text-align: center;
`;
