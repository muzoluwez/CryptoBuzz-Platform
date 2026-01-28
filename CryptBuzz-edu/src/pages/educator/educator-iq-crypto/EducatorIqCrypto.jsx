/* eslint-disable prettier/prettier */
import * as React from "react";
import { useMemo, useState } from "react";
import { useLanguage } from "@/i18n";
import {
  DataGrid,
  DataGridColumnHeader,
  DataGridColumnVisibility,
  KeenIcon,
  useDataGrid,
  Menu,
  MenuItem,
  MenuToggle,
} from "@/components";
import { toast } from "sonner";
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from "@/partials/toolbar";
import { MenuIcon, MenuLink, MenuSub, MenuTitle } from "@/components";
import { useLazyGetEducatorIqCryptoQuery } from "../../../store/api/educator/educatorIqCryptoApiSlice";
import DeleteEducatorIqCrypto from "./DeleteEducatorIqCrypto";
import CreateEducatorIqCrypto from "./CreateEducatorIqCrypto";
import ViewEducatorIqCrypto from "./ViewEducatorIqCrypto";
import { PlayIcon } from "lucide-react";

const EducatorIqCrypto = ({ title = "Cripto Projects" }) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState({});
  const [isLightBoxOpen, setIsLightBoxOpen] = useState(false);
  const [getEducatorIqCrypto, { data, isLoading, refetch }] =
    useLazyGetEducatorIqCryptoQuery();

  const handleCloseView = () => {
    setIsLightBoxOpen(false);
  };
  const handleClickOpen = () => {
    setSelectedRow({});
    setIsCreateOpen(true);
  };

  const handleDeleteOpen = () => {
    setIsDeleteOpen(true);
  };

  const handleDeleteClose = () => {
    setSelectedRow({});
    setIsDeleteOpen(false);
  };

  const { isRTL } = useLanguage();

  // Helper function to check if video is uploaded (not external URL)
  const isUploadedVideo = (url) => {
    if (!url || typeof url !== 'string') return false;
    // Check if it's an external video URL
    const lower = url.toLowerCase();
    return !(
      lower.includes('youtube.com') ||
      lower.includes('youtu.be') ||
      lower.includes('vimeo.com') ||
      lower.includes('loom.com') ||
      lower.includes('loom.share') ||
      lower.includes('stream.mux.com') ||
      lower.includes('player.mux.com')
    );
  };

  // Helper function to get video thumbnail URL
  const getVideoThumbnail = (url) => {
    if (!url) return "";
    const lower = url.toLowerCase();

    if (isUploadedVideo(url)) return "";

    if (lower.includes("youtube.com/watch?v=")) {
      try {
        const id = url.split("v=")[1].split("&")[0];
        return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
      } catch (e) { }
    }
    if (lower.includes("youtu.be/")) {
      try {
        const id = url.split("youtu.be/")[1].split("?")[0];
        return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
      } catch (e) { }
    }

    if (lower.includes("vimeo.com/")) {
      try {
        const id = url.split("vimeo.com/")[1].split("?")[0].split("/")[0];
        return `https://vumbnail.com/${id}.jpg`;
      } catch (e) { }
    }

    if (lower.includes("loom.com/")) {
      try {
        const parts = url.split("loom.com/")[1];
        const id = parts.split("/")[1] || parts.split("/")[0];
        return `https://cdn.loom.com/sessions/thumbnails/${id}-00001.jpg`;
      } catch (e) { }
    }

    if (
      lower.includes("stream.mux.com/") ||
      lower.includes("player.mux.com/")
    ) {
      try {
        const id = url
          .split("mux.com/")[1]
          .split("?")[0]
          .split(".")[0]
          .split("/")[0];
        return `https://image.mux.com/${id}/thumbnail.jpg`;
      } catch (e) { }
    }

    return "";
  };

  const ActionMenu = (row) => {
    return (
      <MenuSub className="menu-default" rootClassName="w-full max-w-[200px]">
        <MenuItem
          onClick={() => {
            setSelectedRow(row || {});
            setIsCreateOpen(!isCreateOpen);
          }}
        >
          <MenuLink>
            <MenuIcon>
              <KeenIcon icon="notepad-edit" />
            </MenuIcon>
            <MenuTitle>Edit</MenuTitle>
          </MenuLink>
        </MenuItem>
        <MenuItem
          onClick={() => {
            setIsDeleteOpen(true);
            setSelectedRow(row);
          }}
        >
          <MenuLink>
            <MenuIcon>
              <KeenIcon icon="trash" />
            </MenuIcon>
            <MenuTitle>Delete</MenuTitle>
          </MenuLink>
        </MenuItem>
      </MenuSub>
    );
  };

  const columns = useMemo(
    () => [
      {
        accessorFn: (row) => row.image,
        id: "image",
        header: ({ column }) => (
          <DataGridColumnHeader title="Image/Video" column={column} />
        ),
        enableSorting: false,
        cell: ({ row }) => {
          // Handle image display - support string, array, or null
          const imageData = row?.original?.image;
          const photosData = row?.original?.photos;
          const videoUrl = row?.original?.videoUrl;
          const mediaType = row?.original?.mediaType;

          // Get image URL - handle different formats
          let imageUrl = null;
          if (Array.isArray(imageData) && imageData.length > 0) {
            imageUrl = imageData[0];
          } else if (typeof imageData === 'string') {
            imageUrl = imageData;
          } else if (Array.isArray(photosData) && photosData.length > 0) {
            imageUrl = photosData[0];
          } else if (photosData && typeof photosData === 'string') {
            imageUrl = photosData;
          }

          // Show video icon if video is present
          const isVideo = mediaType === 'video' || videoUrl;

          return (
            <div
              className="flex flex-col justify-center items-center gap-0.5"
              onClick={() => {
                setSelectedRow(row.original);
                setIsLightBoxOpen(true);
              }}
            >
              {isVideo ? (() => {
                const thumbnailUrl = getVideoThumbnail(videoUrl);
                const srcVideoUrl = isUploadedVideo(videoUrl) ? videoUrl : "";
                return thumbnailUrl ? (
                  <div className="cursor-pointer relative inline-block">
                    <img
                      src={thumbnailUrl}
                      alt="Video thumbnail"
                      className="cursor-pointer size-20 rounded-lg shrink-0 object-cover"
                      onError={(e) => {
                        // Fallback if thumbnail fails to load
                        e.target.style.display = 'none';
                      }}
                    />
                    {/* Play Icon Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                      <PlayIcon className="text-primary size-6" />
                    </div>
                  </div>
                ) : (
                  <div className="text-white text-center">
                    <div className="cursor-pointer relative inline-block">
                      {srcVideoUrl && (
                        <video
                          src={srcVideoUrl}
                          className="size-20 rounded-lg object-cover"
                          muted
                        />
                      )}

                      {/* Play Icon Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                        <PlayIcon className="text-primary size-6" />
                      </div>
                    </div>
                  </div>
                );
              })() : imageUrl ? (
                <img
                  src={imageUrl}
                  className="cursor-pointer size-20 rounded-lg shrink-0 object-cover"
                  alt=""
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="cursor-pointer size-10 shrink-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <i className="ki-filled ki-picture text-gray-400 text-lg"></i>
                </div>
              )}
            </div>
          );
        },
        meta: {
          headerClassName: "min-w-[100px]",
        },
      },
      {
        accessorFn: (row) => row.title,
        id: "title",
        header: ({ column }) => (
          <DataGridColumnHeader title="Title" column={column} />
        ),
        enableSorting: true,
        cell: (info) => (
          <div className="flex items-center gap-2.5">
            <div className="flex flex-col gap-0.5">
              <a
                className="leading-none font-medium text-sm text-gray-900 hover:text-primary"
                href="#"
              >
                {info.row?.original?.title}
              </a>
            </div>
          </div>
        ),
        meta: {
          headerClassName: "min-w-[200px]",
        },
      },
      {
        accessorFn: (row) => row.name,
        id: "Category",
        header: ({ column }) => (
          <DataGridColumnHeader title="Category" column={column} />
        ),
        enableSorting: true,
        cell: (info) => (
          <div className="flex items-center gap-2.5">
            <div className="flex flex-col gap-0.5">
              <p>Crypto</p>
            </div>
          </div>
        ),
        meta: {
          headerClassName: "min-w-[200px]",
        },
      },
      {
        id: "click",
        header: () => "",
        enableSorting: false,
        cell: ({ row }) => (
          <Menu className="items-stretch">
            <MenuItem
              toggle="dropdown"
              // onClick={() => setSelectedRow(row.original)} // ✅ Set selected row
              trigger="click"
              dropdownProps={{
                placement: isRTL() ? "bottom-start" : "bottom-end",
                modifiers: [
                  {
                    name: "offset",
                    options: {
                      offset: isRTL() ? [0, -10] : [0, 10], // [skid, distance]
                    },
                  },
                ],
              }}
            >
              <MenuToggle className="btn btn-sm btn-icon btn-light btn-clear">
                <KeenIcon icon="dots-vertical" />
              </MenuToggle>
              {ActionMenu(row.original)}
            </MenuItem>
          </Menu>
        ),
        meta: {
          headerClassName: "w-[60px]",
        },
      },
    ],
    [isRTL]
  );

  const handleRowSelection = (state) => {
    const selectedRowIds = Object.keys(state);
    if (selectedRowIds.length > 0) {
      toast(`Total ${selectedRowIds.length} are selected.`, {
        description: `Selected row IDs: ${selectedRowIds}`,
        action: {
          label: "Undo",
          onClick: () => console.log("Undo"),
        },
      });
    }
  };
  const ToolbarTable = () => {
    const { table } = useDataGrid();
    return (
      <div className="card-header px-5 py-5 border-b-0 flex-wrap gap-2">
        <h3 className="card-title">{title}</h3>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            {/* <KeenIcon
              icon="magnifier"
              className="leading-none text-md text-gray-500 absolute top-1/2 start-0 -translate-y-1/2 ms-3"
            />
            <input
              type="text"
              placeholder="Search Members"
              className="input input-md ps-8 h-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} // Update search term
            /> */}
          </div>
          <DataGridColumnVisibility table={table} />
        </div>
      </div>
    );
  };

  const handleCloseCreate = () => {
    setSelectedRow({});
    setIsCreateOpen(false);
  };

  const handleFetchData = async ({ pageIndex, pageSize }) => {
    const newPage = pageIndex + 1;
    const newLimit = pageSize;

    try {
      // Fetch API Data
      const response = await getEducatorIqCrypto({
        page: newPage,
        limit: newLimit,
      }).unwrap();

      return {
        data: response.data || [],
        totalCount: response.pagination?.totalRecords || 0,
      };
    } catch (error) {
      // console.error("Error fetching Crypto Project :", error);
      return { data: [], totalCount: 0 };
    }
  };

  const [tableKey, setTableKey] = useState(0); // ✅ Key to trigger re-render

  const reloadTable = () => {
    setTableKey((prevKey) => prevKey + 1); // ✅ Change key to force re-fetch
  };

  return (
    <div className="container-fluid">
      <>
        <Toolbar>
          <ToolbarHeading>
            <ToolbarPageTitle text="Cripto Projects" />
            <ToolbarDescription>
              Generate, analyze, and execute profitable trading opportunities
              with smart insights, market trends, and data-driven strategies
            </ToolbarDescription>
          </ToolbarHeading>
          <ToolbarActions>
            <div className="text-end ">
              <button className="btn btn-primary" onClick={handleClickOpen}>
                Create Cripto Project
              </button>
            </div>
          </ToolbarActions>
        </Toolbar>

        <DataGrid
          key={tableKey}
          serverSide={true}
          loading={isLoading}
          columns={columns}
          rowSelection={true}
          onRowSelectionChange={handleRowSelection}
          pagination={{ size: 10 }}
          toolbar={<ToolbarTable />}
          layout={{ card: true }}
          onFetchData={handleFetchData}
        />

        <ViewEducatorIqCrypto
          isViewOpen={isLightBoxOpen}
          setIsLightBoxOpen={setIsLightBoxOpen}
          handleCloseView={handleCloseView}
          selectedIdea={selectedRow}
        />

        <CreateEducatorIqCrypto
          setSelectedRow={setSelectedRow}
          handleCloseCreate={handleCloseCreate}
          refetch={reloadTable}
          isCreateOpen={isCreateOpen}
          setIsCreateOpen={setIsCreateOpen}
          selectedRow={selectedRow}
        />

        {isDeleteOpen && (
          <DeleteEducatorIqCrypto
            refetch={reloadTable}
            isDeleteOpen={isDeleteOpen}
            handleDeleteClose={handleDeleteClose}
            selectedRow={selectedRow}
            setSelectedRow={setSelectedRow}
          />
        )}
      </>
    </div>
  );
};
export default EducatorIqCrypto;





















