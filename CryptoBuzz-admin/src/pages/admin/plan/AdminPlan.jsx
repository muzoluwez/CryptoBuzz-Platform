/* eslint-disable prettier/prettier */
import * as React from 'react';
import { useMemo, useState, useEffect } from 'react';
import { useLanguage } from '@/i18n';
import { DataGrid, DataGridColumnHeader, DataGridColumnVisibility, KeenIcon, useDataGrid, Menu, MenuItem, MenuToggle } from '@/components';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Toolbar, ToolbarActions, ToolbarDescription, ToolbarHeading, ToolbarPageTitle } from '@/partials/toolbar';
import { MenuIcon, MenuLink, MenuSub, MenuTitle } from '@/components';
import { TruncatedText } from '../../../lib/utils';
import CreateAdminPlan from './CreateAdminPlan';
import DeleteAdminPlan from './DeleteAdminPlan';
import { useLazyGetPlansQuery, useUpdatePlanMutation } from '../../../store/api/admin/adminPlanApiSlice';
import { Switch } from '../../../components/ui/switch';

const AdminPlan = ({ title = "Payment Plans" }) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState({});
  const [getPlans, { isLoading }] = useLazyGetPlansQuery();
  const [toggleStatusData, setToggleStatusData] = useState([]);
  const [updatePlan] = useUpdatePlanMutation();

  const handleClickOpen = () => {
    setIsCreateOpen(true);
  };

  const handleDeleteOpen = () => {
    setIsDeleteOpen(true);
  };

  const handleDeleteClose = () => {
    setIsDeleteOpen(false);
  }

  const {
    isRTL
  } = useLanguage();
  const storageFilterId = 'plans-filter';
  const ColumnInputFilter = ({
    column
  }) => {
    return <Input placeholder="Filter..." value={column.getFilterValue() ?? ''} onChange={event => column.setFilterValue(event.target.value)} className="h-9 w-full max-w-40" />;
  };

  const ActionMenu = () => {
    return (
      <MenuSub className="menu-default" rootClassName="w-full max-w-[200px]">
        <MenuItem onClick={() => setIsCreateOpen(!isCreateOpen)}>
          <MenuLink>
            <MenuIcon>
              <KeenIcon icon="notepad-edit" />
            </MenuIcon>
            <MenuTitle>Edit</MenuTitle>
          </MenuLink>
        </MenuItem>
        <MenuItem onClick={handleDeleteOpen}>
          <MenuLink>
            <MenuIcon>
              <KeenIcon icon="trash" />
            </MenuIcon>
            <MenuTitle>Delete</MenuTitle>
          </MenuLink>
        </MenuItem>
      </MenuSub>
    )
  }

  const handleVisibilityToggle = async (planId, currentStatus) => {
    try {
      const newStatus = currentStatus === "active" ? "inactive" : "active";

      setToggleStatusData(toggleStatusData.map(plan => plan._id === planId ? { ...plan, status: newStatus } : plan));
      const payload = toggleStatusData.find(plan => plan._id === planId);
      // Make API call
      await updatePlan({ id: payload?._id, data: { ...payload, status: newStatus } }).unwrap();
      toast.success(`Plan status updated to ${newStatus}`);
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to update plan status');
    }
  };

  const columns = useMemo(() => [
    {
      accessorFn: row => row.name,
      id: 'name',
      header: ({
        column
      }) => <DataGridColumnHeader title='Plan Name' column={column} />,
      enableSorting: true,
      cell: info => <div className="flex items-center gap-2.5">
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold">{info.row?.original?.name}</span>
          {info.row?.original?.description && (
            <span className="text-sm text-gray-500 truncate max-w-[300px]">
              {info.row?.original?.description}
            </span>
          )}
        </div>
      </div>,
      meta: {
        headerClassName: 'min-w-[250px]'
      }
    },
    {
      accessorFn: row => row.price,
      id: 'price',
      header: ({
        column
      }) => <DataGridColumnHeader title='Price' column={column} />,
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-semibold text-primary">
            ${(row?.original?.price || 0).toFixed(2)}
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
      accessorFn: row => row.hotmartCheckoutUrl,
      id: 'hotmartCheckoutUrl',
      header: ({
        column
      }) => <DataGridColumnHeader title='Hotmart Checkout URL' column={column} />,
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <a
            href={row?.original?.hotmartCheckoutUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2 py-1 bg-gray-100 dark:bg-gray-200 rounded text-sm font-mono text-primary hover:underline break-all max-w-[300px] truncate"
            title={row?.original?.hotmartCheckoutUrl}
          >
            {row?.original?.hotmartCheckoutUrl || 'N/A'}
          </a>
        </div>
      ),
      meta: {
        headerClassName: 'min-w-[300px]'
      }
    },
    {
      id: 'status',
      header: () => 'Status',
      enableSorting: false,
      cell: ({ row }) => {
        const planStatus = toggleStatusData.find(plan => plan._id === row?.original?._id)?.status || row?.original?.status;
        return (
          <Switch
            checked={planStatus === "active"}
            onCheckedChange={() => handleVisibilityToggle(row?.original?._id, planStatus)}
          />
        );
      },
    },
    {
      id: 'click',
      header: () => '',
      enableSorting: false,
      cell: ({ row }) => <Menu className="items-stretch">
        <MenuItem toggle="dropdown"
          onClick={() => setSelectedRow(toggleStatusData.find(plan => plan._id === row?.original?._id) || row?.original)}
          trigger="click" dropdownProps={{
            placement: isRTL() ? 'bottom-start' : 'bottom-end',
            modifiers: [{
              name: 'offset',
              options: {
                offset: isRTL() ? [0, -10] : [0, 10] // [skid, distance]
              }
            }]
          }}>
          <MenuToggle className="btn btn-sm btn-icon btn-light btn-clear">
            <KeenIcon icon="dots-vertical" />
          </MenuToggle>
          {ActionMenu()}
        </MenuItem>
      </Menu>,
      meta: {
        headerClassName: 'w-[60px]'
      }
    }
  ], [isRTL, toggleStatusData, handleVisibilityToggle]);

  // Initialize search term from localStorage if available
  const [searchTerm, setSearchTerm] = useState(() => {
    return localStorage.getItem(storageFilterId) || '';
  });

  // Filtered data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return toggleStatusData; // If no search term, return full data
    // Filter by name, checkout URL, or checkout code
    return toggleStatusData?.filter(plan => 
      plan.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.hotmartCheckoutUrl?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.hotmartCheckoutCode?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];
  }, [searchTerm, toggleStatusData]);

  const handleRowSelection = state => {
    const selectedRowIds = Object.keys(state);
    if (selectedRowIds.length > 0) {
      toast(`Total ${selectedRowIds.length} are selected.`, {
        description: `Selected row IDs: ${selectedRowIds}`,
        action: {
          label: 'Undo',
          onClick: () => console.log('Undo')
        }
      });
    }
  };

  const ToolbarTable = () => {
    const {
      table
    } = useDataGrid();
    return <div className="card-header px-5 py-5 border-b-0 flex-wrap gap-2">
      <h3 className="card-title">{title}</h3>

      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative">
          <KeenIcon icon="magnifier" className="leading-none text-md text-gray-500 absolute top-1/2 start-0 -translate-y-1/2 ms-3" />
          <input 
            type="text" 
            placeholder="Search Plans..." 
            className="input input-md ps-8" 
            value={searchTerm} 
            onChange={e => {
              setSearchTerm(e.target.value);
              localStorage.setItem(storageFilterId, e.target.value);
            }}
          />
        </div>
        <DataGridColumnVisibility table={table} />
      </div>
    </div>;
  };

  const handleCloseCreate = () => {
    setIsCreateOpen(false);
  };


  const [tableKey, setTableKey] = useState(0); // ✅ Key to trigger re-render

  // Fetch plans on component mount and when search term changes
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        console.log("Fetching plans with search:", searchTerm);
        const response = await getPlans({ search: searchTerm }).unwrap();
        console.log("Plans response:", response);
        setToggleStatusData(response.data || []);
      } catch (error) {
        console.error("Error fetching plans:", error);
        toast.error(error?.data?.message || "Failed to fetch plans");
      }
    };

    fetchPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]); // Re-fetch when search term changes

  const reloadTable = () => {
    const fetchPlans = async () => {
      try {
        const response = await getPlans({ search: searchTerm }).unwrap();
        setToggleStatusData(response.data || []);
        setTableKey(prevKey => prevKey + 1); // ✅ Change key to force re-render
      } catch (error) {
        console.error("Error fetching plans:", error);
        toast.error("Failed to fetch plans");
      }
    };
    fetchPlans();
  };

  return (
    <div className='container-fluid mt-5'>
      <Toolbar>
        <ToolbarHeading>
          <ToolbarPageTitle text="Payment Plans" />
          <ToolbarDescription>
            Manage payment plans for premium courses. Plans control Hotmart checkout codes and pricing.
          </ToolbarDescription>
        </ToolbarHeading>
        <ToolbarActions>
          <div className="text-end pb-4">
            <button className='btn btn-primary' onClick={handleClickOpen}>
              Create Payment Plan
            </button>
          </div>
        </ToolbarActions>
      </Toolbar>
      <DataGrid
        key={tableKey}
        serverSide={false}
        loading={isLoading} 
        columns={columns} 
        rowSelection={true} 
        onRowSelectionChange={handleRowSelection} 
        pagination={{
          size: 10,
        }} 
        toolbar={<ToolbarTable />} 
        layout={{
          card: true
        }}
        data={filteredData || []}
      />
      <CreateAdminPlan 
        setSelectedRow={setSelectedRow} 
        handleCloseCreate={handleCloseCreate} 
        refetch={reloadTable} 
        isCreateOpen={isCreateOpen} 
        setIsCreateOpen={setIsCreateOpen} 
        selectedRow={selectedRow} 
      />
      {isDeleteOpen && (
        <DeleteAdminPlan 
          refetch={reloadTable} 
          isDeleteOpen={isDeleteOpen} 
          handleDeleteClose={handleDeleteClose} 
          selectedRow={selectedRow} 
        />
      )}
    </div>
  )
};

export default AdminPlan;
