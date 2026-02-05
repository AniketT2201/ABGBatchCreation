import * as React from 'react';
import './CSS/sidebar.scss';
import {
  Home24Regular,
  ChartMultiple24Regular,
  Folder24Regular,
  TaskListAdd24Regular,
  Chat24Regular,
  Settings24Regular,
  SignOut24Regular
} from '@fluentui/react-icons';

interface ISidebarItem {
  key: string;
  label: string;
  icon: JSX.Element;
}

const navItems: ISidebarItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: <Home24Regular /> },
  { key: 'analytics', label: 'Analytics', icon: <ChartMultiple24Regular /> },
  { key: 'projects', label: 'Projects', icon: <Folder24Regular /> },
  { key: 'tasks', label: 'Tasks', icon: <TaskListAdd24Regular /> },
  { key: 'messages', label: 'Messages', icon: <Chat24Regular /> },
  { key: 'settings', label: 'Settings', icon: <Settings24Regular /> }
];

export const Sidebar: React.FC = () => {
  const [active, setActive] = React.useState<string>('dashboard');

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="logo">
        <span>X</span>
      </div>

      {/* Profile */}
      <div className="profile">
        <img
          src="https://i.pravatar.cc/100?img=12"
          alt="User"
        />
        <div>
          <strong>Alex Johnson</strong>
          <span>Admin</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="nav">
        {navItems.map(item => (
          <button
            key={item.key}
            className={`navItem ${active === item.key ? 'active' : ''}`}
            onClick={() => setActive(item.key)}
          >
            <span className="icon">{item.icon}</span>
            <span className="label">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div className="logout">
        <button>
          <SignOut24Regular />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
