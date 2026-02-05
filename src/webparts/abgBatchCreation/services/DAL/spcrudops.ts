import { Web } from "@pnp/sp/presets/all";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import { HttpClient, HttpClientResponse } from '@microsoft/sp-http';
import { IAbgBatchCreationProps } from "../../components/IAbgBatchCreationProps";

export interface ISPCRUDOPS {
    getData(listName: string, columnsToRetrieve: string, columnsToExpand: string, filters: string, orderby: { column: string, isAscending: boolean }, props: IAbgBatchCreationProps): Promise<any[]>;
    getRootData(listName: string, columnsToRetrieve: string, columnsToExpand: string, filters: string, orderby: { column: string, isAscending: boolean }, props: IAbgBatchCreationProps): Promise<any>;
    getItemData(listName: string, id: number, select: string, expand: string, props: IAbgBatchCreationProps): Promise<any>;
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
    addAttchmentInList(data: File, listName: string, itemId: number, fileName: string, props: IAbgBatchCreationProps): Promise<any>;
    getAttachments(listName: string, itemId: number, props: IAbgBatchCreationProps): Promise<any[]>;
    uploadAttachment(listName: string, itemId: number, file: File, props: IAbgBatchCreationProps): Promise<any>;
    deleteAttachment(listName: string, itemId: number, fileName: string, props: IAbgBatchCreationProps): Promise<any>;
    // postHttpData(endpoint: string, data: any, props: IAbgBatchCreationProps): Promise<any>;
    
}


class SPCRUDOPSImpl implements ISPCRUDOPS {
    async getData(listName: string, columnsToRetrieve: string, columnsToExpand: string, filters: string, orderby: { column: string, isAscending: boolean }, props: IAbgBatchCreationProps): Promise<any[]> {
        if (!props.currentSPContext || !props.currentSPContext.pageContext) {
            throw new Error('SharePoint context is not available');
        }
        const web = Web(props.currentSPContext.pageContext.web.absoluteUrl);
        let items = web.lists.getByTitle(listName).items;
        if (columnsToRetrieve) {
            items = items.select(columnsToRetrieve);
        }
        if (columnsToExpand) {
            items = items.expand(columnsToExpand);
        }
        if (filters) {
            items = items.filter(filters);
        }
        if (orderby?.column) {
            items = items.orderBy(orderby.column, orderby.isAscending);
        }

        const allItems: any[] = [];

        let pagedResult = await items.top(5000).getPaged();
        allItems.push(...pagedResult.results);

        while (pagedResult.hasNext) {
            pagedResult = await pagedResult.getNext();
            allItems.push(...pagedResult.results);
        }

        return allItems;
    }

    async getRootData(listName: string, columnsToRetrieve: string, columnsToExpand: string, filters: string, orderby: { column: string, isAscending: boolean }, props: IAbgBatchCreationProps): Promise<any> {
        if (!props.currentSPContext || !props.currentSPContext.pageContext) {
            throw new Error('SharePoint context is not available');
        }
        const fullUrl = props.currentSPContext.pageContext.web.absoluteUrl;
        const parts = fullUrl.split('/');
        const baseUrl = parts.slice(0, 5).join('/');
        const web = Web(baseUrl);
        let items = web.lists.getByTitle(listName).items;
        if (columnsToRetrieve) {
            items = items.select(columnsToRetrieve);
        }
        if (columnsToExpand) {
            items = items.expand(columnsToExpand);
        }
        if (filters) {
            items = items.filter(filters);
        }
        if (orderby) {
            items = items.orderBy(orderby.column, orderby.isAscending);
        }
        return await items.getAll();
    }

    async getItemData(listName: string, id: number, select: string, expand: string, props: IAbgBatchCreationProps): Promise<any> {
        const web = Web(props.currentSPContext.pageContext.web.absoluteUrl);
        return await web.lists.getByTitle(listName).items.getById(id).select(select).expand(expand).get();
    }




    async insertData(listName: string, data: any, props: IAbgBatchCreationProps): Promise<any> {
        const web = Web(props.currentSPContext.pageContext.web.absoluteUrl);
        return await web.lists.getByTitle(listName).items.add(data);
    }

    async updateData(listName: string, itemId: number, data: any, props: IAbgBatchCreationProps): Promise<any> {
        const web = Web(props.currentSPContext.pageContext.web.absoluteUrl);
        return await web.lists.getByTitle(listName).items.getById(itemId).update(data);
    }

    async deleteData(listName: string, itemId: number, props: IAbgBatchCreationProps): Promise<any> {
        const web = Web(props.currentSPContext.pageContext.web.absoluteUrl);
        return await web.lists.getByTitle(listName).items.getById(itemId).delete();
    }

    async getListInfo(listName: string, props: IAbgBatchCreationProps): Promise<any> {
        const web = Web(props.currentSPContext.pageContext.web.absoluteUrl);
        return await web.lists.getByTitle(listName).get();
    }

    async getListData(listName: string, columnsToRetrieve: string, props: IAbgBatchCreationProps): Promise<any> {
        const web = Web(props.currentSPContext.pageContext.web.absoluteUrl);
        let items = web.lists.getByTitle(listName).items;
        if (columnsToRetrieve) {
            items = items.select(columnsToRetrieve);
        }
        return await items.get();
    }

    async batchInsert(listName: string, data: any, props: IAbgBatchCreationProps): Promise<any> {
        const web = Web(props.currentSPContext.pageContext.web.absoluteUrl);
        const entityTypeFullName = await web.lists.getByTitle(listName).getListItemEntityTypeFullName();
        const batch = web.createBatch();
        data.forEach((item: any) => {
            web.lists.getByTitle(listName).items.inBatch(batch).add(item, entityTypeFullName);
        });
        return await batch.execute();
    }

    async batchUpdate(listName: string, data: any, props: IAbgBatchCreationProps): Promise<any> {
        const web = Web(props.currentSPContext.pageContext.web.absoluteUrl);
        const batch = web.createBatch();
        data.forEach((item: any) => {
            web.lists.getByTitle(listName).items.getById(item.Id).inBatch(batch).update(item);
        });
        return await batch.execute();
    }

    async batchDelete(listName: string, data: any, props: IAbgBatchCreationProps): Promise<any> {
        const web = Web(props.currentSPContext.pageContext.web.absoluteUrl);
        const batch = web.createBatch();
        data.forEach((item: any) => {
            web.lists.getByTitle(listName).items.getById(item.Id).inBatch(batch).delete();
        });
        return await batch.execute();
    }

    async createFolder(listName: string, folderName: string, props: IAbgBatchCreationProps): Promise<any> {
        const web = Web(props.currentSPContext.pageContext.web.absoluteUrl);
        return await web.lists.getByTitle(listName).rootFolder.folders.addUsingPath(folderName);
    }

    async uploadFile(folderServerRelativeUrl: string, file: File, props: IAbgBatchCreationProps): Promise<any> {
        const web = Web(props.currentSPContext.pageContext.web.absoluteUrl);
        return await web.getFolderByServerRelativeUrl(folderServerRelativeUrl).files.add(file.name, file, true);
    }

    async deleteFile(fileServerRelativeUrl: string, props: IAbgBatchCreationProps): Promise<any> {
        const web = Web(props.currentSPContext.pageContext.web.absoluteUrl);
        return await web.getFileByServerRelativeUrl(fileServerRelativeUrl).delete();
    }

    async currentProfile(props: IAbgBatchCreationProps): Promise<any> {
        const web = Web(props.currentSPContext.pageContext.web.absoluteUrl);
        return await web.currentUser.get();
    }

    async getLoggedInSiteGroups(props: IAbgBatchCreationProps): Promise<any> {
        const web = Web(props.currentSPContext.pageContext.web.absoluteUrl);
        return await web.currentUser.groups.get();
    }

    async getAllSiteGroups(props: IAbgBatchCreationProps): Promise<any> {
        const web = Web(props.currentSPContext.pageContext.web.absoluteUrl);
        return await web.siteGroups.get();
    }

    async getTopData(listName: string, columnsToRetrieve: string, columnsToExpand: string, filters: string
        , orderby: { column: string, isAscending: boolean }, top: number, props: IAbgBatchCreationProps): Promise<any> {
        const web = Web(props.currentSPContext.pageContext.web.absoluteUrl);
        let items = web.lists.getByTitle(listName).items;
        if (columnsToRetrieve) {
            items = items.select(columnsToRetrieve);
        }
        if (columnsToExpand) {
            items = items.expand(columnsToExpand);
        }
        if (filters) {
            items = items.filter(filters);
        }
        if (orderby) {
            items = items.orderBy(orderby.column, orderby.isAscending);
        }
        if (top) {
            items = items.top(top);
        }
        return await items.get();
    }

    async addAttchmentInList(data: File, listName: string, itemId: number, fileName: string, props: IAbgBatchCreationProps): Promise<any> {
        const web = Web(props.currentSPContext.pageContext.web.absoluteUrl);
        return await web.lists.getByTitle(listName).items.getById(itemId).attachmentFiles.add(fileName, data);
    }
    async getAttachments(listName: string, itemId: number, props: IAbgBatchCreationProps): Promise<any[]> {
        try {
        const web = Web(props.currentSPContext.pageContext.web.absoluteUrl);
        const files = await web.lists
            .getByTitle(listName)
            .items.getById(itemId)
            .attachmentFiles();

        return files.map(f => ({ name: f.FileName, url: f.ServerRelativeUrl }));
        } catch (error) {
        console.error("Error fetching attachments:", error);
        return [];
        }
    }

    async uploadAttachment(listName: string, itemId: number, file: any, props: IAbgBatchCreationProps): Promise<any> {
        try {
        const web = Web(props.currentSPContext.pageContext.web.absoluteUrl);
        await web.lists
            .getByTitle(listName)
            .items.getById(itemId)
            .attachmentFiles.add(file.name, file);
        } catch (error) {
        console.error("Error uploading attachment:", error);
        throw error;
        }
    }

    async deleteAttachment(listName: string, itemId: number, fileName: any, props: IAbgBatchCreationProps): Promise<any> {
        try {
        const web = Web(props.currentSPContext.pageContext.web.absoluteUrl);
        await web.lists
            .getByTitle(listName)
            .items.getById(itemId)
            .attachmentFiles.getByName(fileName)
            .delete();

        console.log(`Deleted ${fileName} successfully`);
        } catch (error: any) {
        console.error("Error deleting attachment:", error.message || error);
        throw error;
        }
    }

        // POST
    // async postHttpData(endpoint: string, data: any, props: IAbgBatchCreationProps): Promise<any> {
    //     if (!props.currentSPContext) {
    //         throw new Error("SP Context not available");
    //     }
    //     const response: HttpClientResponse = await props.currentSPContext.httpClient.post(
    //         `${props.apiBaseUrl}/${endpoint}`,
    //         HttpClient.configurations.v1,
    //         {
    //             headers: { "Content-Type": "application/json" },
    //             body: JSON.stringify(data),
    //         }
    //     );
    //     return response.json();
    // }


}

export default function SPCRUDOPS(): Promise<ISPCRUDOPS> {
    return Promise.resolve(new SPCRUDOPSImpl());
}