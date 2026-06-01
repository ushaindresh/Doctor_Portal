# Doctor Portal

Doctor Portal is a cloud-based healthcare management web application developed using HTML, CSS, JavaScript, and AWS Cloud Services. The application helps doctors manage patient consultations, maintain clinical records, upload reports, and search patient history through a clean and responsive interface.

The project is designed with a frontend-backend cloud architecture where the frontend communicates with AWS services using API Gateway and Lambda Functions. Patient and consultation data are stored securely in DynamoDB, while medical documents and reports can be stored in Amazon S3.

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

## Main Features

### Doctor Authentication

* Doctor Signup
* Doctor Login
* Logout functionality
* Session handling using LocalStorage

### Patient Consultation Workflow

* Multi-step consultation form
* Automatic Patient ID generation
* Clinical notes management
* Visit type tracking
* Referring doctor support

### Medical Record Management

* Patient record search
* Similar case search
* Dynamic filters
* Active/Inactive patient status management

### File Upload System

* Upload MRI scans and reports
* Supports PDF, JPG, PNG, and DICOM files

### AWS Cloud Integration

* Frontend connected with AWS API Gateway
* Lambda Functions process requests
* DynamoDB stores patient and consultation records
* S3 support for file storage

## Project Architecture

Frontend (HTML/CSS/JS)
↓
AWS API Gateway
↓
AWS Lambda Functions
↓
DynamoDB / S3

## Folder Structure

Doctor_Portal/
├── index.html
├── signup.html
├── dashboard.html
├── style.css
├── app.js
├── auth.js
├── config.js
└── README.md

## Future Improvements

* Role-based access
* Real AWS authentication system
* Secure file uploads to S3
* Patient analytics dashboard
* Doctor appointment scheduling
* Mobile responsive optimization

## Purpose of the Project

The purpose of this project is to demonstrate practical implementation of full-stack cloud application development using AWS services. It combines frontend development with serverless backend architecture and healthcare workflow management.
