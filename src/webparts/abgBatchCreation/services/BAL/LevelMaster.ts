import { IAbgBatchCreationProps } from "../../components/IAbgBatchCreationProps";
import SPCRUDOPS from '../DAL/spcrudops';
import { sp } from "@pnp/sp/presets/all";
import { Web } from "@pnp/sp/presets/all";
import { ILevelMaster } from "../interface/ILevelMaster";

export interface ILevelMasterOps {
    getLevelMasterData(props: IAbgBatchCreationProps): Promise<ILevelMaster[]>;
    
}



export default function LevelMasterOps(): ILevelMasterOps {
    const spCrudOps = SPCRUDOPS();

   

    const getLevelMasterData = async ( props: IAbgBatchCreationProps): Promise<ILevelMaster[]> => {
    
        try {
            const spCrudOpsInstance = await spCrudOps;

            // // Assuming current user id is available via props
            // const currentUserId = props.currentSPContext.pageContext.legacyPageContext.userId;

            // // Filter to only show items created by current user
            // const filter = `Author/Id eq ${currentUserId}`;

            const results = await spCrudOpsInstance.getData(
                "LevelMaster",
                "*,Id,Created,Modified,Title,LevelName",
                "",
                "",
                { column: "", isAscending: false }, 
                props
            );
    
            console.log('Results from API of LevelMaster:', results);

            // 🔑 Sort descending by Id
            const sortedResults = results.sort(
              (a: any, b: any) => b.Id - a.Id
            );
    
            let brr: Array<ILevelMaster> = new Array<ILevelMaster>();
            sortedResults.map((item: any) => {
                brr.push({
                    Id: item.Id, 
                    Created: item.Created,
                    Modified: item.Modified,
                    Title: item.Title,
                    LevelName: item.LevelName

                });
            });
    
            console.log('Processed Data for LevelMaster:', brr);
            return brr;
        } catch (error) {
            console.error('Error in LevelMaster Data:', error.message);
            throw error;
        }
    };

    return {
        getLevelMasterData
    };
}