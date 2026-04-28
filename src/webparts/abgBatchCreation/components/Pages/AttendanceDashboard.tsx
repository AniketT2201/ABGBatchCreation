import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import type { IAbgBatchCreationProps } from '../IAbgBatchCreationProps';
import { useHistory } from 'react-router-dom';
import { CSVLink } from "react-csv";
import { Icon } from '@fluentui/react/lib/Icon';
import ViewAllocatedEmployeeOps from '../../services/BAL/ViewAllocatedEmployee';
import logo from '../../assets/ABGlogo.jpg';
import { Search24Regular } from "@fluentui/react-icons";
import { SPComponentLoader } from '@microsoft/sp-loader';
import './CSS/styles.scss';
import './CSS/TNICreation.scss';
import { IViewAllocatedEmployee } from '../../services/interface/IViewAllocatedEmployee';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes,
  faPlus,
  faEdit,
  faEye
} from '@fortawesome/free-solid-svg-icons';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { formatDate } from '../../services/Helper';
import EmployeeSupervisorOps from '../../services/BAL/EmployeeSupervisor';
import BatchCreationSpCrudOps from '../../services/BAL/BatchCreationSpCrud';
import Swal from 'sweetalert2';




// Load Bootstrap + FontAwesome
SPComponentLoader.loadCss('https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css');
SPComponentLoader.loadCss('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css');

export const AttendanceDashboard: React.FunctionComponent<IAbgBatchCreationProps> = (props: IAbgBatchCreationProps) => {
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("Pending");
  const [visible, setVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [filteredData, setFilteredData] = useState<IViewAllocatedEmployee[]>([]);
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, filteredData.length);
  const currentRows = filteredData.slice(startIndex, endIndex);
  const [DashboardData, setDashboardData] = React.useState<IViewAllocatedEmployee[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [allSelected, setAllSelected] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [remark, setRemark] = useState('');
  

  useEffect(() => {
    // Fetch dashboard data when component mounts
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
          let filter;
          if (activeTab === 'Pending') {
              filter = `EmployeeFlag eq 'Active' and (SupervisorStatus eq 'Approved' or TrainingCoOrdinatorStatus eq 'Approved') and BatchName/BatchStatusforAllocation eq'select'`;
          } else if (activeTab === 'Present') {
              filter = `EmployeeFlag eq 'Active' and Attendance eq 'Present' and BatchName/BatchStatusforAllocation eq 'select'`;
          } else if (activeTab === 'Absent') {
              filter = `EmployeeFlag eq 'Active' and Attendance eq 'Absent' and BatchName/BatchStatusforAllocation eq 'select'`;
          }
          const Data = await ViewAllocatedEmployeeOps().getBatchAllocatedEmployeeData(filter, props);
          setDashboardData(Data);
      } catch (error) {
          console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [activeTab]);

  // useeffect for Filtering DashboardData based on searchQuery
  useEffect(() => {
    if (!DashboardData) return;
    // Filter DashboardData based on searchQuery
    const filtered = DashboardData.filter((item) =>
      [
        item.Id,
        item.ModuleName,
        item.Level,
        item.BatchName,
        item.BatchStartDate,
        item.BatchEndDate,
        item.Position,
        item.EmployeeID,
        item.EmployeeName,
        item.SupervisorStatus
      ]
        .filter((field) => field) // Remove null/undefined
        .some((field) =>
          field.toString().toLowerCase().includes(searchQuery.toLowerCase())
        )
    );
    setFilteredData(filtered);
    // Reset to first page when search changes
    setCurrentPage(1);
    setSelectedItems([]);
    setAllSelected(false)
  }, [searchQuery, DashboardData]);
  
  // Column definitions: header label + field key + optional render
  const columnsConfig = [
    { header: "Position", key: "Position" },
    { header: "Module", key: "ModuleName" },
    { header: "Batch Name", key: "BatchName" },
    { header: "Batch Start Date", key: "BatchStartDate" },
    { header: "Batch End Date", key: "BatchEndDate" },
    { header: "Employee ID", key: "EmployeeID" },
    { header: "Employee Name", key: "EmployeeName" },
    { header: "Supervisor Status", key: "SupervisorStatus" },
  ];

  // CSV Headers configuration
  const csvHeaders = columnsConfig.map(col => ({
    label: col.header,
    key: col.key,
  }));


  // Tabs configuration on header tab
  const tabs = [
    { id: "Pending", label: "Pending" },
    { id: "Present", label: "Present" },
    { id: "Absent", label: "Absent" }

  ];

  const toggleSelect = (id: number) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedItems([]);
    } else {
      setSelectedItems(currentRows.map(item => item.Id));
    }
    setAllSelected(!allSelected);
  };

  const handleMarkPresent = async () => {
    if (!selectedItems.length) {
      Swal.fire('No Selection', 'Select employees', 'warning');
      return;
    }
    const confirmAction = await Swal.fire({
      title: `Mark ${selectedItems.length} employee(s) as Present?`,
      icon: 'question',
      showCancelButton: true,
    });
    if (!confirmAction.isConfirmed) return;
    setLoading(true);
    try {
      // ✅ 1. Bulk update (ONLY ONCE)
      const updates = selectedItems.map(id => ({
        id,
        updates: {
          Attendance: 'Present',
          AllocationFlag: 'PresentAttendance',
        }
      }));

      const result = await EmployeeSupervisorOps().bulkUpdateBatchAllocation(updates, props);
      const tniUpdates: Array<{ id: number; updates: any }> = [];
      // ✅ 2. Loop for remaining operations
      for (const id of selectedItems) {
        const item = DashboardData.find(d => d.Id === id);
        if (!item) continue;

        // ✅ Feedback
        const feedbackData = {
          EmployeeID: item.EmployeeID,
          EmployeeName: item.EmployeeName,
          Module: item.ModuleName,
          BatchName: item.BatchName,
          Attendance: 'Present',
          Department: item.Department,
          Level: item.Level,
        };

        await BatchCreationSpCrudOps().insertFeedbackForms([feedbackData], props);

        // ✅ TNI flag
        const tniItems = await EmployeeSupervisorOps().getTNIData(item.EmployeeID, item.ModuleName, props);
        if (tniItems?.length > 0) {
          tniUpdates.push({
            id: tniItems[0].Id,
            updates: {
              TNIflag: 'BatchPresent',
            }
          });
        }

        // ✅ Trainer Feedback
        const trainerData = {
          EmployeeID: item.EmployeeID,
          EmployeeName: item.EmployeeName,
          Module: item.ModuleName,
          BatchName: item.BatchName,
          Level: item.Level
        };

        await BatchCreationSpCrudOps().insertTrainerFeedbackForms([trainerData], props);

        // ✅ Batch Status
        await BatchCreationSpCrudOps().updateBatchStatus(item.BatchNameId, 'TrainingConducted', props);
      }

      // ✅ Bulk TNI update (once)
      if (tniUpdates.length > 0) {
        await BatchCreationSpCrudOps().bulkUpdateTNIFlags(tniUpdates, props);
      }

      // ✅ Result handling
      const successCount = result?.length || 0;
      const totalCount = selectedItems.length;
      const failedCount = totalCount - successCount;

      if (failedCount === 0) {
        Swal.fire('Success', `All ${successCount} marked as Present!`, 'success');
      } else if (successCount > 0) {
        Swal.fire('Partial Success', `${successCount} success, ${failedCount} failed`, 'warning');
      } else {
        Swal.fire('Failed', 'No updates done', 'error');
      }

    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Something went wrong', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAbsent = async () => {
    if (!selectedItems.length) {
      Swal.fire('No Selection', 'Select employees', 'warning');
      return;
    }
    const confirmAction = await Swal.fire({
      title: `Mark ${selectedItems.length} employee(s) as Absent?`,
      icon: 'question',
      showCancelButton: true,
    });

    if (!confirmAction.isConfirmed) return;
    setLoading(true);
    try {
      // ✅ 1. Bulk update BatchAllocation (ONLY ONCE)
      const updates = selectedItems.map(id => ({
        id,
        updates: {
          Attendance: 'Absent',
          AllocationFlag: 'AbsentAttendance',
        }
      }));

      const result = await EmployeeSupervisorOps().bulkUpdateBatchAllocation(updates, props);
      const tniUpdates: Array<{ id: number; updates: any }> = [];
      // ✅ 2. Loop for TNI updates
      for (const id of selectedItems) {
        const item = DashboardData.find(d => d.Id === id);
        if (!item) continue;

        const tniItems = await EmployeeSupervisorOps().getTNIData(item.EmployeeID, item.ModuleName, props);
        if (tniItems?.length > 0) {
          tniUpdates.push({
            id: tniItems[0].Id,
            updates: {
              TNIflag: 'BatchAbsent',
            }
          });
        }
      }

      // ✅ 3. Bulk TNI update
      if (tniUpdates.length > 0) {
        await BatchCreationSpCrudOps().bulkUpdateTNIFlags(tniUpdates, props);
      }

      // ✅ 4. Result handling
      const successCount = result?.length || 0;
      const totalCount = selectedItems.length;
      const failedCount = totalCount - successCount;

      if (failedCount === 0) {
        Swal.fire('Success', `All ${successCount} marked as Absent!`, 'success');
      } else if (successCount > 0) {
        Swal.fire('Partial Success', `${successCount} success, ${failedCount} failed`, 'warning');
      } else {
        Swal.fire('Failed', 'No updates done', 'error');
      }

    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Something went wrong', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`pageContainer `}>
      {/* SPINNER */}
      {loading && (
        <div className="loadingOverlay">
          <div className="spinner"></div>
        </div>
      )}

      <div className="stickyHeader">
        <div className="tniHeader">
          <h1 className="popup-header">Attendance Dashboard</h1>
        </div>
      </div>
      {/* PAGE CONTENT */}
      <div className="pageContent">
        <div className="tabsRow">
          <div className="tabs">
            {tabs.map(tab => (
              <div
                key={tab.id}
                className={`tab ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </div>
            ))}
          </div>
        </div>
        {activeTab === "Pending" && (
          <div className={`createFormBtnWrapper `} >
            <button className="createFormBtn"
              onClick={handleMarkPresent}
            >
              Present
            </button>
            <button className="createFormBtn"
              onClick={handleMarkAbsent}
            >
              Absent
            </button>
          </div>
        )}
        {/* Reject Modal */}
        {/* <Dialog
          hidden={!showRejectModal}
          onDismiss={() => { setShowRejectModal(false); setRemark(''); }}
          dialogContentProps={{
            type: DialogType.normal,
            title: 'Enter Remark for Rejection',
          }}
          modalProps={{
            isBlocking: false,
          }}
        >
          <TextField
            label="Remark"
            multiline
            rows={3}
            value={remark}
            onChange={(_, newValue) => setRemark(newValue || '')}
            required
          />
          <DialogFooter>
            <PrimaryButton onClick={handleRejectSave} text="Save" />
            <DefaultButton onClick={() => { setShowRejectModal(false); setRemark(''); }} text="Cancel" />
          </DialogFooter>
        </Dialog> */}
        {/* Search and Page Size Controls */}
        {activeTab === "Pending" && (
          <div>
            <div className={`table-controls d-flex mb-3 flex-wrap `}>
              <div className="search-container me-3 mb-2" style={{height: 'auto', position: 'relative'}}>
                <Search24Regular className='searchIcon' />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ maxWidth: '300px', paddingLeft: '38px' }}
                />
              </div>
              <div className="page-size-container mb-2" style={{height: 'auto'}}>
                <label htmlFor="rowsPerPage" className="me-2 font-medium">Rows per page:</label>
                <select
                  id="rowsPerPage"
                  className="form-select"
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1); // Reset to first page when page size changes
                  }}
                  style={{ width: 'auto', display: 'inline-block' }}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
        
            <div className={`Table-container `} >
              <div style={{overflowX: 'auto', WebkitOverflowScrolling: 'touch'}}>
                <table className={`Table responsive-table `} >
                  <thead className="Table-header">
                    <tr className="Header-rows">
                      <th className='Header-data'><Checkbox checked={allSelected} onChange={toggleSelectAll} /></th>
                      {columnsConfig.map(col => (
                        <th key = {col.key} className='Header-data'>{col.header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className={`Table-body `} >
                    {currentRows.length > 0 ? (
                      currentRows.map((item, index) => (
                        <tr
                          key={index}
                          className={`Body-rows  ${index % 2 === 0 ? "even" : "odd"}`}
                        >
                          <td className="Body-data"><Checkbox checked={selectedItems.includes(item.Id)} onChange={() => toggleSelect(item.Id)} /></td>
                          <td className="Body-data">{item.Position || "-"}</td>
                          <td className="Body-data">{item.ModuleName || "-"}</td>
                          <td className="Body-data">{item.BatchName || "-"}</td>
                          <td className="Body-data">{formatDate(item.BatchStartDate) || "-"}</td>
                          <td className="Body-data">{formatDate(item.BatchEndDate) || "-"}</td>
                          <td className="Body-data">{item.EmployeeID || "-"}</td>
                          <td className="Body-data">{item.EmployeeName || "-"}</td>
                          <td className="Body-data">{item.SupervisorStatus || "-"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={13} style={{ textAlign: "center" }}>
                          No data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="pagination-container ">
                  <div className="pagination-info">
                    Showing {startIndex + 1}–{endIndex} of {filteredData.length}
                  </div>
                  <div className="pagination-buttons">
                    <button
                      className="pg-btn"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(1)}
                    >
                      ⏮
                    </button>
                    <button
                      className="pg-btn"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => prev - 1)}
                    >
                      ◀
                    </button>
                    <span className="pg-number mx-2">Page {currentPage} of {totalPages}</span>
                    <button
                      className="pg-btn"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => prev + 1)}
                    >
                      ▶
                    </button>
                    <button
                      className="pg-btn"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(totalPages)}
                    >
                      ⏭
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        {activeTab === "Present" && (
          <div>
            <div className={`table-controls d-flex mb-3 flex-wrap `}>
              <div className="search-container me-3 mb-2" style={{height: 'auto', position: 'relative'}}>
                <Search24Regular className='searchIcon' />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ maxWidth: '300px', paddingLeft: '38px' }}
                />
              </div>
              <div className="page-size-container mb-2" style={{height: 'auto'}}>
                <label htmlFor="rowsPerPage" className="me-2 font-medium">Rows per page:</label>
                <select
                  id="rowsPerPage"
                  className="form-select"
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1); // Reset to first page when page size changes
                  }}
                  style={{ width: 'auto', display: 'inline-block' }}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
        
            <div className={`Table-container `} >
              <div style={{overflowX: 'auto', WebkitOverflowScrolling: 'touch'}}>
                <table className={`Table responsive-table `} >
                  <thead className="Table-header">
                    <tr className="Header-rows">
                      {/* {columnsConfig.map(col => (
                        <th key = {col.key} className='Header-data'>{col.header}</th>
                      ))} */}
                      <th className="Header-data">Position</th>
                      <th className="Header-data">Module</th>
                      <th className="Header-data">Batch Name</th>
                      <th className="Header-data">Batch Start Date</th>
                      <th className="Header-data">Batch End Date</th>
                      <th className="Header-data">Employee ID</th>
                      <th className="Header-data">Employee Name</th>
                      <th className="Header-data">Supervisor Status</th>
                    </tr>
                  </thead>
                  <tbody className={`Table-body `} >
                    {currentRows.length > 0 ? (
                      currentRows.map((item, index) => (
                        <tr
                          key={index}
                          className={`Body-rows  ${index % 2 === 0 ? "even" : "odd"}`}
                        >
                          <td className="Body-data">{item.Position || "-"}</td>
                          <td className="Body-data">{item.ModuleName || "-"}</td>
                          <td className="Body-data">{item.BatchName || "-"}</td>
                          <td className="Body-data">{formatDate(item.BatchStartDate) || "-"}</td>
                          <td className="Body-data">{formatDate(item.BatchEndDate) || "-"}</td>
                          <td className="Body-data">{item.EmployeeID || "-"}</td>
                          <td className="Body-data">{item.EmployeeName || "-"}</td>
                          <td className="Body-data">{item.SupervisorStatus || "-"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={12} style={{ textAlign: "center" }}>
                          No data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="pagination-container ">
                  <div className="pagination-info">
                    Showing {startIndex + 1}–{endIndex} of {filteredData.length}
                  </div>
                  <div className="pagination-buttons">
                    <button
                      className="pg-btn"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(1)}
                    >
                      ⏮
                    </button>
                    <button
                      className="pg-btn"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => prev - 1)}
                    >
                      ◀
                    </button>
                    <span className="pg-number mx-2">Page {currentPage} of {totalPages}</span>
                    <button
                      className="pg-btn"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => prev + 1)}
                    >
                      ▶
                    </button>
                    <button
                      className="pg-btn"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(totalPages)}
                    >
                      ⏭
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        {activeTab === "Absent" && (
          <div>
            <div className={`table-controls d-flex mb-3 flex-wrap `}>
              <div className="search-container me-3 mb-2" style={{height: 'auto', position: 'relative'}}>
                <Search24Regular className='searchIcon' />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ maxWidth: '300px', paddingLeft: '38px' }}
                />
              </div>
              <div className="page-size-container mb-2" style={{height: 'auto'}}>
                <label htmlFor="rowsPerPage" className="me-2 font-medium">Rows per page:</label>
                <select
                  id="rowsPerPage"
                  className="form-select"
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1); // Reset to first page when page size changes
                  }}
                  style={{ width: 'auto', display: 'inline-block' }}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
        
            <div className={`Table-container `} >
              <div style={{overflowX: 'auto', WebkitOverflowScrolling: 'touch'}}>
                <table className={`Table responsive-table `} >
                  <thead className="Table-header">
                    <tr className="Header-rows">
                      {/* {columnsConfig.map(col => (
                        <th key = {col.key} className='Header-data'>{col.header}</th>
                      ))} */}
                      <th className="Header-data">Position</th>
                      <th className="Header-data">Module</th>
                      <th className="Header-data">Batch Name</th>
                      <th className="Header-data">Batch Start Date</th>
                      <th className="Header-data">Batch End Date</th>
                      <th className="Header-data">Employee ID</th>
                      <th className="Header-data">Employee Name</th>
                      <th className="Header-data">Supervisor Status</th>
                    </tr>
                  </thead>
                  <tbody className={`Table-body `} >
                    {currentRows.length > 0 ? (
                      currentRows.map((item, index) => (
                        <tr
                          key={index}
                          className={`Body-rows  ${index % 2 === 0 ? "even" : "odd"}`}
                        >
                          <td className="Body-data">{item.Position || "-"}</td>
                          <td className="Body-data">{item.ModuleName || "-"}</td>
                          <td className="Body-data">{item.BatchName || "-"}</td>
                          <td className="Body-data">{formatDate(item.BatchStartDate) || "-"}</td>
                          <td className="Body-data">{formatDate(item.BatchEndDate) || "-"}</td>
                          <td className="Body-data">{item.EmployeeID || "-"}</td>
                          <td className="Body-data">{item.EmployeeName || "-"}</td>
                          <td className="Body-data">{item.SupervisorStatus || "-"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={13} style={{ textAlign: "center" }}>
                          No data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="pagination-container ">
                  <div className="pagination-info">
                    Showing {startIndex + 1}–{endIndex} of {filteredData.length}
                  </div>
                  <div className="pagination-buttons">
                    <button
                      className="pg-btn"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(1)}
                    >
                      ⏮
                    </button>
                    <button
                      className="pg-btn"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => prev - 1)}
                    >
                      ◀
                    </button>
                    <span className="pg-number mx-2">Page {currentPage} of {totalPages}</span>
                    <button
                      className="pg-btn"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => prev + 1)}
                    >
                      ▶
                    </button>
                    <button
                      className="pg-btn"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(totalPages)}
                    >
                      ⏭
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

};