# Changelog

All notable changes to this project will be documented in this file.
## Version [1.1.38] - file upload icon
**P.R Raised by** : shubh404-SE on **Date** : 2026-03-04

### Changed
  - Added format metadata in config.
  - Added hover info icon in Add Content modal label.
    - Info icon next to File (...)

---
## Version [1.1.37] - Side bar and modal css fixed at zoom
**P.R Raised by** : shubh404-SE on **Date** : 2026-03-02

### Changed
  - Made dashboard sections flexible made sidebars scroll-safe at high zoom:
  - Updated modal behavior across your modal components:
    - Overlay now supports overflow-y-auto + padding.
    - Modal panels now use max-h-[90vh] + vertical scrolling.

---
## Version [1.1.36] - Content title validation
**P.R Raised by** : shubh404-SE on **Date** : 2026-03-02

### Changed
  - Validated Content title using `validateEntityName`.
  - Allowed max length of 100

---
## Version [1.1.35] - Bussiness logo 
**P.R Raised by** : shubh404-SE on **Date** : 2026-03-01

### Changed
  - Updated `DashboardLayout.tsx` to show:
    - business logo (if available), business name
    - if business.logo is null/empty, shows a styled icon placeholder.

## Version [1.1.34] - Doc format allowed for content upload
**P.R Raised by** : shubh404-SE on **Date** : 2026-03-02

### Changed
  - Added shared upload format config: `content-upload.config.ts`
  - Centralizes: accepted MIME/extensions, accept file input, label and error message
  - Wired config into Add Content modal, upload-area validation and  content card.

---
## Version [1.1.33] - add Batch Modal blocker
**P.R Raised by** : shubh404-SE on **Date** : 2026-02-28

### Changed
- **AddBatchModal.tsx**:
  - Updated Modal to open it even there is no course.
  - Showing no course error at top of modal.
- **Batch Card**
  - showing All Members of a Batch not just Students.

---
## Version [1.1.32] - Teacher professional field validation hardening
**P.R Raised by** : shubh404-SE
**Date** : 2026-02-27

### Changed
- **Teacher profile validation (Create/Edit modals)**:
  - Updated `validateProfessionalStep` to use `validateEntityName` for:
    - `qualification` with max length `100`
    - `designation` with max length `100`
  - Added realistic experience validation for `experienceYears`:
    - required, whole number, min `0`, max `50` realstic

---

## Version [1.1.31] - scroll positioning on Users Page
**P.R Raised by** : shubh404-SE
**Date** : 2026-02-25

### Added
- Preserved scroll position and filter role on Users page using `sessionStorage` when navigating to teacher profile.

---

## Version [1.1.30] - Teacher profile field validation
**P.R Raised by** : shubh404-SE
**Date** : 2026-02-25

### Added
- **Validation for mondatory fields**:
  - Added reusable 'validateProfessionalStep' validation function to validate teacher priofile professional fields
  - Used in both CreateTeacherProfileModal and EditTeacherProfileModal

---

## Version [1.1.29] - Dashboard API Integration & UI Refresh
**P.R Raised by** : shubh404-SE
**Date** : 2026-02-24

- **Dashboard API Service**:
  - Added `services/dashboard.service.ts` to fetch role-based dashboard data from backend `GET /api/dashboard`.
- **Dashboard Types**:
  - Added `types/dashboard.ts` 

### Changed
- **Dashboard Data Source**:
  - Replaced static/mock dashboard data with live backend-driven data for:
    - `components/dashboard/AdminDashboard.tsx`
    - `components/dashboard/TeacherDashboard.tsx`
    - `components/dashboard/StudentDashboard.tsx`
- Preserved scroll position on Users page using `sessionStorage` when navigating to teacher profile.

---

## Version [1.1.28] - Filter/search users
**P.R Raised by** : shubh404-SE
**Date** : 2026-02-24
**Ticket** - CK-79, CK-78

### Added
- **Filter and Search functionality for users Module**

---

## Version [1.1.27] - Drag-and-Drop File Upload UI Enhancement
**P.R Raised by** : shubh404-SE
**Date** : 2026-02-24

### Added
- **Drag-and-Drop File Upload Component**:
  - Created new `FileUploadArea` component in `components/dashboard/contents/FileUploadArea.tsx`.
  - Supports both click-to-upload and drag-and-drop file selection methods.
  - Visual feedback with color-coded states (empty, dragging, selected, error, disabled).
  - File type validation for PDF and image files with immediate user feedback.
  - Display selected file information (name, size, type icon) before upload.
  - Remove file functionality with visual confirmation.

- **Accessibility Features**:
  - Full keyboard navigation support (Enter/Space keys to open file picker).
  - Focus management and proper tab order.
  - Screen reader announcements for drag state and file selection.

- **Helper Functions**:
  - `validateFileType()`: Validates MIME types with wildcard support (e.g., "image/*").
  - `formatFileSize()`: Converts bytes to human-readable format (Bytes, KB, MB, GB).

### Changed
- **Add Content Modal**:
  - Replaced basic HTML file input with new `FileUploadArea` component.
  - Enhanced error display with AlertCircle icon for better visual feedback.
  - Improved user experience with clear visual upload area (120px minimum height).

---

## Version [1.1.26] - Empty State Refactor & Teacher Menu Restriction
**P.R Raised by** : shubh404-SE
**Date** : 2026-02-22

### Added
- **Generic Empty State Component**:
  - Added reusable EmptyState component in components/common/EmptyState.tsx.
  - Supports configurable 	itle, description, optional icon, and optional action.

### Changed
- **Role-based Empty Messages Controlled at Page Level**:
  - Updated empty-state rendering in Exams, Courses, Subjects, Batches, and Contents pages.
  - Moved role-specific messaging (Admin vs Teacher) from component internals to page-level logic for manual control.
- **Teacher Role UI Restriction (3-dot menu)**:
  - Removed/hidden 3-dot action menu for teacher role in card-level admin actions (Exam/Course/Subject cards).

---
## Version [1.1.25] - Teacher Profile UX & Flow Improvements
**P.R Raised by** : shubh404-SE
**Date** : 2026-02-18

### Added
- **Teacher Profile State Store**: Added `useTeacherStore` to pass selected teacher user context from Users page to Teacher Profile page.
- Before redirecting from Users page to Teacher Profile page, selected teacher user details are stored in Zustand.
- **Teacher Profile Page**:
  - Improved 404 handling for missing teacher profile.
  - Teacher Profile now uses store context when profile does not exist and prompts profile creation.
- **Teacher Profile UI Refresh**:
  - Improved profile-not-created state and section presentation.
  - Added cleaner professional summary cards and improved page hierarchy.
- **Teacher Modals UI Refresh**:
  - Created `CreateTeacherProfileModal` and `EditTeacherProfileModal` 
  - Improved step indicators, spacing, and section clarity.

---

## Version [1.1.24] - Batch Details UI Responsiveness Improvements
**P.R Raised by** : shubh404-SE
**Date** : 2026-02-19

### Changed
- **Batch Details Page UI**:
  - Kept header, tabs, and search/action bar fixed while scrolling members.
  - Added a dedicated scrollable container for Students/Teachers list


---

## Version [1.1.23] - Course Page UI Polishing
**P.R Raised by** : shubh404-SE
**Date** : 2026-02-20

### Changed
- **Course Grid Card Responsiveness**:
  - Refactored action footer buttons to responsive grid layout.
  - Prevented button overflow with width and shrink-safe classes.

---

## Version [1.1.22] - Dynamic Course Status Calculation
**P.R Raised by** : shubh404-SE
**Date** : 2026-02-17

### Added
- **Role Dropdown in AddUserModal**: added a dropdown to assign a role to a user.

---

## Version [1.1.21] - Dynamic Course Status Calculation
**P.R Raised by** : shubh404-SE
**Date** : 2026-02-17

### Added
- **Course Status Recalculation**: Implemented dynamic course status calculation based on current date and course dates.
  - Added `calculateCourseStatus()` helper function to compute course status in real-time.
  - Status is recalculated automatically whenever courses are fetched from the API.

---

## Version [1.1.20] - Batch Details Page Refactor & Member Management
**P.R Raised by** : shubh404-SE
**Date** : 2026-02-12

### Added
- **Batch Member Management**:
  - Added role-aware `AddBatchMemberModal` for both Students and Teachers.
  - Added member search in modal (API call triggered on 3+ characters) with filtered result list.
  - Added member removal flow from batch details cards.
  - Integrated `DeleteConfirmModal` for delete confirmation before removing a member.

### Changed
- **Batch Details Routing**:
  - Standardized details navigation to `/${slug}/dashboard/batches/[batchId]`.
  - Added compatibility redirect from legacy `/dashboard/batches/details?id=...` route.
- **Batch Details UI Refactor**:
  - Split repeated page logic into reusable components:
    - `BatchMembersTabs`
    - `BatchMembersPanel`
    - `BatchMemberCard`
    - `BatchMemberDetailsModal`
  - Added batch selector in details page header to switch between batches.
  - Added in-page member search (name/email/userId) below tabs.
  - Added tab-aware action button (`Add Student` / `Add Teacher`).

---

## Version [1.1.19] - Admin Management Features
**P.R Raised by** : aaditya-singh-21
**Date** : 2026-02-12
### Added
- **Admin Management**: Implemented full CRUD for admins.
  - **Add Admin**: Create new admin users with validation.
  - **Edit Admin**: Update admin name and mobile number.
  - **Remove Admin**: Soft-delete admins with confirmation modal.
- **Components**: Added `AddUserModal`, `EditUserModal`.

---

## Version [1.1.18] - Fix Exam Description Hover
**P.R Raised by** : aaditya-singh-21
**Date** : 2026-02-14

### Fixed
- **Exam Card**:
  - Added `title` attribute to exam description to show full text on hover when truncated.

---

## Version [1.1.17] -  Course dropdown for Batch creation
**P.R Raised by** : shubha404-SE
**Date** : 2026-02-13

### Added
- **Add Batch Modal**:
  - Added a required **Course** dropdown in `AddBatchModal` to select which course the new batch should belong to.
  - Modal now initializes the dropdown with the currently selected course from the Batches page.
### Changed
- **Batch Validation**:
  - Updated `batchSchema` to reuse existing `validateEntityName` rules through Zod `superRefine` for `codeName` and `displayName`.
  - Batch code and display name now follow the same centralized frontend validation behavior used for exam name checks.

---
## Version [1.1.16] - Link Course to Exam
**P.R Raised by** : aaditya-singh-21
**Date** : 2026-02-13

### Added
- **Course Management**:
  - Added **Exam Dropdown** in "Add New Course" modal to link new courses to specific exams.
  - Implemented validation to ensure an exam is selected before course creation.
  - improved UX by auto-selecting the first available exam if none is selected.

---

## Version [1.1.15] - Content Management Frontend Implementation
**P.R Raised by** : shubha404-SE
**Date** : 2026-02-11

### Added
- **Content Management UI**: Complete frontend implementation for content upload, management, and filtering.

- **Modals & Components**:
  - **AddContentModal**: File upload modal with batch selection and content metadata.
  - **EditContentModal**: Update content title and active status.
  - **ContentGridCard**: Display content with metadata (file type, size, upload date, status).
    - Icons and badges for PDF, Image, and generic file types.
    - Action menu: View File, Edit, Delete.
  - **ContentsFilterModal**: Hierarchical filtering by Exam → Course → Batch.
    - Smart cascading selectors with dependent field updates.
    - Clear all filters functionality.

- **API Integration**:
  - Integrated generated `ContentsService` from API client.
  - Support for file upload with metadata.

### Improved
- **Backend Service** (`getAllActiveBatches`):
- To fetch all batches for a user according to their role.
- For teacher and student, get all batches if they are in that batch.

---

## Version [1.1.14] - Refactor Validation Logic
**P.R Raised by** : aaditya-singh-21
**Date** : 2026-02-11
- **Validation**: Refactored `validateEntityName` to use composable validator functions.
- **Jira Ticket Number** : CK-46

---

## Version [1.1.13] - Fix Course Navigation
**P.R Raised by** : aaditya-singh-21
**Date** : 2026-02-11
- **Course Navigation**: Fixed navigation issues in course module.
- **Jira Ticket Number** : CK-44

---

## Version [1.1.12] - Fix Validation Error Order
**P.R Raised by** : aaditya-singh-21
**Date** : 2026-02-11
- **Batch Form**: Fixed validation error order in "Add New Batch" form to display field errors (Code Name, Display Name) before date errors.
- **Jira Ticket Number** : CK-52

---

## Version [1.1.11] - Fix Validation & UI Updates
**P.R Raised by** : shubha404-SE
**Date** : 2026-02-11
- Added name validation to ensure at least one alphabet character is present.
- Removed the `required` constraint from the exam code field.
- Removed start date and end date fields from the exam add/edit UI.

## Version [1.1.10] - Exam Success Notifications
**P.R Raised by** : aaditya-singh-21
**Date** : 2026-02-07

### Added
- **Exam Management**:
  - Integrated `sonner` for toast notifications to provide visual feedback.
  - Added success toast messages when creating a new exam.
  - Added success toast messages when updating an existing exam.

---

## Version [1.1.9] - Dashboard URL Refactor & Bug Fixes
**P.R Raised by** : aaditya-singh-21
**Date** : 2026-02-08

### Added
- **Dynamic Dashboard Routing**: Implemented slug-based routing (`/[slug]/dashboard`) for multi-tenant business support.
- **Redirect Logic**: Automatic redirection from `/dashboard/*` to `/[slug]/dashboard/*` ensuring seamless user experience.

### Fixed
- **Batch Creation**: Fixed API call arguments in `AddBatchModal` and `EditBatchModal` to resolve validation errors.
- **Course Creation**: Fixed `invalid examId` error in `AddCourseModal` and `EditCourseModal`.
- **Navigation**: Resolved "No Batch Selected" error by preserving batch ID during redirects and fixing navigation links.
- **Backend Refactoring**: Removed temporary type casting in `business.service.ts` and improved type safety in `batch.repo.ts`.

### Changed
- **API Integration**: Updated service calls to match generated API client signatures.

## Version [1.1.8] - Fix invalid Examid error in course
**P.R Raised by** : shubha404-SE
**Date** : 2026-02-07

## Updated API calls in AddCourseModal & EditCourseModal
- Fixed parameters while calling API.

## Version [1.1.8] - Exam Validation Fix
**P.R Raised by** : aaditya-singh-21
**Date** : 2026-02-07

### Fixed
- **Add Exam Modal**:
  - Implemented custom application-level validation for "Exam Name" to replace browser default behavior.
  - "Exam Name" is now validated via JavaScript, displaying a red error box for empty submissions instead of a tooltip.

---

## Version [1.1.7] - Fix invalid start/end date selection
**P.R Raised by** : shubha404-SE
**Date** : 2026-02-05

## Updated add exam page and date validate
- Ensured End Date cannot be earlier than Start Date.
- Restricted Start Date to today or future dates when adding an exam.

## Fixed
- Fixed missing validation for invalid exam date ranges.
- fixed paired selection for Start Date and End Date. Either select both or don't select any.

---

## Version [1.1.6] - Auth Type Fix & Token Refresh Handling
**P.R Raised by** : aaditya-singh-21
**Date** : 2026-02-04

### Fixed
- **Authentication**:
  - Fixed TypeScript error in `lib/auth.ts`: Removed `refreshToken` from `AuthResponse` type usage as it was not part of the API definition.
  - Improved token management: Explicitly handling token updates via `setRefreshToken` side effects instead of relying on return values.

---


## Version [1.1.5] - INTERNAL SERVER ERROR IN ADD EXAM 
**P.R Raised by** : shubha404-SE
**Date** : 2026-02-04

### Changed
- **Add Exam Page**:
  - internal server error resolved during adding new exam.

---

## Version [1.1.4] - Batch Details Optimization & Refactoring
**P.R Raised by** : aaditya-singh-21
**Date** : 2026-02-01

### Changed
- **Batch Details Page**:
  - Implemented `Promise.allSettled` to handle multiple API requests (Exams -> Courses -> Batches) robustly, preventing global page failure if a single request fails.
  - Optimized data fetching logic to ensure validity of intermediate data before proceeding.
- **Batch Specific Page**:
  - Refactored `[batchId]/page.tsx` to implement **lazy loading** for "Students" and "Teachers" tabs, significantly reducing initial load time and network calls.
  - Removed nested `try-catch` blocks for clearer error handling and better code maintainability.
  - Added caching mechanism for tabs to prevent redundant API calls when switching between Students and Teachers.

## Version [1.1.3] - Dynamic Dashboard UI & Role-Based Access
**P.R Raised by** : aaditya-singh-21
**Date** : 2026-01-24

### Added
- **Dynamic Dashboard Layout**: Refactored the core `DashboardLayout` to dynamically generate sidebar navigation items based on the logged-in user's **Role** (Admin, Teacher, Student) and **Permissions**.
- **Role-Based Access Control (RBAC)**: Integration of `rbac.ts` utility to centrally manage and enforce UI visibility rules.
- **Modular Dashboard Views**: Split the main dashboard into role-specific components for cleaner separation of concerns.

### Fixed
- **Auth Stability**: Removed "Fallback User" mechanism to prevent broken UI states; app now properly handles profile fetch failures by forcing re-authentication.
- **API Integration**: Corrected method signatures in `StudentsPage` to align with the generated API client, resolving runtime crashes.
---
## Version [1.1.2] - Architecture, API & UI Improvements in EXAM, Course and Batch
**P.R Raised by** : shubha404-SE
**Date** : 2026-02-07

### Changes
- Centralized authentication initialization by moving shared `useEffect` logic into a common layout, eliminating duplicated auth logic across components.
- Added root (`/`) route handling to automatically redirect users to `/dashboard`.
- Fixed API call issues on the Exam page for fetching and posting exams, and improved overall UI stability and responsiveness.
- Resolved API integration issues on the Course page and enhanced the course UI.
- Added a dedicated Subjects page to display all subjects for a selected course, with fully functional add, edit, and delete modals.
- Implemented add, edit, and delete functionality for Batches; optimized batch fetching by filtering by course ID to prevent repeated API calls in loops.
- Updated frontend service layers to align with recent backend API changes.

---

## Version [1.3.0] - Students Management & UI Refactoring
**P.R Raised by** : aaditya-singh-21
**Date** : 2025-12-19

### Added
- **Students Management**:
  - New **Students Page** with aggregated view of students from all batches.
  - **Hierarchical Filtering** (Exam -> Course -> Batch) to easily find students.
  - Search functionality for students by name or email.
  - "View Students" button in Batches page to auto-filter students list.
- **UI Components**:
  - `HierarchicalFilterModal`: Reusable component for multi-level filtering.
  - `OverviewCard`: Unified card component for Exams, Batches, and Students.
  - `StudentGridCard`: Component to display student details and enrolled batches.

### Changed
- **Admins Section**:
  - Renamed "Users" section to "Admins".
  - Filtered user list to show only 'ADMIN' and 'SUPERADMIN' roles.
  - Updated sidebar theme to light blue using `bg-blue-50` and `border-blue-100`.
- **Refactoring**:
  - `StudentsFilterModal` and `BatchesFilterModal` now use the generic `HierarchicalFilterModal`.
  - `BatchGridCard` and `StudentGridCard` now use the generic `OverviewCard`.
  - Improved type safety for `Batch` and `Course` models with extended types.

## Version [1.2.1] - API Performance Optimization & Code Refactoring
**P.R Raised by** : aaditya-singh-21
**Date** : 2025-12-18

### Added
- **UI Components**:
  - Implemented reusable `DatePicker` component in `components/ui/date-picker.tsx`.
  - Added `Calendar` component based on `react-day-picker` in `components/ui/calendar.tsx`.
- **Date Handling**:
  - Replaced manual date inputs with `DatePicker` in `AddBatchModal` and `EditCourseModal`.
  - Standardized date storage format (ISO 8601).
  - Refactored Modals (`AddBatchModal`, `EditCourseModal`) to use reusable `Input`, `Label`, and `Button` components.
  - Resolved `Calendar` UI alignment issues by adopting `justify-between` and correct `react-day-picker` v9 styling keys.
- **Validation**:
  - Generalized validation logic into reusable Zod schemas (`lib/schemas.ts`).
  - Refactored `AddBatchModal` to use shared `batchSchema` for robust and type-safe validation.

### Changed
- **Courses Page Performance**:
  - Replaced deeply nested `try-catch` blocks in `fetchExams` with modular helper functions.
  - Implemented parallel data fetching for Course details (Subjects and Batches) using `Promise.all` to reduce waterfall effects.
  - Improved error handling granularity, ensuring partial failures (e.g., one course failing to load subjects) do not crash the entire page load.

---

## Version [1.2.0] - Validation Refactoring & Model Optimizations
**P.R raised by**  : aaditya-singh-21  
**Date** : 2025-12-16

### Added
- **Add Batch Modal**:
  - New `AddBatchModal` component at `components/modals/AddBatchModal.tsx`
  - Form with name (required), description, and active status fields
  - API integration with `BatchesService.postApiBatches()`
  - Auto-refresh batch list on successful creation

- **Edit Batch Modal**:
  - New `EditBatchModal` component at `components/modals/EditBatchModal.tsx`
  - Pre-populated form with existing batch data
  - API integration with `BatchesService.putApiBatches()`

- **Delete Batch Functionality**:
  - New `DeleteConfirmModal` component at `components/modals/DeleteConfirmModal.tsx`
  - Confirmation dialog before deletion
  - API integration with `BatchesService.deleteApiBatches()`

### Changed
- **Validation Logic**:
  - Refactored hardcoded validation in Course and Subject modals to use reusable `validateEntityName` function.
  - Standardized error messages for entity name validation.
  - Maintained 100-character limit for Course and Subject names.
- **Data Models**:
  - `UserProfile.ts` refactored to use TypeScript intersection types (`User & { ... }`) for cleaner code and better maintainability.

---

## Version [1.1.0] - Dynamic Courses Page & Authentication Improvements
**P.R raised by**  : aaditya-singh-21  
**Date** : 2025-12-10

### Added
- **Dynamic Courses Page**:
  - Replaced hardcoded mock exam data with real API integration
  - Fetch exams, courses, and subjects dynamically from backend
  - Added `getExamByBusiness()` method to `ExamsService` for fetching exams by business ID
  
- **Add Exam Modal**:
  - New `AddExamModal` component at `components/modals/AddExamModal.tsx`
  - Form with name (required), description, and active status fields
  - API integration with `ExamsService.postApiExams()`
  - Auto-refresh exam list on successful creation

- **Edit Exam Modal**:
  - New `EditExamModal` component at `components/modals/EditExamModal.tsx`
  - Pre-populated form with existing exam data
  - API integration with `ExamsService.putApiExams()`

- **Delete Exam Functionality**:
  - New `DeleteConfirmModal` component at `components/modals/DeleteConfirmModal.tsx`
  - Confirmation dialog before deletion
  - API integration with `ExamsService.deleteApiExams()`

- **Authentication Improvements**:
  - Added 401 error handling in courses page - auto logout on token expiration
  - Added redirect to login page after logout in `DashboardLayout`

### Changed
- Updated `app/dashboard/courses/page.tsx` to use dynamic data fetching
- Updated `components/dashboard/DashboardLayout.tsx` to redirect to login after logout

---



