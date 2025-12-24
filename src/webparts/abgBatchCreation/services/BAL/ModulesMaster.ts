import { IAbgBatchCreationProps } from "../../components/IAbgBatchCreationProps";
import SPCRUDOPS from '../DAL/spcrudops';
import { sp } from "@pnp/sp/presets/all";
import { Web } from "@pnp/sp/presets/all";
import { IModulesMaster } from "../interface/IModulesMaster";

export interface IModuleMasterOps {
    getModuleMasterData(props: IAbgBatchCreationProps): Promise<IModulesMaster[]>;
    
}



export default function ModuleMasterOps(): IModuleMasterOps {
    const spCrudOps = SPCRUDOPS();

   

    const getModuleMasterData = async ( props: IAbgBatchCreationProps): Promise<IModulesMaster[]> => {
    
        try {
            const spCrudOpsInstance = await spCrudOps;

            // // Assuming current user id is available via props
            // const currentUserId = props.currentSPContext.pageContext.legacyPageContext.userId;

            // Filter to only show items created by current user
            //const filter = `BatchType eq '${BatchType}'`;

            const results = await spCrudOpsInstance.getData(
                "ModuleMaster",
                "*,Id,Created,Modified,Title,ModuleName,ShortName,BatchType",
                "",
                "",
                { column: "", isAscending: false }, 
                props
            );
    
            console.log('Results from API of ModuleMaster:', results);

            // 🔑 Sort descending by Id
            const sortedResults = results.sort(
              (a: any, b: any) => b.Id - a.Id
            );
    
            let brr: Array<IModulesMaster> = new Array<IModulesMaster>();
            sortedResults.map((item: any) => {
                brr.push({
                    Id: item.Id, 
                    Created: item.Created,
                    Modified: item.Modified,
                    Title: item.Title,
                    ModuleName: item.ModuleName,
                    ShortName: item.ShortName,
                    BatchType: item.BatchType

                });
            });
    
            console.log('Processed Data for ModuleMaster:', brr);
            return brr;
        } catch (error) {
            console.error('Error in ModuleMaster Data:', error.message);
            throw error;
        }
    };

    return {
        getModuleMasterData
    };
}