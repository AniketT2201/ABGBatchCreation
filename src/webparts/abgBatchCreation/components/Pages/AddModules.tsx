import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import type { IAbgBatchCreationProps } from '../IAbgBatchCreationProps';
import { 
  DetailsList, 
  DetailsListLayoutMode,
  SelectionMode,
  Selection,
  PrimaryButton,
  Dropdown,
  IDropdownOption,
} from "@fluentui/react";
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
import { checkDuplicateLocal } from '../../services/Helper';
import { Search24Regular } from "@fluentui/react-icons";
import { useHistory } from 'react-router-dom';



export const AddModules: React.FunctionComponent<IAbgBatchCreationProps> = (props: IAbgBatchCreationProps) => {

  const fetchStartTimeRef = useRef(0);
  const history = useHistory();
  const [loading, setLoading] = useState(false);

  // Search states
  const [moduleSearch, setModuleSearch] = useState("");
  const [employeeSearch, setEmployeeSearch] = useState("");

  // Pagination states
  const [modulePage, setModulePage] = useState(1);
  const [employeePage, setEmployeePage] = useState(1);

  // For custome rows per page 
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Dropdown data states
  const [position, setPosition] = useState<IPositionMaster[]>([]);
  const [TNIDepartment, setTNIDepartment] = useState<ITNIDepartmentMaster[]>([]);
  const [modules, setModules] = useState<IModulesMaster[]>([]);
  const [level, setLevel] = useState<ILevelMaster[]>([]);
  const [financialYear, setFinancialYear] = useState<IFinancialYearMaster[]>([]);

  // Selected dropdown values
  const [selectedPosition, setSelectedPosition] = useState("");
  const [selectedTniDepartment, setSelectedTniDepartment] = useState("");
  const [selectedModule, setSelectedModule] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedFinancialYear, setSelectedFinancialYear] = useState("");

  // For adding modules
  const [modData, setModData] = useState<any[]>([]);

  // For adding Employees
  const [employees, setEmployees] = useState<any[]>([]);
  const [showEmployees, setShowEmployees] = useState(false);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [selectAllEmployees, setSelectAllEmployees] = useState(false);
  
  const employeeSelection = new Selection({
    onSelectionChanged: () => {},
  });

  // For reset page when rowsperpage changes
  useEffect(() => {
    setEmployeePage(1);
  }, [rowsPerPage]);

  // Fetch SharePoint List Data
  useEffect(() => {
    const loadDropdownData = async () => {
      setLoading(true);
      try {
        // Fetching PositionMaster Data
        const positionData = await PositionMasterOps().getPositionMasterData(props);
        setPosition(positionData);

        // Fetching TNIDepartmentMaster Data
        const TNIDepartmentData = await TNIDepartmentOps().getTNIDepartmentData(props);
        setTNIDepartment(TNIDepartmentData);

        // Fetching ModulesMaster Data
        const modulesData = await ModulesMasterOps().getModuleMasterData(props);
        setModules(modulesData);

        // Fetching LevelMaster Data
        const levelData = await LevelMasterOps().getLevelMasterData(props);
        setLevel(levelData);

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

  // Clear selected rows when employees data changes
  useEffect(() => {
    setSelectedRows([]);
  }, [employees]);

  // Validation of input fields for every combinations
  const validateFields = () => {
    const fields = [
      { value: selectedPosition, name: 'Position' },
      { value: selectedTniDepartment, name: 'TNI Department' },
      { value: selectedModule, name: 'Module' },
      { value: selectedLevel, name: 'Level' },
      { value: selectedFinancialYear, name: 'Financial Year' }
    ];

    let missing: string[] = [];
    
    fields.forEach (field => {
      if (!field.value) {
        missing.push(field.name);
      }
    });

  
    if (missing.length > 0) {
      //alert('Please select ' + field.name);
      Swal.fire({
        icon: 'warning',
        title: 'Incomplete Selection',
        text: `Please select ${missing.join (", ")}.`,
      })
      return false;
    }
    return true;
  }
  
  // Handle Add Module button click
  const handleAddModule = async () => {
    if (!validateFields()) return;
    setLoading(true);

    try {
      const Posobj      = position.find(item => item.PositionName == selectedPosition)?.Id || '';
      const TniDeptobj  = TNIDepartment.find(item => item.TNIDepartment == selectedTniDepartment)?.Id || '';
      const Moduleobj   =  modules.find(item => item.ModuleName == selectedModule)?.Id || '';
      const Levelobj    =  level.find(item => item.LevelName == selectedLevel)?.Id || '';
      const FinYearobj  =  financialYear.find(item => item.FinancialYear == selectedFinancialYear)?.Id || '';

      const newItem = {
        //IDs
        PosID: Posobj,
        TniDeptID: TniDeptobj,
        ModuleID: Moduleobj,
        LevelID: Levelobj,
        FinYearID: FinYearobj,
        //Texts
        PosText: selectedPosition,
        TniDeptText: selectedTniDepartment,
        ModuleText: selectedModule,
        LevelText: selectedLevel,
        FinYearText: selectedFinancialYear,
      }

      // ❗ Check duplicates BEFORE adding
      if (checkDuplicateLocal(modData, newItem)) {
        Swal.fire({
          icon: "warning",
          title: "Duplicate",
          text: "This module mapping already exists!"
        });
        return;
      }

      // Prevent duplicates in “standard module mapping”
      const exist = await DashboardOps().getModuleMapping(
        newItem.PosID,
        newItem.TniDeptID,
        newItem.ModuleID,
        props
      );
      if (exist.length > 0) {
        Swal.fire({
          icon: "warning",
          title: "Already Exists",
          text: "This module mapping already exists in the Standard Module Mapping list."
        });
        return;
      }

      // ADD NOW (safe)
      setModData(prev => [...prev, newItem]);
      //alert('Module added successfully!');

      
      // Reset form
      setSelectedPosition('');
      setSelectedTniDepartment('');
      setSelectedModule('');
      setSelectedLevel('');
      setSelectedFinancialYear('');

      Swal.fire({
        icon: "success",
        title: "Added Successfully!",
        text: "Module mapping added."
      });
    } finally {
      setLoading(false);
    }
  };


  // Delete module from the list
  const deleteModule = (index: number) => {
    setLoading(true);
    try {
      setModData(modData.filter((_, i) => i !== index));
      // Also remove from selection if selected
      setSelectedRows(prev => prev.filter(i => i !== index));
    } catch (error) {
      console.error("Error loading dropdown data:", error);
    } finally {
      setLoading(false);
    }
  }

  // Handle View Employees button click and fetch employees based on added modules
  const handleViewEmployees = async () => {
    if (modData.length === 0) return;
    
    setLoading(true);

    let allEmployees: any[] = [];

    try {
      for (const mod of modData) {
        const Data = await DashboardOps().getEmployeeData(
          mod.PosID,
          mod.TniDeptID,
          props
        );

        // Append new employees but avoid duplicates
        Data.forEach(emp => {
          if (!allEmployees.some(e => e.Id === emp.Id)) {
            allEmployees.push(emp);
          }
        });
      }

      setEmployees(allEmployees);
      setSelectedRows([]); // Clear any previous selections
      setShowEmployees(true);
    } catch (error) {
      console.error("Error loading dropdown data:", error);
    } finally {
      setLoading(false);
    }
  };


  // Toggle row selection
  const toggleRow = (index: number) => {
    setSelectedRows(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  // Toggle employee for all row selection
  const toggleSelectAllEmployees = () => {
    if (selectAllEmployees) {
      setSelectedRows([]);
    } else {
      setSelectedRows(mappedEmployees.map((_, i) => i));
    }
    setSelectAllEmployees(!selectAllEmployees);
  };
  
  // Map employees data for display
  const mappedEmployees = employees.map(emp => ({
    EmployeeID: emp.EmployeeID,
    EmployeeName: emp.EmployeeName,
    PositionName: emp.Position?.PositionName || "",
    DepartmentName: emp.Department?.DepartmentName || "",
    TNIDepartmentName: emp.TNIDepartment?.TNIDepartment || "",
    ManagerName: emp.ManagerName?.Title || "",
    ManagerEmail: emp.ManagerName?.EMail || "",
    ManagerId: emp.ManagerName?.Id || null,
  }));

  // Check for duplicate TNI entry before saving 
  // const handleSaveTNI = async () => {
  //   if (selectedRows.length === 0) {
  //     Swal.fire({
  //       icon: "warning",
  //       title: "No Employees Selected",
  //       text: "Please select employees to create TNI.",
  //     });
  //     return;
  //   }

  //   let duplicateFound = false;
  //   let savedCount = 0;

  //   try {
  //     for (const rowIndex of selectedRows) {
  //       const emp = employees[rowIndex];

  //       for (const mod of modData) {
  //         // Duplicate check
  //         const isDuplicate = await DashboardOps().checkDuplicateTNI(
  //           emp.Id,
  //           mod.ModuleID,      
  //           mod.FinYearID,
  //           props
  //         );

  //         if (isDuplicate) {
  //           duplicateFound = true;
  //           continue;
  //         }

  //         // Insert TNI Data
  //         await DashboardOps().insertDashboardData({
  //           PositionId: mod.PosID,
  //           DepartmentId: emp.Department?.Id || null,
  //           TNIDepartmentId: mod.TniDeptID,

  //           ModulesId: mod.ModuleID,     
  //           LevelId: mod.LevelID,

  //           EmployeeIDId: parseInt(emp.Id),        
  //           EmployeeNameId: emp.Id,      

  //           ManagerNameId: emp.ManagerName?.Id || null,

  //           UniqIDId: emp.Id,
  //           EmployeeFlag: emp.EmployeeFlag || "Active",
  //           ModuleType: "Additional",
  //           FinancialYearId: mod.FinYearID,
  //           TNIflag: "TNIcreated",
  //           BatchFlag: "NotAllocated",
  //         }, props);

  //         savedCount++;
  //       }
  //     }
  //     Swal.fire({
  //       icon: "info",
  //       title: "TNI Result",
  //       html: `
  //         <b>${duplicateFound}</b>Employee were already in TNI and were skipped.<br/>
  //         <b>${savedCount}</b> new TNI records created successfully.
  //       `,
  //     });
  //   }catch (error) {
  //     console.error("Error saving TNI data:", error);
  //     Swal.fire({
  //       icon: "error",
  //       title: "Error",
  //       text: "An error occurred while saving TNI data. Please try again.",
  //     });
  //     return;
  //   }

    
  // };

  const handleSaveTNI = async () => {
    if (selectedRows.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No Employees Selected",
        text: "Please select employees to create TNI.",
      });
      return;
    }

    setLoading(true);

    // Map selected rows → actual employee objects
    const selectedEmployees = selectedRows
      .map(index => employees[index])
      .filter(Boolean); // remove undefined rows safely

    // let duplicateFound=0;
    let savedCount = 0;

    try {
      for (const emp of selectedEmployees) {
        for (const mod of modData) {

          // Duplicate check
          const isDuplicate = await DashboardOps().checkDuplicateTNI(
            emp.Id,
            mod.ModuleID,
            mod.FinYearID,
            props
          );

          if (isDuplicate) {
            continue; 
          }

          // Insert new TNI entry
          await DashboardOps().insertDashboardData(
            {
              PositionId: mod.PosID,
              DepartmentId: emp.Department?.Id || null,
              TNIDepartmentId: mod.TniDeptID,

              ModulesId: mod.ModuleID,
              LevelId: mod.LevelID,

              EmployeeIDId: parseInt(emp.Id),
              EmployeeNameId: emp.Id,

              ManagerNameId: emp.ManagerName?.Id || null,

              UniqIDId: emp.Id,
              EmployeeFlag: emp.EmployeeFlag || "Active",
              ModuleType: "Additional",
              FinancialYearId: mod.FinYearID,
              TNIflag: "TNIcreated",
              BatchFlag: "NotAllocated",
            },
            props
          );

          savedCount++;
        }
      }

      if (savedCount === 0) {
        Swal.fire({
          icon: "warning",
          title: "Duplicates Found",
          html: `
            Employee already had TNI entries.<br/>
            
          `,
        });
      } else {
        Swal.fire({
          icon: "success",
          title: "TNI Created",
          text: `${savedCount} TNI entries created successfully.`,
        });
        setSelectedModule('');
        setSelectedRows([]);
      }
    } catch (error) {
      console.error("Error saving TNI data:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while saving TNI data.",
      });
    } finally {
      setLoading(false);
      history.push('/');
    }
  };

  // --- MODULE SEARCH & PAGINATION ---
  const filteredModuleList = modData.filter((m) => {
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


  // --- EMPLOYEE SEARCH & PAGINATION ---
  const filteredEmployeeList = mappedEmployees.filter((e) => {
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



  return (
    <div className="pageContainer">
      {/* SPINNER */}
      {loading && (
        <div className="loadingOverlay">
          <div className="spinner"></div>
        </div>
      )}
      <div className="stickyHeader">
        <div className="tniHeader">
          <h1 className="popup-header">Employee ADD Modules</h1>
        </div>
      </div>
      {/* PAGE CONTENT */}
      <div className="pageContent">
        <h3 className="section-title">Additional Modules</h3>
        <div className="form-card">
          <div className="form-row">
            {/* Position */}
            <div className="form-group">
              <label>Position</label>
              <select
                value={selectedPosition}
                onChange={(e) => setSelectedPosition(e.target.value)}
              >
                <option value="">Select</option>
                {position.map((item) => (
                  <option key={item.Title} value={item.Title}>
                    {item.PositionName}
                  </option>
                ))}
              </select>
            </div>
            {/* TNI Department */}
            <div className="form-group">
              <label>TNI Department</label>
              <select
                value={selectedTniDepartment}
                onChange={(e) => setSelectedTniDepartment(e.target.value)}
              >
                <option value="">Select</option>
                {TNIDepartment.map((item) => (
                  <option key={item.Title} value={item.Title}>
                    {item.TNIDepartment}
                  </option>
                ))}
              </select>
            </div>
            {/* Module */}
            <div className="form-group">
              <label>Module</label>
              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
              >
                <option value="">Select</option>
                {modules.map((item) => (
                  <option key={item.Title} value={item.Title}>
                    {item.ModuleName}
                  </option>
                ))}
              </select>
            </div>
            {/* Level */}
            <div className="form-group">
              <label>Level</label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
              >
                <option value="">Select</option>
                {level.map((item) => (
                  <option key={item.Title} value={item.Title}>
                    {item.LevelName}
                  </option>
                ))}
              </select>
            </div>
            {/* Financial Year */}
            <div className="form-group">
              <label>Financial Year</label>
              <select
                value={selectedFinancialYear}
                onChange={(e) => setSelectedFinancialYear(e.target.value)}
              >
                <option value="">Select</option>
                {financialYear.map((item) => (
                  <option key={item.Title} value={item.Title}>
                    {item.FinancialYear}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {/* Submit Button */}
          <div className="form-group button-group">
            <button className="add-modules-btn" onClick={handleAddModule}>
              Add Modules
            </button>
          </div>
        </div>
        {/* For Displaying Addmodules table */}
        {modData.length > 0 && (
          <div className={`Table-container `}>
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
              <table className={`Table responsive-table `}>
                <thead className="Table-header">
                  <tr className="Header-rows">
                    <th className='Header-data'>Position</th>
                    <th className='Header-data'>TNI</th>
                    <th className='Header-data'>Module</th>
                    <th className='Header-data'>Level</th>
                    <th className='Header-data'>FY</th>
                    <th className='Header-data'>Delete</th>
                  </tr>
                </thead>
                <tbody className={`Table-body `}>
                  {modulePaginated.length > 0 ? (
                    modulePaginated.map((m, index) => (
                      <tr key={index}
                          onClick={() => toggleRow(index)}
                          className={`Body-rows  ${index % 2 === 0 ? "even" : "odd"}`}
                          style={{
                            backgroundColor: selectedRows.includes(index) ? "#e6f7ff" : "white",
                            cursor: "pointer",
                            border: "1px solid #ddd",
                          }}>
                        <td className="Body-data">{m.PosText}</td>
                        <td className="Body-data">{m.TniDeptText}</td>
                        <td className="Body-data">{m.ModuleText}</td>
                        <td className="Body-data">{m.LevelText}</td>
                        <td className="Body-data">{m.FinYearText}</td>
                        <td className="Body-data">
                          <button
                            type="button"
                            className="delete-btn"
                            onClick={(e) => {
                              deleteModule(index)
                            }}
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center" }}>
                        No data available
                      </td>
                    </tr>
                  )}
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
        )}
        {/* For Displaying Employees table */}
        {/* Employee Table */}
        {showEmployees && (
           <div className={`Table-container `}>
            <h2 className='section-title'>Eligible Employee</h2>
            <div className={"table-controls d-flex mt-3 flex-wrap"}>
              <div className="search-container me-3 mb-2" style={{height: 'auto', position: 'relative'}}>
                <Search24Regular className='searchIcon' />
                <input
                  className='table-search'
                  type='text'
                  placeholder='Search Employees...'
                  value={moduleSearch}
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
            <div style={{overflowX: 'auto', WebkitOverflowScrolling: 'touch'}}>
              <table className={`Table responsive-table `}>
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
                    <th className='Header-data'>Employee Name	</th>
                    <th className='Header-data'>Position Name	</th>
                    <th className='Header-data'>TNI Department	</th>
                    <th className='Header-data'>Department</th>
                    <th className='Header-data'>Delete</th>
                  </tr>
                </thead>
                <tbody className={`Table-body `}>
                  {employeePaginated.length > 0 ? (
                    employeePaginated.map((m, index: any) => {
                      const globalIndex = empStart + index;
                      return(
                        <tr key={globalIndex}
                            onClick={() => toggleRow(globalIndex)}
                            className={`Body-rows  ${index % 2 === 0 ? "even" : "odd"}`}
                            style={{
                              backgroundColor: selectedRows.includes(globalIndex) ? "#e6f7ff" : "white",
                              cursor: "pointer",
                              border: "1px solid #ddd",
                            }}
                        >
                          <td className="Body-data">
                            <input
                              type="checkbox"
                              checked={selectedRows.includes(globalIndex)}
                              readOnly
                            />
                          </td>
                          <td className="Body-data">{m.EmployeeID}</td>
                          <td className="Body-data">{m.EmployeeName}</td>
                          <td className="Body-data">{m.PositionName}</td>
                          <td className="Body-data">{m.TNIDepartmentName}</td>
                          <td className="Body-data">{m.DepartmentName}</td>
                          <td className="Body-data">
                            <button
                              type="button"
                              className="delete-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteModule(globalIndex)
                              }}
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      );
                    })
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
}