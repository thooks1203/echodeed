import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

export default function HomeSimple() {
  const { data: counter } = useQuery({
    queryKey: ['/api/counter'],
    queryFn: () => fetch('/api/counter').then(r => r.json())
  });

  const { data: posts } = useQuery({
    queryKey: ['/api/posts'],
    queryFn: () => fetch('/api/posts').then(r => r.json())
  });

  return (
    <div style={{ 
      maxWidth: '430px', 
      margin: '0 auto', 
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
      padding: '20px'
    }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>✨ EchoDeed Simple</h1>
      
      <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>Global Kindness Counter</h2>
        <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#10B981' }}>
          {counter?.count ? counter.count.toLocaleString() : 'Loading...'}
        </p>
      </div>

      <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px' }}>
        <h2>Recent Acts of Kindness</h2>
        {posts?.slice(0, 3).map((post: any, index: number) => (
          <div key={index} style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
            <p>{post.content}</p>
            <small style={{ color: '#666' }}>{post.category} • {post.location}</small>
          </div>
        )) || <p>Loading kindness posts...</p>}
      </div>
    </div>
  );
}