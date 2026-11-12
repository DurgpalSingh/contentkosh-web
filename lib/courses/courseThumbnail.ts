import type { CreateCourseRequest, UpdateCourseRequest } from '@/lib/api';
import { resolveAssetUrl } from '@/lib/assets/assetUrl';

export const COURSE_DEFAULT_THUMBNAIL_PATH = '/course-default-thumbnail.png';

type CoursePayload = CreateCourseRequest | UpdateCourseRequest;

export function buildCourseFormData(
  payload: CoursePayload,
  thumbnailFile?: File | null,
  removeThumbnail = false,
): FormData {
  const formData = new FormData();
  formData.append('data', JSON.stringify(payload));
  if (thumbnailFile) formData.append('thumbnail', thumbnailFile);
  if (removeThumbnail) formData.append('removeThumbnail', 'true');
  return formData;
}

export function getCourseThumbnailUrl(thumbnail?: string | null): string {
  return resolveAssetUrl(thumbnail) ?? COURSE_DEFAULT_THUMBNAIL_PATH;
}
