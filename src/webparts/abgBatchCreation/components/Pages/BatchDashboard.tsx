import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import type { IAbgBatchCreationProps } from '../IAbgBatchCreationProps';
import { useHistory } from 'react-router-dom';
import { CSVLink } from "react-csv";
import { Icon } from '@fluentui/react/lib/Icon';
import DashboardOps from '../../services/BAL/BatchCreationDashboard';
import logo from '../../assets/ABGlogo.jpg';
import { Search24Regular } from "@fluentui/react-icons";
import { SPComponentLoader } from '@microsoft/sp-loader';
import './CSS/styles.scss';
import './CSS/TNICreation.scss';
import { IBatchCreationDashboard } from '../../services/interface/IBatchCreationDashboard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes,
  faPlus,
  faEdit,
  faEye
} from '@fortawesome/free-solid-svg-icons';




// Load Bootstrap + FontAwesome
SPComponentLoader.loadCss('https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css');
SPComponentLoader.loadCss('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css');

export const DashboardPage: React.FunctionComponent<IAbgBatchCreationProps> = (props: IAbgBatchCreationProps) => {
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("OnGoing");
  const [visible, setVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [filteredData, setFilteredData] = useState<IBatchCreationDashboard[]>([]);
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, filteredData.length);
  const currentRows = filteredData.slice(startIndex, endIndex);
  const [DashboardData, setDashboardData] = React.useState<IBatchCreationDashboard[]>([]);
  

  useEffect(() => {
    // Fetch dashboard data when component mounts
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
          const Data = await DashboardOps().getDashboardData(activeTab, props);
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
        item.ModulesName,
        item.Level,
        item.BatchName,
        item.StartDate,
        item.EndDate,
        item.TrainerNames,
        item.TrainerNameNew,
        item.Duration,
        item.TrainingTime,
        item.Venue,
        item.Unscheduled,
        item.BatchType
      ]
        .filter((field) => field) // Remove null/undefined
        .some((field) =>
          field.toString().toLowerCase().includes(searchQuery.toLowerCase())
        )
    );
    setFilteredData(filtered);
    // Reset to first page when search changes
    setCurrentPage(1);
  }, [searchQuery, DashboardData]);
  
  // Column definitions: header label + field key + optional render
  const columnsConfig = [
    { header: "Module", key: "ModulesName" },
    { header: "Level", key: "Level" },
    { header: "Batch Name", key: "BatchName" },
    { header: "Start Date", key: "StartDate" },
    { header: "End Date", key: "EndDate" },
    { header: "Trainer1", key: "TrainerNames" },
    { header: "Trainer2", key: "TrainerNameNew" },
    { header: "Duration", key: "Duration" },
    { header: "Training Time", key: "TrainingTime" },
    { header: "Venue", key: "Venue" },
    { header: "Unscheduled", key: "Unscheduled" },
    { header: "Batch Type", key: "BatchType" },
    { header: "Actions", key: "Actions" },
  ];

  // CSV Headers configuration
  const csvHeaders = columnsConfig.map(col => ({
    label: col.header,
    key: col.key,
  }));


  // Tabs configuration on header tab
  const tabs = [
    { id: "OnGoing", label: "OnGoing" },
    { id: "Completed", label: "Completed" },
    { id: "Cancelled", label: "Cancelled" }

  ];

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
          <h1 className="popup-header">Batch Dashboard</h1>
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
        {activeTab === "OnGoing" && (
          <div className={`createFormBtnWrapper `} >
            <button className="createFormBtn"
            onClick={() => history.push('/Calender')}
            >
              Calender
            </button>
            <button className="createFormBtn"
            onClick={() => history.push('/BatchForm')}
            >
              Create Batch
            </button>
          </div>
        )}
        {/* Search and Page Size Controls */}
        {activeTab === "OnGoing" && (
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
                          <td className="Body-data">{item.ModulesName || "-"}</td>
                          <td className="Body-data">{item.Level || "-"}</td>
                          <td className="Body-data">{item.BatchName || "-"}</td>
                          <td className="Body-data">{item.StartDate || "-"}</td>
                          <td className="Body-data">{item.EndDate || "-"}</td>
                          <td className="Body-data">{item.TrainerNames || "-"}</td>
                          <td className="Body-data">{item.TrainerNameNew || "-"}</td>
                          <td className="Body-data">{item.Duration || "-"}</td>
                          <td className="Body-data">{item.TrainingTime || "-"}</td>
                          <td className="Body-data">{item.Venue || "-"}</td>
                          <td className="Body-data">{item.Unscheduled || "-"}</td>
                          <td className="Body-data">{item.BatchType || "-"}</td>
                          <td className="Body-data">
                            <FontAwesomeIcon
                              icon={faTimes}
                              size="lg"
                              style={{ color: '#d13438', cursor: 'pointer' }}
                              title="Cancel"
                              //onClick={() => handleCancel(item)}
                            />
                            <FontAwesomeIcon
                              icon={faPlus}
                              size="lg"
                              style={{ color: '#107c10', cursor: 'pointer', marginLeft: '10px' }}
                              title="Add"
                              onClick={() => history.push(`/EmployeeBatchAllocation?BatchID=${item.Id}`)}
                            />
                            <FontAwesomeIcon
                              icon={faEdit}
                              size="lg"
                              style={{ color: '#d13438', cursor: 'pointer', marginLeft: '10px' }}
                              title="Edit"
                              //onClick={() => handleUpdate(item)}
                            />
                            <FontAwesomeIcon
                              icon={faEye}
                              size="lg"
                              style={{ color: '#d13438', cursor: 'pointer', marginLeft: '10px' }}
                              title="View"
                              onClick={() => history.push(`/ViewAllocatedEmployee?BatchID=${item.Id}`)}
                            />
                          </td>
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
        {activeTab === "Completed" && (
          <div>
            <div className={`table-controls d-flex mb-3 flex-wrap `} style={{marginLeft: '2%'}} >
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
                      <th className='Header-data'>Module</th>
                      <th className='Header-data'>Level</th>
                      <th className="Header-data">Batch Name</th>
                      <th className="Header-data">Start Date</th>
                      <th className="Header-data">End Date</th>
                      <th className="Header-data">Trainer1</th>
                      <th className="Header-data">Trainer2</th>
                      <th className="Header-data">Duration</th>
                      <th className="Header-data">Training Time</th>
                      <th className="Header-data">Venue</th>
                      <th className="Header-data">Unscheduled</th>
                      <th className="Header-data">Batch Type</th>
                    </tr>
                  </thead>
                  <tbody className={`Table-body `} >
                    {currentRows.length > 0 ? (
                      currentRows.map((item, index) => (
                        <tr
                          key={index}
                          className={`Body-rows  ${index % 2 === 0 ? "even" : "odd"}`}
                        >
                          <td className="Body-data">{item.ModulesName || "-"}</td>
                          <td className="Body-data">{item.Level || "-"}</td>
                          <td className="Body-data">{item.BatchName || "-"}</td>
                          <td className="Body-data">{item.StartDate || "-"}</td>
                          <td className="Body-data">{item.EndDate || "-"}</td>
                          <td className="Body-data">{item.TrainerNames || "-"}</td>
                          <td className="Body-data">{item.TrainerNameNew || "-"}</td>
                          <td className="Body-data">{item.Duration || "-"}</td>
                          <td className="Body-data">{item.TrainingTime || "-"}</td>
                          <td className="Body-data">{item.Venue || "-"}</td>
                          <td className="Body-data">{item.Unscheduled || "-"}</td>
                          <td className="Body-data">{item.BatchType || "-"}</td>
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
        {activeTab === "Cancelled" && (
          <div>
            <div className={`table-controls d-flex mb-3 flex-wrap `} style={{marginLeft: '2%'}} >
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
                      <th className='Header-data'>Module</th>
                      <th className='Header-data'>Level</th>
                      <th className="Header-data">Batch Name</th>
                      <th className="Header-data">Start Date</th>
                      <th className="Header-data">End Date</th>
                      <th className="Header-data">Trainer1</th>
                      <th className="Header-data">Trainer2</th>
                      <th className="Header-data">Duration</th>
                      <th className="Header-data">Training Time</th>
                      <th className="Header-data">Venue</th>
                      <th className="Header-data">Unscheduled</th>
                      <th className="Header-data">Batch Type</th>
                      <th className="Header-data">Reason for cancellation</th>
                    </tr>
                  </thead>
                  <tbody className={`Table-body `} >
                    {currentRows.length > 0 ? (
                      currentRows.map((item, index) => (
                        <tr
                          key={index}
                          className={`Body-rows  ${index % 2 === 0 ? "even" : "odd"}`}
                        >
                          <td className="Body-data">{item.ModulesName || "-"}</td>
                          <td className="Body-data">{item.Level || "-"}</td>
                          <td className="Body-data">{item.BatchName || "-"}</td>
                          <td className="Body-data">{item.StartDate || "-"}</td>
                          <td className="Body-data">{item.EndDate || "-"}</td>
                          <td className="Body-data">{item.TrainerNames || "-"}</td>
                          <td className="Body-data">{item.TrainerNameNew || "-"}</td>
                          <td className="Body-data">{item.Duration || "-"}</td>
                          <td className="Body-data">{item.TrainingTime || "-"}</td>
                          <td className="Body-data">{item.Venue || "-"}</td>
                          <td className="Body-data">{item.Unscheduled || "-"}</td>
                          <td className="Body-data">{item.BatchType || "-"}</td>
                          <td className="Body-data">{item.BatchCancelRemark || "-"}</td>
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