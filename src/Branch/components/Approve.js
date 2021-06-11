import Button from '../shared/components/Button';

export default function Approve({ setApprove }) {
	return (
		<section className=' py-10 rounded-md flex flex-col gap-y-4 justify-end'>
			<textarea
				placeholder='Add Remarks'
				className='border focus:outline-none rounded-md w-full resize-none p-2'
			/>
			<input placeholder='Add ROI' className='rounded-md border border-gray-200 p-2 focus:outline-none' />
			<section className='w-full gap-x-4 flex justify-end'>
				<Button type='blue-light' size='small' rounded='rfull' onClick={() => setApprove(false)}>
					Submit
				</Button>
				<Button type='red-light' size='small' rounded='rfull' onClick={() => setApprove(false)}>
					Cancel
				</Button>
			</section>
		</section>
	);
}
