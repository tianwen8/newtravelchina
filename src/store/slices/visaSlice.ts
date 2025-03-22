import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// 定义类型
interface VisaPolicy {
  id: string;
  name: string;
  duration: string;
  eligibleCountries: string[];
  requirements: string[];
  description: string;
}

interface VisaState {
  policies: VisaPolicy[];
  selectedPolicyId: string | null;
  userCountry: string | null;
  isEligible: boolean | null;
  isLoading: boolean;
  error: string | null;
}

// 初始状态
const initialState: VisaState = {
  policies: [
    {
      id: '1',
      name: '144-Hour Transit Visa-Free',
      duration: '144 hours',
      eligibleCountries: ['United States', 'United Kingdom', 'Canada', 'Australia', 'France', 'Germany', 'Japan', 'South Korea'],
      requirements: [
        'Valid passport with at least 6 months validity',
        'Confirmed onward ticket to a third country',
        'Completed arrival/departure card'
      ],
      description: '144-hour visa-free transit policy applies to citizens of 53 countries traveling through specific ports of entry.'
    },
    {
      id: '2',
      name: '72-Hour Transit Visa-Free',
      duration: '72 hours',
      eligibleCountries: ['United States', 'United Kingdom', 'Canada', 'Australia', 'France', 'Germany', 'Japan', 'South Korea'],
      requirements: [
        'Valid passport with at least 6 months validity',
        'Confirmed onward ticket to a third country',
        'Completed arrival/departure card'
      ],
      description: '72-hour visa-free transit policy applies to citizens of 53 countries traveling through specific ports of entry.'
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