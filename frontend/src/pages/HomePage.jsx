import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Search, Briefcase, Star, CheckCircle, ShieldCheck, Users, ShoppingBag, ArrowRight } from 'lucide-react';
import { Badge } from '../components/ui/badge';

const HomePage = () => {
  const categories = [
    { name: 'Plumbing', icon: '🔧', count: '120+ Jobs' },
    { name: 'Electrical', icon: '⚡', count: '85+ Jobs' },
    { name: 'Painting', icon: '🎨', count: '64+ Jobs' },
    { name: 'Cleaning', icon: '🧹', count: '150+ Jobs' },
    { name: 'Tutoring', icon: '📚', count: '200+ Jobs' },
    { name: 'Appliance Repair', icon: '🔌', count: '45+ Jobs' },
    { name: 'Gardening', icon: '🌿', count: '30+ Jobs' },
    { name: 'Moving', icon: '📦', count: '55+ Jobs' },
  ];

  return (
    <div className="flex flex-col">
      {/* Fiverr-Style Hero Section */}
      <section className="relative bg-[#0b3a29] overflow-hidden">
        {/* Background Graphic elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none mix-blend-overlay">
          <img src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80&w=1000" alt="background" className="w-full h-full object-cover" />
        </div>
        
        <div className="container py-24 sm:py-32 px-4 sm:px-8 relative z-10 flex flex-col items-center justify-center text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight max-w-4xl mb-6 drop-shadow-lg">
            Find the perfect <span className="font-serif italic font-light text-primary-foreground">local</span> service for your business
          </h1>
          
          <div className="w-full max-w-3xl mt-4 relative animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center bg-white rounded-md overflow-hidden p-1 shadow-2xl ring-4 ring-white/10">
              <div className="flex-1 flex items-center pl-4">
                <Search className="h-6 w-6 text-slate-400" />
                <Input 
                  placeholder="What service are you looking for today?" 
                  className="border-none shadow-none focus-visible:ring-0 text-lg h-12 w-full text-slate-900"
                />
              </div>
              <Button size="lg" className="h-12 px-8 rounded-md text-lg font-bold bg-primary hover:bg-primary/90 text-white transition-all">
                Search
              </Button>
            </div>
            
            <div className="mt-6 flex flex-wrap justify-center gap-3 text-white/80 items-center">
              <span className="text-sm font-bold opacity-80">Popular:</span>
              {['Home Repair', 'Deep Cleaning', 'Electrician', 'Private Tutor'].map(tag => (
                <Badge key={tag} variant="outline" className="text-white border-white/30 hover:bg-white hover:text-[#0b3a29] cursor-pointer transition-colors px-3 py-1 text-xs rounded-full bg-white/5 backdrop-blur-sm">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Banner */}
      <section className="bg-slate-50 border-b py-6">
        <div className="container px-4 sm:px-8 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
          <span className="text-sm font-bold text-slate-400 mb-2 md:mb-0">Trusted by:</span>
          <div className="flex flex-wrap justify-center gap-8 md:gap-12 opacity-80">
             {/* Mock enterprise logos using text as placeholder */}
             <span className="font-serif text-2xl font-bold text-slate-800">META</span>
             <span className="font-sans text-2xl font-black text-slate-800 tracking-tighter">Google</span>
             <span className="font-mono text-2xl font-bold text-slate-800">NETFLIX</span>
             <span className="font-sans text-2xl font-bold text-slate-800 italic">P&G</span>
             <span className="font-sans text-2xl font-bold text-slate-800">PayPay</span>
          </div>
        </div>
      </section>

      {/* Categories Horizontal Slider (Fiverr Style) */}
      <section className="container py-20 px-4 sm:px-8">
        <h2 className="text-3xl font-bold mb-8">Popular Services</h2>
        
        {/* Horizontal scroll container */}
        <div className="flex overflow-x-auto pb-8 -mx-4 px-4 sm:mx-0 sm:px-0 gap-6 hide-scrollbar snap-x">
          {categories.map((cat, i) => (
            <Link key={cat.name} to="/services" className="min-w-[240px] sm:min-w-[280px] snap-start group relative rounded-xl overflow-hidden cursor-pointer">
              {/* Abstract Colored Background matching Fiverr's solid category boxes */}
              <div className={`h-64 w-full p-6 text-white flex flex-col justify-between transition-transform duration-500 group-hover:scale-105 ${
                  ['bg-[#00732e]','bg-[#ff7640]','bg-[#003912]','bg-[#4d1727]','bg-[#687200]', 'bg-[#b60000]', 'bg-[#1b2f4f]', 'bg-[#1f1f1f]'][i % 8]
                }`}>
                <div>
                  <span className="text-sm font-medium opacity-80 mb-2 block border-t-2 border-white/30 pt-2 w-12">{cat.count}</span>
                  <h3 className="font-bold text-2xl leading-tight">{cat.name}</h3>
                </div>
                <div className="text-6xl self-end drop-shadow-xl">{cat.icon}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Value Proposition */}
      <section className="bg-green-50 py-24">
        <div className="container px-4 sm:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-extrabold mb-8 text-slate-900 leading-tight">
                A whole world of freelance talent at your fingertips
              </h2>
              <div className="space-y-8">
                {[
                  { title: 'The best for every budget', desc: 'Find high-quality services at every price point. No hourly rates, just project-based pricing.', icon: <CheckCircle className="h-8 w-8 text-slate-400" /> },
                  { title: 'Quality work done quickly', desc: 'Find the right freelancer to begin working on your project within minutes.', icon: <CheckCircle className="h-8 w-8 text-slate-400" /> },
                  { title: 'Protected payments, every time', desc: 'Always know what you\'ll pay upfront. Your payment isn\'t released until you approve the work.', icon: <CheckCircle className="h-8 w-8 text-slate-400" /> },
                ].map((item, index) => (
                  <div key={index} className="flex gap-4 items-start">
                    <div className="mt-1">{item.icon}</div>
                    <div>
                      <h4 className="font-bold text-xl mb-1 text-slate-800">{item.title}</h4>
                      <p className="text-slate-600 text-lg leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative rounded-xl overflow-hidden shadow-2xl">
               <img src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1000" alt="Team working" className="w-full h-auto" />
               <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center cursor-pointer hover:bg-black/10 transition-colors">
                  <div className="bg-white/90 backdrop-blur rounded-full p-4 transform transition-transform hover:scale-110">
                     <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-24 px-4 sm:px-8 text-center text-white relative rounded-3xl overflow-hidden my-12 bg-gradient-to-br from-[#440f3c] via-[#1b0a3a] to-[#0b3a29]">
         <div className="absolute inset-0 opacity-20 pointer-events-none">
           <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
           <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl" />
         </div>
         <div className="relative z-10 py-12">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-8 max-w-3xl mx-auto leading-tight">
            Find the <span className="font-serif italic font-normal">talent</span> needed to get your business <span className="font-serif italic font-normal">growing</span>.
          </h2>
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-bold text-lg px-8 py-6 rounded-md">
            Get Started <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
         </div>
      </section>
    </div>
  );
};

export default HomePage;
