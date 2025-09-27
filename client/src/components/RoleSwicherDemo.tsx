import { useState } from 'react';
import { switchDemoRole, getDemoRoles } from '@/hooks/useAuth';
import { useAuth } from '@/hooks/useAuth';

export function RoleSwitcherDemo() {
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const demoRoles = getDemoRoles();

  // Don't render if no user is authenticated
  if (!isAuthenticated || !user) {
    return null;
  }

  const handleSignOut = () => {
    localStorage.removeItem('echodeed_demo_role');
    window.location.href = '/?show=roles'; // Redirect to landing page instead of reload
  };

  return (
    <div style={{ position: 'fixed', top: '10px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000 }}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        style={{
          background: '#7C3AED',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '8px 12px',
          fontSize: '12px',
          fontWeight: '600',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
        data-testid="role-switcher-demo"
      >
        🔒 {user.name} ({user.schoolRole?.toUpperCase() || 'UNKNOWN'})
      </button>

      {showDropdown && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginTop: '4px',
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          border: '1px solid #E5E7EB',
          minWidth: '280px',
          zIndex: 1001
        }}>
          <div style={{ 
            padding: '12px', 
            borderBottom: '1px solid #E5E7EB',
            fontSize: '14px',
            fontWeight: '600',
            color: '#374151'
          }}>
            Demo: Switch User Role
          </div>
          
          {demoRoles.map((roleOption) => (
            <button
              key={roleOption.role}
              onClick={() => {
                console.log('🔄 Role button clicked:', roleOption.role, roleOption.label);
                try {
                  switchDemoRole(roleOption.role);
                  setShowDropdown(false);
                } catch (error) {
                  console.error('❌ Error switching role:', error);
                }
              }}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '12px',
                border: 'none',
                background: user?.schoolRole === roleOption.role ? '#F3F4F6' : 'transparent',
                cursor: 'pointer',
                fontSize: '13px',
                borderTop: 'none'
              }}
              data-testid={`switch-to-${roleOption.role}`}
            >
              <div style={{ 
                fontWeight: '600', 
                color: user?.schoolRole === roleOption.role ? '#7C3AED' : '#374151',
                marginBottom: '2px'
              }}>
                {user?.schoolRole === roleOption.role ? '✓ ' : ''}{roleOption.label}
              </div>
              <div style={{ fontSize: '11px', color: '#6B7280' }}>
                {roleOption.description}
              </div>
            </button>
          ))}
          
          <div style={{ borderTop: '1px solid #E5E7EB' }}>
            <button
              onClick={handleSignOut}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '12px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: '13px',
                color: '#DC2626',
                fontWeight: '600'
              }}
              data-testid="sign-out-button"
            >
              🚪 Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}