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
          <h1>{t('visaFree.title')}</h1>
          <p>{t('visaFree.subtitle')}</p>
        </header>
        
        <section className="policy-section">
          <h2>{t('visaFree.policies.title')}</h2>
          <div className="policy-cards">
            {policies.map(policy => (
              <div 
                key={policy.id} 
                className={`policy-card ${selectedPolicyId === policy.id ? 'selected' : ''}`}
                onClick={() => handlePolicySelect(policy.id)}
              >
                <h3>{t(`visaFree.policies.${policy.translationKey}.name`)}</h3>
                <p>{t(`visaFree.policies.${policy.translationKey}.description`)}</p>
                <div className="policy-details">
                  <span className="duration">{policy.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
        
        <section className="eligibility-section">
          <h2>{t('visaFree.eligibility.title')}</h2>
          <div className="eligibility-form">
            <div className="form-group">
              <label htmlFor="country-select">{t('visaFree.eligibility.selectCountry')}</label>
              <select 
                id="country-select" 
                value={userCountry || ''}
                onChange={handleCountryChange}
              >
                <option value="">{t('visaFree.eligibility.countryPlaceholder')}</option>
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
              {t('visaFree.eligibility.checkButton')}
            </button>
            
            {showEligibilityCheck && userCountry && selectedPolicyId && (
              <div className={`eligibility-result ${isEligible ? 'eligible' : 'not-eligible'}`}>
                {isEligible 
                  ? t('visaFree.eligibility.eligible', { 
                      policy: policies.find(p => p.id === selectedPolicyId)?.translationKey 
                        ? t(`visaFree.policies.${policies.find(p => p.id === selectedPolicyId)?.translationKey}.name`) 
                        : policies.find(p => p.id === selectedPolicyId)?.name 
                    }) 
                  : t('visaFree.eligibility.notEligible', { 
                      country: userCountry, 
                      policy: policies.find(p => p.id === selectedPolicyId)?.translationKey 
                        ? t(`visaFree.policies.${policies.find(p => p.id === selectedPolicyId)?.translationKey}.name`) 
                        : policies.find(p => p.id === selectedPolicyId)?.name 
                    })}
              </div>
            )}
          </div>
        </section>
        
        <section className="travel-tips">
          <h2>{t('visaFree.tips.title')}</h2>
          <ul className="tips-list">
            <li>{t('visaFree.tips.prepare')}</li>
            <li>{t('visaFree.tips.research')}</li>
            <li>{t('visaFree.tips.plan')}</li>
            <li>{t('visaFree.tips.arrange')}</li>
          </ul>
        </section>
      </div>
    </>
  );
};

export default VisaFree;