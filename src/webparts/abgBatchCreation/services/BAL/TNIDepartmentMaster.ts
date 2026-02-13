import { IAbgBatchCreationProps } from "../../components/IAbgBatchCreationProps";
import SPCRUDOPS from '../DAL/spcrudops';
import { sp } from "@pnp/sp/presets/all";
import { Web } from "@pnp/sp/presets/all";
import { ITNIDepartmentMaster } from "../interface/ITNIDepartmentMaster";

export interface ITNIDepartmentOps {
    getTNIDepartmentData(props: IAbgBatchCreationProps): Promise<ITNIDepartmentMaster[]>;
    
}



export default function TNIDepartmentOps(): ITNIDepartmentOps {
    const spCrudOps = SPCRUDOPS();

   

    const getTNIDepartmentData = async ( props: IAbgBatchCreationProps): Promise<ITNIDepartmentMaster[]> => {
    
        try {
            const spCrudOpsInstance = await spCrudOps;

            // // Assuming current user id is available via props
            // const currentUserId = props.currentSPContext.pageContext.legacyPageContext.userId;

            // // Filter to only show items created by current user
            // const filter = `Author/Id eq ${currentUserId}`;

            const results = await spCrudOpsInstance.getData(
                "TNIDepartment",
                "*,Id,Created,Modified,Title,TNIDepartment",
                "",
                "",
                { column: "", isAscending: false }, 
                props
            );
    
            console.log('Results from API of TNIDepartment:', results);

            // 🔑 Sort descending by Id
            const sortedResults = results.sort(
              (a: any, b: any) => b.Id - a.Id
            );
    
            let brr: Array<ITNIDepartmentMaster> = new Array<ITNIDepartmentMaster>();
            sortedResults.map((item: any) => {
                brr.push({
                    Id: item.Id, 
                    Created: item.Created,
                    Modified: item.Modified,
                    Title: item.Title,
                    TNIDepartment: item.TNIDepartment

                });
            });
    
            console.log('Processed Data for TNIDepartment:', brr);
            return brr;
        } catch (error) {
            console.error('Error in TNIDepartment Data:', error.message);
            throw error;
        }
    };

    return {
        getTNIDepartmentData
    };
}