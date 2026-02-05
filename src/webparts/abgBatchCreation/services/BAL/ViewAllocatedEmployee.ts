import { IAbgBatchCreationProps } from "../../components/IAbgBatchCreationProps";
import SPCRUDOPS from '../DAL/spcrudops';
import { sp } from "@pnp/sp/presets/all";
import { Web } from "@pnp/sp/presets/all";
import { IViewAllocatedEmployee } from "../interface/IViewAllocatedEmployee";

export interface IViewAllocatedEmployeeOps {
    getViewAllocatedEmployeeData(ID: any, props: IAbgBatchCreationProps): Promise<IViewAllocatedEmployee[]>;
    getAllocatedEmployeeData(activeTab: any, props: IAbgBatchCreationProps): Promise<IViewAllocatedEmployee[]>;
}



export default function ViewAllocatedEmployeeOps(): IViewAllocatedEmployeeOps {
    const spCrudOps = SPCRUDOPS();

   const getAllocatedEmployeeData = async (activeTab: any, props: IAbgBatchCreationProps): Promise<IViewAllocatedEmployee[]> => {
    
        try {
            const spCrudOpsInstance = await spCrudOps;

            // // Assuming current user id is available via props
            const currentUserId = props.currentSPContext.pageContext.legacyPageContext.userId;

            // // Filter to only show items created by current user
            // const filter = `BatchNameId eq '${ID}'`;
            let filter = '';
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear();
            const currentMonthIndex = currentDate.getMonth();
            const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
            if (activeTab === 'currentMonthAllocation') {
                const startOfMonth = new Date(currentYear, currentMonthIndex, 1).toISOString();
                const startOfNextMonth = new Date(currentYear, currentMonthIndex + 1, 1).toISOString();
                filter = `BatchStartDate ge datetime'${startOfMonth}' and BatchStartDate lt datetime'${startOfNextMonth}'`;
            } else if (activeTab === 'allAllocation') {
                filter = "";
            } else if (activeTab === 'Pending') {
                filter = `SupervisorStatus eq 'Pending' and ReportingManagerId eq '${currentUserId}'`;
            } else if (activeTab === 'Approved') {
                filter = `EmployeeFlag eq 'Active' and TrainingCoOrdinatorStatus eq 'Approved' and BatchName/BatchStatusforAllocation eq 'select'`;
            } else if (activeTab === 'Rejected') {
                filter = `SupervisorStatus eq 'Rejected' and ReportingManagerId eq '${currentUserId}'`;
            }

            const results = await spCrudOpsInstance.getData(
                "BatchAllocation2223",
                "*,ID,BatchType,EmployeeFlag,Position,BatchName/Duration,TrainerName/TrainerName,Module/ModuleName,Level,EmployeeID/EmployeeID,EmployeeName/EmployeeName,SupervisorStatus,BatchName/BatchName,BatchName/BatchStatusforAllocation,BatchAllocationType,Department/DepartmentName,Department/Id",
                "Module,TrainerName,EmployeeID,EmployeeName,BatchName,BatchName/BatchStatusforAllocation,Department",
                filter,
                { column: "Id", isAscending: false }, 
                props
            );
    
            console.log('Results from API of ViewAllocatedEmployee:', results);

            // 🔑 Sort descending by Id
            const sortedResults = results.sort(
              (a: any, b: any) => b.Id - a.Id
            );
    
            let brr: Array<IViewAllocatedEmployee> = new Array<IViewAllocatedEmployee>();
            results.map((item: any) => {
                brr.push({
                    Id: item.Id,
                    Position: item.Position,
                    Level: item.Level,
                    BatchAllocationType: item.BatchAllocationType,
                    SupervisorStatus: item.SupervisorStatus,
                    Year: item.Year,
                    Month: item.Month,
                    BatchStartDate: item.BatchStartDate,
                    BatchEndDate: item.BatchEndDate,
                    BatchType: item.BatchType,

                    BatchNameId: item.BatchName?.Id,
                    BatchName: item.BatchName?.BatchName,
                    Duration: item.BatchName?.Duration,

                    TrainerNameId: item.TrainerName?.Id,
                    TrainerName: item.TrainerName?.TrainerName,

                    ModuleId: item.Module?.Id,
                    ModuleName: item.Module?.ModuleName,

                    DepartmentId: item.Department?.Id,
                    Department: item.Department?.DepartmentName,

                    EmployeeIDId: item.EmployeeID?.Id,
                    EmployeeID: item.EmployeeID?.EmployeeID,

                    EmployeeNameId: item.EmployeeName?.Id,
                    EmployeeName: item.EmployeeName?.EmployeeName           

                });
            });
    
            console.log('Processed Data for ViewAllocatedEmployee:', brr);
            return brr;
        } catch (error) {
            console.error('Error in ViewAllocatedEmployee Data:', error.message);
            throw error;
        }
    };

    const getViewAllocatedEmployeeData = async (ID: any, props: IAbgBatchCreationProps): Promise<IViewAllocatedEmployee[]> => {
    
        try {
            const spCrudOpsInstance = await spCrudOps;

            // // Assuming current user id is available via props
            // const currentUserId = props.currentSPContext.pageContext.legacyPageContext.userId;

            // // Filter to only show items created by current user
            const filter = `BatchNameId eq '${ID}'`;

            const results = await spCrudOpsInstance.getData(
                "BatchAllocation2223",
                "*,ID,Position,BatchName/Duration,TrainerName/TrainerName,Module/ModuleName,Level,EmployeeID/EmployeeID,EmployeeName/EmployeeName,BatchName/BatchName,BatchAllocationType",
                "Module,TrainerName,EmployeeID,EmployeeName,BatchName",
                filter,
                { column: "", isAscending: false }, 
                props
            );
    
            console.log('Results from API of ViewAllocatedEmployee:', results);

            // 🔑 Sort descending by Id
            const sortedResults = results.sort(
              (a: any, b: any) => b.Id - a.Id
            );
    
            let brr: Array<IViewAllocatedEmployee> = new Array<IViewAllocatedEmployee>();
            results.map((item: any) => {
                brr.push({
                    Id: item.Id,
                    Position: item.Position,
                    Level: item.Level,
                    BatchAllocationType: item.BatchAllocationType,

                    BatchNameId: item.BatchName?.Id,
                    BatchName: item.BatchName?.BatchName,
                    Duration: item.BatchName?.Duration,

                    TrainerNameId: item.TrainerName?.Id,
                    TrainerName: item.TrainerName?.TrainerName,

                    ModuleId: item.Module?.Id,
                    ModuleName: item.Module?.ModuleName,

                    EmployeeIDId: item.EmployeeID?.Id,
                    EmployeeID: item.EmployeeID?.EmployeeID,

                    EmployeeNameId: item.EmployeeName?.Id,
                    EmployeeName: item.EmployeeName?.EmployeeName           

                });
            });
    
            console.log('Processed Data for ViewAllocatedEmployee:', brr);
            return brr;
        } catch (error) {
            console.error('Error in ViewAllocatedEmployee Data:', error.message);
            throw error;
        }
    };

    return {
        getAllocatedEmployeeData,
        getViewAllocatedEmployeeData
    };
}