import { Position } from "@fluentui/react";
import { IAbgBatchCreationProps } from "../../components/IAbgBatchCreationProps";
import SPCRUDOPS from '../DAL/spcrudops';
import { ITNIDashboard } from '../interface/ITNIDashboard';
import { sp } from "@pnp/sp/presets/all";
import { Web } from "@pnp/sp/presets/all";
import { ITNISave } from "../interface/ITNISave";
import { chunkArray } from "../Helper";


export interface IDashboardOps {
    //checkDuplicateTNI(empId: any, moduleId: any, tniId: any, LevelId: any, finId: any, props: IAbgBatchCreationProps): Promise<any>;
    bulkCheckDuplicates(combos: any[], props: IAbgBatchCreationProps): Promise<any[]>;
    insertDashboardData(items: ITNISave[], props: IAbgBatchCreationProps, onProgress?: (completed: number, total: number) => void): Promise<any[]>;
    getUniqueTNIDeptsByPosition(positionId: string, props: IAbgBatchCreationProps): Promise<any[]>;
    getModulesByPositionOnly(positionId: string, props: IAbgBatchCreationProps): Promise<any[]>;
    getModulesByPositionAndDept(positionId: string, deptId: string, props: IAbgBatchCreationProps): Promise<any[]>;
    getEmployeesByPositionOnly(positionId: string, props: IAbgBatchCreationProps): Promise<any[]>;
    getEmployeesByPositionAndDept(positionId: string, deptId: string, props: IAbgBatchCreationProps): Promise<any[]>;

}

export default function TNICreationSPCrudOps(): IDashboardOps {
    const spCrudOps = SPCRUDOPS();

    const insertDashboardData = async (items: ITNISave[], props: IAbgBatchCreationProps, onProgress?: (completed: number, total: number) => void): Promise<any[]> => {
        try {
            const spCrudOpsInstance = await spCrudOps;

            const results: any[] = [];

            let completed = 0;
            const total = items.length;

            for (const item of items) {
            try {
                const res = await spCrudOpsInstance.insertData(
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

                    UniqIDId: item.UniqIDId ?? null,
                    EmployeeFlag: item.EmployeeFlag,
                    ModuleType: item.ModuleType,
                    FinancialYearId: item.FinancialYearId,
                    TNIflag: item.TNIflag,
                    BatchFlag: item.BatchFlag
                },
                props
                );

                results.push(res);

            } catch (err) {
                console.error(`Failed to insert item (EmployeeID ${item.EmployeeIDId}):`, err);
                // Continue inserting remaining items
            } finally {
                completed++;

                // 🔑 Progress callback
                if (onProgress) {
                onProgress(completed, total);
                }
            }
            }

            return results;

        } catch (error) {
            console.error('Error inserting Dashboard Data:', error);
            throw error;
        }
    };

    

    // const checkDuplicateTNI = async (empId: any, moduleId: any, tniId: any, LevelId: any, finId: any, props: IAbgBatchCreationProps): Promise<any> => {
    //     try {
    //         const spCrudOpsInstance = await spCrudOps;

    //         const filter = `
    //         EmployeeID/Id eq ${empId} 
    //         and Modules/Id eq ${moduleId} 
    //         and TNIDepartment/Id eq ${tniId}
    //         and Level/Id eq ${LevelId}
    //         and FinancialYear/Id eq ${finId}           
    //         `;

    //         const results = await spCrudOpsInstance.getData(
    //         "TNI2223",
    //         "Id,EmployeeID/Id,Modules/Id,FinancialYear/Id,TNIDepartment/Id,Level/Id",
    //         "EmployeeID,Modules,FinancialYear,TNIDepartment,Level",
    //         filter,
    //         { column: "Id", isAscending: false },
    //         props
    //         );

    //         // if any record found -> duplicate exists
    //         return results.length > 0;

    //     } catch (error) {
    //         console.error("Duplicate check error:", error);
    //         return false;
    //     }
    // };
    
    const bulkCheckDuplicates = async (combos: any[], props: IAbgBatchCreationProps): Promise<any[]> => {
        try {
            const spCrudOpsInstance = await spCrudOps;

            if (!combos || combos.length === 0) return [];

            const CHUNK_SIZE = 2;
            const comboChunks = chunkArray(combos, CHUNK_SIZE);

            let allDuplicates: any[] = [];

            for (const chunk of comboChunks) {
            const orFilters = chunk.map(c =>
                `(EmployeeID/Id eq ${c.empId} and Modules/Id eq ${c.moduleId} and TNIDepartment/Id eq ${c.tniId} and Level/Id eq ${c.levelId} and FinancialYear/Id eq ${c.finId})`
            );

            const finalFilter = orFilters.join(" or ");
            //const finalFilterEncoded = encodeURIComponent(finalFilter);

            const results = await spCrudOpsInstance.getData(
                "TNI2223",
                "Id,EmployeeID/Id,Modules/Id,FinancialYear/Id,TNIDepartment/Id,Level/Id",
                "EmployeeID,Modules,FinancialYear,TNIDepartment,Level",
                finalFilter,
                { column: "Id", isAscending: false },
                props
            );

            const duplicates = results.map((d: any) => ({
                key: `${d.EmployeeID.Id}-${d.Modules.Id}-${d.TNIDepartment.Id}-${d.Level.Id}-${d.FinancialYear.Id}`,
                empId: d.EmployeeID.Id,
                moduleId: d.Modules.Id,
                tniId: d.TNIDepartment.Id,
                levelId: d.Level.Id,
                finId: d.FinancialYear.Id
            }));

            allDuplicates = allDuplicates.concat(duplicates);
            }

            return allDuplicates;

        } catch (error) {
            console.error("Bulk duplicate check error:", error);
            return [];
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
                "Id,PositionName/Id,PositionName/PositionName,LevelName/Id,LevelName/LevelName,ModuleName/Id,ModuleName/ModuleName,TNIDepartmentName/Id,TNIDepartmentName/TNIDepartment,FromYear/FinancialYear,ToYear/FinancialYear,FinancialYear/FinancialYear,DepartmentName/Id,DepartmentName/DepartmentName",
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
                FinYearID: item.FromYear?.FinancialYear || item.ToYear?.FinancialYear || null
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
                "Id,PositionName/Id,PositionName/PositionName,LevelName/Id,LevelName/LevelName,ModuleName/Id,ModuleName/ModuleName,TNIDepartmentName/Id,TNIDepartmentName/TNIDepartment,FromYear/Id,FromYear/FinancialYear,ToYear/Id,ToYear/FinancialYear,FinancialYear/FinancialYear,DepartmentName/Id,DepartmentName/DepartmentName",
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
                FinYearID: item.FromYear?.Id || item.ToYear?.Id || null
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



    

    return {
        //checkDuplicateTNI,
        bulkCheckDuplicates,
        insertDashboardData,
        getUniqueTNIDeptsByPosition,
        getModulesByPositionOnly,
        getModulesByPositionAndDept,
        getEmployeesByPositionOnly,
        getEmployeesByPositionAndDept
        
    };
}