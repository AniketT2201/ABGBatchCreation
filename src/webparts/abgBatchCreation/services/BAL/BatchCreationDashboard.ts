import { Position } from "@fluentui/react";
import { IAbgBatchCreationProps } from "../../components/IAbgBatchCreationProps";
import SPCRUDOPS from '../DAL/spcrudops';
import { IBatchCreationDashboard } from '../interface/IBatchCreationDashboard';
import { sp } from "@pnp/sp/presets/all";
import { Web } from "@pnp/sp/presets/all";
//import { ITNISave } from "../interface/ITNISave";


export interface IDashboardOps {
    getDashboardData(activeTab: any, props: IAbgBatchCreationProps): Promise<IBatchCreationDashboard[]>;
    insertDashboardData(item: any, props: IAbgBatchCreationProps): Promise<any>;
}

export default function DashboardOps(): IDashboardOps {
    const spCrudOps = SPCRUDOPS();

   

    const getDashboardData = async (activeTab: any, props: IAbgBatchCreationProps): Promise<IBatchCreationDashboard[]> => {
    
        try {
            const spCrudOpsInstance = await spCrudOps;
            // // Assuming current user id is available via props
            // const currentUserId = props.currentSPContext.pageContext.legacyPageContext.userId;

            // Filter to only show items created by current user
            let filter = '';
            if (activeTab === 'OnGoing') {
            filter = `BatchStatus eq 'InProgress' or BatchStatus eq 'TrainingConducted' or BatchStatus eq 'Planned'`;
            } else if (activeTab === 'Completed') {
            filter = `BatchStatus eq 'Completed'`;
            } else if (activeTab === 'Cancelled') {
            filter = `BatchStatus eq 'CancelBatch'`;
            }
            //const filter = `BatchStatus eq 'InProgress' or BatchStatus eq 'TrainingConducted' or BatchStatus eq 'Planned'`;

            const results = await spCrudOpsInstance.getData(
                "BatchMaster2223",
                `Id,
                Title,
                BatchName,
                BatchType,
                BatchStatus,
                BatchStatusforAllocation,
                BatchIntake,
                BatchCancelRemark,
                Duration,
                TrainingTime,
                TrainerName,
                TrainerType,
                ParticipantCategory,
                Created,
                Modified,
                StartDate,
                EndDate,
                BatchStartDate,
                BatchEndDate,
                Unscheduled,
                FinancialYear/FinancialYear,
                TrainerNames/TrainerName,
                TrainerNameNew/TrainerName,
                Level/LevelName,
                ModulesName/ModuleName,
                Position/PositionName,
                Venue/Venue`,
                "FinancialYear,TrainerNames,TrainerNameNew,Level,ModulesName,Position,Venue",
                filter,
                { column: "Id", isAscending: false }, 
                props
            );
            console.log('Results from API of Dashboard:', results);

            // 🔑 Sort descending by Id
            const sortedResults = results.sort(
              (a: any, b: any) => b.Id - a.Id
            );
    
            let brr: Array<IBatchCreationDashboard> = new Array<IBatchCreationDashboard>();
            sortedResults.map((item: any) => {
                brr.push({
                    Id: item.Id,
                    Title: item.Title,
                    BatchName: item.BatchName,
                    BatchType: item.BatchType,
                    BatchStatus: item.BatchStatus,
                    BatchStatusforAllocation: item.BatchStatusforAllocation,
                    BatchIntake: item.BatchIntake,
                    BatchCancelRemark: item.BatchCancelRemark,
                    Duration: item.Duration,
                    TrainingTime: item.TrainingTime,
                    TrainerName: item.TrainerName,
                    TrainerType: item.TrainerType,
                    TrainerType1: item.TrainerType1,
                    TrainerType2: item.TrainerType2,
                    TrainerNames: item.TrainerNames?.TrainerName,
                    TrainerNameNew: item.TrainerNameNew?.TrainerName,
                    ParticipantCategory: item.ParticipantCategory,
                    StartDate: item.StartDate,
                    EndDate: item.EndDate,
                    BatchStartDate: item.BatchStartDate,
                    BatchEndDate: item.BatchEndDate,
                    FinancialYear: item.FinancialYear?.FinancialYear,
                    Level: item.Level?.LevelName,
                    ModulesName: item.ModulesName?.ModuleName,
                    Position: item.Position?.PositionName,
                    Unscheduled: item.Unscheduled,
                    Venue: item.Venue?.Venue,
                    Created: item.Created,
                    Modified: item.Modified

                });
            });
    
            console.log('Processed Data for Dashboard:', brr);
            return brr;
        } catch (error) {
            console.error('Error in Dashboard Data:', error.message);
            throw error;
        }
    };

    const insertDashboardData = async (item: any, props: IAbgBatchCreationProps): Promise<any> => {
        try {
            const spCrudOpsInstance = await spCrudOps;
            const result = await spCrudOpsInstance.insertData(
            "BatchMaster2223",
            { 
               ...item

            }, 
            props);
            return result;
        } catch (error) {
            console.error('Error inserting Dashboard Data:', error.message);
            throw error;
        }
    };
    


    return {
        getDashboardData,
        insertDashboardData 
    };
}