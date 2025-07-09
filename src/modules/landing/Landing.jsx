import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css';
import telusLogo from '../../assets/telus_logo.svg';

const Landing = () => {
  const navigate = useNavigate();
  const sectionRefs = useRef([]);

  const handleSignIn = () => {
    navigate('/login');
  };

  const handleSignUp = () => {
    navigate('/signup');
  };

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      sectionRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);
  return (
    <div className="landing">
      {/* Navigation */}
      <nav className="nav-landing">
        <div className="nav-left">
          <div className="logo">
            <img src={telusLogo} alt="Telus Logo" />
          </div>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#why">Why Telus</a>
            <a href="#resources">Resources</a>
            <a href="#about">About</a>
            <a href="#community">Community</a>
          </div>
        </div>
        <div className="nav-right">
          <button className="btn-sign-in" onClick={handleSignIn}>Sign in</button>
          <button className="btn-primary" onClick={handleSignUp}>Sign up</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero animate-section" ref={(el) => (sectionRefs.current[0] = el)}>
        <div className="hero-content">
          <h1 className="hero-title">
            The <em>only</em> hiring platform you'll ever need
          </h1>
          <p className="hero-subtitle">
            Save more, hire with confidence and move faster with AI-powered tools that streamline every step of the hiring process - from sourcing to onboarding.
          </p>
          <div className="hero-cta">
            <button className="btn-primary">Learn more</button>
          </div>
        </div>
        <div className="hero-images">
          <div className="chat-bubble top-left">
            <img src="/images/chat/profile-chat.png" alt="Profile chat" />
          </div>
          <div className="chat-bubble top-right">
            <img src="/images/chat/team-chat.png" alt="Team chat" />
          </div>
          <div className="chat-bubble bottom-left">
            <img src="/images/chat/metrics.png" alt="Metrics" />
          </div>
          <div className="chat-bubble bottom-right">
            <img src="/images/chat/candidates.png" alt="Candidates" />
          </div>
        </div>
      </section>

      {/* Split CTA Section */}
      <section className="split-cta animate-section delay-1" ref={(el) => (sectionRefs.current[1] = el)}>
        <div className="cta-box">
          <h2>Ready to find your dream job?</h2>
          <button className="btn-secondary">See available job openings</button>
        </div>
        <div className="cta-box">
          <h2>A new way to filter your hiring funnel</h2>
          <button className="btn-secondary">Learn more from Team</button>
        </div>
      </section>

      {/* Feature Section */}
      <section className="feature-highlight animate-section delay-2" ref={(el) => (sectionRefs.current[2] = el)}>
        <div className="feature-content">
          <h2>Save money and make the best hires – every time</h2>
          <p>Reduce recruiting costs with a flexible, end-to-end hiring platform powered by AI - built to help you make smart strategic hiring decisions and to grow with you.</p>
          <div className="feature-cta">
            <button className="btn-secondary">See enterprise solutions</button>
            <a href="#talk" className="link-secondary">Talk to an expert</a>
          </div>
        </div>
        <div className="feature-image">
          <img src="/images/features/team-meeting.jpg" alt="Team meeting" />
        </div>
      </section>

      {/* Features Grid */}
      <section className="features-grid animate-section delay-3" ref={(el) => (sectionRefs.current[3] = el)}>
        <h2>The best teams start with hiring – and the best hiring starts with Telus</h2>
        <div className="grid">
          <div className="grid-item">
            <div className="grid-image">
              <img src="/images/features/platform.jpg" alt="Platform features" />
            </div>
            <h3>Everything you need to hire, in one platform</h3>
            <p>Stop wasting time with scattered recruiting scripts and start saving money. Telus offers all you'll ever need to streamline your recruiting flow, consistently and quality.</p>
            <a href="#explore" className="link-primary">Explore platform</a>
          </div>
          <div className="grid-item">
            <div className="grid-image">
              <img src="/images/features/scale.jpg" alt="Scaling features" />
            </div>
            <h3>Flex and scale with ease</h3>
            <p>Telus has everything you need to hire the right people. Plus, you can customize your plan to meet platform needs, ensuring a great value and return on your investment.</p>
            <a href="#solutions" className="link-primary">See enterprise solutions</a>
          </div>
          <div className="grid-item">
            <div className="grid-image">
              <img src="/images/features/future.jpg" alt="Future-proof features" />
            </div>
            <h3>Future-proof your hiring</h3>
            <p>Telus has the best-in-class hiring infrastructure for companies that want to scale. Our open architecture lets you build a scalable, sustainable hiring machine.</p>
            <a href="#platform" className="link-primary">Learn about the platform</a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer animate-section delay-3" ref={(el) => (sectionRefs.current[4] = el)}>
        <div className="footer-top">
          <h2>Everything you need to get better at hiring</h2>
          <button className="btn-primary" onClick={handleSignUp}>Sign up</button>
        </div>
        <div className="footer-content">
          <div className="footer-column">
            <h4>Only in Telus</h4>
            <ul>
              <li>Latest product features</li>
              <li>Pricing</li>
              <li>API</li>
              <li>Ethical principles</li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>How we compare</h4>
            <ul>
              <li>Built-in job listing</li>
              <li>Your partner in success</li>
              <li>End-to-end business</li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>Company</h4>
            <ul>
              <li>Press & awards</li>
              <li>Careers</li>
              <li>Contact</li>
              <li>Partners</li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>Modern Recruiter newsletter</h4>
            <p>Job market insights, tips and more</p>
            <button className="btn-secondary">Choose your interest</button>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="social-links">
            <a href="#facebook">Facebook</a>
            <a href="#twitter">Twitter</a>
            <a href="#linkedin">LinkedIn</a>
            <a href="#instagram">Instagram</a>
            <a href="#youtube">YouTube</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
