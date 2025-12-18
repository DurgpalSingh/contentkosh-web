# Changelog

All notable changes to this project will be documented in this file.

---

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


