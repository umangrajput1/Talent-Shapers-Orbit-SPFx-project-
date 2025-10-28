import React from 'react';
import Card from '../common/Card';
import { useMockData } from '../../hooks/useMockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const cardColors = {
    students: { bg: 'bg-primary-subtle', icon: 'text-primary' },
    staff: { bg: 'bg-success-subtle', icon: 'text-success' },
    courses: { bg: 'bg-warning-subtle', icon: 'text-warning' },
    revenue: { bg: 'bg-info-subtle', icon: 'text-info' },
    leads: { bg: 'bg-danger-subtle', icon: 'text-danger' },
    batches: { bg: 'bg-secondary-subtle', icon: 'text-secondary' },
}

const DashboardView: React.FC<{ data: ReturnType<typeof useMockData> }> = ({ data }) => {
    const { students, staff, courses, feePayments, expensesData, leads, batches } = data;

    const totalRevenue = feePayments.filter(f => f.status === 'Paid').reduce((sum, f) => sum + f.amount, 0);
    const activeStudentsCount = students.filter(s => s.status === 'Active').length;
    const newLeadsCount = leads.filter(l => l.status === 'New').length;
    const ongoingBatchesCount = batches.filter(b => b.status === 'Ongoing').length;
    
    const processMonthlyData = () => {
        const monthlyData: { [key: string]: { Revenue: number, Expenses: number } } = {};
        const processItems = (items: (typeof feePayments | typeof expensesData), type: 'Revenue' | 'Expenses') => {
            items.forEach(item => {
                if (type === 'Revenue' && (item as any).status !== 'Paid') return;
    
                const month = new Date(item.date).toLocaleString('default', { month: 'short', year: 'numeric' });
                if (!monthlyData[month]) {
                    monthlyData[month] = { Revenue: 0, Expenses: 0 };
                }
                monthlyData[month][type] += item.amount;
            });
        };
    
        processItems(feePayments, 'Revenue');
        processItems(expensesData, 'Expenses');
        
        const chartData = Object.keys(monthlyData).map(month => ({
            name: month,
            ...monthlyData[month]
        })).sort((a, b) => new Date(a.name) as any - (new Date(b.name) as any));
    
        return chartData;
    };
    
    const chartData = processMonthlyData();

    // Upcoming & Overdue payments logic
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const getStudentName = (studentId: string) => students.find(s => s.id === studentId)?.name || 'Unknown';

    const pendingPayments = feePayments.filter(p => p.status === 'Pending');

    const overduePayments = pendingPayments
        .filter(p => new Date(p.date) < today)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const upcomingPayments = pendingPayments
        .filter(p => {
            const paymentDate = new Date(p.date);
            const thirtyDaysFromNow = new Date();
            thirtyDaysFromNow.setDate(today.getDate() + 30);
            return paymentDate >= today && paymentDate <= thirtyDaysFromNow;
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        const formatDate = (isoDateString?: string): string => {
            if (!isoDateString) return 'N/A';
            const datePart = isoDateString.split('T')[0];
            const parts = datePart.split('-');
            if (parts.length !== 3) return isoDateString;
            const [year, month, day] = parts;
            return `${day}/${month}/${year}`;
          };
          
    return (
        <div>
            <h1 className="h2 mb-4">Dashboard</h1>
            
            <div className="row row-cols-1 row-cols-md-3 row-cols-xl-6 g-4 mb-5">
                <div className="col">
                    <Card title="Active Students" value={activeStudentsCount} icon={<UsersIcon />} colors={cardColors.students} />
                </div>
                <div className="col">
                    <Card title="Total Staff" value={staff.length} icon={<BriefcaseIcon />} colors={cardColors.staff} />
                </div>
                <div className="col">
                    <Card title="Total Courses" value={courses.length} icon={<BookOpenIcon />} colors={cardColors.courses} />
                </div>
                <div className="col">
                    <Card title="Ongoing Batches" value={ongoingBatchesCount} icon={<ClockIcon />} colors={cardColors.batches} />
                </div>
                 <div className="col">
                    <Card title="New Leads" value={newLeadsCount} icon={<InboxInIcon />} colors={cardColors.leads} />
                </div>
                <div className="col">
                    <Card title="Total Revenue" value={`₹${totalRevenue.toLocaleString()}`} icon={<CurrencyDollarIcon />} colors={cardColors.revenue} />
                </div>
            </div>

            <div className="row g-4 mb-4">
                <div className="col-12">
                    <div className="card shadow-sm h-100">
                        <div className="card-header">
                            <h2 className="h5 mb-0">Monthly Financial Overview</h2>
                        </div>
                        <div className="card-body">
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                                    <XAxis dataKey="name" stroke="var(--bs-secondary-color)" fontSize={12} />
                                    <YAxis stroke="var(--bs-secondary-color)" fontSize={12} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'var(--bs-body-bg)',
                                            borderColor: 'var(--bs-border-color)',
                                            color: 'var(--bs-body-color)'
                                        }}
                                    />
                                    <Legend />
                                    <Bar dataKey="Revenue" fill="#0d6efd" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="Expenses" fill="#dc3545" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="row g-4">
                <div className="col-lg-6">
                    <div className="card shadow-sm h-100">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h2 className="h5 mb-0">Overdue Payments</h2>
                            {overduePayments.length > 0 && <span className="badge bg-danger-subtle text-danger-emphasis rounded-pill">{overduePayments.length}</span>}
                        </div>
                        <div className="card-body" style={{ minHeight: '200px' }}>
                            {overduePayments.length > 0 ? (
                                <ul className="list-group list-group-flush">
                                    {overduePayments.map(payment => (
                                        <li key={payment.id} className="list-group-item d-flex justify-content-between align-items-center px-0">
                                            <div>
                                                <div className="fw-semibold">{getStudentName(payment.studentId)}</div>
                                                <small className="text-danger">Due: {formatDate(payment.date)}</small>
                                            </div>
                                            <span className="fw-bold text-danger">₹{payment.amount.toLocaleString()}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="d-flex align-items-center justify-content-center h-100">
                                  <p className="text-body-secondary text-center mt-3">No overdue payments. Well done!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="col-lg-6">
                    <div className="card shadow-sm h-100">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h2 className="h5 mb-0">Upcoming Payments (Next 30 Days)</h2>
                            {upcomingPayments.length > 0 && <span className="badge bg-warning-subtle text-warning-emphasis rounded-pill">{upcomingPayments.length}</span>}
                        </div>
                         <div className="card-body" style={{ minHeight: '200px' }}>
                            {upcomingPayments.length > 0 ? (
                                <ul className="list-group list-group-flush">
                                    {upcomingPayments.map(payment => (
                                        <li key={payment.id} className="list-group-item d-flex justify-content-between align-items-center px-0">
                                            <div>
                                                <div className="fw-semibold">{getStudentName(payment.studentId)}</div>
                                                <small className="text-body-secondary">Due: {formatDate(payment.date)}</small>
                                            </div>
                                            <span className="fw-bold text-primary">₹{payment.amount.toLocaleString()}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="d-flex align-items-center justify-content-center h-100">
                                    <p className="text-body-secondary text-center mt-3">No payments due in the next 30 days.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// SVG Icons
const UsersIcon: React.FC<{className?: string}> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const BriefcaseIcon: React.FC<{className?: string}> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);
const BookOpenIcon: React.FC<{className?: string}> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
);
const ClockIcon: React.FC<{className?: string}> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const CurrencyDollarIcon: React.FC<{className?: string}> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 12v-2m0 2v.01m0 4v-2m0 2v.01M6 12h.01M18 12h.01M6 12a6 6 0 1112 0 6 6 0 01-12 0z" />
  </svg>
);
const InboxInIcon: React.FC<{className?: string}> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
    </svg>
);

export default DashboardView;