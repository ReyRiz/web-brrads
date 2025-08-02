import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Gamepad2, 
  Palette, 
  Users, 
  Youtube, 
  Trophy,
  Zap,
  Heart,
  Star
} from 'lucide-react';
import bradsLogo from '../assets/brrads-logo.png';

const Home = () => {
  const stats = [
    { icon: Users, label: 'BRRADS Members', value: '480K+', color: 'text-brrads-red' },
    { icon: Youtube, label: 'YouTube Subscribers', value: '480K+', color: 'text-brrads-red' },
    { icon: Gamepad2, label: 'Games Played', value: '500+', color: 'text-brrads-peach' },
    { icon: Palette, label: 'Fan Arts', value: '100+', color: 'text-brrads-red' }
  ];

  const features = [
    {
      icon: Gamepad2,
      title: 'Request Game',
      description: 'Submit game requests untuk dimainkan oleh Reza Auditore. Sistem otomatis deteksi duplikat!',
      link: '/games',
      color: 'from-brrads-red to-brrads-peach'
    },
    {
      icon: Palette,
      title: 'Fan Art Gallery',
      description: 'Upload dan showcase karya seni terbaik dari komunitas BRRADS Empire.',
      link: '/fanart',
      color: 'from-brrads-peach to-brrads-red'
    },
    {
      icon: Trophy,
      title: 'Subathon Series',
      description: 'Lihat koleksi lengkap series Subathon dan game-game epic yang sudah dimainkan.',
      link: '/games?filter=played',
      color: 'from-brrads-red to-brrads-black'
    }
  ];

  const brradLevels = [
    { name: 'B Coklat', description: 'Mental baja seberat biji jagung dibagi 8', color: 'bg-amber-700' },
    { name: 'B Silver', description: 'Mental baja sebesar biji jagung, kanjud 4cm', color: 'bg-gray-400' },
    { name: 'B Kuning', description: 'Telah melewati latihan pengeras kanjud 8cm', color: 'bg-brrads-peach' },
    { name: 'B Merah', description: 'Mental sekeras aluminium, kanjud 12cm', color: 'bg-brrads-red' },
    { name: 'B Berapi-Api', description: 'Selangkah lagi menyentuh Mental Keabadian', color: 'bg-gradient-to-r from-brrads-red to-brrads-peach' },
    { name: 'B MERAH MERONA', description: 'Mental tak terkalahkan! Sangat langka!', color: 'bg-gradient-to-r from-brrads-red to-brrads-black' }
  ];

  return (
    <div className="min-h-screen bg-brrads-light">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-brrads-black via-brrads-gray to-brrads-black text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center space-y-8">
            <div className="flex justify-center">
              <img 
                src={bradsLogo} 
                alt="BRRADS Empire Logo" 
                className="h-20 w-20 md:h-24 md:w-24"
              />
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black tracking-tight">
              <span className="bg-gradient-to-r from-brrads-red to-brrads-peach bg-clip-text text-transparent">
                BRRADS
              </span>
              <br />
              <span className="text-white">EMPIRE</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
              Komunitas gaming terbesar untuk para{' '}
              <span className="text-brrads-peach font-bold">BRRADS</span> (Barudak Reza Edan Pars)!
              <br />
              Tempat berkumpulnya gamers dengan mental baja yang tak terkalahkan.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/games"
                className="bg-brrads-red hover:bg-red-700 text-brrads-light font-bold py-4 px-8 rounded-full text-lg transition-all duration-200 transform hover:scale-105 shadow-2xl flex items-center space-x-2"
              >
                <Gamepad2 size={24} />
                <span>Request Game Sekarang!</span>
              </Link>
              
              <Link
                to="/fanart"
                className="border-2 border-white hover:bg-white hover:text-brrads-black text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
              >
                <Palette size={24} />
                <span>Upload Fan Art</span>
              </Link>
            </div>

            <div className="flex flex-wrap justify-center gap-8 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-brrads-peach">DAKSBRRADS!</div>
                <div className="text-sm text-gray-300">Slogan Legendaris</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map(({ icon: Icon, label, value, color }, index) => (
              <div key={index} className="text-center space-y-2">
                <div className={`inline-flex p-3 rounded-full bg-gray-100 ${color}`}>
                  <Icon size={32} />
                </div>
                <div className="text-3xl font-bold text-gray-900">{value}</div>
                <div className="text-sm text-gray-600">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Fitur Utama BRRADS Empire
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Platform lengkap untuk komunitas gaming dengan berbagai fitur menarik
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map(({ icon: Icon, title, description, link, color }, index) => (
              <Link
                key={index}
                to={link}
                className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${color} text-white mb-6 group-hover:scale-110 transition-transform`}>
                  <Icon size={32} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
                <p className="text-gray-600 leading-relaxed">{description}</p>
                <div className="mt-6 flex items-center text-brrads-red font-semibold">
                  <span>Explore</span>
                  <Zap size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* BRRADS Levels Section */}
      <section className="py-20 bg-gradient-to-br from-brrads-black to-brrads-gray text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Tingkatan BRRADS</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Setiap BRRADS memiliki level mental baja yang berbeda. Kamu di level mana?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {brradLevels.map(({ name, description, color }, index) => (
              <div
                key={index}
                className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20 hover:bg-opacity-20 transition-all duration-300"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`w-4 h-4 rounded-full ${color}`}></div>
                  <h3 className="text-xl font-bold text-brrads-peach">{name}</h3>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <div className="bg-brrads-red bg-opacity-20 border border-brrads-red border-opacity-30 rounded-xl p-6 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-brrads-peach mb-2">Mau Jadi BRRADS?</h3>
              <p className="text-gray-300 text-sm mb-4">
                Syarat: Subscribe channel YouTube Reza Auditore + Mental baja + Rp5.000
              </p>
              <a
                href="https://www.youtube.com/@rezaauditore"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-full transition-colors"
              >
                <Youtube size={20} />
                <span>Subscribe Sekarang!</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Tentang Reza Auditore
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                Seorang YouTuber Gaming muda yang berasal dari Bandung. Ia berhasil merintis 
                karirnya di dunia YouTube sejak tahun 2015, dengan konten Game Horror dan 
                humor yang menghibur.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                Dikenal dengan slogan ikonik <strong>"DAKSBRRADS!"</strong> (Barudak Reza Edan Pars), 
                ia telah membangun komunitas solid dengan lebih dari 480 ribu subscribers yang setia.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <a
                  href="https://www.youtube.com/@rezaauditore"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-full transition-colors"
                >
                  <Youtube size={20} />
                  <span>Channel YouTube</span>
                </a>
                <a
                  href="https://www.instagram.com/rezaauditore/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 bg-gradient-to-r from-brrads-red to-brrads-peach hover:from-red-700 hover:to-amber-400 text-white font-semibold py-3 px-6 rounded-full transition-all"
                >
                  <Heart size={20} />
                  <span>Instagram</span>
                </a>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-brrads-red to-brrads-black rounded-2xl p-8 text-white">
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 bg-brrads-peach rounded-full mx-auto flex items-center justify-center">
                    <Star size={48} className="text-brrads-black" />
                  </div>
                  <h3 className="text-2xl font-bold">Reza Auditore</h3>
                  <p className="text-brrads-light">Content Creator & Gaming Enthusiast</p>
                  <div className="flex justify-center space-x-4 pt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">480K+</div>
                      <div className="text-sm text-brrads-light">Subscribers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">10+</div>
                      <div className="text-sm text-brrads-light">Years</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">500+</div>
                      <div className="text-sm text-brrads-light">Games</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-brrads-red to-brrads-peach">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-brrads-light mb-6">
            Bergabunglah dengan BRRADS Empire!
          </h2>
          <p className="text-xl text-brrads-light mb-8 leading-relaxed">
            Jadilah bagian dari komunitas gaming terbesar Indonesia. Submit game request, 
            upload fan art, dan tunjukkan mental baja-mu!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/games"
              className="bg-brrads-black hover:bg-gray-800 text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-200 transform hover:scale-105 shadow-xl flex items-center justify-center space-x-2"
            >
              <Gamepad2 size={24} />
              <span>Request Game</span>
            </Link>
            
            <Link
              to="/fanart"
              className="border-2 border-brrads-black hover:bg-brrads-black hover:text-white text-brrads-black font-bold py-4 px-8 rounded-full text-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
            >
              <Palette size={24} />
              <span>Upload Fan Art</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
