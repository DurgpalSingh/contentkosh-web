'use client';

import { useEffect, useState } from 'react';
import { Building2, Filter, Search, Calendar, Info, Mail, Phone, PauseCircle, PlayCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useSuperAdminStore, BusinessStatusFilter } from '@/store/useSuperAdminStore';
import { Business } from '@/lib/api';
import { BusinessStatusModal, BusinessStatusAction } from '@/components/superadmin/BusinessStatusModal';
import { toast } from 'sonner';
import { BUSINESS_STATUS, BUSINESS_STATUS_ACTIONS, BUSINESS_STATUS_FILTER } from '@/lib/constants';

const STATUS_OPTIONS: BusinessStatusFilter[] = [
  BUSINESS_STATUS_FILTER.ALL,
  BUSINESS_STATUS_FILTER.ACTIVE,
  BUSINESS_STATUS_FILTER.PAUSED,
  BUSINESS_STATUS_FILTER.DELETED,
];

function getStatusBadgeClass(status?: string) {
  switch (status) {
    case BUSINESS_STATUS.PAUSED:
      return 'bg-amber-100 text-amber-800';
    case BUSINESS_STATUS.DELETED:
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-green-100 text-green-800';
  }
}

export default function SuperAdminBusinessesPage() {
  const {
    businesses,
    pagination,
    statusFilter,
    search,
    isLoading,
    error,
    setStatusFilter,
    setSearch,
    fetchBusinesses,
    pauseBusiness,
    resumeBusiness,
    deleteBusiness,
  } = useSuperAdminStore();

  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [modalAction, setModalAction] = useState<BusinessStatusAction | null>(null);

  useEffect(() => {
    fetchBusinesses(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  useEffect(() => {
    const timeout = setTimeout(() => fetchBusinesses(1), 350);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const openModal = (business: Business, action: BusinessStatusAction) => {
    setSelectedBusiness(business);
    setModalAction(action);
  };

  const closeModal = () => {
    setSelectedBusiness(null);
    setModalAction(null);
  };

  const handleConfirm = async (reason?: string) => {
    if (!selectedBusiness?.id || !modalAction) return;

    if (modalAction === BUSINESS_STATUS_ACTIONS.PAUSE) {
      await pauseBusiness(selectedBusiness.id, reason!);
      toast.success(`${selectedBusiness.instituteName} paused`);
    } else if (modalAction === BUSINESS_STATUS_ACTIONS.RESUME) {
      await resumeBusiness(selectedBusiness.id);
      toast.success(`${selectedBusiness.instituteName} resumed`);
    } else {
      await deleteBusiness(selectedBusiness.id, reason!);
      toast.success(`${selectedBusiness.instituteName} deleted`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Businesses</h1>
        <p className="text-gray-600">Monitor and control every business on the platform</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">{error}</div>
      )}

      <div className="bg-white shadow rounded-lg flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 space-y-4">
          <h3 className="text-lg font-medium text-gray-900">All Businesses ({pagination.total})</h3>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by institute name or slug"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="relative md:w-56">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as BusinessStatusFilter)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option === BUSINESS_STATUS_FILTER.ALL ? 'All Statuses' : option}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : businesses.length === 0 ? (
          <div className="p-12 text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No businesses found</h3>
            <p className="text-gray-600">No businesses match your search/filter.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {businesses.map((business) => (
              <BusinessRow key={business.id} business={business} onAction={openModal} />
            ))}
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1 || isLoading}
                onClick={() => fetchBusinesses(pagination.page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.totalPages || isLoading}
                onClick={() => fetchBusinesses(pagination.page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {selectedBusiness && modalAction && (
        <BusinessStatusModal
          isOpen={Boolean(selectedBusiness && modalAction)}
          onClose={closeModal}
          onConfirm={handleConfirm}
          action={modalAction}
          businessName={selectedBusiness.instituteName || 'this business'}
        />
      )}
    </div>
  );
}

function BusinessRow({
  business,
  onAction,
}: {
  business: Business;
  onAction: (business: Business, action: BusinessStatusAction) => void;
}) {
  const status = business.status || BUSINESS_STATUS.ACTIVE;

  return (
    <div className="px-4 sm:px-6 py-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
            <Building2 className="h-5 w-5 text-indigo-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 sm:space-x-3 flex-wrap">
              <h4 className="text-sm font-medium text-gray-900 truncate">{business.instituteName}</h4>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(status)}`}>
                {status}
              </span>
            </div>
            <div className="flex flex-col gap-0.5 mt-1 text-xs sm:text-sm text-gray-500 sm:flex-row sm:items-center sm:gap-4">
              <span className="flex items-center min-w-0">
                <Mail className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                <span className="truncate">{business.email || 'No email'}</span>
              </span>
              <span className="flex items-center min-w-0">
                <Phone className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                <span className="truncate">{business.contactNumber || 'No number'}</span>
              </span>
            </div>
            {business.statusReason && (
              <div className="flex items-start gap-1 mt-1 text-xs text-gray-500">
                <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                <span className="truncate">{business.statusReason}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4 ml-auto flex-shrink-0">
          <div className="hidden sm:flex items-center text-sm text-gray-500">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{business.createdAt ? new Date(business.createdAt).toLocaleDateString() : 'Unknown'}</span>
          </div>

          <div className="flex space-x-2 sm:space-x-3">
            {status !== BUSINESS_STATUS.ACTIVE && (
              <Button
                variant="ghost"
                size="sm"
                className="text-green-600 hover:text-green-800 hover:bg-green-50 text-xs sm:text-sm"
                onClick={() => onAction(business, BUSINESS_STATUS_ACTIONS.RESUME)}
              >
                <PlayCircle className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Resume</span>
              </Button>
            )}
            {status === BUSINESS_STATUS.ACTIVE && (
              <Button
                variant="ghost"
                size="sm"
                className="text-amber-600 hover:text-amber-800 hover:bg-amber-50 text-xs sm:text-sm"
                onClick={() => onAction(business, BUSINESS_STATUS_ACTIONS.PAUSE)}
              >
                <PauseCircle className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Pause</span>
              </Button>
            )}
            {status !== BUSINESS_STATUS.DELETED && (
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-800 hover:bg-red-50 text-xs sm:text-sm"
                onClick={() => onAction(business, BUSINESS_STATUS_ACTIONS.DELETE)}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Delete</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
