import styled from 'styled-components';

const Booton = styled.button``;

export default function Button(props) {
	return <Booton {...props}>{props.children}</Booton>;
}
