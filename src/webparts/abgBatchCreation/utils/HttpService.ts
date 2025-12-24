// utils/HttpService.ts
import { HttpClientResponse, HttpClient } from "@microsoft/sp-http";
import { IAbgBatchCreationProps } from "../components/IAbgBatchCreationProps";

// export async function getHttpData(endpoint: string, props: IAbgBatchCreationProps): Promise<any> {
//   if (!props.currentSPContext) {
//     throw new Error("SP Context not available");
//   }

//   const response: HttpClientResponse = await props.currentSPContext.httpClient.get(
//     `${props.apiBaseUrl}/${endpoint}`,
//     HttpClient.configurations.v1
//   );

//   return response.json();
// }


// // GET
//     async getHttpData(endpoint: string, props: IAbgBatchCreationProps): Promise<any> {
//         if (!props.currentSPContext) {
//             throw new Error("SP Context not available");
//         }
//         const response: HttpClientResponse = await props.currentSPContext.httpClient.get(
//             `${props.apiBaseUrl}/${endpoint}`,
//             HttpClient.configurations.v1
//         );
//         return response.json();
//     }

//     // POST
//     async postHttpData(endpoint: string, data: any, props: IAbgBatchCreationProps): Promise<any> {
//         if (!props.currentSPContext) {
//             throw new Error("SP Context not available");
//         }
//         const response: HttpClientResponse = await props.currentSPContext.httpClient.post(
//             `${props.apiBaseUrl}/${endpoint}`,
//             HttpClient.configurations.v1,
//             {
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify(data),
//             }
//         );
//         return response.json();
//     }

//     // PUT
//     async updateHttpData(endpoint: string, data: any, props: IAbgBatchCreationProps): Promise<any> {
//         if (!props.currentSPContext) {
//             throw new Error("SP Context not available");
//         }
//         const response: HttpClientResponse = await props.currentSPContext.httpClient.fetch(
//             `${props.apiBaseUrl}/${endpoint}`,
//             HttpClient.configurations.v1,
//             {
//                 method: "PUT",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify(data),
//             }
//         );
//         return response.json();
//     }

//     // DELETE
//     async deleteHttpData(endpoint: string, props: IAbgBatchCreationProps): Promise<any> {
//         if (!props.currentSPContext) {
//             throw new Error("SP Context not available");
//         }
//         const response: HttpClientResponse = await props.currentSPContext.httpClient.fetch(
//             `${props.apiBaseUrl}/${endpoint}`,
//             HttpClient.configurations.v1,
//             { method: "DELETE" }
//         );
//         return response.ok;
//     }
