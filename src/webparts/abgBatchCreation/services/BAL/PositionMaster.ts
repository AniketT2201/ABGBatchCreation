import { IAbgBatchCreationProps } from "../../components/IAbgBatchCreationProps";
import SPCRUDOPS from '../DAL/spcrudops';
import { sp } from "@pnp/sp/presets/all";
import { Web } from "@pnp/sp/presets/all";
import { IPositionMaster } from "../interface/IPositionMaster";

export interface IPositionMasterOps {
    getPositionMasterData(props: IAbgBatchCreationProps): Promise<IPositionMaster[]>;
    
}



export default function PositionMasterOps(): IPositionMasterOps {
    const spCrudOps = SPCRUDOPS();

   

    const getPositionMasterData = async ( props: IAbgBatchCreationProps): Promise<IPositionMaster[]> => {
    
        try {
            const spCrudOpsInstance = await spCrudOps;

            // // Assuming current user id is available via props
            // const currentUserId = props.currentSPContext.pageContext.legacyPageContext.userId;

            // // Filter to only show items created by current user
            // const filter = `Author/Id eq ${currentUserId}`;

            const results = await spCrudOpsInstance.getData(
                "PositionMaster",
                "*,Id,Created,Modified,Title,PositionName",
                "",
                "",
                { column: "", isAscending: false }, 
                props
            );
    
            console.log('Results from API of PositionMaster:', results);

            // 🔑 Sort descending by Id
            const sortedResults = results.sort(
              (a: any, b: any) => b.Id - a.Id
            );
    
            let brr: Array<IPositionMaster> = new Array<IPositionMaster>();
            sortedResults.map((item: any) => {
                brr.push({
                    Id: item.Id, 
                    Created: item.Created,
                    Modified: item.Modified,
                    Title: item.Title,
                    PositionName: item.PositionName

                });
            });
    
            console.log('Processed Data for PositionMaster:', brr);
            return brr;
        } catch (error) {
            console.error('Error in PositionMaster Data:', error.message);
            throw error;
        }
    };

    return {
        getPositionMasterData
    };
}