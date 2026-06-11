import { useState } from 'react'
import {assets , dummyDashboardData } from '../../assets/assets';
import Title from '../../components/owner/Title';
const Dashboard = () => {

    const [data,setData] = useState({
        totalCars: 0,
        totalBookings: 0,
        pendingBookings: 0,
        completedBookings: 0,
        recentBookings: [],
        monthlyRevenue: 0,
    });

    const dashboardCards = [
        {title: 'Total Cars', value: data.totalCars, icon: assets.carIconColored},
        {title: 'Total Bookings', value: data.totalBookings, icon: assets.listIconColored},
        {title: 'Pending Bookings', value: data.pendingBookings, icon: assets.cautionIconColored},
        {title: 'Completed Bookings', value: data.completedBookings, icon: assets.listIconColored},
    ];

    useEffect(() => {
        setData(dummyDashboardData);
    }, []);

    return (
        <div className="px-4 pt-10 md:px-10 flex-1">
            <Title title="Admin Dashboard" />
        </div>
  )
}

export default Dashboard
