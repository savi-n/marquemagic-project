import { useState, useEffect } from 'react';
import Tabs from '../shared/components/Tabs';
import Button from '../../shared/components/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';

export default function Header({ click, active }) {
	return (
		<main className='w-full fixed z-50'>
			<header
				className={`w-full ${
					active === 'Home' ? ' bg-blue-700' : 'bg-white shadow-lg'
				} flex gap-x-10 justify-end px-10`}
			>
				<section className='flex '>
					{['Home', 'Loan Applications'].map(i => (
						<Tabs
							k={i}
							active={active === i}
							text={active === 'Home' ? 'white' : 'black'}
							click={click}
							align='horizontal'
						/>
					))}
				</section>
				<Button rounded='rfull' type={active !== 'Home' ? 'blue-light' : 'white'}>
					<section className='flex gap-x-3 items-center'>
						<span>Create Application</span> <FontAwesomeIcon icon={faChevronRight} />
					</section>
				</Button>
			</header>
		</main>
	);
}
