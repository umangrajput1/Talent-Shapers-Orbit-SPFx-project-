import { useEffect, useState } from "react";
import type { Student, Course } from "../types";
import { web } from "../PnpUrl";
import { Web } from "sp-pnp-js";

export const useMockData = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [trainers, setTrainers] = useState<any[]>([]);
  const [feePayments, setFeePayments] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [expenses, setExpenseData] = useState<any[]>([]);

  // expenses
  const expensesData = expenses.map((item) => ({
    id: item.Id.toString(),
    description: item.Description,
    category: item.Category,
    amount: item.Amount,
    date: item.Date.substring(0, 10),
    comments: item.Comments,
  }));
  // Upload image to Reciept picture library
  const uploadImageToLibrary = async (file: File): Promise<string> => {
    try {
      // Ensure the Reciept picture library exists
      const pictureLibrary = await web.lists.ensure(
        "Reciept",
        "Picture Library"
      );

      // Upload file to the picture library
      const uploadResult = await pictureLibrary.list.rootFolder.files.add(
        file.name,
        file,
        true
      );

      return uploadResult.data.ServerRelativeUrl;
    } catch (error: any) {
      console.log("Error uploading image to library:", error);
      throw error;
    }
  };

  // Format image URL for Hyperlink and Picture column
  const formatImageForHyperlinkPicture = (
    imageUrl: string,
    description: string = "Receipt"
  ): object | string => {
    if (!imageUrl) return "";

    // For Hyperlink and Picture column, SharePoint expects an object with Description and Url
    return {
      Description: description,
      Url: imageUrl,
    };
  };

  // Parse image URL from Hyperlink and Picture column
  const parseImageFromHyperlinkPicture = (imageData: any): string | null => {
    if (!imageData) return null;

    // Handle different data types
    if (typeof imageData === "string") {
      try {
        const parsed = JSON.parse(imageData);
        return (
          parsed.Url || parsed.url || parsed.serverRelativeUrl || imageData
        );
      } catch (error) {
        // If it's not JSON, return as direct URL
        return imageData;
      }
    } else if (typeof imageData === "object") {
      // If it's already an object, extract the URL
      return (
        imageData.Url || imageData.url || imageData.serverRelativeUrl || null
      );
    }

    return null;
  };

  // Get image URL from Reciept list
  const getImageUrl = async (imageId: string): Promise<string | null> => {
    try {
      const imageItem = await web.lists
        .getByTitle("Reciept")
        .items.getById(parseInt(imageId))
        .get();
      return imageItem.ServerRelativeUrl || null;
    } catch (error: any) {
      console.log("Error getting image URL:", error);
      return null;
    }
  };

  // Store image reference in Reciept list (optional metadata)
  const storeImageReference = async (
    serverRelativeUrl: string,
    expenseId: string
  ): Promise<string | null> => {
    try {
      const imageItem = await web.lists.getByTitle("Reciept").items.add({
        Title: `Expense_${expenseId}_${Date.now()}`,
        ServerRelativeUrl: serverRelativeUrl,
        ExpenseId: expenseId,
      });
      return imageItem.data.Id.toString();
    } catch (error: any) {
      console.log("Error storing image reference (this is optional):", error);
      // Don't throw error, just return null as this is optional metadata
      return null;
    }
  };

  // Update Expense Data
  const updateExpense = async (item: any): Promise<any> => {
    try {
      let imageUrl = item.billUrl;
      let formattedImageData: any = null;

      // If a new file is uploaded, handle it
      if (item.file && item.file instanceof File) {
        try {
          // Upload new image
          const serverRelativeUrl = await uploadImageToLibrary(item.file);
          // Store reference in Reciept list (optional)
          await storeImageReference(serverRelativeUrl, item.Id);
          imageUrl = serverRelativeUrl;
          // Format for Hyperlink and Picture column
          formattedImageData = formatImageForHyperlinkPicture(
            serverRelativeUrl,
            item.description
          );
        } catch (uploadError) {
          console.log("Error uploading new image:", uploadError);
        }
      } else if (imageUrl) {
        // If there's an existing image URL, format it
        formattedImageData = formatImageForHyperlinkPicture(
          imageUrl,
          item.description
        );
      }

      const updateData: any = {
        Title: item.description || "New Expense",
        Description: item.description,
        Category: item.category,
        Amount: Number(item.amount),
        Date: new Date(item.date).toISOString(),
        Comments: item.comments,
      };

      // Only add Reciept field if we have image data
      if (formattedImageData) {
        updateData.Reciept = formattedImageData;
      }

      const updatedRes = await web.lists
        .getById("7dc4e19a-3157-4093-9672-6e28e73434b2")
        .items.getById(item.Id)
        .update(updateData);
      await fetchExpenses();

      setExpenseData((prev) =>
        prev.map((e) => (e.Id === item.Id ? { ...e, ...updatedRes.data } : e))
      );
    } catch (error: any) {
      console.log("update expenses error :: ", error);
    }
  };

  const fetchExpenses = async () => {
    try {
      const res = await web.lists.getById("7dc4e19a-3157-4093-9672-6e28e73434b2").items.get();

      // Map expenses and parse the Hyperlink and Picture format
      const expensesWithImages = res.map((expense: any) => {
        const imageUrl = parseImageFromHyperlinkPicture(expense.Reciept);
        return {
          ...expense,
          billUrl: imageUrl,
        };
      });

      setExpenseData(expensesWithImages);
    } catch (err: any) {
      console.log("fetch expenses error :: ", err);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // Add Expense Data
  const addExpense = async (item: any): Promise<void> => {
    try {
      let imageUrl = item.billUrl;
      let formattedImageData: any = null;

      // If a file is uploaded, handle it
      if (item.file && item.file instanceof File) {
        try {
          // Upload image to picture library
          const serverRelativeUrl = await uploadImageToLibrary(item.file);
          imageUrl = serverRelativeUrl;
          // Format for Hyperlink and Picture column
          formattedImageData = formatImageForHyperlinkPicture(
            serverRelativeUrl,
            item.description
          );
        } catch (uploadError) {
          console.log("Error uploading image:", uploadError);
        }
      } else if (imageUrl) {
        // If there's an existing image URL, format it
        formattedImageData = formatImageForHyperlinkPicture(
          imageUrl,
          item.description
        );
      }

      const expenseData: any = {
        Title: item.description,
        Description: item.description,
        Category: item.category,
        Amount: Number(item.amount),
        Date: item.date,
        Comments: item.comments,
      };

      // Only add Reciept field if we have image data
      if (formattedImageData) {
        expenseData.Reciept = formattedImageData;
      }

      const res = await web.lists
        .getById("7dc4e19a-3157-4093-9672-6e28e73434b2")
        .items.add(expenseData);

      // Store image reference in Reciept list (optional metadata)
      if (imageUrl) {
        try {
          await storeImageReference(imageUrl, res.data.Id);
        } catch (updateError) {
          console.log("Error storing image reference (optional):", updateError);
        }
      }

      setExpenseData((prev) => [...prev, { ...res.data, billUrl: imageUrl }]);
    } catch (err: any) {
      console.log("add expenses error :: ", err);
    }
  };

  // Delete Expenses Data
  const deleteExpense = async (item: any): Promise<any> => {
    try {
      await web.lists
        .getById("7dc4e19a-3157-4093-9672-6e28e73434b2")
        .items.getById(item.Id)
        .delete();
      setExpenseData((prev) => prev.filter((e) => e.Id !== item.Id));
    } catch (error: any) {
      console.log("delete expenses :: ", error);
    }
  };

  // assignment

  // 🔹 Upload attachment to SharePoint list item
  const uploadAttachment = async (itemId: number, file: File, listId: string) => {
    const list = web.lists.getById(listId);

    // Delete old attachments first (to overwrite)
    const existingAttachments = await list.items.getById(itemId).attachmentFiles.get();
    for (const f of existingAttachments) {
      await list.items.getById(itemId).attachmentFiles.getByName(f.FileName).delete();
    }

    // Add new attachment
    const buffer = await file.arrayBuffer();
    const uploaded = await list.items.getById(itemId).attachmentFiles.add(file.name, buffer);
    return `${window.location.origin}${uploaded.data.ServerRelativeUrl}`;
  };

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
        Status: { results: ["Pending"] }
      });

      // 2️⃣ Upload file as attachment if present
      if (assignment.assignmentFile) {
        await uploadAttachment(addRes.data.Id, assignment.assignmentFile, listId);
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
      const items = await web.lists.getById(listId).items.select(
        "Id,Title,Course/Id,Course/Title,Student/Id,Student/Title,Trainer/Id,Trainer/Title,DueDate,Status,Attachments"
      ).expand("Course,Student,Trainer").get();

      const mappedData = await Promise.all(
        items.map(async (item: any) => {
          // Get attachments
          const attachments = item.Attachments
            ? await web.lists.getById(listId).items.getById(item.Id).attachmentFiles.get()
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
            assignmentFileUrl: attachments.length > 0 ? `${window.location.origin}${attachments[0].ServerRelativeUrl}` : "",
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
      await web.lists.getById(listId).items.getById(parseInt(assignment.id)).update({
        Title: assignment.title,
        CourseId: assignment.courseId ? parseInt(assignment.courseId) : null,
        StudentId: assignment.studentId ? parseInt(assignment.studentId) : null,
        TrainerId: assignment.trainerId ? parseInt(assignment.trainerId) : null,
        DueDate: assignment.dueDate,
        Status: assignment.status || "Pending",
      });

      // Upload new attachment if provided (overwrites old)
      if (assignment.assignmentFile) {
        await uploadAttachment(parseInt(assignment.id), assignment.assignmentFile, listId);
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
      await web.lists.getById("29c80eac-d776-4043-819a-dab43a982585").items.add({
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
        imageUrl = await uploadTrainerAttachment(item.data.Id, trainer.imageFile);
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
        imageUrl = await uploadTrainerAttachment(parseInt(trainer.id), trainer.imageFile);
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

  const fetchCourses = async (): Promise<void> => {
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
      const web = new Web('https://smalsusinfolabs.sharepoint.com/sites/TSO');

      const res = await web.lists
        .getById('25a7c502-9910-498e-898b-a0b37888a15e')
        .items
        .select(
          'Id',
          'Title',
          'emailAddress',
          'phoneNumber',
          'gender',
          'address',
          'status',
          'joinDate',
          'courses/Id',
          'courses/Title'
        )
        .expand('courses')
        .getAll();

      console.log("Raw SharePoint response:", res);

      // 🧠 map function ko async banaya hai is done
      const mappedStudents: Student[] = await Promise.all(
        res.map(async (item) => {
          let imageUrl = "";
          try {
            // Fetch attachment files for this item
            const attachments = await web.lists
              .getById('25a7c502-9910-498e-898b-a0b37888a15e')
              .items.getById(item.Id)
              .attachmentFiles.get();

            if (attachments && attachments.length > 0) {
              imageUrl = sanitizeUrl(attachments[0].ServerRelativeUrl || attachments[0].ServerRelativePath || '');
            } else {
              imageUrl = `https://i.pravatar.cc/150?u=student${item.Id}`;
            }
          } catch (err) {
            console.warn("Could not fetch attachments for item", item.Id, err);
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
            joinDate: item.joinDate ? new Date(item.joinDate).toISOString().split("T")[0] : "",
            imageUrl,
            courseIds: item.courses ? item.courses.map((c: { Id: number }) => String(c.Id)) : [],
            courseNames: item.courses ? item.courses.map((c: { Title: string }) => c.Title) : []
          };
        })
      );

      console.log("Mapped students with images:", mappedStudents);

      setStudents(mappedStudents);
      console.log("Students fetched successfully:", mappedStudents.length, "students");

      return mappedStudents;

    } catch (error) {
      console.error("fetchStudents error ::", error);
      return [];
    }
  };

  useEffect(() => {
    fetchCourses().catch(console.error);
    fetchAPIStudent().catch(console.error);
  }, []);

  const addStudent = async (data: Omit<Student, 'id'> & { imageFile?: File, imageUrl?: string }): Promise<{ success: boolean; data?: unknown; error?: unknown }> => {
    try {
      const web = new Web('https://smalsusinfolabs.sharepoint.com/sites/TSO');

      const studentData: any = {
        Title: data.name,
        emailAddress: data.email,
        phoneNumber: data.phone,
        gender: data.gender,
        address: data.address,
        status: data.status || "Active",
        joinDate: data.joinDate || new Date().toISOString().split("T")[0],
        coursesId: { results: data.courseIds?.map(id => Number(id)) || [] },
        // do NOT set profilePicture field - we will use attachment
      };

      // 1) Create item first
      const result = await web.lists
        .getById('25a7c502-9910-498e-898b-a0b37888a15e')
        .items.add(studentData);

      const newItemId = result.data.Id;

      // 2) If caller provided a File object, upload as attachment to created item
      if ((data as any).imageFile) {
        const file: File = (data as any).imageFile as File;
        await web.lists
          .getById('25a7c502-9910-498e-898b-a0b37888a15e')
          .items
          .getById(newItemId)
          .attachmentFiles.add(file.name, file);
      } else if (data.imageUrl && data.imageUrl.startsWith('data:')) {
        // optional: handle base64 by converting to File then attach
        const blob = dataUrlToBlob(data.imageUrl);
        const fileName = `student_${Date.now()}.png`;
        const file = blobToFile(blob, fileName);
        await web.lists
          .getById('25a7c502-9910-498e-898b-a0b37888a15e')
          .items
          .getById(newItemId)
          .attachmentFiles.add(file.name, file);
      }

      // Refresh local data
      await fetchAPIStudent();

      return { success: true, data: result };
    } catch (error) {
      console.error("addStudent (attachments) error ::", error);
      return { success: false, error: error };
    }
  };

  const updateStudent = async (updatedStudent: Student & { imageFile?: File, imageUrl?: string }): Promise<{ success: boolean; error?: unknown }> => {
    try {
      const web = new Web('https://smalsusinfolabs.sharepoint.com/sites/TSO');

      const updateData: any = {
        Title: updatedStudent.name,
        emailAddress: updatedStudent.email,
        phoneNumber: updatedStudent.phone,
        gender: updatedStudent.gender,
        address: updatedStudent.address,
        status: updatedStudent.status,
        joinDate: updatedStudent.joinDate,
        coursesId: { results: updatedStudent.courseIds?.map(id => Number(id)) || [] }
      };

      // 1) Update list item fields (no attachment yet)
      await web.lists
        .getById('25a7c502-9910-498e-898b-a0b37888a15e')
        .items.getById(Number(updatedStudent.id))
        .update(updateData);

      // 2) If new file provided, remove old attachments and add new one
      if ((updatedStudent as any).imageFile) {
        const item = web.lists.getById('25a7c502-9910-498e-898b-a0b37888a15e').items.getById(Number(updatedStudent.id));
        // Delete existing attachments (optional, to keep single profile image)
        try {
          const existing = await item.attachmentFiles.get();
          for (const a of existing) {
            // delete by name
            await web.lists
              .getById('25a7c502-9910-498e-898b-a0b37888a15e')
              .items
              .getById(Number(updatedStudent.id))
              .attachmentFiles.getByName(a.FileName)
              .delete();
          }
        } catch (err) {
          console.warn("Could not delete existing attachments", err);
        }

        // Add new
        const file: File = (updatedStudent as any).imageFile as File;
        await web.lists
          .getById('25a7c502-9910-498e-898b-a0b37888a15e')
          .items
          .getById(Number(updatedStudent.id))
          .attachmentFiles.add(file.name, file);
      }

      // Refresh local data after update
      await fetchAPIStudent();

      return { success: true };
    } catch (error) {
      console.error("updateStudent (attachments) error ::", error);
      return { success: false, error: error };
    }
  };


  const deleteStudent = async (studentId: string): Promise<{ success: boolean; error?: unknown }> => {
    try {
      const web = new Web('https://smalsusinfolabs.sharepoint.com/sites/TSO');

      await web.lists
        .getById('25a7c502-9910-498e-898b-a0b37888a15e')
        .items.getById(Number(studentId))
        .delete();

      console.log("Student deleted successfully!");

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
    getAssignments,
    expensesData,
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
    uploadImageToLibrary,
    getImageUrl,
    storeImageReference,
    formatImageForHyperlinkPicture,
    parseImageFromHyperlinkPicture,
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
