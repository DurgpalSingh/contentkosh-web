import { create } from 'zustand';
import { Business, SuperAdminService } from '@/lib/api';
import { ApiError } from '@/lib/api/core/ApiError';
import { BUSINESS_STATUS, BUSINESS_STATUS_FILTER, type BusinessStatusFilterValue } from '@/lib/constants';

export type BusinessStatusFilter = BusinessStatusFilterValue;

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface SuperAdminState {
  businesses: Business[];
  pagination: Pagination;
  statusFilter: BusinessStatusFilter;
  search: string;
  isLoading: boolean;
  error: string | null;

  setStatusFilter: (status: BusinessStatusFilter) => void;
  setSearch: (search: string) => void;
  fetchBusinesses: (page?: number) => Promise<void>;
  pauseBusiness: (id: number, reason: string) => Promise<void>;
  resumeBusiness: (id: number) => Promise<void>;
  deleteBusiness: (id: number, reason: string) => Promise<void>;
}

function extractErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    return (error.body as { message?: string } | undefined)?.message || fallback;
  }
  return fallback;
}

export const useSuperAdminStore = create<SuperAdminState>()((set, get) => ({
  businesses: [],
  pagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
  statusFilter: BUSINESS_STATUS_FILTER.ALL,
  search: '',
  isLoading: false,
  error: null,

  setStatusFilter: (status) => set({ statusFilter: status }),
  setSearch: (search) => set({ search }),

  fetchBusinesses: async (page) => {
    const { pagination, statusFilter, search } = get();
    const targetPage = page ?? pagination.page;

    set({ isLoading: true, error: null });
    try {
      const response = await SuperAdminService.getApiSuperadminBusinesses(
        targetPage,
        pagination.limit,
        statusFilter === BUSINESS_STATUS_FILTER.ALL ? undefined : statusFilter,
        search || undefined,
      );
      set({
        businesses: (response?.data as Business[]) || [],
        pagination: response?.pagination || get().pagination,
        isLoading: false,
      });
    } catch (error) {
      set({ error: extractErrorMessage(error, 'Failed to load businesses'), isLoading: false });
    }
  },

  pauseBusiness: async (id, reason) => {
    await SuperAdminService.patchApiSuperadminBusinessesStatus(id, { status: BUSINESS_STATUS.PAUSED, reason });
    await get().fetchBusinesses();
  },

  resumeBusiness: async (id) => {
    await SuperAdminService.patchApiSuperadminBusinessesStatus(id, { status: BUSINESS_STATUS.ACTIVE });
    await get().fetchBusinesses();
  },

  deleteBusiness: async (id, reason) => {
    await SuperAdminService.patchApiSuperadminBusinessesStatus(id, { status: BUSINESS_STATUS.DELETED, reason });
    await get().fetchBusinesses();
  },
}));
