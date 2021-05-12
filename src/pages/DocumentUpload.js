import { useState } from 'react';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import { oneOf } from 'prop-types';



import Button from '../shared/components/Button/Button';
import CheckBox from '../shared/components/Checkbox/CheckBox';
import FileUpload from '../shared/components/FileUpload/FileUpload';

const Colom1 = styled.div`
    flex: 1;
    background: ${({ theme }) => theme.themeColor1};
    padding: 50px;
`;

const Colom2 = styled.div`
    width: 40%;
    background: ${({ theme }) => theme.themeColor1};
    padding: 50px 30px;
`;

const UploadWrapper = styled.div`
    padding: 30px 0;
`;

const ButtonWrapper = styled.div`
    display:flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    margin: 10px 0;
`;

const CheckboxWrapper = styled.div`
    display:flex;
    justify-content:center;
    flex-direction: column;
    margin: 20px 0;
    gap: 10px;
`;

const SubmitWrapper = styled.div`
    display:flex;
    align-items:center;
    margin: 10px 0;
    gap: 10px;
`;

const DocsCheckboxWrapper = styled.div`
    margin: 20px 0;
`;

const text = {
    grantCibilAcces: 'I here by give consent to pull my CIBIL records',
    declaration: 'I here do declare tat what is stated above is true to the best of my knowledge and  belief'

}

const documentsRequired = [
    'Latest Three months salary slip',
    'Latest Six months bank account statement(in which the salary gets credited)',
    'Last 2 years ITR(in pdf)',
    'Quotation letter',
    'SB account statment for the latest six months(other banks)',
    'Form 16 from the Employee of the borrower',
    'Any other relevent doxuments'
]

export default function DocumentUpload({ userType }) {

    const [checkbox1, setCheckbox1] = useState(false);
    const [checkbox2, setCheckbox2] = useState(false);

    const [uploadFiles, setUploadFiles] = useState([]);

    const handleFileUpload = (files) => {
        setUploadFiles([...uploadFiles, ...files,])
    }

    return (
        <>
            <Colom1>
                <h2>{userType ?? 'Help Us with'} <span>Document Upload</span></h2>
                <UploadWrapper >
                    <FileUpload onDrop={handleFileUpload} />
                </UploadWrapper>

                {uploadFiles.map(files => (<div>{files.name}</div>))}
                <ButtonWrapper>
                    <Button name='Get CUB Statement' />
                    <Button name='Get Other Bank Statements' />
                    <Button name='Get ITR documents' />
                </ButtonWrapper>
                <CheckboxWrapper>
                    <CheckBox
                        name={text.grantCibilAcces}
                        checked={checkbox1}
                        onChange={(state) => setCheckbox1(state)}
                        bg='blue' />
                    <CheckBox
                        name={text.declaration}
                        checked={checkbox2}
                        onChange={(state) => setCheckbox2(state)} bg='blue' />
                </CheckboxWrapper>
                <SubmitWrapper>
                    <Button name='Submit' fill="blue" style={{
                        width: '200px',
                        background: 'blue'
                    }} />

                    <Button name='Save' style={{
                        width: '200px',
                    }} />
                </SubmitWrapper>

            </Colom1>
            <Colom2>
                <h3>Documents Required</h3>
                <div>
                    {documentsRequired.map(docs => (
                        <DocsCheckboxWrapper key={uuidv4()}>
                            <CheckBox
                                name={docs}
                                checked={true}
                                disabled
                                round
                                bg='green'
                            />
                        </DocsCheckboxWrapper>
                    ))}
                </div>
            </Colom2>
        </>
    )
}

DocumentUpload.defaultProps = {
    userType: null
}

DocumentUpload.propTypes = {
    userType: oneOf(['', 'Gurantor', 'Co-applicant'])
}