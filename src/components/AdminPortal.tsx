import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineXMark,
  HiOutlineSquares2X2,
  HiOutlineCalendarDays,
  HiOutlineBuildingOffice2,
  HiOutlineTag,
  HiOutlineChatBubbleLeftRight,
  HiOutlineArrowRightOnRectangle,
} from 'react-icons/hi2';
import { ApiService } from '../services/api';
import type { Booking, OfficeSpace, User } from '../services/api';

interface AdminPortalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  onLogout: () => void;
}

export default function AdminPortal({ isOpen, user, onClose, onLogout }: AdminPortalProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'bookings' | 'spaces' | 'coupons' | 'consultations' | 'my_bookings'>('dashboard');
  const [summary, setSummary] = useState<any>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [spaces, setSpaces] = useState<OfficeSpace[]>([]);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const isAdmin = user?.role === 'super_admin' || user?.role === 'admin' || user?.role === 'manager';

  // Load initial data based on role
  useEffect(() => {
    if (!isOpen || !user) return;

    if (isAdmin) {
      setActiveTab('dashboard');
      loadAdminDashboard();
      loadBookings();
    } else {
      setActiveTab('my_bookings');
      loadMyBookings();
    }
  }, [isOpen, user]);

  const loadAdminDashboard = async () => {
    try {
      const res = await ApiService.admin.getDashboardSummary('this_month');
      if (res.success) setSummary(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadBookings = async () => {
    setIsLoading(true);
    try {
      const res = await ApiService.admin.getBookings();
      if (res.success) setBookings(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMyBookings = async () => {
    setIsLoading(true);
    try {
      const res = await ApiService.getMyBookings();
      if (res.success) setMyBookings(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSpaces = async () => {
    setIsLoading(true);
    try {
      const res = await ApiService.getSpaces();
      if (res.success) setSpaces(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const loadConsultations = async () => {
    setIsLoading(true);
    try {
      const res = await ApiService.admin.getConsultations();
      if (res.success) setConsultations(res.data?.data || res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCoupons = async () => {
    setIsLoading(true);
    try {
      const res = await ApiService.admin.getCoupons();
      if (res.success) setCoupons(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateBookingStatus = async (bookingId: number, newStatus: string) => {
    try {
      const res = await ApiService.admin.updateBookingStatus(bookingId, newStatus);
      if (res.success) {
        setActionMessage(`Booking updated to ${newStatus}`);
        loadBookings();
        loadAdminDashboard();
        setTimeout(() => setActionMessage(null), 3000);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleRecordPayment = async (booking: Booking) => {
    try {
      const res = await ApiService.admin.recordPayment(booking.id, {
        amount: booking.final_amount,
        gateway: 'manual',
        payment_method: 'cash',
      });
      if (res.success) {
        setActionMessage(`Payment of ₹${booking.final_amount} recorded!`);
        loadBookings();
        loadAdminDashboard();
        setTimeout(() => setActionMessage(null), 3000);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to record payment');
    }
  };

  const handleCancelMyBooking = async (bookingId: number) => {
    const reason = prompt('Please enter the reason for cancellation:');
    if (!reason) return;

    try {
      const res = await ApiService.cancelMyBooking(bookingId, reason);
      if (res.success) {
        setActionMessage('Booking cancelled successfully');
        loadMyBookings();
        setTimeout(() => setActionMessage(null), 3000);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel booking');
    }
  };

  if (!isOpen || !user) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-navy/70 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Modal / Drawer Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          className="relative flex h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 bg-navy px-6 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/20 text-gold">
                <HiOutlineBuildingOffice2 className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">{user.name}</h3>
                  <span className="rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold text-navy uppercase">
                    {user.role.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-gray-300">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20"
              >
                <HiOutlineArrowRightOnRectangle className="h-4 w-4" />
                Sign Out
              </button>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-300 hover:bg-white/10 hover:text-white"
              >
                <HiOutlineXMark className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Navigation Bar */}
          <div className="flex border-b border-gray-100 bg-gray-50 px-6">
            {isAdmin ? (
              <>
                <button
                  onClick={() => {
                    setActiveTab('dashboard');
                    loadAdminDashboard();
                  }}
                  className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition-colors ${
                    activeTab === 'dashboard'
                      ? 'border-gold text-navy'
                      : 'border-transparent text-gray-500 hover:text-navy'
                  }`}
                >
                  <HiOutlineSquares2X2 className="h-4 w-4" />
                  Dashboard KPIs
                </button>
                <button
                  onClick={() => {
                    setActiveTab('bookings');
                    loadBookings();
                  }}
                  className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition-colors ${
                    activeTab === 'bookings'
                      ? 'border-gold text-navy'
                      : 'border-transparent text-gray-500 hover:text-navy'
                  }`}
                >
                  <HiOutlineCalendarDays className="h-4 w-4" />
                  Bookings Manager
                </button>
                <button
                  onClick={() => {
                    setActiveTab('spaces');
                    loadSpaces();
                  }}
                  className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition-colors ${
                    activeTab === 'spaces'
                      ? 'border-gold text-navy'
                      : 'border-transparent text-gray-500 hover:text-navy'
                  }`}
                >
                  <HiOutlineBuildingOffice2 className="h-4 w-4" />
                  Office Spaces
                </button>
                <button
                  onClick={() => {
                    setActiveTab('coupons');
                    loadCoupons();
                  }}
                  className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition-colors ${
                    activeTab === 'coupons'
                      ? 'border-gold text-navy'
                      : 'border-transparent text-gray-500 hover:text-navy'
                  }`}
                >
                  <HiOutlineTag className="h-4 w-4" />
                  Coupons
                </button>
                <button
                  onClick={() => {
                    setActiveTab('consultations');
                    loadConsultations();
                  }}
                  className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition-colors ${
                    activeTab === 'consultations'
                      ? 'border-gold text-navy'
                      : 'border-transparent text-gray-500 hover:text-navy'
                  }`}
                >
                  <HiOutlineChatBubbleLeftRight className="h-4 w-4" />
                  Inquiries & Leads
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setActiveTab('my_bookings');
                  loadMyBookings();
                }}
                className="flex items-center gap-2 border-b-2 border-gold px-4 py-3 text-xs font-bold text-navy"
              >
                <HiOutlineCalendarDays className="h-4 w-4" />
                My Office Bookings
              </button>
            )}
          </div>

          {/* Flash message */}
          {actionMessage && (
            <div className="bg-green-600 px-6 py-2 text-center text-xs font-semibold text-white">
              {actionMessage}
            </div>
          )}

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-gold border-t-transparent" />
                <span className="ml-2 text-xs font-semibold text-gray-500">Loading data...</span>
              </div>
            )}

            {/* 1. Admin Dashboard KPIs */}
            {!isLoading && isAdmin && activeTab === 'dashboard' && summary && (
              <div className="space-y-6">
                {/* Metric Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                    <span className="text-xs font-medium text-gray-500">Total Workspaces</span>
                    <div className="mt-2 flex items-baseline justify-between">
                      <span className="text-2xl font-black text-navy">{summary.spaces?.total || 0}</span>
                      <span className="rounded bg-green-50 px-2 py-0.5 text-xs font-bold text-green-700">
                        {summary.spaces?.available} Available
                      </span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                    <span className="text-xs font-medium text-gray-500">Occupancy Rate</span>
                    <div className="mt-2 flex items-baseline justify-between">
                      <span className="text-2xl font-black text-navy">
                        {summary.spaces?.occupancy_rate || 0}%
                      </span>
                      <span className="text-xs text-gray-400">
                        {summary.spaces?.occupied} Occupied today
                      </span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                    <span className="text-xs font-medium text-gray-500">Total Bookings (This Month)</span>
                    <div className="mt-2 flex items-baseline justify-between">
                      <span className="text-2xl font-black text-navy">{summary.bookings?.total || 0}</span>
                      <span className="rounded bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700">
                        {summary.bookings?.pending} Pending
                      </span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gold/30 bg-gold-50/20 p-5 shadow-sm">
                    <span className="text-xs font-medium text-gray-500">Monthly Revenue</span>
                    <div className="mt-2 flex items-baseline justify-between">
                      <span className="text-2xl font-black text-navy">
                        ₹{Number(summary.revenue?.current_month || 0).toLocaleString('en-IN')}
                      </span>
                      <span className="rounded bg-gold/20 px-2 py-0.5 text-xs font-bold text-navy">
                        INR
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Bookings Overview */}
                <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="text-sm font-bold text-navy">Recent Bookings Queue</h4>
                    <button
                      onClick={() => {
                        setActiveTab('bookings');
                        loadBookings();
                      }}
                      className="text-xs font-semibold text-gold hover:underline"
                    >
                      View All Bookings &rarr;
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-gray-100 bg-gray-50/50 text-gray-400">
                        <tr>
                          <th className="p-3">Booking #</th>
                          <th className="p-3">Customer</th>
                          <th className="p-3">Space</th>
                          <th className="p-3">Date & Time</th>
                          <th className="p-3">Amount</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {bookings.slice(0, 5).map((b) => (
                          <tr key={b.id} className="hover:bg-gray-50/50">
                            <td className="p-3 font-mono font-semibold text-navy">{b.booking_number}</td>
                            <td className="p-3">
                              <span className="font-semibold text-navy">{b.customer?.name}</span>
                              <p className="text-[11px] text-gray-400">{b.customer?.email}</p>
                            </td>
                            <td className="p-3 font-medium text-gray-700">{b.office_space?.name}</td>
                            <td className="p-3">
                              <span className="font-medium text-navy">{b.booking_date}</span>
                              <p className="text-[11px] text-gray-400">{b.start_time} - {b.end_time}</p>
                            </td>
                            <td className="p-3 font-semibold text-navy">₹{b.final_amount}</td>
                            <td className="p-3">
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                  b.status === 'confirmed'
                                    ? 'bg-green-100 text-green-800'
                                    : b.status === 'checked_in'
                                    ? 'bg-blue-100 text-blue-800'
                                    : b.status === 'completed'
                                    ? 'bg-purple-100 text-purple-800'
                                    : b.status === 'cancelled'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {b.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-1.5">
                                {b.status === 'pending' && (
                                  <button
                                    onClick={() => handleUpdateBookingStatus(b.id, 'confirmed')}
                                    className="rounded bg-green-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-green-700"
                                  >
                                    Confirm
                                  </button>
                                )}
                                {b.status === 'confirmed' && (
                                  <button
                                    onClick={() => handleUpdateBookingStatus(b.id, 'checked_in')}
                                    className="rounded bg-blue-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-blue-700"
                                  >
                                    Check In
                                  </button>
                                )}
                                {b.payment_status === 'unpaid' && (
                                  <button
                                    onClick={() => handleRecordPayment(b)}
                                    className="rounded bg-gold px-2 py-1 text-[11px] font-semibold text-navy hover:bg-gold/90"
                                  >
                                    Pay Cash
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Admin Bookings Manager */}
            {isAdmin && activeTab === 'bookings' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-navy">All Booking Requests & Reservations</h4>
                  <a
                    href="http://localhost:8000/api/v1/admin/bookings-export"
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-navy hover:bg-gray-50"
                  >
                    Export CSV
                  </a>
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-gray-100 bg-gray-50 text-gray-500">
                      <tr>
                        <th className="p-3.5">Booking #</th>
                        <th className="p-3.5">Customer</th>
                        <th className="p-3.5">Office Space</th>
                        <th className="p-3.5">Date & Slot</th>
                        <th className="p-3.5">Amount</th>
                        <th className="p-3.5">Payment</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {bookings.map((b) => (
                        <tr key={b.id} className="hover:bg-gray-50/50">
                          <td className="p-3.5 font-mono font-bold text-navy">{b.booking_number}</td>
                          <td className="p-3.5">
                            <p className="font-semibold text-navy">{b.customer?.name}</p>
                            <p className="text-[11px] text-gray-400">{b.customer?.phone || b.customer?.email}</p>
                          </td>
                          <td className="p-3.5">
                            <span className="font-medium text-navy">{b.office_space?.name}</span>
                          </td>
                          <td className="p-3.5">
                            <span className="font-semibold text-navy">{b.booking_date}</span>
                            <p className="text-[11px] text-gray-400">{b.start_time} - {b.end_time}</p>
                          </td>
                          <td className="p-3.5 font-bold text-navy">₹{b.final_amount}</td>
                          <td className="p-3.5">
                            <span
                              className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                                b.payment_status === 'paid'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {b.payment_status.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                b.status === 'confirmed'
                                  ? 'bg-green-100 text-green-800'
                                  : b.status === 'checked_in'
                                  ? 'bg-blue-100 text-blue-800'
                                  : b.status === 'completed'
                                  ? 'bg-purple-100 text-purple-800'
                                  : b.status === 'cancelled'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {b.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <div className="flex flex-wrap gap-1">
                              {b.status === 'pending' && (
                                <button
                                  onClick={() => handleUpdateBookingStatus(b.id, 'confirmed')}
                                  className="rounded bg-green-600 px-2 py-1 text-[10px] font-semibold text-white"
                                >
                                  Confirm
                                </button>
                              )}
                              {b.status === 'confirmed' && (
                                <button
                                  onClick={() => handleUpdateBookingStatus(b.id, 'checked_in')}
                                  className="rounded bg-blue-600 px-2 py-1 text-[10px] font-semibold text-white"
                                >
                                  Check In
                                </button>
                              )}
                              {b.status === 'checked_in' && (
                                <button
                                  onClick={() => handleUpdateBookingStatus(b.id, 'completed')}
                                  className="rounded bg-purple-600 px-2 py-1 text-[10px] font-semibold text-white"
                                >
                                  Complete
                                </button>
                              )}
                              {b.status !== 'cancelled' && b.status !== 'completed' && (
                                <button
                                  onClick={() => handleUpdateBookingStatus(b.id, 'cancelled')}
                                  className="rounded bg-red-50 px-2 py-1 text-[10px] font-semibold text-red-600 hover:bg-red-100"
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 3. Customer "My Bookings" Tab */}
            {activeTab === 'my_bookings' && (
              <div className="space-y-4">
                <h4 className="text-base font-bold text-navy">My Reserved Office Spaces</h4>
                {myBookings.length === 0 ? (
                  <div className="rounded-xl border border-gray-100 bg-white p-12 text-center shadow-sm">
                    <p className="text-sm text-gray-500">You do not have any active office space bookings.</p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {myBookings.map((b) => (
                      <div
                        key={b.id}
                        className="flex flex-col justify-between rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-bold text-navy">
                              {b.booking_number}
                            </span>
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                b.status === 'confirmed'
                                  ? 'bg-green-100 text-green-800'
                                  : b.status === 'completed'
                                  ? 'bg-purple-100 text-purple-800'
                                  : b.status === 'cancelled'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {b.status.toUpperCase()}
                            </span>
                          </div>
                          <h5 className="mt-2 text-sm font-bold text-navy">{b.office_space?.name}</h5>
                          <p className="text-xs text-gray-400">{b.office_space?.location?.name}</p>

                          <div className="mt-4 rounded-lg bg-gray-50 p-3 text-xs">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Date:</span>
                              <span className="font-semibold text-navy">{b.booking_date}</span>
                            </div>
                            <div className="mt-1 flex justify-between">
                              <span className="text-gray-500">Time:</span>
                              <span className="font-semibold text-navy">{b.start_time} - {b.end_time}</span>
                            </div>
                            <div className="mt-1 flex justify-between">
                              <span className="text-gray-500">Total Price:</span>
                              <span className="font-bold text-gold">₹{b.final_amount}</span>
                            </div>
                          </div>
                        </div>

                        {b.status !== 'cancelled' && b.status !== 'completed' && (
                          <button
                            onClick={() => handleCancelMyBooking(b.id)}
                            className="mt-4 rounded-lg border border-red-200 bg-white py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                          >
                            Cancel Booking
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 4. Admin Spaces Tab */}
            {isAdmin && activeTab === 'spaces' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-navy">Office Spaces Inventory ({spaces.length})</h4>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {spaces.map((s) => (
                    <div key={s.id} className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                      <img
                        src={s.primary_image?.url || s.images?.[0]?.url || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80'}
                        alt={s.name}
                        className="h-36 w-full object-cover"
                      />
                      <div className="p-4">
                        <span className="rounded bg-navy/10 px-2 py-0.5 text-[10px] font-bold text-navy uppercase">
                          {s.space_type}
                        </span>
                        <h5 className="mt-1 text-sm font-bold text-navy">{s.name}</h5>
                        <p className="text-xs text-gray-500">{s.location?.name}</p>
                        <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2">
                          <span className="text-xs font-bold text-gold">₹{s.base_price}/{s.pricing_unit}</span>
                          <span className="text-[11px] text-gray-400">Cap: {s.capacity} seats</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Admin Coupons Tab */}
            {isAdmin && activeTab === 'coupons' && (
              <div className="space-y-4">
                <h4 className="text-base font-bold text-navy">Discount Coupons</h4>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {coupons.map((c) => (
                    <div key={c.id} className="rounded-xl border border-gold/30 bg-gold-50/30 p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm font-bold text-navy">{c.code}</span>
                        <span className="rounded bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-800 uppercase">
                          {c.status}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-gray-600">{c.description}</p>
                      <p className="mt-3 text-xs font-bold text-gold">
                        {c.discount_type === 'percentage' ? `${c.discount_value}% OFF` : `₹${c.discount_value} FLAT OFF`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. Admin Consultations Tab */}
            {isAdmin && activeTab === 'consultations' && (
              <div className="space-y-4">
                <h4 className="text-base font-bold text-navy">Inquiries & Leads</h4>
                <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-gray-100 bg-gray-50 text-gray-500">
                      <tr>
                        <th className="p-3.5">Name</th>
                        <th className="p-3.5">Email / Phone</th>
                        <th className="p-3.5">Company</th>
                        <th className="p-3.5">Service</th>
                        <th className="p-3.5">Preferred Date</th>
                        <th className="p-3.5">Message</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {consultations.map((c) => (
                        <tr key={c.id} className="hover:bg-gray-50/50">
                          <td className="p-3.5 font-bold text-navy">{c.full_name}</td>
                          <td className="p-3.5">
                            <p>{c.email}</p>
                            <p className="text-gray-400">{c.phone}</p>
                          </td>
                          <td className="p-3.5">{c.company_name}</td>
                          <td className="p-3.5 font-semibold text-gold">{c.service}</td>
                          <td className="p-3.5">{c.preferred_date}</td>
                          <td className="p-3.5 max-w-xs truncate text-gray-500">{c.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
