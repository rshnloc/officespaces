import {
  HiOutlineBuildingOffice2,
  HiOutlineDocumentText,
  HiOutlineGlobeAlt,
  HiOutlineCalculator,
  HiOutlineBriefcase,
  HiOutlineComputerDesktop,
} from 'react-icons/hi2';
import type { IconType } from 'react-icons';

// ============================================
// Types
// ============================================

export interface Service {
  icon: IconType;
  title: string;
  description: string;
}

export interface Testimonial {
  name: string;
  title: string;
  company: string;
  quote: string;
  rating: number;
  avatar: string;
}

export interface Location {
  city: string;
}

export interface Stat {
  value: string;
  label: string;
}

export interface FooterLink {
  label: string;
  href: string;
}

export interface DepartmentEmail {
  no: number;
  email: string;
  purpose: string;
  department: string;
  category: 'General' | 'Operations' | 'Finance' | 'Executive' | 'Professional' | 'Technical' | 'Sales';
}

// ============================================
// Data
// ============================================

export const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'About Us', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Locations', href: '#locations' },
  { label: 'Directory', href: '#emails' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Contact Us', href: '#contact' },
];

export const SERVICES: Service[] = [
  {
    icon: HiOutlineBriefcase,
    title: 'Business Registration',
    description:
      'End-to-end business registration support for startups, entrepreneurs, and growing businesses, including documentation and registration assistance.',
  },
  {
    icon: HiOutlineComputerDesktop,
    title: 'IT Services',
    description:
      'Professional IT solutions for businesses, including website development, application development, and other digital technology services.',
  },
  {
    icon: HiOutlineDocumentText,
    title: 'GST Registration',
    description:
      'Hassle-free GST registration for your business with expert guidance and quick processing.',
  },
  {
    icon: HiOutlineBuildingOffice2,
    title: 'Virtual Office',
    description:
      'Professional business address with mail handling and call management services.',
  },
  {
    icon: HiOutlineGlobeAlt,
    title: 'Co-working Space',
    description:
      'Modern, flexible and fully equipped co-working spaces to boost productivity.',
  },
  {
    icon: HiOutlineCalculator,
    title: 'CA & Business Services',
    description:
      'Complete range of CA services including compliance, filing, consulting, and more.',
  },
];

export const STATS: Stat[] = [
  { value: '500+', label: 'Happy Clients' },
  { value: '25+', label: 'Business Solutions' },
  { value: '10+', label: 'Locations' },
  { value: '99%', label: 'Client Satisfaction' },
];

export const LOCATIONS: Location[] = [
  { city: 'Patna' },
  { city: 'Delhi NCR' },
  { city: 'Mumbai' },
  { city: 'Bangalore' },
  { city: 'Hyderabad' },
  { city: 'Pune' },
  { city: 'Noida' },
  { city: 'Gurgaon' },
  { city: 'And More...' },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Alex Morgan',
    title: 'Founder & CEO',
    company: 'TechVista Labs',
    quote:
      '"GramWork Spaces helped us get our business registration and setup quickly, and their virtual office service is top-notch."',
    rating: 5,
    avatar: '/images/avatar-rohit.png',
  },
  {
    name: 'Sarah Jenkins',
    title: 'Co-founder',
    company: 'Brandsy Global',
    quote:
      '"The workspace solutions and modern facilities are amazing! Great environment and very professional team."',
    rating: 5,
    avatar: '/images/avatar-neha.png',
  },
  {
    name: 'Michael Chen',
    title: 'Managing Director',
    company: 'FinEdge Capital',
    quote:
      '"All our compliance, business documentation, and conference room needs are handled seamlessly. Highly recommended!"',
    rating: 5,
    avatar: '/images/avatar-arjun.png',
  },
];

export const ABOUT_FEATURES = [
  'End-to-End Business Registration',
  'Professional IT Solutions & Web Tech',
  'Expert CA & Tax Consultancy',
  'Prime Virtual Office Address',
  'Flexible Co-working Workspaces',
  'Complete Compliance Support',
];

export const WHY_CHOOSE_FEATURES = [
  {
    title: 'All-in-One Business Ecosystem',
    description:
      'Business Registration, IT Development, GST, Virtual Office, Co-working, and CA services under one trusted roof.',
  },
  {
    title: 'Transparent & Cost Effective',
    description:
      'Get premium enterprise-grade services at clear, competitive pricing with zero hidden charges.',
  },
  {
    title: 'Dedicated Departmental Support',
    description:
      'Specialized direct email channels and experienced domain professionals for each business vertical.',
  },
];

export const CTA_FEATURES = [
  'Free 30-Min Consultation',
  'Expert Business Registration Guidance',
  'Hassle-free Onboarding & Documentation',
];

export const FOOTER_QUICK_LINKS: FooterLink[] = [
  { label: 'Home', href: '#home' },
  { label: 'About Us', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Locations', href: '#locations' },
  { label: 'Email Directory', href: '#emails' },
  { label: 'Contact Us', href: '#contact' },
];

export const FOOTER_SERVICES: FooterLink[] = [
  { label: 'Business Registration', href: '#services' },
  { label: 'IT Services', href: '#services' },
  { label: 'GST Registration', href: '#services' },
  { label: 'Virtual Office', href: '#services' },
  { label: 'Co-working Space', href: '#services' },
  { label: 'CA & Business Services', href: '#services' },
];

export const FOOTER_SUPPORT: FooterLink[] = [
  { label: 'Department Emails', href: '#emails' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Workspaces', href: '#spaces' },
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms & Conditions', href: '#' },
];

export const CONTACT_INFO = {
  phone: '+91 98000 00000',
  email: 'contact@example.com',
  address: 'Suite 400, Workspace Tower, Innovation District, Bangalore, Karnataka - 560001',
};

export const DEPARTMENT_EMAILS: DepartmentEmail[] = [
  {
    no: 1,
    email: 'info@example.com',
    purpose: 'General Enquiries / Website',
    department: 'General Enquiries',
    category: 'General',
  },
  {
    no: 2,
    email: 'operations@example.com',
    purpose: 'Operations & Client Onboarding',
    department: 'Operations & Onboarding',
    category: 'Operations',
  },
  {
    no: 3,
    email: 'renewals@example.com',
    purpose: 'Renewals & Service Continuation',
    department: 'Renewals & Client Support',
    category: 'Operations',
  },
  {
    no: 4,
    email: 'banking@example.com',
    purpose: 'Bank / Banking Related Communication',
    department: 'Banking Liaison',
    category: 'Finance',
  },
  {
    no: 5,
    email: 'accounts@example.com',
    purpose: 'Accounts, Invoices & Payments',
    department: 'Accounts & Invoicing',
    category: 'Finance',
  },
  {
    no: 6,
    email: 'management@example.com',
    purpose: 'Management / Executive Leadership',
    department: 'Management & Leadership',
    category: 'Executive',
  },
  {
    no: 7,
    email: 'consulting@example.com',
    purpose: 'CA & Tax Consultancy Services',
    department: 'CA & Tax Consultancy',
    category: 'Professional',
  },
  {
    no: 8,
    email: 'corporate@example.com',
    purpose: 'Team / Corporate Affairs',
    department: 'Corporate & Team Affairs',
    category: 'Executive',
  },
  {
    no: 9,
    email: 'support@example.com',
    purpose: 'IT Services & Technical Support',
    department: 'IT & Digital Technology',
    category: 'Technical',
  },
  {
    no: 10,
    email: 'sales@example.com',
    purpose: 'Sales, Leads & New Business',
    department: 'Sales & Business Growth',
    category: 'Sales',
  },
];

export const SERVICE_OPTIONS = [
  'Business Registration',
  'IT Services',
  'GST Registration',
  'Virtual Office',
  'Co-working Space',
  'CA & Business Services',
  'Other',
];

export const CONSULTATION_TYPES = [
  'Phone Call',
  'Video Call',
  'Office Visit',
];
