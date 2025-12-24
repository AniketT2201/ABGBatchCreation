import { IAbgBatchCreationProps } from "../../components/IAbgBatchCreationProps";
import SPCRUDOPS from '../DAL/spcrudops';
import { sp } from "@pnp/sp/presets/all";
import { Web } from "@pnp/sp/presets/all";
import { IBatchCountMaster } from "../interface/IBatchCountMaster";

export interface IBatchCountMasterOps {
    getBatchCountMasterData(ShortName: string, props: IAbgBatchCreationProps): Promise<IBatchCountMaster[]>;
    
}



export default function BatchCountMasterOps(): IBatchCountMasterOps {
    const spCrudOps = SPCRUDOPS();

   

    const getBatchCountMasterData = async (ShortName: string, props: IAbgBatchCreationProps): Promise<IBatchCountMaster[]> => {
    
        try {
            const spCrudOpsInstance = await spCrudOps;

            // // Assuming current user id is available via props
            // const currentUserId = props.currentSPContext.pageContext.legacyPageContext.userId;

            // Filter to only show items created by current user
            const filter = `ShortName eq '${ShortName}'`;

            const results = await spCrudOpsInstance.getData(
                "BatchCount2223",
                "*,Id,ShortName,LastCount",
                "",
                filter,
                { column: "", isAscending: false }, 
                props
            );
    
            console.log('Results from API of BatchCountMaster:', results);

            // 🔑 Sort descending by Id
            const sortedResults = results.sort(
              (a: any, b: any) => b.Id - a.Id
            );
    
            let brr: Array<IBatchCountMaster> = new Array<IBatchCountMaster>();
            sortedResults.map((item: any) => {
                brr.push({
                    Id: item.Id, 
                    Created: item.Created,
                    Modified: item.Modified,
                    ShortName: item.ShortName,
                    LastCount: item.LastCount
                });
            });
    
            console.log('Processed Data for BatchCountMaster:', brr);
            return brr;
        } catch (error) {
            console.error('Error in BatchCountMaster Data:', error.message);
            throw error;
        }
    };

    return {
        getBatchCountMasterData
    };
}