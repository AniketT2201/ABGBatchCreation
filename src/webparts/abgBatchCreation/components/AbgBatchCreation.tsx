import * as React from 'react';
import styles from './AbgBatchCreation.module.scss';
import type { IAbgBatchCreationProps } from './IAbgBatchCreationProps';
import { escape } from '@microsoft/sp-lodash-subset';
import { HashRouter, Route, Switch } from 'react-router-dom';
import { ParallaxProvider } from 'react-scroll-parallax';
import { DashboardPage } from './Pages/BatchDashboard';
import { CalenderPage } from './Pages/Calender';
import { BatchForm } from './Pages/BatchForm';
import { ViewAllocatedEmployee } from './Pages/ViewAllocatedEmployee';
import { EmployeeBatchAllocation } from './Pages/EmployeeBatchAllocation';
import { BatchAllocationDashboard } from './Pages/BatchAllocationDashboard';
import { EmployeeSupervisorDashboard } from './Pages/EmployeeSupervisorDashboard';
import Sidebar from './Pages/Sidebar';
import { TNIDashboardPage } from './Pages/TNIDashboardPage';
import { AddModules } from './Pages/AddModules';
import { TNICreation } from './Pages/TNICreation';
import { BehalfApprovalDashboard } from './Pages/BehalfApprovalDashboard';
import { AttendanceDashboard } from './Pages/AttendanceDashboard';
import { EmployeeFeedback } from './Pages/EmployeeFeedback';
import { FeedbackDashboard } from './Pages/FeedbackDashboard';

export default class AbgBatchCreation extends React.Component<IAbgBatchCreationProps> {
  public render(): React.ReactElement<IAbgBatchCreationProps> {
    const {
      description,
      isDarkTheme,
      environmentMessage,
      hasTeamsContext,
      userDisplayName
    } = this.props;

    return (
      <section className={`${styles.abgBatchCreation} ${hasTeamsContext ? styles.teams : ''}`}>
        <ParallaxProvider>
          <HashRouter>
            <div style={{ display: 'flex', height: '100vh' }}>
              {/* Sidebar */}
              <Sidebar {...this.props}/>

              {/* Main Content */}
              <div style={{ flex: 1, overflow: 'auto' }}>
                <Switch>
                  <Route path="/BatchDashboard" render={() => <DashboardPage {...this.props} />} />
                  <Route path="/Calender" render={() => <CalenderPage {...this.props} />} />
                  <Route path="/BatchForm" render={() => <BatchForm {...this.props} />} />
                  <Route path="/ViewAllocatedEmployee" render={() => <ViewAllocatedEmployee {...this.props} />} />
                  <Route path="/EmployeeBatchAllocation" render={() => <EmployeeBatchAllocation {...this.props} />} />
                  <Route path="/BatchAllocationDashboard" render={() => <BatchAllocationDashboard {...this.props} />} />
                  <Route path="/EmployeeSupervisorDashboard" render={() => <EmployeeSupervisorDashboard {...this.props} />} />
                  <Route exact path="/" render={() => <TNIDashboardPage {...this.props}/>} />
                  <Route path="/AddModules" render={() => <AddModules {...this.props}/>} />
                  <Route path="/TNICreation" render={() => <TNICreation {...this.props}/>} />
                  <Route path="/BehalfApprovalDashboard" render={() => <BehalfApprovalDashboard {...this.props}/>} />
                  <Route path="/AttendanceDashboard" render={() => <AttendanceDashboard {...this.props}/>} />
                  <Route path="/EmployeeFeedback" render={() => <EmployeeFeedback {...this.props}/>} />
                  <Route path="/FeedbackDashboard" render={() => <FeedbackDashboard {...this.props}/>} />
                </Switch>
              </div>
            </div>
          </HashRouter>
        </ParallaxProvider>
      </section>
    );
  }
}
