/* eslint-disable prettier/prettier */
import * as React from 'react';
import { useMemo, useState } from 'react';
import { useLanguage } from '@/i18n';
import {
  DataGrid,
  DataGridColumnHeader,
  DataGridColumnVisibility,
  KeenIcon,
  useDataGrid,
  Menu,
  MenuItem,
  MenuToggle,
} from '@/components';
import { toast } from 'sonner';
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from '@/partials/toolbar';
import {
  MenuIcon,
  MenuLink,
  MenuSub,
  MenuTitle
} from '@/components';
import CreateBanner from './CreateBanner';
import DeleteBanner from './DeleteBanner';
import { useLazyGetBannersQuery, useUpdateBannerMutation } from '../../../../store/api/admin/adminBannersApiSlice';
import { Switch } from '../../../../components/ui/switch';


// ✅ MOVED OUTSIDE COMPONENT
const ToolbarTable = ({ searchTerm, setSearchTerm, title }) => {
  const { table } = useDataGrid();

  return (
    <div className="card-header px-5 py-5 border-b-0 flex-wrap gap-2">
      <h3 className="card-title">{title}</h3>
      <div className="flex flex-wrap items-center gap-2.5">
        <DataGridColumnVisibility table={table} />
      </div>
    </div>
  );
};


const Banners = ({ title = "Banners" }) => {
  const [activeTab, setActiveTab] = useState('left'); // 'left' or 'right'
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [getBanners, { data, isLoading }] = useLazyGetBannersQuery();
  const [updateBanner] = useUpdateBannerMutation();
  const [toggleStatusData, setToggleStatusData] = useState([]);

  const { isRTL } = useLanguage();

  const handleClickOpen = () => {
    setSelectedRow({ position: activeTab }); // Set position based on active tab
    setIsCreateOpen(true);
  };
  
  const handleDeleteOpen = () => setIsDeleteOpen(true);
  const handleDeleteClose = () => setIsDeleteOpen(false);
  const handleCloseCreate = () => setIsCreateOpen(false);

  const handleRowSelection = state => {
    const selectedRowIds = Object.keys(state);
    if (selectedRowIds.length > 0) {
      toast(`Total ${selectedRowIds.length} are selected.`, {
        description: `Selected row IDs: ${selectedRowIds}`,
        action: {
          label: 'Undo',
          onClick: () => console.log('Undo'),
        },
      });
    }
  };

  // ✅ Re-fetch on search term or active tab change
  const [tableKey, setTableKey] = useState(0);
  const reloadTable = () => setTableKey(prev => prev + 1);

  React.useEffect(() => {
    reloadTable();
  }, [searchTerm, activeTab]);


  const handleFetchData = async ({ pageIndex, pageSize }) => {
    const newPage = pageIndex + 1;
    const newLimit = pageSize;

    try {
      const response = await getBanners({
        page: newPage,
        limit: newLimit,
        search: searchTerm,
        position: activeTab, // Use activeTab instead of positionFilter
      }).unwrap();
      setToggleStatusData(response.data);
      return {
        data: response.data || [],
        totalCount: response.pagination?.total || 0,
      };
    } catch (error) {
      return { data: [], totalCount: 0 };
    }
  };

  const ActionMenu = () => (
    <MenuSub className="menu-default" rootClassName="w-full max-w-[200px]">
      <MenuItem onClick={() => setIsCreateOpen(true)}>
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
  );

  const handleVisibilityToggle = async (bannerId, currentVisibility, position) => {
    try {
      const newVisibility = !Boolean(currentVisibility);

      // Optimistically update UI
      setToggleStatusData(toggleStatusData.map(banner => 
        banner._id === bannerId ? { ...banner, status: newVisibility } : banner
      ));
      
      const payload = toggleStatusData.find(banner => banner._id === bannerId);
      
      // Create FormData for status update
      const formData = new FormData();
      formData.append('title', payload.title);
      formData.append('link', payload.link || '');
      formData.append('openInNewTab', payload.openInNewTab);
      formData.append('status', String(newVisibility));
      formData.append('position', payload.position);
      
      await updateBanner({ 
        id: bannerId, 
        formData 
      }).unwrap();
      
      toast.success(`Banner status updated to ${newVisibility ? 'Active' : 'Inactive'}`);
      
      // Reload to reflect changes (other banners in same position will be deactivated)
      reloadTable();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to update banner status');
      reloadTable();
    }
  };

  const columns = useMemo(() => [
    {
      accessorFn: row => `${row.title}`,
      id: 'title',
      header: ({ column }) => <DataGridColumnHeader title='Title' column={column} />,
      enableSorting: true,
      cell: info => <div>{info.getValue()}</div>,
      meta: { headerClassName: 'min-w-[200px]' },
    },
    {
      id: 'desktopImage',
      header: () => 'Desktop',
      enableSorting: false,
      cell: ({ row }) => (
        <img 
          src={row.original.desktopImage} 
          alt="Desktop" 
          className="h-12 w-auto object-contain"
        />
      ),
    },
    {
      id: 'mobileImage',
      header: () => 'Mobile',
      enableSorting: false,
      cell: ({ row }) => (
        <img 
          src={row.original.mobileImage} 
          alt="Mobile" 
          className="h-12 w-auto object-contain"
        />
      ),
    },
    {
      accessorFn: row => row.link || 'No link',
      id: 'link',
      header: ({ column }) => <DataGridColumnHeader title='Link' column={column} />,
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row?.original?.link ? (
            <a
              href={row?.original?.link}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 py-1 bg-gray-100 dark:bg-gray-200 rounded text-sm font-mono text-primary hover:underline break-all max-w-[300px] truncate"
              title={row?.original?.link}
            >
              {row?.original?.link}
            </a>
          ) : (
            <span className="text-gray-500 text-xs">No link</span>
          )}
        </div>
      ),
      meta: {
        headerClassName: 'min-w-[250px]'
      }
    },
    {
      id: 'status',
      header: () => 'Active',
      enableSorting: false,
      cell: ({ row }) => {
        const banner = toggleStatusData.find(b => b._id === row?.original?._id);
        return (
          <Switch
            checked={banner?.status}
            onCheckedChange={() => handleVisibilityToggle(
              row?.original?._id, 
              banner?.status,
              row?.original?.position
            )}
          />
        );
      },
    },
    {
      id: 'click',
      header: () => '',
      enableSorting: false,
      cell: ({ row }) => (
        <Menu className="items-stretch">
          <MenuItem
            toggle="dropdown"
            onClick={() => setSelectedRow(toggleStatusData.find(banner => banner._id === row?.original?._id))}
            trigger="click"
            dropdownProps={{
              placement: isRTL() ? 'bottom-start' : 'bottom-end',
              modifiers: [
                {
                  name: 'offset',
                  options: { offset: isRTL() ? [0, -10] : [0, 10] },
                },
              ],
            }}
          >
            <MenuToggle className="btn btn-sm btn-icon btn-light btn-clear">
              <KeenIcon icon="dots-vertical" />
            </MenuToggle>
            {ActionMenu()}
          </MenuItem>
        </Menu>
      ),
      meta: { headerClassName: 'w-[150px]' },
    }
  ], [isRTL, toggleStatusData, handleVisibilityToggle]);

  return (
    <div className='mt-5'>
      <Toolbar>
        <ToolbarHeading>
          <ToolbarPageTitle text="Banners" />
          <ToolbarDescription>
            Manage multiple banners for left and right positions. Only one banner per position can be active at a time.
          </ToolbarDescription>
        </ToolbarHeading>
        <ToolbarActions>
          <div className="text-end pb-4">
            <button className='btn btn-primary' onClick={handleClickOpen}>
              <KeenIcon icon="plus" className="mr-2" />
              Create {activeTab === 'left' ? 'Left' : 'Right'} Banner
            </button>
          </div>
        </ToolbarActions>
      </Toolbar>

      {/* Tabs */}
      <div className="card mb-5">
        <div className="card-header border-b-0">
          <div className="flex gap-2">
            <button
              className={`btn ${activeTab === 'left' ? 'btn-primary' : 'btn-light'}`}
              onClick={() => setActiveTab('left')}
            >
              <KeenIcon icon="arrow-left" className="mr-2" />
              Left Banners
            </button>
            <button
              className={`btn ${activeTab === 'right' ? 'btn-primary' : 'btn-light'}`}
              onClick={() => setActiveTab('right')}
            >
              <KeenIcon icon="arrow-right" className="mr-2" />
              Right Banners
            </button>
          </div>
        </div>
      </div>

      <DataGrid
        key={tableKey}
        serverSide={true}
        loading={isLoading}
        columns={columns}
        rowSelection={true}
        onRowSelectionChange={handleRowSelection}
        pagination={{ size: 10 }}
        toolbar={
          <ToolbarTable
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            title={`${activeTab === 'left' ? 'Left' : 'Right'} Banners`}
          />
        }
        layout={{ card: true }}
        onFetchData={handleFetchData}
      />

      <CreateBanner
        setSelectedRow={setSelectedRow}
        handleCloseCreate={handleCloseCreate}
        refetch={reloadTable}
        isCreateOpen={isCreateOpen}
        setIsCreateOpen={setIsCreateOpen}
        selectedRow={selectedRow}
      />

      {isDeleteOpen && (
        <DeleteBanner
          refetch={reloadTable}
          isDeleteOpen={isDeleteOpen}
          handleDeleteClose={handleDeleteClose}
          selectedRow={selectedRow}
          setSelectedRow={setSelectedRow}
        />
      )}
    </div>
  );
};

export default Banners;
