
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { IntensityType, TrainingSet, CalculatorState, SavedEntry } from './types';
import { getCoachAdvice } from './services/geminiService';

// Icons as components
const DumbbellIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
);

const TimerIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const AdviceIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.674a1 1 0 00.996-.85l.637-4.11a5.002 5.002 0 10-7.864 0l.637 4.11a1 1 0 00.996.85z" />
  </svg>
);

const SaveIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const App: React.FC = () => {
  const [state, setState] = useState<CalculatorState>({
    topSetWeight: 100,
    exerciseName: 'Panca Piana',
    unit: 'kg'
  });

  const [history, setHistory] = useState<SavedEntry[]>([]);
  const [coachAdvice, setCoachAdvice] = useState<string | null>(null);
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  // Load history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('bb_load_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Errore caricamento cronologia", e);
      }
    }
  }, []);

  // Save history to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('bb_load_history', JSON.stringify(history));
  }, [history]);

  // Constants for intensity mapping
  const TOP_SET_INTENSITY = 0.825;

  const trainingSets = useMemo(() => {
    const estimated1RM = state.topSetWeight / TOP_SET_INTENSITY;

    const sets: TrainingSet[] = [
      {
        type: IntensityType.WARMUP1,
        percentage: 40,
        reps: '10',
        rpe: 4,
        rest: '60–90’’',
        description: 'Attivazione',
        weight: Math.round(estimated1RM * 0.40 * 2) / 2,
        color: 'border-slate-500 bg-slate-500/10'
      },
      {
        type: IntensityType.WARMUP2,
        percentage: 55,
        reps: '8',
        rpe: 5,
        rest: '60–90’’',
        description: 'Preparazione',
        weight: Math.round(estimated1RM * 0.55 * 2) / 2,
        color: 'border-blue-500 bg-blue-500/10'
      },
      {
        type: IntensityType.WARMUP3,
        percentage: 70,
        reps: '5',
        rpe: 6,
        rest: '90’’',
        description: 'Potenziamento neurale',
        weight: Math.round(estimated1RM * 0.70 * 2) / 2,
        color: 'border-indigo-500 bg-indigo-500/10'
      },
      {
        type: IntensityType.TOPSET,
        percentage: 82.5,
        reps: '6–8',
        rpe: 9,
        rest: '2–3’',
        description: 'Tensione meccanica massima',
        weight: state.topSetWeight,
        color: 'border-red-500 bg-red-500/10'
      },
      {
        type: IntensityType.BACKOFF,
        percentage: 67.5,
        reps: '10–12',
        rpe: 9,
        rest: '2’',
        description: 'Volume qualitativo',
        weight: Math.round(estimated1RM * 0.675 * 2) / 2,
        color: 'border-orange-500 bg-orange-500/10'
      },
      {
        type: IntensityType.METABOLIC,
        percentage: 52.5,
        reps: '15–20',
        rpe: 10,
        rest: '60’’',
        description: 'Stress metabolico',
        weight: Math.round(estimated1RM * 0.525 * 2) / 2,
        color: 'border-green-500 bg-green-500/10'
      }
    ];

    return sets;
  }, [state.topSetWeight]);

  const fetchAdvice = useCallback(async () => {
    setLoadingAdvice(true);
    const advice = await getCoachAdvice(state.exerciseName, state.topSetWeight, trainingSets);
    setCoachAdvice(advice);
    setLoadingAdvice(false);
  }, [state.exerciseName, state.topSetWeight, trainingSets]);

  const saveEntry = () => {
    const newEntry: SavedEntry = {
      id: crypto.randomUUID(),
      exerciseName: state.exerciseName,
      topSetWeight: state.topSetWeight,
      unit: state.unit,
      date: new Date().toLocaleDateString('it-IT', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      })
    };
    setHistory(prev => [newEntry, ...prev]);
  };

  const deleteEntry = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen pb-12 px-4 sm:px-6 lg:px-8 bg-slate-950 text-slate-100">
      <header className="py-8 text-center max-w-4xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-2">
          <DumbbellIcon />
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">
            BB Load Optimizer
          </h1>
        </div>
        <p className="text-slate-400 font-medium">Top Set + Back Off + Drop Metabolico</p>
      </header>

      <main className="max-w-4xl mx-auto space-y-8">
        {/* Input Section */}
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-300">Esercizio</label>
              <input 
                type="text" 
                value={state.exerciseName}
                onChange={(e) => setState(prev => ({ ...prev, exerciseName: e.target.value }))}
                className="w-full bg-slate-800 border-slate-700 rounded-lg py-3 px-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="es. Squat, Panca..."
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-300">Carico TOP SET ({state.unit})</label>
              <div className="flex gap-2">
                <input 
                  type="number" 
                  value={state.topSetWeight}
                  onChange={(e) => setState(prev => ({ ...prev, topSetWeight: Number(e.target.value) }))}
                  className="w-full bg-slate-800 border-slate-700 rounded-lg py-3 px-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono text-xl text-blue-400"
                  min="0"
                />
                <button 
                  onClick={() => setState(prev => ({ ...prev, unit: prev.unit === 'kg' ? 'lb' : 'kg' }))}
                  className="px-4 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors font-bold"
                >
                  {state.unit.toUpperCase()}
                </button>
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
             <button 
              onClick={saveEntry}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-full text-sm font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95"
            >
              <SaveIcon />
              Annota Sessione
            </button>
          </div>
        </div>

        {/* Results List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold px-2 border-l-4 border-blue-500">Programma Allenamento</h2>
          <div className="grid grid-cols-1 gap-4">
            {trainingSets.map((set, idx) => (
              <div 
                key={idx} 
                className={`p-5 rounded-xl border-2 transition-all hover:scale-[1.01] flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${set.color}`}
              >
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider opacity-70">{set.description}</span>
                  <div className="flex items-baseline gap-3">
                    <h3 className="text-lg font-extrabold">{set.type}</h3>
                    <span className="text-sm font-medium bg-white/10 px-2 py-0.5 rounded-full">{set.percentage}% 1RM est.</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:gap-8 overflow-x-auto pb-2 sm:pb-0">
                  <div className="flex flex-col items-center min-w-[60px]">
                    <span className="text-xs uppercase font-semibold text-slate-400">Peso</span>
                    <span className="text-2xl font-black text-white">{set.weight}<small className="ml-1 text-sm font-normal opacity-60 uppercase">{state.unit}</small></span>
                  </div>
                  <div className="flex flex-col items-center min-w-[60px]">
                    <span className="text-xs uppercase font-semibold text-slate-400">Reps</span>
                    <span className="text-xl font-bold">{set.reps}</span>
                  </div>
                  <div className="flex flex-col items-center min-w-[40px]">
                    <span className="text-xs uppercase font-semibold text-slate-400">RPE</span>
                    <span className="text-xl font-bold text-yellow-400">{set.rpe}</span>
                  </div>
                  <div className="flex flex-col items-center min-w-[80px]">
                    <span className="text-xs uppercase font-semibold text-slate-400">Recupero</span>
                    <div className="flex items-center gap-1">
                      <TimerIcon />
                      <span className="text-lg font-bold">{set.rest}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Coach Advice */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AdviceIcon />
                <h3 className="text-lg font-bold">AI Coach Advisor</h3>
              </div>
              <button 
                onClick={fetchAdvice}
                disabled={loadingAdvice}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                  loadingAdvice 
                  ? 'bg-slate-700 cursor-not-allowed opacity-50' 
                  : 'bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/20'
                }`}
              >
                {loadingAdvice ? 'Analisi in corso...' : 'Chiedi al Coach'}
              </button>
            </div>
            
            {coachAdvice ? (
              <div className="prose prose-invert max-w-none prose-p:text-slate-400 prose-strong:text-indigo-400 bg-slate-950/50 p-4 rounded-xl border border-slate-800/50 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div dangerouslySetInnerHTML={{ __html: coachAdvice.replace(/\n/g, '<br/>') }} />
              </div>
            ) : (
              <p className="text-slate-500 text-sm italic text-center py-4">
                Premi "Chiedi al Coach" per ottenere consigli personalizzati per questo esercizio e carico.
              </p>
            )}
          </div>
        </div>

        {/* Saved Sessions History */}
        <div className="space-y-4">
           <h2 className="text-xl font-bold px-2 border-l-4 border-indigo-500">Cronologia Sessioni</h2>
           <div className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden">
             {history.length > 0 ? (
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead className="bg-slate-800/50">
                     <tr>
                       <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Data</th>
                       <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Esercizio</th>
                       <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Top Set</th>
                       <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Azioni</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-800">
                     {history.map((entry) => (
                       <tr key={entry.id} className="hover:bg-slate-800/30 transition-colors">
                         <td className="px-6 py-4 text-sm font-medium text-slate-400">{entry.date}</td>
                         <td className="px-6 py-4 font-bold text-slate-200">{entry.exerciseName}</td>
                         <td className="px-6 py-4 font-mono font-bold text-blue-400">{entry.topSetWeight} {entry.unit}</td>
                         <td className="px-6 py-4 text-right">
                           <button 
                            onClick={() => deleteEntry(entry.id)}
                            className="p-2 text-slate-500 hover:text-red-500 transition-colors"
                            title="Elimina"
                           >
                             <TrashIcon />
                           </button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             ) : (
               <div className="p-12 text-center">
                 <p className="text-slate-500 italic">Nessuna sessione salvata. Premi "Annota Sessione" sopra per iniziare la tua storia di progressi.</p>
               </div>
             )}
           </div>
        </div>
      </main>

      <footer className="mt-12 text-center text-slate-500 text-sm">
        <p>© {new Date().getFullYear()} BB Load Optimizer - Progettato per Massima Ipertrofia</p>
        <p className="mt-1">I tuoi dati sono salvati localmente sul tuo dispositivo.</p>
      </footer>
    </div>
  );
};

export default App;
