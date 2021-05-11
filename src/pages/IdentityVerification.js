import styled from 'styled-components'

const Colom1 = styled.div`
    flex: 1;
    background: ${({ theme }) => theme.themeColor1};
    padding: 50px;
`;

const Colom2 = styled.div`
    width: 40%;
    background: ${({ theme }) => theme.themeColor1};
`;

const Img = styled.img`
    width: 100%;
    height:100%;
    object-fit: cover;
    object-position: center
`;


export default function IdentityVerification({ loanDetails }) {

    return (
        <>
            <Colom1>

            </Colom1>
            <Colom2>
                <Img src={loanDetails?.imageUrl} alt={'Loan Caption'} />
            </Colom2>
        </>
    )
}