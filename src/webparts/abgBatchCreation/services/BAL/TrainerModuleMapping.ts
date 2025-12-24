import { IAbgBatchCreationProps } from "../../components/IAbgBatchCreationProps";
import SPCRUDOPS from '../DAL/spcrudops';
import { sp } from "@pnp/sp/presets/all";
import { Web } from "@pnp/sp/presets/all";
import { ITrainerModuleMapping } from "../interface/ITrainerModuleMapping";

export interface ITrainerModuleMappingOps {
    getTrainerModuleMappingData(ModuleName: any, Level: any, props: IAbgBatchCreationProps): Promise<ITrainerModuleMapping[]>;
    
}



export default function TrainerModuleMappingOps(): ITrainerModuleMappingOps {
    const spCrudOps = SPCRUDOPS();

   

    const getTrainerModuleMappingData = async (ModuleName: any, Level: any, props: IAbgBatchCreationProps): Promise<ITrainerModuleMapping[]> => {
    
        try {
            const spCrudOpsInstance = await spCrudOps;

            // // Assuming current user id is available via props
            // const currentUserId = props.currentSPContext.pageContext.legacyPageContext.userId;

            // Filter to only show items created by current user
            const filter = `EmployeeModule/ModuleName eq '${ModuleName}' and Level eq '${Level}' and Status eq 'Active'`;

            const results = await spCrudOpsInstance.getData(
                "TrainerModuleMapping",
                "*,Id,Created,Modified,Title,TrainerName/Id,TrainerName/TrainerName,ModuleName,ContractModuleName/Id,ContractModuleName/ModuleName,EmployeeModule/Id,EmployeeModule/ModuleName,Level,ParticipantCategory,Status,TrainerType",
                "TrainerName,ContractModuleName,EmployeeModule",
                filter,
                { column: "", isAscending: false }, 
                props
            );
    
            console.log('Results from API of TrainerModuleMapping:', results);

            // 🔑 Sort descending by Id
            const sortedResults = results.sort(
              (a: any, b: any) => b.Id - a.Id
            );
    
            let brr: Array<ITrainerModuleMapping> = new Array<ITrainerModuleMapping>();
            sortedResults.map((item: any) => {
                brr.push({
                    Id: item.Id, 
                    Created: item.Created,
                    Modified: item.Modified,
                    Title: item.Title,
                    TrainerName: item.TrainerName?.TrainerName,
                    TrainerNameId: item.TrainerName?.Id,
                    ModuleName: item.ModuleName,
                    ContractModuleName: item.ContractModuleName?.ModuleName,
                    ContractModuleNameId: item.ContractModuleName?.Id,
                    EmployeeModule: item.EmployeeModule?.ModuleName,
                    EmployeeModuleId: item.EmployeeModule?.Id,
                    Level: item.Level,
                    ParticipantCategory: item.ParticipantCategory,
                    Status: item.Status,
                    TrainerType: item.TrainerType
                });
            });
    
            console.log('Processed Data for TrainerModuleMapping:', brr);
            return brr;
        } catch (error) {
            console.error('Error in TrainerModuleMapping Data:', error.message);
            throw error;
        }
    };

    return {
        getTrainerModuleMappingData
    };
}