import styled from 'styled-components'
import { string, func, element, object, oneOf } from 'prop-types';

const StyledButton = styled.button`
    color: ${({ theme, fill }) => fill ? 'white' : theme.buttonColor1};
    border: 2px solid ${({ theme, fill }) => fill ?? theme.buttonColor1};
    border-radius: 5px;
    outline: none;
    padding: 10px 20px;
    background: ${({ theme, fill }) => fill ?? theme.themeColor1};
    display: flex;
    align-items: center;
    min-width: 200px;
    justify-content: space-between;
    font-size: 0.9em;
    font-weight: 500;
    text-align: center;
    transition: 0.2s;

    &:hover {
        color: ${({ theme, fill }) => fill ? 'white' : theme.themeColor1};
        background: ${({ theme, fill }) => fill ?? theme.buttonColor2};
    }
`;

const Div = styled.div`
    text-align:center;
    flex: 1;
`;

export default function Button({ name, onClick, children, fill, style }) {
    return (
        <StyledButton
            onClick={onClick}
            fill={fill}
            altStyle={style}>
            <Div>{name}</Div>
            {children}
        </StyledButton>
    )
}

Button.defaultProps = {
    name: '',
    onClick: () => { },
    children: '',
    fill: null,
    style: {}
}

Button.propTypes = {
    name: string.isRequired,
    onClick: func,
    children: oneOf(['', element]),
    fill: string,
    style: object
};