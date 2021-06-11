import { useState } from 'react';
import Header from '../components/Header';

export default function Layout({ children, k, onTabChange, padding }) {
	return (
		<>
			<Header active={k} click={onTabChange} />
			<main className={`w-full ${padding || 'p-10'}`} active={k}>
				{children}
			</main>
		</>
	);
}
