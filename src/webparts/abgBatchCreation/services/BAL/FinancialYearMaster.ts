import { IAbgBatchCreationProps } from "../../components/IAbgBatchCreationProps";
import SPCRUDOPS from '../DAL/spcrudops';
import { sp } from "@pnp/sp/presets/all";
import { Web } from "@pnp/sp/presets/all";
import { IFinancialYearMaster } from "../interface/IFinancialYearMaster";

export interface IFinancialYearMasterOps {
    getFinancialYearMasterData(FinancialYear: string, props: IAbgBatchCreationProps): Promise<IFinancialYearMaster[]>;
    
}



export default function FinancialYearMasterOps(): IFinancialYearMasterOps {
    const spCrudOps = SPCRUDOPS();

   

    const getFinancialYearMasterData = async (FinancialYear: string, props: IAbgBatchCreationProps): Promise<IFinancialYearMaster[]> => {
    
        try {
            const spCrudOpsInstance = await spCrudOps;

            // // Assuming current user id is available via props
            // const currentUserId = props.currentSPContext.pageContext.legacyPageContext.userId;

            // // Filter to only show items created by current user
            const filter = `FinancialYear eq '${FinancialYear}'`;

            const results = await spCrudOpsInstance.getData(
                "FinancialYearMaster",
                "*,Id,Created,Modified,Title,FinancialYear",
                "",
                filter,
                { column: "", isAscending: false }, 
                props
            );
    
            console.log('Results from API of FinancialYearMaster:', results);

            // 🔑 Sort descending by Id
            const sortedResults = results.sort(
              (a: any, b: any) => b.Id - a.Id
            );
    
            let brr: Array<IFinancialYearMaster> = new Array<IFinancialYearMaster>();
            sortedResults.map((item: any) => {
                brr.push({
                    Id: item.Id, 
                    Created: item.Created,
                    Modified: item.Modified,
                    Title: item.Title,
                    FinancialYear: item.FinancialYear

                });
            });
    
            console.log('Processed Data for FinancialYearMaster:', brr);
            return brr;
        } catch (error) {
            console.error('Error in FinancialYearMaster Data:', error.message);
            throw error;
        }
    };

    return {
        getFinancialYearMasterData
    };
}