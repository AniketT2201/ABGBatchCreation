import { IUserProps } from "./IUser";
import { HttpClient } from "@microsoft/sp-http";

export interface IBatchCreationDashboard {
  Id?: any;
  Title?: any;

  // Audit fields
  Created?: any;
  Modified?: any;

  // Batch details
  BatchName?: any;
  BatchType?: any;
  TrainerNamesId?: any;
  TrainerNames?: any;
  TrainerNameNewId?: any;
  TrainerNameNew?: any;
  TrainerType1?: any;
  TrainerType2?: any;
  BatchStatus?: any;
  BatchStatusColour?: any;
  BatchStatusforAllocation?: any;
  BatchCancelRemark?: any;
  BatchIntake?: any;
  Duration?: any;
  Unscheduled?: any;

  // Dates
  StartDate?: any;          // Calculated
  EndDate?: any;            // Calculated
  BatchStartDate?: any;
  BatchEndDate?: any;

  // Training info
  TrainingTime?: any;
  TrainerName?: any;
  TrainerType?: any;
  ParticipantCategory?: any;

  // Lookups
  FinancialYear?: any;
  Level?: any;
  ModulesName?: any;
  ModulesNameId?: any;
  Position?: any;
  VenueId?: any;
  Venue?: any;
}



