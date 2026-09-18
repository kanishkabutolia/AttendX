import { Subject, SemesterData, AttendanceRecord, TeachingDay } from '../types';
import { formatDate, parseDate, generateTeachingDaysRange } from '../utils/attendanceUtils';

export interface CurriculumPreset {
  id: string;
  name: string;
  category: string;
  iconName: string;
  description: string;
  subjects: Subject[];
}

export const CURRICULA_PRESETS: CurriculumPreset[] = [
  {
    id: 'cs',
    name: 'Computer Science & IT',
    category: 'Engineering & Technology',
    iconName: 'Code',
    description: 'Data Structures, Operating Systems, DBMS, Computer Networks & Software Engineering',
    subjects: [
      {
        id: 'subj-cs-1',
        name: 'Data Structures & Algorithms',
        code: 'CS-301',
        color: 'emerald',
        targetPercentage: 100,
        credits: 4,
        scheduledDays: [1, 3, 5], // Mon, Wed, Fri
      },
      {
        id: 'subj-cs-2',
        name: 'Operating Systems',
        code: 'CS-302',
        color: 'indigo',
        targetPercentage: 100,
        credits: 4,
        scheduledDays: [2, 4], // Tue, Thu
      },
      {
        id: 'subj-cs-3',
        name: 'Database Management Systems',
        code: 'CS-303',
        color: 'blue',
        targetPercentage: 100,
        credits: 3,
        scheduledDays: [1, 2, 4], // Mon, Tue, Thu
      },
      {
        id: 'subj-cs-4',
        name: 'Computer Networks',
        code: 'CS-304',
        color: 'amber',
        targetPercentage: 100,
        credits: 3,
        scheduledDays: [3, 5], // Wed, Fri
      },
      {
        id: 'subj-cs-5',
        name: 'Software Engineering',
        code: 'CS-305',
        color: 'rose',
        targetPercentage: 100,
        credits: 4,
        scheduledDays: [1, 3, 4], // Mon, Wed, Thu
      },
    ],
  },
  {
    id: 'ee',
    name: 'Electrical & Electronics',
    category: 'Engineering & Technology',
    iconName: 'Cpu',
    description: 'Digital Electronics, Signals & Systems, Microprocessors & Control Systems',
    subjects: [
      {
        id: 'subj-ee-1',
        name: 'Digital Logic & Circuit Design',
        code: 'EE-201',
        color: 'emerald',
        targetPercentage: 100,
        credits: 4,
        scheduledDays: [1, 3, 5],
      },
      {
        id: 'subj-ee-2',
        name: 'Signals & Systems',
        code: 'EE-202',
        color: 'indigo',
        targetPercentage: 100,
        credits: 4,
        scheduledDays: [2, 4],
      },
      {
        id: 'subj-ee-3',
        name: 'Microprocessors & Microcontrollers',
        code: 'EE-203',
        color: 'blue',
        targetPercentage: 100,
        credits: 3,
        scheduledDays: [1, 2, 4],
      },
      {
        id: 'subj-ee-4',
        name: 'Control Systems Engineering',
        code: 'EE-204',
        color: 'amber',
        targetPercentage: 100,
        credits: 3,
        scheduledDays: [3, 5],
      },
      {
        id: 'subj-ee-5',
        name: 'Electromagnetic Field Theory',
        code: 'EE-205',
        color: 'purple',
        targetPercentage: 100,
        credits: 4,
        scheduledDays: [1, 4],
      },
    ],
  },
  {
    id: 'me',
    name: 'Mechanical Engineering',
    category: 'Engineering & Technology',
    iconName: 'Wrench',
    description: 'Thermodynamics, Fluid Mechanics, Strength of Materials & Machine Design',
    subjects: [
      {
        id: 'subj-me-1',
        name: 'Thermodynamics & Heat Transfer',
        code: 'ME-201',
        color: 'rose',
        targetPercentage: 100,
        credits: 4,
        scheduledDays: [1, 3, 5],
      },
      {
        id: 'subj-me-2',
        name: 'Fluid Mechanics & Machinery',
        code: 'ME-202',
        color: 'blue',
        targetPercentage: 100,
        credits: 4,
        scheduledDays: [2, 4],
      },
      {
        id: 'subj-me-3',
        name: 'Strength of Materials',
        code: 'ME-203',
        color: 'amber',
        targetPercentage: 100,
        credits: 3,
        scheduledDays: [1, 2, 4],
      },
      {
        id: 'subj-me-4',
        name: 'Manufacturing Technology',
        code: 'ME-204',
        color: 'indigo',
        targetPercentage: 100,
        credits: 3,
        scheduledDays: [3, 5],
      },
      {
        id: 'subj-me-5',
        name: 'Machine Design & Kinematics',
        code: 'ME-205',
        color: 'cyan',
        targetPercentage: 100,
        credits: 4,
        scheduledDays: [2, 5],
      },
    ],
  },
  {
    id: 'bba',
    name: 'Business Administration (BBA / MBA)',
    category: 'Business & Management',
    iconName: 'Briefcase',
    description: 'Financial Accounting, Marketing, Organizational Behavior & Microeconomics',
    subjects: [
      {
        id: 'subj-bus-1',
        name: 'Financial Accounting & Reporting',
        code: 'BUS-101',
        color: 'emerald',
        targetPercentage: 100,
        credits: 4,
        scheduledDays: [1, 3, 5],
      },
      {
        id: 'subj-bus-2',
        name: 'Principles of Marketing Management',
        code: 'BUS-102',
        color: 'rose',
        targetPercentage: 100,
        credits: 3,
        scheduledDays: [2, 4],
      },
      {
        id: 'subj-bus-3',
        name: 'Organizational Behavior & HR',
        code: 'BUS-103',
        color: 'purple',
        targetPercentage: 100,
        credits: 3,
        scheduledDays: [1, 2, 4],
      },
      {
        id: 'subj-bus-4',
        name: 'Microeconomics for Managers',
        code: 'BUS-104',
        color: 'blue',
        targetPercentage: 100,
        credits: 4,
        scheduledDays: [3, 5],
      },
      {
        id: 'subj-bus-5',
        name: 'Business Analytics & Statistics',
        code: 'BUS-105',
        color: 'amber',
        targetPercentage: 100,
        credits: 3,
        scheduledDays: [2, 5],
      },
    ],
  },
  {
    id: 'med',
    name: 'Medical & Life Sciences',
    category: 'Healthcare & Science',
    iconName: 'HeartPulse',
    description: 'Human Anatomy, Medical Physiology, Biochemistry, Pathology & Pharmacology',
    subjects: [
      {
        id: 'subj-med-1',
        name: 'Gross Human Anatomy & Histology',
        code: 'MED-101',
        color: 'rose',
        targetPercentage: 100,
        credits: 5,
        scheduledDays: [1, 2, 3, 5],
      },
      {
        id: 'subj-med-2',
        name: 'Medical Physiology & Biophysics',
        code: 'MED-102',
        color: 'blue',
        targetPercentage: 100,
        credits: 5,
        scheduledDays: [1, 3, 4],
      },
      {
        id: 'subj-med-3',
        name: 'Clinical Biochemistry & Genetics',
        code: 'MED-103',
        color: 'emerald',
        targetPercentage: 100,
        credits: 4,
        scheduledDays: [2, 4],
      },
      {
        id: 'subj-med-4',
        name: 'General Pathology & Immunology',
        code: 'MED-104',
        color: 'amber',
        targetPercentage: 100,
        credits: 4,
        scheduledDays: [1, 4, 5],
      },
      {
        id: 'subj-med-5',
        name: 'Medical Pharmacology',
        code: 'MED-105',
        color: 'purple',
        targetPercentage: 100,
        credits: 3,
        scheduledDays: [2, 5],
      },
    ],
  },
];

/**
 * Generates an active, realistic semester with dynamic dates around today,
 * complete teaching calendar, and historical attendance records up to yesterday.
 */
export function buildReadyToUseSemester(
  presetId: string = 'cs',
  baseDate: Date = new Date()
): SemesterData {
  const preset = CURRICULA_PRESETS.find((p) => p.id === presetId) || CURRICULA_PRESETS[0];
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth(); // 0-indexed

  let semesterName = 'Fall Semester';
  let startDateStr = `${year}-08-01`;
  let endDateStr = `${year}-12-20`;

  if (month >= 0 && month <= 4) {
    semesterName = 'Spring Semester';
    startDateStr = `${year}-01-10`;
    endDateStr = `${year}-05-25`;
  } else if (month >= 5 && month <= 6) {
    semesterName = 'Summer Term';
    startDateStr = `${year}-06-01`;
    endDateStr = `${year}-07-31`;
  }

  // Generate institute teaching days
  const teachingDays = generateTeachingDaysRange(startDateStr, endDateStr, [1, 2, 3, 4, 5]);

  // Insert a few realistic holidays
  const startDate = parseDate(startDateStr);
  const holiday1 = new Date(startDate);
  holiday1.setDate(holiday1.getDate() + 14); // ~2 weeks in
  const h1Key = formatDate(holiday1);
  if (teachingDays[h1Key]) {
    teachingDays[h1Key].isTeachingDay = false;
    teachingDays[h1Key].label = 'Institutional Holiday';
  }

  const holiday2 = new Date(startDate);
  holiday2.setDate(holiday2.getDate() + 35); // ~5 weeks in
  const h2Key = formatDate(holiday2);
  if (teachingDays[h2Key]) {
    teachingDays[h2Key].isTeachingDay = false;
    teachingDays[h2Key].label = 'Midterm Recess';
  }

  // Generate realistic attendance records from startDate up to yesterday
  const records: AttendanceRecord[] = [];
  const yesterday = new Date(baseDate);
  yesterday.setDate(yesterday.getDate() - 1);

  const cur = new Date(startDate);
  let dayIndex = 0;

  while (cur <= yesterday) {
    const dateStr = formatDate(cur);
    const dayOfWeek = cur.getDay();
    const isTeaching = teachingDays[dateStr]?.isTeachingDay;

    if (isTeaching) {
      preset.subjects.forEach((subj, sIdx) => {
        if (subj.scheduledDays?.includes(dayOfWeek)) {
          dayIndex++;
          let status: 'present' | 'absent' | 'cancelled' = 'present';
          let notes: string | undefined = undefined;

          // Introduce a realistic absence profile:
          // Subj 0 (DSA/Lead subject): high attendance (~95%)
          // Subj 1 (OS/Core): missed 2-3 classes (~84%) - illustrates recovery calculation!
          // Subj 2 (DBMS): ~92%
          // Subj 3 (Networks): missed 2 classes (~82%)
          // Subj 4 (Eng/Software): ~94%
          if (sIdx === 1 && (dayIndex % 7 === 2 || dayIndex % 11 === 4)) {
            status = 'absent';
            notes = 'Fell ill / Medical rest';
          } else if (sIdx === 3 && dayIndex % 9 === 3) {
            status = 'absent';
            notes = 'Missed morning transit';
          } else if (sIdx === 0 && dayIndex % 17 === 5) {
            status = 'absent';
            notes = 'Urgent personal errand';
          } else if (sIdx === 2 && dayIndex % 19 === 7) {
            status = 'cancelled';
            notes = 'Professor on academic conference';
          }

          records.push({
            id: `rec-${dateStr}-${subj.id}`,
            date: dateStr,
            subjectId: subj.id,
            status,
            notes,
            timestamp: cur.getTime(),
          });
        }
      });
    }

    cur.setDate(cur.getDate() + 1);
  }

  return {
    id: `sem-${preset.id}-1`,
    number: 1,
    name: semesterName,
    startDate: startDateStr,
    endDate: endDateStr,
    subjects: preset.subjects,
    records,
    teachingDays,
    createdAt: Date.now(),
  };
}
