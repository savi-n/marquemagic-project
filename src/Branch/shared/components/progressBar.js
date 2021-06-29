export default function ProgressBar({ percentage }) {
	return (
		<div className='progress-bar'>
			<div className='filler flex items-center' style={{ width: `100%` }}>
				<div className='filler3' style={{ width: `${percentage}%` }}></div>
				<div className='filler2 w-1/12 opacity-75'></div>
			</div>
		</div>
	);
}
