import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import styled from 'styled-components';
import { 
  FaBrain, 
  FaChartLine, 
  FaSmile, 
  FaComments, 
  FaCamera, 
  FaChartBar,
  FaArrowRight
} from 'react-icons/fa';

// Styled components
const Container = styled.div`
  font-family: 'Inter', sans-serif;
  color: #333;
  overflow-x: hidden;
`;

const Section = styled.section`
  padding: 80px 0;

  @media (max-width: 768px) {
    padding: 60px 0;
  }
`;

const HeroSection = styled(Section)`
  background: linear-gradient(135deg, #f5f7fa 0%, #e4eaf5 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  position: relative;
`;

const HeroContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  @media (max-width: 968px) {
    flex-direction: column;
    text-align: center;
  }
`;

const HeroText = styled.div`
  flex: 1;
  padding-right: 40px;
  
  @media (max-width: 968px) {
    padding-right: 0;
    margin-bottom: 40px;
  }
`;

const HeroImage = styled.div`
  flex: 1;
  
  img {
    max-width: 100%;
    border-radius: 10px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }
`;

const Title = styled.h1`
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 20px;
  color: #2d3748;
  line-height: 1.2;
  
  span {
    color: #4299e1;
  }
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.25rem;
  line-height: 1.8;
  margin-bottom: 30px;
  color: #4a5568;
  max-width: 600px;
  
  @media (max-width: 968px) {
    margin: 0 auto 30px;
  }
`;

const Button = styled.button`
  background-color: #4299e1;
  color: white;
  border: none;
  padding: 15px 30px;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  
  &:hover {
    background-color: #3182ce;
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(66, 153, 225, 0.2);
  }
  
  svg {
    margin-left: 8px;
  }
`;

const ContentSection = styled(Section)`
  max-width: 1200px;
  margin: 0 auto;
  padding: 100px 20px;
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 60px;
`;

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const SectionSubtitle = styled.p`
  font-size: 1.1rem;
  color: #4a5568;
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.6;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  
  @media (max-width: 968px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

const FeatureCard = styled(motion.div)`
  background: white;
  padding: 40px 30px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }
`;

const FeatureIcon = styled.div`
  width: 70px;
  height: 70px;
  background: #ebf8ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 25px;
  
  svg {
    font-size: 30px;
    color: #4299e1;
  }
`;

const FeatureTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 15px;
  color: #2d3748;
`;

const FeatureDescription = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  color: #4a5568;
`;

const StatsSection = styled(Section)`
  background: linear-gradient(135deg, #4299e1 0%, #667eea 100%);
  color: white;
`;

const StatsContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
  
  @media (max-width: 968px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

const StatItem = styled(motion.div)`
  text-align: center;
`;

const StatNumber = styled.h3`
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 10px;
`;

const StatLabel = styled.p`
  font-size: 1.1rem;
  opacity: 0.9;
`;

const HowItWorksSection = styled(ContentSection)`
  background-color: #f7fafc;
`;

const StepContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
  
  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

const Step = styled(motion.div)`
  text-align: center;
`;

const StepNumber = styled.div`
  width: 60px;
  height: 60px;
  background: #4299e1;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 auto 25px;
`;

const StepTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 15px;
  color: #2d3748;
`;

const StepDescription = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  color: #4a5568;
`;

const StepImage = styled.img`
  max-width: 80%;
  margin: 25px auto 0;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
`;

const TestimonialsSection = styled(ContentSection)`
  background-color: white;
`;

const TestimonialGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const TestimonialCard = styled(motion.div)`
  background: #f7fafc;
  padding: 40px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
`;

const TestimonialText = styled.p`
  font-size: 1.1rem;
  line-height: 1.7;
  color: #4a5568;
  margin-bottom: 25px;
  font-style: italic;
`;

const TestimonialAuthor = styled.div`
  display: flex;
  align-items: center;
`;

const TestimonialAvatar = styled.img`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 15px;
`;

const TestimonialInfo = styled.div``;

const TestimonialName = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 5px;
  color: #2d3748;
`;

const TestimonialRole = styled.p`
  font-size: 0.9rem;
  color: #718096;
`;

const CTASection = styled(Section)`
  background: linear-gradient(135deg, #f5f7fa 0%, #e4eaf5 100%);
  text-align: center;
`;

const CTAContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
`;

const CTATitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const CTAText = styled.p`
  font-size: 1.2rem;
  color: #4a5568;
  margin-bottom: 40px;
  line-height: 1.6;
`;

const FooterSection = styled.footer`
  background-color: #2d3748;
  color: white;
  padding: 60px 0 30px;
`;

const FooterContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`;

const FooterTop = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 40px;
  margin-bottom: 60px;
  
  @media (max-width: 968px) {
    grid-template-columns: 1fr 1fr;
  }
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

const FooterLogo = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 20px;
  
  span {
    color: #4299e1;
  }
`;

const FooterAbout = styled.p`
  font-size: 0.9rem;
  line-height: 1.7;
  color: #a0aec0;
  margin-bottom: 25px;
`;

const FooterColumn = styled.div``;

const FooterColumnTitle = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 25px;
  color: white;
`;

const FooterLinks = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const FooterLink = styled.li`
  margin-bottom: 12px;
  
  a {
    color: #a0aec0;
    text-decoration: none;
    font-size: 0.9rem;
    transition: color 0.3s ease;
    
    &:hover {
      color: #4299e1;
    }
  }
`;

const FooterBottom = styled.div`
  text-align: center;
  padding-top: 30px;
  border-top: 1px solid #4a5568;
  color: #a0aec0;
  font-size: 0.9rem;
`;

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

// Component that handles scroll animations
const AnimatedSection = ({ children, className }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2
  });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  return (
    <motion.div
      className={className}
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={staggerContainer}
    >
      {children}
    </motion.div>
  );
};

const LandingPage = () => {
  return (
    <Container>
      <HeroSection>
        <HeroContent>
          <HeroText>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Title>Your Personal <span>Mental Health</span> AI Coach</Title>
              <Subtitle>
                Enhance your well-being with our AI-powered mental health platform that offers personalized support, real-time feedback, and data-driven insights to help you thrive.
              </Subtitle>
              <Button>
                Get Started <FaArrowRight />
              </Button>
            </motion.div>
          </HeroText>
          <HeroImage>
            <motion.img 
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80" 
              alt="AI Mental Health Coach"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            />
          </HeroImage>
        </HeroContent>
      </HeroSection>

      <ContentSection>
        <SectionHeader>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <SectionTitle>How We Help You</SectionTitle>
            <SectionSubtitle>
              Our AI-powered mental health platform offers personalized support through various innovative features
            </SectionSubtitle>
          </motion.div>
        </SectionHeader>

        <AnimatedSection>
          <FeaturesGrid>
            <FeatureCard variants={fadeInUp}>
              <FeatureIcon>
                <FaBrain />
              </FeatureIcon>
              <FeatureTitle>Personalized Coaching</FeatureTitle>
              <FeatureDescription>
                Our AI analyzes your patterns and behaviors to provide customized mental health guidance and support unique to your needs.
              </FeatureDescription>
            </FeatureCard>
            
            <FeatureCard variants={fadeInUp}>
              <FeatureIcon>
                <FaComments />
              </FeatureIcon>
              <FeatureTitle>Real-time Chat Support</FeatureTitle>
              <FeatureDescription>
                Connect with our AI coach anytime through real-time chat for immediate assistance, guidance, and emotional support.
              </FeatureDescription>
            </FeatureCard>
            
            <FeatureCard variants={fadeInUp}>
              <FeatureIcon>
                <FaCamera />
              </FeatureIcon>
              <FeatureTitle>Facial Recognition</FeatureTitle>
              <FeatureDescription>
                Our technology can analyze facial expressions to understand your emotions and provide more accurate support.
              </FeatureDescription>
            </FeatureCard>
            
            <FeatureCard variants={fadeInUp}>
              <FeatureIcon>
                <FaChartLine />
              </FeatureIcon>
              <FeatureTitle>Progress Tracking</FeatureTitle>
              <FeatureDescription>
                Monitor your mental health journey with detailed analytics and visualizations of your emotional patterns.
              </FeatureDescription>
            </FeatureCard>
            
            <FeatureCard variants={fadeInUp}>
              <FeatureIcon>
                <FaChartBar />
              </FeatureIcon>
              <FeatureTitle>Data Insights</FeatureTitle>
              <FeatureDescription>
                Gain valuable insights into your mental health patterns with comprehensive data visualization and analysis.
              </FeatureDescription>
            </FeatureCard>
            
            <FeatureCard variants={fadeInUp}>
              <FeatureIcon>
                <FaSmile />
              </FeatureIcon>
              <FeatureTitle>Positive Reinforcement</FeatureTitle>
              <FeatureDescription>
                Get uplifting feedback and fun visuals to celebrate your progress and keep you motivated on your wellness journey.
              </FeatureDescription>
            </FeatureCard>
          </FeaturesGrid>
        </AnimatedSection>
      </ContentSection>

      <StatsSection>
        <AnimatedSection>
          <StatsContainer>
            <StatItem variants={fadeInUp}>
              <StatNumber>87%</StatNumber>
              <StatLabel>User Satisfaction</StatLabel>
            </StatItem>
            
            <StatItem variants={fadeInUp}>
              <StatNumber>65%</StatNumber>
              <StatLabel>Stress Reduction</StatLabel>
            </StatItem>
            
            <StatItem variants={fadeInUp}>
              <StatNumber>500K+</StatNumber>
              <StatLabel>Active Users</StatLabel>
            </StatItem>
            
            <StatItem variants={fadeInUp}>
              <StatNumber>94%</StatNumber>
              <StatLabel>Accuracy Rate</StatLabel>
            </StatItem>
          </StatsContainer>
        </AnimatedSection>
      </StatsSection>

      <HowItWorksSection>
        <SectionHeader>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <SectionTitle>How It Works</SectionTitle>
            <SectionSubtitle>
              Our platform combines cutting-edge AI with proven therapeutic techniques to deliver a comprehensive mental health solution
            </SectionSubtitle>
          </motion.div>
        </SectionHeader>

        <AnimatedSection>
          <StepContainer>
            <Step variants={fadeInUp}>
              <StepNumber>1</StepNumber>
              <StepTitle>Chat and Connect</StepTitle>
              <StepDescription>
                Engage with our AI coach through real-time chat to discuss your feelings, challenges, and goals.
              </StepDescription>
              <StepImage src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80" alt="Chat Interface" />
            </Step>
            
            <Step variants={fadeInUp}>
              <StepNumber>2</StepNumber>
              <StepTitle>Facial Analysis</StepTitle>
              <StepDescription>
                Our facial recognition technology analyzes your expressions to understand your emotional state.
              </StepDescription>
              <StepImage src="https://images.unsplash.com/photo-1508387027939-27cccde53673?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80" alt="Facial Recognition" />
            </Step>
            
            <Step variants={fadeInUp}>
              <StepNumber>3</StepNumber>
              <StepTitle>Personalized Insights</StepTitle>
              <StepDescription>
                Receive data-driven insights, progress reports, and fun visual feedback to improve your mental wellbeing.
              </StepDescription>
              <StepImage src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80" alt="Data Visualization" />
            </Step>
          </StepContainer>
        </AnimatedSection>
      </HowItWorksSection>

      <TestimonialsSection>
        <SectionHeader>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <SectionTitle>What Our Users Say</SectionTitle>
            <SectionSubtitle>
              Hear from people who have transformed their mental wellbeing with our AI coach
            </SectionSubtitle>
          </motion.div>
        </SectionHeader>

        <AnimatedSection>
          <TestimonialGrid>
            <TestimonialCard variants={fadeInUp}>
              <TestimonialText>
                "This AI coach has been a game-changer for my anxiety. The real-time support and personalized insights have helped me understand my triggers and develop healthier coping mechanisms."
              </TestimonialText>
              <TestimonialAuthor>
                <TestimonialAvatar src="https://randomuser.me/api/portraits/women/45.jpg" alt="Sarah J." />
                <TestimonialInfo>
                  <TestimonialName>Sarah J.</TestimonialName>
                  <TestimonialRole>Marketing Executive</TestimonialRole>
                </TestimonialInfo>
              </TestimonialAuthor>
            </TestimonialCard>
            
            <TestimonialCard variants={fadeInUp}>
              <TestimonialText>
                "I was skeptical about an AI helping with mental health, but I've been amazed by the accuracy and helpfulness. The facial recognition feature is surprisingly good at detecting when I'm stressed."
              </TestimonialText>
              <TestimonialAuthor>
                <TestimonialAvatar src="https://randomuser.me/api/portraits/men/32.jpg" alt="Michael T." />
                <TestimonialInfo>
                  <TestimonialName>Michael T.</TestimonialName>
                  <TestimonialRole>Software Engineer</TestimonialRole>
                </TestimonialInfo>
              </TestimonialAuthor>
            </TestimonialCard>
            
            <TestimonialCard variants={fadeInUp}>
              <TestimonialText>
                "The data visualizations have been eye-opening. Seeing patterns in my mood has helped me make simple lifestyle changes that have improved my mental health significantly."
              </TestimonialText>
              <TestimonialAuthor>
                <TestimonialAvatar src="https://randomuser.me/api/portraits/women/68.jpg" alt="Jessica K." />
                <TestimonialInfo>
                  <TestimonialName>Jessica K.</TestimonialName>
                  <TestimonialRole>Teacher</TestimonialRole>
                </TestimonialInfo>
              </TestimonialAuthor>
            </TestimonialCard>
            
            <TestimonialCard variants={fadeInUp}>
              <TestimonialText>
                "I love the fun images and positive reinforcement. It makes working on my mental health feel less clinical and more like a journey with a supportive friend."
              </TestimonialText>
              <TestimonialAuthor>
                <TestimonialAvatar src="https://randomuser.me/api/portraits/men/75.jpg" alt="David R." />
                <TestimonialInfo>
                  <TestimonialName>David R.</TestimonialName>
                  <TestimonialRole>Business Owner</TestimonialRole>
                </TestimonialInfo>
              </TestimonialAuthor>
            </TestimonialCard>
          </TestimonialGrid>
        </AnimatedSection>
      </TestimonialsSection>

      <CTASection>
        <CTAContainer>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <CTATitle>Begin Your Mental Wellness Journey Today</CTATitle>
            <CTAText>
              Join thousands of users who are already experiencing the benefits of our AI-powered mental health coaching platform.
            </CTAText>
            <Button>
              Start Free Trial <FaArrowRight />
            </Button>
          </motion.div>
        </CTAContainer>
      </CTASection>

      <FooterSection>
        <FooterContainer>
          <FooterTop>
            <div>
              <FooterLogo>Mental<span>Coach</span>AI</FooterLogo>
              <FooterAbout>
                We're dedicated to making mental health support accessible to everyone through innovative AI technology and data-driven insights.
              </FooterAbout>
            </div>
            
            <FooterColumn>
              <FooterColumnTitle>Company</FooterColumnTitle>
              <FooterLinks>
                <FooterLink><a href="#">About</a></FooterLink>
                <FooterLink><a href="#">Team</a></FooterLink>
                <FooterLink><a href="#">Careers</a></FooterLink>
                <FooterLink><a href="#">Press</a></FooterLink>
              </FooterLinks>
            </FooterColumn>
            
            <FooterColumn>
              <FooterColumnTitle>Resources</FooterColumnTitle>
              <FooterLinks>
                <FooterLink><a href="#">Blog</a></FooterLink>
                <FooterLink><a href="#">Research</a></FooterLink>
                <FooterLink><a href="#">Help Center</a></FooterLink>
                <FooterLink><a href="#">Testimonials</a></FooterLink>
              </FooterLinks>
            </FooterColumn>
            
            <FooterColumn>
              <FooterColumnTitle>Legal</FooterColumnTitle>
              <FooterLinks>
                <FooterLink><a href="#">Privacy Policy</a></FooterLink>
                <FooterLink><a href="#">Terms of Service</a></FooterLink>
                <FooterLink><a href="#">Data Protection</a></FooterLink>
                <FooterLink><a href="#">Accessibility</a></FooterLink>
              </FooterLinks>
            </FooterColumn>
          </FooterTop>
          
          <FooterBottom>
            <p>&copy; {new Date().getFullYear()} MentalCoachAI. All rights reserved.</p>
          </FooterBottom>
        </FooterContainer>
      </FooterSection>
    </Container>
  );
};

export default LandingPage; 