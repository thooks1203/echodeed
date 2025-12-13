import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { canAccessSchoolsDashboard } from "@/lib/roleUtils";
import { featureFlags } from "@shared/featureFlags";
import { useSchoolLevel } from "@/hooks/useSchoolLevel";
import { HeartLinkButton } from "@/components/HeartLinkButton";

interface LeftSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function LeftSidebar({ activeTab, onTabChange }: LeftSidebarProps) {
  const { user } = useAuth();
  const { schoolLevel } = useSchoolLevel();
  const isMiddleSchool = schoolLevel === 'middle_school';
  
  const baseTabs = [
    { id: 'feed', label: 'Feed', icon: '🏠' },
  ];

  const allStudentTabs = [
    { id: 'mentor-dashboard', label: 'Mentor', icon: '🌟' },
    { id: 'student-dashboard', label: 'Dashboard', icon: '👨‍🎓' },
    { id: 'summer', label: 'Summer', icon: '🏖️' },
    { id: 'community-service', label: isMiddleSchool ? 'Kindness' : 'Service', icon: isMiddleSchool ? '💝' : '🏥' },
    { id: 'support', label: 'Support', icon: '💜' },
    { id: 'rewards', label: 'Rewards', icon: '🔥' },
  ];

  const studentTabs = allStudentTabs.filter(tab => {
    if (tab.id === 'summer') {
      return featureFlags.summerChallenges;
    }
    if (tab.id === 'support') {
      return featureFlags.supportCircle;
    }
    return true;
  });

  const allTeacherTabs = [
    { id: 'feed', label: 'Feed', icon: '🏠' },
    { id: 'teacher-dashboard', label: 'Dashboard', icon: '👩‍🏫' },
    { id: 'community-service', label: isMiddleSchool ? 'Activities' : 'Service', icon: isMiddleSchool ? '💝' : '🏥' },
    { id: 'reports', label: 'Reports', icon: '📊' },
    { id: 'support', label: 'Support', icon: '💜' },
    { id: 'rewards', label: 'Rewards', icon: '🔥' },
  ];
  
  const teacherTabs = allTeacherTabs.filter(tab => {
    if (tab.id === 'support') {
      return featureFlags.supportCircle;
    }
    return true;
  });

  const allParentTabs = [
    { id: 'parent-dashboard', label: 'Parent', icon: '👨‍👩‍👧‍👦' },
    { id: 'family-dashboard', label: 'Family', icon: '🎯' },
    { id: 'community-service', label: isMiddleSchool ? 'Kindness' : 'Service', icon: isMiddleSchool ? '💝' : '🏥' },
    { id: 'support', label: 'Support', icon: '💜' },
    { id: 'rewards', label: 'Rewards', icon: '🔥' },
  ];
  
  const parentTabs = allParentTabs.filter(tab => {
    if (tab.id === 'support') {
      return featureFlags.supportCircle;
    }
    return true;
  });

  if (!user) {
    const signInTabs = [{ id: 'sign-in', label: 'Sign In', icon: '👤' }];
    return (
      <div className="hidden md:flex" style={{
        position: 'fixed',
        left: 0,
        top: 0,
        height: '100vh',
        width: '80px',
        background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
        backdropFilter: 'blur(12px)',
        boxShadow: '4px 0 20px rgba(0,0,0,0.15)',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: '20px',
        gap: '12px',
        zIndex: 100
      }}>
        <button 
          key="sign-in"
          onClick={() => onTabChange('sign-in')}
          style={{
            background: activeTab === 'sign-in' 
              ? 'linear-gradient(135deg, #ff6b6b, #feca57)' 
              : 'rgba(255,255,255,0.2)',
            border: activeTab === 'sign-in' ? '2px solid #fff' : '2px solid transparent',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            padding: '12px 8px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: '600',
            color: '#fff',
            textShadow: '0 1px 2px rgba(0,0,0,0.3)',
            width: '64px',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 12px rgba(255,107,107,0.4)'
          }}
          data-testid="button-nav-sign-in"
        >
          <span style={{ fontSize: '20px' }}>👤</span>
          <span style={{ fontSize: '10px', fontWeight: '700', textAlign: 'center' }}>Sign In</span>
        </button>
      </div>
    );
  }

  let tabs;
  if (user?.schoolRole === 'parent') {
    tabs = parentTabs;
  } else if (canAccessSchoolsDashboard(user?.schoolRole || 'student')) {
    tabs = teacherTabs;
  } else {
    tabs = [...baseTabs, ...studentTabs];
  }

  const filteredTabs = tabs;

  return (
    <div className="hidden md:flex" style={{
      position: 'fixed',
      left: 0,
      top: 0,
      height: '100vh',
      width: '80px',
      background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
      backdropFilter: 'blur(12px)',
      boxShadow: '4px 0 20px rgba(0,0,0,0.15)',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: '20px',
      gap: '12px',
      zIndex: 100,
      overflowY: 'auto'
    }}>
      {filteredTabs.map((tab) => (
        <button 
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          style={{
            background: activeTab === tab.id 
              ? 'linear-gradient(135deg, #ff6b6b, #feca57)' 
              : 'rgba(255,255,255,0.2)',
            border: activeTab === tab.id ? '2px solid #fff' : '2px solid transparent',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            padding: '12px 8px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: '600',
            color: '#fff',
            textShadow: activeTab === tab.id ? '0 1px 2px rgba(0,0,0,0.3)' : '0 1px 2px rgba(0,0,0,0.2)',
            width: '64px',
            transition: 'all 0.3s ease',
            boxShadow: activeTab === tab.id 
              ? '0 4px 12px rgba(255,107,107,0.4)' 
              : '0 2px 4px rgba(0,0,0,0.1)'
          }}
          data-testid={`button-nav-${tab.id}`}
          onMouseEnter={(e) => {
            if (activeTab !== tab.id) {
              (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.3)';
              (e.target as HTMLElement).style.transform = 'scale(1.05)';
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== tab.id) {
              (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.2)';
              (e.target as HTMLElement).style.transform = 'scale(1)';
            }
          }}
        >
          <span style={{ 
            fontSize: '24px',
            filter: activeTab === tab.id ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' : 'none'
          }}>
            {tab.icon}
          </span>
          <span style={{
            fontSize: '10px',
            letterSpacing: '0.3px',
            fontWeight: '700',
            whiteSpace: 'nowrap',
            lineHeight: '1.2',
            textAlign: 'center'
          }}>
            {tab.label}
          </span>
        </button>
      ))}
      
      {/* Spacer to push buttons to bottom */}
      <div style={{ flexGrow: 1 }} />
      
      {/* Need Support Button - in sidebar */}
      <HeartLinkButton position="bottom-left" />
      
      {/* Donate to Student Wellness Fund Button */}
      <a
        href="https://www.allegacy.org/community"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
          border: '2px solid rgba(255,255,255,0.3)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          cursor: 'pointer',
          padding: '10px 8px',
          borderRadius: '8px',
          fontSize: '12px',
          fontWeight: '600',
          color: '#fff',
          textShadow: '0 1px 2px rgba(0,0,0,0.3)',
          width: '64px',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 12px rgba(245,158,11,0.4)',
          textDecoration: 'none',
          marginBottom: '16px'
        }}
        data-testid="button-donate-wellness-fund"
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)';
          (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 16px rgba(245,158,11,0.5)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
          (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(245,158,11,0.4)';
        }}
      >
        <span style={{ fontSize: '22px' }}>💛</span>
        <span style={{
          fontSize: '9px',
          letterSpacing: '0.2px',
          fontWeight: '700',
          whiteSpace: 'nowrap',
          lineHeight: '1.1',
          textAlign: 'center'
        }}>
          Donate
        </span>
      </a>
    </div>
  );
}
