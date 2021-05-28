import DetailsComponent from '../Details';

export default function PersonalDetails(props) {
	return (
		<>
			<h1 className='text-lg sm:text-xl text-black'>
				Help us with your <span className='text-blue-600'>{props.pageName || 'Personal Details'}</span>
			</h1>
			<DetailsComponent data={props.jsonData} split={true} />
		</>
	);
}
