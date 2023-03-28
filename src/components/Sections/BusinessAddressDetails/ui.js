import styled from 'styled-components';

export const H1 = styled.h1`
	margin-top: 80px;
	font-size: 1.5em;
	font-weight: 500;
	span {
		color: ${({ theme }) => theme.main_theme_color};
	}
`;

export const FieldWrapGrid = styled.div`
	margin-bottom: ${({ field }) =>
		field.name == 'gst_num_selected' ? '40px' : 0} !important;
	width: 100%;
	margin: 15px 0;
`;

export const FormWrapGrid = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 10%;
	justify-content: space-between;
	margin: 20px 0;
`;

export const Coloum = styled.div`
	display: flex;
	flex-basis: 45%;
	align-items: center;
	flex-wrap: wrap;
	@media (max-width: 700px) {
		flex-basis: 100%;
	}
`;

// export const Caption = styled.h3`
// 	width: 100%;
// 	font-weight: 500;
// 	display: flex;
// 	justify-content: space-between;
// `;
