import React from 'react';
import { 
  Youtube, 
  Instagram, 
  Users, 
  Calendar, 
  Trophy, 
  Gamepad2,
  Heart,
  Star,
  Play,
  Monitor,
  Mic
} from 'lucide-react';

const ProfileBRRADS = () => {
  const achievements = [
    { title: '480K+ Subscribers', description: 'YouTube Channel Growth', icon: Youtube, color: 'text-red-500' },
    { title: '10+ Years', description: 'Content Creation Experience', icon: Calendar, color: 'text-brrads-peach' },
    { title: '500+ Games', description: 'Games Played & Reviewed', icon: Gamepad2, color: 'text-brrads-red' },
    { title: 'Horror Specialist', description: 'Expert Horror Game Player', icon: Monitor, color: 'text-brrads-gray' }
  ];

  const personalInfo = [
    { label: 'Real Name', value: 'Reza' },
    { label: 'Channel Name', value: 'Reza Auditore' },
    { label: 'Origin', value: 'Bandung, Indonesia' },
    { label: 'Started YouTube', value: '2015' },
    { label: 'Content Focus', value: 'Horror Gaming & Entertainment' },
    { label: 'Signature Phrase', value: 'DAKSBRRADS!' }
  ];

  const milestones = [
    { year: '2015', event: 'Started YouTube Channel', description: 'Beginning of the journey' },
    { year: '2018', event: 'First Viral Video', description: 'Horror game reaction video went viral' },
    { year: '2020', event: '50K Subscribers', description: 'Community started growing rapidly' },
    { year: '2022', event: '100K Subscribers', description: 'Silver Play Button received' },
    { year: '2024', event: 'BRRADS Empire Born', description: 'Community platform launched' },
    { year: '2025', event: '480K+ Strong Community', description: 'Mental baja community solidified' }
  ];

  return (
    <div className="min-h-screen bg-brrads-light">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-brrads-black via-brrads-gray to-brrads-black text-white py-20">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23DA0037' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <div className="flex justify-center">
              <div className="bg-brrads-red p-6 rounded-2xl shadow-2xl">
                <span className="text-brrads-light font-black text-6xl">RA</span>
              </div>
            </div>
            
            <div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-4">
                <span className="bg-gradient-to-r from-brrads-red to-brrads-peach bg-clip-text text-transparent">
                  REZA AUDITORE
                </span>
              </h1>
              <p className="text-2xl text-brrads-peach font-bold mb-2">Content Creator & Gaming Enthusiast</p>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                YouTuber asal Bandung yang telah menghibur jutaan orang dengan konten gaming horror 
                dan membangun komunitas BRRADS Empire yang solid sejak 2015.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="https://www.youtube.com/@rezaauditore"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-200 transform hover:scale-105 shadow-2xl flex items-center space-x-2"
              >
                <Youtube size={24} />
                <span>Subscribe Channel</span>
              </a>
              
              <a
                href="https://www.instagram.com/rezaauditore/"
                target="_blank"
                rel="noopener noreferrer"
                className="border-2 border-white hover:bg-white hover:text-brrads-black text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
              >
                <Instagram size={24} />
                <span>Follow Instagram</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Pencapaian & Prestasi</h2>
            <p className="text-xl text-gray-600">Perjalanan membangun komunitas gaming terbesar Indonesia</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {achievements.map(({ title, description, icon: Icon, color }, index) => (
              <div key={index} className="text-center p-6 bg-gray-50 rounded-2xl hover:shadow-lg transition-shadow">
                <div className={`inline-flex p-4 rounded-full bg-white shadow-md mb-4`}>
                  <Icon size={32} className={color} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-600">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Personal Information */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-8">Tentang Reza Auditore</h2>
              
              <div className="space-y-6">
                <p className="text-lg text-gray-700 leading-relaxed">
                  Reza Auditore adalah seorang content creator yang telah menghibur jutaan penonton 
                  dengan konten gaming horror yang menegangkan dan menghibur. Dimulai dari hobi sederhana 
                  bermain game, kini ia telah membangun komunitas solid bernama <strong>BRRADS Empire</strong>.
                </p>
                
                <p className="text-lg text-gray-700 leading-relaxed">
                  Dikenal dengan slogan ikonik <strong>"DAKSBRRADS!"</strong> yang merupakan singkatan dari 
                  <em>"Barudak Reza Edan Pars"</em>, ia telah menciptakan identitas unik yang membedakannya 
                  dari content creator lainnya.
                </p>
                
                <p className="text-lg text-gray-700 leading-relaxed">
                  Dengan mental baja yang tak terkalahkan, Reza selalu siap menghadapi game horror 
                  terseram sekalipun, sambil tetap menghibur audiensnya dengan komentar khas dan 
                  reaksi yang natural.
                </p>
              </div>

              <div className="mt-8 bg-brrads-red bg-opacity-10 p-6 rounded-xl border border-brrads-red border-opacity-20">
                <h3 className="text-xl font-bold text-brrads-red mb-3">Filosofi BRRADS</h3>
                <p className="text-gray-700 italic">
                  "Mental baja bukan berarti tidak takut, tapi tetap berani meskipun takut. 
                  Itulah yang membuat kita menjadi BRRADS sejati!"
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Informasi Personal</h3>
              
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="space-y-4">
                  {personalInfo.map(({ label, value }, index) => (
                    <div key={index} className="flex justify-between items-center border-b border-gray-100 pb-3">
                      <span className="font-medium text-gray-600">{label}</span>
                      <span className="font-bold text-gray-900">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 text-center">
                <div className="bg-gradient-to-r from-brrads-red to-brrads-peach rounded-2xl p-8 text-white">
                  <div className="flex justify-center mb-4">
                    <Heart size={48} className="text-brrads-light" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">480K+ BRRADS Family</h3>
                  <p className="text-brrads-light">
                    Bergabunglah dengan komunitas mental baja terbesar Indonesia!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Perjalanan Karir</h2>
            <p className="text-xl text-gray-600">Timeline pencapaian dari tahun ke tahun</p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-px h-full w-0.5 bg-brrads-red"></div>
            
            <div className="space-y-12">
              {milestones.map(({ year, event, description }, index) => (
                <div key={index} className={`relative flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className={`flex-1 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                      <div className="text-brrads-red font-bold text-lg mb-1">{year}</div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{event}</h3>
                      <p className="text-gray-600">{description}</p>
                    </div>
                  </div>
                  
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-brrads-red rounded-full border-4 border-white shadow-lg"></div>
                  
                  <div className="flex-1"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-brrads-red to-brrads-peach">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-brrads-light mb-6">
            Mari Bergabung dengan BRRADS Empire!
          </h2>
          <p className="text-xl text-brrads-light mb-8 leading-relaxed">
            Buktikan mental baja-mu dan jadilah bagian dari komunitas gaming terbesar Indonesia. 
            Subscribe, follow, dan tunjukkan bahwa kamu adalah BRRADS sejati!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://www.youtube.com/@rezaauditore"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-brrads-black hover:bg-gray-800 text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-200 transform hover:scale-105 shadow-xl flex items-center justify-center space-x-2"
            >
              <Youtube size={24} />
              <span>Subscribe YouTube</span>
            </a>
            
            <a
              href="https://www.instagram.com/rezaauditore/"
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-brrads-black hover:bg-brrads-black hover:text-white text-brrads-black font-bold py-4 px-8 rounded-full text-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
            >
              <Instagram size={24} />
              <span>Follow Instagram</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProfileBRRADS;
