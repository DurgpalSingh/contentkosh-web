# Changelog

All notable changes to this project will be documented in this file.

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


