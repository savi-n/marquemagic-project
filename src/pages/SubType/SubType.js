import AddressDetailsComponent from '../../shared/components/AddressDetails';
import Layout from '../../Layout';
import jsonData from '../../shared/constants/data.json';
import Button from '../../shared/components/Button';
import Footer from '../../shared/components/Footer';
import PersonalDetails from '../../shared/components/PersonalDetails';

export default function CoApplicantComponent(props) {
	return (
		<Layout>
			<PersonalDetails jsonData={jsonData.personal_details.data} />
			<AddressDetailsComponent jsonData={jsonData.address_details.data} {...props} />
			<Footer cancel={true} subTypeButton={false} click={props.click} />
		</Layout>
	);
}
