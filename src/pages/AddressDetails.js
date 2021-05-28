import Layout from '../Layout';
import AddressDetailsComponent from '../shared/components/AddressDetails';
import jsonData from '../shared/constants/data.json';
import Footer from '../shared/components/Footer';

export default function AddressDetails(props) {
	return (
		<Layout>
			<AddressDetailsComponent {...props} jsonData={jsonData.address_details.data} />
			<Footer subTypeButton={!props.coApplicant} click={props.click} addedApplicant={props.addedApplicant} />
		</Layout>
	);
}
