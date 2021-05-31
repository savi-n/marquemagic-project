import styled from 'styled-components';
import { string } from 'prop-types';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import Button from '../shared/components/Button';

const Div = styled.div`
	margin-left: auto;
`;

const Logo = styled.img`
	width: 200px;
	height: calc(100% - 40px);
	object-fit: scale-down;
	object-position: left;
`;

export default function Header({ logo }) {
	return (
		<>
			<a href='/'>
				<Logo src={logo} alt='logo' />
			</a>
			<div className='ml-auto'>
				<Button>
					<span className='px-4'>Open Account</span>
					<FontAwesomeIcon icon={faChevronRight} size='1x' />
				</Button>
			</div>
		</>
	);
}

Header.propTypes = {
	logo: string.isRequired
};
