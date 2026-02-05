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
import '../styles.scss';
import '../TNICreation.scss';
import { IViewAllocatedEmployee } from '../../services/interface/IViewAllocatedEmployee';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes,
  faPlus,
  faEdit,
  faEye
} from '@fortawesome/free-solid-svg-icons';
import ViewAllocatedEmployeeOps from '../../services/BAL/ViewAllocatedEmployee';
import { formatDate } from '../../services/Helper';




// Load Bootstrap + FontAwesome
SPComponentLoader.loadCss('https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css');
SPComponentLoader.loadCss('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css');

export const BatchAllocationDashboard: React.FunctionComponent<IAbgBatchCreationProps> = (props: IAbgBatchCreationProps) => {
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("currentMonthAllocation");
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
  

  useEffect(() => {
    // Fetch dashboard data when component mounts
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
          const Data = await ViewAllocatedEmployeeOps().getAllocatedEmployeeData(activeTab, props);
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
        item.Year,
        item.Month,
        item.Position,
        item.BatchAllocationType,
        item.EmployeeID,
        item.EmployeeName,
        item.BatchType,
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
  }, [searchQuery, DashboardData]);
  
  // Column definitions: header label + field key + optional render
  const columnsConfig = [
    { header: "Year", key: "Year" },
    { header: "Month", key: "Month" },
    { header: "Position", key: "Position" },
    { header: "Module", key: "ModuleName" },
    { header: "Level", key: "Level" },
    { header: "Allocation Type", key: "BatchAllocationType" },
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
    { id: "currentMonthAllocation", label: "Current Month Allocation" },
    { id: "allAllocation", label: "All Allocation" }

  ];

  return (
    <div className={`pageContainer `}>
      {/* SPINNER */}
      {loading && (
        <div className="loadingOverlay">
          <div className="spinner"></div>
        </div>
      )}
      <div className={`menuWrapper `} >
        <div className ="Logo">
          <img src={logo}alt="Logo" />
        </div>
      </div>

      <div>
        <h1 className='popup-header'>Batch Allocation Dashboard</h1>
        {/* <h1 className={`main-heading `} ></h1> */}
      </div>
      <div className='main-heading'>
        <div className="tabs">
          {tabs.map(tab => (
              <div
                key={tab.id}
                className={`tab ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
                >
                <i ></i> {tab.label}
              </div>
          ))}
        </div>
      </div>
      <div className={`createFormBtnWrapper `} >
        {activeTab === "currentMonthAllocation" && (
          <button className="createFormBtn"
          onClick={() => history.push('/EmployeeBatchAllocation')}
          >
            Allocate Batch
          </button>
        )}
        <div className="excel" style={{border: '1px solid #c4291c',padding: "5px",width:'fit-content',backgroundColor:'#a2231d',borderRadius:'5px',height:'2.4rem', textAlign:'center',float: 'inline-end',marginRight: '1.5rem'}}>
        {filteredData.length > 0 && (
          <CSVLink data={filteredData} headers={csvHeaders} filename="BatchAllocationDashboard.csv" style={{textDecoration: 'none',color:'white'}}>
            <Icon iconName="ExcelDocument" style={{color:'white'}}/> <span className='pl-2'style={{color:'#fff', paddingLeft:'7px'}}>Export to Excel</span>
          </CSVLink>
        )}
      </div>
      </div>


      {/* Search and Page Size Controls */}
      {activeTab === "currentMonthAllocation" && (
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
                      <td className="Body-data">{item.Year || "-"}</td>
                      <td className="Body-data">{item.Month || "-"}</td>
                      <td className="Body-data">{item.Position || "-"}</td>
                      <td className="Body-data">{item.ModuleName || "-"}</td>
                      <td className="Body-data">{item.Level || "-"}</td>
                      <td className="Body-data">{item.BatchAllocationType || "-"}</td>
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
      {activeTab === "allAllocation" && (
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
            <table className={`Table responsive-table `} >
              <thead className="Table-header">
                <tr className="Header-rows">
                  {/* {columnsConfig.map(col => (
                    <th key = {col.key} className='Header-data'>{col.header}</th>
                  ))} */}
                  <th className='Header-data'>Year</th>
                  <th className='Header-data'>Month</th>
                  <th className="Header-data">Position</th>
                  <th className="Header-data">Module</th>
                  <th className="Header-data">Level</th>
                  <th className="Header-data">Allocation Type</th>
                  <th className="Header-data">Batch Name</th>
                  <th className="Header-data">Batch Start Date</th>
                  <th className="Header-data">Batch End Date</th>
                  <th className="Header-data">Batch Type</th>
                  <th className="Header-data">Employee ID</th>
                  <th className="Header-data">Employee Name</th>
                </tr>
              </thead>
              <tbody className={`Table-body `} >
                {currentRows.length > 0 ? (
                  currentRows.map((item, index) => (
                    <tr
                      key={index}
                      className={`Body-rows  ${index % 2 === 0 ? "even" : "odd"}`}
                    >
                      <td className="Body-data">{item.Year || "-"}</td>
                      <td className="Body-data">{item.Month || "-"}</td>
                      <td className="Body-data">{item.Position || "-"}</td>
                      <td className="Body-data">{item.ModuleName || "-"}</td>
                      <td className="Body-data">{item.Level || "-"}</td>
                      <td className="Body-data">{item.BatchAllocationType || "-"}</td>
                      <td className="Body-data">{item.BatchName || "-"}</td>
                      <td className="Body-data">{formatDate(item.BatchStartDate) || "-"}</td>
                      <td className="Body-data">{formatDate(item.BatchEndDate) || "-"}</td>
                      <td className="Body-data">{item.BatchType || "-"}</td>
                      <td className="Body-data">{item.EmployeeID || "-"}</td>
                      <td className="Body-data">{item.EmployeeName || "-"}</td>
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
  );

};