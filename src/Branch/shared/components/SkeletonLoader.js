import Skeleton from 'react-loading-skeleton';

export default function SkeletonLoader() {
	return (
		<section style={{ display: 'flex', flexDirection: 'column' }}>
			<Skeleton circle={false} height={40} width={440} />
			<Skeleton circle={false} height={40} width={440} />
			<Skeleton circle={false} height={40} width={440} />
		</section>
	);
}
