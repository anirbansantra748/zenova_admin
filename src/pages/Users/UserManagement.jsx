import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  UserPlus, 
  Mail, 
  Calendar,
  ShieldAlert,
  CheckCircle2
} from 'lucide-react';
import { mockUsers } from '../../utils/mockData';
import './UserManagement.css';

const UserManagement = () => {
  return (
    <div className="users-page animate-fade-in">
      <header className="page-header">
        <div>
          <h1>User Management</h1>
          <p>View, manage and monitor Zenova platform users.</p>
        </div>
        <button className="primary-btn">
          <UserPlus size={18} />
          <span>Add User</span>
        </button>
      </header>

      {/* Controls */}
      <div className="table-controls glass">
        <div className="search-bar">
          <Search size={18} />
          <input type="text" placeholder="Search by name, email or phone..." />
        </div>
        <div className="filter-actions">
          <button className="filter-btn">
            <Filter size={16} />
            <span>Filter</span>
          </button>
          <select className="role-select">
            <option>All Roles</option>
            <option>Super Admin</option>
            <option>Admin</option>
            <option>User</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="table-container glass">
        <table className="users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last Active</th>
              <th>Joined Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {mockUsers.map(user => (
              <tr key={user.id}>
                <td>
                  <div className="user-cell">
                    <div className="avatar-small">{user.fullName.charAt(0)}</div>
                    <div className="user-details">
                      <span className="name">{user.fullName}</span>
                      <span className="email">{user.email}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`role-badge ${user.role.toLowerCase()}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <span className={`status-pill ${user.status.toLowerCase()}`}>
                    {user.status === 'Active' ? <CheckCircle2 size={12} /> : <ShieldAlert size={12} />}
                    {user.status}
                  </span>
                </td>
                <td>
                  <div className="active-time">
                    <Calendar size={12} />
                    <span>{user.lastActive}</span>
                  </div>
                </td>
                <td>{user.joined}</td>
                <td>
                  <button className="action-dots">
                    <MoreVertical size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="table-footer">
          <p>Showing 1 to 6 of 12,482 entries</p>
          <div className="pagination">
            <button disabled>Previous</button>
            <button className="active">1</button>
            <button>2</button>
            <button>3</button>
            <span>...</span>
            <button>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
