import Layout from '../Layout';
import jsonData from '../shared/constants/data.json';
import PersonalDetailsComponent from '../shared/components/PersonalDetails';
import SalaryDetails from '../shared/components/SalaryDetails';
import Footer from '../shared/components/Footer';

export default function PersonalDetails(props) {
	return (
		<Layout>
			<PersonalDetailsComponent pageName={props.pageName} jsonData={jsonData.personal_details.data} />
			<SalaryDetails pageName={props.pageName} jsonData={jsonData.salary_details.data} />
			<Footer />
		</Layout>
	);
}
