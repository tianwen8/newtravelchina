import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// 定义类型
interface Phrase {
  id: string;
  chinese: string;
  pinyin: string;
  english: string;
  category: string;
}

interface LanguageState {
  phrases: Phrase[];
  favoriteIds: string[];
  recentlyViewedIds: string[];
  isLoading: boolean;
  error: string | null;
}

// 初始状态
const initialState: LanguageState = {
  phrases: [
    {
      id: '1',
      chinese: '你好',
      pinyin: 'Nǐ hǎo',
      english: 'Hello',
      category: 'greetings'
    },
    {
      id: '2',
      chinese: '谢谢',
      pinyin: 'Xiè xiè',
      english: 'Thank you',
      category: 'greetings'
    },
    {
      id: '3',
      chinese: '再见',
      pinyin: 'Zài jiàn',
      english: 'Goodbye',
      category: 'greetings'
    },
    {
      id: '4',
      chinese: '这个多少钱？',
      pinyin: 'Zhè ge duō shao qián?',
      english: 'How much is this?',
      category: 'shopping'
    },
    {
      id: '5',
      chinese: '地铁站在哪里？',
      pinyin: 'Dì tiě zhàn zài nǎ lǐ?',
      english: 'Where is the subway station?',
      category: 'transportation'
    }
  ],
  favoriteIds: [],
  recentlyViewedIds: [],
  isLoading: false,
  error: null
};

const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    toggleFavorite: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (state.favoriteIds.includes(id)) {
        state.favoriteIds = state.favoriteIds.filter(fid => fid !== id);
      } else {
        state.favoriteIds.push(id);
      }
    },
    addRecentlyViewed: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      // 移除已存在的 ID，确保它会被添加到数组末尾
      state.recentlyViewedIds = state.recentlyViewedIds.filter(rid => rid !== id);
      // 添加到已查看列表
      state.recentlyViewedIds.push(id);
      // 保持列表在合理大小
      if (state.recentlyViewedIds.length > 10) {
        state.recentlyViewedIds.shift();
      }
    },
    addPhrase: (state, action: PayloadAction<Omit<Phrase, 'id'>>) => {
      const newId = (state.phrases.length + 1).toString();
      state.phrases.push({
        id: newId,
        ...action.payload
      });
    }
  }
});

export const { toggleFavorite, addRecentlyViewed, addPhrase } = languageSlice.actions;
export default languageSlice.reducer; 