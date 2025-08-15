import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const NotFound: React.FC = () => {
  return (
    <div style={{ 
      textAlign: 'center', 
      padding: '50px 20px',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <Helmet>
        <meta name="robots" content="noindex,follow" />
        <title>404 Not Found – Travel China</title>
        <link rel="canonical" href="https://www.travelchina.space/404" />
      </Helmet>
      <h1 style={{ fontSize: '72px', margin: '0', color: '#0077be' }}>404</h1>
      <h2 style={{ marginTop: '10px', color: '#333' }}>页面未找到</h2>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        很抱歉，您访问的页面不存在或已被移除。
      </p>
      <Link 
        to="/" 
        style={{
          display: 'inline-block',
          padding: '12px 24px',
          background: '#0077be',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '4px',
          fontWeight: 'bold'
        }}
      >
        返回首页
      </Link>
    </div>
  );
};

export default NotFound; 