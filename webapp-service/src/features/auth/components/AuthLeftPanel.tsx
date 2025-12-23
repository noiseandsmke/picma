import React from 'react';
import './AuthLeftPanel.css';

const AuthLeftPanel: React.FC = () => {
    return (
        <div
            className="hidden lg:flex flex-1 relative bg-transparent overflow-hidden items-center justify-center p-12 min-w-0">
            <div className="relative z-10 max-w-lg w-full">
                <div className="flex items-center gap-3 mb-8">
                    <span
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary border border-primary/20 shadow-glow">
                        <span className="material-symbols-outlined text-[20px]">psychology</span>
                    </span>
                    <span
                        className="text-primary font-semibold tracking-wide text-sm uppercase">AI-Powered Analytics</span>
                </div>
                <h3 className="text-5xl md:text-6xl font-extrabold text-text-main leading-[1.1] mb-4 tracking-tight">
                    Deep Property & <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Market Analysis.</span>
                </h3>
                <h4 className="text-xl text-text-secondary font-medium mb-12">Intelligent Insights Tailored for Property
                    Owners.</h4>

                <div className="grid grid-cols-1 gap-4">
                    <div
                        className="group flex items-center gap-4 p-4 rounded-xl bg-surface-card/50 border border-border-main/50 backdrop-blur-sm hover:bg-surface-card/80 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/5">
                        <div
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 group-hover:bg-emerald-500/20 transition-colors">
                            <span className="material-symbols-outlined">verified_user</span>
                        </div>
                        <div>
                            <p className="text-text-main font-semibold text-sm transition-colors">Location
                                Verification</p>
                            <p className="text-text-muted text-xs mt-0.5 group-hover:text-text-secondary transition-colors">Validates
                                ward via house number & street</p>
                        </div>
                    </div>

                    <div
                        className="group flex items-center gap-4 p-4 rounded-xl bg-surface-card/50 border border-border-main/50 backdrop-blur-sm hover:bg-surface-card/80 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/5">
                        <div
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 group-hover:bg-amber-500/20 transition-colors">
                            <span className="material-symbols-outlined">flood</span>
                        </div>
                        <div>
                            <p className="text-text-main font-semibold text-sm transition-colors">Risk Assessment</p>
                            <p className="text-text-muted text-xs mt-0.5 group-hover:text-text-secondary transition-colors">Detects
                                proximity to rivers & canals</p>
                        </div>
                    </div>

                    <div
                        className="group flex items-center gap-4 p-4 rounded-xl bg-surface-card/50 border border-border-main/50 backdrop-blur-sm hover:bg-surface-card/80 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/5">
                        <div
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-500 group-hover:bg-blue-500/20 transition-colors">
                            <span className="material-symbols-outlined">request_quote</span>
                        </div>
                        <div>
                            <p className="text-text-main font-semibold text-sm transition-colors">Optimal Quotes</p>
                            <p className="text-text-muted text-xs mt-0.5 group-hover:text-text-secondary transition-colors">AI-driven
                                valuation & insurance suggestions</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthLeftPanel;