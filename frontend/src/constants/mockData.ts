export interface Candidate {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  position_applied: string;
  experience_years: number;
  education_level?: string;
  skills?: string[];
  gender?: string;
  ethnicity?: string;
  age?: number;
  resume_score?: number;
  technical_score?: number;
  interview_score?: number;
  final_score?: number;
  hiring_decision?: string;
  bias_score?: number;
}

export const MOCK_CANDIDATES: Candidate[] = [
  {
    id: 1,
    first_name: "Sarah",
    last_name: "Johnson",
    email: "sarah.johnson@email.com",
    phone: "+1 (555) 123-4567",
    position_applied: "Software Engineer",
    experience_years: 5,
    education_level: "Bachelor's in Computer Science",
    skills: ["JavaScript", "React", "Node.js", "Python", "AWS"],
    gender: "Female",
    ethnicity: "Caucasian",
    age: 28,
    resume_score: 4.5,
    technical_score: 4.2,
    interview_score: 4.0,
    final_score: 4.2,
    hiring_decision: "hired",
    bias_score: 0.15
  },
  {
    id: 2,
    first_name: "Michael",
    last_name: "Chen",
    email: "michael.chen@email.com",
    phone: "+1 (555) 234-5678",
    position_applied: "Product Manager",
    experience_years: 7,
    education_level: "MBA in Business Administration",
    skills: ["Product Strategy", "Agile", "Analytics", "Leadership"],
    gender: "Male",
    ethnicity: "Asian",
    age: 32,
    resume_score: 4.1,
    technical_score: 3.5,
    interview_score: 3.8,
    final_score: 3.8,
    hiring_decision: "on_hold",
    bias_score: 0.23
  },
  {
    id: 3,
    first_name: "Emily",
    last_name: "Rodriguez",
    email: "emily.rodriguez@email.com",
    phone: "+1 (555) 345-6789",
    position_applied: "Data Scientist",
    experience_years: 4,
    education_level: "Master's in Data Science",
    skills: ["Python", "Machine Learning", "SQL", "TensorFlow", "R"],
    gender: "Female",
    ethnicity: "Hispanic",
    age: 26,
    resume_score: 4.8,
    technical_score: 4.7,
    interview_score: 4.2,
    final_score: 4.5,
    hiring_decision: "hired",
    bias_score: 0.12
  },
  {
    id: 4,
    first_name: "David",
    last_name: "Thompson",
    email: "david.thompson@email.com",
    phone: "+1 (555) 456-7890",
    position_applied: "UX Designer",
    experience_years: 6,
    education_level: "Bachelor's in Design",
    skills: ["Figma", "Adobe Creative Suite", "User Research", "Prototyping"],
    gender: "Male",
    ethnicity: "Caucasian",
    age: 29,
    resume_score: 3.8,
    technical_score: 2.9,
    interview_score: 2.9,
    final_score: 3.2,
    hiring_decision: "rejected",
    bias_score: 0.67
  },
  {
    id: 5,
    first_name: "Lisa",
    last_name: "Wang",
    email: "lisa.wang@email.com",
    phone: "+1 (555) 567-8901",
    position_applied: "DevOps Engineer",
    experience_years: 8,
    education_level: "Bachelor's in Computer Engineering",
    skills: ["Docker", "Kubernetes", "AWS", "CI/CD", "Linux"],
    gender: "Female",
    ethnicity: "Asian",
    age: 34,
    resume_score: 4.3,
    technical_score: 4.5,
    interview_score: 3.6,
    final_score: 4.1,
    hiring_decision: "hired",
    bias_score: 0.18
  },
  {
    id: 6,
    first_name: "James",
    last_name: "Wilson",
    email: "james.wilson@email.com",
    position_applied: "Software Engineer",
    experience_years: 3,
    education_level: "Bachelor's in Software Engineering",
    skills: ["Java", "Spring Boot", "React", "MySQL"],
    gender: "Male",
    ethnicity: "African American",
    age: 25,
    resume_score: 3.9,
    technical_score: 3.7,
    interview_score: 3.2,
    final_score: 3.6,
    hiring_decision: "on_hold",
    bias_score: 0.34
  },
  {
    id: 7,
    first_name: "Maria",
    last_name: "Garcia",
    email: "maria.garcia@email.com",
    phone: "+1 (555) 678-9012",
    position_applied: "Product Manager",
    experience_years: 5,
    education_level: "Master's in Product Management",
    skills: ["Product Vision", "Roadmapping", "Stakeholder Management", "Data Analysis"],
    gender: "Female",
    ethnicity: "Hispanic",
    age: 30,
    resume_score: 4.2,
    technical_score: 3.8,
    interview_score: 4.0,
    final_score: 4.0,
    hiring_decision: "hired",
    bias_score: 0.21
  },
  {
    id: 8,
    first_name: "Robert",
    last_name: "Kim",
    email: "robert.kim@email.com",
    phone: "+1 (555) 789-0123",
    position_applied: "Data Scientist",
    experience_years: 2,
    education_level: "Bachelor's in Statistics",
    skills: ["Python", "Statistics", "Excel", "Tableau"],
    gender: "Male",
    ethnicity: "Asian",
    age: 24,
    resume_score: 3.1,
    technical_score: 2.8,
    interview_score: 2.5,
    final_score: 2.8,
    hiring_decision: "rejected",
    bias_score: 0.45
  }
];
