import Input from '../Input';
import CheckBox from '../Checkbox/CheckBox';

export default function Divider(props) {
	return (
		<section
			className={`flex flex-col justify-start grid gap-y-2 w-full ${props.split && 'grid-cols-2'}
				py-16`}
		>
			{props.head && (
				<div className='flex justify-start items-center'>
					<p>{props.head}</p>
					{props.headLink && (
						<section className='px-2'>
							<CheckBox
								name='Same as present address'
								onChange={() => props.change(true)}
								bg='blue'
								checked={false}
							/>
						</section>
					)}
				</div>
			)}
			{props.children}
		</section>
	);
}
