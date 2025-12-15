# Changelog

All notable changes to this project will be documented in this file.

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

