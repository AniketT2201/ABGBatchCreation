import { Position } from "@fluentui/react";
import { IAbgBatchCreationProps } from "../../components/IAbgBatchCreationProps";
import SPCRUDOPS from '../DAL/spcrudops';
import { ITNIDashboard } from '../interface/ITNIDashboard';
import { sp } from "@pnp/sp/presets/all";
import { Web } from "@pnp/sp/presets/all";



export interface IDashboardOps {
    getTNIDashboardData(moduleId: any, finyearId: any, batchTypeFlag: boolean, props: IAbgBatchCreationProps): Promise<ITNIDashboard[]>;
}

export default function TNIDashboardOps(): IDashboardOps {
    const spCrudOps = SPCRUDOPS();

   

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
        getTNIDashboardData
        
    };
}