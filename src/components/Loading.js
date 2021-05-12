import styled from 'styled-components';
import NcLoading from '../shared/components/NcLoader/index';

const Wrapper = styled.div`
	width: 100%;
	height: 100%;
`;

export default function Loading() {
	return (
		<Wrapper>
			<NcLoading />
		</Wrapper>
	);
}
