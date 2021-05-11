import styled from 'styled-components'
import { string } from 'prop-types';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronRight } from '@fortawesome/free-solid-svg-icons'


const Div = styled.div`
    margin-left: auto;
`;

const Button = styled.button`
    color: ${({ theme }) => theme.buttonColor1};
    border: 2px solid ${({ theme }) => theme.buttonColor1};
    border-radius: 5px;
    outline: none;
    padding: 10px 20px;
    background: ${({ theme }) => theme.themeColor1};
    display: flex;
    align-items: center;
    width: 150px;
    justify-content: space-between;
    font-size: 0.9em;
    font-weight: 500;
    transition: 0.2s;

    &:hover {
        color: ${({ theme }) => theme.themeColor1};
        background: ${({ theme }) => theme.buttonColor2};
    }
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
            <a href="/"> <Logo src={logo} alt="logo" /></a>
            <Div>
                <Button>
                    <div>Open Account</div>
                    <FontAwesomeIcon icon={faChevronRight} size="1x" />
                </Button>
            </Div>
        </>
    )
}

Header.propTypes = {
    logo: string.isRequired,
};
