import { Position } from "@fluentui/react";
import { IAbgBatchCreationProps } from "../../components/IAbgBatchCreationProps";
import SPCRUDOPS from '../DAL/spcrudops';
import { ITNIDashboard } from '../interface/ITNIDashboard';
import { sp } from "@pnp/sp/presets/all";
import { Web } from "@pnp/sp/presets/all";
import { chunkArray } from "../Helper";


export interface IDashboardOps {
    bulkUpdateBatchAllocation( tniUpdates: Array<{ id: number; updates: any; }>, props: IAbgBatchCreationProps,
        onProgress?: (completed: number, total: number) => void ): Promise<any[]>;
    getTNIData(empId: any, moduleName: any, props: IAbgBatchCreationProps): Promise<ITNIDashboard[]>;
}

export default function EmployeeSupervisorOps(): IDashboardOps {
    const spCrudOps = SPCRUDOPS();

    //  Bulk TNI Flag Updates
    const bulkUpdateBatchAllocation = async (
        tniUpdates: Array<{
            id: number;
            updates: any;
        }>,
        props: IAbgBatchCreationProps,
        onProgress?: (completed: number, total: number) => void
        ): Promise<any[]> => {
        try {
            const spCrudOpsInstance = await spCrudOps;
            const results: any[] = [];
            let completed = 0;
            const total = tniUpdates.length;

            for (const updateItem of tniUpdates) {
            try {
                const res = await spCrudOpsInstance.updateData(
                "BatchAllocation2223",
                updateItem.id,
                updateItem.updates,
                props
                );
                results.push(res);
            } catch (err) {
                console.error(`Failed to update TNI ID ${updateItem.id}:`, err);
                // Continue with others
            } finally {
                completed++;
                if (onProgress) {
                onProgress(completed, total);
                }
            }
            }

            return results;
        } catch (error) {
            console.error('Error updating TNI flags:', error);
            throw error;
        }
    };

    const getTNIData = async (empId: any, moduleName: any, props: IAbgBatchCreationProps): Promise<ITNIDashboard[]> => {
    
        try {
            const spCrudOpsInstance = await spCrudOps;
            // // Assuming current user id is available via props
            // const currentUserId = props.currentSPContext.pageContext.legacyPageContext.userId;

            // // Filter to only show items created by current user
            // const filter = `Author/Id eq ${currentUserId}`;
            const filter = `EmployeeID eq '${empId}' and Modules eq '${moduleName}'`;

            const results = await spCrudOpsInstance.getData(
                "TNI2223",
                "*,Id,Created,Modified,TNIDepartment/TNIDepartment,Level/LevelName,Department/Id,Department/DepartmentName,Modules/ModuleName,EmployeeID/EmployeeID,EmployeeName/EmployeeName,Position/PositionName,UniqID/UniqID,FinancialYear/FinancialYear",
                "TNIDepartment,Level,Department,Modules,EmployeeID,EmployeeName,Position,UniqID,FinancialYear",
                filter,
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

    return {
        bulkUpdateBatchAllocation,
        getTNIData
        
    };
}