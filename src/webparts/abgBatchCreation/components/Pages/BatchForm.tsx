import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import type { IAbgBatchCreationProps } from '../IAbgBatchCreationProps';
import { useHistory } from 'react-router-dom';
import BatchCountMasterOps  from "../../services/BAL/BatchCountMaster";
import ModuleMasterOps from '../../services/BAL/ModulesMaster';
import LevelMasterOps from '../../services/BAL/LevelMaster';
import VenueMasterOps from '../../services/BAL/VenueMaster';
import TrainerModuleMappingOps from '../../services/BAL/TrainerModuleMapping';
import DashboardOps from '../../services/BAL/BatchCreationDashboard';
import Swal from 'sweetalert2';
import "../BatchForm.scss";
import FinancialYearMasterOps from '../../services/BAL/FinancialYearMaster';





export const BatchForm: React.FunctionComponent<IAbgBatchCreationProps> = (props: IAbgBatchCreationProps) => {
  const history = useHistory();
  const [batchType, setBatchType] = useState("Classroom");
  const [isElearning, setIsElearning] = useState(false);
  const [financialYearText, setFinancialYearText] = useState<string>("");
  const [financialYearId, setFinancialYearId] = useState<number | null>(null);


  const [modules, setModules] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [venues, setVenues] = useState<any[]>([]);
  const [trainers, setTrainers] = useState<any[]>([]);

  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [selectedLevel, setSelectedLevel] = useState<any>(null);
  const [selectedVenue, setSelectedVenue] = useState<any>(null);

  const [batchName, setBatchName] = useState("");
  const [batchStartDate, setBatchStartDate] = useState("");
  const [batchEndDate, setBatchEndDate] = useState("");
  const [batchIntake, setBatchIntake] = useState("");
  const [unscheduled, setUnscheduled] = useState<string>("");
  const [duration, setDuration] = useState("");
  const [trainingTime, setTrainingTime] = useState("");
  const [trainer1, setTrainer1] = useState("");
  const [trainer2, setTrainer2] = useState("");
  const [trainerType1, setTrainerType1] = useState("");
  const [trainerType2, setTrainerType2] = useState("");
  const [participantCategory, setParticipantCategory] = useState("");



  // Load initial data on component mount page load
  useEffect(() => {
    // Load initial data (modules, levels, venues, trainers)
    const loadInitialData = async () => {
      try {
        // Load Modules based on default batch type
        const modulesData = await ModuleMasterOps().getModuleMasterData( props);
        setModules(modulesData);
        
        // Load Levels Data
        const levelsData = await LevelMasterOps().getLevelMasterData(props);
        setLevels(levelsData);

        // Load Venues Data
        const venuesData = await VenueMasterOps().getVenueMasterData(props);
        setVenues(venuesData);

        // Load Financial Year
        const fy = getCurrentFinancialYear();
        setFinancialYearText(fy);
        const fyData = await FinancialYearMasterOps().getFinancialYearMasterData(fy, props);
        if (fyData && fyData.length > 0) {
          setFinancialYearText(fyData[0].FinancialYear); 
          setFinancialYearId(fyData[0].Id); 
        }
      } catch (error) {
        console.error("Error loading initial data:", error);
      }
    };

    loadInitialData();
  }, []);

  // Handle batch type change
  const handleBatchTypeChange = (value: string) => {
    setBatchType(value);
    setIsElearning(value === "Elearning");

    if (value === "Elearning") {
      // Clear classroom-specific fields
      setBatchIntake("");
      setSelectedVenue("");
      setDuration("");
      setTrainingTime("");
      setTrainer1("");
      setTrainer2("");
    }
  };

  // Handle module change
  const handleModuleChange = async (moduleId: number) => {
    const module = modules.find(m => m.Id === moduleId);
    setSelectedModule(module);

    // Generate batch name
    const counts = await BatchCountMasterOps().getBatchCountMasterData(module.ShortName, props);
    const nextCount = counts.length > 0 ? counts[0].LastCount + 1 : 1;
    setBatchName(`${module.ShortName}_${nextCount}`);
    setSelectedLevel("");
  };

  // Handle level change
  const handleLevelChange = async (levelId: number) => {
    const level = levels.find(l => l.Id === levelId);
    setSelectedLevel(level);

    // Load trainers for selected module + level
    const mappings = await TrainerModuleMappingOps().getTrainerModuleMappingData(
      selectedModule.ModuleName,
      level.LevelName,
      props
    );
    const uniqueTrainers = Array.from(new Map(mappings.map(t => [t.TrainerName, t])).values());
    setTrainers(uniqueTrainers);

    // ParticipantCategory is common → take from first record
    if (uniqueTrainers.length > 0) {
      setParticipantCategory(uniqueTrainers[0].ParticipantCategory);
    }
  };

  // Get current financial year
  const getCurrentFinancialYear = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    return (today.getMonth() + 1 <= 3)
      ? `${year - 1}-${year}`
      : `${year}-${year + 1}`;
  };

  // Handle trainer1 changes
  const onTrainer1Change = (trainerId: any) => {
    const selected = trainers.find((t: any) => t.TrainerNameId === trainerId);
    setTrainer1(trainerId);
    setTrainerType1(selected?.TrainerType || "");
  };

  // Handle trainer2 changes
  const onTrainer2Change = (trainerId: any) => {
    const selected = trainers.find(t => t.TrainerNameId === trainerId);
    setTrainer2(trainerId);
    setTrainerType2(selected?.TrainerType || "");
  };


  // Validate form fields before submission
  const validateFields = (): boolean => {
    const fields = [
      { value: batchType, name: "Batch Type" },
      { value: selectedModule, name: "Module" },
      { value: selectedLevel, name: "Level" },
      { value: batchStartDate, name: "Batch Start Date" },
      { value: batchEndDate, name: "Batch End Date" }
    ];

    if (!isElearning) {
      fields.push(
        { value: batchIntake, name: "Batch Intake" },
        { value: selectedVenue, name: "Venue" },
        { value: unscheduled, name: "Unscheduled" },
        { value: duration, name: "Duration" },
        { value: trainingTime, name: "Training Time" },
        { value: trainer1, name: "Trainer 1" }
      );
    }

    const missing = fields.filter(f => !f.value).map(f => f.name);

    if (missing.length > 0) {
      Swal.fire("Warning", `Please fill: ${missing.join(", ")}`, "warning");
      return false;
    }

    if (new Date(batchStartDate) > new Date(batchEndDate)) {
      Swal.fire("Warning", "End Date must be after Start Date", "warning");
      return false;
    }

    if (!isElearning && trainer1 === trainer2 && trainer1) {
      Swal.fire("Warning", "Trainer 1 and Trainer 2 cannot be same", "warning");
      return false;
    }

    return true;
  };



  // Create batch for data submission
  const createBatch = async () => {
    if (!validateFields()) return;

    const payload = {
      BatchName: batchName,
      BatchType: batchType,
      LevelId: selectedLevel?.Id,
      Modules: selectedModule.ModuleName,
      ModulesNameId: selectedModule?.Id,
      BatchStartDate: batchStartDate,
      BatchEndDate: batchEndDate,
      FinancialYearId: financialYearId,
      Unscheduled: isElearning ? null : unscheduled,  
      Duration: isElearning ? null : Number(duration),
      TrainingTime: isElearning ? null : trainingTime,
      VenueId: isElearning ? null : Number(selectedVenue),
      BatchIntake: isElearning ? null : Number(batchIntake),
      TrainerNamesId: isElearning ? null : Number(trainer1),
      TrainerNameNewId: isElearning ? null : Number(trainer2),
      TrainerType1: trainerType1,
      TrainerType2: trainerType2,
      ParticipantCategory: participantCategory
    }

    await DashboardOps().insertDashboardData(payload, props);
    Swal.fire('Success', 'Batch created successfully', 'success');
    history.push('/');
  };
  
  return (
    <div className="abg-form-container">
      <div className="abg-form-header">Batch Entry Form</div>
      <div className="abg-form-body">
        <div className="abg-form-row">
          <div className="abg-form-field abg-col-25">
            <label className="abg-form-label">Financial Year</label>
            <span className="abg-form-value">{financialYearText}</span>
          </div>

          <div className="abg-form-field abg-col-25">
            <label className="abg-form-label required">Batch Type</label>
            <select className="abg-form-control" value={batchType} onChange={e => handleBatchTypeChange(e.target.value)}>
              <option value="Classroom">Classroom</option>
              <option value="Elearning">Elearning</option>
            </select>
          </div>
        </div>

        <div className="abg-form-row">
          <div className="abg-form-field abg-col-25">
            <label className="abg-form-label required">Module Name</label>
            <select className="abg-form-control" value={selectedModule?.Id || ""} onChange={e => handleModuleChange(Number(e.target.value))}>
              <option value="">-- Select Module --</option>
              {modules.map(m => <option key={m.Id} value={m.Id}>{m.ModuleName}</option>)}
            </select>
          </div>

          <div className="abg-form-field abg-col-25">
            <label className="abg-form-label">Batch Name</label>
            <span className="abg-form-value">{batchName}</span>
          </div>
        </div>

        <div className="abg-form-row">
          <div className="abg-form-field abg-col-25">
            <label className="abg-form-label required">Level</label>
            <select className="abg-form-control" value={selectedLevel?.Id || ""} onChange={e => handleLevelChange(Number(e.target.value))}>
              <option value="">-- Select Level --</option>
              {levels.map(l => <option key={l.Id} value={l.Id}>{l.LevelName}</option>)}
            </select>
          </div>

          <div className="abg-form-field abg-col-25">
            <label className="abg-form-label required">Batch Start Date</label>
            <input type="date" className="abg-form-control" value={batchStartDate} onChange={e => setBatchStartDate(e.target.value)} />
          </div>
        </div>

        <div className="abg-form-row">
          <div className="abg-form-field abg-col-25">
            <label className="abg-form-label required">Batch End Date</label>
            <input type="date" className="abg-form-control" value={batchEndDate} onChange={e => setBatchEndDate(e.target.value)} />
          </div>

          {!isElearning && (
            <div className="abg-form-field abg-col-25">
              <label className="abg-form-label required">Batch Intake</label>
              <input type="number" className="abg-form-control" value={batchIntake} onChange={e => setBatchIntake(e.target.value)} />
            </div>
          )}
        </div>

        {!isElearning && (
          <>
            <div className="abg-form-row">
              <div className="abg-form-field abg-col-25">
                <label className="abg-form-label required">Venue</label>
                <select className="abg-form-control" value={selectedVenue} onChange={e => setSelectedVenue(e.target.value)}>
                  <option value="">-- Select Venue --</option>
                  {venues.map(v => <option key={v.Id} value={v.Id}>{v.Venue}</option>)}
                </select>
              </div>

              <div className="abg-form-field abg-col-25">
                <label className="abg-form-label required">Duration (Hrs)</label>
                <input type="number" className="abg-form-control" value={duration} onChange={e => setDuration(e.target.value)} />
              </div>
            </div>

            <div className="abg-form-row">
              <div className="abg-form-field abg-col-25">
                <label className="abg-form-label required">Training Time</label>
                <input type="text" className="abg-form-control" value={trainingTime} onChange={e => setTrainingTime(e.target.value)} />
                {/* <select className="abg-form-control" value={trainingTime} onChange={e => setTrainingTime(e.target.value)}>
                  <option value="">-- Select --</option>
                  <option value="1 to 2 pm">1 to 2 pm</option>
                  <option value="10">10</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                  <option value="8.00">8.00</option>
                </select> */}
              </div>

              <div className="abg-form-field abg-col-25">
                <label className="abg-form-label required">Trainer 1</label>
                <select className="abg-form-control" value={trainer1} onChange={e => onTrainer1Change(Number(e.target.value))}>
                  <option value="">-- Select --</option>
                  {trainers.map(t => <option key={t.TrainerNameId} value={t.TrainerNameId}>{t.TrainerName}</option>)}
                </select>
              </div>
            </div>

            <div className="abg-form-row">
              <div className="abg-form-field abg-col-25">
                <label className="abg-form-label">Trainer 2</label>
                <select className="abg-form-control" value={trainer2} onChange={e => onTrainer2Change(Number(e.target.value))}>
                  <option value="">-- Select --</option>
                  {trainers.map(t => <option key={t.TrainerNameId} value={t.TrainerNameId}>{t.TrainerName}</option>)}
                </select>
              </div>

              <div className="abg-form-field abg-col-25">
                <label className="abg-form-label required">Unscheduled</label>
                <select className="abg-form-control" value={unscheduled} onChange={e => setUnscheduled(e.target.value)}>
                  <option value="">-- Select --</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
            </div>
          </>
        )}

        <div className="abg-form-actions">
          <button className="abg-btn abg-btn-primary" onClick={createBatch}>Save</button>
          <button className="abg-btn abg-btn-secondary" onClick={() => history.push('/')}>Cancel</button>
        </div>

      </div>
    </div>
  );
}