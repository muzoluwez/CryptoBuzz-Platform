/* eslint-disable prettier/prettier */
import * as React from 'react';
import { useMemo, useState, useEffect } from 'react';
import { useLanguage } from '@/i18n';
import { DataGrid, DataGridColumnHeader, DataGridColumnVisibility, KeenIcon, useDataGrid } from '@/components';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Toolbar, ToolbarActions, ToolbarDescription, ToolbarHeading, ToolbarPageTitle } from '@/partials/toolbar';
import { useLazyGetPurchasesQuery } from '../../../store/api/admin/adminPurchaseApiSlice';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const AdminPurchase = ({ title = "Course Purchases" }) => {
  const [getPurchases, { isLoading }] = useLazyGetPurchasesQuery();
  const [purchases, setPurchases] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, pages: 0 });
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0, cancelled: 0, refunded: 0, totalRevenue: 0 });
  
  // Filters - default to "approved" to show only completed purchases
  const [statusFilter, setStatusFilter] = useState("approved");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const {
    isRTL
  } = useLanguage();

  // Fetch purchases
  const fetchPurchases = async () => {
    try {
      // If "all" is selected, don't send status filter (show all)
      const status = statusFilter === "all" ? "" : statusFilter;
      const response = await getPurchases({
        status: status,
        search: searchTerm,
        page: currentPage,
        limit: 50,
      }).unwrap();
      
      setPurchases(response.data?.purchases || []);
      setPagination(response.data?.pagination || {});
      setStats(response.data?.stats || {});
    } catch (error) {
      console.error("Error fetching purchases:", error);
      toast.error(error?.data?.message || "Failed to fetch purchases");
    }
  };

  useEffect(() => {
    fetchPurchases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, searchTerm, currentPage]);

  const columns = useMemo(() => [
    {
      accessorFn: row => row.hotmartTransactionCode || row._id,
      id: 'transaction',
      header: ({ column }) => <DataGridColumnHeader title='Transaction Code' column={column} />,
      enableSorting: true,
      cell: ({ row }) => {
        const transactionCode = row?.original?.hotmartTransactionCode;
        const hasTransaction = transactionCode && transactionCode !== '';
        
        return (
          <div className="flex flex-col gap-0.5">
            {hasTransaction ? (
              <span className="font-semibold font-mono text-sm">
                {transactionCode}
              </span>
            ) : (
              <span className="font-semibold text-sm text-gray-400 italic">
                No transaction (pending)
              </span>
            )}
            <span className="text-xs text-gray-500">
              {new Date(row?.original?.createdAt).toLocaleDateString()}
            </span>
          </div>
        );
      },
      meta: {
        headerClassName: 'min-w-[200px]'
      }
    },
    {
      accessorFn: row => row.user?.email || row.hotmartBuyerEmail,
      id: 'buyer',
      header: ({ column }) => <DataGridColumnHeader title='Buyer' column={column} />,
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold">
            {row?.original?.user?.first_name && row?.original?.user?.last_name
              ? `${row.original.user.first_name} ${row.original.user.last_name}`
              : row?.original?.hotmartBuyerName || 'N/A'}
          </span>
          <span className="text-sm text-gray-500">
            {row?.original?.user?.email || row?.original?.hotmartBuyerEmail || 'N/A'}
          </span>
        </div>
      ),
      meta: {
        headerClassName: 'min-w-[250px]'
      }
    },
    {
      accessorFn: row => row.course?.title,
      id: 'course',
      header: ({ column }) => <DataGridColumnHeader title='Course' column={column} />,
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold">
            {row?.original?.course?.title || 'N/A'}
          </span>
          <span className="text-xs text-gray-500">
            {row?.original?.course?.tier || 'N/A'}
          </span>
        </div>
      ),
      meta: {
        headerClassName: 'min-w-[250px]'
      }
    },
    {
      accessorFn: row => row.amount,
      id: 'amount',
      header: ({ column }) => <DataGridColumnHeader title='Amount' column={column} />,
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-semibold text-primary">
            ${(row?.original?.amount || 0).toFixed(2)}
          </span>
          <span className="text-sm text-gray-500">
            {row?.original?.currency || 'USD'}
          </span>
        </div>
      ),
      meta: {
        headerClassName: 'min-w-[120px]'
      }
    },
    {
      accessorFn: row => row.status,
      id: 'status',
      header: ({ column }) => <DataGridColumnHeader title='Status' column={column} />,
      enableSorting: true,
      cell: ({ row }) => {
        const status = row?.original?.status || 'pending';
        const statusColors = {
          approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
          pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
          cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
          refunded: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[status] || statusColors.pending}`}>
            {status}
          </span>
        );
      },
      meta: {
        headerClassName: 'min-w-[120px]'
      }
    },
    {
      accessorFn: row => row.accessGranted,
      id: 'access',
      header: ({ column }) => <DataGridColumnHeader title='Access' column={column} />,
      enableSorting: false,
      cell: ({ row }) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row?.original?.accessGranted ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'}`}>
          {row?.original?.accessGranted ? 'Granted' : 'Not Granted'}
        </span>
      ),
      meta: {
        headerClassName: 'min-w-[120px]'
      }
    },
  ], []);

  const ToolbarTable = () => {
    const {
      table
    } = useDataGrid();
    return (
      <div className="card-header px-5 py-5 border-b-0 flex-wrap gap-2">
        <h3 className="card-title">{title}</h3>
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <KeenIcon icon="magnifier" className="leading-none text-md text-gray-500 absolute top-1/2 start-0 -translate-y-1/2 ms-3" />
            <input 
              type="text" 
              placeholder="Search by email, name, or transaction..." 
              className="input input-md ps-8" 
              value={searchTerm} 
              onChange={e => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
            />
          </div>
          <Select value={statusFilter || "approved"} onValueChange={(value) => {
            setStatusFilter(value === "all" ? "" : value);
            setCurrentPage(1);
          }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="approved">Approved Only</SelectItem>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
          <DataGridColumnVisibility table={table} />
        </div>
      </div>
    );
  };

  return (
    <div className='container-fluid mt-5'>
      <Toolbar>
        <ToolbarHeading>
          <ToolbarPageTitle text="Course Purchases" />
          <ToolbarDescription>
            View and manage all course purchase records from Hotmart payments.
          </ToolbarDescription>
        </ToolbarHeading>
        <ToolbarActions>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-white dark:bg-gray-200 p-4 rounded-lg border">
              <div className="text-sm text-gray-500 dark:text-gray-800 mb-2">Total Purchases</div>
              <div className="text-2xl font-bold">{stats.total || 0}</div>
            </div>
            <div className="bg-white dark:bg-gray-200 p-4 rounded-lg border">
              <div className="text-sm text-gray-500 dark:text-gray-800 mb-2">Approved</div>
              <div className="text-2xl font-bold text-green-600">{stats.approved || 0}</div>
            </div>
            <div className="bg-white dark:bg-gray-200 p-4 rounded-lg border">
              <div className="text-sm text-gray-500 dark:text-gray-800 mb-2">Total Revenue</div>
              <div className="text-2xl font-bold text-primary">${(stats.totalRevenue || 0).toFixed(2)}</div>
            </div>
          </div>
        </ToolbarActions>
      </Toolbar>
      <DataGrid
        serverSide={false}
        loading={isLoading} 
        columns={columns} 
        rowSelection={false} 
        pagination={{
          size: 50,
          pageIndex: currentPage - 1,
          pageSize: 50,
          total: pagination.total,
          onPageChange: (page) => setCurrentPage(page + 1),
        }} 
        toolbar={<ToolbarTable />} 
        layout={{
          card: true
        }}
        data={purchases || []}
      />
    </div>
  )
};

export default AdminPurchase;
