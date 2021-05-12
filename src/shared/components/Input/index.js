import React from 'react';
import styled from 'styled-components';

const Inp = styled.input`
	width: ${({ width }) => width};
	font-size: 1rem;
	padding: 10px;
	color: black;
`;

export default function Input(props) {
	return <Inp {...props} />;
}
