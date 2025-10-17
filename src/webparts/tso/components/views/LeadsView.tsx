import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";

import Table from "../common/Table";
import Modal from "../common/Modal";
import ConfirmationModal from "../common/ConfirmationModal";
import { useMockData } from "../../hooks/useMockData";
import type { Lead } from "../../types";

// Icons
const EditIcon: React.FC<{ className?: string }> = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    width="16"
    height="16"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"
    />
  </svg>
);
const DeleteIcon: React.FC<{ className?: string }> = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    width="16"
    height="16"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);
const UploadIcon: React.FC<{ className?: string }> = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    width="16"
    height="16"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
    />
  </svg>
);
const DownloadIcon: React.FC<{ className?: string }> = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    width="16"
    height="16"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
    />
  </svg>
);

// Form Components
const FormInput: React.FC<
  React.InputHTMLAttributes<HTMLInputElement> & { label: string }
> = ({ label, ...props }) => (
  <div className="mb-3">
    <label className="form-label">{label}</label>
    <input {...props} className="form-control" />
  </div>
);
const FormSelect: React.FC<
  React.SelectHTMLAttributes<HTMLSelectElement> & { label: string }
> = ({ label, children, ...props }) => (
  <div className="mb-3">
    <label className="form-label">{label}</label>
    <select {...props} className="form-select">
      {children}
    </select>
  </div>
);
const FormTextArea: React.FC<
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }
> = ({ label, ...props }) => (
  <div className="mb-3">
    <label className="form-label">{label}</label>
    <textarea {...props} rows={2} className="form-control" />
  </div>
);

const statusColors: { [key in Lead["status"]]: string } = {
  New: "text-bg-primary",
  Contacted: "text-bg-info",
  "Follow-up": "text-bg-warning",
  Converted: "text-bg-success",
  Lost: "text-bg-danger",
};

const LeadsView: React.FC<{ data: ReturnType<typeof useMockData> }> = ({
  data,
}) => {
  const { leads, courses, staff, addLead, updateLead, deleteLead } = data;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormatModalOpen, setIsFormatModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialFormState: Omit<Lead, "id"> = {
    name: "",
    email: "",
    phone: "",
    interestedCourseId: "",
    source: "Walk-in",
    status: "New",
    enquiryDate: new Date().toISOString().split("T")[0],
    nextFollowUpDate: "",
    assignedTo: "",
    comments: "",
  };
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

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
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
      alert("Please fill Name, Phone, and Interested Course.");
    }
  };

  const handleDelete = () => {
    if (leadToDelete) {
      deleteLead(leadToDelete.id);
      setLeadToDelete(null);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const dataBuffer = e.target?.result;
      // @ts-ignore
      const workbook = XLSX.read(dataBuffer, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      // @ts-ignore
      const json: any[] = XLSX.utils.sheet_to_json(worksheet);

      let successCount = 0;
      let errorCount = 0;
      let errors: string[] = [];

      console.log("Importing leads from Excel:", json);

      json.forEach((row, index) => {
        const {
          name,
          email,
          phone,
          interestedCourse,
          source,
          status,
          enquiryDate,
          comments,
          assignedTo, // 🆕 New column
        } = row;

        // ✅ Basic validation
        if (!name || !phone || !interestedCourse) {
          errorCount++;
          errors.push(
            `Row ${index + 2}: Missing required fields (name, phone, interestedCourse).`
          );
          return;
        }

        // ✅ Find matching course
        const course = courses.find(
          (c) =>
            c.name.toLowerCase() === String(interestedCourse).toLowerCase()
        );
        if (!course) {
          errorCount++;
          errors.push(
            `Row ${index + 2}: Course "${interestedCourse}" not found.`
          );
          return;
        }

        // ✅ Find matching user (assignedTo)
        let assignedToId: number | null = null;
        if (assignedTo) {
          const user = staff.find(
            (u) => u.name.toLowerCase() === String(assignedTo).toLowerCase()
          );
          if (user) {
            assignedToId = Number(user.id); // assumes `staff` have `id` field
          } else {
            errors.push(
              `Row ${index + 2}: Assigned user "${assignedTo}" not found.`
            );
          }
        }

        // ✅ Convert Excel date serials to ISO string
        let formattedEnquiryDate = new Date().toISOString().split("T")[0];
        if (enquiryDate) {
          if (typeof enquiryDate === "number") {
            const jsDate = new Date((enquiryDate - 25569) * 86400 * 1000);
            formattedEnquiryDate = jsDate.toISOString().split("T")[0];
          } else if (typeof enquiryDate === "string") {
            const parsedDate = new Date(enquiryDate);
            if (!isNaN(parsedDate.getTime())) {
              formattedEnquiryDate = parsedDate.toISOString().split("T")[0];
            }
          }
        }

        // ✅ Build lead object
        const newLead: Omit<Lead, "id"> = {
          name,
          email: email || "",
          phone: String(phone),
          interestedCourseId: course.id,
          source: source || "Other",
          status: status || "New",
          enquiryDate: formattedEnquiryDate,
          comments: comments || "",
          assignedTo: assignedToId ? String(assignedToId) : undefined, // 🆕 added
        };

        console.log("Importing lead from row", index + 2, ":", newLead.assignedTo);
        addLead(newLead);
        successCount++;
      });

      // ✅ Final summary alert
      let alertMessage = `${successCount} leads imported successfully.`;
      if (errorCount > 0) {
        alertMessage += `\n${errorCount} leads failed to import.\n\nErrors:\n${errors
          .slice(0, 5)
          .join("\n")}`;
        if (errors.length > 5)
          alertMessage += `\n...and ${errors.length - 5} more errors.`;
      }
      alert(alertMessage);
    } catch (error) {
      console.error("Error parsing Excel file:", error);
      alert(
        "Failed to parse the Excel file. Please ensure it's a valid .xlsx or .xls file."
      );
    }
  };

  reader.onerror = (error) => {
    console.error("Error reading file:", error);
    alert("Failed to read the file.");
  };

  reader.readAsBinaryString(file);
  event.target.value = ""; // Reset file input
};

  const handleDownloadSample = () => {
    const sampleData = [
      {
        name: "John Smith",
        email: "john.smith@example.com",
        phone: "1234567890",
        interestedCourse: courses[0]?.name || "Sample Course Name",
        source: "Website",
        status: "New",
        enquiryDate: "2024-07-25",
        comments: "Called to ask about timings.",
      },
    ];

    // @ts-ignore
    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    // @ts-ignore
    const workbook = XLSX.utils.book_new();
    // @ts-ignore
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");
    // @ts-ignore
    XLSX.writeFile(workbook, "talent_shapers_leads_template.xlsx");
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2">Leads & Enquiries</h1>
        <div className="d-flex align-items-center">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: "none" }}
            accept=".xlsx, .xls"
          />
          <div className="btn-group">
            <button
              onClick={handleImportClick}
              className="btn btn-outline-secondary d-flex align-items-center"
            >
              <UploadIcon className="me-1" />
              Import
            </button>
            <button
              onClick={() => setIsFormatModalOpen(true)}
              className="btn btn-outline-secondary"
              title="View Excel format info"
            >
              ?
            </button>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="btn btn-primary ms-2"
          >
            Add New Lead
          </button>
        </div>
      </div>
      <Table
        headers={[
          "Name",
          "Interested Course",
          "Source",
          "Follow-up Date",
          "Status",
          "Actions",
        ]}
      >
        {leads.map((lead) => (
          <tr key={lead.id} className="align-middle">
            <td className="p-3">
              <div className="fw-semibold">{lead.name}</div>
              <div className="small text-body-secondary">
                {lead.email} &bull; {lead.phone}
              </div>
            </td>
            <td className="p-3">
              {courses.find((c) => c.id === lead.interestedCourseId)?.name ||
                "N/A"}
            </td>
            <td className="p-3">{lead.source}</td>
            <td className="p-3">{lead.nextFollowUpDate || "N/A"}</td>
            <td className="p-3">
              <span
                className={`badge rounded-pill ${statusColors[lead.status]}`}
              >
                {lead.status}
              </span>
            </td>
            <td className="p-3">
              <div className="d-flex gap-2">
                <button
                  onClick={() => handleOpenModal(lead)}
                  className="btn btn-sm btn-outline-secondary"
                >
                  <EditIcon />
                </button>
                <button
                  onClick={() => setLeadToDelete(lead)}
                  className="btn btn-sm btn-outline-danger"
                >
                  <DeleteIcon />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </Table>

      <Modal
        show={isFormatModalOpen}
        title="Excel Import Format Guide"
        onClose={() => setIsFormatModalOpen(false)}
      >
        <div>
          <p className="text-body-secondary">
            Please prepare your Excel file with the following columns. The
            column headers in the first row must match the "Header" name
            exactly.
          </p>
          <div className="alert alert-info small">
            <strong>Important:</strong> The value in the{" "}
            <code>interestedCourse</code> column must be the{" "}
            <strong>full name</strong> of a course that already exists in the
            system (e.g., "Web Development Bootcamp"). The match is
            case-insensitive.
          </div>
          <table className="table table-bordered table-sm small">
            <thead className="table-light">
              <tr>
                <th>Header</th>
                <th>Required?</th>
                <th>Description</th>
                <th>Example</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>name</td>
                <td>Yes</td>
                <td>Full name of the lead.</td>
                <td>
                  <code>Jane Doe</code>
                </td>
              </tr>
              <tr>
                <td>email</td>
                <td>No</td>
                <td>Email address.</td>
                <td>
                  <code>jane.doe@example.com</code>
                </td>
              </tr>
              <tr>
                <td>phone</td>
                <td>Yes</td>
                <td>Contact phone number.</td>
                <td>
                  <code>9876543210</code>
                </td>
              </tr>
              <tr>
                <td>interestedCourse</td>
                <td>Yes</td>
                <td>The exact name of the course.</td>
                <td>
                  <code>Fundamentals of Spoken English</code>
                </td>
              </tr>
              <tr>
                <td>source</td>
                <td>No</td>
                <td>
                  Lead source (e.g., Website, Walk-in). Defaults to 'Other'.
                </td>
                <td>
                  <code>Website</code>
                </td>
              </tr>
              <tr>
                <td>status</td>
                <td>No</td>
                <td>Status (e.g., New, Contacted). Defaults to 'New'.</td>
                <td>
                  <code>New</code>
                </td>
              </tr>
              <tr>
                <td>enquiryDate</td>
                <td>No</td>
                <td>Date of enquiry (YYYY-MM-DD). Defaults to today.</td>
                <td>
                  <code>2024-07-25</code>
                </td>
              </tr>
              <tr>
                <td>comments</td>
                <td>No</td>
                <td>Any additional comments.</td>
                <td>
                  <code>Interested in weekend classes.</code>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="d-flex justify-content-end pt-3 mt-3 border-top">
          <button
            type="button"
            onClick={() => setIsFormatModalOpen(false)}
            className="btn btn-secondary me-2"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleDownloadSample}
            className="btn btn-primary d-flex align-items-center"
          >
            <DownloadIcon className="me-1" />
            Download Sample
          </button>
        </div>
      </Modal>

      {leadToDelete && (
        <ConfirmationModal
          title="Delete Lead"
          message={`Are you sure you want to delete the lead for ${leadToDelete.name}?`}
          onConfirm={handleDelete}
          onCancel={() => setLeadToDelete(null)}
        />
      )}

      <Modal
        show={isModalOpen}
        title={editingLead ? "Edit Lead" : "Add New Lead"}
        onClose={handleCloseModal}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <FormInput
            label="Full Name"
            name="name"
            value={formState.name}
            onChange={handleInputChange}
            required
          />
          <div className="row">
            <div className="col-md-6">
              <FormInput
                label="Email"
                name="email"
                type="email"
                value={formState.email ?? ""}
                onChange={handleInputChange}
              />
            </div>
            <div className="col-md-6">
              <FormInput
                label="Phone"
                name="phone"
                type="tel"
                value={formState.phone}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          <FormSelect
            label="Interested Course"
            name="interestedCourseId"
            value={formState.interestedCourseId}
            onChange={handleInputChange}
            required
          >
            <option value="">Select a course</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </FormSelect>
          <div className="row">
            <div className="col-md-6">
              <FormSelect
                label="Source"
                name="source"
                value={formState.source}
                onChange={handleInputChange}
              >
                <option>Walk-in</option>
                <option>Website</option>
                <option>Referral</option>
                <option>Social Media</option>
                <option>Other</option>
              </FormSelect>
            </div>
            <div className="col-md-6">
              <FormSelect
                label="Status"
                name="status"
                value={formState.status}
                onChange={handleInputChange}
              >
                <option>New</option>
                <option>Contacted</option>
                <option>Follow-up</option>
                <option>Converted</option>
                <option>Lost</option>
              </FormSelect>
            </div>
          </div>
          <div className="row">
            <div className="col-md-6">
              <FormInput
                label="Enquiry Date"
                name="enquiryDate"
                type="date"
                value={formState.enquiryDate}
                onChange={handleInputChange}
              />
            </div>
            <div className="col-md-6">
              <FormInput
                label="Next Follow-up"
                name="nextFollowUpDate"
                type="date"
                value={formState.nextFollowUpDate ?? ""}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <FormSelect
            label="Assigned To"
            name="assignedTo"
            value={formState.assignedTo ?? ""}
            onChange={handleInputChange}
          >
            <option value="">Assign to staff...</option>
            {staff
              .filter((s) => s.role === "Counsellor" || s.role === "Sales")
              .map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
          </FormSelect>
          <FormTextArea
            label="Comments"
            name="comments"
            value={formState.comments ?? ""}
            onChange={handleInputChange}
          />
          <div className="d-flex justify-content-end pt-3 mt-3 border-top">
            <button
              type="button"
              onClick={handleCloseModal}
              className="btn btn-secondary me-2"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingLead ? "Save Changes" : "Add Lead"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default LeadsView;

