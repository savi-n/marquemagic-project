import { createPortal } from 'react-dom';
import { bool, number, oneOf } from "prop-types";
import styled from 'styled-components';

const Backdrop = styled.div`
    position: fixed;
    height: 100vh;
    width: 100vw;
    background: rgba(0,0,0,0.5);
    top: 0;
    left:0;
    z-index: 999;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
`;

const Modalbody = styled.div`
    background: #fff;
    padding: 20px;
    border-radius: 5px;
    width: 50%;
    min-height: 50%;
    box-shadow: 0px 2px 5px 1px rgb(0 0 0 / 20%);
`;

export default function Modal({ show, backdrop, bg, children }) {
    const modalRoot = document.getElementById('modal-root')
    if (!show) return null
    return createPortal(
        <Backdrop backdrop={backdrop}>
            <Modalbody>{children}</Modalbody>
        </Backdrop>,
        modalRoot
    )
}

Modal.defaultProps = {
    show: false,
    backdrop: true
}

Modal.propTypes = {
    show: bool,
    backdrop: oneOf([bool, number])
}