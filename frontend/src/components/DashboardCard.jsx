import React from 'react';

const DashboardCard = ({ title, value, icon: Icon, color = 'indigo' }) => {
  const colorMap = {
    indigo: {
      bg: 'bg-indigo-500/10',
      text: 'text-indigo-400',
      border: 'border-indigo-500/20',
      shadow: 'shadow-indigo-500/5',
      accent: 'from-indigo-500 to-purple-500'
    },
    emerald: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      border: 'border-emerald-500/20',
      shadow: 'shadow-emerald-500/5',
      accent: 'from-emerald-500 to-teal-500'
    },
    teal: {
      bg: 'bg-teal-500/10',
      text: 'text-teal-400',
      border: 'border-teal-500/20',
      shadow: 'shadow-teal-500/5',
      accent: 'from-teal-500 to-emerald-500'
    },
    cyan: {
      bg: 'bg-cyan-500/10',
      text: 'text-cyan-400',
      border: 'border-cyan-500/20',
      shadow: 'shadow-cyan-500/5',
      accent: 'from-cyan-500 to-sky-500'
    },
    rose: {
      bg: 'bg-rose-500/10',
      text: 'text-rose-400',
      border: 'border-rose-500/20',
      shadow: 'shadow-rose-500/5',
      accent: 'from-rose-500 to-pink-500'
    },
    sky: {
      bg: 'bg-sky-500/10',
      text: 'text-sky-400',
      border: 'border-sky-500/20',
      shadow: 'shadow-sky-500/5',
      accent: 'from-sky-500 to-blue-500'
    },
    amber: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      border: 'border-amber-500/20',
      shadow: 'shadow-amber-500/5',
      accent: 'from-amber-500 to-orange-500'
    }
  };

  const scheme = colorMap[color] || colorMap.indigo;

  return (
    <div className={`glass-card rounded-xl p-6 border ${scheme.border} shadow-lg ${scheme.shadow} relative overflow-hidden text-left flex items-center justify-between`}>
      {/* Decorative background glow */}
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${scheme.accent} opacity-5 blur-2xl rounded-full pointer-events-none`}></div>
      
      <div>
        <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider block mb-1">
          {title}
        </span>
        <span className="text-3xl font-extrabold text-slate-100 tracking-tight">
          {value}
        </span>
      </div>

      <div className={`p-3.5 rounded-lg ${scheme.bg} ${scheme.text} flex items-center justify-center flex-shrink-0 border border-white/5`}>
        {Icon && <Icon className="h-6 w-6" />}
      </div>
    </div>
  );
};

export default DashboardCard;
