import React from 'react';
import { Heart, Youtube, Instagram, Users } from 'lucide-react';
import bradsLogo from '../assets/brrads-logo.png';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-brrads-black via-brrads-gray to-brrads-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and Description */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img 
                src={bradsLogo} 
                alt="BRRADS Empire Logo" 
                className="h-10 w-10"
              />
              <span className="font-bold text-xl">BRRADS EMPIRE</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Komunitas yang dibuat oleh YouTuber Reza Auditore untuk para BRRADS (Barudak Reza Edan Pars). 
              Tempat berkumpulnya para gamers dengan mental baja!
            </p>
            <div className="flex items-center space-x-1 text-brrads-peach">
              <Users size={16} />
              <span className="text-sm">480K+ BRRADS Community</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-brrads-peach">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#about" className="text-gray-300 hover:text-brrads-peach transition-colors">
                  Tentang BRRADS
                </a>
              </li>
              <li>
                <a href="#games" className="text-gray-300 hover:text-brrads-peach transition-colors">
                  Request Game
                </a>
              </li>
              <li>
                <a href="#fanart" className="text-gray-300 hover:text-brrads-peach transition-colors">
                  Fan Art Gallery
                </a>
              </li>
              <li>
                <a href="#subathon" className="text-gray-300 hover:text-brrads-peach transition-colors">
                  Subathon Series
                </a>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-brrads-peach">Follow Reza Auditore</h3>
            <div className="space-y-3">
              <a
                href="https://www.youtube.com/@rezaauditore"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 text-gray-300 hover:text-red-400 transition-colors group"
              >
                <div className="bg-red-600 p-2 rounded-lg group-hover:bg-red-500 transition-colors">
                  <Youtube size={16} />
                </div>
                <div>
                  <div className="font-medium">YouTube</div>
                  <div className="text-xs">@rezaauditore</div>
                </div>
              </a>
              
              <a
                href="https://www.instagram.com/rezaauditore/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 text-gray-300 hover:text-brrads-peach transition-colors group"
              >
                <div className="bg-gradient-to-r from-brrads-red to-brrads-peach p-2 rounded-lg group-hover:from-red-700 group-hover:to-amber-400 transition-all">
                  <Instagram size={16} />
                </div>
                <div>
                  <div className="font-medium">Instagram</div>
                  <div className="text-xs">@rezaauditore</div>
                </div>
              </a>
            </div>

            {/* Motto */}
            <div className="bg-brrads-red bg-opacity-20 p-3 rounded-lg border border-brrads-red border-opacity-30">
              <p className="text-brrads-peach font-bold text-sm text-center">
                "DAKSBRRADS!"
              </p>
              <p className="text-xs text-center text-gray-300 mt-1">
                Barudak Reza Edan Pars!
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white border-opacity-20 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-300">
              © 2025 BRRADS EMPIRE. Made with{' '}
              <Heart size={14} className="inline text-brrads-red" />{' '}
              for the BRRADS Community.
            </div>
            
            <div className="flex items-center space-x-4 text-xs text-gray-400">
              <span>Developed by ReyRiz</span>
              <span>•</span>
              <span>Powered by React</span>
              <span>•</span>
              <span>Database: SQLite</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
