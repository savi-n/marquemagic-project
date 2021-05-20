import { useState } from 'react';
import styled from 'styled-components';

import Modal from './Modal';
import Button from './Button';

const Bank = styled.div`
    padding: 15px;
    border: 1px solid black;
    border-radius:4px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 40%;
    margin: 10px 0;
    cursor: pointer;
`;

const BankWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 10%;
    padding: 30px;
`;

const BankName = styled.div`
    flex: 1;
`;

const TitleWrapper = styled.div`
    flex:1;
`;

const Title = styled.h4`
    text-align: center;
    margin-bottom: 10px;
`;

const ContentWrapper = styled.div`
    justify-content: center;
    display: flex;
    flex-wrap:wrap;
`;

const BANKS_LIST = [
    {
        name: 'HDFC',
        icon: 'hdfc'
    },
    {
        name: 'Kotak Mahindra',
        icon: 'km'
    },
    {
        name: 'ICICI',
        icon: 'icici'
    },
    {
        name: 'Yes',
        icon: 'yes'
    },
    {
        name: 'SBI',
        icon: 'sbi'
    },
    {
        name: 'Axis',
        icon: 'axis'
    }
];

export default function BankStatementModal({ showModal, onClose }) {
    const [bankChoose, setBankChoose] = useState('')

    return (
        <Modal show={showModal} >
            <ContentWrapper>
                <TitleWrapper>
                    <Title>Select Bank</Title>
                    <hr />
                </TitleWrapper>
                <BankWrapper>
                    {
                        BANKS_LIST.map(bank => (
                            <Bank onClick={(e) => setBankChoose(bank.name)}>
                                <img src={bank.icon} alt={bank.icon} />
                                <BankName>{bank.name}</BankName>
                                <input type='radio' checked={bankChoose === bank.name} />
                            </Bank>
                        ))
                    }
                </BankWrapper>

                <Button name='Next' fill="blue" style={{
                    width: '200px',
                    background: 'blue'
                }} onClick={onClose} />
            </ContentWrapper>
        </Modal>)
}