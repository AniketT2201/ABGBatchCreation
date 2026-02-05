import { IAbgBatchCreationProps } from "../../components/IAbgBatchCreationProps";
import SPCRUDOPS from '../DAL/spcrudops';
import { sp } from "@pnp/sp/presets/all";
import { Web } from "@pnp/sp/presets/all";
import { IEmployeeMaster } from "../interface/IEmployeeMaster";

export interface IIEmployeeMasterOps {
    getEmployeesData(EmpId: any, props: IAbgBatchCreationProps): Promise<IEmployeeMaster[]>;
    
}



export default function EmployeeMasterOps(): IIEmployeeMasterOps {
    const spCrudOps = SPCRUDOPS();

   

    const getEmployeesData = async (EmpId: any, props: IAbgBatchCreationProps): Promise<any[]> => {
        try {
            const spCrudOpsInstance = await spCrudOps;
            const filter = `EmployeeID eq '${EmpId}'`;

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
                TNIDepartmentId: item.TNIDepartment?.Id || '',
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

    return {
        getEmployeesData
    };
}