import React from "react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">J</span>
              </div>
              <span className="text-xl font-bold">June BNPL</span>
            </div>
            <p className="text-slate-400 mb-4 max-w-md">
              Buy now, pay later for sports assets on Chiliz Chain. Flexible payments with yield generation opportunities.
            </p>
            <div className="text-slate-400 text-sm">
              <span>Hackathon Demo • Chiliz Chain Integration</span>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Platform</h3>
            <ul className="space-y-2 text-slate-400">
              <li><span className="text-slate-500">Powered by Chiliz Chain</span></li>
              <li><span className="text-slate-500">Secure BNPL Solutions</span></li>
              <li><span className="text-slate-500">DeFi Integration</span></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-800 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between">
          <p className="text-slate-400 text-sm">© 2024 June BNPL. All rights reserved.</p>
          <div className="flex items-center space-x-4 text-slate-400 text-sm mt-4 sm:mt-0">
            <span>Powered by Chiliz Chain</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
