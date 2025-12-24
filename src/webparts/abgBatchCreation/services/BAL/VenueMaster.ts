import { IAbgBatchCreationProps } from "../../components/IAbgBatchCreationProps";
import SPCRUDOPS from '../DAL/spcrudops';
import { sp } from "@pnp/sp/presets/all";
import { Web } from "@pnp/sp/presets/all";
import { IVenueMaster } from "../interface/IVenueMaster";

export interface IVenueMasterOps {
    getVenueMasterData(props: IAbgBatchCreationProps): Promise<IVenueMaster[]>;
    
}



export default function VenueMasterOps(): IVenueMasterOps {
    const spCrudOps = SPCRUDOPS();

   

    const getVenueMasterData = async ( props: IAbgBatchCreationProps): Promise<IVenueMaster[]> => {
    
        try {
            const spCrudOpsInstance = await spCrudOps;

            // // Assuming current user id is available via props
            // const currentUserId = props.currentSPContext.pageContext.legacyPageContext.userId;

            // // Filter to only show items created by current user
            // const filter = `Author/Id eq ${currentUserId}`;

            const results = await spCrudOpsInstance.getData(
                "VenueMaster",
                "*,Id,Created,Modified,Title,Venue",
                "",
                "",
                { column: "", isAscending: false }, 
                props
            );
    
            console.log('Results from API of VenueMaster:', results);

            // 🔑 Sort descending by Id
            const sortedResults = results.sort(
              (a: any, b: any) => b.Id - a.Id
            );
    
            let brr: Array<IVenueMaster> = new Array<IVenueMaster>();
            sortedResults.map((item: any) => {
                brr.push({
                    Id: item.Id, 
                    Created: item.Created,
                    Modified: item.Modified,
                    Title: item.Title,
                    Venue: item.Venue

                });
            });
    
            console.log('Processed Data for VenueMaster:', brr);
            return brr;
        } catch (error) {
            console.error('Error in VenueMaster Data:', error.message);
            throw error;
        }
    };

    return {
        getVenueMasterData
    };
}