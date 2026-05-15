export type Resource = {
  title: string;
  url: string;
  free: boolean;
  type: "video" | "docs" | "practice" | "book";
};

export type Cert = {
  id: string;
  name: string;
  vendor: "CompTIA" | "Cisco" | "AWS";
  abbreviation: string;
  description: string;
  prerequisites: string[];
  topics: string[];
  resources: Resource[];
  examCode?: string;
  validityYears?: number;
  maxScore: number;
  passingScore: number;
};

const certs: Cert[] = [
  {
    id: "comptia-aplus",
    name: "CompTIA A+",
    vendor: "CompTIA",
    abbreviation: "A+",
    examCode: "Core 1 (220-1101) & Core 2 (220-1102)",
    maxScore: 900,
    passingScore: 700,
    description:
      "Foundational IT certification covering hardware, networking, operating systems, and troubleshooting.",
    prerequisites: [],
    topics: [
      "Mobile Devices",
      "Networking",
      "Hardware",
      "Virtualization & Cloud Computing",
      "Hardware & Network Troubleshooting",
      "Operating Systems",
      "Security",
      "Software Troubleshooting",
      "Operational Procedures",
    ],
    resources: [
      {
        title: "Professor Messer A+ Course",
        url: "https://www.professormesser.com/free-a-plus-training/220-1101/220-1101-video/220-1101-training-course/",
        free: true,
        type: "video",
      },
      {
        title: "CompTIA A+ Official Study Guide",
        url: "https://www.comptia.org/certifications/a",
        free: false,
        type: "book",
      },
      {
        title: "ExamCompass A+ Practice Tests",
        url: "https://www.examcompass.com/comptia/a-plus-certification/free-a-plus-practice-tests",
        free: true,
        type: "practice",
      },
    ],
  },
  {
    id: "comptia-netplus",
    name: "CompTIA Network+",
    vendor: "CompTIA",
    abbreviation: "Net+",
    examCode: "N10-009",
    maxScore: 900,
    passingScore: 720,
    description:
      "Validates networking skills including infrastructure, operations, security, and troubleshooting.",
    prerequisites: ["comptia-aplus"],
    topics: [
      "Networking Concepts",
      "Network Implementation",
      "Network Operations",
      "Network Security",
      "Network Troubleshooting",
    ],
    resources: [
      {
        title: "Professor Messer Network+ Course",
        url: "https://www.professormesser.com/network-plus/n10-009/n10-009-video/n10-009-training-course/",
        free: true,
        type: "video",
      },
      {
        title: "Professor Messer N10-009 Study Groups",
        url: "https://www.professormesser.com/network-plus/n10-009/n10-009-study-groups/",
        free: true,
        type: "video",
      },
      {
        title: "ExamCompass Network+ Practice Tests",
        url: "https://www.examcompass.com/comptia/network-plus-certification/free-network-plus-practice-tests",
        free: true,
        type: "practice",
      },
    ],
  },
  {
    id: "comptia-secplus",
    name: "CompTIA Security+",
    vendor: "CompTIA",
    abbreviation: "Sec+",
    examCode: "SY0-701",
    maxScore: 900,
    passingScore: 750,
    description:
      "Core cybersecurity certification covering threats, vulnerabilities, cryptography, and risk management.",
    prerequisites: ["comptia-netplus"],
    topics: [
      "General Security Concepts",
      "Threats, Vulnerabilities & Mitigations",
      "Security Architecture",
      "Security Operations",
      "Security Program Management & Oversight",
    ],
    resources: [
      {
        title: "Professor Messer Security+ Course",
        url: "https://www.professormesser.com/security-plus/sy0-701/sy0-701-video/sy0-701-training-course/",
        free: true,
        type: "video",
      },
      {
        title: "CompTIA Security+ Objectives (SY0-701)",
        url: "https://partners.comptia.org/docs/default-source/resources/comptia-security-sy0-701-exam-objectives-(5-0)",
        free: true,
        type: "docs",
      },
      {
        title: "Dion Training Security+ Practice Exam",
        url: "https://www.udemy.com/course/securityplus/",
        free: false,
        type: "practice",
      },
    ],
  },
  {
    id: "cisco-ccna",
    name: "Cisco CCNA",
    vendor: "Cisco",
    abbreviation: "CCNA",
    examCode: "200-301",
    maxScore: 1000,
    passingScore: 825,
    description:
      "Associate-level networking certification covering routing, switching, security fundamentals, and automation.",
    prerequisites: ["comptia-netplus"],
    topics: [
      "Network Fundamentals",
      "Network Access",
      "IP Connectivity",
      "IP Services",
      "Security Fundamentals",
      "Automation & Programmability",
    ],
    resources: [
      {
        title: "Cisco CCNA Official Cert Guide",
        url: "https://www.ciscopress.com/store/ccna-200-301-official-cert-guide-library-9780135792735",
        free: false,
        type: "book",
      },
      {
        title: "Neil Anderson CCNA Course (Udemy)",
        url: "https://www.udemy.com/course/ccna-complete/",
        free: false,
        type: "video",
      },
      {
        title: "Cisco Learning Network (free resources)",
        url: "https://learningnetwork.cisco.com/s/ccna",
        free: true,
        type: "docs",
      },
      {
        title: "Packet Tracer (free Cisco network simulator)",
        url: "https://www.netacad.com/courses/packet-tracer",
        free: true,
        type: "practice",
      },
    ],
  },
  {
    id: "aws-cloud-practitioner",
    name: "AWS Cloud Practitioner",
    vendor: "AWS",
    abbreviation: "CLF-C02",
    examCode: "CLF-C02",
    maxScore: 1000,
    passingScore: 700,
    description:
      "Entry-level AWS certification covering cloud concepts, services, security, and pricing.",
    prerequisites: [],
    topics: [
      "Cloud Concepts",
      "Security & Compliance",
      "Cloud Technology & Services",
      "Billing, Pricing & Support",
    ],
    resources: [
      {
        title: "AWS Skill Builder (official free training)",
        url: "https://explore.skillbuilder.aws/learn/course/external/view/elearning/134/aws-cloud-practitioner-essentials",
        free: true,
        type: "video",
      },
      {
        title: "AWS Cloud Practitioner Exam Guide",
        url: "https://d1.awsstatic.com/training-and-certification/docs-cloud-practitioner/AWS-Certified-Cloud-Practitioner_Exam-Guide.pdf",
        free: true,
        type: "docs",
      },
      {
        title: "Stephane Maarek CLF-C02 Course (Udemy)",
        url: "https://www.udemy.com/course/aws-certified-cloud-practitioner-new/",
        free: false,
        type: "video",
      },
    ],
  },
  {
    id: "aws-saa",
    name: "AWS Solutions Architect Associate",
    vendor: "AWS",
    abbreviation: "SAA-C03",
    examCode: "SAA-C03",
    maxScore: 1000,
    passingScore: 720,
    description:
      "Validates ability to design resilient, high-performing, and cost-optimized AWS architectures.",
    prerequisites: ["aws-cloud-practitioner"],
    topics: [
      "Design Resilient Architectures",
      "Design High-Performing Architectures",
      "Design Secure Architectures",
      "Design Cost-Optimized Architectures",
    ],
    resources: [
      {
        title: "Stephane Maarek SAA-C03 Course (Udemy)",
        url: "https://www.udemy.com/course/aws-certified-solutions-architect-associate-saa-c03/",
        free: false,
        type: "video",
      },
      {
        title: "AWS Well-Architected Framework",
        url: "https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html",
        free: true,
        type: "docs",
      },
      {
        title: "Jon Bonso Practice Exams (Udemy)",
        url: "https://www.udemy.com/course/aws-certified-solutions-architect-associate-amazon-practice-exams-saa-c03/",
        free: false,
        type: "practice",
      },
    ],
  },
];

export default certs;

export const ROADMAP_ORDER = [
  "comptia-aplus",
  "comptia-netplus",
  "comptia-secplus",
  "cisco-ccna",
  "aws-cloud-practitioner",
  "aws-saa",
];
