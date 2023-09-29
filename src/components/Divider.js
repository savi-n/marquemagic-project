import React from 'react';
import styled from 'styled-components';

export const HorizontalDivider = styled.div`
	border-bottom: 3px #f1f1f1 solid;
	height: 10px;
	grid-column: span 2;
	height: 25px;
	@media (max-width: 700px) {
		grid-column: span 1;
	}
`;

const Divider = props => {
	// for the future implementation
	// const { type = 'horizontal' } = props;
	// if (type === 'horizontal') return <HorizontalDivider />;
	return <HorizontalDivider />;
};

export default Divider;
