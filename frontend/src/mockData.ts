import type { Assignment, User } from './types';

export const demoUsers: User[] = [
  {
    id: 1,
    fullName: 'Aida Karimova',
    email: 'admin@autocheck.dev',
    role: 'admin',
  },
  {
    id: 2,
    fullName: 'Nodir Yunusov',
    email: 'nodir@autocheck.dev',
    role: 'teacher',
  },
  {
    id: 3,
    fullName: 'Saida Ismailova',
    email: 'saida@autocheck.dev',
    role: 'teacher',
  },
  {
    id: 4,
    fullName: 'Lola Abdurakhimova',
    email: 'lola@autocheck.dev',
    role: 'student',
  },
  {
    id: 5,
    fullName: 'Temur Rakhmonov',
    email: 'temur@autocheck.dev',
    role: 'student',
  },
  {
    id: 6,
    fullName: 'Aziza Kamilova',
    email: 'aziza@autocheck.dev',
    role: 'student',
  },
];

export const demoAssignments: Assignment[] = [
  {
    id: 1,
    homeworkId: 1,
    studentId: 4,
    attemptNumber: 1,
    sourceType: 'text',
    status: 'graded',
    submittedAt: '2026-04-23T08:12:00.000Z',
    extractedText:
      "Kvadrat tenglamani yechish uchun avval koeffitsiyentlarni aniqlayman, so'ngra ko'paytuvchilarga ajratish yoki kvadrat formula usulidan foydalanaman. Masalan: x^2 + 5x + 6 = 0 tenglama (x+2)(x+3)=0 ko'rinishiga keladi.",
    originalText:
      "Kvadrat tenglamani yechish uchun avval koeffitsiyentlarni aniqlayman, so'ngra ko'paytuvchilarga ajratish yoki kvadrat formula usulidan foydalanaman. Masalan: x^2 + 5x + 6 = 0 tenglama (x+2)(x+3)=0 ko'rinishiga keladi.",
    geminiScore: 8.5,
    geminiFeedback:
      "Izoh va misol yaxshi. Har bir ko'paytuvchi nima uchun ildiz berishini ham ko'rsating.",
    finalScore: 8.5,
    finalFeedback:
      "Izoh va misol yaxshi. Har bir ko'paytuvchi nima uchun ildiz berishini ham ko'rsating.",
    teacherEdited: false,
  },
  {
    id: 2,
    homeworkId: 2,
    studentId: 5,
    attemptNumber: 1,
    sourceType: 'image',
    status: 'review_pending',
    submittedAt: '2026-04-23T10:24:00.000Z',
    extractedText:
      "Birinchi ifodani (x + 4)(x - 2), ikkinchisini esa (y + 1)(y + 5) ko'rinishida ajratdim, lekin o'rta had qanday bo'linganini yanada aniqroq asoslashim kerak.",
    fileName: 'factorization-notes.png',
    geminiScore: 7,
    geminiFeedback:
      "Fikr yuritish qisman to'g'ri. Har bir misolda o'rta had qanday ajratilganini aniqroq tushuntiring.",
    teacherEdited: false,
  },
  {
    id: 3,
    homeworkId: 3,
    studentId: 4,
    attemptNumber: 1,
    sourceType: 'txt_file',
    status: 'processing',
    submittedAt: '2026-04-23T11:42:00.000Z',
    extractedText:
      "Maktab formasi majburiy bo'lmasligi kerak, chunki o'quvchilar o'zini erkin his qilganda yaxshiroq o'rganadi.",
    fileName: 'argument-draft.txt',
    teacherEdited: false,
  },
  {
    id: 4,
    homeworkId: 4,
    studentId: 6,
    attemptNumber: 1,
    sourceType: 'text',
    status: 'graded',
    submittedAt: '2026-04-22T09:10:00.000Z',
    extractedText:
      "Bu voqea iqtisodiy bosim va siyosiy ishonchsizlikdan kelib chiqqan, keyinchalik esa mintaqaviy ittifoqlar qanday shakllanishiga ta'sir ko'rsatgan.",
    originalText:
      "Bu voqea iqtisodiy bosim va siyosiy ishonchsizlikdan kelib chiqqan, keyinchalik esa mintaqaviy ittifoqlar qanday shakllanishiga ta'sir ko'rsatgan.",
    geminiScore: 9,
    geminiFeedback:
      "Xulosa aniq va tuzilishi yaxshi. Dalilni kuchaytirish uchun bitta aniq misol qo'shing.",
    finalScore: 9,
    finalFeedback:
      "Xulosa aniq va tuzilishi yaxshi. Dalilni kuchaytirish uchun bitta aniq misol qo'shing.",
    teacherEdited: false,
  },
];
