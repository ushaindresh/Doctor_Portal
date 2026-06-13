# Doctor Portal

Doctor Portal is a cloud-based healthcare management web application developed using HTML, CSS, JavaScript, and AWS Cloud Services. The application helps doctors manage patient consultations, maintain clinical records, upload medical documents, and search patient history through a clean and secure interface.

The project is designed with a frontend-backend cloud architecture where the frontend is hosted on Amazon S3 as a static website and communicates with AWS services using API Gateway and Lambda Functions. Patient and consultation data are stored securely in DynamoDB, while medical documents and reports are stored privately in Amazon S3 with presigned URL access.

**Project Status: ✅ Completed**

## Technologies Used

### Frontend
* HTML
* CSS
* JavaScript

### AWS Cloud Services
* AWS API Gateway
* AWS Lambda
* Amazon DynamoDB
* Amazon S3
* AWS IAM

## Main Features

### Doctor Authentication
* Doctor Signup — credentials stored in DynamoDB via Lambda
* Doctor Login — verified against DynamoDB
* Logout functionality
* Session handling using SessionStorage (auto-clears on browser tab close)
* No sensitive credentials stored in localStorage

### Patient Consultation Workflow
* Multi-step consultation form (4 steps)
* Automatic Patient ID generation (HB-PAT-XXXXX format)
* Clinical notes management
* Visit type tracking (OPD, Follow-up, Emergency, Pre-op)
* Referring doctor support with email notification link

### Medical Record Management
* Patient record search — doctors can only view their own patients
* Similar case search — anonymized shared database across all doctors
* Dynamic filters (My Patients, Today's Visits)
* Active/Inactive patient status management

### Secure File Upload and Preview System
* Upload MRI scans and reports directly to S3 via presigned URLs
* Supports PDF, JPG, JPEG, PNG, WEBP, and DICOM files
* Hover-to-preview panel for uploaded documents
* Secure 60-second presigned URL generated per hover — files are never publicly accessible
* DICOM files show a dedicated viewer message

### Similar Case Search (Anonymized)
* Searches across all doctors' consultation records
* Patient names and doctor identities are fully hidden
* Only shows Patient ID, chief complaint, clinical notes, visit type, and encounter date
* Filtered to Last 1 Month by default

### AWS Cloud Integration
* Frontend hosted on Amazon S3 as a static website
* Frontend connected with AWS API Gateway
* Lambda Functions handle all backend logic
* DynamoDB stores consultation records and doctor accounts
* S3 stores medical documents privately
* Presigned URLs used for both upload and secure preview

## Project Architecture

```
Frontend (HTML/CSS/JS) — Hosted on S3 Static Website
↓
AWS API Gateway
↓
AWS Lambda Functions
↓
DynamoDB (DoctorPortal_Consultations, DoctorPortal_Doctors)
S3 (doctor-portal-files-25)
```

## API Gateway Routes

| Method | Path | Purpose |
|--------|------|---------|
| POST | /auth | Doctor signup and login |
| GET | /consultations | Fetch all or filtered consultations |
| POST | /consultations | Create new consultation |
| PATCH | /consultations | Update consultation status |
| GET | /consultations?action=getUploadUrl | Get S3 presigned upload URL |
| GET | /consultations?action=getPreviewUrl | Get S3 presigned preview URL (60s) |

## DynamoDB Tables

| Table | Primary Key | Purpose |
|-------|-------------|---------|
| DoctorPortal_Consultations | id (String) | Stores all patient consultation records |
| DoctorPortal_Doctors | id (String) | Stores doctor account credentials |

## S3 Buckets

| Bucket | Purpose | Access |
|--------|---------|--------|
| doctor-portal-files-25 | Private medical document storage | Private — accessed via presigned URLs only |
| doctor-portal-prototype | Static website hosting for frontend | Public read (static website) |

## Folder Structure

```
Doctor_Portal/
├── index.html       # Doctor login page
├── signup.html      # Doctor signup page
├── dashboard.html   # Main portal dashboard
├── style.css        # Application styles
├── app.js           # Main application logic
├── auth.js          # Authentication functions
├── config.js        # API Gateway base URL config
└── README.md
```

## Security Features

* Passwords stored in DynamoDB (no localStorage)
* SessionStorage used instead of localStorage — session ends when tab closes
* S3 medical files bucket is private — never publicly accessible
* 60-second expiring presigned URLs for document preview
* Doctor-level data isolation — each doctor sees only their own patients
* Patient anonymization in Similar Case Search

## Final Status

| Task | Status |
|------|--------|
| Frontend — all 7 files | ✅ Complete |
| AWS Lambda function | ✅ Complete |
| AWS API Gateway | ✅ Complete |
| DynamoDB — Doctors table | ✅ Complete |
| DynamoDB — Consultations table | ✅ Complete |
| S3 — Medical file storage | ✅ Complete |
| S3 — Static website hosting | ✅ Complete |
| Requirement 1 — Cloud Authentication | ✅ Complete |
| Requirement 2 — Secure 60-Second Hover Preview | ✅ Complete |
| Requirement 3 — Anonymized Similar Case Search | ✅ Complete |

## Purpose of the Project

The purpose of this project is to demonstrate practical implementation of full-stack cloud application development using AWS services. It combines frontend development with serverless backend architecture, secure document handling, and healthcare workflow management.

This project is now complete and closed.