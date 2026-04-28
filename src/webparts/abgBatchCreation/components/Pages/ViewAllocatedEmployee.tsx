import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import type { IAbgBatchCreationProps } from '../IAbgBatchCreationProps';
import { useHistory } from 'react-router-dom';
import { Icon } from '@fluentui/react/lib/Icon';
import DashboardOps from '../../services/BAL/BatchCreationDashboard';
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
import ViewAllocatedEmployeeOps from '../../services/BAL/ViewAllocatedEmployee';





export const ViewAllocatedEmployee: React.FunctionComponent<IAbgBatchCreationProps> = (props: IAbgBatchCreationProps) => {
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [itemID, setItemID] = useState("");
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
    // Fetch URL parameters
    const getUrlVars = (): { ID: string} => {
      const vars: { [key: string]: string } = {};
      const query = window.location.hash.substring(0).split('?')[1].split('&');
      query.forEach(param => {
        const [key, value] = param.split('=');
        vars[key] = value;
      });
      setItemID(vars.ID);
      return { ID: vars.ID || ''};
    };
  }, []);

  useEffect(() => {
    // Fetch dashboard data when component mounts
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const Data = await ViewAllocatedEmployeeOps().getViewAllocatedEmployeeData(itemID, props);
        setDashboardData(Data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // useeffect for Filtering DashboardData based on searchQuery
  useEffect(() => {
    if (!DashboardData) return;
    // Filter DashboardData based on searchQuery
    const filtered = DashboardData.filter((item) =>
      [
        item.Position,
        item.Level,
        item.BatchAllocationType,
        item.BatchName,
        item.Duration,
        item.ModuleName,
        item.EmployeeID,
        item.EmployeeName
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
    { header: "Employee ID", key: "EmployeeID" },
    { header: "Employee Name", key: "EmployeeName" },
    { header: "Position", key: "Position" },
    { header: "Level", key: "Level" },
    { header: "Module", key: "ModuleName" },
    { header: "Batch Name", key: "BatchName" },
    { header: "Batch Allocation Type", key: "BatchAllocationType" },
    { header: "Duration", key: "Duration" },

  ];

  return (
    <div className={`pageContainer `}>
      {/* SPINNER */}
      {loading && (
        <div className="loadingOverlay">
          <div className="spinner"></div>
        </div>
      )}
      {/* <div className={`menuWrapper `} >
        <div className ="Logo">
          <img src={logo}alt="Logo" />
        </div>
      </div> */}

      <div className="stickyHeader">
        <div className="tniHeader">
          <h1 className='popup-header'>View Allocated Employee</h1>
          {/* <h1 className={`main-heading `} ></h1> */}
        </div>
      </div>

      {/* Search and Page Size Controls */}
      {/* PAGE CONTENT */}
      <div className="pageContent">
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
                      <td className="Body-data">{item.EmployeeID || "-"}</td>
                      <td className="Body-data">{item.EmployeeName || "-"}</td>
                      <td className="Body-data">{item.Position || "-"}</td>
                      <td className="Body-data">{item.Level || "-"}</td>
                      <td className="Body-data">{item.ModuleName || "-"}</td>
                      <td className="Body-data">{item.BatchName || "-"}</td>
                      <td className="Body-data">{item.BatchAllocationType || "-"}</td>
                      <td className="Body-data">{item.Duration || "-"}</td>
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
    </div>
  );
};