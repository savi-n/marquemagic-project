export default function Card(props) {
	const { approve, reject, security, full } = props;
	return (
		<main
			style={{
				boxShadow: '0 0 19px 0px #98AFC7',
				maxHeight: `${reject || approve || security ? '50rem' : '280px'}`,
				width: `${!full && 'calc(100%/3)'}`
			}}
			className={`${full && 'w-full'} p-6 h-full rounded-md flex-flex-col`}
		>
			{props.head && (
				<section className='pb-6 flex flex-col gap-y-2'>
					<small className='text-sm'>{props.head && props.head.toUpperCase()}</small>
					{props.head && <hr />}
				</section>
			)}
			{props.children}
		</main>
	);
}
