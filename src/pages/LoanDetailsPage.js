import Layout from '../Layout';
import EMIDetails from '../shared/components/EMIDetails';
import jsonData from '../shared/constants/data.json';
import Footer from '../shared/components/Footer';
import DetailsComponent from '../shared/components/Details';

export default function LoanDetailsComponent(props) {
	return (
		<Layout>
			<h1 className='text-xl'>
				Help us with your <span className='text-blue-600'>{props.pageName}</span>
			</h1>
			<DetailsComponent data={jsonData} />
			<EMIDetails jsonData={jsonData} />
			<Footer />
		</Layout>
	);
}
