import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { selectPolicy, setUserCountry, checkEligibility } from '../store/slices/visaSlice';
import './VisaFree.css';
import { useTranslation } from 'react-i18next';

const VisaFree: React.FC = () => {
  const dispatch = useAppDispatch();
  const { policies, selectedPolicyId, userCountry, isEligible } = useAppSelector(state => state.visa);
  const [showEligibilityCheck, setShowEligibilityCheck] = useState(false);
  const { t } = useTranslation();
  
  const handlePolicySelect = (id: string) => {
    dispatch(selectPolicy(id));
    if (userCountry) {
      dispatch(checkEligibility());
    }
  };
  
  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setUserCountry(e.target.value));
  };
  
  const handleCheckEligibility = () => {
    setShowEligibilityCheck(true);
    dispatch(checkEligibility());
  };
  
  // 常用国家列表
  const commonCountries = [
    'United States', 'United Kingdom', 'Canada', 'Australia', 
    'France', 'Germany', 'Japan', 'South Korea'
  ];
  
  return (
    <>
      <Helmet>
        <title>{t('visaFree.title')} - {t('app.title')}</title>
        <meta name="description" content={`${t('visaFree.subtitle')}. ${t('visaFree.policies.144hour.description')}, ${t('visaFree.policies.72hour.description')}`} />
        <meta name="keywords" content="China visa-free transit, 144-hour visa-free, 72-hour visa-free, China travel tips, Beijing visa-free, Shanghai visa-free, transit visa China, visa exemption" />
      </Helmet>
      <div className="visa-free-container">
        <header className="page-header">
          <h1>免签政策</h1>
          <p>Latest visa-free policies and travel tips</p>
        </header>
        
        <section className="policy-section">
          <h2>最新免签政策</h2>
          <div className="policy-cards">
            {policies.map(policy => (
              <div 
                key={policy.id} 
                className={`policy-card ${selectedPolicyId === policy.id ? 'selected' : ''}`}
                onClick={() => handlePolicySelect(policy.id)}
              >
                <h3>{policy.name}</h3>
                <p>{policy.description}</p>
                <div className="policy-details">
                  <span className="duration">{policy.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
        
        <section className="eligibility-section">
          <h2>检查资格</h2>
          <div className="eligibility-form">
            <div className="form-group">
              <label htmlFor="country-select">选择您的国家:</label>
              <select 
                id="country-select" 
                value={userCountry || ''}
                onChange={handleCountryChange}
              >
                <option value="">-- 选择国家 --</option>
                {commonCountries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
            
            <button 
              className="check-button"
              disabled={!selectedPolicyId || !userCountry}
              onClick={handleCheckEligibility}
            >
              检查资格
            </button>
            
            {showEligibilityCheck && userCountry && selectedPolicyId && (
              <div className={`eligibility-result ${isEligible ? 'eligible' : 'not-eligible'}`}>
                {isEligible 
                  ? `您有资格使用 ${policies.find(p => p.id === selectedPolicyId)?.name} 政策。` 
                  : `抱歉，来自 ${userCountry} 的公民不符合 ${policies.find(p => p.id === selectedPolicyId)?.name} 政策的条件。`}
              </div>
            )}
          </div>
        </section>
        
        <section className="travel-tips">
          <h2>旅行提示</h2>
          <ul className="tips-list">
            <li>提前准备所有必要的文件</li>
            <li>研究目的地城市信息</li>
            <li>规划合理的行程时间</li>
            <li>安排必要的交通</li>
          </ul>
        </section>
      </div>
    </>
  );
};

export default VisaFree;