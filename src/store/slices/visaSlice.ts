import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// 定义类型
interface VisaPolicy {
  id: string;
  name: string;
  duration: string;
  eligibleCountries: string[];
  requirements: string[];
  description: string;
  translationKey: string;
}

interface VisaState {
  policies: VisaPolicy[];
  selectedPolicyId: string | null;
  userCountry: string | null;
  isEligible: boolean | null;
  isLoading: boolean;
  error: string | null;
}

// 符合240小时免签的54个国家（按字母顺序排列）
const eligible240HourCountries = [
  'Albania', 'Argentina', 'Australia', 'Austria', 'Belarus', 'Belgium', 'Bosnia and Herzegovina', 
  'Brazil', 'Brunei', 'Bulgaria', 'Canada', 'Chile', 'Croatia', 'Cyprus', 'Czech Republic', 
  'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary', 'Iceland', 
  'Ireland', 'Italy', 'Japan', 'Latvia', 'Lithuania', 'Luxembourg', 'Malta', 'Mexico', 
  'Monaco', 'Montenegro', 'Netherlands', 'New Zealand', 'North Macedonia', 'Norway', 'Poland', 
  'Portugal', 'Qatar', 'Romania', 'Russia', 'Serbia', 'Singapore', 'Slovakia', 'Slovenia', 
  'South Korea', 'Spain', 'Sweden', 'Switzerland', 'Ukraine', 'United Arab Emirates', 
  'United Kingdom', 'United States'
];

// 初始状态
const initialState: VisaState = {
  policies: [
    {
      id: '1',
      name: '240-Hour Transit Visa-Free',
      duration: '240 hours',
      eligibleCountries: eligible240HourCountries,
      requirements: [
        'Valid passport with at least 6 months validity',
        'Confirmed onward ticket to a third country',
        'Completed arrival/departure card'
      ],
      description: '240-hour visa-free transit policy applies to citizens of 54 countries traveling through specific ports of entry.',
      translationKey: '144hour'
    },
    {
      id: '2',
      name: '72-Hour Transit Visa-Free',
      duration: '72 hours',
      eligibleCountries: eligible240HourCountries,
      requirements: [
        'Valid passport with at least 6 months validity',
        'Confirmed onward ticket to a third country',
        'Completed arrival/departure card'
      ],
      description: '72-hour visa-free transit policy applies to citizens of 54 countries traveling through specific ports of entry.',
      translationKey: '72hour'
    }
  ],
  selectedPolicyId: null,
  userCountry: null,
  isEligible: null,
  isLoading: false,
  error: null
};

const visaSlice = createSlice({
  name: 'visa',
  initialState,
  reducers: {
    selectPolicy: (state, action: PayloadAction<string>) => {
      state.selectedPolicyId = action.payload;
    },
    setUserCountry: (state, action: PayloadAction<string>) => {
      state.userCountry = action.payload;
      
      // 如果用户设置了国家和选择了政策，检查资格
      if (state.selectedPolicyId && state.userCountry) {
        const selectedPolicy = state.policies.find(p => p.id === state.selectedPolicyId);
        if (selectedPolicy) {
          state.isEligible = selectedPolicy.eligibleCountries.includes(state.userCountry);
        }
      }
    },
    checkEligibility: (state) => {
      if (state.selectedPolicyId && state.userCountry) {
        const selectedPolicy = state.policies.find(p => p.id === state.selectedPolicyId);
        if (selectedPolicy) {
          state.isEligible = selectedPolicy.eligibleCountries.includes(state.userCountry);
        }
      }
    },
    addPolicy: (state, action: PayloadAction<Omit<VisaPolicy, 'id'>>) => {
      const newId = (state.policies.length + 1).toString();
      state.policies.push({
        id: newId,
        ...action.payload
      });
    }
  }
});

export const { selectPolicy, setUserCountry, checkEligibility, addPolicy } = visaSlice.actions;
export default visaSlice.reducer; 