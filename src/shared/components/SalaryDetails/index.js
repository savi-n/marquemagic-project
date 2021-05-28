import DetailsComponent from '../Details';

export default function SalaryDetails(props) {
	return (
		<>
			<h1 className='text-lg sm:text-xl text-black'>
				Help us with <span className='text-blue-600'>Salary Details</span>
			</h1>
			<DetailsComponent {...props} data={props.jsonData} />
		</>
	);
}
