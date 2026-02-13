import { Position } from "@fluentui/react";
import { IAbgBatchCreationProps } from "../../components/IAbgBatchCreationProps";
import SPCRUDOPS from '../DAL/spcrudops';
import { ITNIDashboard } from '../interface/ITNIDashboard';
import { sp } from "@pnp/sp/presets/all";
import { Web } from "@pnp/sp/presets/all";
import { ITNISave } from "../interface/ITNISave";



export interface IDashboardOps {
    getDashboardData(props: IAbgBatchCreationProps): Promise<ITNIDashboard[]>;
    getEmployeeData(positionId: number, tniId: number, props: IAbgBatchCreationProps): Promise<ITNIDashboard[]>;
    checkDuplicateTNI(empId: number, moduleId: number, finId: number, props: IAbgBatchCreationProps): Promise<any>;
    insertDashboardData(item: ITNISave, props: IAbgBatchCreationProps): Promise<any>;
    getModuleMapping(positionId: any, tniId: any, moduleName: string,props: IAbgBatchCreationProps): Promise<ITNIDashboard[]>;
    getStandardModules(positionName: string, financialYear: string, props: IAbgBatchCreationProps): Promise<any[]>;
    getEmployeeDataByModule(positionName: string, tniDepartmentName: string, props: IAbgBatchCreationProps): Promise<any[]>;
    
    getUniqueTNIDeptsByPosition(positionId: string, props: IAbgBatchCreationProps): Promise<any[]>;
    getModulesByPositionOnly(positionId: string, props: IAbgBatchCreationProps): Promise<any[]>;
    getModulesByPositionAndDept(positionId: string, deptId: string, props: IAbgBatchCreationProps): Promise<any[]>;
    getEmployeesByPositionOnly(positionId: string, props: IAbgBatchCreationProps): Promise<any[]>;
    getEmployeesByPositionAndDept(positionId: string, deptId: string, props: IAbgBatchCreationProps): Promise<any[]>;

    getTNIDashboardData(moduleId: any, finyearId: any, batchTypeFlag: boolean, props: IAbgBatchCreationProps): Promise<ITNIDashboard[]>;
}

export default function TNIDashboardOps(): IDashboardOps {
    const spCrudOps = SPCRUDOPS();

    const getDashboardData = async ( props: IAbgBatchCreationProps): Promise<ITNIDashboard[]> => {
    
        try {
            const spCrudOpsInstance = await spCrudOps;
            // // Assuming current user id is available via props
            // const currentUserId = props.currentSPContext.pageContext.legacyPageContext.userId;

            // // Filter to only show items created by current user
            // const filter = `Author/Id eq ${currentUserId}`;
            const results = await spCrudOpsInstance.getData(
                "TNI2223",
                "*,Id,Created,Modified,TNIDepartment/TNIDepartment,Level/LevelName,Department/Id,Department/DepartmentName,Modules/ModuleName,EmployeeID/EmployeeID,EmployeeName/EmployeeName,Position/PositionName,UniqID/UniqID,FinancialYear/FinancialYear",
                "TNIDepartment,Level,Department,Modules,EmployeeID,EmployeeName,Position,UniqID,FinancialYear",
                "",
                { column: "Id", isAscending: false }, 
                props
            );
            console.log('Results from API of Dashboard:', results);

            // 🔑 Sort descending by Id
            const sortedResults = results.sort(
              (a: any, b: any) => b.Id - a.Id
            );
    
            let brr: Array<ITNIDashboard> = new Array<ITNIDashboard>();
            results.map((item: any) => {
                brr.push({
                    Id: item.Id, 
                    Created: item.Created,
                    Modified: item.Modified,
                    TNIDepartment: item.TNIDepartment?.TNIDepartment,
                    Level: item.Level?.LevelName,
                    Department: item.Department?.DepartmentName,
                    Modules: item.Modules?.ModuleName,
                    EmployeeID: item.EmployeeID?.EmployeeID,
                    EmployeeName: item.EmployeeName?.EmployeeName,
                    Position: item.Position?.PositionName,
                    UniqID: item.UniqID?.UniqID,
                    FinancialYear: item.FinancialYear?.FinancialYear,

                });
            });
    
            console.log('Processed Data for Dashboard:', brr);
            return brr;
        } catch (error) {
            console.error('Error in Dashboard Data:', error.message);
            throw error;
        }
    };

    const getEmployeeData = async (positionId: number, tniId: number, props: IAbgBatchCreationProps): Promise<ITNIDashboard[]> => {
        try {
            const spCrudOpsInstance = await spCrudOps;
            const filter = `Position/Id eq ${positionId} and TNIDepartment/Id eq ${tniId} and EmployeeFlag eq 'Active'`;
            const results = await spCrudOpsInstance.getData(
                "EmployeeMaster",
                "Id,EmployeeID,EmployeeName,Department/Id,Department/DepartmentName,Position/Id,Position/PositionName,ManagerName/Title,ManagerName/Id,ManagerName/EMail,TNIDepartment/Id,TNIDepartment/TNIDepartment,EmployeeFlag,UniqID",
                "Department,Position,ManagerName,TNIDepartment",
                filter,
                { column: "Id", isAscending: false }, 
                props
            );
            console.log('Results from API of Employee Data:', results);
            results.map((item: any) => ({
                Id: item.Id,
                EmployeeID: item.EmployeeID,
                EmployeeName: item.EmployeeName,
                EmployeeFlag: item.EmployeeFlag,
                UniqID: item.UniqID,

                // Lookup IDs (ALWAYS <ColumnName>Id)
                DepartmentID: item.DepartmentId || null,
                PositionID: item.PositionId || null,
                TNIDepartmentID: item.TNIDepartmentId || null,

                // Lookup text
                Department: item.Department?.DepartmentName || "",
                Position: item.Position?.PositionName || "",
                TNIDepartment: item.TNIDepartment?.TNIDepartment || "",

                // People Picker
                ManagerId: item.ManagerName?.Id || null,
                ManagerName: item.ManagerName?.Title || "",
                ManagerEmail: item.ManagerName?.EMail || ""

            }));
            return results;
        } catch (error) {
            console.error('Error in Employee Data:', error.message);
            throw error;
        }
    };

    const getModuleMapping = async (positionId: any, tniId: any, moduleName: string,props: IAbgBatchCreationProps): Promise<ITNIDashboard[]> => {
        try {
            const spCrudOpsInstance = await spCrudOps;
            const filter = `PositionName/Id eq ${positionId} and TNIDepartmentName/Id eq ${tniId} and ModuleName/Id eq '${moduleName}'`;

            const results = await spCrudOpsInstance.getData(
                "ModuleMapping",
                "Id,PositionName/Id,PositionName/PositionName,TNIDepartmentName/Id,TNIDepartmentName/TNIDepartment,ModuleName/ModuleName, ModuleName/Id",
                "PositionName,TNIDepartmentName,ModuleName",
                filter,
                { column: "Id", isAscending: false }, 
                props
            );
            console.log('Results from API of Employee Data:', results);
            results.map((item: any) => ({
                Id: item.Id,
                // Lookup IDs
                PositionID: item.PositionName?.Id || null,
                TniDeptID: item.TNIDepartmentName?.Id || null,
                ModuleID: item.ModuleName?.Id || null,
                FromYearID: item.FromYear?.Id || null,

                // Lookup Texts
                Position: item.PositionName?.PositionName || "",
                TNIDepartment: item.TNIDepartmentName?.TNIDepartment || "",
                Modules: item.ModuleName?.ModuleName || "",

            }));
            return results;
        } catch (error) {
            console.error('Error in Employee Data:', error.message);
            throw error;
        }
    };

    const insertDashboardData = async (item: ITNISave, props: IAbgBatchCreationProps): Promise<any> => {
        try {
            const spCrudOpsInstance = await spCrudOps;
            const result = await spCrudOpsInstance.insertData(
            "TNI2223",
            { 
                PositionId: item.PositionId,
                DepartmentId: item.DepartmentId,
                TNIDepartmentId: item.TNIDepartmentId,
                ModulesId: item.ModulesId,
                LevelId: item.LevelId,

                EmployeeIDId: item.EmployeeIDId,
                EmployeeNameId: item.EmployeeNameId,
                ManagerNameId: item.ManagerNameId,

                UniqIDId: item.UniqIDId?? null,
                EmployeeFlag: item.EmployeeFlag,
                ModuleType: item.ModuleType,
                FinancialYearId: item.FinancialYearId,
                TNIflag: item.TNIflag,
                BatchFlag: item.BatchFlag

            }, 
            props);
            return result;
        } catch (error) {
            console.error('Error inserting Dashboard Data:', error.message);
            throw error;
        }
    };

    const checkDuplicateTNI = async (empId: number, moduleId: number, finId: number, props: IAbgBatchCreationProps): Promise<any> => {
        try {
            const spCrudOpsInstance = await spCrudOps;

            const filter = `
            EmployeeID/Id eq ${empId} 
            and Modules/Id eq ${moduleId} 
            and FinancialYear/Id eq ${finId}
            `;

            const results = await spCrudOpsInstance.getData(
            "TNI2223",
            "Id,EmployeeID/Id,Modules/Id,FinancialYear/Id",
            "EmployeeID,Modules,FinancialYear",
            filter,
            { column: "Id", isAscending: false },
            props
            );

            // if any record found -> duplicate exists
            return results.length > 0;

        } catch (error) {
            console.error("Duplicate check error:", error);
            return false;
        }
    };

    // 1. Get Standard Modules (exactly like in your screenshot)
    const getStandardModules = async (
        positionName: string,
        financialYear: string,
        props: IAbgBatchCreationProps
    ): Promise<any[]> => {
        try {
            const spCrudOpsInstance = await spCrudOps;

            const filter = `
                PositionName/PositionName eq '${positionName}'
                and FinancialYear/FinancialYear eq '${financialYear}'
            `;

            const results = await spCrudOpsInstance.getData(
                "ModuleMapping", // Your standard mapping list
                `Id,
                 PositionName/PositionName,
                 TNIDepartmentName/TNIDepartment,
                 ModuleName/ModuleName,
                 LevelName/LevelName`,
                "PositionName,TNIDepartmentName,ModuleName,LevelName",
                filter,
                { column: "Id", isAscending: true },
                props
            );

            return results.map((item: any) => ({
                Id: item.Id,
                PositionName: item.PositionName?.PositionName || '',
                TNIDepartment: item.TNIDepartmentName?.TNIDepartment || '',
                ModuleName: item.ModuleName?.ModuleName || '',
                Level: item.LevelName?.LevelName || ''
            }));
        } catch (error) {
            console.error('Error fetching Standard Modules:', error);
            throw error;
        }
    };

    // 2. Get Eligible Employees based on selected Standard Modules
    const getEmployeeDataByModule = async (
        positionName: string,
        tniDepartmentName: string,
        props: IAbgBatchCreationProps
    ): Promise<any[]> => {
        try {
            const spCrudOpsInstance = await spCrudOps;

            const filter = `
                Position/PositionName eq '${positionName}'
                and TNIDepartment/TNIDepartment eq '${tniDepartmentName}'
                and EmployeeFlag eq 'Active'
            `;

            const results = await spCrudOpsInstance.getData(
                "EmployeeMaster",
                `Id,
                 EmployeeID,
                 EmployeeName,
                 Position/PositionName,
                 TNIDepartment/TNIDepartment`,
                "Position,TNIDepartment",
                filter,
                { column: "EmployeeID", isAscending: true },
                props
            );

            return results.map((item: any) => ({
                Id: item.Id,
                EmployeeID: item.EmployeeID,
                EmployeeName: item.EmployeeName,
                PositionName: item.Position?.PositionName || '',
                TNIDepartmentName: item.TNIDepartment?.TNIDepartment || ''
            }));
        } catch (error) {
            console.error('Error fetching employees by module:', error);
            throw error;
        }
    };
    

    // NEW: Get unique TNI departments for a position (like BindTNIDept in original JS)
    const getUniqueTNIDeptsByPosition = async (positionId: string, props: IAbgBatchCreationProps): Promise<any[]> => {
        try {
            const spCrudOpsInstance = await spCrudOps;
            const filter = `PositionName/Id eq ${positionId}`;
            const select = "TNIDepartmentName/Id,TNIDepartmentName/TNIDepartment";
            const expand = "TNIDepartmentName";

            const results = await spCrudOpsInstance.getData(
                "ModuleMapping",
                select,
                expand,
                filter,
                { column: "Id", isAscending: false },
                props
            );

            // Dedupe by Id (like removeDumplicateValue in original JS)
            const unique = results.reduce((acc: any[], curr: any) => {
                if (!acc.some((x: any) => x.TNIDepartmentName?.Id === curr.TNIDepartmentName?.Id)) {
                    acc.push(curr);
                }
                return acc;
            }, []);

            console.log('Unique TNIDepts for position:', unique);
            return unique;
        } catch (error) {
            console.error('Error fetching unique TNIDepts:', error);
            throw error;
        }
    };

    // NEW: Get modules only by Position (TNI Dept = All) - like createRestUrl with flag "Pos"
    const getModulesByPositionOnly = async (positionId: string, props: IAbgBatchCreationProps): Promise<any[]> => {
        try {
            const spCrudOpsInstance = await spCrudOps;
            const filter = `PositionName/Id eq ${positionId} `; // Hardcoded FY like original

            const results = await spCrudOpsInstance.getData(
                "ModuleMapping",
                "Id,PositionName/Id,PositionName/PositionName,LevelName/Id,LevelName/LevelName,ModuleName/Id,ModuleName/ModuleName,TNIDepartmentName/Id,TNIDepartmentName/TNIDepartment,FromYear/FinancialYear,ToYear/FinancialYear,DepartmentName/Id,DepartmentName/DepartmentName",
                "PositionName,LevelName,ModuleName,TNIDepartmentName,FromYear,ToYear,DepartmentName",
                filter,
                { column: "Id", isAscending: false },
                props
            );

            // Map to match your filteredModules shape (add PosText, ModuleText, etc.)
            const mapped = results.map((item: any) => ({
                Id: item.Id,
                PosText: item.PositionName?.PositionName || '',
                ModuleText: item.ModuleName?.ModuleName || '',
                Level: item.LevelName?.LevelName || '',
                TniDeptText: item.TNIDepartmentName?.TNIDepartment || '',
                PosID: item.PositionName?.Id || null,
                ModuleID: item.ModuleName?.Id || null,
                LevelID: item.LevelName?.Id || null,
                TniDeptID: item.TNIDepartmentName?.Id || null,
                FinYearID: null // Not filtered here
            }));

            console.log('Modules by position only:', mapped);
            return mapped;
        } catch (error) {
            console.error('Error fetching modules by position only:', error);
            throw error;
        }
    };

    // NEW: Get modules by Position + TNI Dept - like createRestUrl with flag "Dep"
    const getModulesByPositionAndDept = async (positionId: string, deptId: string, props: IAbgBatchCreationProps): Promise<any[]> => {
        try {
            const spCrudOpsInstance = await spCrudOps;
            const filter = `PositionName/Id eq ${positionId} and TNIDepartmentName/Id eq ${deptId}`; // Hardcoded FY like original

            const results = await spCrudOpsInstance.getData(
                "ModuleMapping",
                "Id,PositionName/Id,PositionName/PositionName,LevelName/Id,LevelName/LevelName,ModuleName/Id,ModuleName/ModuleName,TNIDepartmentName/Id,TNIDepartmentName/TNIDepartment,FromYear/FinancialYear,ToYear/FinancialYear,DepartmentName/Id,DepartmentName/DepartmentName",
                "PositionName,LevelName,ModuleName,TNIDepartmentName,FromYear,ToYear,DepartmentName",
                filter,
                { column: "Id", isAscending: false },
                props
            );

            // Map to match your filteredModules shape
            const mapped = results.map((item: any) => ({
                Id: item.Id,
                PosText: item.PositionName?.PositionName || '',
                ModuleText: item.ModuleName?.ModuleName || '',
                Level: item.LevelName?.LevelName || '',
                TniDeptText: item.TNIDepartmentName?.TNIDepartment || '',
                PosID: item.PositionName?.Id || null,
                ModuleID: item.ModuleName?.Id || null,
                LevelID: item.LevelName?.Id || null,
                TniDeptID: item.TNIDepartmentName?.Id || null,
                FinYearID: null // Not filtered here
            }));

            console.log('Modules by position and dept:', mapped);
            return mapped;
        } catch (error) {
            console.error('Error fetching modules by position and dept:', error);
            throw error;
        }
    };

    // NEW: Get employees only by Position - like createEmpRestUrl with flag "Pos"
    const getEmployeesByPositionOnly = async (positionId: string, props: IAbgBatchCreationProps): Promise<any[]> => {
        try {
            const spCrudOpsInstance = await spCrudOps;
            const filter = `Position/Id eq ${positionId} and EmployeeFlag eq 'Active'`;

            const results = await spCrudOpsInstance.getData(
                "EmployeeMaster",
                "Id,EmployeeID,EmployeeName,Position/PositionName,Position/Id,TNIDepartment/TNIDepartment,TNIDepartment/Id,ManagerName/Title,ManagerName/Id,ManagerName/EMail,Department/Id,Department/DepartmentName",
                "Position,TNIDepartment,ManagerName,Department",
                filter,
                { column: "Id", isAscending: false },
                props
            );

            // Map to match your employees/mappedEmployees shape
            const mapped = results.map((item: any) => ({
                Id: item.Id,
                EmployeeID: item.EmployeeID,
                EmployeeName: item.EmployeeName,
                PositionName: item.Position?.PositionName || '',
                TNIDepartmentName: item.TNIDepartment?.TNIDepartment || '',
                ManagerName: item.ManagerName?.Title || '',
                ManagerEmail: item.ManagerName?.EMail || '',
                ManagerId: item.ManagerName?.Id || null,
                DepartmentName: item.Department?.DepartmentName || '',
                DepartmentId: item.Department?.Id || null
            }));

            console.log('Employees by position only:', mapped);
            return mapped;
        } catch (error) {
            console.error('Error fetching employees by position only:', error);
            throw error;
        }
    };

    // NEW: Get employees by Position + TNI Dept - like createEmpRestUrl with flag "Dep"
    const getEmployeesByPositionAndDept = async (positionId: string, deptId: string, props: IAbgBatchCreationProps): Promise<any[]> => {
        try {
            const spCrudOpsInstance = await spCrudOps;
            const filter = `Position/Id eq ${positionId} and TNIDepartment/Id eq ${deptId} and EmployeeFlag eq 'Active'`;

            const results = await spCrudOpsInstance.getData(
                "EmployeeMaster",
                "Id,EmployeeID,EmployeeName,Position/PositionName,Position/Id,TNIDepartment/TNIDepartment,TNIDepartment/Id,ManagerName/Title,ManagerName/Id,ManagerName/EMail,Department/Id,Department/DepartmentName",
                "Position,TNIDepartment,ManagerName,Department",
                filter,
                { column: "Id", isAscending: false },
                props
            );

            // Map to match your employees/mappedEmployees shape
            const mapped = results.map((item: any) => ({
                Id: item.Id,
                EmployeeID: item.EmployeeID,
                EmployeeName: item.EmployeeName,
                PositionName: item.Position?.PositionName || '',
                TNIDepartmentName: item.TNIDepartment?.TNIDepartment || '',
                ManagerName: item.ManagerName?.Title || '',
                ManagerEmail: item.ManagerName?.EMail || '',
                ManagerId: item.ManagerName?.Id || null,
                DepartmentName: item.Department?.DepartmentName || '',
                DepartmentId: item.Department?.Id || null
            }));

            console.log('Employees by position and dept:', mapped);
            return mapped;
        } catch (error) {
            console.error('Error fetching employees by position and dept:', error);
            throw error;
        }
    };

    const getTNIDashboardData = async (moduleId: any, finyearId: any, batchTypeFlag: boolean, props: IAbgBatchCreationProps): Promise<ITNIDashboard[]> => {
    
        try {
            const spCrudOpsInstance = await spCrudOps;
            // // Assuming current user id is available via props
            // const currentUserId = props.currentSPContext.pageContext.legacyPageContext.userId;

            // // Filter to only show items created by current user
            // const filter = `Author/Id eq ${currentUserId}`;
            // Build dynamic filter matching JS logic
            let baseFilter = `Modules/Id eq ${moduleId} and EmployeeID/EmployeeStatus eq 'Active' and FinancialYear/Id eq ${finyearId}`;
            const orConditions = "(BatchFlag eq 'NotAllocated' or TNIflag eq 'SupervisorRejected' or BatchCancel eq 'Cancel' or TNIflag eq 'BatchAbsent' or TNIflag eq 'FeedbackRepeat' or AttemptRepeat eq 'Yes')";
            let fullFilter = `${baseFilter} and (${orConditions})`;
            if (batchTypeFlag) {
            fullFilter += ` and AttemptRepeat ne 'Yes'`;
    }
            const results = await spCrudOpsInstance.getData(
                "TNI2223",
                "*,Id,Created,Modified,TNIDepartment/TNIDepartment,TNIDepartment/Id,Level/LevelName,Level/Id,Department/Id,Department/DepartmentName,Modules/ModuleName,Modules/Id,EmployeeID/EmployeeID,EmployeeID/Id,EmployeeName/EmployeeName,EmployeeName/Id,Position/PositionName,Position/Id,UniqID/UniqID,FinancialYear/FinancialYear,BatchFlag,TNIflag,BatchCancel,AttemptRepeat",
                "TNIDepartment,Level,Department,Modules,EmployeeID,EmployeeName,Position,UniqID,FinancialYear",
                fullFilter,
                { column: "Id", isAscending: false }, 
                props
            );
            console.log('Results from API of Dashboard:', results);

            // 🔑 Sort descending by Id
            const sortedResults = results.sort(
              (a: any, b: any) => b.Id - a.Id
            );
    
            let brr: Array<ITNIDashboard> = new Array<ITNIDashboard>();
            results.map((item: any) => {
                brr.push({
                    Id: item.Id, 
                    Created: item.Created,
                    Modified: item.Modified,
                    TNIDepartment: item.TNIDepartment?.TNIDepartment,
                    TNIDepartmentId: item.TNIDepartment?.Id,
                    LevelId: item.Level?.Id,
                    Level: item.Level?.LevelName,
                    Department: item.Department?.DepartmentName,
                    Modules: item.Modules?.ModuleName,
                    EmployeeID: item.EmployeeID?.EmployeeID,
                    EmployeeIDId: item.EmployeeID?.Id,
                    EmployeeNameId: item.EmployeeName?.Id,
                    EmployeeName: item.EmployeeName?.EmployeeName,
                    PositionId: item.Position?.Id,
                    Position: item.Position?.PositionName,
                    UniqID: item.UniqID?.UniqID,
                    FinancialYear: item.FinancialYear?.FinancialYear,
                    BatchFlag: item.BatchFlag || '',
                    TNIflag: item.TNIflag || '',
                    BatchCancel: item.BatchCancel || '',
                    AttemptRepeat: item.AttemptRepeat || '',

                });
            });
    
            console.log('Processed Data for Dashboard:', brr);
            return brr;
        } catch (error) {
            console.error('Error in Dashboard Data:', error.message);
            throw error;
        }
    };


    return {
        getDashboardData,
        getEmployeeData,
        checkDuplicateTNI,
        insertDashboardData,
        getModuleMapping,
        getStandardModules,
        getEmployeeDataByModule,

        getUniqueTNIDeptsByPosition,
        getModulesByPositionOnly,
        getModulesByPositionAndDept,
        getEmployeesByPositionOnly,
        getEmployeesByPositionAndDept,
        getTNIDashboardData
        
    };
}