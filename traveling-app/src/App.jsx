import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, CheckCircle, Calendar, MapPin, Edit3, 
  Clock, ChevronRight, Map, StickyNote, Save, X, 
  Bookmark, Archive, Link, ExternalLink 
} from 'lucide-react';

const App = () => {
  const [activeDay, setActiveDay] = useState(null);
  const [editingMemoId, setEditingMemoId] = useState(null);
  const [editingUrlId, setEditingUrlId] = useState(null);
  const [tempMemo, setTempMemo] = useState('');
  const [tempUrl, setTempUrl] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [journeyTitle, setJourneyTitle] = useState('');
  const [savedJourneys, setSavedJourneys] = useState([]);
  
  const [itinerary, setItinerary] = useState({
    1: { planned: [], actual: [] },
    2: { planned: [], actual: [] },
    3: { planned: [], actual: [] },
    4: { planned: [], actual: [] }
  });

  const [inputs, setInputs] = useState({
    planned: '',
    actual: ''
  });

  // 데이터 로딩 (LocalStorage)
  useEffect(() => {
    const savedData = localStorage.getItem('travel_planner_v5_data');
    if (savedData) {
      try {
        setItinerary(JSON.parse(savedData));
      } catch (e) {
        console.error("Data loading failed");
      }
    }
    const archivedData = localStorage.getItem('travel_planner_archives_v2');
    if (archivedData) {
      try {
        setSavedJourneys(JSON.parse(archivedData));
      } catch (e) {
        console.error("Archive loading failed");
      }
    }
  }, []);

  const saveToLocal = (newData) => {
    localStorage.setItem('travel_planner_v5_data', JSON.stringify(newData));
  };

  const addItem = (type) => {
    if (!activeDay || !inputs[type].trim()) return;
    
    const newItem = {
      id: Date.now(),
      content: inputs[type],
      memo: '',
      linkUrl: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      completed: false
    };

    const updatedItinerary = {
      ...itinerary,
      [activeDay]: {
        ...itinerary[activeDay],
        [type]: [...itinerary[activeDay][type], newItem]
      }
    };

    setItinerary(updatedItinerary);
    setInputs({ ...inputs, [type]: '' });
    saveToLocal(updatedItinerary);
  };

  const removeItem = (type, id) => {
    const updatedItinerary = {
      ...itinerary,
      [activeDay]: {
        ...itinerary[activeDay],
        [type]: itinerary[activeDay][type].filter(item => item.id !== id)
      }
    };
    setItinerary(updatedItinerary);
    saveToLocal(updatedItinerary);
  };

  const toggleComplete = (id) => {
    const updatedPlanned = itinerary[activeDay].planned.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    const updatedItinerary = {
      ...itinerary,
      [activeDay]: { ...itinerary[activeDay], planned: updatedPlanned }
    };
    setItinerary(updatedItinerary);
    saveToLocal(updatedItinerary);
  };

  const saveMemo = (id) => {
    const updatedPlanned = itinerary[activeDay].planned.map(item => 
      item.id === id ? { ...item, memo: tempMemo } : item
    );
    const updatedItinerary = {
      ...itinerary,
      [activeDay]: { ...itinerary[activeDay], planned: updatedPlanned }
    };
    setItinerary(updatedItinerary);
    setEditingMemoId(null);
    saveToLocal(updatedItinerary);
  };

  const saveUrl = (id) => {
    let formattedUrl = tempUrl.trim();
    if (formattedUrl && !/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'https://' + formattedUrl;
    }

    const updatedPlanned = itinerary[activeDay].planned.map(item => 
      item.id === id ? { ...item, linkUrl: formattedUrl } : item
    );
    const updatedItinerary = {
      ...itinerary,
      [activeDay]: { ...itinerary[activeDay], planned: updatedPlanned }
    };
    setItinerary(updatedItinerary);
    setEditingUrlId(null);
    saveToLocal(updatedItinerary);
  };

  const isAllDaysFilled = () => {
    return [1, 2, 3, 4].every(day => 
      itinerary[day].planned.length > 0 || itinerary[day].actual.length > 0
    );
  };

  const handleFinalSave = () => {
    if (!journeyTitle.trim()) return;
    
    const newJourney = {
      id: Date.now(),
      title: journeyTitle,
      date: new Date().toLocaleDateString(),
      data: { ...itinerary }
    };

    const updatedArchives = [newJourney, ...savedJourneys];
    setSavedJourneys(updatedArchives);
    localStorage.setItem('travel_planner_archives_v2', JSON.stringify(updatedArchives));
    
    setShowSaveModal(false);
    setJourneyTitle('');
    setActiveDay(null);
  };

  const deleteArchive = (e, id) => {
    e.stopPropagation();
    const updatedArchives = savedJourneys.filter(j => j.id !== id);
    setSavedJourneys(updatedArchives);
    localStorage.setItem('travel_planner_archives_v2', JSON.stringify(updatedArchives));
  };

  const loadArchive = (archive) => {
    setItinerary(archive.data);
    setActiveDay(1);
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900 overflow-hidden relative">
      
      {/* Sidebar 내비게이션 */}
      <aside className="w-20 md:w-72 bg-white border-r border-gray-200 flex flex-col shrink-0 transition-all z-20">
        <button 
          onClick={() => setActiveDay(null)}
          className="p-6 border-b border-gray-100 flex items-center gap-3 hover:bg-gray-50 transition-colors w-full text-left"
        >
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <Calendar size={20} />
          </div>
          <h1 className="text-xl font-bold text-gray-800 hidden md:block tracking-tight">
            Traveling
          </h1>
        </button>
        
        <nav className="flex-1 py-6 px-2 md:px-4 space-y-2 overflow-y-auto">
          {[1, 2, 3, 4].map((day) => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`w-full flex items-center justify-between p-3 md:px-4 rounded-xl transition-all group ${
                activeDay === day 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                  activeDay === day ? 'bg-white text-blue-600' : 'bg-gray-100 text-gray-500'
                }`}>
                  {day}
                </span>
                <span className="hidden md:block font-semibold">Day {day}</span>
              </div>
              <ChevronRight size={16} className={`hidden md:block transition-all ${activeDay === day ? 'translate-x-1 opacity-100' : 'opacity-0'}`} />
            </button>
          ))}
        </nav>
      </aside>

      {/* 메인 콘텐츠 영역 */}
      <main className="flex-1 relative overflow-y-auto bg-white flex flex-col">
        {!activeDay ? (
          <div className="flex-1 flex flex-col p-8 md:p-12">
            <div className="max-w-4xl mx-auto w-full text-center py-12 border-b border-gray-50 mb-12">
              <div className="w-20 h-20 bg-blue-50 rounded-[2rem] flex items-center justify-center text-blue-600 mx-auto mb-8 shadow-inner">
                <MapPin size={40} />
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">
                이번엔 어디로 떠나나요?
              </h2>
              <p className="text-gray-500 text-lg leading-relaxed">
                당신만의 소중한 여행 기록, 트래블링에서 시작하세요.
              </p>
            </div>

            <div className="max-w-4xl mx-auto w-full">
              <div className="flex items-center gap-2 mb-6 text-gray-400">
                <Archive size={20} />
                <h3 className="font-bold">저장된 여정 목록</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-12">
                {savedJourneys.length === 0 ? (
                  <div className="col-span-full py-12 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100 text-gray-400 text-sm italic">
                    아직 저장된 여행 일정이 없습니다.
                  </div>
                ) : (
                  savedJourneys.map(journey => (
                    <div 
                      key={journey.id}
                      onClick={() => loadArchive(journey)}
                      className="group bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-xl hover:border-blue-200 transition-all cursor-pointer relative"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                          <Bookmark size={18} fill="currentColor" />
                        </div>
                        <button 
                          onClick={(e) => deleteArchive(e, journey.id)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <h4 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                        {journey.title}
                      </h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                        {journey.date} SAVED
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 p-6 md:p-12 max-w-5xl mx-auto w-full">
            <header className="mb-12">
              <h2 className="text-4xl font-black text-gray-900 tracking-tight">
                Day {activeDay}
              </h2>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pb-24">
              <section>
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800">
                  <Calendar size={22} className="text-blue-600" />
                  계획된 일정
                </h3>
                <div className="flex gap-2 mb-8 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                  <input
                    type="text"
                    value={inputs.planned}
                    onChange={(e) => setInputs({ ...inputs, planned: e.target.value })}
                    onKeyPress={(e) => e.key === 'Enter' && addItem('planned')}
                    placeholder="장소 추가..."
                    className="flex-1 bg-transparent border-none px-4 py-2 outline-none text-sm"
                  />
                  <button onClick={() => addItem('planned')} className="p-2 bg-blue-600 text-white rounded-xl shadow-md">
                    <Plus size={20} />
                  </button>
                </div>
                <div className="space-y-4">
                  {itinerary[activeDay].planned.map((item) => (
                    <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group">
                      <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button onClick={() => toggleComplete(item.id)}>
                            <CheckCircle size={22} className={item.completed ? 'text-green-500' : 'text-gray-200'} />
                          </button>
                          <div className="flex flex-col">
                            {item.linkUrl ? (
                              <a 
                                href={item.linkUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className={`font-semibold text-sm hover:text-blue-600 flex items-center gap-1 ${item.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}
                              >
                                {item.content}
                                <ExternalLink size={12} className="shrink-0" />
                              </a>
                            ) : (
                              <span className={`font-semibold text-sm ${item.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                                {item.content}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => { setEditingUrlId(item.id); setTempUrl(item.linkUrl || ''); }} 
                            className={`p-1.5 rounded-lg ${item.linkUrl ? 'text-blue-600' : 'text-gray-400 hover:text-blue-500'}`}
                          >
                            <Link size={18} />
                          </button>
                          <button 
                            onClick={() => { setEditingMemoId(item.id); setTempMemo(item.memo || ''); }} 
                            className={`p-1.5 rounded-lg ${item.memo ? 'text-blue-600' : 'text-gray-400 hover:text-blue-500'}`}
                          >
                            <StickyNote size={18} />
                          </button>
                          <button onClick={() => removeItem('planned', item.id)} className="p-1.5 text-gray-400 hover:text-red-500">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>

                      {/* 링크 수정 */}
                      {editingUrlId === item.id && (
                        <div className="px-4 pb-4">
                          <div className="bg-blue-50 rounded-xl p-3 flex flex-col gap-2">
                            <input 
                              value={tempUrl} 
                              onChange={(e) => setTempUrl(e.target.value)}
                              placeholder="URL 입력 (http:// 포함)"
                              className="w-full bg-white border border-blue-100 rounded-lg px-3 py-2 text-xs outline-none"
                              autoFocus
                            />
                            <div className="flex justify-end gap-2">
                              <button onClick={() => setEditingUrlId(null)} className="p-1 text-gray-400 text-xs">취소</button>
                              <button onClick={() => saveUrl(item.id)} className="px-3 py-1 bg-blue-600 text-white rounded text-[10px] font-bold">저장</button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 메모 수정 */}
                      {(item.memo || editingMemoId === item.id) && (
                        <div className="px-4 pb-4">
                          {editingMemoId === item.id ? (
                            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                              <textarea value={tempMemo} onChange={(e) => setTempMemo(e.target.value)} className="w-full bg-transparent outline-none text-xs text-gray-600 resize-none h-16" autoFocus />
                              <div className="flex justify-end gap-2 mt-2">
                                <button onClick={() => setEditingMemoId(null)} className="p-1 text-gray-400 text-xs">취소</button>
                                <button onClick={() => saveMemo(item.id)} className="px-3 py-1 bg-gray-900 text-white rounded text-[10px] font-bold">저장</button>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 cursor-pointer" onClick={() => { setEditingMemoId(item.id); setTempMemo(item.memo || ''); }}>
                              <p className="text-xs text-gray-500 italic">"{item.memo}"</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800">
                  <Edit3 size={22} className="text-orange-500" />
                  실제 수행 기록
                </h3>
                <div className="flex gap-2 mb-8 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                  <input
                    type="text"
                    value={inputs.actual}
                    onChange={(e) => setInputs({ ...inputs, actual: e.target.value })}
                    onKeyPress={(e) => e.key === 'Enter' && addItem('actual')}
                    placeholder="수행 메모..."
                    className="flex-1 bg-transparent border-none px-4 py-2 outline-none text-sm"
                  />
                  <button onClick={() => addItem('actual')} className="p-2 bg-orange-500 text-white rounded-xl shadow-md">
                    <Plus size={20} />
                  </button>
                </div>
                <div className="relative pl-6 space-y-6">
                  {itinerary[activeDay].actual.length > 0 && <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gray-100"></div>}
                  {itinerary[activeDay].actual.map((item) => (
                    <div key={item.id} className="relative group">
                      <div className="absolute -left-[23px] top-1.5 w-3 h-3 rounded-full bg-orange-500 border-2 border-white"></div>
                      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-start">
                        <div>
                          <p className="text-sm font-bold text-gray-800 mb-1">{item.content}</p>
                          <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold uppercase"><Clock size={10} /> {item.timestamp}</div>
                        </div>
                        <button onClick={() => removeItem('actual', item.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* 최종 저장 버튼 */}
            {isAllDaysFilled() && (
              <div className="fixed bottom-8 left-1/2 md:left-[calc(50%+144px)] -translate-x-1/2 z-30">
                <button 
                  onClick={() => setShowSaveModal(true)}
                  className="bg-gray-900 text-white px-10 py-4 rounded-full font-black text-sm tracking-widest flex items-center gap-3 shadow-2xl hover:bg-blue-600 transition-all whitespace-nowrap"
                >
                  <Archive size={18} />
                  저장할까요?
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 저장 모달 */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl">
            <h3 className="text-2xl font-black text-gray-900 mb-2">멋진 제목을 지어주세요</h3>
            <p className="text-gray-500 text-sm mb-8">4일간의 소중한 추억을 하나의 여정으로 기록합니다.</p>
            <input 
              type="text"
              value={journeyTitle}
              onChange={(e) => setJourneyTitle(e.target.value)}
              placeholder="예: 제주도 푸른밤 3박 4일"
              className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-blue-500 mb-8 font-medium"
              autoFocus
            />
            <div className="flex gap-3">
              <button onClick={() => setShowSaveModal(false)} className="flex-1 py-4 text-gray-400 font-bold">취소</button>
              <button onClick={handleFinalSave} disabled={!journeyTitle.trim()} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-blue-100 disabled:bg-gray-200 transition-all">저장하기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;