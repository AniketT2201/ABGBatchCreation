import { HttpClient } from "@microsoft/sp-http";
import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface IAbgBatchCreationProps {
  httpClient?: HttpClient;
  //apiBaseUrl?: string;
  currentSPContext: WebPartContext;
  webAbsoluteUrl: string;
  description: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
}
