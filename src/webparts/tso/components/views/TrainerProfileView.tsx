import React from 'react';
import { useMockData } from '../../hooks/useMockData';

interface StaffProfileProps {
    staffId: string;
    data: ReturnType<typeof useMockData>;
    onBack: () => void;
}

const StaffProfileView: React.FC<StaffProfileProps> = ({ staffId, data, onBack }) => {
    const { staff, courses, students, assignments, batches } = data;

    const staffMember = staff.find(t => t.id === staffId);
    const trainerCourses = courses.filter(c => staffMember?.expertise?.includes(c.id));
    const trainerAssignments = assignments.filter(a => a.staffId === staffId);
    const trainerBatches = batches.filter(b => b.staffId === staffId);

    if (!staffMember) {
        return (
            <div className="text-center">
                <h1 className="h3">Staff member not found.</h1>
                <button onClick={onBack} className="mt-4 btn btn-primary">Back to List</button>
            </div>
        );
    }
    
    return (
        <div className="container-fluid p-0">
            {/* Header */}
            <div className="d-flex align-items-center justify-content-between mb-5">
                <div className="d-flex align-items-center">
                     <img src={staffMember.imageUrl || `https://ui-avatars.com/api/?name=${staffMember.name.replace(' ', '+')}&background=random`} alt={staffMember.name} className="rounded-circle object-fit-cover shadow-sm me-4" width="80" height="80" />
                    <div>
                        <button onClick={onBack} className="btn btn-link p-0 d-flex align-items-center text-decoration-none mb-1">
                            <svg className="me-1" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                            Back to Staff
                        </button>
                        <div className="d-flex align-items-center">
  <h1 className="h2 mb-0 me-2 text-body">{staffMember.name}</h1>
  <span
    className={`badge rounded-pill fs-6 ${
      staffMember.status === 'Active'
        ? 'text-bg-success'
        : 'text-bg-secondary'
    }`}
  >
    {staffMember.status}
  </span>
</div>
                        <p className="text-body-secondary mt-1">{staffMember.email} &bull; {staffMember.phone}</p>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="row g-4">
                {/* Left Column */}
                <div className="col-lg-4">
                    <div className="card shadow-sm">
                        <div className="card-header">
                            <h3 className="h5 mb-0">Details</h3>
                        </div>
                        <div className="card-body">
                             <div className="mb-3">
                                <span className="text-body-secondary d-block mb-1">About</span>
                                <p className="fw-semibold mb-0">{staffMember.about || 'N/A'}</p>
                            </div>
                            <div className="pt-3 border-top">
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-body-secondary">Role</span>
                                    <span className="fw-semibold">{staffMember.role}</span>
                                </div>
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-body-secondary">Joining Date</span>
                                    <span className="fw-semibold">{staffMember.joiningDate}</span>
                                </div>
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-body-secondary">Employment</span>
                                    <span className="fw-semibold">{staffMember.employmentType}</span>
                                </div>
                                 <div className="d-flex justify-content-between mb-2">
                                    <span className="text-body-secondary">Salary Rate</span>
                                    <span className="fw-semibold">
                                        ₹{staffMember.salary.toLocaleString()}
                                    </span>
                                </div>
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-body-secondary">Salary Type</span>
                                    <span className="fw-semibold">{staffMember.salaryType}</span>
                                </div>
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-body-secondary">Gender</span>
                                    <span className="fw-semibold">{staffMember.gender}</span>
                                </div>
                            </div>
                            <div className="mb-3 pt-3 border-top">
                                <span className="text-body-secondary d-block mb-1">Address</span>
                                <span className="fw-semibold">{staffMember.address || 'N/A'}</span>
                            </div>
                            {staffMember.role === 'Trainer' && staffMember.expertise && staffMember.expertise.length > 0 && (
                                <div className="pt-3 border-top">
                                    <span className="text-body-secondary d-block mb-1">Expertise</span>
                                    <div className="d-flex flex-column">
                                        {trainerCourses.map(c => (
                                            <span key={c.id} className="fw-semibold">{c.name}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="col-lg-8">
                     <div className="d-flex flex-column gap-4">
                        {staffMember.role === 'Trainer' && (
                            <div className="card shadow-sm">
                                <div className="card-header">
                                    <h3 className="h5 mb-0">Batches Teaching</h3>
                                </div>
                                <div className="table-responsive" style={{maxHeight: '400px'}}>
                                    <table className="table table-striped table-sm mb-0">
                                        <thead className="sticky-top bg-body-tertiary">
                                            <tr>
                                                <th className="p-3">Batch Name</th>
                                                <th className="p-3">Schedule</th>
                                                <th className="p-3">Course</th>
                                                <th className="p-3">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {trainerBatches.length > 0 ? trainerBatches.map(b => (
                                                <tr key={b.id}>
                                                    <td className="p-3 fw-semibold">{b.name}</td>
                                                    <td className="p-3">{b.weekdays.join(', ')} @ {b.time}</td>
                                                    <td className="p-3">{courses.find(c => c.id === b.courseId)?.name || 'N/A'}</td>
                                                    <td className="p-3">
                                                        <span className={`badge rounded-pill ${
                                                            b.status === 'Ongoing' ? 'text-bg-success' : 
                                                            b.status === 'Upcoming' ? 'text-bg-warning' : 'text-bg-secondary'
                                                        }`}>{b.status}</span>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan={4} className="text-center p-4 text-body-secondary">Not currently teaching any batches.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                        <div className="card shadow-sm">
                            <div className="card-header">
                                <h3 className="h5 mb-0">Assignments Allocated</h3>
                            </div>
                            <div className="table-responsive" style={{maxHeight: '400px'}}>
                                <table className="table table-striped table-sm mb-0">
                                    <thead className="sticky-top bg-body-tertiary">
                                        <tr>
                                            <th className="p-3">Title</th>
                                            <th className="p-3">Student</th>
                                            <th className="p-3">Course</th>
                                            <th className="p-3">Due Date</th>
                                            <th className="p-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {trainerAssignments.length > 0 ? trainerAssignments.map(a => (
                                            <tr key={a.id}>
                                                <td className="p-3 fw-semibold">{a.title}</td>
                                                <td className="p-3">{students.find(s => s.id === a.studentId)?.name || 'N/A'}</td>
                                                <td className="p-3">{courses.find(c=>c.id === a.courseId)?.name || 'N/A'}</td>
                                                <td className="p-3">{a.dueDate}</td>
                                                <td className="p-3">
                                                    <span className={`badge rounded-pill ${ a.status === 'Submitted' ? 'text-bg-success' : 'text-bg-secondary' }`}>{a.status}</span>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={5} className="text-center p-4 text-body-secondary">No assignments allocated by this staff member.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                     </div>
                </div>
            </div>
        </div>
    );
};

export default StaffProfileView;