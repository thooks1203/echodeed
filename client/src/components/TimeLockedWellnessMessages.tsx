import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, Send, Lock, Unlock, Calendar, Users, Mail, Heart, Timer, Target, Gift, Zap } from 'lucide-react';

interface TimeLockedMessage {
  id: string;
  subject: string;
  content: string;
  senderName: string;
  senderAvatar: string;
  recipientType: 'individual' | 'team' | 'department' | 'company';
  recipients: string[];
  recipientCount: number;
  scheduledDate: string;
  unlockDate: string;
  createdDate: string;
  category: 'milestone' | 'encouragement' | 'celebration' | 'wellness-tip' | 'appreciation' | 'motivation';
  triggerEvent?: 'work-anniversary' | 'project-completion' | 'wellness-goal' | 'team-achievement' | 'custom-date';
  status: 'scheduled' | 'delivered' | 'read' | 'expired';
  deliveryMethod: 'notification' | 'email' | 'dashboard' | 'all';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isEncrypted: boolean;
  unlockCount: number;
  totalRecipients: number;
  engagementScore: number; // 0-100 based on responses and reactions
  impactMetrics: {
    opened: number;
    responded: number;
    shared: number;
    positiveReactions: number;
  };
  tags: string[];
  attachments?: string[];
}

interface MessageStats {
  totalMessages: number;
  scheduledMessages: number;
  deliveredMessages: number;
  averageEngagement: number;
  mostSuccessfulCategory: string;
  upcomingDeliveries: number;
}

interface QuickTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  content: string;
  suggestedTiming: string;
  popularity: number;
  icon: string;
}

export function TimeLockedWellnessMessages() {
  const [selectedTab, setSelectedTab] = useState<'create' | 'scheduled' | 'delivered' | 'templates'>('create');
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState({
    subject: '',
    content: '',
    recipients: [],
    unlockDate: '',
    category: 'encouragement',
    priority: 'medium',
    deliveryMethod: 'all',
    triggerEvent: '',
    tags: []
  });
  
  const queryClient = useQueryClient();

  // Fetch scheduled messages
  const { data: scheduledMessages, isLoading } = useQuery<TimeLockedMessage[]>({
    queryKey: ['/api/messages/scheduled'],
    refetchInterval: 30000,
  });

  // Fetch delivered messages
  const { data: deliveredMessages } = useQuery<TimeLockedMessage[]>({
    queryKey: ['/api/messages/delivered'],
    refetchInterval: 60000,
  });

  // Fetch message stats
  const { data: stats } = useQuery<MessageStats>({
    queryKey: ['/api/messages/stats'],
    refetchInterval: 60000,
  });

  // Fetch quick templates
  const { data: templates } = useQuery<QuickTemplate[]>({
    queryKey: ['/api/messages/templates'],
  });

  // Create message mutation
  const createMessage = useMutation({
    mutationFn: async (messageData: any) => {
      const response = await fetch('/api/messages/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(messageData),
      });
      if (!response.ok) throw new Error('Failed to create message');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages/scheduled'] });
      queryClient.invalidateQueries({ queryKey: ['/api/messages/stats'] });
      // Reset form
      setNewMessage({
        subject: '',
        content: '',
        recipients: [],
        unlockDate: '',
        category: 'encouragement',
        priority: 'medium',
        deliveryMethod: 'all',
        triggerEvent: '',
        tags: []
      });
    }
  });

  if (isLoading) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(147,51,234,0.1) 100%)',
        border: '1px solid rgba(59,130,246,0.2)',
        borderRadius: '12px',
        padding: '24px',
        textAlign: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <span style={{ fontSize: '24px' }}>⏰</span>
          <span style={{ fontSize: '18px', fontWeight: '600' }}>Loading Time-Locked Messages...</span>
        </div>
      </div>
    );
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'milestone': return '🏆';
      case 'encouragement': return '💪';
      case 'celebration': return '🎉';
      case 'wellness-tip': return '🌟';
      case 'appreciation': return '❤️';
      case 'motivation': return '⚡';
      default: return '💌';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#EF4444';
      case 'high': return '#F59E0B';
      case 'medium': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return '#3B82F6';
      case 'delivered': return '#22C55E';
      case 'read': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const formatTimeRemaining = (unlockDate: string) => {
    const now = new Date();
    const unlock = new Date(unlockDate);
    const diff = unlock.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ready to unlock';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    return `${hours}h remaining`;
  };

  const tabs = [
    { id: 'create', name: 'Create Message', icon: '✉️', count: null },
    { id: 'scheduled', name: 'Scheduled', icon: '⏰', count: scheduledMessages?.length || 0 },
    { id: 'delivered', name: 'Delivered', icon: '📬', count: deliveredMessages?.length || 0 },
    { id: 'templates', name: 'Templates', icon: '📋', count: templates?.length || 0 }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ 
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(59,130,246,0.05) 0%, rgba(147,51,234,0.05) 100%)',
        padding: '24px',
        borderRadius: '12px',
        border: '1px solid rgba(59,130,246,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
          <span style={{ fontSize: '32px' }}>⏰</span>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', margin: 0, color: '#3B82F6' }}>
              Time-Locked Wellness Messages
            </h2>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
              Schedule encouraging messages for future delivery to boost team morale
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px', marginBottom: '16px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#3B82F6' }}>
                {stats.totalMessages}
              </div>
              <div style={{ fontSize: '11px', color: '#6b7280' }}>Total Messages</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#F59E0B' }}>
                {stats.scheduledMessages}
              </div>
              <div style={{ fontSize: '11px', color: '#6b7280' }}>Scheduled</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#22C55E' }}>
                {stats.deliveredMessages}
              </div>
              <div style={{ fontSize: '11px', color: '#6b7280' }}>Delivered</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#8B5CF6' }}>
                {stats.averageEngagement}%
              </div>
              <div style={{ fontSize: '11px', color: '#6b7280' }}>Avg Engagement</div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              style={{
                padding: '10px 16px',
                borderRadius: '20px',
                border: 'none',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: selectedTab === tab.id ? '#3B82F6' : 'white',
                color: selectedTab === tab.id ? 'white' : '#6b7280',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              data-testid={`tab-${tab.id}`}
            >
              <span>{tab.icon}</span>
              {tab.name}
              {tab.count !== null && (
                <span style={{ 
                  backgroundColor: selectedTab === tab.id ? 'rgba(255,255,255,0.2)' : '#f3f4f6',
                  color: selectedTab === tab.id ? 'white' : '#6b7280',
                  padding: '2px 6px', 
                  borderRadius: '10px', 
                  fontSize: '12px' 
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        overflow: 'hidden'
      }}>
        {/* Create Message Tab */}
        {selectedTab === 'create' && (
          <>
            <div style={{ 
              background: '#f9fafb', 
              padding: '16px', 
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Send size={16} style={{ color: '#3B82F6' }} />
              <span style={{ fontWeight: '600', fontSize: '14px', color: '#374151' }}>
                Compose Time-Locked Message
              </span>
            </div>
            
            <div style={{ padding: '24px' }}>
              <form onSubmit={(e) => {
                e.preventDefault();
                createMessage.mutate(newMessage);
              }}>
                {/* Subject Line */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                    Subject Line
                  </label>
                  <input
                    type="text"
                    value={newMessage.subject}
                    onChange={(e) => setNewMessage(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Your encouraging message title..."
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.2s ease'
                    }}
                    required
                    data-testid="input-subject"
                  />
                </div>

                {/* Message Content */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                    Message Content
                  </label>
                  <textarea
                    value={newMessage.content}
                    onChange={(e) => setNewMessage(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Write your inspiring wellness message that will be delivered at the perfect moment..."
                    rows={6}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      fontSize: '14px',
                      outline: 'none',
                      resize: 'vertical',
                      minHeight: '120px'
                    }}
                    required
                    data-testid="textarea-content"
                  />
                </div>

                {/* Configuration Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                  {/* Category */}
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                      Message Category
                    </label>
                    <select
                      value={newMessage.category}
                      onChange={(e) => setNewMessage(prev => ({ ...prev, category: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #d1d5db',
                        fontSize: '14px',
                        outline: 'none',
                        backgroundColor: 'white'
                      }}
                      data-testid="select-category"
                    >
                      <option value="encouragement">💪 Encouragement</option>
                      <option value="milestone">🏆 Milestone</option>
                      <option value="celebration">🎉 Celebration</option>
                      <option value="wellness-tip">🌟 Wellness Tip</option>
                      <option value="appreciation">❤️ Appreciation</option>
                      <option value="motivation">⚡ Motivation</option>
                    </select>
                  </div>

                  {/* Unlock Date */}
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                      Unlock Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={newMessage.unlockDate}
                      onChange={(e) => setNewMessage(prev => ({ ...prev, unlockDate: e.target.value }))}
                      min={new Date().toISOString().slice(0, 16)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #d1d5db',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                      required
                      data-testid="input-unlock-date"
                    />
                  </div>

                  {/* Priority */}
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                      Priority Level
                    </label>
                    <select
                      value={newMessage.priority}
                      onChange={(e) => setNewMessage(prev => ({ ...prev, priority: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #d1d5db',
                        fontSize: '14px',
                        outline: 'none',
                        backgroundColor: 'white'
                      }}
                      data-testid="select-priority"
                    >
                      <option value="low">🟢 Low Priority</option>
                      <option value="medium">🟡 Medium Priority</option>
                      <option value="high">🟠 High Priority</option>
                      <option value="urgent">🔴 Urgent</option>
                    </select>
                  </div>
                </div>

                {/* Advanced Options */}
                <div style={{ 
                  background: '#f8fafc', 
                  padding: '16px', 
                  borderRadius: '8px', 
                  marginBottom: '24px',
                  border: '1px solid #e2e8f0'
                }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', margin: '0 0 12px 0' }}>
                    Advanced Delivery Options
                  </h4>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                    {/* Delivery Method */}
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                        Delivery Method
                      </label>
                      <select
                        value={newMessage.deliveryMethod}
                        onChange={(e) => setNewMessage(prev => ({ ...prev, deliveryMethod: e.target.value }))}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: '6px',
                          border: '1px solid #d1d5db',
                          fontSize: '13px',
                          outline: 'none',
                          backgroundColor: 'white'
                        }}
                      >
                        <option value="all">📱 All Methods</option>
                        <option value="notification">🔔 Push Notification</option>
                        <option value="email">📧 Email Only</option>
                        <option value="dashboard">📊 Dashboard Only</option>
                      </select>
                    </div>

                    {/* Trigger Event */}
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                        Trigger Event (Optional)
                      </label>
                      <select
                        value={newMessage.triggerEvent}
                        onChange={(e) => setNewMessage(prev => ({ ...prev, triggerEvent: e.target.value }))}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: '6px',
                          border: '1px solid #d1d5db',
                          fontSize: '13px',
                          outline: 'none',
                          backgroundColor: 'white'
                        }}
                      >
                        <option value="">⏰ Date-Based</option>
                        <option value="work-anniversary">🎂 Work Anniversary</option>
                        <option value="project-completion">✅ Project Completion</option>
                        <option value="wellness-goal">🎯 Wellness Goal</option>
                        <option value="team-achievement">🏆 Team Achievement</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    style={{
                      background: 'transparent',
                      color: '#6b7280',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      padding: '10px 20px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                    onClick={() => setNewMessage({
                      subject: '',
                      content: '',
                      recipients: [],
                      unlockDate: '',
                      category: 'encouragement',
                      priority: 'medium',
                      deliveryMethod: 'all',
                      triggerEvent: '',
                      tags: []
                    })}
                  >
                    Clear Form
                  </button>
                  <button
                    type="submit"
                    disabled={createMessage.isPending || !newMessage.subject || !newMessage.content || !newMessage.unlockDate}
                    style={{
                      background: createMessage.isPending ? '#9CA3AF' : '#3B82F6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px 20px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: createMessage.isPending ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    data-testid="button-schedule-message"
                  >
                    {createMessage.isPending ? (
                      <>
                        <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                        Scheduling...
                      </>
                    ) : (
                      <>
                        <Clock size={16} />
                        Schedule Message
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </>
        )}

        {/* Scheduled Messages Tab */}
        {selectedTab === 'scheduled' && (
          <>
            <div style={{ 
              background: '#f9fafb', 
              padding: '16px', 
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Clock size={16} style={{ color: '#F59E0B' }} />
              <span style={{ fontWeight: '600', fontSize: '14px', color: '#374151' }}>
                Scheduled for Future Delivery
              </span>
            </div>
            
            <div style={{ padding: '20px' }}>
              {scheduledMessages && scheduledMessages.length > 0 ? (
                <div style={{ display: 'grid', gap: '16px' }}>
                  {scheduledMessages.map((message) => (
                    <div
                      key={message.id}
                      onClick={() => setSelectedMessage(selectedMessage === message.id ? null : message.id)}
                      style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        padding: '20px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        background: selectedMessage === message.id ? '#fef7ff' : 'white',
                        borderColor: selectedMessage === message.id ? '#8B5CF6' : '#e5e7eb'
                      }}
                      data-testid={`message-${message.id}`}
                    >
                      {/* Message Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span style={{ fontSize: '16px' }}>{getCategoryIcon(message.category)}</span>
                            <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: '#1f2937' }}>
                              {message.subject}
                            </h3>
                            <span style={{
                              backgroundColor: getPriorityColor(message.priority) + '20',
                              color: getPriorityColor(message.priority),
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: '700'
                            }}>
                              {message.priority.toUpperCase()}
                            </span>
                          </div>
                          <p style={{ fontSize: '12px', color: '#6b7280', margin: 0, lineHeight: 1.4 }}>
                            To {message.recipientCount} recipients • {message.category}
                          </p>
                        </div>
                        <div style={{
                          textAlign: 'right'
                        }}>
                          <div style={{ 
                            fontSize: '12px', 
                            fontWeight: '600', 
                            color: '#F59E0B',
                            marginBottom: '2px'
                          }}>
                            {formatTimeRemaining(message.unlockDate)}
                          </div>
                          <div style={{ fontSize: '11px', color: '#6b7280' }}>
                            {new Date(message.unlockDate).toLocaleDateString()} at {new Date(message.unlockDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </div>
                        </div>
                      </div>

                      {/* Message Preview */}
                      <div style={{ 
                        background: '#f8fafc', 
                        padding: '12px', 
                        borderRadius: '8px', 
                        marginBottom: '12px',
                        border: '1px solid #e2e8f0'
                      }}>
                        <p style={{ 
                          fontSize: '13px', 
                          color: '#374151', 
                          margin: 0, 
                          lineHeight: 1.5,
                          display: '-webkit-box',
                          WebkitLineClamp: selectedMessage === message.id ? 'none' : 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: selectedMessage === message.id ? 'visible' : 'hidden'
                        }}>
                          {message.content}
                        </p>
                      </div>

                      {/* Status Indicators */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Lock size={12} style={{ color: '#8B5CF6' }} />
                            <span style={{ fontSize: '11px', color: '#6b7280' }}>Encrypted & Locked</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Users size={12} style={{ color: '#3B82F6' }} />
                            <span style={{ fontSize: '11px', color: '#6b7280' }}>{message.recipientCount} recipients</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: getStatusColor(message.status)
                          }}></div>
                          <span style={{ fontSize: '11px', color: '#6b7280', textTransform: 'capitalize' }}>
                            {message.status}
                          </span>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {selectedMessage === message.id && (
                        <div style={{
                          marginTop: '16px',
                          paddingTop: '16px',
                          borderTop: '1px solid #e5e7eb'
                        }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                            <div>
                              <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: '600' }}>Delivery Method</div>
                              <div style={{ fontSize: '12px', color: '#374151' }}>{message.deliveryMethod}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: '600' }}>Created</div>
                              <div style={{ fontSize: '12px', color: '#374151' }}>
                                {new Date(message.createdDate).toLocaleDateString()}
                              </div>
                            </div>
                            <div>
                              <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: '600' }}>Trigger Event</div>
                              <div style={{ fontSize: '12px', color: '#374151' }}>
                                {message.triggerEvent ? message.triggerEvent.replace('-', ' ') : 'Date-based'}
                              </div>
                            </div>
                          </div>
                          
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button
                              style={{
                                background: '#f3f4f6',
                                color: '#374151',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                padding: '6px 12px',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer'
                              }}
                            >
                              Edit
                            </button>
                            <button
                              style={{
                                background: '#EF4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '6px 12px',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer'
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                  <span style={{ fontSize: '48px', marginBottom: '16px', display: 'block' }}>⏰</span>
                  <p>No scheduled messages yet.</p>
                  <p style={{ fontSize: '14px', marginTop: '8px' }}>
                    Create your first time-locked wellness message to inspire your team!
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Delivered Messages Tab */}
        {selectedTab === 'delivered' && (
          <>
            <div style={{ 
              background: '#f9fafb', 
              padding: '16px', 
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Unlock size={16} style={{ color: '#22C55E' }} />
              <span style={{ fontWeight: '600', fontSize: '14px', color: '#374151' }}>
                Successfully Delivered Messages
              </span>
            </div>
            
            <div style={{ padding: '20px' }}>
              {deliveredMessages && deliveredMessages.length > 0 ? (
                <div style={{ display: 'grid', gap: '16px' }}>
                  {deliveredMessages.map((message) => (
                    <div
                      key={message.id}
                      style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '16px',
                        background: 'white'
                      }}
                      data-testid={`delivered-${message.id}`}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span style={{ fontSize: '16px' }}>{getCategoryIcon(message.category)}</span>
                            <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: '#1f2937' }}>
                              {message.subject}
                            </h3>
                            <span style={{
                              backgroundColor: '#22C55E20',
                              color: '#22C55E',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: '700'
                            }}>
                              DELIVERED
                            </span>
                          </div>
                          <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                            Delivered to {message.recipientCount} recipients • {message.engagementScore}% engagement
                          </p>
                        </div>
                        <div style={{ textAlign: 'right', fontSize: '11px', color: '#6b7280' }}>
                          Delivered {new Date(message.unlockDate).toLocaleDateString()}
                        </div>
                      </div>

                      {/* Impact Metrics */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '8px', marginTop: '12px' }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '14px', fontWeight: '700', color: '#3B82F6' }}>
                            {message.impactMetrics.opened}
                          </div>
                          <div style={{ fontSize: '10px', color: '#6b7280' }}>Opened</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '14px', fontWeight: '700', color: '#22C55E' }}>
                            {message.impactMetrics.responded}
                          </div>
                          <div style={{ fontSize: '10px', color: '#6b7280' }}>Responded</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '14px', fontWeight: '700', color: '#8B5CF6' }}>
                            {message.impactMetrics.shared}
                          </div>
                          <div style={{ fontSize: '10px', color: '#6b7280' }}>Shared</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '14px', fontWeight: '700', color: '#F59E0B' }}>
                            {message.impactMetrics.positiveReactions}
                          </div>
                          <div style={{ fontSize: '10px', color: '#6b7280' }}>Reactions</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                  <span style={{ fontSize: '48px', marginBottom: '16px', display: 'block' }}>📬</span>
                  <p>No messages delivered yet.</p>
                  <p style={{ fontSize: '14px', marginTop: '8px' }}>
                    Your scheduled messages will appear here after delivery.
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Templates Tab */}
        {selectedTab === 'templates' && (
          <>
            <div style={{ 
              background: '#f9fafb', 
              padding: '16px', 
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Mail size={16} style={{ color: '#8B5CF6' }} />
              <span style={{ fontWeight: '600', fontSize: '14px', color: '#374151' }}>
                Message Templates
              </span>
            </div>
            
            <div style={{ padding: '20px' }}>
              {templates && templates.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '16px',
                        background: 'white',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onClick={() => {
                        setNewMessage(prev => ({
                          ...prev,
                          subject: template.title,
                          content: template.content,
                          category: template.category as any
                        }));
                        setSelectedTab('create');
                      }}
                      data-testid={`template-${template.id}`}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '20px' }}>{template.icon}</span>
                        <h3 style={{ fontSize: '14px', fontWeight: '600', margin: 0, color: '#1f2937' }}>
                          {template.title}
                        </h3>
                        <span style={{
                          backgroundColor: '#f0f9ff',
                          color: '#1e40af',
                          padding: '2px 6px',
                          borderRadius: '10px',
                          fontSize: '10px',
                          fontWeight: '600'
                        }}>
                          {template.popularity}% use
                        </span>
                      </div>
                      <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
                        {template.description}
                      </p>
                      <div style={{ fontSize: '11px', color: '#8B5CF6', fontWeight: '600' }}>
                        Suggested: {template.suggestedTiming}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                  <span style={{ fontSize: '48px', marginBottom: '16px', display: 'block' }}>📋</span>
                  <p>No templates available.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Real-time indicator */}
      <div style={{ 
        textAlign: 'center', 
        fontSize: '12px', 
        color: '#6b7280',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px'
      }}>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: '#3B82F6',
          animation: 'pulse 2s infinite'
        }}></div>
        Encrypted time-locked messages • Future wellness delivery
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `
      }} />
    </div>
  );
}