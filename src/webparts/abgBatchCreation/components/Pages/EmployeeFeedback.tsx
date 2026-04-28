// TNICreation.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
//import { debounce } from 'lodash.debounce';
import { PrimaryButton } from '@fluentui/react';
import { IAbgBatchCreationProps } from '../IAbgBatchCreationProps';
import './CSS/TNICreation.scss';
//Level Master Imports
import { ILevelMaster } from '../../services/interface/ILevelMaster';
import LevelMasterOps from '../../services/BAL/LevelMaster';
//Position Master Imports
import { IPositionMaster } from '../../services/interface/IPositionMaster';
import PositionMasterOps from '../../services/BAL/PositionMaster';
//TNIDepartment Master Imports
import { ITNIDepartmentMaster } from '../../services/interface/ITNIDepartmentMaster';
import TNIDepartmentOps from '../../services/BAL/TNIDepartmentMaster';
//Modules Master Imports
import { IModulesMaster } from '../../services/interface/IModulesMaster';
import ModulesMasterOps from '../../services/BAL/ModulesMaster';
//FinancialYear Master Imports
import { IFinancialYearMaster } from '../../services/interface/IFinancialYearMaster';
import FinancialYearMasterOps from '../../services/BAL/FinancialYearMaster';
//Dashboard Import
import DashboardOps from '../../services/BAL/TNIDashboard';
import './CSS/AddModules.scss';
import './CSS/styles.scss';
import Swal from 'sweetalert2';
import { checkDuplicateLocal, formatDate } from '../../services/Helper';
import { Search24Regular } from "@fluentui/react-icons";
import TNICreationSPCrudOps from '../../services/BAL/TNICreationSPCrud';
import { useHistory } from 'react-router-dom';
import SPCRUDOPS from '../../services/DAL/spcrudops';


export const EmployeeFeedback: React.FunctionComponent<IAbgBatchCreationProps> = (props) => {

  const fetchStartTimeRef = useRef(0);
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [isTNICreating, setIsTNICreating] = useState(false);
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);
  const [progress, setProgress] = useState(0);


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
          "Id,Module/Id,Module/ModuleName",
          "Module",
          "",
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
          "Id,BatchName/Id,BatchName/BatchName",
          "BatchName",
          `ModuleId eq ${selectedModule} and BatchType eq 'Classroom'`,
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
          `BatchName/Id eq ${selectedBatch}`,
          { column: "Id", isAscending: false },
          props
        );

        // ✅ Allocation (Angular same)
        const allocation = await sp.getData(
          "BatchAllocation2223",
          "*,BatchName/Id,BatchName/BatchName,EmployeeID/Id,EmployeeID/EmployeeID,EmployeeName/EmployeeName",
          "BatchName,EmployeeID,EmployeeName",
          `BatchName/Id eq ${selectedBatch} and Attendance eq 'Present'`,
          { column: "Id", isAscending: false },
          props
        );

        // 🔥 Optimized Map (keep this)
        const feedbackMap = new Map(
          feedback.map(f => [
            `${f.Module?.Id}-${f.EmployeeID?.Id}`,
            f
          ])
        );
        const result = feedback.map((f) => {
          return {
            Id: f.Id,

            EmployeeName: f.EmployeeName?.EmployeeName || "",
            EmployeeID: f.EmployeeID?.EmployeeID || "",

            Level: f.Level || "",
            Position: f.Position || "",

            Module: f.Module?.ModuleName || "",
            BatchName: f.BatchName?.BatchName || "",

            BatchStartDate: f.BatchStartDate || "",
            BatchEndDate: f.BatchEndDate || "",

            SupervisorStatus: f.SupervisorStatus || "",

            Attendance: f.Attendance || "",

            PreAssessmentRatings: f.PreAssessmentRatings || "",
            PostAssesmentRating: f.PostAssesmentRating || "",

            ModuleId: f.Module?.Id,
            EmployeeIDId: f.EmployeeID?.Id
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

  const handlePreChange = (id: any, value: any) => {
    setFilteredModules(prev =>
      prev.map(item =>
        item.Id === id
          ? { ...item, PreAssessmentRatings: Number(value), isModified: true }
          : item
      )
    );
  };

  const handlePostChange = (id: any, value: any) => {
    setFilteredModules(prev =>
      prev.map(item =>
        item.Id === id
          ? { ...item, PostAssesmentRating: Number(value), isModified: true }
          : item
      )
    );
  };

  // Toggle module for single row selection
  const toggleModuleRow = (index: number) => {
    setSelectedModuleRows(prev => {
      const updated = prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index];

      setSelectAllModules(updated.length === filteredModuleList.length && updated.length > 0);
      return updated;
    });
  };

  //Toggle module for all rows selection
  const toggleSelectAllModules = () => {
    if (selectAllModules) {
      setSelectedModuleRows([]);
      setSelectAllModules(false);
    } else {
      setSelectedModuleRows(filteredModules.map((_, i) => i));
      setSelectAllModules(true);
    }
    
  };

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


  const handleSubmit = async () => {
    try {
      const sp = await SPCRUDOPS();

      // 🔹 Validate number of questions
      if (!noOfQuestions) {
        Swal.fire({
          icon: "error",
          title: "Validation Error",
          text: "Enter number of questions"
        });
        return;
      }

      // 🔹 Fetch all TNI data once
      const tniData = await sp.getData(
        "TNI2223",
        "ID,Modules/Id,EmployeeID/Id",
        "Modules,EmployeeID",
        "",
        { column: "Id", isAscending: false },
        props
      );

      // 🔹 Create lookup map
      const tniMap = new Map(
        tniData.map(t => [`${t.Modules?.Id}-${t.EmployeeID?.Id}`, t])
      );

      // 🔹 Loop through all rows
      for (let i = 0; i < filteredModules.length; i++) {
        const item = filteredModules[i];
        // 🔥 SKIP untouched rows
        if (!item.isModified) continue;

        // ✅ VALIDATIONS (matches original fully)
        if (!item.PreAssessmentRatings) {
          Swal.fire({
            icon: "error",
            title: "Validation Error",
            text: `Enter Pre Assessment Rating at row ${i + 1}`
            });
            return;
        }
        if (Number(item.PreAssessmentRatings) > Number(noOfQuestions)) {
          Swal.fire({
            icon: "error",
            title: "Validation Error",
            text: `Pre Assessment Rating cannot exceed number of questions at row ${i + 1}`
          });
          return;
        }
        if (!item.PostAssesmentRating) {
          Swal.fire({
            icon: "error",
            title: "Validation Error",
            text: `Enter Post Assessment Rating at row ${i + 1}`
          });
          return;
        }
        if (Number(item.PostAssesmentRating) > Number(noOfQuestions)) {
          Swal.fire({
            icon: "error",
            title: "Validation Error",
            text: `Post Assessment Rating cannot exceed number of questions at row ${i + 1}`
          });
          return;
        }

        // 🔹 Calculate result %
        const result = Math.round(
          (Number(item.PostAssesmentRating) / Number(noOfQuestions)) * 100
        );

        let resultStatus = "";
        let tniFlag = "";

        if (result < 80) {
          resultStatus = "Repeat";
          tniFlag = "FeedbackRepeat";
        } else if (result >= 80 && result < 90) {
          resultStatus = "Qualified";
          tniFlag = "FeedbackCompleted";
        } else {
          resultStatus = "Competent";
          tniFlag = "FeedbackCompleted";
        }

        // 🔹 Update Feedback
        const res = await sp.updateData(
          "Feedback2223",
          item.Id,
          {
            PreAssessmentRatings: item.PreAssessmentRatings?.toString(),
            PostAssesmentRating: item.PostAssesmentRating?.toString(),
            ResultStatus: resultStatus,
            NoOfQuestion: noOfQuestions
          },
          props
        );
        console.log(item.Id, res);

        // 🔹 Update TNI
        const key = `${item.ModuleId}-${item.EmployeeIDId}`;
        const tniMatch = tniMap.get(key);

        if (tniMatch) {
          const tniRes = await sp.updateData(
            "TNI2223",
            tniMatch.ID,
            {
              TNIflag: tniFlag
            },
            props
          );
          console.log(tniMatch.ID, tniRes);
        }
      }

      // 🔹 Update Batch Status
      const batchRes = await sp.updateData(
        "BatchMaster2223",
        Number(selectedBatch),
        {
          BatchStatus: "Completed"
        },
        props
      );
      console.log(selectedBatch, batchRes);
      // 🔹 Success
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Feedback Submitted Successfully",
        confirmButtonText: "OK"
      });

      // 🔹 Redirect (same as original)
      //history.push("/");
    } catch (error) {
      console.error("Error submitting feedback:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong while submitting feedback."
      });
    }
  };


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
          <h1 className="popup-header">Training Assessment</h1>
        </div>
      </div>
      {/* PAGE CONTENT */}
      <div className="pageContent">
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
            <div className="form-group">
              <label>No of Questions</label>
              <input
                type="number"
                value={noOfQuestions}
                onChange={(e) => setNoOfQuestions(e.target.value)}
              />
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
        </div>

        <div style={{overflowX: 'auto', WebkitOverflowScrolling: 'touch'}}>
            <table className="Table responsive-table ">
            <thead className="Table-header">
                <tr className="Header-rows">
                  <th className='Header-data'>Employee Name</th>
                  <th className='Header-data'>Employee ID</th>
                  <th className='Header-data'>Level</th>
                  <th className='Header-data'>Position</th>
                  <th className='Header-data'>Module</th>
                  <th className='Header-data'>Batch Name</th>
                  <th className='Header-data'>Batch Start Date</th>
                  <th className='Header-data'>Batch End Date</th>
                  <th className='Header-data'>Supervisor Status</th>
                  <th className='Header-data'>Attendance</th>
                  <th className='Header-data'>Pre Assessment Ratings</th>
                  <th className='Header-data'>Post Assessment Rating</th>
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
                    <td className="Body-data">{m.EmployeeName}</td>
                    <td className="Body-data">{m.EmployeeID}</td>
                    <td className="Body-data">{m.Level}</td>
                    <td className="Body-data">{m.Position}</td>
                    <td className="Body-data">{m.Module}</td>
                    <td className="Body-data">{m.BatchName}</td>
                    <td className="Body-data">{formatDate(m.BatchStartDate)}</td>
                    <td className="Body-data">{formatDate(m.BatchEndDate)}</td>
                    <td className="Body-data">{m.SupervisorStatus}</td>
                    <td className="Body-data">{m.Attendance}</td>
                    <td>
                      <input
                        type="number"
                        value={m.PreAssessmentRatings || ""}
                        onChange={(e) => handlePreChange(m.Id, e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={m.PostAssesmentRating || ""}
                        onChange={(e) => handlePostChange(m.Id, e.target.value)}
                      />
                    </td>
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

        <div className='form-row'>
          <button
            type='button'
            onClick={handleSubmit}
            className='view-emp-btn'
          >
            Save
          </button>
          <button
            type='button'
            onClick={() =>history.push("/")}
            className='view-emp-btn'
          >
            Exit
          </button>
        </div>
        </div>
      </div>
    </div>
  );
};