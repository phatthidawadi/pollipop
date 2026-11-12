import { prisma } from '../src/prisma';
import bcrypt from 'bcryptjs';

export async function seedDatabase() {
  const seedPassword = process.env.DEMO_USER_PASSWORD || 'ChangeMeInDev123!';
  const passwordHash = await bcrypt.hash(seedPassword, 10);

  const testAccounts = [
    {
      email: 'owner1@pollipop.local',
      name: 'Instructor A (Owner 1)',
      role: 'OWNER',
      department: 'CPE',
    },
    {
      email: 'owner2@pollipop.local',
      name: 'Instructor B (Owner 2)',
      role: 'OWNER',
      department: 'ENV',
    },
    {
      email: 'student1@pollipop.local',
      name: 'Student 1 (Respondent A)',
      role: 'RESPONDENT',
      department: 'CPE',
    },
    {
      email: 'student2@pollipop.local',
      name: 'Student 2 (Respondent B)',
      role: 'RESPONDENT',
      department: 'ENV',
    },
    {
      email: 'student3@pollipop.local',
      name: 'Student 3 (Respondent C)',
      role: 'RESPONDENT',
      department: 'CPE',
    },
    {
      email: 'student4@pollipop.local',
      name: 'Student 4 (Respondent D)',
      role: 'RESPONDENT',
      department: 'ME',
    },
  ];

  console.log('Starting idempotent database seeding...');

  const users: Record<string, any> = {};
  for (const account of testAccounts) {
    const user = await prisma.user.upsert({
      where: { email: account.email },
      update: {
        name: account.name,
        role: account.role,
        department: account.department,
        passwordHash,
        isActive: true,
      },
      create: {
        email: account.email,
        name: account.name,
        role: account.role,
        department: account.department,
        passwordHash,
        isActive: true,
      },
    });
    users[account.email] = user;
    console.log(`Seeded user: ${user.email} (${user.role})`);
  }

  const owner1 = users['owner1@pollipop.local'];
  const student1 = users['student1@pollipop.local'];
  const student2 = users['student2@pollipop.local'];

  if (owner1) {
    // 4 realistic university surveys matching the UI design
    const sampleSurveys = [
      {
        title: 'ความพึงพอใจต่อห้องสมุด',
        description: 'พื้นที่อ่านหนังสือที่ดี เริ่มจากความคิดเห็นของเธอ',
        mode: 'IDENTIFIED',
        status: 'PUBLISHED',
        questions: [
          {
            text: 'คุณใช้บริการห้องสมุดบ่อยเพียงใด?',
            type: 'SINGLE_CHOICE',
            required: true,
            orderIndex: 0,
            options: [
              'ทุกวัน (5-7 วันต่อสัปดาห์)',
              '2-4 วันต่อสัปดาห์',
              'สัปดาห์ละ 1 ครั้ง',
              'นานๆ ครั้ง (เฉพาะช่วงสอบ)',
              'ไม่เคยใช้บริการ',
            ],
          },
          {
            text: 'ความพึงพอใจต่อจำนวนที่นั่งอ่านหนังสือและโต๊ะทำงาน (1 = น้อยที่สุด, 5 = มากที่สุด)',
            type: 'RATING',
            required: true,
            orderIndex: 1,
            options: [],
          },
          {
            text: 'ความเงียบสงบและบรรยากาศที่เอื้อต่อการอ่านหนังสือ (1 = น้อยที่สุด, 5 = มากที่สุด)',
            type: 'RATING',
            required: true,
            orderIndex: 2,
            options: [],
          },
          {
            text: 'เวลาเปิด-ปิดห้องสมุดในปัจจุบันเหมาะสมกับการใช้งานของคุณเพียงใด?',
            type: 'SINGLE_CHOICE',
            required: true,
            orderIndex: 3,
            options: [
              'เหมาะสมมาก',
              'เหมาะสมปานกลาง',
              'อยากให้เปิดเช้าขึ้น',
              'อยากให้เปิด 24 ชั่วโมงช่วงสอบ',
              'ไม่เกี่ยวข้อง',
            ],
          },
          {
            text: 'ความสะดวกรวดเร็วในการค้นหาและบริการยืม-คืนหนังสือ (1 = น้อยที่สุด, 5 = มากที่สุด)',
            type: 'RATING',
            required: true,
            orderIndex: 4,
            options: [],
          },
          {
            text: 'คุณต้องการให้ห้องสมุดปรับปรุงหรือพัฒนาเรื่องใดมากที่สุด?',
            type: 'SINGLE_CHOICE',
            required: true,
            orderIndex: 5,
            options: [
              'เพิ่มจำนวนปลั๊กไฟและจุดชาร์จ',
              'เพิ่มห้องอ่านหนังสือกลุ่ม (Co-working)',
              'ปรับปรุงความเร็วสัญญาณ Wi-Fi',
              'เพิ่มหนังสือและวารสารใหม่',
              'ปรับปรุงระบบปรับอากาศและแสงสว่าง',
            ],
          },
        ],
        seedResponses: true,
      },
      {
        title: 'ความคิดเห็นต่อโรงอาหาร',
        description: 'มื้ออร่อยในมหาวิทยาลัย อยากให้เป็นแบบไหน?',
        mode: 'ANONYMOUS',
        status: 'PUBLISHED',
        questions: [
          {
            text: 'คุณใช้บริการโรงอาหารของมหาวิทยาลัยกี่วันต่อสัปดาห์?',
            type: 'SINGLE_CHOICE',
            required: true,
            orderIndex: 0,
            options: [
              'เกือบทุกวัน (4-5 วัน)',
              '2-3 วันต่อสัปดาห์',
              '1 วันต่อสัปดาห์',
              'นานๆ ครั้ง',
              'ไม่เคยใช้บริการ',
            ],
          },
          {
            text: 'โดยทั่วไปคุณใช้จ่ายค่าอาหารต่อมื้อเท่าไร?',
            type: 'SINGLE_CHOICE',
            required: true,
            orderIndex: 1,
            options: [
              'ต่ำกว่า 40 บาท',
              '40 - 55 บาท',
              '56 - 70 บาท',
              'มากกว่า 70 บาท',
            ],
          },
          {
            text: 'ความพึงพอใจต่อความหลากหลายของเมนูอาหาร (1 = น้อยที่สุด, 5 = มากที่สุด)',
            type: 'RATING',
            required: true,
            orderIndex: 2,
            options: [],
          },
          {
            text: 'ความพึงพอใจต่อความสะอาดของพื้นที่รับประทานอาหารและภาชนะ (1 = น้อยที่สุด, 5 = มากที่สุด)',
            type: 'RATING',
            required: true,
            orderIndex: 3,
            options: [],
          },
          {
            text: 'ความคุ้มค่าของปริมาณอาหารเมื่อเทียบกับราคา (1 = น้อยที่สุด, 5 = มากที่สุด)',
            type: 'RATING',
            required: true,
            orderIndex: 4,
            options: [],
          },
          {
            text: 'ปัญหาที่คุณพบบ่อยที่สุดในช่วงเวลาเร่งด่วน (11:30 - 13:00 น.) คืออะไร?',
            type: 'SINGLE_CHOICE',
            required: true,
            orderIndex: 5,
            options: [
              'ที่นั่งไม่เพียงพอ',
              'คิวรออาหารนานเกิน 15 นาที',
              'อากาศร้อนอบอ้าว',
              'จุดล้างมือและน้ำดื่มไม่พอ',
              'ไม่พบปัญหา',
            ],
          },
        ],
        seedResponses: true,
      },
      {
        title: 'การใช้ Wi-Fi ในมหาวิทยาลัย',
        description: 'เชื่อมต่อการเรียนรู้ให้ลื่นไหล ช่วยเล่าประสบการณ์ของเธอ',
        mode: 'IDENTIFIED',
        status: 'PUBLISHED',
        questions: [
          {
            text: 'คุณใช้งาน Wi-Fi ของมหาวิทยาลัยบ่อยเพียงใด?',
            type: 'SINGLE_CHOICE',
            required: true,
            orderIndex: 0,
            options: [
              'ตลอดเวลาที่อยู่ในมหาวิทยาลัย',
              'เฉพาะเวลาเรียนในห้องเรียน',
              'เฉพาะเมื่อทำงานกลุ่มหรืออ่านหนังสือ',
              'แทบไม่ได้ใช้ (ใช้เน็ตมือถือส่วนตัว)',
            ],
          },
          {
            text: 'คุณใช้งาน Wi-Fi ในพื้นที่ใดของมหาวิทยาลัยเป็นประจำมากที่สุด?',
            type: 'SINGLE_CHOICE',
            required: true,
            orderIndex: 1,
            options: [
              'อาคารเรียนรวมและห้องบรรยาย',
              'หอพักนักศึกษา',
              'ห้องสมุดและศูนย์การเรียนรู้',
              'โรงอาหารและลานกิจกรรม',
            ],
          },
          {
            text: 'ความเสถียรของสัญญาณ (ไม่พบปัญหาการหลุดบ่อย) (1 = หลุดบ่อยมาก, 5 = เสถียรดีมาก)',
            type: 'RATING',
            required: true,
            orderIndex: 2,
            options: [],
          },
          {
            text: 'ความเร็วในการดาวน์โหลดและอัปโหลดสำหรับการเรียน (1 = ช้ามาก, 5 = รวดเร็วมาก)',
            type: 'RATING',
            required: true,
            orderIndex: 3,
            options: [],
          },
          {
            text: 'ความสะดวกในการ Login เข้าสู่ระบบเครือข่าย',
            type: 'SINGLE_CHOICE',
            required: true,
            orderIndex: 4,
            options: [
              'สะดวกมาก (เชื่อมต่ออัตโนมัติ)',
              'พอใช้ (ต้อง Login ใหม่บางครั้ง)',
              'ยุ่งยาก (หลุดบ่อยและต้อง Login ใหม่ตลอด)',
              'ไม่เคยใช้งาน',
            ],
          },
          {
            text: 'พื้นที่ใดที่คุณต้องการให้ปรับปรุงสัญญาณด่วนที่สุด?',
            type: 'SINGLE_CHOICE',
            required: true,
            orderIndex: 5,
            options: [
              'ห้องเรียนรวมและห้องปฏิบัติการ',
              'โรงอาหารและพื้นที่นั่งพักผ่อน',
              'ลานกิจกรรมกลางแจ้ง',
              'หอพักนักศึกษา',
            ],
          },
        ],
        seedResponses: true,
      },
      {
        title: 'กิจกรรมแบบไหนที่ใช่สำหรับเธอ',
        description: 'มาช่วยออกแบบช่วงเวลาดี ๆ ในรั้วมหาวิทยาลัยด้วยกัน',
        mode: 'ANONYMOUS',
        status: 'DRAFT',
        questions: [
          {
            text: 'คุณสนใจเข้าร่วมกิจกรรมนักศึกษาประเภทใดมากที่สุด?',
            type: 'SINGLE_CHOICE',
            required: true,
            orderIndex: 0,
            options: [
              'อบรมทักษะวิชาชีพและเทคโนโลยี',
              'กีฬา นันทนาการ และ E-Sports',
              'ค่ายอาสาพัฒนาและบำเพ็ญประโยชน์',
              'เทศกาลดนตรีและศิลปวัฒนธรรม',
              'การแข่งขันนวัตกรรมและ Startup',
            ],
          },
          {
            text: 'ช่วงเวลาใดที่คุณสะดวกเข้าร่วมกิจกรรมมากที่สุด?',
            type: 'SINGLE_CHOICE',
            required: true,
            orderIndex: 1,
            options: [
              'วันธรรมดาช่วงเย็น (หลัง 16:30 น.)',
              'วันเสาร์ช่วงกลางวัน',
              'วันอาทิตย์',
              'ช่วงปิดภาคเรียน',
            ],
          },
          {
            text: 'คุณรับทราบข่าวสารกิจกรรมของมหาวิทยาลัยผ่านช่องทางใดเป็นหลัก?',
            type: 'SINGLE_CHOICE',
            required: true,
            orderIndex: 2,
            options: [
              'Facebook Page คณะ / มหาวิทยาลัย',
              'Instagram / TikTok สโมสรนักศึกษา',
              'LINE Official Account / OpenChat',
              'ป้ายประกาศในมหาวิทยาลัย',
              'เพื่อนบอกต่อ',
            ],
          },
          {
            text: 'ความน่าสนใจและความทันสมัยของกิจกรรมที่ผ่านมา (1 = น้อยที่สุด, 5 = มากที่สุด)',
            type: 'RATING',
            required: true,
            orderIndex: 3,
            options: [],
          },
          {
            text: 'ปัจจัยสำคัญที่สุดที่มีผลต่อการตัดสินใจเข้าร่วมกิจกรรมของคุณคืออะไร?',
            type: 'SINGLE_CHOICE',
            required: true,
            orderIndex: 4,
            options: [
              'ความรู้และทักษะที่นำไปใช้ได้จริง',
              'จำนวนชั่วโมงกิจกรรมสะสม (Activity Transcript)',
              'การได้พบเพื่อนใหม่',
              'ของรางวัลและของที่ระลึก',
              'ความชอบส่วนตัว',
            ],
          },
          {
            text: 'ความสะดวกในการบันทึกชั่วโมงกิจกรรม (1 = ยุ่งยาก, 5 = สะดวก รวดเร็ว)',
            type: 'RATING',
            required: true,
            orderIndex: 5,
            options: [],
          },
        ],
        seedResponses: false,
      },
    ];

    for (const surveyData of sampleSurveys) {
      let survey = await prisma.survey.findFirst({
        where: {
          ownerId: owner1.id,
          title: surveyData.title,
        },
        include: {
          questions: {
            include: { options: true },
          },
        },
      });

      if (!survey) {
        survey = await prisma.survey.create({
          data: {
            ownerId: owner1.id,
            title: surveyData.title,
            description: surveyData.description,
            mode: surveyData.mode,
            status: surveyData.status,
            publishedAt: surveyData.status === 'PUBLISHED' ? new Date() : null,
            questions: {
              create: surveyData.questions.map((q) => ({
                text: q.text,
                type: q.type,
                required: q.required,
                orderIndex: q.orderIndex,
                options: {
                  create: q.options.map((opt, optIdx) => ({
                    text: opt,
                    orderIndex: optIdx,
                  })),
                },
              })),
            },
          },
          include: {
            questions: {
              include: { options: true },
            },
          },
        });
        console.log(`Seeded university survey: ${surveyData.title} (${surveyData.status})`);
      }

      // Seed realistic responses (> 1 responses) if requested
      if (surveyData.seedResponses && survey.status === 'PUBLISHED') {
        const studentAccounts = [
          users['student1@pollipop.local'],
          users['student2@pollipop.local'],
          users['student3@pollipop.local'],
          users['student4@pollipop.local'],
        ].filter(Boolean);

        for (let rIdx = 0; rIdx < studentAccounts.length; rIdx++) {
          const respUser = studentAccounts[rIdx];
          const hasParticipated = await prisma.surveyParticipation.findUnique({
            where: {
              surveyId_userId: {
                surveyId: survey.id,
                userId: respUser.id,
              },
            },
          });

          if (!hasParticipated) {
            const respRecord = await prisma.response.create({
              data: {
                surveyId: survey.id,
                respondentId: survey.mode === 'IDENTIFIED' ? respUser.id : null,
                submittedAt: new Date(Date.now() - (rIdx + 1) * 3600000),
              },
            });

            await prisma.surveyParticipation.create({
              data: {
                surveyId: survey.id,
                userId: respUser.id,
                responseId: respRecord.id,
                submittedAt: respRecord.submittedAt,
              },
            });

            // Answer each question realistically with distributed values
            for (let qIdx = 0; qIdx < survey.questions.length; qIdx++) {
              const q = survey.questions[qIdx];
              if (q.type === 'SINGLE_CHOICE' && q.options.length > 0) {
                const optIndex = (rIdx + qIdx) % q.options.length;
                const opt = q.options[optIndex];
                await prisma.answer.create({
                  data: {
                    responseId: respRecord.id,
                    questionId: q.id,
                    optionId: opt.id,
                  },
                });
              } else if (q.type === 'RATING') {
                const ratings = [5, 4, 5, 4];
                const rating = ratings[(rIdx + qIdx) % ratings.length];
                await prisma.answer.create({
                  data: {
                    responseId: respRecord.id,
                    questionId: q.id,
                    ratingValue: rating,
                  },
                });
              }
            }
          }
        }
        console.log(`Seeded multiple responses (> 1) for: ${survey.title}`);
      }
    }
  }

  console.log('Seeding completed successfully.');
}

if (process.env.NODE_ENV !== 'test') {
  seedDatabase()
    .catch((e) => {
      console.error('Seeding failed:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
