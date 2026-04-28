// TNICreation.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { IAbgBatchCreationProps } from '../IAbgBatchCreationProps';
import './CSS/TNICreation.scss';
import './CSS/AddModules.scss';
import './CSS/styles.scss';
import Swal from 'sweetalert2';
import { checkDuplicateLocal, formatDate } from '../../services/Helper';
import { Search24Regular } from "@fluentui/react-icons";
import { useHistory } from 'react-router-dom';
import SPCRUDOPS from '../../services/DAL/spcrudops';
import { CSVLink } from "react-csv";
import { Icon } from '@fluentui/react/lib/Icon';


export const FeedbackDashboard: React.FunctionComponent<IAbgBatchCreationProps> = (props) => {

  const fetchStartTimeRef = useRef(0);
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [isTNICreating, setIsTNICreating] = useState(false);
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState("Training Assesment Details");

  // Search states
  const [moduleSearch, setModuleSearch] = useState("");

  // Pagination states
  const [modulePage, setModulePage] = useState(1);

  //const rowsPerPage = 10;

  // For custom rows per page 
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Selected dropdown values
  const [selectedModule, setSelectedModule] = useState<number | "">("");
  const [selectedBatch, setSelectedBatch] = useState<number | "">("");
  const [noOfQuestions, setNoOfQuestions] = useState("");

  // For filtering module and show filtered modules data
  const [filteredModules, setFilteredModules] = useState<any[]>([]);
  const [selectedModuleRows, setSelectedModuleRows] = useState<number[]>([]);
  const [selectAllModules, setSelectAllModules] = useState(false);

  // States for data
  const [batchData, setBatchData] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [tniData, setTniData] = useState<any[]>([]);
  

  // For reset page when rowsperpage changes
  useEffect(() => {
    setModulePage(1);
  }, [rowsPerPage]);

  // For reset page and selections when module search changes
  useEffect(() => {
    setModulePage(1);
    setSelectedModuleRows([]);
    setSelectAllModules(false);
  }, [moduleSearch]);

  
  // Fetch SharePoint List Data
  useEffect(() => {
    const fetchModules = async () => {
      const sp = await SPCRUDOPS();
      setLoading(true);

      try {
        const data = await sp.getData(
          "Feedback2223",
          "Id,Module/Id,Module/ModuleName,Attendance",
          "Module",
          `Attendance eq 'Present'`,
          { column: "Id", isAscending: false },
          props
        );

        // ✅ unique modules
        const uniqueModules = Array.from(
          new Map(
            data.map(item => [
              item.Module?.Id,
              item.Module
            ])
          ).values()
        );

        setModules(uniqueModules);
        console.log(uniqueModules);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchModules();
  }, []);

  useEffect(() => {
    const fetchBatches = async () => {
      if (!selectedModule) {
        setBatchData([]);
        setSelectedBatch('');
        return
      };

      const sp = await SPCRUDOPS();
      setLoading(true);

      try {
        const data = await sp.getData(
          "Feedback2223",
          "Id,BatchName/Id,BatchName/BatchName,Attendance",
          "BatchName",
          `ModuleId eq ${selectedModule} and BatchType eq 'Classroom' and Attendance eq 'Present'`,
          { column: "Id", isAscending: false },
          props
        );

        // ✅ unique batches
        const uniqueBatches = Array.from(
          new Map(
            data.map(item => [
              item.BatchName?.Id,
              item.BatchName
            ])
          ).values()
        );

        setBatchData(uniqueBatches);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBatches();
  }, [selectedModule]);

  useEffect(() => {
    const fetchTableData = async () => {
      if (!selectedBatch) return;
      const sp = await SPCRUDOPS();
      setLoading(true);

      try {
        // ✅ Feedback (Angular same)
        const feedback = await sp.getData(
          "Feedback2223",
          "*,BatchName/Id,BatchName/BatchName,Module/Id,Module/ModuleName,EmployeeID/Id,EmployeeID/EmployeeID,EmployeeName/EmployeeName",
          "BatchName,Module,EmployeeID,EmployeeName",
          `BatchName/Id eq ${selectedBatch} and PostAssesmentRating ne null`,
          { column: "Id", isAscending: false },
          props
        );

        const result = feedback.map((f) => {
          return {
            Id: f.Id,
            Result: f.Result || "",

            EmployeeName: f.EmployeeName?.EmployeeName || "",
            EmployeeID: f.EmployeeID?.EmployeeID || "",

            Level: f.Level || "",
            PositionName: f.Position || "",

            ModuleName: f.Module?.ModuleName || "",
            BatchName: f.BatchName?.BatchName || "",

            PreAssessmentRatings: f.PreAssessmentRatings || "",
            PostAssesmentRating: f.PostAssesmentRating || "",
          };
        });
        setFilteredModules(result);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTableData();
  }, [selectedBatch, selectedModule]);

  // --- MODULE SEARCH & PAGINATION ---
  const safe = (val: any) => (val ?? "").toString().toLowerCase();  
  const filteredModuleList = filteredModules.filter((e) => {
    const text = moduleSearch.toLowerCase();

    return Object.values(e).some(val =>
      safe(val).includes(text)
    );
  });

  const moduleStart = (modulePage - 1) * rowsPerPage;
  const modulePaginated = filteredModuleList.slice(
    moduleStart,
    moduleStart + rowsPerPage
  );

  const columnsConfig = [
    { header: "Position Name", key: "PositionName" },
    { header: "Module Name", key: "ModuleName" },
    { header: "Level", key: "Level" },
    { header: "Batch Name", key: "BatchName" },
    { header: "Employee ID", key: "EmployeeID" },
    { header: "Employee Name", key: "EmployeeName" },
    { header: "Pre Assessment Ratings", key: "PreAssessmentRatings" },
    { header: "Post Assessment Rating", key: "PostAssesmentRating" },
    { header: "Result", key: "Result" } 
  ];

  // CSV Headers configuration
  const csvHeaders = columnsConfig.map(col => ({
    label: col.header,
    key: col.key,
  }));


  // Tabs configuration on header tab
  const tabs = [
    { id: "TrainingAssesmentDetails", label: "Training Assesment Details" }

  ];

  return (
    <div className="pageContainer">
      {/* SPINNER */}
      {loading && !isTNICreating && (
        <div className="loadingOverlay1">
          <div className="spinner1"></div>
        </div>
      )}
      {loading && isTNICreating && (
        <div className="loadingOverlay">
          <div className="spinner"></div>

          {/* TNI-ONLY Hybrid Progress */}
          {isCheckingDuplicates ? (
            <div className="checkingText pulse">Checking duplicates...</div>
          ) : (
            <div className="progressCircleWrapper">
              <svg className="progressCircle" width="90" height="90">
                <circle className="progressBg" cx="45" cy="45" r="40" />
                <circle
                  className={`progressValue ${
                    progress >= 100
                      ? "progressDone"
                      : progress >= 80
                      ? "progressNear"
                      : ""
                  }`}
                  cx="45"
                  cy="45"
                  r="40"
                  style={{
                    strokeDasharray: 251,
                    strokeDashoffset: 251 - (251 * progress) / 100
                  }}
                />
              </svg>

              {progress < 100 ? (
                <div className="progressPercent">{progress}%</div>
              ) : (
                <div className=""></div>
              )}
            </div>
          )}
        </div>
      )}
      <div className="stickyHeader">
        <div className="tniHeader">
          <h1 className="popup-header">Training Assesment Dashboard</h1>
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
        <h1 className='section-title'>Assessment Selection</h1>
        <div className="form-card">
          <div className="form-row">
            <div className="form-group">
              <label>Module Name</label>
              <select
                  value={selectedModule}
                  onChange={(e) => {
                    setSelectedModule(Number(e.target.value));
                  }}
                >
                  <option value="">Select</option>
                  {modules.map((item) => (
                    <option key={item.Id} value={item.Id}>
                      {item.ModuleName}
                    </option>
                  ))}
                </select>
            </div>
            <div className="form-group">
              <label>Batch Name</label>
              <select
                  value={selectedBatch}
                  onChange={(e) => {
                    setSelectedBatch(Number(e.target.value));
                  }}
                >
                  <option value="">Select</option>
                  {batchData.map((item) => (
                    <option key={item.Id} value={item.Id}>
                      {item.BatchName}
                    </option>
                  ))}
                </select>
            </div>
          </div>
        </div>

        {/* Standard Modules Table */}
        <div className="Table-container">
        <h2 className='section-title'>Standard Modules</h2>
        <div className={"table-controls d-flex mt-3 flex-wrap"}>
          <div className="search-container me-3 mb-2" style={{height: 'auto', position: 'relative'}}>
            <Search24Regular className='searchIcon' />
            <input
              className='table-search'
              type='text'
              placeholder='Search Modules...'
              value={moduleSearch}
              onChange={(e) => {
              setModuleSearch(e.target.value);
              setModulePage(1);
              }}
              style={{ maxWidth: '300px', paddingLeft: '38px' }}
            />
          </div>
          <div className="page-size-container mb-2" style={{height: 'auto'}}>
            <label htmlFor="rowsPerPage" className="me-2 font-medium">Show Entries: </label>
            <select
              id="rowsPerPage"
              className="rows-dropdown"
              value={rowsPerPage}
              onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setModulePage(1);
              }}
              style={{ width: 'auto', display: 'inline-block' }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          <div className="excel" style={{border: '1px solid #c4291c',padding: "5px",width:'fit-content',backgroundColor:'#a2231d',borderRadius:'5px',height:'2.4rem', textAlign:'center',float: 'inline-end',marginLeft: '1.5rem'}}>
            {filteredModules.length > 0 && (
              <CSVLink data={filteredModules} headers={csvHeaders} filename="FeedbackDashboard.csv" style={{textDecoration: 'none',color:'white'}}>
                <Icon iconName="ExcelDocument" style={{color:'white'}}/> <span className='pl-2'style={{color:'#fff', paddingLeft:'7px'}}>Export to Excel</span>
              </CSVLink>
            )}
          </div>
        </div>

        <div style={{overflowX: 'auto', WebkitOverflowScrolling: 'touch'}}>
            <table className="Table responsive-table ">
            <thead className="Table-header">
                <tr className="Header-rows">
                  <th className='Header-data'>Position Name</th>
                  <th className='Header-data'>Module Name</th>
                  <th className='Header-data'>Level</th>
                  <th className='Header-data'>Batch Name</th>
                  <th className='Header-data'>Employee ID</th>
                  <th className='Header-data'>Employee Name</th>
                  <th className='Header-data'>Pre Assessment Ratings</th>
                  <th className='Header-data'>Post Assessment Rating</th>
                  <th className='Header-data'>Result</th>
                </tr>
            </thead>
            <tbody className={`Table-body `}>
                {modulePaginated.map((m, index) => {
                const globalIndex = moduleStart + index;
                return (
                  <tr key={index}
                  //onClick={() => toggleModuleRow(globalIndex)}
                  className={`Body-rows ${index % 2 === 0 ? "even" : "odd"}`}
                  style={{
                      backgroundColor: selectedModuleRows.includes(globalIndex) ? "#e6f7ff" : "white",
                      cursor: "pointer",
                      border: "1px solid #ddd",
                  }}
                  >
                    <td className="Body-data">{m.PositionName}</td>
                    <td className="Body-data">{m.ModuleName}</td>
                    <td className="Body-data">{m.Level}</td>
                    <td className="Body-data">{m.BatchName}</td>
                    <td className="Body-data">{m.EmployeeID}</td>
                    <td className="Body-data">{m.EmployeeName}</td>
                    <td className="Body-data">{m.PreAssessmentRatings}</td>
                    <td className="Body-data">{m.PostAssesmentRating}</td>
                    <td className="Body-data">{m.Result}</td>
                  </tr>
                );
                })}
            </tbody>
            </table>
        </div>
        <div className="pagination-container">
            <div className="pagination-info">
            Showing {moduleStart + 1}–{Math.min(moduleStart + rowsPerPage, filteredModuleList.length)}
            {" "}of {filteredModuleList.length} entries
            </div>

            <div className="pagination-buttons">
            <button className="pg-btn" disabled={modulePage === 1} onClick={() => setModulePage(1)}>⏮</button>
            <button className="pg-btn" disabled={modulePage === 1} onClick={() => setModulePage(p => p - 1)}>◀</button>

            <span className="pg-number">Page {modulePage}</span>

            <button
                className="pg-btn"
                disabled={modulePage >= Math.ceil(filteredModuleList.length / rowsPerPage)}
                onClick={() => setModulePage(p => p + 1)}
            >▶</button>

            <button
                className="pg-btn"
                disabled={modulePage >= Math.ceil(filteredModuleList.length / rowsPerPage)}
                onClick={() => setModulePage(Math.ceil(filteredModuleList.length / rowsPerPage))}
            >⏭</button>
            </div>
        </div>
        </div>
      </div>
    </div>
  );
};