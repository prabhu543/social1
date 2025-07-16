
import { syncUser } from '@/actions/userActions';
import { currentUser } from '@clerk/nextjs/server';
import React from 'react';

const Dashboard = async () => {
	const user = await currentUser();
	if (user) await syncUser();
	return <div className='mt-20'>Dashboard</div>;
};

export default Dashboard;