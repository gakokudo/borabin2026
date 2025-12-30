import React, { useState, useEffect } from 'react';
import { Lock, Users, Trophy, Download, Upload, ShieldCheck, FileJson, AlertCircle } from 'lucide-react';
import { getAdminUserList, importData } from '../services/storageService';
import { UserActivityData } from '../types';

const AdminPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [userList, setUserList] = useState<UserActivityData[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      setUserList(getAdminUserList());
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // 管理者用パスワード。運用時は「admin123」など、事務局のみが知る値に変更してください。
    if (password === 'admin') { 
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('パスワードが違います');
    }
  };

  const downloadCSV = () => {
    const headers = ["名前", "メールアドレス", "登録日", "スタンプ数", "参加回数"];
    const csvContent = [
      headers.join(','),
      ...userList.map(user => [
        user.name,
        user.email,
        new Date(user.registeredAt).toLocaleDateString(),
        user.stampCount,
        user.participationCount
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `setagaya_volunteer_users_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-brand-100 w-full max-w-sm text-center">
          <div className="bg-brand-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Lock className="text-brand-500" size={36} />
          </div>
          <h2 className="text-2xl font-bold text-brand-900 mb-2">事務局ログイン</h2>
          <p className="text-xs text-gray-400 mb-8 font-medium">運営スタッフ専用の管理画面です</p>
          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Admin Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-2 border-gray-100 bg-gray-50 rounded-xl p-4 focus:border-brand-500 focus:bg-white outline-none transition-all font-bold"
                placeholder="パスワードを入力"
              />
            </div>
            {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}
            <button
              type="submit"
              className="w-full bg-brand-900 text-white font-bold py-4 rounded-xl hover:bg-black transition-all shadow-lg transform active:scale-95"
            >
              ログイン
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      {/* Header Info */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-brand-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-brand-500 text-white p-4 rounded-2xl shadow-lg">
            <ShieldCheck size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-brand-900">事務局ダッシュボード</h2>
            <p className="text-xs text-gray-500 font-medium">50名の参加状況を管理・集計できます</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={downloadCSV}
            className="bg-brand-900 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 hover:bg-black transition-all text-sm shadow-md"
          >
            <Download size={18} />
            CSV出力
          </button>
        </div>
      </div>

      {/* Admin Help / Usage */}
      <div className="bg-accent-50 border-2 border-accent-100 rounded-3xl p-6 flex gap-4 items-start">
        <AlertCircle className="text-accent-600 shrink-0 mt-1" size={24} />
        <div className="space-y-2">
          <h4 className="font-bold text-brand-900">参加者のデータを確認する方法</h4>
          <p className="text-sm text-brand-900/70 leading-relaxed">
            このアプリは参加者の端末ごとにデータが保存されます。特定の参加者の進捗を正確に確認したい場合は、参加者にフッターの<b>「データを保存」</b>からJSONファイルを送ってもらい、事務局の端末で<b>「データを復元」</b>機能を使って読み込んでください。
          </p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-center">
          <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">現在の閲覧端末内</p>
          <div className="text-3xl font-bold text-brand-900 flex items-center justify-center gap-2">
            <Users className="text-brand-500" size={24} />
            {userList.length}名
          </div>
          <p className="text-[10px] text-gray-400 font-bold mt-1">のユーザーデータ</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-center">
          <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">総スタンプ数</p>
          <div className="text-3xl font-bold text-accent-600 flex items-center justify-center gap-2">
            <Trophy className="text-accent-500" size={24} />
            {userList.reduce((acc, user) => acc + user.stampCount, 0)}
          </div>
          <p className="text-[10px] text-gray-400 font-bold mt-1">累積獲得数</p>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-[2rem] shadow-xl border border-brand-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-50 text-brand-900 text-xs">
                <th className="p-5 font-bold border-b border-brand-100 whitespace-nowrap">氏名 / メール</th>
                <th className="p-5 font-bold border-b border-brand-100 text-center whitespace-nowrap">スタンプ</th>
                <th className="p-5 font-bold border-b border-brand-100 text-center whitespace-nowrap">参加回数</th>
                <th className="p-5 font-bold border-b border-brand-100 whitespace-nowrap">登録日</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700">
              {userList.map((user, index) => (
                <tr key={index} className="hover:bg-brand-50/30 border-b border-gray-100 last:border-0 transition-colors">
                  <td className="p-5">
                    <div className="font-bold text-brand-900">{user.name}</div>
                    <div className="text-xs text-gray-400 font-medium">{user.email}</div>
                  </td>
                  <td className="p-5 text-center font-bold text-brand-600">
                    <div className="inline-flex items-center justify-center bg-brand-50 w-10 h-10 rounded-xl border border-brand-100 shadow-inner">
                      {user.stampCount}
                    </div>
                  </td>
                  <td className="p-5 text-center">
                    <span className="bg-gray-100 px-3 py-1 rounded-full text-xs font-bold text-gray-600">
                      {user.participationCount}回
                    </span>
                  </td>
                  <td className="p-5 whitespace-nowrap text-gray-400 font-medium">
                    {new Date(user.registeredAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {userList.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-16 text-center text-gray-400">
                    <FileJson size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="font-bold">データがありません</p>
                    <p className="text-xs">参加者のバックアップファイルを読み込むとここに表示されます</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
