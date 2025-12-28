import Header from './components/Header'
import HeroSection from './components/HeroSection'
import VerificationDemo from './components/VerificationDemo'
import ReportersNotebook from './components/ReportersNotebook'
import FeaturesShowcase from './components/FeaturesShowcase'
import HowItWorks from './components/HowItWorks'
import CrisisFeed from './components/CrisisFeed'
import StatsDashboard from './components/StatsDashboard'
import CallToAction from './components/CallToAction'
import Footer from './components/Footer'
import QuickVerifyButton from './components/QuickVerifyButton'
import ScrollProgress from './components/ScrollProgress'
import AnimatedBackground from './components/AnimatedBackground'

function App() {
  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      <div className="relative z-10">
        <ScrollProgress />
        <Header />

        <main>
          <HeroSection />
          <VerificationDemo />
          <ReportersNotebook />
          <FeaturesShowcase />
          <HowItWorks />
          <CrisisFeed />
          <StatsDashboard />
          <CallToAction />
        </main>

        <Footer />
        <QuickVerifyButton />
      </div>
    </div>
  )
}

export default App
