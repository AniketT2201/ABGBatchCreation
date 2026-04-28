import React, { useState, useEffect } from 'react';
import { Nav, IconButton } from '@fluentui/react';
import { initializeIcons } from '@fluentui/font-icons-mdl2';
import { INavLinkGroup } from '@fluentui/react';
import { useHistory, useLocation } from 'react-router-dom';
import './CSS/SidebarLightPremium.scss';
import { IAbgBatchCreationProps } from '../IAbgBatchCreationProps';

initializeIcons();

const Sidebar = (props: IAbgBatchCreationProps) => {
  const history = useHistory();
  const location = useLocation();
  const username = props.userDisplayName;

  const [collapsed, setCollapsed] = useState(false);
  const [activeKey, setActiveKey] = useState('TNIDashboardPage');

  // 🔹 Sync active nav with URL
  useEffect(() => {
    setActiveKey(location.pathname.replace('/', '') || 'TNIDashboardPage');
  }, [location.pathname]);

  const navGroups: INavLinkGroup[] = [
    {
      name: 'Employee Training',
      links: [
        // TNI
        { name: 'TNI Dashboard', key: 'TNIDashboardPage', url: '#', iconProps: { iconName: 'Home' } },
        // Batch Creation
        { name: 'Batch Dashboard', key: 'BatchDashboard', url: '#', iconProps: { iconName: 'Home' } },
        // Batch Allocation
        { name: 'Batch Allocation Dashboard', key: 'BatchAllocationDashboard', url: '#', iconProps: { iconName: 'Chart' } },
        // Supervisor
        { name: 'Employee Supervisor Dashboard', key: 'EmployeeSupervisorDashboard', url: '#', iconProps: { iconName: 'Chart' } },
        // Training Coordinator
        { name: 'On Behalf Approval Dashboard', key: 'BehalfApprovalDashboard', url: '#', iconProps: { iconName: 'Chart' } },
        // Attendance
        { name: 'Attendance Dashboard', key: 'AttendanceDashboard', url: '#', iconProps: { iconName: 'Chart' } },
        // Feedback
        { name: 'Training Assessment', key: 'EmployeeFeedback', url: '#', iconProps: { iconName: 'Chart' } },
        // Assessment Dashboard
        { name: 'Assessment Dashboard', key: 'FeedbackDashboard', url: '#', iconProps: { iconName: 'Chart' } },
      ]
    }
  ];

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : 'expanded'}`}>
      <div className="logo-area">
        <div className="logo">
          <img src={require('../../assets/ABGlogo.jpg')} alt="Aditya Birla Logo" />
        </div>
        {!collapsed && (
          <div>
            <div className="brand-title">Aditya Birla</div>
            <div className="brand-subtitle">Employee Training</div>
          </div>
        )}
      </div>
      <div className="sidebar-user">
        <div className="user-avatar">
          <i className="fa fa-user"></i>
        </div>

        {!collapsed && (
          <div className="user-details">
            <div className="user-name">{username}</div>
          </div>
        )}
      </div>

      <Nav
        groups={navGroups}
        selectedKey={activeKey}
        onLinkClick={(ev, item) => {
          ev?.preventDefault();

          if (!item?.key) return;

          if (item.key === 'TNIDashboardPage') {
            history.push('/');
          } else {
            history.push(`/${item.key}`);
          }
        }}
      />

      <IconButton
        iconProps={{ iconName: collapsed ? 'DoubleChevronRight12' : 'DoubleChevronLeft12' }}
        className="toggle-btn"
        onClick={() => setCollapsed(!collapsed)}
      />
    </div>
  );
};

export default Sidebar;
