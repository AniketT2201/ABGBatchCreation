import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import type { IAbgBatchCreationProps } from '../IAbgBatchCreationProps';
import { useHistory } from 'react-router-dom';
import '../styles.scss';
import '../TNICreation.scss';
//FinancialYear Master Imports
import { IFinancialYearMaster } from '../../services/interface/IFinancialYearMaster';
import FinancialYearMasterOps from '../../services/BAL/FinancialYearMaster';
//BatchCreation Master Imports
import { IBatchCreationDashboard } from '../../services/interface/IBatchCreationDashboard';
import DashboardOps from '../../services/BAL/BatchCreationDashboard';
import Swal from 'sweetalert2';
import { Search24Regular } from "@fluentui/react-icons";
import { formatDate } from '../../services/Helper';
import TNIDashboardOps from '../../services/BAL/TNIDashboard';
import BatchCreationSpCrudOps from '../../services/BAL/BatchCreationSpCrud';
import EmployeeMasterOps from '../../services/BAL/EmployeeMaster';




export const EmployeeBatchAllocation: React.FunctionComponent<IAbgBatchCreationProps> = (props: IAbgBatchCreationProps) => {
  const fetchStartTimeRef = useRef(0);
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [isAllocating, setIsAllocating] = useState(false);
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);
  const [progress, setProgress] = useState(0);
  const [batchTypeFlag, setBatchTypeFlag] = useState<any>();
  const [modId, setModId] = useState<any>();

  // Search states
  const [batchSearch, setBatchSearch] = useState("");
  const [tnidetailsSearch, setTnidetailsSearch] = useState("");

  // Pagination states
  const [batchPage, setBatchPage] = useState(1);
  const [tnidetailsPage, setTnidetailsPage] = useState(1);

  // For custom rows per page 
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Dropdown data states
  const [batch, setBatch] = useState<IBatchCreationDashboard[]>([]);
  const [financialYear, setFinancialYear] = useState<IFinancialYearMaster[]>([]);

  // Selected dropdown values
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedFinancialYear, setSelectedFinancialYear] = useState("");

  // For filtering Batch and show filtered Batch data
  const [filteredBatch, setFilteredBatch] = useState<any[]>([]);
  const [selectedBatchRows, setSelectedBatchRows] = useState<number[]>([]);
  const [selectAllBatch, setSelectAllBatch] = useState(false);

  // For showing tnidetails based on batch and financialyear
  const [tnidetails, setTnidetails] = useState<any[]>([]);
  const [showTnidetails, setShowTnidetails] = useState(false);
  const [selectedTnidetailsRows, setSelectedTnidetailsRows] = useState<number[]>([]);
  const [selectAllTnidetails, setSelectAllTnidetails] = useState(false);

  // For reset page when rowsperpage changes
  useEffect(() => {
    setBatchPage(1);
  }, [rowsPerPage]);

  // For reset page and selections when Batch search changes
  useEffect(() => {
    setBatchPage(1);
    setSelectedBatchRows([]);
    setSelectAllBatch(false);
  }, [batchSearch]);

  // Fetch SharePoint List Data
  useEffect(() => {
    const loadDropdownData = async () => {
      setLoading(true);
      try {
        // Fetching PositionMaster Data
        const batchData = await DashboardOps().getBatchDashboardData(props);
        setBatch(batchData);

        // Fetching FinancialYearMaster Data
        const financialYearData = await FinancialYearMasterOps().getAllFinancialYearMasterData(props);
        setFinancialYear(financialYearData);

      } catch (error) {
        console.error("Error loading dropdown data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDropdownData();
  }, []);

  // Get IDs from selected values
  const getBatchtext = () => batch.find(item => item.BatchName === selectedBatch)?.BatchName || '';
  const getFinYearId = () => financialYear.find(item => item.FinancialYear === selectedFinancialYear)?.Id || '';

  // batch change: Reload modules by batch
  const handlebatchChange = async (batchText: string) => {
    setLoading(true);

    fetchStartTimeRef.current = Date.now();
    const getBatchtext = () => batch.find(item => item.BatchName === batchText) || '';

    setSelectedBatch(batchText);
    setFilteredBatch([]);
    setSelectedBatchRows([]);
    setSelectAllBatch(false);

    if (!batchText) {
      setLoading(false);
      return;
    }

    try {  
      const batches = await DashboardOps().getBatchDashboardDataById(batchText, props);
      const batchType = batches[0]?.BatchType; 
      const modulesId = batches[0]?.ModulesNameId;
      setModId(modulesId);
      setBatchTypeFlag(batchType === 'Elearning');
      setFilteredBatch(batches);
      setBatchPage(1);
    } catch (err) {
      console.error("Error on batch change:", err);
      Swal.fire("Error", "Failed to load batches.", "error");
    } finally {
      setLoading(false);
    }
  };

  // View TNI Depatment details based on selected Batch and FinancialYear
  const handleViewTnidetailss = async () => {
    if (!selectedBatch || !selectedFinancialYear) {
      Swal.fire("Warning", "Please select Batch and FinancialYear.", "warning");
      return;
    }

    const batchId = getBatchtext();
    const FinYearId = getFinYearId();

    setLoading(true);
   
    try {
      const tniDetails = await TNIDashboardOps().getTNIDashboardData(modId, FinYearId, batchTypeFlag, props);
      setTnidetails(tniDetails);
      setSelectedTnidetailsRows([]);
      setSelectAllTnidetails(false);
      setShowTnidetails(true);
      setTnidetailsPage(1);
    } catch (err) {
      console.error("Error loading Tnidetailss:", err);
      Swal.fire("Error", "Failed to load Tnidetailss.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Toggle Tnidetails for single row selection
  const toggleTnidetailsRow = (index: number) => {
    setSelectedTnidetailsRows(prev => {
      const updated = prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index];
      setSelectAllTnidetails(updated.length === filteredTnidetailsList.length && updated.length > 0);
      return updated;
    });
  };

  // Toggle Tnidetails for all row selection
  const toggleSelectAllTnidetailss = () => {
    if (selectAllTnidetails) {
      setSelectedTnidetailsRows([]);
      setSelectAllTnidetails(false);
    } else {
      setSelectedTnidetailsRows(tnidetails.map((_, i) => i));
      setSelectAllTnidetails(true);
    }
    
  };


  // --- Tnidetails SEARCH & PAGINATION ---
  const filteredTnidetailsList = tnidetails.filter((e) => {
    const text = tnidetailsSearch.toLowerCase();
    return (
      e.Id?.toString().includes(text) ||
      e.DepartmentName?.toLowerCase().includes(text) ||
      e.Position?.toLowerCase().includes(text) ||
      e.PositionId?.toString().includes(text) ||
      e.TNIDepartmentName?.toLowerCase().includes(text) ||
      e.EmployeeID?.toString().includes(text) ||
      e.EmployeeIDId?.toString().includes(text) ||
      e.EmployeeName?.toLowerCase().includes(text) ||
      e.LevelId?.toString().includes(text) ||
      e.Level?.toLowerCase().includes(text) ||
      e.Modules?.toLowerCase().includes(text) 
    );
  });

  const empStart = (tnidetailsPage - 1) * rowsPerPage;
  const TnidetailsPaginated = filteredTnidetailsList.slice(
    empStart,
    empStart + rowsPerPage
  );
  

  // Handle batch Allocation 
  const handleAllocateBatch = async (isUnscheduled: boolean = false) => {
    // STEP 0: Basic Validation
    if (selectedTnidetailsRows.length === 0) {
      Swal.fire("Warning", "Please select at least one employee.", "warning");
      return;
    }
    if (!selectedBatch || filteredBatch.length === 0) {
      Swal.fire("Warning", "Please select a batch.", "warning");
      return;
    }

    const batchDetails = filteredBatch[0];
    const finYearId = getFinYearId(); // your existing helper

    setProgress(0);
    setIsAllocating(true); // new state
    setLoading(true);

    try {
      // -----------------------------------------
      // STEP 1: Build Combinations (Employee + Batch)
      // -----------------------------------------
      const selectedTniItems = selectedTnidetailsRows
        .map(index => tnidetails[index]) // assuming row index → data
        .filter(Boolean);

      const combinations = selectedTniItems.map(tni => ({
        key: `${tni.EmployeeID}-${batchDetails.Id}-${batchDetails.ModulesNameId}`, // unique key
        tniId: tni.Id,
        empId: tni.EmployeeIDId,
        empCode: tni.EmployeeID,
        moduleId: batchDetails.ModulesNameId,
        batchId: batchDetails.Id,
        tniItem: tni
      }));

      // -----------------------------------------
      // STEP 2: Bulk Duplicate + Rejection Check
      // -----------------------------------------
      setIsCheckingDuplicates(true);
      const conflicts = await BatchCreationSpCrudOps().bulkCheckDuplicates(combinations, props);
      setIsCheckingDuplicates(false);

      const conflictKeys = new Set(conflicts.map(c => c.key));
      const rejectedKeys = new Set(conflicts.filter(c => c.isRejected).map(c => c.key));

      if (rejectedKeys.size > 0) {
        const rejectedCodes = conflicts
          .filter(c => c.isRejected)
          .map(c => c.empCode)
          .join(", ");
        throw new Error(`Employee(s) ${rejectedCodes} were previously rejected for this batch.`);
      }

      // -----------------------------------------
      // STEP 3: Filter only safe-to-allocate items
      // -----------------------------------------
      const toAllocate = combinations.filter(c => !conflictKeys.has(c.key));

      const savedCount = toAllocate.length;
      const skippedCount = combinations.length - savedCount;

      if (savedCount === 0) {
        Swal.fire("Info", "No new allocations made — all selected employees are already allocated.", "info");
        return;
      }
      setProgress(10);
      // -----------------------------------------
      // STEP 4: Prepare Bulk Payload + Insert
      // -----------------------------------------
      const allocationPayloads: any[] = [];
      const totalSteps = toAllocate.length;
      let currentStep = 0;

      // ✅ CONSOLIDATED: Define isUnscheduledMode once here (moved up)
      const isUnscheduledMode = isUnscheduled || batchDetails.Unscheduled === "Yes";

      for (const item of toAllocate) {
        const tni = item.tniItem;

        try {
          // Fetch EmployeeMaster data
          const empMaster = await EmployeeMasterOps().getEmployeesData(tni.EmployeeID, props);
          const empRecord = empMaster[0];

          if (!empRecord) {
            console.warn(`Employee master not found for ${tni.EmployeeID}`);
            continue; // skip this one
          }

          const mgrId = empRecord.ManagerId || null;
          const deptId = empRecord.DepartmentId || null;
          const tniDeptId = empRecord.TNIDepartmentId || null;

          const basePayload: any = {
            Position: tni.Position,
            DepartmentId: deptId,
            TNIDepartmentId: tniDeptId,
            Level: tni.Level,
            EmployeeIDId: tni.EmployeeIDId,
            EmployeeNameId: tni.EmployeeNameId,
            BatchNameId: batchDetails.Id,
            BatchIntake: batchDetails.BatchIntake,
            BatchStartDate: batchDetails.BatchStartDate,
            BatchEndDate: batchDetails.BatchEndDate,
            ModuleId: batchDetails.ModulesNameId,
            ReportingManagerId: mgrId,
            VenueId: batchDetails.VenueId || null,
            TrainingTime: batchDetails.TrainingTime,
            FinancialYearId: finYearId,
          };

          // E-Learning special fields
          if (batchTypeFlag) {
            const tenDaysLater = new Date();
            tenDaysLater.setDate(tenDaysLater.getDate() + 10);
            Object.assign(basePayload, {
              BatchType: "Elearning",
              SupervisorStatus: "NotApplicable",
              TrainingCoOrdinatorStatus: "NotApplicable",
              TrainingStatus: "NotAttended",
              ElearningEmail: tenDaysLater.toISOString(),
            });
          }

          // Unscheduled mode
          const isUnscheduledMode = isUnscheduled || batchDetails.Unscheduled === "Yes";
          if (isUnscheduledMode) {
            Object.assign(basePayload, {
              BatchAllocationType: "Unscheduled",
              Attendance: "Present",
              SupervisorStatus: "NA",
            });
          }

          allocationPayloads.push(basePayload);

        } catch (err) {
          console.error(`Failed to prepare payload for ${tni.EmployeeID}:`, err);
          // Continue with others
        }

        currentStep++;
        setProgress(10 + Math.round((currentStep / totalSteps) * 40)); // 10-50% for payload prep
      }

      if (allocationPayloads.length === 0) {
        throw new Error("No valid employees could be prepared for allocation.");
      }

      // Bulk insert into BatchAllocation2223
      await BatchCreationSpCrudOps().insertBatchData(allocationPayloads, props, (completed, total) => {
        const percent = 50 + Math.round((completed / total) * 30);
        setProgress(percent);
      });

      // STEP 5: Create Feedback Forms (Unscheduled only)
      if (isUnscheduledMode) {
        const feedbackPayloads = allocationPayloads.map((p) => ({
          Position: p.Position,
          DepartmentId: p.DepartmentId,
          Level: p.Level,
          EmployeeIDId: p.EmployeeIDId,
          EmployeeNameId: p.EmployeeNameId,
          BatchNameId: p.BatchNameId,
          BatchStartDate: p.BatchStartDate,
          BatchEndDate: p.BatchEndDate,
          ModuleId: p.ModuleId,
          ReportingManagerId: p.ReportingManagerId,
          SupervisorStatus: "NA",
          Attendance: "Present",
          FinancialYearId: p.FinancialYearId,
        }));

        await BatchCreationSpCrudOps().insertFeedbackForms(feedbackPayloads, props);

        const trainerFeedbackPayloads = allocationPayloads.map((p) => ({
          Level: p.Level,
          EmployeeUniqueIDId: p.EmployeeIDId,
          EmployeeNameId: p.EmployeeNameId,
          BatchNameId: p.BatchNameId,
          TrainerNameId: batchDetails.TrainerNamesId || null,
          TrainerType1: batchDetails.TrainerType1,
          TrainerType2: batchDetails.TrainerType2,
          TrainerNameNewId: batchDetails.TrainerNameNewId || null,
          ModuleNameId: p.ModuleId,
          FinancialYearId: p.FinancialYearId,
        }));

        await BatchCreationSpCrudOps().insertTrainerFeedbackForms(trainerFeedbackPayloads, props);
      }

      setProgress(75);
      // -----------------------------------------
      // STEP 6: Update TNI Flags (bulk if possible)
      // -----------------------------------------
      const tniUpdatePayload = allocationPayloads.map((payload) => {
        const originalCombo = toAllocate.find(c => 
          c.empId === payload.EmployeeIDId 
        );
        return {
          id: originalCombo?.tniId || 0,
          updates: {
            TNIflag: "Batchallocated",
            BatchFlag: "Batchallocated",
            BatchCancel: "Select",
            ...(batchTypeFlag && { TrainingType: "Elearning" }),
          },
        };
      });

      await BatchCreationSpCrudOps().bulkUpdateTNIFlags(tniUpdatePayload, props);
      setProgress(85);
      // -----------------------------------------
      // STEP 7: Update Batch Status + Manager Association
      // -----------------------------------------
      const newStatus = isUnscheduledMode ? "TrainingConducted" : "InProgress";

      await BatchCreationSpCrudOps().updateBatchStatus(batchDetails.Id, newStatus, props);
      setProgress(95);
      
      // Manager Association Logic
      if (!batchTypeFlag && !isUnscheduledMode) {
        // Collect unique non-null Manager IDs from successfully allocated employees
        const managerIds = new Set<number>();

        allocationPayloads.forEach((payload) => {
          if (payload.ReportingManagerId) {
            managerIds.add(payload.ReportingManagerId);
          }
        });

        if (managerIds.size > 0) {
          const managerAssociationPayloads = Array.from(managerIds).map((mgrId) => ({
            AssociatedManagerId: mgrId,
            BatchNameId: batchDetails.Id,
            BatchStartDate: batchDetails.BatchStartDate,
            BatchEndDate: batchDetails.BatchEndDate,
            ModuleId: batchDetails.ModulesNameId,
            LevelId: batchDetails.LevelId, 
            VenueId: batchDetails.VenueId || null,
            TrainingTime: batchDetails.TrainingTime,
            FinancialYearId: finYearId,
          }));

          // Use your existing insert pattern (safe sequential insert)
          await BatchCreationSpCrudOps().insertManagerAssociations(
            managerAssociationPayloads,
            props,
            (completed, total) => {
              const extraPercent = Math.round((completed / total) * 4);
              setProgress(95 + extraPercent);
            }
          );
        }
      }

      // -----------------------------------------
      // STEP 8: Success Message
      // -----------------------------------------
      let html = `<strong>${allocationPayloads.length} employee${allocationPayloads.length > 1 ? "s" : ""} allocated successfully!</strong>`;
      if (skippedCount > 0) {
        html += `<br><strong>${skippedCount} skipped (already allocated or rejected).</strong>`;
      }

      Swal.fire({
        icon: "success",
        title: "Batch Allocation Complete",
        html
      });

      // Reset selections
      setSelectedTnidetailsRows([]);
      setSelectAllTnidetails(false);
      //onAllocationComplete(); // redirect or refresh

    } catch (error: any) {
      console.error("Allocation failed:", error);
      Swal.fire("Error", error.message || "Failed to allocate employees.", "error");
    } finally {
      setProgress(100);
      setTimeout(() => {
        setIsAllocating(false);
        setLoading(false);
      }, 600);
      history.push("/");
    }
  };


  return (
    <div className="pageContainer">
      {/* SPINNER */}
      {loading && !isAllocating && (
        <div className="loadingOverlay1">
          <div className="spinner1"></div>
        </div>
      )}
      {loading && isAllocating && (
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
          <h1 className="popup-header">Employee Batch Allocation</h1>
        </div>
      </div>
      {/* PAGE CONTENT */}
      <div className="pageContent">
        <h1 className='section-title'>Batch Details</h1>
        <div className="form-card">
          <div className="form-row">
            <div className="form-group">
              <label>Batch</label>
              <select
                  value={selectedBatch}
                  onChange={(e) => {
                    handlebatchChange(e.target.value);
                  }}
                >
                  <option value="">Select</option>
                  {batch.map((item) => (
                    <option key={item.Id} value={item.BatchName}>
                      {item.BatchName}
                    </option>
                  ))}
                </select>
            </div>
            <div className="form-group">
              <label>Financial Year</label>
              <select
                  value={selectedFinancialYear}
                  onChange={(e) => {
                    setSelectedFinancialYear(e.target.value);
                  }}
                >
                  <option value="">Select</option>
                  {financialYear.map((item) => (
                    <option key={item.Title} value={item.FinancialYear}>
                      {item.FinancialYear}
                    </option>
                  ))}
                </select>
            </div>
          </div>
        </div>
        {/* Standard Modules Table */}
          <div className="Table-container">
            <h2 className='section-title'>Batch Details</h2>
            <div className={"table-controls d-flex mt-3 flex-wrap"}>
              <div className="search-container me-3 mb-2" style={{height: 'auto', position: 'relative'}}>
                <Search24Regular className='searchIcon' />
                <input
                  className='table-search'
                  type='text'
                  placeholder='Search Modules...'
                  value={batchSearch}
                  onChange={(e) => {
                    setBatchSearch(e.target.value);
                    setBatchPage(1);
                  }}
                  style={{ maxWidth: '300px', paddingLeft: '38px' }}
                />
              </div>
              <div className="page-size-container mb-2" style={{height: 'auto'}}>
                <label htmlFor="rowsPerPage" className="me-2 font-medium">Batch Details</label>
                <select
                  id="rowsPerPage"
                  className="rows-dropdown"
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setBatchPage(1);
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
            {/* <div className="selected-count">
              <strong>Selected Modules:</strong> {selectedBatchRows.length} / {filteredBatch.length}
            </div> */}
            <div style={{overflowX: 'auto', WebkitOverflowScrolling: 'touch'}}>
              <table className="Table responsive-table ">
                <thead className="Table-header">
                  <tr className="Header-rows">
                    {/* <th className='Header-data'>
                      <input
                        type='checkbox'
                        checked={selectAllBatch}
                        onChange={toggleSelectAllModules}
                      />
                    </th> */}
                    <th className='Header-data'>Module</th>
                    <th className='Header-data'>Level</th>
                    <th className='Header-data'>Batch Name</th>
                    <th className='Header-data'>Batch Start Date</th>
                    <th className='Header-data'>Batch End Date</th>
                    <th className='Header-data'>Batch Intake</th>
                    <th className='Header-data'>Duration</th>
                    <th className='Header-data'>Unsheduled</th>
                    <th className='Header-data'>Trainer Name 1</th>
                    <th className='Header-data'>Trainer Name 2</th>
                  </tr>
                </thead>
                <tbody className={`Table-body `}>
                  {filteredBatch.map((m, index) => {
                    //const globalIndex = moduleStart + index;
                    return (
                      <tr key={index}
                        //onClick={() => toggleModuleRow(globalIndex)}
                        className={`Body-rows ${index % 2 === 0 ? "even" : "odd"}`}
                        style={{
                          backgroundColor: selectedBatch.includes(index as any) ? "#e6f7ff" : "white",
                          cursor: "pointer",
                          border: "1px solid #ddd",
                        }}
                      >
                        {/* <td className="Body-data">
                          <input
                            type="checkbox"
                            checked={selectedBatchRows.includes(globalIndex)}
                            readOnly
                          />
                        </td> */}
                        <td className="Body-data">{m.ModulesName || "-"}</td>
                        <td className="Body-data">{m.Level || "-"}</td>
                        <td className="Body-data">{m.BatchName || "-"}</td>
                        <td className="Body-data">{formatDate(m.BatchStartDate) || "-"}</td>
                        <td className="Body-data">{formatDate(m.BatchEndDate) || "-"}</td>
                        <td className="Body-data">{m.BatchIntake || "-"}</td>
                        <td className="Body-data">{m.Duration || "-"}</td>
                        <td className="Body-data">{m.Unscheduled || "-"}</td>
                        <td className="Body-data">{m.TrainerNames || "-"}</td>
                        <td className="Body-data">{m.TrainerNameNew || "-"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* <div className="pagination-container">
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
            </div> */}
            <button
              type='button'
              onClick={handleViewTnidetailss}
              className='viewBtn'
            >
              View
            </button>
          </div>
        {/* Eligible Employee Table */}
        {showTnidetails  && (
          <div className="Table-container">
            <h2 className='section-title'>TNI Details</h2>
            <div className={"table-controls d-flex mt-3 flex-wrap"}>
              <div className="search-container me-3 mb-2" style={{height: 'auto', position: 'relative'}}>
                <Search24Regular className='searchIcon' />
                <input
                  className='table-search'
                  type='text'
                  placeholder='Search Employees...'
                  value={tnidetailsSearch}
                  onChange={(e) => {
                    setTnidetailsSearch(e.target.value);
                    setTnidetailsPage(1);
                  }}
                  style={{ maxWidth: '300px', paddingLeft: '38px'}}
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
                    setTnidetailsPage(1);
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
            <div className="selected-count">
              <strong>Selected Employees:</strong> {selectedTnidetailsRows.length} / {tnidetails.length}
            </div>
            <div style={{overflowX: 'auto', WebkitOverflowScrolling: 'touch'}}>
              <table className="Table responsive-table">
                <thead className="Table-header">
                  <tr className="Header-rows">
                    <th className='Header-data'>
                      <input
                        type='checkbox'
                        checked={selectAllTnidetails}
                        onChange={toggleSelectAllTnidetailss}
                      />
                    </th>
                    <th className='Header-data'>Position</th>
                    <th className='Header-data'>Modules</th>
                    <th className='Header-data'>Level</th>
                    <th className='Header-data'>TNIDepartment</th>
                    <th className='Header-data'>Department</th>
                    <th className='Header-data'>EmployeeID</th>
                    <th className='Header-data'>EmployeeName</th>
                  </tr>
                </thead>
                <tbody className="Table-body">
                  {TnidetailsPaginated.map((e, index) => {
                    const globalIndex = empStart + index;
                    return (
                      <tr
                        key={index}
                        onClick={() => toggleTnidetailsRow(globalIndex)}
                        className={`Body-rows ${index % 2 === 0 ? "even" : "odd"}`}
                        style={{
                          backgroundColor: selectedTnidetailsRows.includes(globalIndex) ? "#e6f7ff" : "white",
                          cursor: "pointer",
                          border: "1px solid #ddd",
                        }}
                      >
                        <td className="Body-data">
                          <input
                            type="checkbox"
                            checked={selectedTnidetailsRows.includes(globalIndex)}
                            readOnly
                          />
                        </td>
                        <td className="Body-data">{e.Position || "-"}</td>
                        <td className="Body-data">{e.Modules || "-"}</td>
                        <td className="Body-data">{e.Level || "-"}</td>
                        <td className="Body-data">{e.TNIDepartment || "-"}</td>
                        <td className="Body-data">{e.Department || "-"}</td>
                        <td className="Body-data">{e.EmployeeID || "-"}</td>
                        <td className="Body-data">{e.EmployeeName || "-"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="pagination-container">
              <div className="pagination-info">
                Showing {empStart + 1}–{Math.min(empStart + rowsPerPage, filteredTnidetailsList.length)}
                {" "}of {filteredTnidetailsList.length} entries
              </div>
              <div className="pagination-buttons">
                <button className="pg-btn" disabled={tnidetailsPage === 1} onClick={() => setTnidetailsPage(1)}>⏮</button>
                <button className="pg-btn" disabled={tnidetailsPage === 1} onClick={() => setTnidetailsPage(p => p - 1)}>◀</button>
                <span className="pg-number">Page {tnidetailsPage}</span>
                <button
                  className="pg-btn"
                  disabled={tnidetailsPage >= Math.ceil(filteredTnidetailsList.length / rowsPerPage)}
                  onClick={() => setTnidetailsPage(p => p + 1)}
                >▶</button>
                <button
                  className="pg-btn"
                  disabled={tnidetailsPage >= Math.ceil(filteredTnidetailsList.length / rowsPerPage)}
                  onClick={() => setTnidetailsPage(Math.ceil(filteredTnidetailsList.length / rowsPerPage))}
                >⏭</button>
              </div>
            </div>
            <div style={{display: "flex", justifyContent: "center"}}>
              <button
                type='button'
                disabled={loading}
                onClick={() => handleAllocateBatch(false)}
                className='batchallocationbtn'
              >
                Allocate Batch
              </button>
              {!batchTypeFlag && (
                <button
                  onClick={() => handleAllocateBatch(true)}
                  disabled={loading}
                  className="batchallocationbtn"
                >
                  {loading ? "Processing..." : "Allocate Unscheduled Batch"}
                </button>
              )}
              <button
                type='button'
                onClick={() => history.push("/BatchAllocationDashboard")}
                className='batchallocationbtn'
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};