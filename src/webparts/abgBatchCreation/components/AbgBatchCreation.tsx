import * as React from 'react';
import styles from './AbgBatchCreation.module.scss';
import type { IAbgBatchCreationProps } from './IAbgBatchCreationProps';
import { escape } from '@microsoft/sp-lodash-subset';
import { HashRouter, Route, Switch } from 'react-router-dom';
import { ParallaxProvider } from 'react-scroll-parallax';
import { DashboardPage } from '../components/Pages/Dashboard';
import { CalenderPage } from './Pages/Calender';
import { BatchForm } from './Pages/BatchForm';

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
            <React.Suspense fallback={<></>}>
              <Switch>
                <Route exact path="/" render={() => <DashboardPage {...this.props} />} />
                <Route path="/Calender" render={() => <CalenderPage {...this.props} />} />
                <Route path="/BatchForm" render={() => <BatchForm {...this.props} />} />
              </Switch>
            </React.Suspense>
          </HashRouter>
        </ParallaxProvider>
      </section>
    );
  }
}
