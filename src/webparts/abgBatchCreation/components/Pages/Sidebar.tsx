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
      name: 'TNI Creation',
      links: [
        { name: 'TNI Dashboard', key: 'TNIDashboardPage', url: '#', iconProps: { iconName: 'Home' } },
        { name: 'ADD Modules', key: 'AddModules', url: '#', iconProps: { iconName: 'Add' } },
        { name: 'TNI Creation Form', key: 'TNICreation', url: '#', iconProps: { iconName: 'Add' } },
      ],
    },
    {
      name: 'Batch Creation',
      links: [
        { name: 'Batch Dashboard', key: 'BatchDashboard', url: '#', iconProps: { iconName: 'Home' } },
        { name: 'Calendar', key: 'Calender', url: '#', iconProps: { iconName: 'Calendar' } },
        { name: 'Create Batch', key: 'BatchForm', url: '#', iconProps: { iconName: 'Add' } },
      ],
    },
    {
      name: 'Batch Allocation',
      links: [
        { name: 'Batch Allocation Dashboard', key: 'BatchAllocationDashboard', url: '#', iconProps: { iconName: 'Chart' } },
        { name: 'Employee Batch Allocation', key: 'EmployeeBatchAllocation', url: '#', iconProps: { iconName: 'Org' } },
        { name: 'View Allocated Employees', key: 'ViewAllocatedEmployee', url: '#', iconProps: { iconName: 'People' } },
      ],
    },
    {
      name: 'Supervisor Dashboard',
      links: [
        { name: 'Employee Supervisor Dashboard', key: 'EmployeeSupervisorDashboard', url: '#', iconProps: { iconName: 'Chart' } },
      ],
    },
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
            <div className="brand-subtitle">ENTERPRISE HUB</div>
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
