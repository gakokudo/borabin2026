import { VolunteerEvent } from './types';

export const BINGO_CATEGORIES = [
  "子育て", "教育", "高齢者支援", "ライフスタイル", "居場所作り",
  "世田谷地域", "北沢地域", "玉川地域", "砧地域", "烏山地域",
  "防災", "まちづくり", "環境", "国際交流", "撮影",
  "文化・芸術", "物販", "片付け・清掃", "農業体験", "イベント運営",
  "広報活動", "傾聴・相談", "寄付・募金", "障害者支援"
];

export const INITIAL_EVENTS: VolunteerEvent[] = [
  {
    id: '1',
    title: '多摩川河川敷クリーン大作戦',
    date: '2024-05-18',
    startTime: '09:00',
    endTime: '12:00',
    venue: '二子玉川公園周辺',
    address: '東京都世田谷区玉川1-16-1',
    content: '春の多摩川を綺麗にしましょう！子供から大人まで楽しめるゴミ拾いイベントです。',
    requirements: '軍手、動きやすい服装、飲み物',
    imageUrl: 'https://images.unsplash.com/photo-1618477461853-5f8dd68aa395?auto=format&fit=crop&w=800&q=80',
    category: '片付け・清掃',
    organizationName: '世田谷グリーンクラブ',
    contactPerson: '山田 太郎',
    email: 'info@example.com',
    phoneNumber: '03-1234-5678',
    secretKey: 'river'
  },
  {
    id: '2',
    title: '下北沢こども食堂 お手伝い',
    date: '2026-01-25',
    startTime: '15:00',
    endTime: '19:00',
    venue: '下北沢区民集会所',
    address: '東京都世田谷区北沢2-10',
    content: '地域の子どもたちに温かい食事を提供するイベントの配膳と片付けのお手伝いです。',
    requirements: 'エプロン、三角巾、マスク',
    imageUrl: 'https://images.unsplash.com/photo-1547496502-ffa22d388946?auto=format&fit=crop&w=800&q=80',
    category: '子育て',
    organizationName: 'しもきたキッズサポート',
    contactPerson: '佐藤 花子',
    email: 'kids@example.com',
    phoneNumber: '090-1111-2222',
    secretKey: 'rice'
  },
  {
    id: '3',
    title: '世田谷のボロ市ガイドボランティア',
    date: '2026-01-15',
    startTime: '09:00',
    endTime: '17:00',
    venue: 'ボロ市通り',
    address: '東京都世田谷区世田谷1丁目',
    content: '440年以上の歴史を持つ「世田谷のボロ市」での案内ボランティアです。多くの来場者で賑わう会場での案内や、美化活動を行います。歴史あるお祭りを一緒に盛り上げましょう！',
    requirements: '暖かい服装（防寒対策必須）、動きやすい靴',
    imageUrl: 'https://images.unsplash.com/photo-1583592186780-305be97de023?auto=format&fit=crop&w=800&q=80',
    category: 'イベント運営',
    organizationName: '世田谷ボロ市保存会',
    contactPerson: '世田谷 健太',
    email: 'boroichi@example.com',
    phoneNumber: '03-5432-1111',
    secretKey: 'daikan'
  }
];

export const GOOGLE_FORM_URL = "https://docs.google.com/forms/u/0/";
