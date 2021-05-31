import Layout from '../../Layout';
import DocumentUpload from '../DocumentUpload';
import Footer from '../../shared/components/Footer';

export default function CoApplicantsDocs(props) {
	return (
		<>
			<DocumentUpload
				userType='Co-applicant'
				loanDetails={props.loanDetails}
				footer={true}
				cancel={true}
				click={props.click}
				submitHandler={props.submitHandler}
				submit={props.submit}
			/>
		</>
	);
}
