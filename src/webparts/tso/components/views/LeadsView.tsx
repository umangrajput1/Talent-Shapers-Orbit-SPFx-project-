
import React, { useState } from 'react';
import Table from '../common/Table';
import Modal from '../common/Modal';
import ConfirmationModal from '../common/ConfirmationModal';
import { useMockData } from '../../hooks/useMockData';
import type { Lead } from '../../types';

// Icons
const EditIcon: React.FC<{className?: string}> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="16" height="16"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>
);
const DeleteIcon: React.FC<{className?: string}> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="16" height="16"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
);

// Form Components
const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => (
    <div className="mb-3">
        <label className="form-label">{label}</label>
        <input {...props} className="form-control" />
    </div>
);
const FormSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label: string }> = ({ label, children, ...props }) => (
    <div className="mb-3">
        <label className="form-label">{label}</label>
        <select {...props} className="form-select">
            {children}
        </select>
    </div>
);
const FormTextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }> = ({ label, ...props }) => (
    <div className="mb-3">
        <label className="form-label">{label}</label>
        <textarea {...props} rows={2} className="form-control" />
    </div>
);

const statusColors: { [key in Lead['status']]: string } = {
    'New': 'text-bg-primary',
    'Contacted': 'text-bg-info',
    'Follow-up': 'text-bg-warning',
    'Converted': 'text-bg-success',
    'Lost': 'text-bg-danger',
};

const LeadsView: React.FC<{ data: ReturnType<typeof useMockData> }> = ({ data }) => {
    const { leads, courses, staff, addLead, updateLead, deleteLead } = data;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLead, setEditingLead] = useState<Lead | null>(null);
    const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);

    const initialFormState: any = { name: '', email: '', phone: '', interestedCourseId: '', source: 'Walk-in', status: 'New', enquiryDate: new Date().toISOString().split('T')[0], nextFollowUpDate: '', assignedTo: '', comments: '' };
    const [formState, setFormState] = useState(initialFormState);
    const handleOpenModal = (lead: Lead | null = null) => {
        if (lead) {
            setEditingLead(lead);
            setFormState(lead);
        } else {
            setEditingLead(null);
            setFormState(initialFormState);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => setIsModalOpen(false);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    const handleSubmit = () => {
        if (formState.name && formState.phone && formState.interestedCourseId) {
            if (editingLead) {
                updateLead(formState as Lead);
            } else {
                addLead(formState);
            }
            handleCloseModal();
        } else {
            alert('Please fill Name, Phone, and Interested Course.');
        }
    };

    const handleDelete = () => {
        if (leadToDelete) {
            deleteLead(leadToDelete.id);
            setLeadToDelete(null);
        }
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="h2">Leads & Enquiries</h1>
                <button onClick={() => handleOpenModal()} className="btn btn-primary">
                    Add New Lead
                </button>
            </div>
            <Table headers={['Name', 'Interested Course', 'Source', 'Follow-up Date', 'Status', 'Actions']}>
                {leads.map(lead => (
                    <tr key={lead.id} className="align-middle">
                        <td className="p-3">
                            <div className="fw-semibold">{lead.name}</div>
                            <div className="small text-body-secondary">{lead.email} &bull; {lead.phone}</div>
                        </td>
                        <td className="p-3">{courses.find(c => c.id === lead.interestedCourseId)?.name || 'N/A'}</td>
                        <td className="p-3">{lead.source}</td>
                        <td className="p-3">{lead.nextFollowUpDate || 'N/A'}</td>
                        <td className="p-3">
                            <span className={`badge rounded-pill ${statusColors[lead.status]}`}>
                                {lead.status}
                            </span>
                        </td>
                        <td className="p-3">
                            <div className="d-flex gap-2">
                                <button onClick={() => handleOpenModal(lead)} className="btn btn-sm btn-outline-secondary"><EditIcon /></button>
                                <button onClick={() => setLeadToDelete(lead)} className="btn btn-sm btn-outline-danger"><DeleteIcon /></button>
                            </div>
                        </td>
                    </tr>
                ))}
            </Table>
            
            {leadToDelete && (
                <ConfirmationModal
                    title="Delete Lead"
                    message={`Are you sure you want to delete the lead for ${leadToDelete.name}?`}
                    onConfirm={handleDelete}
                    onCancel={() => setLeadToDelete(null)}
                />
            )}

            <Modal show={isModalOpen} title={editingLead ? 'Edit Lead' : 'Add New Lead'} onClose={handleCloseModal}>
                <form onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
                    <FormInput label="Full Name" name="name" value={formState.name} onChange={handleInputChange} required />
                    <div className="row">
                        <div className="col-md-6"><FormInput label="Email" name="email" type="email" value={formState.email} onChange={handleInputChange} /></div>
                        <div className="col-md-6"><FormInput label="Phone" name="phone" type="tel" value={formState.phone} onChange={handleInputChange} required /></div>
                    </div>
                    <FormSelect label="Interested Course" name="interestedCourseId" value={formState.interestedCourseId} onChange={handleInputChange} required>
                        <option value="">Select a course</option>
                        {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </FormSelect>
                    <div className="row">
                        <div className="col-md-6">
                            <FormSelect label="Source" name="source" value={formState.source} onChange={handleInputChange}>
                                <option>Walk-in</option><option>Website</option><option>Referral</option><option>Social Media</option><option>Other</option>
                            </FormSelect>
                        </div>
                         <div className="col-md-6">
                            <FormSelect label="Status" name="status" value={formState.status} onChange={handleInputChange}>
                                <option>New</option><option>Contacted</option><option>Follow-up</option><option>Converted</option><option>Lost</option>
                            </FormSelect>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6"><FormInput label="Enquiry Date" name="enquiryDate" type="date" value={formState.enquiryDate} onChange={handleInputChange} /></div>
                        <div className="col-md-6"><FormInput label="Next Follow-up" name="nextFollowUpDate" type="date" value={formState.nextFollowUpDate ?? ''} onChange={handleInputChange} /></div>
                    </div>
                    <FormSelect label="Assigned To" name="assignedTo" value={formState.assignedTo ?? ''} onChange={handleInputChange}>
                        <option value="">Assign to staff...</option>
                        {staff.filter(s => s.role === 'Counsellor' || s.role === 'Sales').map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </FormSelect>
                    <FormTextArea label="Comments" name="comments" value={formState.comments ?? ''} onChange={handleInputChange} />
                    <div className="d-flex justify-content-end pt-3 mt-3 border-top">
                        <button type="button" onClick={handleCloseModal} className="btn btn-secondary me-2">Cancel</button>
                        <button type="submit" className="btn btn-primary">{editingLead ? 'Save Changes' : 'Add Lead'}</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default LeadsView;
