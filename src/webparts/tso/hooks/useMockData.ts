import { useEffect, useState } from "react";
import type { Student, Course, Staff, Batch, Lead } from "../types";
import { web } from "../PnpUrl";
import { Web } from "sp-pnp-js";

const initialStaff: Staff[] = [
  { id: 'TSO-STF-001', name: 'John Doe', email: 'john.doe@example.com', role: 'Trainer', expertise: ['c1', 'c2'], phone: '555-0101', address: '123 Grammar Lane', imageUrl: `https://i.pravatar.cc/150?u=t1`, gender: 'Male', status: 'Active', about: 'John is a certified ESL instructor with over 10 years of experience helping students gain confidence in their English speaking and listening skills.', joiningDate: '2022-08-01', employmentType: 'Full-time', salary: 50000, salaryType: 'Monthly' },
  { id: 'TSO-STF-002', name: 'Jane Smith', email: 'jane.smith@example.com', role: 'Trainer', expertise: ['c3', 'c4'], phone: '555-0102', address: '456 Code Street', imageUrl: `https://i.pravatar.cc/150?u=t2`, gender: 'Female', status: 'Active', about: 'A full-stack developer with a passion for teaching, Jane specializes in modern web technologies like React, Node.js, and cloud deployment.', joiningDate: '2021-11-15', employmentType: 'Part-time', salary: 800, salaryType: 'Hourly' },
  { id: 'TSO-STF-003', name: 'Peter Jones', email: 'peter.jones@example.com', role: 'Counsellor', phone: '555-0103', address: '789 Advice Avenue', imageUrl: `https://i.pravatar.cc/150?u=t3`, gender: 'Male', status: 'Active', about: 'Peter has a background in psychology and helps students choose the right career path and courses.', joiningDate: '2023-01-20', employmentType: 'Full-time', salary: 45000, salaryType: 'Monthly' },
];

const today = new Date();
const pastDate = new Date();
pastDate.setDate(today.getDate() - 15);
const futureDate = new Date();
futureDate.setDate(today.getDate() + 15);
const veryFutureDate = new Date();
veryFutureDate.setDate(today.getDate() + 45); // For testing upcoming payments > 30 days

const initialBatches: Batch[] = [
    { id: 'b1', name: 'Morning English (A)', courseId: 'c1', staffId: 'TSO-STF-001', weekdays: ['Mon', 'Wed', 'Fri'], time: '08:00 - 10:00', startDate: '2023-01-15', status: 'Ongoing' },
    { id: 'b2', name: 'Afternoon Computing (A)', courseId: 'c3', staffId: 'TSO-STF-002', weekdays: ['Tue', 'Thu'], time: '13:00 - 15:00', startDate: '2023-02-20', status: 'Ongoing' },
    { id: 'b3', name: 'Evening Web Dev (A)', courseId: 'c4', staffId: 'TSO-STF-002', weekdays: ['Mon', 'Wed', 'Fri'], time: '17:00 - 19:00', startDate: '2023-03-01', status: 'Completed' },
    { id: 'b4', name: 'Advanced English (B)', courseId: 'c2', staffId: 'TSO-STF-001', weekdays: ['Tue', 'Thu', 'Sat'], time: '10:00 - 12:00', startDate: '2024-08-01', status: 'Upcoming' },
];

const initialLeads: Lead[] = [
    { id: 'l1', name: 'Potential Pete', email: 'pete@example.com', phone: '987-654-3210', interestedCourseId: 'c4', source: 'Website', status: 'New', enquiryDate: today.toISOString().split('T')[0], nextFollowUpDate: futureDate.toISOString().split('T')[0], assignedTo: 'TSO-STF-003' },
    { id: 'l2', name: 'Contacted Carla', email: 'carla@example.com', phone: '876-543-2109', interestedCourseId: 'c1', source: 'Walk-in', status: 'Contacted', enquiryDate: pastDate.toISOString().split('T')[0] },
    { id: 'l3', name: 'Converted Chris', email: 'chris@example.com', phone: '765-432-1098', interestedCourseId: 'c2', source: 'Referral', status: 'Converted', enquiryDate: '2024-05-01' },
];

export const useMockData = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [trainers, setTrainers] = useState<any[]>([]);
  const [feePayments, setFeePayments] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [expenses, setExpenseData] = useState<any[]>([]);
  const [staff, setStaff] = useState<Staff[]>(initialStaff);
  const [batches, setBatches] = useState<Batch[]>(initialBatches);
  const [leads, setLeads] = useState<Lead[]>(initialLeads);

    const createId = (prefix: string) => `${prefix}${Date.now()}`;
    // const getCurrentDate = () => new Date().toISOString().split('T')[0];

    const generateUniqueId = (prefix: string, items: {id: string}[]) => {
        const fullPrefix = `TSO-${prefix}-`;
         if (!items.length) {
            return `${fullPrefix}001`;
        }
        const maxIdNum = items
            .map(s => parseInt(s.id.replace(fullPrefix, ''), 10))
            .filter(num => !isNaN(num))
            .reduce((max, current) => Math.max(max, current), 0);
        
        const nextIdNum = maxIdNum + 1;
        return `${fullPrefix}${String(nextIdNum).padStart(3, '0')}`;
    };

    const addStaff = (data: Omit<Staff, 'id'>) => {
        const newStaff: Staff = { ...data, id: generateUniqueId('STF', staff) };
        setStaff(prev => [...prev, newStaff]);
    };
     const updateStaff = (updatedStaff: Staff) => {
        setStaff(prev => prev.map(t => t.id === updatedStaff.id ? updatedStaff : t));
    };
    const deleteStaff = (staffId: string) => {
        setStaff(prev => prev.filter(t => t.id !== staffId));
    };

        const addLead = (data: Omit<Lead, 'id'>) => {
        const newLead: Lead = { ...data, id: createId('l') };
        setLeads(prev => [...prev, newLead]);
    };
    const updateLead = (updatedLead: Lead) => {
        setLeads(prev => prev.map(l => l.id === updatedLead.id ? updatedLead : l));
    };
    const deleteLead = (leadId: string) => {
        setLeads(prev => prev.filter(l => l.id !== leadId));
    };

        const addBatch = (data: Omit<Batch, 'id'>) => {
        const newBatch: Batch = { ...data, id: createId('b') };
        setBatches(prev => [...prev, newBatch]);
    };
    const updateBatch = (updatedBatch: Batch) => {
        setBatches(prev => prev.map(b => b.id === updatedBatch.id ? updatedBatch : b));
    };
    const deleteBatch = (batchId: string) => {
        setBatches(prev => prev.filter(b => b.id !== batchId));
        // Also remove this batch from any students
        // setStudents(prevStudents => prevStudents.map(s => ({
        //     ...s,
        //     batchIds: s.batchIds?.filter((id:any) => id !== batchId)
        // })));
    };



  // expenses

  const expensesData = expenses.map((item) => ({
    id: item.Id.toString(),
    description: item.Description,
    category: item.Category,
    amount: item.Amount,
    date: item.Date.substring(0, 10),
    comments: item.Comments,
  }));

  const fetchExpenses = async () => {
    try {
      const res = await web.lists
        .getById("7dc4e19a-3157-4093-9672-6e28e73434b2")
        .items.select(
          "Id,Title,Description,Category,Amount,Date,Comments,Attachments"
        )
        .expand("AttachmentFiles") // ensures attachment files are fetched
        .get();

      const mappedExpenses = await Promise.all(
        res.map(async (item: any) => {
          // Fetch attachments if any
          const attachments = item.Attachments
            ? await web.lists
                .getById("7dc4e19a-3157-4093-9672-6e28e73434b2")
                .items.getById(item.Id)
                .attachmentFiles.get()
            : [];

          return {
            Id: item.Id,
            Title: item.Title,
            Description: item.Description || item.Title,
            Category: item.Category,
            Amount: item.Amount,
            Date: item.Date ? item.Date.substring(0, 10) : "",
            Comments: item.Comments,
            Attachments: attachments,
            AttachmentUrls:
              attachments.length > 0
                ? attachments.map(
                    (att: any) =>
                      `${window.location.origin}${att.ServerRelativeUrl}`
                  )
                : [],
          };
        })
      );
      setExpenseData(mappedExpenses);
    } catch (error: any) {
      console.error("Error fetching expenses:", error);
    }
  };
  
  //upload
  const uploadAttachment = async (
    listId: string,
    file: File,
    itemId: number
  ) => {
    const list = web.lists.getById(listId);

    // Delete old attachments first (to overwrite)
    const existingAttachments = await list.items
      .getById(itemId)
      .attachmentFiles.get();
    for (const f of existingAttachments) {
      await list.items
        .getById(itemId)
        .attachmentFiles.getByName(f.FileName)
        .delete();
    }

    // Add new attachment
    const buffer = await file.arrayBuffer();
    const uploaded = await list.items
      .getById(itemId)
      .attachmentFiles.add(file.name, buffer);
    return `${window.location.origin}${uploaded.data.ServerRelativeUrl}`;
  };

  const addExpense = async (item: any) => {
    const listId = "7dc4e19a-3157-4093-9672-6e28e73434b2";
    try {
      const newItem = {
        Title: item.description,
        Description: item.description,
        Category: item.category,
        Amount: Number(item.amount),
        Date: item.date,
        Comments: item.comments,
      };

      const res = await web.lists
        .getById("7dc4e19a-3157-4093-9672-6e28e73434b2")
        .items.add(newItem);

      if (item.file && item.file instanceof File) {
        await uploadAttachment(listId, item.file, res.data.Id); // Upload attachment
      }

      await fetchExpenses();
    } catch (err: any) {
      console.error("Error adding expense:", err);
    }
  };

  const updateExpense = async (item: any) => {
    const listId = "7dc4e19a-3157-4093-9672-6e28e73434b2";
    try {
      const updateData = {
        Title: item.description,
        Description: item.description,
        Category: item.category,
        Amount: Number(item.amount),
        Date: item.date,
        Comments: item.comments,
      };

      await web.lists
        .getById("7dc4e19a-3157-4093-9672-6e28e73434b2")
        .items.getById(item.Id)
        .update(updateData);

      if (item.file && item.file instanceof File) {
        await uploadAttachment(listId, item.file, item.Id);
      }

      await fetchExpenses();
    } catch (err: any) {
      console.error("Error updating expense:", err);
    }
  };

  const deleteExpense = async (item: any) => {
    try {
      await web.lists
        .getById("7dc4e19a-3157-4093-9672-6e28e73434b2")
        .items.getById(item.Id)
        .delete();

      setExpenseData((prev) => prev.filter((e) => e.Id !== item.Id));
    } catch (err: any) {
      console.error("Error deleting expense:", err);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // assignment

  // 🔹 Upload attachment to SharePoint list item
  // const uploadAttachment = async (itemId: number, file: File, listId: string) => {
  //   const list = web.lists.getById(listId);

  //   // Delete old attachments first (to overwrite)
  //   const existingAttachments = await list.items.getById(itemId).attachmentFiles.get();
  //   for (const f of existingAttachments) {
  //     await list.items.getById(itemId).attachmentFiles.getByName(f.FileName).delete();
  //   }

  //   // Add new attachment
  //   const buffer = await file.arrayBuffer();
  //   const uploaded = await list.items.getById(itemId).attachmentFiles.add(file.name, buffer);
  //   return `${window.location.origin}${uploaded.data.ServerRelativeUrl}`;
  // };

  // 🔹 CREATE
  const addAssignment = async (assignment: any) => {
    try {
      const listId = "1d5452dc-7b1d-430b-b316-0680492ffd48";
      // 1️⃣ Create item without file first
      const addRes = await web.lists.getById(listId).items.add({
        Title: assignment.title,
        CourseId: assignment.courseId ? parseInt(assignment.courseId) : null,
        StudentId: assignment.studentId ? parseInt(assignment.studentId) : null,
        TrainerId: assignment.trainerId ? parseInt(assignment.trainerId) : null,
        DueDate: assignment.dueDate,
        Status: assignment.status || "Pending",
      });

      // 2️⃣ Upload file as attachment if present
      if (assignment.assignmentFile) {
        await uploadAttachment(
          listId,
          assignment.assignmentFile,
          addRes.data.Id
        );
      }

      await getAssignments();
    } catch (err) {
      console.error("Error adding assignment:", err);
    }
  };

  // 🔹 READ
  const getAssignments = async () => {
    try {
      const listId = "1d5452dc-7b1d-430b-b316-0680492ffd48";
      const items = await web.lists
        .getById(listId)
        .items.select(
          "Id,Title,Course/Id,Course/Title,Student/Id,Student/Title,Trainer/Id,Trainer/Title,DueDate,Status,Attachments"
        )
        .expand("Course,Student,Trainer")
        .get();

      const mappedData = await Promise.all(
        items.map(async (item: any) => {
          // Get attachments
          const attachments = item.Attachments
            ? await web.lists
                .getById(listId)
                .items.getById(item.Id)
                .attachmentFiles.get()
            : [];

          return {
            id: item.Id.toString(),
            title: item.Title,
            courseId: item.Course?.Id?.toString() || "",
            courseName: item.Course?.Title || "",
            studentId: item.Student?.Id?.toString() || "",
            studentName: item.Student?.Title || "",
            trainerId: item.Trainer?.Id?.toString() || "",
            trainerName: item.Trainer?.Title || "",
            dueDate: item.DueDate,
            status: item.Status || "Pending",
            attachmentFiles: attachments, // array of attachments
            assignmentFileUrl:
              attachments.length > 0
                ? `${window.location.origin}${attachments[0].ServerRelativeUrl}`
                : "",
          };
        })
      );

      setAssignments(mappedData);
    } catch (err) {
      console.error("Error fetching assignments:", err);
      throw err;
    }
  };

  // 🔹 UPDATE
  const updateAssignment = async (assignment: any) => {
    try {
      const listId = "1d5452dc-7b1d-430b-b316-0680492ffd48";

      // Update item fields first
      await web.lists
        .getById(listId)
        .items.getById(parseInt(assignment.id))
        .update({
          Title: assignment.title,
          CourseId: assignment.courseId ? parseInt(assignment.courseId) : null,
          StudentId: assignment.studentId
            ? parseInt(assignment.studentId)
            : null,
          TrainerId: assignment.trainerId
            ? parseInt(assignment.trainerId)
            : null,
          DueDate: assignment.dueDate,
          Status: assignment.status || "Pending",
        });

      // Upload new attachment if provided (overwrites old)
      if (assignment.assignmentFile) {
        await uploadAttachment(
          listId,
          assignment.assignmentFile,
          parseInt(assignment.id)
        );
      }

      await getAssignments();
    } catch (err) {
      console.error("Error updating assignment:", err);
      throw err;
    }
  };

  // 🔹 DELETE
  const deleteAssignment = async (id: string) => {
    try {
      const listId = "1d5452dc-7b1d-430b-b316-0680492ffd48";
      await web.lists.getById(listId).items.getById(parseInt(id)).delete();
      await getAssignments();
    } catch (err) {
      console.error("Error deleting assignment:", err);
      throw err;
    }
  };

  // 🔹 Call getAssignments on mount
  useEffect(() => {
    getAssignments();
  }, []);

  // payment module

  // Fetch fee payments with student lookup
  const fetchFeePayments = async () => {
    try {
      const items = await web.lists
        .getById("29c80eac-d776-4043-819a-dab43a982585")
        .items.select(
          "Id,Title,Student/ID,Student/Title,Amount,Date,Status,PaymentMethod"
        )
        .expand("Student")
        .get();

      const mapped = items.map((item: any) => ({
        id: item.Id.toString(),
        studentId: item.Student.ID.toString() || "",
        amount: Number(item.Amount),
        date: item.Date ? item.Date.split("T")[0] : "",
        status: item.Status,
        paymentMethod: item.PaymentMethod,
        studentName: item.StudentId?.Title || "",
      }));
      setFeePayments(mapped);
    } catch (err) {
      console.error("Error fetching fee payments:", err);
    }
  };

  useEffect(() => {
    fetchFeePayments();
  }, []);

  // Add Fee Payment
  const addFeePayment = async (data: any) => {
    try {
      await web.lists
        .getById("29c80eac-d776-4043-819a-dab43a982585")
        .items.add({
          Title: "Fee Payment",
          StudentId: parseInt(data.studentId),
          Amount: data.amount,
          Date: data.date,
          Status: data.status,
          PaymentMethod: data.paymentMethod,
        });
      await fetchFeePayments();
    } catch (err) {
      console.error("Error adding fee payment:", err);
    }
  };

  // Update Fee Payment
  const updateFeePayment = async (updatedPayment: any) => {
    try {
      await web.lists
        .getById("29c80eac-d776-4043-819a-dab43a982585")
        .items.getById(parseInt(updatedPayment.id))
        .update({
          StudentId: parseInt(updatedPayment.studentId),
          Amount: updatedPayment.amount,
          Date: updatedPayment.date,
          Status: updatedPayment.status,
          PaymentMethod: updatedPayment.paymentMethod,
        });

      await fetchFeePayments();
    } catch (err) {
      console.error("Error updating fee payment:", err);
    }
  };

  // Delete Fee Payment
  const deleteFeePayment = async (paymentId: string) => {
    try {
      await web.lists
        .getById("29c80eac-d776-4043-819a-dab43a982585")
        .items.getById(parseInt(paymentId))
        .delete();
      setFeePayments((prev) => prev.filter((p) => p.id !== paymentId));
    } catch (err) {
      console.error("Error deleting fee payment:", err);
    }
  };

  // trainer model
  useEffect(() => {
    const getTrainers = async (): Promise<void> => {
      try {
        const list = await web.lists
          .getById("ed766b42-ed7b-4f73-874e-ed69f7f44975")
          .items.select(
            "Id,Title,FullName,Email,Phone,Gender,Address,Expertise/Id,Expertise/Title,Attachments"
          )
          .expand("Expertise")
          .get();

        const formatted = await Promise.all(
          list.map(async (item: any) => {
            // Get attachments if any
            const attachments = item.Attachments
              ? await web.lists
                  .getById("ed766b42-ed7b-4f73-874e-ed69f7f44975")
                  .items.getById(item.Id)
                  .attachmentFiles.get()
              : [];

            // Take first attachment as profile picture (if multiple)
            const imageUrl =
              attachments.length > 0
                ? `${window.location.origin}${attachments[0].ServerRelativeUrl}`
                : "";

            return {
              id: item.Id.toString(),
              name: item.FullName,
              email: item.Email,
              phone: item.Phone,
              address: item.Address,
              gender: item.Gender,
              imageUrl,
              expertise: item.Expertise.map((ex: any) => ex.Id.toString()),
              attachments, // store all attachments
            };
          })
        );

        setTrainers(formatted);
      } catch (err) {
        console.error("Error fetching trainers:", err);
      }
    };

    getTrainers();
  }, []);

  const uploadTrainerAttachment = async (itemId: number, file: File) => {
    // Delete old attachment if exists
    const attachments = await web.lists
      .getById("ed766b42-ed7b-4f73-874e-ed69f7f44975")
      .items.getById(itemId)
      .attachmentFiles.get();

    for (const f of attachments) {
      await web.lists
        .getById("ed766b42-ed7b-4f73-874e-ed69f7f44975")
        .items.getById(itemId)
        .attachmentFiles.getByName(f.FileName)
        .delete();
    }

    // Add new attachment
    const buffer = await file.arrayBuffer();
    const uploaded = await web.lists
      .getById("ed766b42-ed7b-4f73-874e-ed69f7f44975")
      .items.getById(itemId)
      .attachmentFiles.add(file.name, buffer);

    return `${window.location.origin}${uploaded.data.ServerRelativeUrl}`;
  };

  // 🔹 Add a new trainer
  const addTrainer = async (trainer: any) => {
    try {
      const item = await web.lists
        .getById("ed766b42-ed7b-4f73-874e-ed69f7f44975")
        .items.add({
          Title: trainer.name,
          FullName: trainer.name,
          Email: trainer.email,
          Phone: trainer.phone,
          Address: trainer.address,
          Gender: trainer.gender,
          ExpertiseId: {
            results: trainer.expertise.map((id: any) => parseInt(id)),
          },
        });

      let imageUrl = "";
      if (trainer.imageFile) {
        imageUrl = await uploadTrainerAttachment(
          item.data.Id,
          trainer.imageFile
        );
      }

      const newTrainer = {
        ...trainer,
        id: item.data.Id.toString(),
        imageUrl,
      };
      setTrainers([...trainers, newTrainer]);
    } catch (err) {
      console.error("Error adding trainer:", err);
    }
  };
  // 🔹 Update trainer
  const updateTrainer = async (trainer: any): Promise<void> => {
    try {
      await web.lists
        .getById("ed766b42-ed7b-4f73-874e-ed69f7f44975")
        .items.getById(parseInt(trainer.id))
        .update({
          FullName: trainer.name,
          Email: trainer.email,
          Phone: trainer.phone,
          Address: trainer.address,
          Gender: trainer.gender,
          ExpertiseId: {
            results: trainer.expertise.map((id: any) => parseInt(id)),
          },
        });

      let imageUrl = trainer.imageUrl || "";
      if (trainer.imageFile) {
        imageUrl = await uploadTrainerAttachment(
          parseInt(trainer.id),
          trainer.imageFile
        );
      }

      const updatedTrainer = {
        ...trainer,
        imageUrl,
      };

      setTrainers(
        trainers.map((t) => (t.id === trainer.id ? updatedTrainer : t))
      );
    } catch (err) {
      console.error("Error updating trainer:", err);
    }
  };

  // 🔹 Delete trainer
  const deleteTrainer = async (id: string): Promise<void> => {
    try {
      await web.lists
        .getById("ed766b42-ed7b-4f73-874e-ed69f7f44975")
        .items.getById(parseInt(id))
        .delete();

      setTrainers(trainers.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Error deleting trainer:", err);
    }
  };
  /// gajendra

  const sanitizeUrl = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    if (url.startsWith("https//")) return url.replace("https//", "https://");
    return `${window.location.origin}${url}`;
  };

  const dataUrlToBlob = (dataUrl: string): Blob => {
    // data:[<mediatype>][;base64],<data>
    const arr = dataUrl.split(",");
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : "image/png";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  const blobToFile = (blob: Blob, fileName: string): File => {
    return new File([blob], fileName, { type: blob.type });
  };

  const fetchAPIData = async (): Promise<void> => {
    try {
      const web = new Web("https://smalsusinfolabs.sharepoint.com/sites/TSO");
      const res = await web.lists
        .getById("023e9425-6982-4e89-87d9-b1dd8534bf96")
        .items.getAll();
      const mappedCourses: Course[] = res.map((item) => ({
        id: String(item.Id),
        name: item.Title,
        category: item.category || "",
        level: item.level || "",
        duration: item.duration || "",
        totalFee: item.totalFee || 0,
      }));
      setCourses(mappedCourses);
    } catch (error) {
      console.error("fetchCourses error ::", error);
    }
  };

  const fetchAPIStudent = async (): Promise<Student[]> => {
    try {
      const web = new Web("https://smalsusinfolabs.sharepoint.com/sites/TSO");

      const res = await web.lists
        .getById("25a7c502-9910-498e-898b-a0b37888a15e")
        .items.select(
          "Id",
          "Title",
          "emailAddress",
          "phoneNumber",
          "gender",
          "address",
          "status",
          "profilePicture",
          "joinDate",
          "courses/Id",
          "courses/Title"
        )
        .expand("courses")
        .getAll();

      const mappedStudents: any = res.map((item) => {
        // Prefer profilePicture.Url if available (Picture/Hyperlink field), otherwise try fileName fallback
        let imageUrl = "";
        if (item.profilePicture && item.profilePicture.Url) {
          imageUrl = sanitizeUrl(item.profilePicture.Url);
        } else if (item.profilePicture && item.profilePicture.fileName) {
          // Fallback to the thumbnails path if your library creates thumbnails this way
          imageUrl = `https://smalsusinfolabs.sharepoint.com/sites/TSO/Pictures/Forms/Thumbnails/StudentImage/${item.profilePicture.fileName}`;
        } else {
          // Default placeholder
          imageUrl = `https://i.pravatar.cc/150?u=student${item.Id}`;
        }

        return {
          id: String(item.Id),
          name: item.Title || "",
          email: item.emailAddress || "",
          phone: String(item.phoneNumber || ""),
          gender: item.gender || "",
          address: item.address || "",
          status: item.status || "Active",
          joinDate: item.joinDate
            ? new Date(item.joinDate).toISOString().split("T")[0]
            : "",
          imageUrl, // Use constructed/sanitized URL
          courseIds: item.courses
            ? item.courses.map((c: { Id: number }) => String(c.Id))
            : [],
          courseNames: item.courses
            ? item.courses.map((c: { Title: string }) => c.Title)
            : [],
        };
      });

      setStudents(mappedStudents);
      return mappedStudents;
    } catch (error) {
      console.error("fetchStudents error ::", error);
      return [];
    }
  };

  // Upload helper for student images
  const uploadStudentImage = async (file: File) => {
    const web = new Web("https://smalsusinfolabs.sharepoint.com/sites/TSO");
    const folder = web.getFolderByServerRelativeUrl(
      "/sites/TSO/Pictures/StudentImage"
    );
    const uploadedFile = await folder.files.add(file.name, file, true);
    return uploadedFile.data.ServerRelativeUrl; // ServerRelativeUrl
  };

  useEffect(() => {
    fetchAPIData().catch(console.error);
    fetchAPIStudent().catch(console.error);
  }, []);

  const addStudent = async (
    data: Omit<Student, "id">
  ): Promise<{ success: boolean; data?: unknown; error?: unknown }> => {
    try {
      const web = new Web("https://smalsusinfolabs.sharepoint.com/sites/TSO");

      // Prepare profilePicture field — handle File or base64 data URL or already relative URL
      let profileField: any = null;

      if ((data as any).imageFile) {
        // If caller provided a File object (recommended)
        const serverRel = await uploadStudentImage(
          (data as any).imageFile as File
        );
        profileField = { Url: serverRel, Description: "Profile Picture" };
      } else if (data.imageUrl && data.imageUrl.startsWith("data:")) {
        // If caller provided base64/data URL string
        const blob = dataUrlToBlob(data.imageUrl);
        const fileName = `student_${Date.now()}.png`;
        const file = blobToFile(blob, fileName);
        const serverRel = await uploadStudentImage(file);
        profileField = { Url: serverRel, Description: "Profile Picture" };
      } else if (
        data.imageUrl &&
        (data.imageUrl.startsWith("/") ||
          data.imageUrl.startsWith(window.location.origin))
      ) {
        // If imageUrl is already a server relative OR full URL, convert to relative for SharePoint field
        const rel = data.imageUrl.startsWith(window.location.origin)
          ? data.imageUrl.replace(window.location.origin, "")
          : data.imageUrl;
        profileField = { Url: rel, Description: "Profile Picture" };
      }

      const studentData: any = {
        Title: data.name,
        emailAddress: data.email,
        phoneNumber: data.phone,
        gender: data.gender,
        address: data.address,
        status: data.status || "Active",
        joinDate: data.joinDate || new Date().toISOString().split("T")[0],
        coursesId: { results: data.courseIds?.map((id) => Number(id)) || [] },
      };

      if (profileField) {
        studentData.profilePicture = profileField; // Picture/Hyperlink field value
      }

      const result = await web.lists
        .getById("25a7c502-9910-498e-898b-a0b37888a15e")
        .items.add(studentData);

      await fetchAPIStudent();

      return { success: true, data: result };
    } catch (error) {
      console.error("addStudent error ::", error);
      return { success: false, error: error };
    }
  };

  const updateStudent = async (
    updatedStudent: Student
  ): Promise<{ success: boolean; error?: unknown }> => {
    try {
      const web = new Web("https://smalsusinfolabs.sharepoint.com/sites/TSO");

      // Prepare profilePicture update logic
      let profileFieldUpdate: any = null;

      if ((updatedStudent as any).imageFile) {
        // If a new File object is provided
        const serverRel = await uploadStudentImage(
          (updatedStudent as any).imageFile as File
        );
        profileFieldUpdate = { Url: serverRel, Description: "Profile Picture" };
      } else if (
        updatedStudent.imageUrl &&
        updatedStudent.imageUrl.startsWith("data:")
      ) {
        // If imageUrl is base64 data, upload it
        const blob = dataUrlToBlob(updatedStudent.imageUrl);
        const fileName = `student_${Date.now()}.png`;
        const file = blobToFile(blob, fileName);
        const serverRel = await uploadStudentImage(file);
        profileFieldUpdate = { Url: serverRel, Description: "Profile Picture" };
      } else if (updatedStudent.imageUrl) {
        // If imageUrl is full URL or relative path, convert to relative path for SharePoint
        const rel = updatedStudent.imageUrl.startsWith(window.location.origin)
          ? updatedStudent.imageUrl.replace(window.location.origin, "")
          : updatedStudent.imageUrl;
        profileFieldUpdate = { Url: rel, Description: "Profile Picture" };
      }

      const updateData: any = {
        Title: updatedStudent.name,
        emailAddress: updatedStudent.email,
        phoneNumber: updatedStudent.phone,
        gender: updatedStudent.gender,
        address: updatedStudent.address,
        status: updatedStudent.status,
        joinDate: updatedStudent.joinDate,
        coursesId: {
          results: updatedStudent.courseIds?.map((id) => Number(id)) || [],
        },
      };

      if (profileFieldUpdate) {
        updateData.profilePicture = profileFieldUpdate;
      }

      await web.lists
        .getById("25a7c502-9910-498e-898b-a0b37888a15e")
        .items.getById(Number(updatedStudent.id))
        .update(updateData);

      await fetchAPIStudent();

      return { success: true };
    } catch (error) {
      console.error("updateStudent error ::", error);
      return { success: false, error: error };
    }
  };

  const deleteStudent = async (
    studentId: string
  ): Promise<{ success: boolean; error?: unknown }> => {
    try {
      const web = new Web("https://smalsusinfolabs.sharepoint.com/sites/TSO");

      await web.lists
        .getById("25a7c502-9910-498e-898b-a0b37888a15e")
        .items.getById(Number(studentId))
        .delete();

      await fetchAPIStudent();

      return { success: true };
    } catch (error) {
      console.error("deleteStudent error ::", error);
      return { success: false, error: error };
    }
  };

  const addCourse = async (data: Omit<Course, "id">): Promise<void> => {
    try {
      const web = new Web("https://smalsusinfolabs.sharepoint.com/sites/TSO");

      const res = await web.lists
        .getById("023e9425-6982-4e89-87d9-b1dd8534bf96")
        .items.add({
          Title: data.name,
          category: data.category,
          level: data.level,
          duration: data.duration,
          totalFee: data.totalFee,
        });

      // State update karne ke liye new object banao
      const newCourse: Course = {
        id: String(res.data.Id),
        name: data.name,
        category: data.category,
        level: data.level,
        duration: data.duration,
        totalFee: data.totalFee,
      };

      setCourses((prev) => [...prev, newCourse]);
    } catch (error) {
      console.error("addCourse error ::", error);
    }
  };

  const updateCourse = async (updatedCourse: Course): Promise<void> => {
    try {
      const web = new Web("https://smalsusinfolabs.sharepoint.com/sites/TSO");
      const list = web.lists.getById("023e9425-6982-4e89-87d9-b1dd8534bf96");
      await list.items.getById(Number(updatedCourse.id)).update({
        Title: updatedCourse.name, // Title column update
        category: updatedCourse.category,
        level: updatedCourse.level,
        duration: updatedCourse.duration,
        totalFee: updatedCourse.totalFee,
      });
      setCourses((prev) =>
        prev.map((c) => (c.id === updatedCourse.id ? updatedCourse : c))
      );
    } catch (error) {
      console.error("updateCourse error ::", error);
    }
  };

  const deleteCourse = async (courseId: string): Promise<void> => {
    try {
      const web = new Web("https://smalsusinfolabs.sharepoint.com/sites/TSO");

      await web.lists
        .getById("023e9425-6982-4e89-87d9-b1dd8534bf96")
        .items.getById(Number(courseId))
        .delete();

      setCourses((prev) => prev.filter((c) => c.id !== courseId));
    } catch (error) {
      console.error("deleteCourse error ::", error);
    }
  };

  return {
    expensesData,
    getAssignments,
    expenses,
        staff,
     batches,
    leads,
 addStaff,
  updateStaff,
deleteStaff,
  addLead,
updateLead,
  deleteLead,
   addBatch,
        updateBatch,
        deleteBatch,
    addExpense,
    updateExpense,
    deleteExpense,
    courses,
    trainers,
    students,
    feePayments,
    assignments,
    addStudent,
    updateStudent,
    deleteStudent,
    addTrainer,
    updateTrainer,
    deleteTrainer,
    addCourse,
    updateCourse,
    deleteCourse,
    addFeePayment,
    updateFeePayment,
    deleteFeePayment,
    addAssignment,
    updateAssignment,
    deleteAssignment,
  };
};
