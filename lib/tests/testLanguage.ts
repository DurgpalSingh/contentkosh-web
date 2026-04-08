import { TestLanguage } from '@/lib/api/models/TestLanguage';

export const TEST_LANGUAGE_LABEL: Record<TestLanguage, string> = {
  [TestLanguage.EN]: 'English',
  [TestLanguage.HI]: 'Hindi (हिन्दी)',
};

export const TEST_LANGUAGE_OPTIONS: { value: TestLanguage; label: string }[] = [
  { value: TestLanguage.EN, label: TEST_LANGUAGE_LABEL[TestLanguage.EN] },
  { value: TestLanguage.HI, label: TEST_LANGUAGE_LABEL[TestLanguage.HI] },
];
