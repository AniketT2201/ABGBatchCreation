import "@pnp/sp/lists";
import "@pnp/sp/items";
// import { IPatelEngProps } from "../../components/IPatelEngProps";
import { IAbgBatchCreationProps } from "../../../components/IAbgBatchCreationProps";
import SPCRUDOPS from "../../DAL/spcrudops";

export interface ISPCRUD {
    getData(listName: string, columnsToRetrieve: string, columnsToExpand: string, filters: string, orderby: { column: string, isAscending: boolean }, top: number, props: IAbgBatchCreationProps): Promise<any>;
    getRootData(listName: string, columnsToRetrieve: string, columnsToExpand: string, filters: string, orderby: { column: string, isAscending: boolean }, top: number, props: IAbgBatchCreationProps): Promise<any>;
    insertData(listName: string, data: any, props: IAbgBatchCreationProps): Promise<any>;
    updateData(listName: string, itemId: number, data: any, props: IAbgBatchCreationProps): Promise<any>;
    deleteData(listName: string, itemId: number, props: IAbgBatchCreationProps): Promise<any>;
    getListInfo(listName: string, props: IAbgBatchCreationProps): Promise<any>;
    getListData(listName: string, columnsToRetrieve: string, props: IAbgBatchCreationProps): Promise<any>;
    batchInsert(listName: string, data: any, props: IAbgBatchCreationProps): Promise<any>;
    batchUpdate(listName: string, data: any, props: IAbgBatchCreationProps): Promise<any>;
    batchDelete(listName: string, data: any, props: IAbgBatchCreationProps): Promise<any>;
    createFolder(listName: string, folderName: string, props: IAbgBatchCreationProps): Promise<any>;
    uploadFile(folderServerRelativeUrl: string, file: File, props: IAbgBatchCreationProps): Promise<any>;
    deleteFile(fileServerRelativeUrl: string, props: IAbgBatchCreationProps): Promise<any>;
    currentProfile(props: IAbgBatchCreationProps): Promise<any>;
    getLoggedInSiteGroups(props: IAbgBatchCreationProps): Promise<any>;
    getAllSiteGroups(props: IAbgBatchCreationProps): Promise<any>;
    getTopData(listName: string, columnsToRetrieve: string, columnsToExpand: string, filters: string
        , orderby: { column: string, isAscending: boolean }, top: number, props: IAbgBatchCreationProps): Promise<any>;
    addAttchmentInList(attFiles: File, listName: string, itemId: number, fileName: string, props: IAbgBatchCreationProps): Promise<any>;

}

export default async function USESPCRUD(): Promise<ISPCRUD> {
    const spCrudOps = await SPCRUDOPS();
    return {
        getData: async (listName: string, columnsToRetrieve: string, columnsToExpand: string, filters: string
            , orderby: { column: string, isAscending: boolean }, top: number, props: IAbgBatchCreationProps) => {
            return await spCrudOps.getData(listName, columnsToRetrieve, columnsToExpand, filters, orderby, props);
        },
        getRootData: async (listName: string, columnsToRetrieve: string, columnsToExpand: string, filters: string
            , orderby: { column: string, isAscending: boolean }, top: number, props: IAbgBatchCreationProps) => {
            return await spCrudOps.getData(listName, columnsToRetrieve, columnsToExpand, filters, orderby, props);
        },
        insertData: async (listName: string, data: any, props: IAbgBatchCreationProps) => {
            return await spCrudOps.insertData(listName, data, props);
        },
        updateData: async (listName: string, itemId: number, data: any, props: IAbgBatchCreationProps) => {
            return await spCrudOps.updateData(listName, itemId, data, props);
        },
        deleteData: async (listName: string, itemId: number, props: IAbgBatchCreationProps) => {
            return await spCrudOps.deleteData(listName, itemId, props);
        },
        getListInfo: async (listName: string, props: IAbgBatchCreationProps) => {
            return await spCrudOps.getListInfo(listName, props);
        },
        getListData: async (listName: string, columnsToRetrieve: string, props: IAbgBatchCreationProps) => {
            return await spCrudOps.getListData(listName, columnsToRetrieve, props);
        },
        batchInsert: async (listName: string, data: any, props: IAbgBatchCreationProps) => {
            return await spCrudOps.batchInsert(listName, data, props);
        },
        batchUpdate: async (listName: string, data: any, props: IAbgBatchCreationProps) => {
            return await spCrudOps.batchUpdate(listName, data, props);
        },
        batchDelete: async (listName: string, data: any, props: IAbgBatchCreationProps) => {
            return await spCrudOps.batchDelete(listName, data, props);
        },
        createFolder: async (listName: string, folderName: string, props: IAbgBatchCreationProps) => {
            return await spCrudOps.createFolder(listName, folderName, props);
        },
        uploadFile: async (folderServerRelativeUrl: string, file: File, props: IAbgBatchCreationProps) => {
            return await spCrudOps.uploadFile(folderServerRelativeUrl, file, props);
        },
        deleteFile: async (fileServerRelativeUrl: string, props: IAbgBatchCreationProps) => {
            return await spCrudOps.deleteFile(fileServerRelativeUrl, props);
        },
        currentProfile: async (props: IAbgBatchCreationProps) => {
            return await spCrudOps.currentProfile(props);
        },

        getLoggedInSiteGroups: async (props: IAbgBatchCreationProps) => {
            return await spCrudOps.getLoggedInSiteGroups(props);
        },
        getAllSiteGroups: async (props: IAbgBatchCreationProps) => {
            return await spCrudOps.getAllSiteGroups(props);
        },
        getTopData: async (listName: string, columnsToRetrieve: string, columnsToExpand: string, filters: string
            , orderby: { column: string, isAscending: boolean }, top: number, props: IAbgBatchCreationProps) => {
            return await spCrudOps.getTopData(listName, columnsToRetrieve, columnsToExpand, filters, orderby, top, props);
        },
        addAttchmentInList: async (attFiles: File, listName: string, itemId: number, fileName: string, props: IAbgBatchCreationProps) => {
            return await spCrudOps.addAttchmentInList(attFiles, listName, itemId, fileName, props);
        }
    };
}