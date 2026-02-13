// TNICreation.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
//import { debounce } from 'lodash.debounce';
import { PrimaryButton } from '@fluentui/react';
import { IAbgBatchCreationProps } from '../IAbgBatchCreationProps';
import '../TNICreation.scss';
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
import '../styles.scss';
import Swal from 'sweetalert2';
import { checkDuplicateLocal } from '../../services/Helper';
import { Search24Regular } from "@fluentui/react-icons";
import TNICreationSPCrudOps from '../../services/BAL/TNICreationSPCrud';
import { useHistory } from 'react-router-dom';


export const TNICreation: React.FunctionComponent<IAbgBatchCreationProps> = (props) => {

  const fetchStartTimeRef = useRef(0);
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [isTNICreating, setIsTNICreating] = useState(false);
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);
  const [progress, setProgress] = useState(0);


  // Search states
  const [moduleSearch, setModuleSearch] = useState("");
  const [employeeSearch, setEmployeeSearch] = useState("");

  // Pagination states
  const [modulePage, setModulePage] = useState(1);
  const [employeePage, setEmployeePage] = useState(1);

  //const rowsPerPage = 10;

  // For custom rows per page 
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Dropdown data states
  const [position, setPosition] = useState<IPositionMaster[]>([]);
  const [financialYear, setFinancialYear] = useState<IFinancialYearMaster[]>([]);

  // Selected dropdown values
  const [selectedPosition, setSelectedPosition] = useState("");
  const [selectedTniDepartment, setSelectedTniDepartment] = useState("");
  const [selectedTniDeptId, setSelectedTniDeptId] = useState("0");
  const [selectedFinancialYear, setSelectedFinancialYear] = useState("");

  // Cascading TNI Dept options
  const [tniDepartmentOptions, setTniDepartmentOptions] = useState<{ Id: string; TNIDepartment: string }[]>([
    { Id: "0", TNIDepartment: "All" }
  ]);

  // For filtering module and show filtered modules data
  const [filteredModules, setFilteredModules] = useState<any[]>([]);
  const [selectedModuleRows, setSelectedModuleRows] = useState<number[]>([]);
  const [selectAllModules, setSelectAllModules] = useState(false);

  // For adding Employees
  const [employees, setEmployees] = useState<any[]>([]);
  const [showEmployees, setShowEmployees] = useState(false);
  const [selectedEmployeeRows, setSelectedEmployeeRows] = useState<number[]>([]);
  const [selectAllEmployees, setSelectAllEmployees] = useState(false);

  // For reset page when rowsperpage changes
  useEffect(() => {
    setModulePage(1);
    setEmployeePage(1);
  }, [rowsPerPage]);

  // For reset page and selections when module search changes
  useEffect(() => {
    setModulePage(1);
    setSelectedModuleRows([]);
    setSelectAllModules(false);
  }, [moduleSearch]);

  // For reset page and selections when employee search changes
  useEffect(() => {
    setEmployeePage(1);
    setSelectedEmployeeRows([]);
    setSelectAllEmployees(false);
  }, [employeeSearch]);

  
  // Fetch SharePoint List Data
    useEffect(() => {
      const loadDropdownData = async () => {
        setLoading(true);
        try {
          // Fetching PositionMaster Data
          const positionData = await PositionMasterOps().getPositionMasterData(props);
          setPosition(positionData);
  
          // Fetching FinancialYearMaster Data
          const financialYearData = await FinancialYearMasterOps().getAllFinancialYearMasterData(props);
          setFinancialYear(financialYearData.filter(f => f.FinancialYear !== "2019-2020"));
  
        } catch (error) {
          console.error("Error loading dropdown data:", error);
        } finally {
          setLoading(false);
        }
      };
  
      loadDropdownData();
    }, []);

    // Get IDs from selected values
  const getPosId = () => position.find(item => item.PositionName === selectedPosition)?.Id || '';
  const getFinYearId = () => financialYear.find(item => item.FinancialYear === selectedFinancialYear)?.Id || '';

  // Position change: Cascade TNI Depts + load modules by position
  const handlePositionChange = async (positionName: string) => {
    setLoading(true);

    fetchStartTimeRef.current = Date.now();
    const pos = position.find(p => p.PositionName === positionName);
    const posId = pos?.Id || "";
    setSelectedPosition(positionName);
    setSelectedTniDepartment("All");
    setSelectedTniDeptId("0");
    setFilteredModules([]);
    setSelectedModuleRows([]);
    setSelectAllModules(false);
    setEmployees([]);
    setShowEmployees(false);

    if (!positionName || positionName === "Select") {
      setTniDepartmentOptions([{ Id: "0", TNIDepartment: "All" }]);
      return;
    }

    //const posId = position.find(item => item.PositionName === selectedPosition)?.Id || '';
    if (!posId) {
      setLoading(false);
      return;
    }

    try {
      // Load unique TNI Depts (like BindTNIDept)
      const uniqueDepts = await DashboardOps().getUniqueTNIDeptsByPosition(posId.toString(), props);
      if (!uniqueDepts || uniqueDepts.length === 0) {
        Swal.fire({
          icon: 'info',
          title: 'No Unique Deparments Found',
          text: 'No Unique Deparments are available for the selected position.',
        });
      }
      const options = [
        { Id: "0", TNIDepartment: "All" },
        ...uniqueDepts.map((d: any) => ({
          Id: d.TNIDepartmentName?.Id?.toString() || '',
          TNIDepartment: d.TNIDepartmentName?.TNIDepartment || ''
        }))
      ];

      // remove Dumplicate Values by name
      const seen = new Set<string>();
      const filteredOptions = options.filter(item => {
        if (seen.has(item.TNIDepartment)) return false;
        seen.add(item.TNIDepartment);
        return true;
      });

      setTniDepartmentOptions(filteredOptions);

      // Load modules by position only (flag "Pos")
      const modules = await DashboardOps().getModulesByPositionOnly(posId.toString(), props);
      if (!modules || modules.length === 0) {
        Swal.fire({
          icon: 'info',
          title: 'No Modules Found',
          text: 'No modules are available for the selected position.',
        });
      }
      setFilteredModules(modules);
      setModulePage(1);
    } catch (err) {
      console.error("Error on position change:", err);
      Swal.fire("Error", "Failed to load departments or modules.", "error");
    } finally {
      setLoading(false);
    }
  };

  // TNI Dept change: Reload modules by position + dept
  const handleTniDeptChange = async (deptText: string, deptId: string) => {
    setLoading(true);

    setSelectedTniDepartment(deptText);
    setSelectedTniDeptId(deptId);
    setFilteredModules([]);
    setSelectedModuleRows([]);
    setSelectAllModules(false);
    setEmployees([]);
    setShowEmployees(false);

    if (!selectedPosition) {
      setLoading(false);
      return;
    }
    const posId = getPosId();
    if (!posId) {
      setLoading(false);
      return;
    }

    try {
      let modules;
      if (deptId === "0") {
        modules = await DashboardOps().getModulesByPositionOnly(posId.toString(), props);
      } else {
        modules = await DashboardOps().getModulesByPositionAndDept(posId.toString(), deptId, props);
      }
      setFilteredModules(modules);
      setModulePage(1);
    } catch (err) {
      console.error("Error on dept change:", err);
      Swal.fire("Error", "Failed to load modules.", "error");
    } finally {
      setLoading(false);
    }
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
  const filteredModuleList = filteredModules.filter((m) => {
    const text = moduleSearch.toLowerCase();
    return (
      m.PosText?.toLowerCase().includes(text) ||
      m.ModuleText?.toLowerCase().includes(text) ||
      m.Level?.toLowerCase().includes(text) ||
      m.TniDeptText?.toLowerCase().includes(text)
    );
  });

  const moduleStart = (modulePage - 1) * rowsPerPage;
  const modulePaginated = filteredModuleList.slice(
    moduleStart,
    moduleStart + rowsPerPage
  );

  // Handle View Employees: Fetch by selected position + dept (no module loop)
  const handleViewEmployees = async () => {
    if (selectedModuleRows.length === 0) {
      Swal.fire("Warning", "Please select at least one module.", "warning");
      return;
    }

    if (!selectedPosition) {
      Swal.fire("Warning", "Please select Position.", "warning");
      return;
    }

    const posId = getPosId();
    const deptId = selectedTniDeptId;

    setLoading(true);
   
    try {
      let emps;
      if (deptId === "0") {
        emps = await DashboardOps().getEmployeesByPositionOnly(posId.toString(), props);
        if (!emps || emps.length === 0) {
          Swal.fire({
            icon: 'info',
            title: 'No Employees Found',
            text: 'No Employees are available for the selected Modules.',
          });
        }
      } else {
        emps = await DashboardOps().getEmployeesByPositionAndDept(posId.toString(), deptId, props);
        if (!emps || emps.length === 0) {
          Swal.fire({
            icon: 'info',
            title: 'No Employees Found',
            text: 'No Employees are available for the selected Modules.',
          });
        }
      }
      setEmployees(emps);
      setSelectedEmployeeRows([]);
      setSelectAllEmployees(false);
      setShowEmployees(true);
      setEmployeePage(1);
    } catch (err) {
      console.error("Error loading employees:", err);
      Swal.fire("Error", "Failed to load employees.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Map employees for display (matches DashboardOps output)
  const mappedEmployees = employees.map(emp => ({
    Id: emp.Id,
    EmployeeID: emp.EmployeeID,
    EmployeeName: emp.EmployeeName,
    PositionName: emp.PositionName || "",
    DepartmentName: emp.Department?.DepartmentName || "",
    DepartmentId: emp.Department?.Id,
    TNIDepartmentName: emp.TNIDepartmentName || "",
    ManagerName: emp.ManagerName?.Title || "",
    ManagerEmail: emp.ManagerName?.EMail || "",
    ManagerId: emp.ManagerName?.Id || null,
    EmployeeFlag: emp.EmployeeFlag,
  }));

  // Toggle employee for single row selection
  const toggleEmployeeRow = (index: number) => {
    setSelectedEmployeeRows(prev => {
      const updated = prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index];
      setSelectAllEmployees(updated.length === filteredEmployeeList.length && updated.length > 0);
      return updated;
    });
  };

  // Toggle employee for all row selection
  const toggleSelectAllEmployees = () => {
    if (selectAllEmployees) {
      setSelectedEmployeeRows([]);
      setSelectAllEmployees(false);
    } else {
      setSelectedEmployeeRows(employees.map((_, i) => i));
      setSelectAllEmployees(true);
    }
    
  };


  // --- EMPLOYEE SEARCH & PAGINATION ---
  const filteredEmployeeList = employees.filter((e) => {
    const text = employeeSearch.toLowerCase();
    return (
      e.EmployeeID?.toLowerCase().includes(text) ||
      e.EmployeeName?.toLowerCase().includes(text) ||
      e.PositionName?.toLowerCase().includes(text) ||
      e.TNIDepartmentName?.toLowerCase().includes(text)
    );
  });

  const empStart = (employeePage - 1) * rowsPerPage;
  const employeePaginated = filteredEmployeeList.slice(
    empStart,
    empStart + rowsPerPage
  );


  // For handling tni save in list 
  // const handleSaveTNI = async () => {
  //   if (selectedEmployeeRows.length === 0) {
  //     Swal.fire({
  //       icon: "warning",
  //       title: "No Employees Selected",
  //       text: "Please select employees to create TNI.",
  //     });
  //     return;
  //   }

  //   if (!selectedPosition) {
  //     Swal.fire("Warning", "Please select Position.", "warning");
  //     return;
  //   }

  //   if (!selectedFinancialYear) {
  //     Swal.fire("Warning", "Please select Financial Year.", "warning");
  //     return;
  //   }

  //   setLoading(true);

  //   const posId = getPosId();
  //   const finYearId = getFinYearId();
  //   const selectedModules = selectedModuleRows.map(index => filteredModuleList[index]).filter(Boolean);
  //   const selectedEmployees = selectedEmployeeRows.map(index => filteredEmployeeList[index]).filter(Boolean);

  //   let savedCount = 0;
  //   let skippedCount = 0;

  //   try {
  //     for (const emp of selectedEmployees) {
  //       for (const mod of selectedModules) {
  //         // Duplicate check 
  //         const isDuplicate = await TNICreationSPCrudOps().checkDuplicateTNI(
  //           emp.Id,
  //           mod.ModuleID,
  //           mod.TniDeptID,
  //           mod.LevelID,
  //           finYearId,
  //           props
  //         );

  //         console.log(`Duplicate result: ${isDuplicate} for above params`);

  //         if (isDuplicate) {
  //           skippedCount++;
  //           continue; 
  //         }

  //         await TNICreationSPCrudOps().insertDashboardData(
  //           {
  //             PositionId: mod.PosID,
  //             DepartmentId: emp.DepartmentId || null,
  //             TNIDepartmentId: mod.TniDeptID,

  //             ModulesId: mod.ModuleID,
  //             LevelId: mod.LevelID,

  //             EmployeeIDId: emp.Id,
  //             EmployeeNameId: emp.Id,

  //             ManagerNameId: emp.ManagerId,

  //             UniqIDId: emp.Id,
  //             EmployeeFlag: emp.EmployeeFlag || "Active",
  //             FinancialYearId: finYearId,
  //             TNIflag: "TNIcreated",
  //             BatchFlag: "NotAllocated",
  //           },
  //           props
  //         );
  //         savedCount++;
  //       }
  //     }

  //     const Attempts = savedCount + skippedCount;
  //     console.log("toal attempts: ", Attempts);
       
  //     if (Attempts === 0) {
  //       Swal.fire({
  //         icon: "warning",
  //         title: "No TNI Created",
  //         text: "No valid selections or all invalid IDs.",
  //       });
  //     } else if (savedCount === 0) {
  //       Swal.fire({
  //         icon: "warning",
  //         title: "No New TNI Created",
  //         text: "All selected entries already exist.",
  //       });
  //     } else {
  //       Swal.fire({
  //         icon: "success",
  //         title: "TNI Created",
  //         text: `${savedCount} TNI entries created successfully.`,
  //       });
  //       setSelectedModuleRows([]);
  //       setSelectAllModules(false);
  //       setSelectedEmployeeRows([]);
  //       setSelectAllEmployees(false);
  //     }
  //   } catch (error) {
  //     console.error("Error saving TNI data:", error);
  //     Swal.fire({
  //       icon: "error",
  //       title: "Error",
  //       text: "An error occurred while saving TNI data.",
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // New handle TNI function
  const handleSaveTNI = async () => {
    if (selectedEmployeeRows.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No Employees Selected",
        text: "Please select employees to create TNI.",
      });
      return;
    }
    if (!selectedPosition) {
      Swal.fire("Warning", "Please select Position.", "warning");
      return;
    }
    if (!selectedFinancialYear) {
      Swal.fire("Warning", "Please select Financial Year.", "warning");
      return;
    }

    setProgress(0);
    setIsTNICreating(true);
    setLoading(true);

    const posId = getPosId();
    const finYearId = getFinYearId();

    const selectedModules = selectedModuleRows
      .map(i => filteredModuleList[i])
      .filter(Boolean);

    const selectedEmployees = selectedEmployeeRows
      .map(i => filteredEmployeeList[i])
      .filter(Boolean);

    try {
      // -----------------------------------------
      // STEP 1: Build ALL Combinations
      // -----------------------------------------
      const combinations = [];
      for (const emp of selectedEmployees) {
        for (const mod of selectedModules) {
          combinations.push({
            key: `${emp.Id}-${mod.ModuleID}-${mod.TniDeptID}-${mod.LevelID}-${finYearId}`,
            empId: emp.Id,
            moduleId: mod.ModuleID,
            tniId: mod.TniDeptID,
            levelId: mod.LevelID,
            finId: finYearId,
            emp,
            mod
          });
        }
      }

      // Remove accidental duplicate combinations
      // const uniqueMap = new Map(combinations.map(c => [c.key, c]));
      // const uniqueCombos = Array.from(uniqueMap.values());

      // -----------------------------------------
      // STEP 2: Bulk Duplicate Check (chunked)
      // -----------------------------------------
      setIsCheckingDuplicates(true);
      const duplicates = await TNICreationSPCrudOps().bulkCheckDuplicates(combinations, props);
      setIsCheckingDuplicates(false);

      const dupKeys = new Set(duplicates.map(d => d.key));

      // -----------------------------------------
      // STEP 3: Filter NON-duplicate combinations
      // -----------------------------------------
      const toInsert = combinations.filter(c => !dupKeys.has(c.key));

      const savedCount = toInsert.length;
      const skippedCount = combinations.length - savedCount;

      // -----------------------------------------
      // STEP 4: Insert all NON-duplicates (sequential)
      // -----------------------------------------
      // Prepare payload for all items
      const payload = toInsert.map(item => ({
        PositionId: item.mod.PosID,
        DepartmentId: item.emp.DepartmentId || null,
        TNIDepartmentId: item.mod.TniDeptID,
        ModulesId: item.mod.ModuleID,
        LevelId: item.mod.LevelID,
        EmployeeIDId: item.emp.Id,
        EmployeeNameId: item.emp.Id,
        ManagerNameId: item.emp.ManagerId,
        UniqIDId: item.emp.Id,
        EmployeeFlag: item.emp.EmployeeFlag || "Active",
        FinancialYearId: finYearId,
        TNIflag: "TNIcreated",
        BatchFlag: "NotAllocated"
      }));

      // Single bulk insert
      await TNICreationSPCrudOps().insertDashboardData(payload, props, (completed, total) => {
        const percent = Math.round((completed / total) * 100);
        setProgress(percent);
      });


      // -----------------------------------------
      // STEP 5: Show Results
      // -----------------------------------------
      const Attempts = savedCount + skippedCount;
      console.log("Total Attempts:", Attempts);

      if (Attempts === 0) {
        Swal.fire({
          icon: "warning",
          title: "No TNI Created",
          text: "No valid selections or all invalid IDs."
        });
      } else if (savedCount === 0) {
        Swal.fire({
          icon: "warning",
          title: "No New TNI Created",
          text: "All selected entries already exist."
        });
      } else {
        // Build text message dynamically
        let successHtml = `<strong>${savedCount} TNI entr${savedCount > 1 ? "ies" : "y"} created successfully.</strong>`;

        if (skippedCount > 0) {
          successHtml += `<br/><strong>${skippedCount} entr${skippedCount > 1 ? "ies" : "y"} were skipped (already exist).</strong>`;
        }
        Swal.fire({
          icon: "success",
          title: "TNI Created",
          html: successHtml
        });

        setSelectedModuleRows([]);
        setSelectAllModules(false);
        setSelectedEmployeeRows([]);
        setSelectAllEmployees(false);
      }
    } catch (error) {
      console.error("Error saving TNI data:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while saving TNI data."
      });
    } finally {
      setProgress(100);
      setTimeout(() => {
        setIsTNICreating(false);
        setLoading(false);
      }, 600);
      history.push('/');
      //setLoading(false);
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
          <h1 className="popup-header">Employee ADD Modules</h1>
        </div>
      </div>
      {/* PAGE CONTENT */}
      <div className="pageContent">
        <h1 className='section-title'>TNI Creation</h1>

        <div className="form-card">
          <div className="form-row">
            <div className="form-group">
              <label>Position</label>
              <select
                  value={selectedPosition}
                  onChange={(e) => {
                    handlePositionChange(e.target.value);
                  }}
                >
                  <option value="">Select</option>
                  {position.map((item) => (
                    <option key={item.Title} value={item.PositionName}>
                      {item.PositionName}
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
            <div className="form-group">
              <label>TNI Department</label>
              <select
                  value={selectedTniDepartment}
                  onChange={(e) => {
                    const selectedOption = tniDepartmentOptions.find(o => o.TNIDepartment === e.target.value);
                    handleTniDeptChange(e.target.value, selectedOption?.Id || "0");
                  }}
                >
                  {tniDepartmentOptions.map((dept) => (
                  <option key={dept.Id} value={dept.TNIDepartment}>
                    {dept.TNIDepartment}
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
            </div>
            <div className="selected-count">
              <strong>Selected Modules:</strong> {selectedModuleRows.length} / {filteredModules.length}
            </div>

            <div style={{overflowX: 'auto', WebkitOverflowScrolling: 'touch'}}>
              <table className="Table responsive-table ">
                <thead className="Table-header">
                  <tr className="Header-rows">
                    <th className='Header-data'>
                      <input
                        type='checkbox'
                        checked={selectAllModules}
                        onChange={toggleSelectAllModules}
                      />
                    </th>
                    <th className='Header-data'>Position Name</th>
                    <th className='Header-data'>Module Name</th>
                    <th className='Header-data'>Level</th>
                    <th className='Header-data'>TNI Department</th>
                  </tr>
                </thead>
                <tbody className={`Table-body `}>
                  {modulePaginated.map((m, index) => {
                    const globalIndex = moduleStart + index;
                    return (
                      <tr key={index}
                        onClick={() => toggleModuleRow(globalIndex)}
                        className={`Body-rows ${index % 2 === 0 ? "even" : "odd"}`}
                        style={{
                          backgroundColor: selectedModuleRows.includes(globalIndex) ? "#e6f7ff" : "white",
                          cursor: "pointer",
                          border: "1px solid #ddd",
                        }}
                      >
                        <td className="Body-data">
                          <input
                            type="checkbox"
                            checked={selectedModuleRows.includes(globalIndex)}
                            readOnly
                          />
                        </td>
                        <td className="Body-data">{m.PosText}</td>
                        <td className="Body-data">{m.ModuleText}</td>
                        <td className="Body-data">{m.Level}</td>
                        <td className="Body-data">{m.TniDeptText}</td>
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

            <button 
              type='button'
              onClick={handleViewEmployees}
              className='view-emp-btn'
            >
              View Employees
            </button>
          </div>

        {/* Eligible Employee Table */}
        {showEmployees && employees.length > 0 && (
          <div className="Table-container">
            <h2 className='section-title'>Eligible Employee</h2>
            <div className={"table-controls d-flex mt-3 flex-wrap"}>
              <div className="search-container me-3 mb-2" style={{height: 'auto', position: 'relative'}}>
                <Search24Regular className='searchIcon' />
                <input
                  className='table-search'
                  type='text'
                  placeholder='Search Employees...'
                  value={employeeSearch}
                  onChange={(e) => {
                    setEmployeeSearch(e.target.value);
                    setEmployeePage(1);
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
                    setEmployeePage(1);
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
              <strong>Selected Employees:</strong> {selectedEmployeeRows.length} / {employees.length}
            </div>

            <div style={{overflowX: 'auto', WebkitOverflowScrolling: 'touch'}}>
              <table className="Table responsive-table">
                <thead className="Table-header">
                  <tr className="Header-rows">
                    <th className='Header-data'>
                      <input
                        type='checkbox'
                        checked={selectAllEmployees}
                        onChange={toggleSelectAllEmployees}
                      />
                    </th>
                    <th className='Header-data'>EmployeeID</th>
                    <th className='Header-data'>Employee Name</th>
                    <th className='Header-data'>Position Name</th>
                    <th className='Header-data'>TNI Department</th>
                  </tr>
                </thead>
                <tbody className="Table-body">
                  {employeePaginated.map((e, index) => {
                    const globalIndex = empStart + index;
                    return (
                      <tr
                        key={index}
                        onClick={() => toggleEmployeeRow(globalIndex)}
                        className={`Body-rows ${index % 2 === 0 ? "even" : "odd"}`}
                        style={{
                          backgroundColor: selectedEmployeeRows.includes(globalIndex) ? "#e6f7ff" : "white",
                          cursor: "pointer",
                          border: "1px solid #ddd",
                        }}
                      >
                        <td className="Body-data">
                          <input
                            type="checkbox"
                            checked={selectedEmployeeRows.includes(globalIndex)}
                            readOnly
                          />
                        </td>
                        <td className="Body-data">{e.EmployeeID}</td>
                        <td className="Body-data">{e.EmployeeName}</td>
                        <td className="Body-data">{e.PositionName}</td>
                        <td className="Body-data">{e.TNIDepartmentName}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="pagination-container">
              <div className="pagination-info">
                Showing {empStart + 1}–{Math.min(empStart + rowsPerPage, filteredEmployeeList.length)}
                {" "}of {filteredEmployeeList.length} entries
              </div>

              <div className="pagination-buttons">
                <button className="pg-btn" disabled={employeePage === 1} onClick={() => setEmployeePage(1)}>⏮</button>
                <button className="pg-btn" disabled={employeePage === 1} onClick={() => setEmployeePage(p => p - 1)}>◀</button>

                <span className="pg-number">Page {employeePage}</span>

                <button
                  className="pg-btn"
                  disabled={employeePage >= Math.ceil(filteredEmployeeList.length / rowsPerPage)}
                  onClick={() => setEmployeePage(p => p + 1)}
                >▶</button>

                <button
                  className="pg-btn"
                  disabled={employeePage >= Math.ceil(filteredEmployeeList.length / rowsPerPage)}
                  onClick={() => setEmployeePage(Math.ceil(filteredEmployeeList.length / rowsPerPage))}
                >⏭</button>
              </div>
            </div>

            <button 
              type='button'
              onClick={handleSaveTNI}
              className='save-tni-btn'
            >
              Create TNI
            </button>
          </div>
        )}
      </div>
    </div>
  );
};