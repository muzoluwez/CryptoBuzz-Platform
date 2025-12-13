
import { useState } from "react";
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from "@/partials/toolbar";
import DeleteAdminRecording from "./DeleteAdminRecording";
import { useLazyGetAdminRecordingQuery } from "../../../store/api/admin/adminRecordingApiSlice";
import EducatorViseRecording from "./EducatorViseRecording";
import { useEffect } from "react";
import CreateManualAdminRecording from "./CreateManualAdminRecording";

const AdminRecording = ({ title = "Recorded Academy" }) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState({});
  const [
    getEducators,
    { data, isLoading, refetch, error, isError, isFetching },
  ] = useLazyGetAdminRecordingQuery();

  const handleClickOpen = () => {
    setIsCreateOpen(true);
  };

  const handleDeleteOpen = () => {
    setIsDeleteOpen(true);
  };

  const handleDeleteClose = () => {
    setIsDeleteOpen(false);
  };


  const handleCloseCreate = () => {
    setIsCreateOpen(false);
  };

  const handleFetchData = async () => {
    try {
      // Fetch API Data
      const response = await getEducators().unwrap();

      return {
        data: response.data || [],
        totalCount: response.pagination?.totalRecords || 0,
      };
    } catch (error) {
      console.error("Error fetching educators:", error);
      return { data: [], totalCount: 0 };
    }
  };

  const reloadTable = () => {
    handleFetchData();
  };

  useEffect(() => {
    handleFetchData();
  }, []);

  return (
    <div className="container-fluid pb-5">
      <Toolbar>
        <ToolbarHeading>
          <ToolbarPageTitle text="Educator & Admin Recordings" />
          <ToolbarDescription>
            View and access all video recordings uploaded by educators and
            admins.
          </ToolbarDescription>
        </ToolbarHeading>
        <ToolbarActions>
          <div className="text-end pb-4">
            <button className="btn btn-primary" onClick={handleClickOpen}>
              Upload recorded session
            </button>
          </div>
        </ToolbarActions>
      </Toolbar>
      <EducatorViseRecording
        data={data?.data}
        isLoading={isLoading}
        error={error}
        isError={isError}
        isFetching={isFetching}
      />
      {isCreateOpen && (
        <CreateManualAdminRecording
          setSelectedRow={setSelectedRow}
          handleCloseCreate={handleCloseCreate}
          refetch={getEducators}
          isCreateOpen={isCreateOpen}
          setIsCreateOpen={setIsCreateOpen}
          selectedRow={selectedRow}
          onUpdateSuccess={() => { }}
        />
      )}
      {isDeleteOpen && (
        <DeleteAdminRecording
          refetch={reloadTable}
          isDeleteOpen={isDeleteOpen}
          handleDeleteClose={handleDeleteClose}
          selectedRow={selectedRow}
          onDeleteSuccess={() => { }}
        />
      )}
    </div>
  );
};
export default AdminRecording;
