import styled from 'styled-components';

export const Divider = styled.div`
	/* border-bottom: 3px lightgrey solid; */
	/* border-bottom: 3px #f8f8f8 solid; */
	border-bottom: 3px #f1f1f1 solid;
	height: 10px;
	grid-column: span 2;
	height: 25px;
	@media (max-width: 700px) {
		grid-column: span 1;
	}
`;
