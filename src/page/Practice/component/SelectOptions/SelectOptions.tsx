import React, { useState } from 'react';
import './SelectOptions.style.css';

const SelectOptions: React.FC = () => {
  const [language, setLanguage] = useState<string | null>(null);
  const [length, setLength] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);

  const isReady = language && length && category;

  return (
    <div className="select-options">
      <h2 className="section-title">학습 설정</h2>

      {/* 언어 선택 */}
      <div className="selection-step">
        <h3>1. 언어 선택</h3>
        <div className="option-group">
          <button className={language === 'ko' ? 'selected' : ''} onClick={() => setLanguage('ko')}>
            한국어 🇰🇷
          </button>
          <button className={language === 'en' ? 'selected' : ''} onClick={() => setLanguage('en')}>
            영어 🇺🇸
          </button>
        </div>
      </div>

      {/* 문장 길이 선택 */}
      <div className="selection-step">
        <h3>2. 문장 길이</h3>
        <div className="option-group">
          <button className={length === 'short' ? 'selected' : ''} onClick={() => setLength('short')}>
            짧은 문장 📄
          </button>
          <button className={length === 'long' ? 'selected' : ''} onClick={() => setLength('long')}>
            긴 문장 📰
          </button>
        </div>
      </div>

      {/* 카테고리 선택 */}
      <div className="selection-step">
        <h3>3. 카테고리 선택</h3>
        <div className="option-group category-grid">
          {categories.map((cat) => (
            <button
              key={cat.key}
              className={category === cat.key ? 'selected' : ''}
              onClick={() => setCategory(cat.key)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 문장 생성 버튼 */}
      <button className="createBtn" disabled={!isReady}>
        문장 생성하기
      </button>
    </div>
  );
};

const categories = [
  { key: 'quote', label: '명언' },
  { key: 'book', label: '서적' },
  { key: 'movie', label: '영화/드라마' },
  { key: 'music', label: '음악/가사' },
  { key: 'news', label: '뉴스/시사' },
  { key: 'sns', label: 'SNS/트렌드' },
  { key: 'philosophy', label: '철학/사유' },
  { key: 'daily', label: '일상/감정' },
];

export default SelectOptions;