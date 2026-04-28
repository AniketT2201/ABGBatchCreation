import { Position } from "@fluentui/react";
import { IAbgBatchCreationProps } from "../../components/IAbgBatchCreationProps";
import SPCRUDOPS from '../DAL/spcrudops';
import { ITNIDashboard } from '../interface/ITNIDashboard';
import { sp } from "@pnp/sp/presets/all";
import { Web } from "@pnp/sp/presets/all";
import { chunkArray } from "../Helper";


export interface IDashboardOps {
    bulkCheckDuplicates(combos: any[], props: IAbgBatchCreationProps): Promise<any[]>;
    insertBatchData(items: any[], props: IAbgBatchCreationProps, onProgress?: (completed: number, total: number) => void): Promise<any[]>;
    insertManagerAssociations( items: any[], props: IAbgBatchCreationProps,
        onProgress?: (completed: number, total: number) => void ): Promise<any[]>;
    bulkUpdateTNIFlags( tniUpdates: Array<{ id: number; updates: any; }>, props: IAbgBatchCreationProps,
        onProgress?: (completed: number, total: number) => void ): Promise<any[]>;
    bulkUpdateforTNIFlags( tniUpdates: Array<{ id: number; updates: any; }>, props: IAbgBatchCreationProps,
        onProgress?: (completed: number, total: number) => void ): Promise<any[]>;
    insertFeedbackForms( items: any[], props: IAbgBatchCreationProps,
        onProgress?: (completed: number, total: number) => void ): Promise<any[]>;
    insertTrainerFeedbackForms( items: any[], props: IAbgBatchCreationProps,
        onProgress?: (completed: number, total: number) => void ): Promise<any[]>;
    updateBatchStatus( batchId: number, newStatus: string, props: IAbgBatchCreationProps ): Promise<any>;
}

export default function BatchCreationSpCrudOps(): IDashboardOps {
    const spCrudOps = SPCRUDOPS();

    const insertBatchData = async (items: any[], props: IAbgBatchCreationProps, onProgress?: (completed: number, total: number) => void): Promise<any[]> => {
        try {
            const spCrudOpsInstance = await spCrudOps;

            const results: any[] = [];

            let completed = 0;
            const total = items.length;

            for (const item of items) {
            try {
                const res = await spCrudOpsInstance.insertData(
                "BatchAllocation2223",
                {
                    ...item
                },
                props
                );

                results.push(res);

            } catch (err) {
                console.error(`Failed to insert item (EmployeeID ${item.EmployeeIDId}):`, err);
                // Continue inserting remaining items
            } finally {
                completed++;

                // 🔑 Progress callback
                if (onProgress) {
                onProgress(completed, total);
                }
            }
            }

            return results;

        } catch (error) {
            console.error('Error inserting Dashboard Data:', error);
            throw error;
        }
    };


    const insertManagerAssociations = async ( items: any[], props: IAbgBatchCreationProps,
        onProgress?: (completed: number, total: number) => void ): Promise<any[]> => {
        try {
            const spCrudOpsInstance = await spCrudOps;
            const results: any[] = [];
            let completed = 0;
            const total = items.length;

            for (const item of items) {
            try {
                const res = await spCrudOpsInstance.insertData(
                "BatchAssociatedManager2223",
                item, 
                props
                );
                results.push(res);
            } catch (err) {
                console.error(`Failed to associate manager ID ${item.AssociatedManagerId}:`, err);
                // Continue — not critical if one fails
            } finally {
                completed++;
                if (onProgress) {
                onProgress(completed, total);
                }
            }
            }

            return results;
        } catch (error) {
            console.error('Error inserting manager associations:', error);
            throw error; 
        }
    };

    const bulkCheckDuplicates = async (combos: any[], props: IAbgBatchCreationProps): Promise<any[]> => {
        try {
            const spCrudOpsInstance = await spCrudOps;

            if (!combos || combos.length === 0) return [];

            const CHUNK_SIZE = 2;
            const comboChunks = chunkArray(combos, CHUNK_SIZE);

            let allDuplicates: any[] = [];

            for (const chunk of comboChunks) {
            const orFilters = chunk.map(c =>
                `(EmployeeID/Id eq ${c.empId} and Module/Id eq ${c.moduleId} and BatchName/Id eq ${c.batchId})`
            );

            const finalFilter = orFilters.join(" or ");
            //const finalFilterEncoded = encodeURIComponent(finalFilter);

            const results = await spCrudOpsInstance.getData(
                "BatchAllocation2223",
                "*,Id,EmployeeID/EmployeeID,EmployeeID/Id,SupervisorStatus,BatchName/BatchName,BatchName/Id,Module/ModuleName,Module/Id",
                "EmployeeID,BatchName,Module",
                finalFilter,
                { column: "Id", isAscending: false },
                props
            );

            const duplicates = results.map((d: any) => {
                const matchingCombo = chunk.find(c => 
                    c.empId === d.EmployeeID?.Id && 
                    c.moduleId === d.Module?.Id &&
                    c.batchId === d.BatchName?.Id  
                    
                );
                
                return {
                    key: matchingCombo?.key || `${d.EmployeeIDId}-${d.BatchNameId}-${d.ModuleId}`,
                    empCode: d.EmployeeID?.EmployeeID || '',
                    empId: d.EmployeeID?.Id,
                    isRejected: d.SupervisorStatus === "Rejected",
                    supervisorStatus: d.SupervisorStatus
                };
            });

            allDuplicates = allDuplicates.concat(duplicates);
            }

            return allDuplicates;

        } catch (error) {
            console.error("Bulk duplicate check error:", error);
            return [];
        }
    };

    //  Bulk TNI Flag Updates
    const bulkUpdateTNIFlags = async (
        tniUpdates: Array<{
            id: number;
            updates: any;
        }>,
        props: IAbgBatchCreationProps,
        onProgress?: (completed: number, total: number) => void
        ): Promise<any[]> => {
        try {
            const spCrudOpsInstance = await spCrudOps;
            const results: any[] = [];
            let completed = 0;
            const total = tniUpdates.length;

            for (const updateItem of tniUpdates) {
            try {
                const res = await spCrudOpsInstance.updateData(
                "TNI2223",
                updateItem.id,
                updateItem.updates,
                props
                );
                results.push(res);
            } catch (err) {
                console.error(`Failed to update TNI ID ${updateItem.id}:`, err);
                // Continue with others
            } finally {
                completed++;
                if (onProgress) {
                onProgress(completed, total);
                }
            }
            }

            return results;
        } catch (error) {
            console.error('Error updating TNI flags:', error);
            throw error;
        }
    };

    const bulkUpdateforTNIFlags = async (
        tniUpdates: Array<{
            id: number;
            updates: any;
        }>,
        props: IAbgBatchCreationProps,
        onProgress?: (completed: number, total: number) => void
        ): Promise<any[]> => {
        try {
            const spCrudOpsInstance = await spCrudOps;
            const results: any[] = [];
            let completed = 0;
            const total = tniUpdates.length;

            for (const updateItem of tniUpdates) {
            try {
                const res = await spCrudOpsInstance.updateData(
                "TNI2122",
                updateItem.id,
                updateItem.updates,
                props
                );
                results.push(res);
            } catch (err) {
                console.error(`Failed to update TNI ID ${updateItem.id}:`, err);
                // Continue with others
            } finally {
                completed++;
                if (onProgress) {
                onProgress(completed, total);
                }
            }
            }

            return results;
        } catch (error) {
            console.error('Error updating TNI flags:', error);
            throw error;
        }
    };

    // Single Batch Status Update
    const updateBatchStatus = async (
        batchId: number,
        newStatus: string,
        props: IAbgBatchCreationProps
        ): Promise<any> => {
        try {
            const spCrudOpsInstance = await spCrudOps;
            return await spCrudOpsInstance.updateData(
            "BatchMaster2223",
            batchId,
            { BatchStatus: newStatus },
            props
            );
        } catch (error) {
            console.error(`Failed to update batch ${batchId} status:`, error);
            throw error;
        }
    };

    // Insert Feedback2223 forms (Unscheduled only)
    const insertFeedbackForms = async (
        items: any[],
        props: IAbgBatchCreationProps,
        onProgress?: (completed: number, total: number) => void
        ): Promise<any[]> => {
        try {
            const spCrudOpsInstance = await spCrudOps;
            const results: any[] = [];

            let completed = 0;
            const total = items.length;

            for (const item of items) {
            try {
                const res = await spCrudOpsInstance.insertData(
                "Feedback2223",
                item, // single item
                props
                );

                results.push(res);
            } catch (err) {
                console.error(`Failed to insert Feedback2223 for EmployeeID ${item.EmployeeIDId}:`, err);
                // Continue with next items
            } finally {
                completed++;

                // Progress callback
                if (onProgress) {
                onProgress(completed, total);
                }
            }
        }

        return results;

        } catch (error) {
            console.error('Error inserting Feedback2223 forms:', error);
            throw error;
        }
    };

    // Insert TrainerFeedback2223 forms (Unscheduled only)
    const insertTrainerFeedbackForms = async (
        items: any[],
        props: IAbgBatchCreationProps,
        onProgress?: (completed: number, total: number) => void
        ): Promise<any[]> => {
        try {
            const spCrudOpsInstance = await spCrudOps;
            const results: any[] = [];

            let completed = 0;
            const total = items.length;

            for (const item of items) {
            try {
                const res = await spCrudOpsInstance.insertData(
                "TrainerFeedback2223",
                item, // single item
                props
                );

                results.push(res);
            } catch (err) {
                console.error(`Failed to insert TrainerFeedback2223 for EmployeeID ${item.EmployeeUniqueIDId}:`, err);
                // Continue with next items
            } finally {
                completed++;

                // Progress callback
                if (onProgress) {
                onProgress(completed, total);
                }
            }
            }

            return results;

        } catch (error) {
            console.error('Error inserting TrainerFeedback2223 forms:', error);
            throw error;
        }
    };
        

    return {
        bulkCheckDuplicates,
        insertBatchData,
        insertManagerAssociations,
        bulkUpdateforTNIFlags,
        bulkUpdateTNIFlags,
        updateBatchStatus,
        insertFeedbackForms,
        insertTrainerFeedbackForms
        
    };
}