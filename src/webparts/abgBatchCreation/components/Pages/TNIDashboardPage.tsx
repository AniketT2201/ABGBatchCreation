import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import styles from './AbgProject.module.scss';
import type { IAbgBatchCreationProps } from '../IAbgBatchCreationProps';
import DashboardOps from '../../services/BAL/TNIDashboard';
import { ITNIDashboard } from '../../services/interface/ITNIDashboard';
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import USESPCRUD, { ISPCRUD } from '../../services/BAL/SPCRUD/spcrud';
import '../styles.scss';
import { Link } from 'react-router-dom';
import anime from "animejs/lib/anime.es.js"; // Ensure correct path
import html2canvas from 'html2canvas';
import { Search24Regular } from "@fluentui/react-icons";
import logo from '../../assets/ABGlogo.jpg';
import { SPComponentLoader } from '@microsoft/sp-loader';
import { useHistory } from 'react-router-dom';
import { CSVLink } from "react-csv";
import { Icon } from '@fluentui/react/lib/Icon';


// Load Bootstrap + FontAwesome
SPComponentLoader.loadCss('https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css');
SPComponentLoader.loadCss('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css');


export const TNIDashboardPage: React.FunctionComponent<IAbgBatchCreationProps> = (props: IAbgBatchCreationProps) => {
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("TNI 24-25");
  const [visible, setVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [filteredData, setFilteredData] = useState<ITNIDashboard[]>([]);
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, filteredData.length);
  const currentRows = filteredData.slice(startIndex, endIndex);
  const [DashboardData, setDashboardData] = React.useState<ITNIDashboard[]>([]);
  

  useEffect(() => {
      // Fetch dashboard data when component mounts
      const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const Data = await DashboardOps().getDashboardData(props);
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
        item.TNIDepartment,
        item.Department,
        item.Modules,
        item.Level,
        item.EmployeeName,
        item.EmployeeID,
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
    { header: "Position", key: "Position" },
    { header: "TNI Department", key: "TNIDepartment" },
    { header: "Department", key: "Department" },
    { header: "Modules", key: "Modules" },
    { header: "Level", key: "Level" },
    { header: "Employee ID", key: "EmployeeID" },
    { header: "Employee Name", key: "EmployeeName" },
  ];

  // CSV Headers configuration
  const csvHeaders = columnsConfig.map(col => ({
    label: col.header,
    key: col.key,
  }));


  // Tabs configuration on header tab
  const tabs = [
    { id: "TNI24-25", label: "TNI 24-25" }

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
          <h1 className="popup-header">TNI Dashboard</h1>
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
        </div>
      </div>
      {/* PAGE CONTENT */}
      <div className="pageContent">
        <div className={`createFormBtnWrapper `} >
          <button className="createFormBtn"
          onClick={() => history.push('/TNICreation')}
          >
            Create TNI
          </button>
          <button className="createFormBtn"
          onClick={() => history.push('/AddModules')}
          >
            Add Module
          </button>
        </div>
        <div className="excel" style={{border: '1px solid #c4291c',padding: "5px",width:'fit-content',backgroundColor:'#a2231d',borderRadius:'5px',height:'2.4rem', textAlign:'center',float: 'inline-end',marginRight: '1.5rem'}}>
          {filteredData.length > 0 && (
            <CSVLink data={filteredData} headers={csvHeaders} filename="EmployeeTNIDashboard.csv" style={{textDecoration: 'none',color:'white'}}>
              <Icon iconName="ExcelDocument" style={{color:'white'}}/> <span className='pl-2'style={{color:'#fff', paddingLeft:'7px'}}>Export to Excel</span>
            </CSVLink>
          )}
        </div>
        {/* Search and Page Size Controls */}
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
                      <td className="Body-data">{item.Position || "-"}</td>
                      <td className="Body-data">{item.TNIDepartment || "-"}</td>
                      <td className="Body-data">{item.Department || "-"}</td>
                      <td className="Body-data">{item.Modules || "-"}</td>
                      <td className="Body-data">{item.Level || "-"}</td>
                      <td className="Body-data">{item.EmployeeID || "-"}</td>
                      <td className="Body-data">{item.EmployeeName || "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center" }}>
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